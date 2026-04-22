/**
 * Pure statistics helpers for the Irony Assignment demo.
 *
 * All functions accept arrays of strings: "irony", "non_irony", or "unparseable".
 * "unparseable" entries are excluded from pairwise comparisons (noted in each fn).
 */

/**
 * Count occurrences of each label class.
 * @param {string[]} labels
 * @returns {{ irony: number, non_irony: number, unparseable: number, total: number }}
 */
export function labelCounts(labels) {
  const counts = { irony: 0, non_irony: 0, unparseable: 0, total: labels.length };
  for (const l of labels) {
    if (l === "irony") counts.irony++;
    else if (l === "non_irony") counts.non_irony++;
    else counts.unparseable++;
  }
  return counts;
}

/**
 * Accuracy of `predicted` against `truth`, excluding unparseable predictions.
 * @param {string[]} predicted
 * @param {string[]} truth
 * @returns {{ acc: number, n_compared: number }}
 */
export function accuracy(predicted, truth) {
  let correct = 0, n = 0;
  for (let i = 0; i < predicted.length; i++) {
    if (predicted[i] === "unparseable") continue;
    n++;
    if (predicted[i] === truth[i]) correct++;
  }
  return { acc: n > 0 ? correct / n : 0, n_compared: n };
}

/**
 * Raw percent agreement between two raters, excluding indices where either is unparseable.
 * @param {string[]} a
 * @param {string[]} b
 * @returns {number} proportion in [0,1], or NaN if no valid pairs
 */
export function rawAgreement(a, b) {
  let agree = 0, n = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "unparseable" || b[i] === "unparseable") continue;
    n++;
    if (a[i] === b[i]) agree++;
  }
  return n > 0 ? agree / n : NaN;
}

/**
 * Cohen's κ for two raters over a 2-category scheme {irony, non_irony}.
 * Pairs where either rater is "unparseable" are excluded.
 *
 * κ = (p_o − p_e) / (1 − p_e)
 *   p_o = observed agreement
 *   p_e = expected agreement by chance
 *
 * @param {string[]} a
 * @param {string[]} b
 * @returns {{ kappa: number, po: number, pe: number, n: number }}
 */
export function cohensKappa(a, b) {
  // Collect valid pairs
  let n = 0;
  let both_irony = 0, both_non = 0;
  let a_irony = 0, b_irony = 0;

  for (let i = 0; i < a.length; i++) {
    if (a[i] === "unparseable" || b[i] === "unparseable") continue;
    n++;
    if (a[i] === "irony") a_irony++;
    if (b[i] === "irony") b_irony++;
    if (a[i] === "irony"     && b[i] === "irony")     both_irony++;
    if (a[i] === "non_irony" && b[i] === "non_irony") both_non++;
  }

  if (n === 0) return { kappa: NaN, po: NaN, pe: NaN, n: 0 };

  const po = (both_irony + both_non) / n;

  // Marginal rates
  const p_a_irony = a_irony / n;
  const p_b_irony = b_irony / n;
  const p_a_non   = 1 - p_a_irony;
  const p_b_non   = 1 - p_b_irony;

  const pe = p_a_irony * p_b_irony + p_a_non * p_b_non;

  if (Math.abs(1 - pe) < 1e-10) {
    // Degenerate case: both raters always pick same label
    return { kappa: NaN, po, pe, n };
  }

  const kappa = (po - pe) / (1 - pe);
  return { kappa, po, pe, n };
}

/**
 * Confusion matrix treating "irony" as the positive class.
 * Unparseable predictions are excluded.
 * @param {string[]} predicted
 * @param {string[]} truth
 * @returns {{ tp: number, fp: number, tn: number, fn: number }}
 */
export function confusionMatrix(predicted, truth) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (let i = 0; i < predicted.length; i++) {
    if (predicted[i] === "unparseable") continue;
    const p = predicted[i] === "irony";
    const t = truth[i]     === "irony";
    if (p && t)  tp++;
    else if (p)  fp++;
    else if (t)  fn++;
    else         tn++;
  }
  return { tp, fp, tn, fn };
}

/**
 * Interpret a κ value using Landis & Koch (1977) thresholds.
 * @param {number} k
 * @returns {{ label: string, color: string }}
 */
export function kappaInterpretation(k) {
  if (isNaN(k))  return { label: "N/A",            color: "rgba(0,0,0,0.05)" };
  if (k < 0)     return { label: "Poor (<0)",       color: "rgba(216,90,48,0.15)" };
  if (k < 0.2)   return { label: "Slight",          color: "rgba(255,195,0,0.18)" };
  if (k < 0.4)   return { label: "Fair",            color: "rgba(255,160,0,0.2)" };
  if (k < 0.6)   return { label: "Moderate",        color: "rgba(100,190,100,0.22)" };
  if (k < 0.8)   return { label: "Substantial",     color: "rgba(50,160,80,0.28)" };
  return           { label: "Almost perfect",        color: "rgba(29,158,117,0.32)" };
}
