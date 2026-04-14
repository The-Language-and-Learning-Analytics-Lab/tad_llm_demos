import { useEffect, useRef, useState } from "react";
import InlineWorker from "./tokenWorker.js?worker&inline";

const DEFAULT_PROMPT = "The capital of France is";
const DEFAULT_TOP_K = 32;
const BAR_MAX_H = 180;

function TokenHistogram({ tokens, sampledIndex }) {
  const maxProb = tokens[0]?.prob ?? 1;
  return (
    <div className="hist-wrap">
      <div className="hist-bars-area">
        {tokens.map(({ token, prob }, i) => {
          const h = Math.max(2, (prob / maxProb) * BAR_MAX_H);
          const pct = (prob * 100).toFixed(1);
          const isSelected = i === sampledIndex;
          // interpolate color blue→teal by rank; orange for sampled
          const t = 1 - i / (tokens.length - 1 || 1);
          const hue = Math.round(180 + t * 25);
          const bg = isSelected ? "#D85A30" : `hsl(${hue}, 65%, 42%)`;
          const labelInside = h > BAR_MAX_H - 18;
          return (
            <div
              key={i}
              className={`hist-col${isSelected ? " hist-col--sampled" : ""}`}
              title={`${JSON.stringify(token)}: ${pct}%`}
            >
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
            <span className={`hist-label${i === sampledIndex ? " hist-label--sampled" : ""}`}>
              {JSON.stringify(token)}
            </span>
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
  const [temperature, setTemperature] = useState(1.0);
  const [topP, setTopP] = useState(1.0);
  const [tokens, setTokens] = useState(null);
  const [sampledIndex, setSampledIndex] = useState(null);
  const [sampledToken, setSampledToken] = useState(null);
  const [generatedTokens, setGeneratedTokens] = useState([]);
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
          setSampledIndex(e.data.sampledIndex);
          setSampledToken(e.data.sampledToken);
          setGeneratedTokens((prev) => [...prev, e.data.sampledToken]);
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
    const effectivePrompt = prompt + generatedTokens.join("");
    if (!effectivePrompt.trim()) return;
    setLoading(true);
    setError(null);
    setTokens(null);
    setSampledIndex(null);
    setSampledToken(null);
    if (ready === null) setReady(false);
    worker.current.postMessage({ type: "sample", prompt: effectivePrompt, topK, temperature, topP });
  };

  const hasGenerated = generatedTokens.length > 0;

  return (
    <>
      <header className="app-header">
        <h1>Token sampling</h1>
        <p className="subtitle">
          Enter a prompt and see the probability distribution over the next token — then sample from
          it. Click repeatedly to watch autoregressive generation unfold one token at a time.
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
          onChange={(e) => {
            setPrompt(e.target.value);
            setGeneratedTokens([]);
            setSampledIndex(null);
            setSampledToken(null);
            setTokens(null);
          }}
          style={hasGenerated ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 } : { marginBottom: "1rem" }}
        />
        {hasGenerated && (
          <div className="generated-continuation">
            <span className="generated-label">Generated:</span>
            <span className="generated-text">{generatedTokens.join("")}</span>
          </div>
        )}

        <div className="sampling-controls">
          <div className="slider-row">
            <label className="input-label" htmlFor="temperature" style={{ margin: 0, minWidth: 100 }}>
              Temperature
            </label>
            <input
              id="temperature"
              type="range"
              min={0.1}
              max={2.0}
              step={0.05}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="sampling-slider"
            />
            <span className="slider-value">{temperature.toFixed(2)}</span>
          </div>
          <div className="slider-row">
            <label className="input-label" htmlFor="topp" style={{ margin: 0, minWidth: 100 }}>
              Top-p (nucleus)
            </label>
            <input
              id="topp"
              type="range"
              min={0.05}
              max={1.0}
              step={0.05}
              value={topP}
              onChange={(e) => setTopP(Number(e.target.value))}
              className="sampling-slider"
            />
            <span className="slider-value">{topP.toFixed(2)}</span>
          </div>
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
        </div>

        <button
          className="encode-btn"
          disabled={loading || !prompt.trim()}
          onClick={sample}
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
          <TokenHistogram tokens={tokens} sampledIndex={sampledIndex} />
          {sampledToken != null && (
            <p className="sampled-token-display">
              Sampled: <strong className="sampled-token-value">{JSON.stringify(sampledToken)}</strong>
            </p>
          )}
          <p className="explainer">
            Each bar is a candidate next token. The height represents the probability assigned by the
            model after applying softmax to the logits (scaled by temperature). The{" "}
            <span style={{ color: "#D85A30", fontWeight: 500 }}>orange bar</span> is the token
            actually sampled — chosen randomly weighted by probability, constrained to the top-p
            nucleus.
          </p>
        </section>
      )}
    </>
  );
}
