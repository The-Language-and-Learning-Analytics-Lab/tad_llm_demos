# TAD LLM Demos

A collection of interactive, browser-based demos for teaching how large language models work. All model inference runs locally in the browser via Web Workers — no server, no API keys.

**Live site:** https://the-language-and-learning-analytics-lab.github.io/tad_llm_demos/

---

## Demos

### Tokenizer
Paste any text and see how the Qwen2.5-0.5B tokenizer splits it into subword tokens. Each token is shown as a color-coded chip with its string form and integer ID, making it easy to see how common words become single tokens while rare or long words are broken into pieces.

### Sentence Embeddings
Encode two sentences as 384-dimensional vectors using all-MiniLM-L6-v2 and visualize their semantic similarity. A bar chart shows the first 64 dimensions of each embedding; a similarity meter displays the cosine similarity on a −1 to +1 scale. Preset sentence pairs cover paraphrases, same-topic/different-meaning, and unrelated cases.

### Word Analogies
Explore embedding arithmetic: enter three words A, B, C and find the word whose embedding is closest to A − B + C. Twenty preset analogies span capitals, currencies, languages, gender, comparatives, and more. Uses WebGPU when available and falls back to WASM.

### Token Sampling
Step through autoregressive generation one token at a time. Fetch the next-token distribution from Qwen2.5-0.5B, explore how temperature reshapes it, draw a nucleus (top-p) boundary, and sample. Each round of *Next token distribution → Sample → Next token distribution* advances the generated sequence by exactly one token. Multiple clicks on Sample replace the current candidate; only clicking *Next token distribution* again commits it.

### Assignment: Irony Detection
A structured four-stage classroom assignment built around a 20-tweet subset of the CardiffNLP TweetEval irony dataset.

1. **Label** — students label all 20 tweets before seeing any model output
2. **Prompt** — students write (or customize) a prompt template for Qwen2.5-0.5B to classify each tweet
3. **Run** — the LLM classifies all 20 tweets in the browser
4. **Compare** — a results table and descriptive statistics show accuracy and pairwise Cohen's κ for the student, LLM, a pre-trained RoBERTa baseline, and ground truth; confusion matrices are included; students write a short reflection

Results can be printed to PDF for submission.

---

## Tech stack

| Layer | Library |
|---|---|
| UI | [React 18](https://react.dev/) |
| Build | [Vite 5](https://vite.dev/) |
| In-browser ML | [@huggingface/transformers v3](https://huggingface.co/docs/transformers.js) |
| Inference backend | ONNX Runtime (WASM) · WebGPU (where available) |

**Models used**

| Model | Size | Used by |
|---|---|---|
| `onnx-community/Qwen2.5-0.5B-Instruct` (q4) | ~250 MB | Tokenizer, Token Sampling, Irony Assignment |
| `Xenova/all-MiniLM-L6-v2` | ~25 MB | Sentence Embeddings, Word Analogies |

Models are downloaded from Hugging Face on first use and cached by the browser.

---

## Project structure

```
tad_llm_demos/
├── src/
│   ├── App.jsx                   # Tab router and top-level layout
│   ├── App.css                   # All styles (dark mode via prefers-color-scheme)
│   ├── main.jsx                  # React entry point
│   │
│   ├── TokenizerDemo.jsx         # Tokenizer demo
│   ├── EmbeddingDemo.jsx         # Sentence embeddings demo
│   ├── AnalogyDemo.jsx           # Word analogies demo
│   ├── TokenSamplingDemo.jsx     # Token sampling demo
│   ├── IronyAssignmentDemo.jsx   # Irony detection assignment
│   │
│   ├── worker.js                 # Web Worker — sentence embeddings
│   ├── tokenizerWorker.js        # Web Worker — tokenization
│   ├── tokenWorker.js            # Web Worker — next-token logits
│   ├── analogyWorker.js          # Web Worker — word analogy search
│   ├── ironyWorker.js            # Web Worker — tweet classification
│   │
│   ├── analogy.js                # Vector math (dot product, cosine sim, top-k)
│   ├── ironyStats.js             # Statistics (accuracy, Cohen's κ, confusion matrix)
│   ├── presets.js                # 20 word analogy presets
│   ├── vocab.js                  # ~2 000-word vocabulary for analogy search
│   └── data/
│       └── ironyDataset.js       # 20 tweets with ground truth + RoBERTa predictions
│
├── scripts/
│   └── prepare_irony_data.py     # Offline script to fetch/re-generate irony dataset
│
├── public/
│   └── favicon.svg
│
├── index.html
├── vite.config.js
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml            # GitHub Pages CI/CD
```

---

## Getting started

```bash
npm install

# Development server (hot reload)
npm run dev

# — or — build and serve the production bundle
npm run build
npm run serve
```

Open `http://localhost:5173`. Models are downloaded on first use.

---

## Deployment

The site deploys automatically to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`:

1. Node 20 is set up and `npm ci` installs dependencies
2. `npm run build` produces `dist/`
3. The `dist/` directory is uploaded as a GitHub Pages artifact and deployed

To trigger a deployment manually, use **Actions → Deploy → Run workflow** in the GitHub UI.

The Vite base path is set to `./` (relative) so the build works correctly under the repository's subpath on GitHub Pages.
