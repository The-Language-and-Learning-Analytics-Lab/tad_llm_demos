import { useState, useRef, useEffect, useCallback } from "react";
import { IRONY_DATASET } from "./data/ironyDataset.js";
import {
  labelCounts,
  accuracy,
  rawAgreement,
  cohensKappa,
  confusionMatrix,
  kappaInterpretation,
} from "./ironyStats.js";
import IronyWorker from "./ironyWorker.js?worker";

// ── Default prompt template ────────────────────────────────────────────────────
const DEFAULT_PROMPT_TEMPLATE = `You are classifying tweets as either ironic or non-ironic.

Irony is when the literal meaning of a statement is opposite to, or notably at odds with, what the speaker actually means or feels.

Classify the following tweet. Respond with exactly one word: either "irony" or "non_irony".

Tweet: {TWEET}

Label:`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const TOTAL = IRONY_DATASET.length;

function pct(n, total) {
  if (total === 0) return "—";
  return (100 * n / total).toFixed(1) + "%";
}

function fmtPct(v) {
  if (v == null || isNaN(v)) return "—";
  return (v * 100).toFixed(1) + "%";
}

function fmtKappa(k) {
  if (k == null || isNaN(k)) return "N/A";
  return k.toFixed(3);
}

/** Green if matches truth, red if wrong, gray if unparseable */
function labelCellClass(label, truth) {
  if (label === "unparseable") return "irony-cell--unparseable";
  return label === truth ? "irony-cell--correct" : "irony-cell--wrong";
}

function labelDisplay(label) {
  if (label === "irony") return "Irony";
  if (label === "non_irony") return "Not irony";
  if (label === "unparseable") return "?";
  return "—";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ value, max, label }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="irony-progress-wrap">
      <div className="irony-progress-bar-track">
        <div className="irony-progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {label && <span className="irony-progress-label">{label}</span>}
    </div>
  );
}

function TweetCard({ item, label, onLabel, disabled }) {
  return (
    <div className={`irony-tweet-card${label ? " irony-tweet-card--labeled" : ""}`}>
      <div className="irony-tweet-id">#{item.id + 1}</div>
      <p className="irony-tweet-text">{item.text}</p>
      <div className="irony-label-row">
        <span className="input-label">Your label:</span>
        <button
          className={`label-btn${label === "irony" ? " label-btn--selected" : ""}`}
          onClick={() => !disabled && onLabel(item.id, "irony")}
          disabled={disabled}
          aria-pressed={label === "irony"}
        >
          Irony
        </button>
        <button
          className={`label-btn${label === "non_irony" ? " label-btn--selected" : ""}`}
          onClick={() => !disabled && onLabel(item.id, "non_irony")}
          disabled={disabled}
          aria-pressed={label === "non_irony"}
        >
          Not irony
        </button>
      </div>
    </div>
  );
}

