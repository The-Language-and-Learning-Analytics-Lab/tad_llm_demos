import { pipeline } from "@huggingface/transformers";
import { analogyVector, topK } from "./analogy.js";

// ── Singleton model ────────────────────────────────────────────────────────────

let extractor = null;
let backend = "wasm";

async function loadModel(progressCallback) {
  if (extractor) return;

  // Try WebGPU first; fall back to WASM on any error
  let webgpuOk = false;
  try {
    if (typeof navigator !== "undefined" && navigator.gpu) {
      const adapter = await navigator.gpu.requestAdapter();
      webgpuOk = !!adapter;
    }
  } catch (_) {}

  if (webgpuOk) {
    try {
      extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
        { device: "webgpu", progress_callback: progressCallback }
      );
      backend = "webgpu";
      return;
    } catch (_) {
      // fall through to WASM
    }
  }

  extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
    { progress_callback: progressCallback }
  );
  backend = "wasm";
}

// ── Embedding cache ────────────────────────────────────────────────────────────

/** Map<normalizedWord, Float32Array> — cached L2-normalized embeddings */
const embeddingCache = new Map();

/** Words that make up the "official" vocab pool (embedded during embed_vocab) */
let vocabPool = null;

async function embedWord(word) {
  const key = word.trim().toLowerCase();
  if (embeddingCache.has(key)) return embeddingCache.get(key);

  const output = await extractor(key, { pooling: "mean", normalize: true });
  // Copy out of tensor so it survives GC
  const vec = output.data.slice();

  embeddingCache.set(key, vec);
  return vec;
}

// ── Message handler ────────────────────────────────────────────────────────────

self.addEventListener("message", async (event) => {
  const { type } = event.data;

  // ── init: load model ──────────────────────────────────────────────────────
  if (type === "init") {
    try {
      await loadModel((x) => {
        self.postMessage({ type: "progress", ...x });
      });
      self.postMessage({ type: "ready", backend });
    } catch (err) {
      self.postMessage({ type: "error", message: err.message });
    }
    return;
  }

  // ── embed_vocab: embed the default candidate pool ─────────────────────────
  if (type === "embed_vocab") {
    const { words } = event.data;
    vocabPool = words.map(w => w.trim().toLowerCase()).filter(Boolean);
    const total = vocabPool.length;
    let done = 0;

    for (const word of vocabPool) {
      try {
        await embedWord(word);
      } catch (_) {
        // Skip words the model can't process (shouldn't happen with MiniLM)
      }
      done++;
      if (done % 50 === 0 || done === total) {
        self.postMessage({ type: "vocab_progress", done, total });
      }
    }

    self.postMessage({ type: "vocab_ready", count: done });
    return;
  }

  // ── analogy: compute top-k analogies ─────────────────────────────────────
  if (type === "analogy") {
    const { a, b, c, topK: k = 5, customWords } = event.data;

    try {
      const [vecA, vecB, vecC] = await Promise.all([
        embedWord(a),
        embedWord(b),
        embedWord(c),
      ]);

      // target = normalize(a − b + c)  (matches display formula A − B + C = ?)
      const target = analogyVector(vecB, vecA, vecC);

      // Determine candidate pool
      let pool;
      if (customWords && customWords.length > 0) {
        const normalized = customWords.map(w => w.trim().toLowerCase()).filter(Boolean);
        for (const word of normalized) {
          await embedWord(word);
        }
        pool = normalized;
      } else {
        pool = vocabPool || Array.from(embeddingCache.keys());
      }

      // Build a Map from pool words to their vectors (only cached ones)
      const poolMap = new Map();
      for (const word of pool) {
        const vec = embeddingCache.get(word);
        if (vec) poolMap.set(word, vec);
      }

      // Exclude query terms from results
      const exclude = new Set([a, b, c]);
      const matches = topK(target, poolMap, k, exclude);

      self.postMessage({ type: "result", matches });
    } catch (err) {
      self.postMessage({ type: "error", message: err.message });
    }
    return;
  }
});
