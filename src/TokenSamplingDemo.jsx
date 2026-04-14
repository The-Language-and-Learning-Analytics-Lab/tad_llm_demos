import { useEffect, useRef, useState } from "react";
import InlineWorker from "./tokenWorker.js?worker&inline";

const DEFAULT_PROMPT = "The capital of France is";
const DEFAULT_TOP_K = 32;
const BAR_MAX_H = 180;

function TokenHistogram({ tokens }) {
  const maxProb = tokens[0]?.prob ?? 1;
  return (
    <div className="hist-wrap">
      <div className="hist-bars-area">
        {tokens.map(({ token, prob }, i) => {
          const h = Math.max(2, (prob / maxProb) * BAR_MAX_H);
          const pct = (prob * 100).toFixed(1);
          // interpolate color blue→teal by rank
          const t = 1 - i / (tokens.length - 1 || 1);
          const hue = Math.round(180 + t * 25); // 180 teal → 205 blue
          const bg = `hsl(${hue}, 65%, 42%)`;
          const labelInside = h > BAR_MAX_H - 18;
          return (
            <div key={i} className="hist-col" title={`${JSON.stringify(token)}: ${pct}%`}>
              {!labelInside && <span className="hist-prob">{pct}%</span>}
              <div className="hist-bar" style={{ height: h, background: bg }}>
                {labelInside && <span className="hist-prob hist-prob--inside">{pct}%</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="hist-label-area">
        {tokens.map(({ token }, i) => (
          <div key={i} className="hist-label-col">
            <span className="hist-label">{JSON.stringify(token)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ text, percentage }) {
  return (
    <div className="progress-wrap">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percentage ?? 0}%` }} />
      </div>
      <span className="progress-text">{text}</span>
    </div>
  );
}

export default function TokenSamplingDemo() {
  const worker = useRef(null);
  const [ready, setReady] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressItems, setProgressItems] = useState([]);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [topK, setTopK] = useState(DEFAULT_TOP_K);
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    worker.current ??= new InlineWorker();

    const onMessage = (e) => {
      switch (e.data.status) {
        case "progress":
          if (e.data.file) {
            setProgressItems((prev) => {
              const idx = prev.findIndex((p) => p.file === e.data.file);
              if (idx === -1) return [...prev, e.data];
              return prev.map((p, i) => (i === idx ? e.data : p));
            });
          }
          break;
        case "ready":
          setReady(true);
          setProgressItems([]);
          break;
        case "complete":
          setTokens(e.data.tokens);
          setLoading(false);
          break;
        case "error":
          setError(e.data.message);
          setLoading(false);
          break;
      }
    };

    worker.current.addEventListener("message", onMessage);
    return () => worker.current.removeEventListener("message", onMessage);
  }, []);

  const sample = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setTokens(null);
    if (ready === null) setReady(false);
    worker.current.postMessage({ type: "sample", prompt, topK });
  };

  return (
    <>
      <header className="app-header">
        <h1>Token sampling</h1>
        <p className="subtitle">
          Enter a prompt and see the probability distribution over the next token — how the model
          decides what word comes next.
        </p>
        <div className="model-pill">
          <span className="dot" />
          onnx-community/Qwen2.5-0.5B-Instruct · runs locally in your browser
        </div>
      </header>

      <section className="card">
        <label className="input-label" htmlFor="prompt">Prompt</label>
        <textarea
          id="prompt"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ marginBottom: "1rem" }}
        />

        <div className="topk-row">
          <label className="input-label" htmlFor="topk" style={{ margin: 0 }}>
            Top-k tokens
          </label>
          <input
            id="topk"
            type="number"
            min={1}
            max={100}
            value={topK}
            onChange={(e) => setTopK(Math.max(1, Math.min(100, Number(e.target.value))))}
            className="topk-input"
          />
        </div>

        <button
          className="encode-btn"
          disabled={loading || !prompt.trim()}
          onClick={sample}
          style={{ marginTop: "1rem" }}
        >
          {loading ? "Running…" : ready === null ? "Load model & sample" : "Sample next token"}
        </button>

        {error && <p className="error">{error}</p>}

        {ready === false && progressItems.length > 0 && (
          <div className="progress-list">
            <p className="section-label" style={{ marginBottom: 8 }}>
              Downloading model (first run only — ~250 MB)
            </p>
            {progressItems.map((d) => (
              <ProgressBar key={d.file} text={d.file} percentage={d.progress} />
            ))}
          </div>
        )}
      </section>

      {tokens && (
        <section className="card">
          <p className="section-label" style={{ marginBottom: "1rem" }}>
            Top {tokens.length} next-token probabilities
          </p>
          <TokenHistogram tokens={tokens} />
          <p className="explainer">
            Each bar is a candidate next token. The height represents the probability assigned by
            the model after applying softmax to the output logits. The model doesn't always pick
            the most probable token — sampling strategies like temperature and top-p introduce
            controlled randomness.
          </p>
        </section>
      )}
    </>
  );
}
