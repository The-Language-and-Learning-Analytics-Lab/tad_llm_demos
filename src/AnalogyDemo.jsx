import { useEffect, useRef, useState } from "react";
import "./App.css";
import Worker from "./analogyWorker.js?worker";
import { PRESET_CATEGORIES, PRESETS_BY_CATEGORY } from "./presets.js";
import DEFAULT_VOCAB from "./vocab.js";

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

function ScoreBar({ score }) {
  const pct = Math.round(Math.max(0, Math.min(1, score)) * 100);
  return (
    <div className="analogy-score-track">
      <div className="analogy-score-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AnalogyDemo() {
  const worker = useRef(null);

  // Model / vocab loading
  const [phase, setPhase] = useState("idle"); // idle | loading-model | loading-vocab | ready
  const [backend, setBackend] = useState(null);
  const [progressItems, setProgressItems] = useState([]);
  const [vocabDone, setVocabDone] = useState(0);
  const [vocabTotal, setVocabTotal] = useState(0);
  const [error, setError] = useState(null);

  // Query inputs
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [inputC, setInputC] = useState("");
  const [expectedAnswer, setExpectedAnswer] = useState(null);
  const [running, setRunning] = useState(false);

  // Results
  const [results, setResults] = useState(null);

  // ── Worker setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    worker.current ??= new Worker();

    const onMessage = (e) => {
      const msg = e.data;
      switch (msg.type) {
        case "progress":
          if (msg.file) {
            setProgressItems((prev) => {
              const idx = prev.findIndex((p) => p.file === msg.file);
              if (idx === -1) return [...prev, msg];
              return prev.map((p, i) => (i === idx ? msg : p));
            });
          }
          break;

        case "ready":
          setPhase("loading-vocab");
          setBackend(msg.backend);
          setProgressItems([]);
          setVocabTotal(DEFAULT_VOCAB.length);
          worker.current.postMessage({ type: "embed_vocab", words: DEFAULT_VOCAB });
          break;

        case "vocab_progress":
          setVocabDone(msg.done);
          setVocabTotal(msg.total);
          break;

        case "vocab_ready":
          setPhase("ready");
          break;

        case "result":
          setResults(msg.matches);
          setRunning(false);
          break;

        case "error":
          setError(msg.message);
          setRunning(false);
          if (phase === "loading-model" || phase === "loading-vocab") setPhase("idle");
          break;
      }
    };

    worker.current.addEventListener("message", onMessage);
    setPhase("loading-model");
    worker.current.postMessage({ type: "init" });

    return () => worker.current.removeEventListener("message", onMessage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Run analogy query ─────────────────────────────────────────────────────────
  const runQuery = (a, b, c) => {
    const clean = (s) => s.trim().toLowerCase();
    const ca = clean(a), cb = clean(b), cc = clean(c);
    if (!ca || !cb || !cc) return;
    setRunning(true);
    setError(null);
    setResults(null);
    worker.current.postMessage({ type: "analogy", a: ca, b: cb, c: cc, topK: 5 });
  };

  // ── Preset selection ──────────────────────────────────────────────────────────
  const applyPreset = (preset) => {
    setInputA(preset.a);
    setInputB(preset.b);
    setInputC(preset.c);
    setExpectedAnswer(preset.expected);
    setResults(null);
    runQuery(preset.a, preset.b, preset.c);
  };

  const handlePresetChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [cat, idx] = val.split(":");
    const preset = PRESETS_BY_CATEGORY[cat]?.[Number(idx)];
    if (preset) applyPreset(preset);
    // Reset select to placeholder so the same preset can be re-selected
    e.target.value = "";
  };

  const handleSubmit = () => {
    setExpectedAnswer(null);
    runQuery(inputA, inputB, inputC);
  };

  const ready = phase === "ready";
  const loading = phase === "loading-model" || phase === "loading-vocab";

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <header className="app-header">
        <div className="analogy-header-row">
          <h1>Word analogies</h1>
          {backend && (
            <span className={`analogy-backend-badge analogy-backend-badge--${backend}`}>
              {backend === "webgpu" ? "WebGPU" : "WASM"}
            </span>
          )}
        </div>
        <p className="subtitle">
          Sentence-embedding vectors support analogy arithmetic — explore how the
          model relates concepts entirely in your browser.
        </p>
        <div className="model-pill">
          <span className="dot" />
          all-MiniLM-L6-v2 · 384 dimensions · runs locally
        </div>
      </header>

      {/* ── Loading state ─────────────────────────────────────────────────────── */}
      {loading && (
        <section className="card">
          {phase === "loading-model" && (
            <>
              <p className="section-label" style={{ marginBottom: 8 }}>
                {progressItems.length > 0
                  ? "Downloading model (first run only)…"
                  : "Loading model…"}
              </p>
              {progressItems.map((d) => (
                <ProgressBar key={d.file} text={d.file} percentage={d.progress} />
              ))}
            </>
          )}
          {phase === "loading-vocab" && (
            <>
              <p className="section-label" style={{ marginBottom: 8 }}>
                Preparing vocabulary ({vocabDone.toLocaleString()} / {vocabTotal.toLocaleString()})…
              </p>
              <ProgressBar
                text={`${vocabDone} words embedded`}
                percentage={vocabTotal > 0 ? (vocabDone / vocabTotal) * 100 : 0}
              />
            </>
          )}
        </section>
      )}

      {/* ── Preset picker ─────────────────────────────────────────────────────── */}
      <section className="card">
        <p className="section-label">Preset analogies</p>
        <select
          className="analogy-preset-select"
          value=""
          onChange={handlePresetChange}
          disabled={!ready}
        >
          <option value="">Choose a preset…</option>
          {PRESET_CATEGORIES.map((cat) => (
            <optgroup key={cat} label={cat}>
              {PRESETS_BY_CATEGORY[cat].map((p, i) => (
                <option key={i} value={`${cat}:${i}`}>
                  {p.a} : {p.b} :: {p.c} : ?
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <p className="explainer" style={{ marginTop: "0.6rem" }}>
          Selecting a preset fills the inputs below and runs immediately. Geography
          and currency presets are most reliable; gender analogies are hit-or-miss
          (that difference is part of the story).
        </p>
      </section>

      {/* ── Equation + inputs ─────────────────────────────────────────────────── */}
      <section className="card">
        {/* Equation grid: labels row + inputs row */}
        <div className="analogy-eq-grid">
          {/* ── Row 1: letter labels ── */}
          <div className="analogy-eq-letter">A</div>
          <div className="analogy-eq-op-label">−</div>
          <div className="analogy-eq-letter">B</div>
          <div className="analogy-eq-op-label">+</div>
          <div className="analogy-eq-letter">C</div>
          <div className="analogy-eq-op-label">=</div>
          <div className="analogy-eq-letter analogy-eq-letter--result">?</div>

          {/* ── Row 2: inputs ── */}
          <input
            className="analogy-text-input"
            type="text"
            placeholder="e.g. france"
            value={inputA}
            onChange={(e) => { setInputA(e.target.value); setExpectedAnswer(null); }}
            disabled={!ready}
          />
          <div className="analogy-eq-op">−</div>
          <input
            className="analogy-text-input"
            type="text"
            placeholder="e.g. paris"
            value={inputB}
            onChange={(e) => { setInputB(e.target.value); setExpectedAnswer(null); }}
            disabled={!ready}
          />
          <div className="analogy-eq-op">+</div>
          <input
            className="analogy-text-input"
            type="text"
            placeholder="e.g. tokyo"
            value={inputC}
            onChange={(e) => { setInputC(e.target.value); setExpectedAnswer(null); }}
            disabled={!ready}
          />
          <div className="analogy-eq-op">=</div>
          <div className="analogy-eq-result-box">
            {running
              ? <span className="analogy-eq-result-word" style={{ opacity: 0.45 }}>…</span>
              : results
                ? <span className="analogy-eq-result-word">{results[0]?.word}</span>
                : <span className="analogy-eq-result-dash">—</span>
            }
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: "1rem" }}>
          <button
            className="encode-btn"
            onClick={handleSubmit}
            disabled={!ready || running || !inputA.trim() || !inputB.trim() || !inputC.trim()}
          >
            {running ? "Computing…" : "Find analogy"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}
      </section>

      {/* ── Results ───────────────────────────────────────────────────────────── */}
      {results && (
        <section className="card">
          <p className="section-label" style={{ marginBottom: "0.75rem" }}>
            Top matches
          </p>

          {expectedAnswer && !results.slice(0, 5).some(r => r.word === expectedAnswer) && (
            <p className="analogy-miss-note">
              Expected <strong>{expectedAnswer}</strong> wasn't in the top 5 —
              model suggested <strong>{results[0]?.word}</strong> instead.
              That's part of what makes this worth exploring.
            </p>
          )}

          <ol className="analogy-results">
            {results.map(({ word, score }, i) => {
              const isExpected = expectedAnswer && word === expectedAnswer;
              return (
                <li
                  key={word}
                  className={`analogy-result-row${isExpected ? " analogy-result-row--match" : ""}`}
                >
                  <span className="analogy-rank">{i + 1}</span>
                  <span className="analogy-word">{word}</span>
                  <ScoreBar score={score} />
                  <span className="analogy-score">{score.toFixed(3)}</span>
                  {isExpected && <span className="analogy-check">✓</span>}
                </li>
              );
            })}
          </ol>

          <p className="explainer">
            Score is cosine similarity between the query vector{" "}
            <em>A − B + C</em> and each candidate. Higher = more analogous.
            Input terms are excluded from results.
          </p>
        </section>
      )}

      {/* ── About ─────────────────────────────────────────────────────────────── */}
      <details className="card analogy-about">
        <summary className="analogy-about-summary">About this demo</summary>
        <p className="explainer">
          Sentence-embedding models like MiniLM are trained to place semantically
          similar text near each other in vector space — not to encode word-level
          grammatical relationships the way GloVe word vectors do. So some analogies
          work beautifully (geography, currency) and others will surprise you. That
          difference is the point: it shows what these models <em>do</em> and{" "}
          <em>don't</em> capture.
        </p>
        <p className="explainer">
          The math: given normalized embeddings <strong>A</strong>, <strong>B</strong>,{" "}
          <strong>C</strong>, compute target = normalize(<strong>A</strong> −{" "}
          <strong>B</strong> + <strong>C</strong>), then rank the vocabulary words
          by cosine similarity to that target. Input terms are excluded so the top
          result isn't trivially <em>C</em> itself.
        </p>
        <p className="explainer">
          The entire vocabulary (~{DEFAULT_VOCAB.length.toLocaleString()} words) is
          embedded once on page load and cached in the worker. All inference runs
          locally via ONNX Runtime — no data leaves your device.
        </p>
      </details>
    </>
  );
}
