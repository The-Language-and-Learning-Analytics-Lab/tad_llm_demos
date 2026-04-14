import { pipeline } from "@huggingface/transformers";

class EmbeddingPipeline {
  static task = "feature-extraction";
  static model = "Xenova/all-MiniLM-L6-v2";
  static instance = null;

  static async getInstance(progress_callback = null) {
    this.instance ??= pipeline(this.task, this.model, { progress_callback });
    return this.instance;
  }
}

self.addEventListener("message", async (event) => {
  const { type, sentences } = event.data;
  if (type !== "encode") return;

  const extractor = await EmbeddingPipeline.getInstance((x) => {
    self.postMessage({ status: "progress", ...x });
  });

  self.postMessage({ status: "ready" });

  try {
    const results = [];
    for (const text of sentences) {
      const output = await extractor(text, { pooling: "mean", normalize: true });
      results.push(Array.from(output.data));
    }
    self.postMessage({ status: "complete", embeddings: results, sentences });
  } catch (err) {
    self.postMessage({ status: "error", message: err.message });
  }
});
