import { AutoTokenizer, AutoModelForCausalLM } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/Qwen2.5-0.5B-Instruct";
let tokenizer = null;
let model = null;

async function load(progress_callback) {
  tokenizer ??= await AutoTokenizer.from_pretrained(MODEL_ID, { progress_callback });
  model ??= await AutoModelForCausalLM.from_pretrained(MODEL_ID, {
    dtype: "q4",
    progress_callback,
  });
}

/**
 * Parse the LLM's raw text output into a canonical label.
 * Match "non_irony" variants BEFORE "irony" because "irony" is a substring.
 */
function parseLabel(raw) {
  const s = raw.toLowerCase();
  if (/\bnon[_\s-]?irony\b/.test(s) || /\bnot\s+iron(y|ic)\b/.test(s)) return "non_irony";
  if (/\bironic\b/.test(s) || /\birony\b/.test(s)) return "irony";
  return "unparseable";
}

/**
 * Greedy decode up to maxNewTokens from the current model state.
 * Falls back to manual argmax loop if model.generate() is unavailable.
 */
async function greedyDecode(inputs, maxNewTokens) {
  // Try model.generate() first (Transformers.js v3 supports it on CausalLM)
  try {
    const output = await model.generate(inputs, {
      max_new_tokens: maxNewTokens,
      do_sample: false,
    });
    const promptLen = inputs.input_ids.dims[1];
    // output is a 2D tensor [1, total_len]; slice off the prompt tokens.
    // data may be BigInt64Array (int64) — convert each element to Number for decode().
    const newTokenIds = [];
    for (let i = promptLen; i < output.dims[1]; i++) {
      newTokenIds.push(Number(output.data[i]));
    }
    return tokenizer.decode(newTokenIds, { skip_special_tokens: true });
  } catch (_) {
    // Fallback: manual greedy loop using one-step forward passes
    return await greedyDecodeManual(inputs, maxNewTokens);
  }
}

async function greedyDecodeManual(inputs, maxNewTokens) {
  const { Tensor } = await import("@huggingface/transformers");
  // Convert input IDs to plain Numbers (data may be BigInt64Array)
  let inputIds = Array.from(inputs.input_ids.data, (v) => Number(v));
  const generated = [];
  const eosId = tokenizer.eos_token_id;

  for (let step = 0; step < maxNewTokens; step++) {
    const seqLen = inputIds.length;
    // Build int64 tensors using BigInt arrays, as ONNX Runtime expects
    const currentInputs = {
      input_ids: new Tensor("int64", BigInt64Array.from(inputIds, BigInt), [1, seqLen]),
      attention_mask: new Tensor("int64", new BigInt64Array(seqLen).fill(1n), [1, seqLen]),
    };
    const { logits } = await model(currentInputs);
    const vocabSize = logits.dims[2];
    // Argmax over last token's logit slice
    let bestId = 0;
    let bestLogit = -Infinity;
    const offset = (seqLen - 1) * vocabSize;
    for (let v = 0; v < vocabSize; v++) {
      if (logits.data[offset + v] > bestLogit) {
        bestLogit = logits.data[offset + v];
        bestId = v;
      }
    }
    generated.push(bestId);
    inputIds.push(bestId);
    if (bestId === eosId) break;
  }

  return tokenizer.decode(generated, { skip_special_tokens: true });
}

self.addEventListener("message", async (e) => {
  if (e.data.type !== "classify_batch") return;
  const { tweets, promptTemplate } = e.data;

  try {
    await load((x) => self.postMessage({ status: "progress", ...x }));
    self.postMessage({ status: "ready" });

    const results = [];
    for (let i = 0; i < tweets.length; i++) {
      const filledPrompt = promptTemplate.replace("{TWEET}", tweets[i]);

      // Build a chat-template prompt so Qwen2.5-Instruct processes it correctly
      const messages = [
        { role: "user", content: filledPrompt },
      ];
      const chatPrompt = tokenizer.apply_chat_template(messages, {
        tokenize: false,
        add_generation_prompt: true,
      });

      const inputs = tokenizer(chatPrompt);
      const rawText = await greedyDecode(inputs, 12);

      const label = parseLabel(rawText);
      results.push({ index: i, raw: rawText, label });
      self.postMessage({ status: "item_done", index: i, total: tweets.length, label, raw: rawText });
    }

    self.postMessage({ status: "complete", results });
  } catch (err) {
    self.postMessage({ status: "error", message: err.message });
  }
});
