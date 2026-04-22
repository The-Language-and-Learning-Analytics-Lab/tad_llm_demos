"""
prepare_irony_data.py
=====================
One-time offline script — run on Tristan's laptop, commit the output.
Students never run this.

Usage
-----
    pip install datasets transformers torch scipy
    python scripts/prepare_irony_data.py

Output
------
    src/data/ironyDataset.js   (ES module, imported by IronyAssignmentDemo.jsx)

Configuration
-------------
Edit SEED, N_IRONY, N_NON_IRONY, MIN_LEN, MAX_LEN below and re-run if
the selection contains anything that's off-color or inappropriate for class.
"""

import json
import random
import re
import textwrap
from datetime import datetime, timezone

# ── Config ────────────────────────────────────────────────────────────────────
SEED = 42
N_IRONY = 8
N_NON_IRONY = 12
MIN_LEN = 30   # characters
MAX_LEN = 280  # characters
OUTPUT_PATH = "src/data/ironyDataset.js"
CLASSIFIER_MODEL = "cardiffnlp/twitter-roberta-base-irony"
DATASET_NAME = "cardiffnlp/tweet_eval"
DATASET_CONFIG = "irony"
DATASET_SPLIT = "test"

# ── CardiffNLP preprocessing ──────────────────────────────────────────────────
def preprocess_tweet(text):
    """Replace @handles → @user and http… → http (CardiffNLP convention)."""
    text = re.sub(r'@\w+', '@user', text)
    text = re.sub(r'https?://\S+', 'http', text)
    return text

# ── Load dataset ──────────────────────────────────────────────────────────────
print("Loading dataset …")
from datasets import load_dataset

ds = load_dataset(DATASET_NAME, DATASET_CONFIG, split=DATASET_SPLIT)
# Labels: 0 = non_irony, 1 = irony
print(f"  Total test examples: {len(ds)}")

label_map = {0: "non_irony", 1: "irony"}

# Filter by length on raw text (display what students see)
filtered = [
    {"text": ex["text"], "ground_truth": label_map[ex["label"]]}
    for ex in ds
    if MIN_LEN <= len(ex["text"].strip()) <= MAX_LEN
]
print(f"  After length filter ({MIN_LEN}–{MAX_LEN} chars): {len(filtered)}")

irony_pool     = [x for x in filtered if x["ground_truth"] == "irony"]
non_irony_pool = [x for x in filtered if x["ground_truth"] == "non_irony"]
print(f"  Irony pool: {len(irony_pool)}, Non-irony pool: {len(non_irony_pool)}")

# ── Sample ────────────────────────────────────────────────────────────────────
random.seed(SEED)
selected_irony     = random.sample(irony_pool, N_IRONY)
selected_non_irony = random.sample(non_irony_pool, N_NON_IRONY)
combined = selected_irony + selected_non_irony
random.shuffle(combined)   # interleave so irony isn't all grouped

print(f"\nSelected {len(combined)} tweets ({N_IRONY} irony + {N_NON_IRONY} non-irony)")
print(f"Mean length: {sum(len(x['text']) for x in combined) / len(combined):.0f} chars")

print("\n── Selected tweets ──────────────────────────────────────────────────────")
for i, item in enumerate(combined):
    label = item["ground_truth"]
    print(f"  [{i:2d}] [{label:>10}] {textwrap.shorten(item['text'], 80)}")

# ── Run RoBERTa classifier ────────────────────────────────────────────────────
print(f"\nLoading classifier: {CLASSIFIER_MODEL} …")
from transformers import pipeline as hf_pipeline
import torch

classifier = hf_pipeline(
    "text-classification",
    model=CLASSIFIER_MODEL,
    tokenizer=CLASSIFIER_MODEL,
    device=0 if torch.cuda.is_available() else -1,
    top_k=None,   # return all scores
)

print("Running classifier on selected tweets …")
results = []
for i, item in enumerate(combined):
    preprocessed = preprocess_tweet(item["text"])
    preds = classifier(preprocessed, truncation=True, max_length=128)[0]
    # preds is a list of {"label": "...", "score": float}
    score_map = {p["label"].lower(): round(p["score"], 4) for p in preds}
    # Normalize label names — model may use "LABEL_0"/"LABEL_1" or "non_irony"/"irony"
    # CardiffNLP models use id2label: {0: "non_irony", 1: "irony"}
    non_irony_score = score_map.get("non_irony", score_map.get("label_0", 0.0))
    irony_score     = score_map.get("irony",     score_map.get("label_1", 0.0))
    # Pick predicted label
    predicted = "irony" if irony_score > non_irony_score else "non_irony"
    confidence = round(max(irony_score, non_irony_score), 4)
    results.append({
        "id": i,
        "text": item["text"],
        "ground_truth": item["ground_truth"],
        "roberta_label": predicted,
        "roberta_confidence": confidence,
        "roberta_probs": {"non_irony": round(non_irony_score, 4), "irony": round(irony_score, 4)},
    })
    status = "✓" if predicted == item["ground_truth"] else "✗"
    print(f"  [{i:2d}] {status}  truth={item['ground_truth']:>10}  pred={predicted:>10}  conf={confidence:.4f}")

# ── Sanity check statistics ────────────────────────────────────────────────────
n_correct = sum(1 for r in results if r["roberta_label"] == r["ground_truth"])
accuracy  = n_correct / len(results)
print(f"\nRoBERTa accuracy on selected sample: {n_correct}/{len(results)} = {accuracy:.2%}")
if accuracy < 0.60:
    print("  WARNING: accuracy below 0.60 — consider changing SEED")

truth_counts = {
    "irony":     sum(1 for r in results if r["ground_truth"] == "irony"),
    "non_irony": sum(1 for r in results if r["ground_truth"] == "non_irony"),
}
print(f"Ground truth distribution: {truth_counts}")

# ── Write output ──────────────────────────────────────────────────────────────
timestamp = datetime.now(timezone.utc).isoformat(timespec="seconds")

lines = [
    "// Auto-generated by scripts/prepare_irony_data.py — DO NOT EDIT BY HAND.",
    f"// Source: {DATASET_NAME} ({DATASET_CONFIG} config, {DATASET_SPLIT} split)",
    f"// RoBERTa model: {CLASSIFIER_MODEL}",
    f"// Generated: {timestamp}",
    f"// Seed: {SEED}",
    "",
    "export const IRONY_DATASET = [",
]

for r in results:
    text_escaped = r["text"].replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    lines.append("  {")
    lines.append(f"    id: {r['id']},")
    lines.append(f"    text: `{text_escaped}`,")
    lines.append(f"    ground_truth: \"{r['ground_truth']}\",")
    lines.append(f"    roberta_label: \"{r['roberta_label']}\",")
    lines.append(f"    roberta_confidence: {r['roberta_confidence']},")
    lines.append(f"    roberta_probs: {{ non_irony: {r['roberta_probs']['non_irony']}, irony: {r['roberta_probs']['irony']} }},")
    lines.append("  },")

lines.append("];")
lines.append("")
lines.append(f"export const CLASS_BALANCE = {{ irony: {truth_counts['irony']}, non_irony: {truth_counts['non_irony']} }};")
lines.append("")

output = "\n".join(lines)

import os
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    f.write(output)

print(f"\nWrote {OUTPUT_PATH}  ({len(results)} entries)")
print("Done. Review the tweet list above before class — re-run with a different SEED if anything looks inappropriate.")
