/**
 * Pure vector math for word analogy computation.
 * All functions work with Float32Array or regular arrays.
 * Assumes vectors are already L2-normalized unless otherwise noted.
 */

/** Dot product of two equal-length vectors. */
export function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

/** L2 norm of a vector. */
export function norm(v) {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  return Math.sqrt(s);
}

/**
 * Return a new Float32Array that is the L2-normalized version of v.
 * If v is the zero vector, returns a zero vector (no divide-by-zero).
 */
export function normalize(v) {
  const n = norm(v);
  const out = new Float32Array(v.length);
  if (n === 0) return out;
  for (let i = 0; i < v.length; i++) out[i] = v[i] / n;
  return out;
}

/**
 * Cosine similarity between two vectors.
 * For already-normalized vectors this is just the dot product.
 */
export function cosineSim(a, b) {
  return dot(a, b);
}

/**
 * Compute the analogy target vector: normalize(b − a + c).
 * Given L2-normalized inputs a, b, c, this encodes:
 *   "a is to b as c is to ?"
 *
 * @param {Float32Array} a
 * @param {Float32Array} b
 * @param {Float32Array} c
 * @returns {Float32Array} normalized target vector
 */
export function analogyVector(a, b, c) {
  const len = a.length;
  const target = new Float32Array(len);
  for (let i = 0; i < len; i++) target[i] = b[i] - a[i] + c[i];
  return normalize(target);
}

/**
 * Find the top-k candidates most similar to the target vector.
 *
 * @param {Float32Array} target - normalized query vector
 * @param {Map<string, Float32Array>} embeddings - word → normalized vector
 * @param {number} k - number of results to return
 * @param {Set<string>} [exclude] - words to exclude from results
 * @returns {{ word: string, score: number }[]} sorted descending by score
 */
export function topK(target, embeddings, k, exclude = new Set()) {
  const results = [];
  for (const [word, vec] of embeddings) {
    if (exclude.has(word)) continue;
    results.push({ word, score: dot(target, vec) });
  }
  results.sort((x, y) => y.score - x.score);
  return results.slice(0, k);
}
