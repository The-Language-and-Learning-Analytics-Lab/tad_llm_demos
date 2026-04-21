import { useEffect, useRef, useState } from "react";
import Worker from "./tokenizerWorker.js?worker";

const DEFAULT_TEXT =
  "Hello, world! The quick brown fox jumps over the lazy dog. Tokenization splits text into subwords.";

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

export default function TokenizerDemo() {
  const worker = useRef(null);
  const [ready, setReady] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressItems, setProgressItems] = useState([]);
  const [text, setText] = useState(DEFAULT_TEXT);
  const [tokens, setTokens] = useState(null);
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

  const tokenize = () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setTokens(null);
    if (ready === null) setReady(false);
    worker.current.postMessage({ type: "tokenize", text });
  };

  return (
    <>
      <header className="app-header">
        <h1>Tokenizer</h1>
        <p className="subtitle">
          See how the model breaks text into tokens — the atomic units it actually processes. Each
          chip shows a token's string representation and its integer ID.
        </p>
        <div className="model-pill">
          <span className="dot" />
          onnx-community/Qwen2.5-0.5B-Instruct · runs locally in your browser
        </div>
      </header>

      <section className="card">
        <label className="input-label" htmlFor="tok-input">Text to tokenize</label>
        <textarea
          id="tok-input"
          rows={4}
          value={text}
          onChange={(e) => { setText(e.target.value); setTokens(null); }}
          style={{ marginBottom: "1rem" }}
        />
        <button
          className="encode-btn"
          disabled={loading || !text.trim()}
          onClick={tokenize}
        >
          {loading ? "Tokenizing…" : ready === null ? "Load model & tokenize" : "Tokenize"}
        </button>

        {error && <p className="error">{error}</p>}

        {ready === false && progressItems.length > 0 && (
          <div className="progress-list">
            <p className="section-label" style={{ marginBottom: 8 }}>
              Downloading tokenizer (first run only)
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
            {tokens.length} tokens
          </p>
          <div className="token-chips">
            {tokens.map(({ id, text: tokenText }, i) => (
              <div key={i} className={`token-chip tok-c${i % 6}`}>
                <span className="token-chip-text">{JSON.stringify(tokenText)}</span>
                <span className="token-chip-id">{id}</span>
              </div>
            ))}
          </div>
          <p className="explainer">
            Each chip is one token. The top line shows the token's string (with escape sequences for
            whitespace — notice how many tokens include a leading space). The number below is the
            integer ID the model actually processes. Common words are often a single token; rare or
            long words are split into sub-word pieces.
          </p>
        </section>
      )}
    </>
  );
}
