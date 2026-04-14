import { useState } from "react";
import EmbeddingDemo from "./EmbeddingDemo.jsx";
import TokenSamplingDemo from "./TokenSamplingDemo.jsx";
import "./App.css";

const TABS = [
  { id: "embeddings", label: "Sentence Embeddings" },
  { id: "token-sampling", label: "Token Sampling" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("embeddings");
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
      {activeTab === "embeddings" && <EmbeddingDemo />}
      {activeTab === "token-sampling" && <TokenSamplingDemo />}
    </div>
  );
}
