import { AutoTokenizer, AutoModelForCausalLM } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/Qwen2.5-0.5B-Instruct";
let tokenizer = null;
let model = null;

function softmax(logits) {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) {
    if (logits[i] > max) max = logits[i];
  }
  let sum = 0;
  const exps = new Float32Array(logits.length);
  for (let i = 0; i < logits.length; i++) {
    exps[i] = Math.exp(logits[i] - max);
    sum += exps[i];
  }
  for (let i = 0; i < exps.length; i++) {
    exps[i] /= sum;
  }
  return exps;
}

async function load(progress_callback) {
  tokenizer ??= await AutoTokenizer.from_pretrained(MODEL_ID, { progress_callback });
  model ??= await AutoModelForCausalLM.from_pretrained(MODEL_ID, {
    dtype: "q4",
    progress_callback,
  });
}

self.addEventListener("message", async (e) => {
  const { type, prompt, topK = 32 } = e.data;
  if (type !== "sample") return;

  try {
    await load((x) => self.postMessage({ status: "progress", ...x }));
    self.postMessage({ status: "ready" });

    const inputs = tokenizer(prompt);
    const { logits } = await model(inputs);

    // logits: Tensor shape [1, seq_len, vocab_size]
    const seqLen = logits.dims[1];
    const vocabSize = logits.dims[2];
    const lastLogits = Array.from(
      logits.data.slice((seqLen - 1) * vocabSize, seqLen * vocabSize)
    );

    const probs = softmax(lastLogits);

    // Find top-k without sorting the full 152k-entry vocab
    const topKItems = [];
    for (let i = 0; i < probs.length; i++) {
      const p = probs[i];
      if (topKItems.length < topK || p > topKItems[topKItems.length - 1].prob) {
        topKItems.push({ id: i, prob: p });
        topKItems.sort((a, b) => b.prob - a.prob);
        if (topKItems.length > topK) topKItems.pop();
      }
    }

    const tokens = topKItems.map(({ id, prob }) => ({
      token: tokenizer.decode([id], { skip_special_tokens: false }),
      prob,
    }));

    self.postMessage({ status: "complete", tokens });
  } catch (err) {
    self.postMessage({ status: "error", message: err.message });
  }
});
