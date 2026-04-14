# Sentence Embeddings Demo

A browser-based interactive demo that shows how a language model encodes sentences as vectors and measures their semantic similarity.

## What it does

- Takes two sentences as input and runs them through the **all-MiniLM-L6-v2** model (384 dimensions)
- Displays each sentence's embedding as a bar chart of the first 64 dimensions
- Computes and visualizes the **cosine similarity** between the two embeddings
- Includes preset sentence pairs to explore different similarity scenarios (paraphrases, same topic/different meaning, unrelated, etc.)

The model runs entirely **in the browser** via a Web Worker — no server, no API calls. The model weights are downloaded from Hugging Face on first use and cached locally.

## Tech stack

- [React](https://react.dev/) — UI
- [Vite](https://vite.dev/) — build tool
- [@huggingface/transformers](https://huggingface.co/docs/transformers.js) — in-browser ML inference

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser. The first time you click **Load model & encode**, the model weights (~25 MB) will be downloaded and cached.
