import { useEffect, useMemo, useRef, useState } from "react";
import Worker from "./tokenWorker.js?worker";

const DEFAULT_PROMPT = "The capital of France is";
const DEFAULT_TOP_K = 32;
const BAR_MAX_H = 180;
const LOGIT_MAX_H = 100;

// ── Logit bar chart ──────────────────────────────────────────────────────────

function LogitChart({ tokens }) {
  const logits = tokens.map((t) => t.logit);
  const minLogit = Math.min(...logits);
  const maxLogit = Math.max(...logits);
  const range = maxLogit - minLogit || 1;
  return (
    <div className="hist-wrap">
      <div className="hist-bars-area logit-bars-area">
        {tokens.map(({ token, logit }, i) => {
          const h = Math.max(2, ((logit - minLogit) / range) * LOGIT_MAX_H);
          const t = 1 - i / (tokens.length - 1 || 1);
          const hue = Math.round(180 + t * 25);
          const labelInside = h > LOGIT_MAX_H - 18;
          return (
            <div
              key={i}
              className="hist-col"
              title={`${JSON.stringify(token)}: ${logit.toFixed(3)}`}
            >
              {!labelInside && <span className="hist-prob">{logit.toFixed(1)}</span>}
              <div className="hist-bar" style={{ height: h, background: `hsl(${hue}, 65%, 42%)` }}>
                {labelInside && (
                  <span className="hist-prob hist-prob--inside">{logit.toFixed(1)}</span>
                )}
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

// ── Probability histogram (with nucleus lasso) ───────────────────────────────

function ProbHistogram({ tokens, nucleusCount, sampledIndex }) {
  const maxProb = tokens[0]?.prob ?? 1;
  const total = tokens.length;
  // Exact lasso width accounting for 4px gaps: each bar is flex:1, gap is 4px
  const nucleusFrac = total > 0 ? nucleusCount / total : 0;
  const lassoWidth = `calc(${nucleusFrac * 100}% + ${4 * (nucleusFrac - 1)}px)`;

  return (
    <div className="hist-wrap">
      <div className="hist-bars-area" style={{ position: "relative" }}>
        {/* Nucleus lasso — rendered behind bars */}
        {nucleusCount > 0 && (
          <div className="nucleus-lasso" style={{ width: lassoWidth }}>
            <span className="nucleus-lasso-label">nucleus</span>
          </div>
        )}
        {tokens.map(({ token, prob }, i) => {
          const h = Math.max(2, (prob / maxProb) * BAR_MAX_H);
          const pct = (prob * 100).toFixed(1);
          const isSelected = i === sampledIndex;
          const inNucleus = i < nucleusCount;
          const t = 1 - i / (tokens.length - 1 || 1);
          const hue = Math.round(180 + t * 25);
          const bg = isSelected
            ? "#D85A30"
            : `hsl(${hue}, ${inNucleus ? 65 : 25}%, ${inNucleus ? 42 : 60}%)`;
          const labelInside = h > BAR_MAX_H - 18;
          return (
            <div
              key={i}
              className={`hist-col${isSelected ? " hist-col--sampled" : ""}${!inNucleus ? " hist-col--faded" : ""}`}
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
            <span
              className={`hist-label${i === sampledIndex ? " hist-label--sampled" : ""}${i >= nucleusCount ? " hist-label--faded" : ""}`}
            >
              {JSON.stringify(token)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Progress bar ─────────────────────────────────────────────────────────────

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

// ── Main component ────────────────────────────────────────────────────────────

export default function TokenSamplingDemo() {
  const worker = useRef(null);
  const [ready, setReady] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressItems, setProgressItems] = useState([]);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [topK, setTopK] = useState(DEFAULT_TOP_K);
  const [temperature, setTemperature] = useState(1.0);
  const [topP, setTopP] = useState(1.0);
  const [rawTokens, setRawTokens] = useState(null);
  const [sampledIndex, setSampledIndex] = useState(null);
  const [sampledToken, setSampledToken] = useState(null);
  const [generatedTokens, setGeneratedTokens] = useState([]);
  // pendingToken: sampled for the current round but not yet committed to generatedTokens.
  // Committed only when the user clicks "Next token distribution" again.
  const [pendingToken, setPendingToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    worker.current ??= new Worker();

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
          setRawTokens(e.data.tokens);
          setSampledIndex(null);
          setSampledToken(null);
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

  // Derived: apply temperature + softmax to raw logits
  const probTokens = useMemo(() => {
    if (!rawTokens) return null;
    const scaled = rawTokens.map((t) => t.logit / temperature);
    const maxVal = Math.max(...scaled);
    const exps = scaled.map((v) => Math.exp(v - maxVal));
    const sum = exps.reduce((a, b) => a + b, 0);
    return rawTokens.map((t, i) => ({ ...t, prob: exps[i] / sum }));
  }, [rawTokens, temperature]);

  // Derived: smallest prefix whose cumulative prob >= topP
  const nucleusCount = useMemo(() => {
    if (!probTokens) return 0;
    let cumsum = 0;
    for (let i = 0; i < probTokens.length; i++) {
      cumsum += probTokens[i].prob;
      if (cumsum >= topP) return i + 1;
    }
    return probTokens.length;
  }, [probTokens, topP]);

  const fetchDistribution = () => {
    // Commit the pending token (if any) before fetching a new distribution.
    // This is what actually advances the generated word count.
    const committed =
      pendingToken !== null ? [...generatedTokens, pendingToken] : generatedTokens;
    const effectivePrompt = prompt + committed.join("");
    if (!effectivePrompt.trim()) return;

    if (pendingToken !== null) {
      setGeneratedTokens(committed);
      setPendingToken(null);
    }

    setLoading(true);
    setError(null);
    setRawTokens(null);
    setSampledIndex(null);
    setSampledToken(null);
    if (ready === null) setReady(false);
    worker.current.postMessage({ type: "distribution", prompt: effectivePrompt, topK });
  };

  const clearGenerated = () => {
    setGeneratedTokens([]);
    setPendingToken(null);
    setSampledIndex(null);
    setSampledToken(null);
    setRawTokens(null);
  };

  const sampleToken = () => {
    if (!probTokens || nucleusCount === 0) return;
    const nucleus = probTokens.slice(0, nucleusCount);
    const nucleusSum = nucleus.reduce((a, t) => a + t.prob, 0);
    const r = Math.random() * nucleusSum;
    let cumulative = 0;
    let idx = nucleus.length - 1;
    for (let i = 0; i < nucleus.length; i++) {
      cumulative += nucleus[i].prob;
      if (r <= cumulative) {
        idx = i;
        break;
      }
    }
    setSampledIndex(idx);
    setSampledToken(nucleus[idx].token);
    // Replace (not append) the pending token — multiple Sample clicks stay on the same slot.
    setPendingToken(nucleus[idx].token);
  };

  const hasGenerated = generatedTokens.length > 0 || pendingToken !== null;

  return (
    <>
      <header className="app-header">
        <h1>Token sampling</h1>
        <p className="subtitle">
          Step through autoregressive generation one token at a time. Fetch the next-token
          distribution, explore how temperature reshapes it, then sample.
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
            setPendingToken(null);
            setSampledIndex(null);
            setSampledToken(null);
            setRawTokens(null);
          }}
          style={
            hasGenerated
              ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 }
              : { marginBottom: "1rem" }
          }
        />
        {hasGenerated && (
          <div className="generated-continuation">
            <span className="generated-label">Generated:</span>
            <span className="generated-text">
              {generatedTokens.map((tok, i) => (
                <span key={i} className="generated-token">
                  <span className="token-num">{i + 1}</span>{tok}
                </span>
              ))}
              {pendingToken !== null && (
                <span className="generated-token generated-token--pending">
                  <span className="token-num">{generatedTokens.length + 1}</span>{pendingToken}
                </span>
              )}
            </span>
          </div>
        )}

        <div className="topk-row" style={{ margin: "1rem 0" }}>
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

        <div className="btn-row">
          <button
            className="encode-btn"
            disabled={loading || !prompt.trim()}
            onClick={fetchDistribution}
          >
            {loading
              ? "Running…"
              : ready === null
              ? "Load model & get distribution"
              : "Next token distribution"}
          </button>
          {hasGenerated && (
            <button className="secondary-btn" onClick={clearGenerated}>
              Clear generated
            </button>
          )}
        </div>

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

      {rawTokens && (
        <>
          <section className="card">
            <p className="section-label" style={{ marginBottom: "0.75rem" }}>
              Raw logits — top {rawTokens.length} tokens
            </p>
            <LogitChart tokens={rawTokens} />
            <p className="explainer">
              These are the raw scores (logits) the model assigns to each candidate next token.
              Temperature divides all logits by the same constant before the softmax — lower
              temperature amplifies the differences, sharpening the distribution; higher temperature
              compresses them, flattening it.
            </p>
          </section>

          <section className="card">
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
            </div>

            <p className="section-label" style={{ marginBottom: "0.5rem" }}>
              Probability distribution
            </p>
            <ProbHistogram
              tokens={probTokens}
              nucleusCount={nucleusCount}
              sampledIndex={sampledIndex}
            />

            <button className="encode-btn" style={{ marginTop: "1rem" }} onClick={sampleToken}>
              Sample
            </button>

            {sampledToken != null && (
              <p className="sampled-token-display">
                Sampled:{" "}
                <strong className="sampled-token-value">{JSON.stringify(sampledToken)}</strong>
              </p>
            )}

            <p className="explainer">
              After dividing by temperature and applying softmax, bar height is proportional to
              sampling probability. The{" "}
              <span style={{ color: "#378ADD", fontWeight: 500 }}>nucleus</span> (blue zone) is the
              smallest set of top tokens whose probabilities sum to at least p — tokens outside it
              are excluded from sampling. Click <strong>Sample</strong> repeatedly to see different
              draws from the same distribution.
            </p>
          </section>
        </>
      )}
    </>
  );
}