/** 4×4 Cohen's κ / agreement matrix */
function KappaMatrix({ raters }) {
  // raters: [{ name, labels }]
  const n = raters.length;
  const cells = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (r === c) {
        cells.push({ r, c, diag: true });
      } else {
        const { kappa } = cohensKappa(raters[r].labels, raters[c].labels);
        const rawAgr = rawAgreement(raters[r].labels, raters[c].labels);
        const interp = kappaInterpretation(kappa);
        cells.push({ r, c, kappa, rawAgr, interp });
      }
    }
  }
  return (
    <div className="irony-kappa-wrap">
      <table className="irony-kappa-table">
        <thead>
          <tr>
            <th></th>
            {raters.map((r) => <th key={r.name}>{r.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {raters.map((row, r) => (
            <tr key={row.name}>
              <th>{row.name}</th>
              {raters.map((_, c) => {
                const cell = cells[r * n + c];
                if (cell.diag) {
                  return <td key={c} className="irony-kappa-diag">—</td>;
                }
                return (
                  <td
                    key={c}
                    className="irony-kappa-cell"
                    style={{ background: cell.interp.color }}
                  >
                    <span className="irony-kappa-value">{fmtKappa(cell.kappa)}</span>
                    <br />
                    <span className="irony-kappa-raw">{fmtPct(cell.rawAgr)} agree</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="irony-kappa-legend">
        <span className="kappa-legend-title">κ guide (Landis &amp; Koch 1977):</span>
        {[
          { range: "< 0", label: "Poor", color: "rgba(216,90,48,0.15)" },
          { range: "0–0.2", label: "Slight", color: "rgba(255,195,0,0.18)" },
          { range: "0.2–0.4", label: "Fair", color: "rgba(255,160,0,0.2)" },
          { range: "0.4–0.6", label: "Moderate", color: "rgba(100,190,100,0.22)" },
          { range: "0.6–0.8", label: "Substantial", color: "rgba(50,160,80,0.28)" },
          { range: "> 0.8", label: "Almost perfect", color: "rgba(29,158,117,0.32)" },
        ].map(({ range, label, color }) => (
          <span key={range} className="kappa-legend-item" style={{ background: color }}>
            {range} = {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Mini 2×2 confusion matrix display */
function ConfusionMini({ predicted, truth, title }) {
  const { tp, fp, tn, fn } = confusionMatrix(predicted, truth);
  return (
    <div className="irony-cm-wrap">
      <div className="irony-cm-title">{title}</div>
      <table className="irony-cm-table">
        <thead>
          <tr>
            <th></th>
            <th>Pred: I</th>
            <th>Pred: N</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>True: I</th>
            <td className="irony-cm-tp">{tp}</td>
            <td className="irony-cm-fn">{fn}</td>
          </tr>
          <tr>
            <th>True: N</th>
            <td className="irony-cm-fp">{fp}</td>
            <td className="irony-cm-tn">{tn}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function IronyAssignmentDemo() {
  const [stage, setStage] = useState("label_tweets");
  const [studentName, setStudentName] = useState("");
  const [humanLabels, setHumanLabels] = useState(() => Array(TOTAL).fill(null));
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT_TEMPLATE);
  const [llmLabels, setLlmLabels] = useState(null);
  const [llmProgress, setLlmProgress] = useState({ current: 0, total: TOTAL });
  const [currentTweetIdx, setCurrentTweetIdx] = useState(0);
  const [llmError, setLlmError] = useState(null);
  const [reflection, setReflection] = useState("");
  const [modelReady, setModelReady] = useState(null);
  const [progressItems, setProgressItems] = useState([]);
  const [expandedTweet, setExpandedTweet] = useState(null);

  const workerRef = useRef(null);

  // Count labeled tweets
  const labeledCount = humanLabels.filter(Boolean).length;
  const allLabeled = labeledCount === TOTAL;

  function handleLabel(id, label) {
    setHumanLabels((prev) => {
      const next = [...prev];
      next[id] = label;
      return next;
    });
  }

  function advanceTo(nextStage) {
    setStage(nextStage);
  }

  // ── LLM Worker ──────────────────────────────────────────────────────────────
  const startLLM = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    const worker = new IronyWorker();
    workerRef.current = worker;

    const resultsAccum = new Array(TOTAL).fill(null);

    worker.addEventListener("message", (e) => {
      const { status } = e.data;

      if (status === "progress") {
        const { file, progress, loaded, total } = e.data;
        setModelReady(false);
        setProgressItems((prev) => {
          const idx = prev.findIndex((p) => p.file === file);
          const item = { file, progress: progress ?? 0, loaded, total };
          if (idx === -1) return [...prev, item];
          const next = [...prev];
          next[idx] = item;
          return next;
        });
      } else if (status === "ready") {
        setModelReady(true);
      } else if (status === "item_done") {
        const { index, total, label, raw } = e.data;
        resultsAccum[index] = { label, raw };
        setCurrentTweetIdx(index);
        setLlmProgress({ current: index + 1, total });
      } else if (status === "complete") {
        setLlmLabels(e.data.results.map((r) => ({ label: r.label, raw: r.raw })));
        setStage("reveal");
        worker.terminate();
        workerRef.current = null;
      } else if (status === "error") {
        setLlmError(e.data.message);
      }
    });

    worker.postMessage({
      type: "classify_batch",
      tweets: IRONY_DATASET.map((item) => item.text),
      promptTemplate: customPrompt,
    });
  }, [customPrompt]);

  useEffect(() => {
    if (stage === "run_llm") {
      startLLM();
    }
  }, [stage, startLLM]);

  useEffect(() => {
    return () => workerRef.current?.terminate();
  }, []);

  // ── Derived data for Stage 4 ─────────────────────────────────────────────
  const groundTruth = IRONY_DATASET.map((d) => d.ground_truth);
  const roberta = IRONY_DATASET.map((d) => d.roberta_label);
  const llmLabelArr = llmLabels ? llmLabels.map((l) => l.label) : null;
  const humanArr = humanLabels.map((l) => l ?? "unparseable");

  // ── Render ────────────────────────────────────────────────────────────────
  const isLabelStage = stage === "label_tweets";
  const isReveal = stage === "reveal";

  // Stages visible once unlocked
  const showStage2 = stage !== "label_tweets";
  const showStage3 = stage === "run_llm" || stage === "reveal";
  const showStage4 = stage === "reveal";

  return (
    <div className="irony-assignment">
      {/* ── Stage 1: Label tweets ─────────────────────────────────────────── */}
      <section className="card irony-stage-section">
        <div className="section-label">Step 1 · Label each tweet</div>

        <p className="explainer">
          Read each tweet below and decide: is the author being ironic? Click{" "}
          <strong>Irony</strong> or <strong>Not irony</strong> for every tweet.
          All 20 must be labeled before you can continue.
        </p>

        <div className="irony-name-row">
          <label className="input-label" htmlFor="student-name">
            Your name (for your submission)
          </label>
          <input
            id="student-name"
            className="irony-name-input"
            type="text"
            placeholder="e.g. Jane Smith"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            disabled={!isLabelStage}
          />
        </div>

        <div className="irony-label-progress">
          {labeledCount} / {TOTAL} labeled
          {allLabeled && <span className="irony-all-done"> — all done!</span>}
        </div>

        <div className="irony-tweet-list">
          {IRONY_DATASET.map((item) => (
            <TweetCard
              key={item.id}
              item={item}
              label={humanLabels[item.id]}
              onLabel={handleLabel}
              disabled={!isLabelStage}
            />
          ))}
        </div>

        {isLabelStage ? (
          <button
            className="encode-btn"
            disabled={!allLabeled}
            onClick={() => advanceTo("write_prompt")}
          >
            Continue to Step 2
          </button>
        ) : (
          <span className="irony-submitted-pill">✓ Submitted</span>
        )}
      </section>

      {/* ── Stage 2: Write a prompt ───────────────────────────────────────── */}
      {showStage2 && (
        <section className="card irony-stage-section">
          <div className="section-label">Step 2 · Write a prompt for the LLM</div>

          <p className="explainer">
            The same 20 tweets will be sent to{" "}
            <span className="model-pill">Qwen2.5-0.5B-Instruct</span> one at a
            time, each inserted where you place the <code>{"{TWEET}"}</code>{" "}
            placeholder. The model's response will be parsed for "irony" or
            "non_irony". Edit the template below — or leave it as-is — then
            click <strong>Run LLM</strong>.
          </p>

          <label className="input-label" htmlFor="prompt-template">
            Prompt template
          </label>
          <textarea
            id="prompt-template"
            className="irony-prompt-textarea"
            rows={12}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={showStage3}
            spellCheck={false}
          />
          <p className="explainer irony-placeholder-hint">
            The placeholder <code>{"{TWEET}"}</code> will be substituted with
            each tweet's text before sending to the model.
          </p>

          {stage === "write_prompt" ? (
            <button
              className="encode-btn"
              disabled={!customPrompt.includes("{TWEET}")}
              onClick={() => advanceTo("run_llm")}
            >
              Run LLM on all {TOTAL} tweets →
            </button>
          ) : (
            <span className="irony-submitted-pill">✓ Submitted</span>
          )}
        </section>
      )}

      {/* ── Stage 3: Running LLM ─────────────────────────────────────────── */}
      {showStage3 && (
        <section className="card irony-stage-section irony-run-section">
          <div className="section-label">Step 3 · Running the LLM</div>

          {llmError && (
            <p className="irony-error">Error: {llmError}</p>
          )}

          {modelReady === false && (
            <>
              <p className="explainer">Downloading model weights (first run only — ~250 MB)…</p>
              <div className="progress-list">
                {progressItems.map((item) => (
                  <div key={item.file} className="progress-wrap">
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${item.progress ?? 0}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {item.file}
                      {item.total
                        ? ` — ${(item.loaded / 1e6).toFixed(1)} / ${(item.total / 1e6).toFixed(1)} MB`
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {(modelReady === true || isReveal) && (
            <>
              <p className="explainer">
                {isReveal
                  ? `Classified all ${TOTAL} tweets.`
                  : `Classifying tweet ${llmProgress.current} / ${llmProgress.total}…`}
              </p>
              <ProgressBar
                value={llmProgress.current}
                max={llmProgress.total}
                label={`${llmProgress.current} / ${llmProgress.total}`}
              />
              {!isReveal && currentTweetIdx < TOTAL && (
                <div className="irony-current-tweet">
                  <span className="input-label">Current tweet:</span>
                  <p className="irony-tweet-text">
                    {IRONY_DATASET[currentTweetIdx]?.text}
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ── Stage 4: Reveal ───────────────────────────────────────────────── */}
      {showStage4 && llmLabels && (
        <section className="card irony-stage-section irony-reveal-section">
          <div className="section-label">Step 4 · Compare all four label sets</div>

          {studentName && (
            <p className="irony-student-name-print">
              Student: <strong>{studentName}</strong>
            </p>
          )}

          {/* 4a. Per-tweet comparison table */}
          <h3 className="irony-subsection-title">Per-tweet comparison</h3>
          <div className="irony-table-scroll">
            <table className="irony-comparison-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tweet</th>
                  <th>You</th>
                  <th>LLM</th>
                  <th>RoBERTa</th>
                  <th>Ground truth</th>
                </tr>
              </thead>
              <tbody>
                {IRONY_DATASET.map((item, i) => {
                  const truth = item.ground_truth;
                  const human = humanLabels[i] ?? "unparseable";
                  const llm = llmLabels[i]?.label ?? "unparseable";
                  const rob = item.roberta_label;
                  return (
                    <tr key={item.id}>
                      <td className="irony-col-id">{item.id + 1}</td>
                      <td
                        className={`irony-col-tweet${expandedTweet === i ? " irony-col-tweet--expanded" : ""}`}
                        onClick={() => setExpandedTweet(expandedTweet === i ? null : i)}
                        title="Click to expand"
                      >
                        {item.text}
                      </td>
                      <td className={`irony-col-label ${labelCellClass(human, truth)}`}>
                        {labelDisplay(human)}
                      </td>
                      <td className={`irony-col-label ${labelCellClass(llm, truth)}`}>
                        {labelDisplay(llm)}
                      </td>
                      <td className={`irony-col-label ${labelCellClass(rob, truth)}`}>
                        {labelDisplay(rob)}
                      </td>
                      <td className="irony-col-label irony-col-truth">
                        {labelDisplay(truth)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4b. Descriptive statistics */}
          <h3 className="irony-subsection-title">Descriptive statistics</h3>
          {(() => {
            const raters = [
              { name: "You", labels: humanArr },
              { name: "LLM", labels: llmLabelArr },
              { name: "RoBERTa", labels: roberta },
              { name: "Ground truth", labels: groundTruth },
            ];
            const hasUnparseable = raters.some(
              (r) => labelCounts(r.labels).unparseable > 0
            );
            return (
              <table className="irony-stats-table">
                <thead>
                  <tr>
                    <th>Rater</th>
                    <th>% Irony</th>
                    <th>% Not irony</th>
                    {hasUnparseable && <th>% Unparseable</th>}
                    <th>Accuracy vs. truth</th>
                  </tr>
                </thead>
                <tbody>
                  {raters.map(({ name, labels }) => {
                    const counts = labelCounts(labels);
                    const acc = accuracy(labels, groundTruth);
                    return (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{pct(counts.irony, counts.total)}</td>
                        <td>{pct(counts.non_irony, counts.total)}</td>
                        {hasUnparseable && <td>{pct(counts.unparseable, counts.total)}</td>}
                        <td>
                          {name === "Ground truth"
                            ? "—"
                            : `${fmtPct(acc.acc)} (n=${acc.n_compared})`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );
          })()}

          {/* 4c. Pairwise κ matrix */}
          <h3 className="irony-subsection-title">Pairwise agreement (Cohen's κ)</h3>
          <p className="explainer">
            Each cell shows Cohen's κ (inter-rater agreement adjusted for chance)
            and raw % agreement. Unparseable responses are excluded from each pair.
          </p>
          <KappaMatrix
            raters={[
              { name: "You", labels: humanArr },
              { name: "LLM", labels: llmLabelArr },
              { name: "RoBERTa", labels: roberta },
              { name: "Truth", labels: groundTruth },
            ]}
          />

          {/* 4d. Confusion matrix sparklines */}
          <h3 className="irony-subsection-title">Confusion matrices vs. ground truth</h3>
          <p className="explainer irony-cm-note">
            I = Irony (positive class), N = Not irony (negative class).
            Green = correct, red = error.
          </p>
          <div className="irony-cm-row">
            <ConfusionMini predicted={humanArr} truth={groundTruth} title="You" />
            <ConfusionMini predicted={llmLabelArr} truth={groundTruth} title="LLM" />
            <ConfusionMini predicted={roberta} truth={groundTruth} title="RoBERTa" />
          </div>

          {/* 4e. Reflection */}
          <h3 className="irony-subsection-title">Your reflection</h3>
          <p className="explainer">
            Where did you and the LLM disagree — and who was right? Where did
            RoBERTa and the LLM disagree — why? What kind of ironic statement was
            hardest for which rater? What would you change about your prompt if you
            did this again?
          </p>
          <textarea
            className="irony-reflection-textarea"
            rows={8}
            placeholder="Write your reflection here…"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          />

          {/* 4f. Print */}
          <div className="irony-print-row no-print">
            <button
              className="secondary-btn"
              onClick={() => window.print()}
            >
              Print to PDF
            </button>
            <span className="explainer">
              In your browser's print dialog, choose "Save as PDF" as the destination.
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
