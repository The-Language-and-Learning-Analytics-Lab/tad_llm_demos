import { AutoTokenizer } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/Qwen2.5-0.5B-Instruct";
let tokenizer = null;

async function load(progress_callback) {
  tokenizer ??= await AutoTokenizer.from_pretrained(MODEL_ID, { progress_callback });
}

self.addEventListener("message", async (e) => {
  const { type, text } = e.data;
  if (type !== "tokenize") return;

  try {
    await load((x) => self.postMessage({ status: "progress", ...x }));
    self.postMessage({ status: "ready" });

    const encoded = tokenizer(text);
    const ids = Array.from(encoded.input_ids.data).map(Number);
    const tokens = ids.map((id) => ({
      id,
      text: tokenizer.decode([id], { skip_special_tokens: false }),
    }));

    self.postMessage({ status: "complete", tokens });
  } catch (err) {
    self.postMessage({ status: "error", message: err.message });
  }
});
