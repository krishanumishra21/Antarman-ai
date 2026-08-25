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

const getMoodState = (traits) => {
  if (!traits) return { label: "Balanced Node", desc: "Traits are in equilibrium.", color: "text-violet-400 border-violet-550/20 bg-violet-500/5", icon: "🧬" };
  const { confidence, empathy, aggression, humor } = traits;
  
  let maxTrait = "confidence";
  let maxVal = -1;
  for (const [key, val] of Object.entries(traits)) {
    if (val > maxVal) {
      maxVal = val;
      maxTrait = key;
    }
  }
  
  const moods = {
    confidence: {
      label: confidence >= 70 ? "Self-Assured & Direct" : "Analytical & Hesitant",
      desc: confidence >= 70 ? "Exuding certainty and conversational control." : "Processing inputs with deliberate care.",
      color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
      icon: "⚡"
    },
    empathy: {
      label: empathy >= 70 ? "Warm & Receptive" : "Objective & Detached",
      desc: empathy >= 70 ? "Highly responsive to user emotional cues." : "Minimizing emotional feedback bias.",
      color: "text-pink-400 border-pink-500/20 bg-pink-500/5",
      icon: "🌸"
    },
    aggression: {
      label: aggression >= 60 ? "Aggressive & Fierce" : "Gentle & Pacifist",
      desc: aggression >= 60 ? "Challenging assertions directly." : "Avoiding conflict, prioritizing harmony.",
      color: "text-red-400 border-red-500/20 bg-red-500/5",
      icon: "🔥"
    },
    humor: {
      label: humor >= 60 ? "Witty & Playful" : "Serious & Formal",
      desc: humor >= 60 ? "Decompressing thoughts with humor." : "Expressing logical thoughts strictly.",
      color: "text-emerald-450 border-emerald-500/20 bg-emerald-500/5",
      icon: "😄"
    }
  };
  
  return moods[maxTrait];
};

export default function TraitEvolutionPanel({ currentTraits, initialTraits, messageCount, traitHistory = [] }) {
  const [activeTab, setActiveTab] = useState("sliders"); // "sliders" or "analytics"

  if (!currentTraits) return null;

  const hasEvolved = Object.keys(currentTraits).some(
    (k) => Math.abs(currentTraits[k] - (initialTraits?.[k] ?? currentTraits[k])) >= 1
  );

  const mood = getMoodState(currentTraits);

  return (
    <div className="glassmorphism p-5 space-y-4 rounded-2xl border border-forge-border/40">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-sm text-forge-text tracking-wide">
          Neural State
        </h3>
        {hasEvolved && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-600/25 text-violet-300 border border-violet-500/20">
            Evolved
          </span>
        )}
      </div>

      {/* Mood Diagnostic Box */}
      <div className={`p-3 rounded-xl border flex gap-3 animate-fade-in ${mood.color}`}>
        <span className="text-xl select-none shrink-0 self-center">{mood.icon}</span>
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider">{mood.label}</p>
          <p className="text-[10px] text-forge-muted leading-relaxed font-medium">{mood.desc}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-[#0c0c12]/60 rounded-xl p-1 border border-forge-border/60">
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
