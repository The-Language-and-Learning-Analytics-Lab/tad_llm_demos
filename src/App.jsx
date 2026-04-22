import { useState, lazy, Suspense } from "react";
import "./App.css";

const EmbeddingDemo = lazy(() => import("./EmbeddingDemo.jsx"));
const TokenSamplingDemo = lazy(() => import("./TokenSamplingDemo.jsx"));
const TokenizerDemo = lazy(() => import("./TokenizerDemo.jsx"));
const AnalogyDemo = lazy(() => import("./AnalogyDemo.jsx"));
const IronyAssignmentDemo = lazy(() => import("./IronyAssignmentDemo.jsx"));

const TABS = [
  { id: "tokenizer", label: "Tokenizer" },
  { id: "embeddings", label: "Sentence Embeddings" },
  { id: "analogies", label: "Word Analogies" },
  { id: "token-sampling", label: "Token Sampling" },
  { id: "irony", label: "Assignment: Irony Detection" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("tokenizer");
  return (
    <div className="app">
      <nav className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn${activeTab === t.id ? " tab-btn--active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <Suspense fallback={<div>Loading…</div>}>
        {activeTab === "embeddings" && <EmbeddingDemo />}
        {activeTab === "token-sampling" && <TokenSamplingDemo />}
        {activeTab === "tokenizer" && <TokenizerDemo />}
        {activeTab === "analogies" && <AnalogyDemo />}
        {activeTab === "irony" && <IronyAssignmentDemo />}
      </Suspense>
    </div>
  );
}
