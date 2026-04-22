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
 * Greedy decode up to maxNewTokens from the given tokenizer inputs.
 * Uses model.generate() with the Transformers.js v3 single-object API.
 */
async function greedyDecode(inputs, maxNewTokens) {
  // Transformers.js v3: generate() takes a single destructured options object.
  // Spread the tokenizer output (input_ids, attention_mask) alongside gen params.
  const output = await model.generate({
    ...inputs,
    max_new_tokens: maxNewTokens,
    do_sample: false,
  });
  // output is a 2D int64 tensor [1, total_len] containing prompt + generated tokens.
  const promptLen = inputs.input_ids.dims[1];
  const newTokenIds = [];
  for (let i = promptLen; i < output.dims[1]; i++) {
    newTokenIds.push(Number(output.data[i]));
  }
  return tokenizer.decode(newTokenIds, { skip_special_tokens: true });
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
