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

self.addEventListener("message", async (e) => {
  const { type, prompt, topK = 32 } = e.data;
  if (type !== "distribution") return;

  try {
    await load((x) => self.postMessage({ status: "progress", ...x }));
    self.postMessage({ status: "ready" });

    const inputs = tokenizer(prompt);
    const { logits } = await model(inputs);

    // logits: Tensor shape [1, seq_len, vocab_size]
    const seqLen = logits.dims[1];
    const vocabSize = logits.dims[2];
    const rawLogits = Array.from(
      logits.data.slice((seqLen - 1) * vocabSize, seqLen * vocabSize)
    );

    // Find top-k by raw logit value (no temperature, no softmax)
    const topKItems = [];
    for (let i = 0; i < rawLogits.length; i++) {
      const v = rawLogits[i];
      if (topKItems.length < topK || v > topKItems[topKItems.length - 1].logit) {
        topKItems.push({ id: i, logit: v });
        topKItems.sort((a, b) => b.logit - a.logit);
        if (topKItems.length > topK) topKItems.pop();
      }
    }

    const tokens = topKItems.map(({ id, logit }) => ({
      token: tokenizer.decode([id], { skip_special_tokens: false }),
      logit,
    }));

    self.postMessage({ status: "complete", tokens });
  } catch (err) {
    self.postMessage({ status: "error", message: err.message });
  }
});
