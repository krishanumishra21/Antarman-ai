import { useState } from "react";
import TraitHistoryChart from "./TraitHistoryChart";

const TRAIT_META = {
  confidence: { icon: "⚡", label: "Confidence", fill: "#eab308" },
  empathy:    { icon: "💜", label: "Empathy",    fill: "#ec4899" },
  aggression: { icon: "🔥", label: "Aggression", fill: "#ef4444" },
  humor:      { icon: "😄", label: "Humor",      fill: "#22c55e" },
};

function TraitRow({ traitKey, value, initialValue }) {
  const meta  = TRAIT_META[traitKey];
  const delta = value - initialValue;
  const changed = Math.abs(delta) >= 1;

  return (
    <div className="space-y-1.5 animate-fade-up">
      {/* Label + value */}
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-forge-muted font-medium">
          {meta.icon} {meta.label}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-mono font-bold" style={{ color: meta.fill }}>
            {Math.round(value)}
          </span>
          {/* Delta indicator */}
          {changed && (
            <span className={`text-xs font-mono ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {delta > 0 ? `+${Math.round(delta)}` : Math.round(delta)}
            </span>
          )}
        </span>
      </div>

      {/* Bar */}
      <div className="h-1.5 rounded-full bg-forge-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, background: meta.fill, opacity: 0.8 }}
        />
      </div>
    </div>
  );
}

export default function TraitEvolutionPanel({ currentTraits, initialTraits, messageCount, traitHistory = [] }) {
  const [activeTab, setActiveTab] = useState("sliders"); // "sliders" or "analytics"

  if (!currentTraits) return null;

  const hasEvolved = Object.keys(currentTraits).some(
    (k) => Math.abs(currentTraits[k] - (initialTraits?.[k] ?? currentTraits[k])) >= 1
  );

  return (
    <div className="forge-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm text-forge-text">
          Trait Evolution
        </h3>
        {hasEvolved && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-600/30">
            Evolved
          </span>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-forge-bg rounded-xl p-1 border border-forge-border">
        <button
          onClick={() => setActiveTab("sliders")}
          className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-250 cursor-pointer
            ${activeTab === "sliders"
              ? "bg-violet-600 text-white shadow-md shadow-violet-950/50"
              : "text-forge-muted hover:text-forge-text"
            }`}
        >
          Sliders
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-250 cursor-pointer
            ${activeTab === "analytics"
              ? "bg-violet-600 text-white shadow-md shadow-violet-950/50"
              : "text-forge-muted hover:text-forge-text"
            }`}
        >
          Analytics
        </button>
      </div>

      {/* Content Rendering depending on Active Tab */}
      {activeTab === "sliders" ? (
        <div className="space-y-3.5">
          {Object.entries(currentTraits).map(([key, val]) => (
            <TraitRow
              key={key}
              traitKey={key}
              value={val}
              initialValue={initialTraits?.[key] ?? val}
            />
          ))}
        </div>
      ) : (
        <div className="animate-fade-up">
          <TraitHistoryChart traitHistory={traitHistory} />
        </div>
      )}

      {/* Message count */}
      {messageCount > 0 && (
        <p className="text-xs text-forge-muted border-t border-forge-border pt-3">
          {messageCount} message{messageCount !== 1 ? "s" : ""} exchanged
        </p>
      )}

      {/* Hint */}
      {!hasEvolved && messageCount > 0 && (
        <p className="text-xs text-forge-muted italic">
          Keep chatting — traits shift based on your tone.
        </p>
      )}
    </div>
  );
}
