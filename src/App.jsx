import { useEffect, useRef, useState } from "react";
import "./App.css";
import InlineWorker from "./worker.js?worker&inline";

const PRESET_PAIRS = [
  {
    label: "Paraphrases",
    a: "The student is confused about the lecture.",
    b: "The pupil is struggling to understand the talk.",
  },
  {
    label: "Same topic, different meaning",
    a: "I love this class.",
    b: "I hate this class.",
  },
  {
    label: "Unrelated",
    a: "The cat sat on the mat.",
    b: "Quantum mechanics describes subatomic particles.",
  },
  {
    label: "Emotion vs. description",
    a: "She felt overwhelmed and couldn't focus.",
    b: "The meeting ran for three hours.",
  },
];

function cosineSim(a, b) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function EmbeddingBar({ values, color, label }) {
  const SHOW = 64;
  const BAR_HALF = 40;
  const slice = values.slice(0, SHOW);
  const max = Math.max(...slice.map(Math.abs), 0.001);
  return (
    <div>
      <p className="bar-label">{label}</p>
      <div className="bar-chart-wrap">
        <div className="bar-row">
          {slice.map((v, i) => {
            const norm = v / max;
            const absNorm = Math.abs(norm);
            const h = Math.max(2, absNorm * BAR_HALF);
            const bg = norm >= 0 ? color.pos : color.neg;
            const opacity = 0.75 + absNorm * 0.25;
            return (
              <div key={i} className="bar-cell-wrap" title={`dim ${i}: ${v.toFixed(4)}`}>
                <div className="bar-cell-top">
                  {norm > 0 && <div className="bar-seg" style={{ height: h, background: bg, opacity }} />}
                </div>
                <div className="bar-val">{v.toFixed(2)}</div>
                <div className="bar-cell-bot">
                  {norm < 0 && <div className="bar-seg" style={{ height: h, background: bg, opacity }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="bar-dims">{values.length} dimensions total · showing first {SHOW}</p>
    </div>
  );
}

function SimilarityMeter({ sim }) {
  const pct = Math.round(((sim + 1) / 2) * 100);
  const label =
    sim > 0.85 ? "Very high" : sim > 0.65 ? "High" : sim > 0.4 ? "Moderate" : sim > 0.15 ? "Low" : "Very low";
  const barColor =
    sim > 0.65 ? "var(--c-teal-mid)" : sim > 0.3 ? "var(--c-amber-mid)" : "var(--c-coral-mid)";
  return (
    <div className="sim-block">
      <div className="sim-header">
        <span className="sim-title">Cosine similarity</span>
        <span className="sim-badge" style={{ background: barColor }}>{label}</span>
      </div>
      <div className="sim-track">
        <div className="sim-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <div className="sim-row">
        <span className="sim-ends">−1 (opposite)</span>
        <span className="sim-value">{sim.toFixed(4)}</span>
        <span className="sim-ends">+1 (identical)</span>
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

export default function App() {
  const worker = useRef(null);
  const [ready, setReady] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressItems, setProgressItems] = useState([]);
  const [sentenceA, setSentenceA] = useState(PRESET_PAIRS[0].a);
  const [sentenceB, setSentenceB] = useState(PRESET_PAIRS[0].b);
  const [embeddings, setEmbeddings] = useState(null);
  const [similarity, setSimilarity] = useState(null);
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
        case "complete": {
          const [ea, eb] = e.data.embeddings;
          setEmbeddings({ a: ea, b: eb });
          setSimilarity(cosineSim(ea, eb));
          setLoading(false);
          break;
        }
        case "error":
          setError(e.data.message);
          setLoading(false);
          break;
      }
    };

    worker.current.addEventListener("message", onMessage);
    return () => worker.current.removeEventListener("message", onMessage);
  }, []);

  const encode = () => {
    if (!sentenceA.trim() || !sentenceB.trim()) return;
    setLoading(true);
    setError(null);
    setEmbeddings(null);
    setSimilarity(null);
    if (ready === null) setReady(false);
    worker.current.postMessage({
      type: "encode",
      sentences: [sentenceA, sentenceB],
    });
  };

  const applyPreset = (pair) => {
    setSentenceA(pair.a);
    setSentenceB(pair.b);
    setEmbeddings(null);
    setSimilarity(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sentence embeddings</h1>
        <p className="subtitle">
          Type two sentences and see how a language model encodes them as vectors — then measure how
          semantically similar they are.
        </p>
        <div className="model-pill">
          <span className="dot" />
          all-MiniLM-L6-v2 · 384 dimensions · runs locally in your browser
        </div>
      </header>

      <section className="card">
        <p className="section-label">Try a preset pair</p>
        <div className="presets">
          {PRESET_PAIRS.map((p) => (
            <button key={p.label} className="preset-btn" onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="sentence-grid">
          <div>
            <label className="input-label" htmlFor="sentA">Sentence A</label>
            <textarea
              id="sentA"
              rows={3}
              value={sentenceA}
              onChange={(e) => setSentenceA(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label" htmlFor="sentB">Sentence B</label>
            <textarea
              id="sentB"
              rows={3}
              value={sentenceB}
              onChange={(e) => setSentenceB(e.target.value)}
            />
          </div>
        </div>

        <button
          className="encode-btn"
          disabled={loading || !sentenceA.trim() || !sentenceB.trim()}
          onClick={encode}
        >
          {loading ? "Encoding…" : ready === null ? "Load model & encode" : "Encode sentences"}
        </button>

        {error && <p className="error">{error}</p>}

        {ready === false && progressItems.length > 0 && (
          <div className="progress-list">
            <p className="section-label" style={{ marginBottom: 8 }}>
              Downloading model (first run only)
            </p>
            {progressItems.map((d) => (
              <ProgressBar key={d.file} text={d.file} percentage={d.progress} />
            ))}
          </div>
        )}
      </section>

      {similarity !== null && embeddings && (
        <>
          <section className="card">
            <SimilarityMeter sim={similarity} />
            <p className="explainer">
              Cosine similarity measures the angle between two vectors. +1 means the sentences point
              in exactly the same direction in the model's space; −1 means opposite; 0 means
              unrelated. The model captures <em>meaning</em>, not exact words — paraphrases score
              nearly as high as identical sentences.
            </p>
          </section>

          <section className="card">
            <EmbeddingBar
              values={embeddings.a}
              label="Embedding A"
              color={{ pos: "#1D9E75", neg: "#D85A30" }}
            />
            <div className="bar-divider" />
            <EmbeddingBar
              values={embeddings.b}
              label="Embedding B"
              color={{ pos: "#378ADD", neg: "#BA7517" }}
            />
            <p className="explainer">
              Each bar is one dimension of the vector. Positive values (green / blue) and negative
              values (orange) encode different aspects of meaning. The model learned these 384
              "directions" during training on millions of sentences — no human decided what each
              dimension means.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
