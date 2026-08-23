// src/components/PersonaBuilder.jsx
// The form used to create a new persona — name, description, and trait sliders

import { useState } from "react";
import TraitSlider   from "./TraitSlider";
import { createPersona } from "../utils/api";

const DEFAULT_TRAITS = {
  confidence: 50,
  empathy:    50,
  aggression: 20,
  humor:      40,
};

// Preset templates so users can start quickly
const PRESETS = [
  {
    label: "🧙 Wise Mentor",
    name: "Sage",
    description: "A calm, knowledgeable mentor who guides with wisdom and patience.",
    traits: { confidence: 70, empathy: 80, aggression: 10, humor: 30 },
  },
  {
    label: "😈 Edgy Rebel",
    name: "Riot",
    description: "A provocateur who challenges everything and pulls no punches.",
    traits: { confidence: 85, empathy: 15, aggression: 80, humor: 65 },
  },
  {
    label: "🤡 Comedian",
    name: "Chuckles",
    description: "Life's too short to be serious. Everything is a joke waiting to happen.",
    traits: { confidence: 60, empathy: 55, aggression: 10, humor: 95 },
  },
  {
    label: "🤖 Cold Analyst",
    name: "Axiom",
    description: "Pure logic, zero sentiment. Data and reason above all else.",
    traits: { confidence: 90, empathy: 5, aggression: 30, humor: 5 },
  },
];

export default function PersonaBuilder({ onCreated }) {
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [traits,      setTraits]      = useState(DEFAULT_TRAITS);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  // Update a single trait value
  const handleTraitChange = (trait, value) => {
    setTraits((prev) => ({ ...prev, [trait]: value }));
  };

  // Apply a preset template
  const applyPreset = (preset) => {
    setName(preset.name);
    setDescription(preset.description);
    setTraits(preset.traits);
  };

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) {
      setError("Please give your persona a name.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await createPersona({ name, description, traits });
      // Reset form
      setName("");
      setDescription("");
      setTraits(DEFAULT_TRAITS);
      // Notify parent to refresh the list
      onCreated(data.persona);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create persona. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forge-card p-6 space-y-6 bg-forge-card/40 backdrop-blur-md border border-forge-border/80 shadow-xl relative overflow-hidden">
      {/* Subtle card header glare line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      {/* Section title */}
      <div>
        <h2 className="font-display font-extrabold text-lg text-forge-text tracking-wide">Build a Persona</h2>
        <p className="text-forge-muted text-xs mt-1 leading-relaxed">
          Craft an AI personality with unique traits that evolve dynamically as you converse.
        </p>
      </div>

      {/* Preset buttons */}
      <div className="space-y-2">
        <p className="text-[10px] text-forge-muted font-bold uppercase tracking-widest">
          Quick Presets
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="text-left text-xs px-3 py-2.5 rounded-xl border border-forge-border bg-forge-bg/30
                         hover:border-violet-500/50 hover:bg-violet-600/10 text-forge-muted
                         hover:text-forge-text transition-all duration-200 cursor-pointer font-medium select-none"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Name input */}
      <div className="space-y-1.5 animate-fade-up">
        <label className="text-xs font-bold uppercase tracking-wider text-forge-text/80 font-display">
          Persona Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Nova, Rex, Lyra…"
          maxLength={60}
          className="w-full bg-forge-surface/50 border border-forge-border/80 rounded-xl px-4 py-2.5
                     text-forge-text placeholder-forge-muted text-sm outline-none
                     focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 focus:bg-forge-surface/80 transition-all duration-200"
        />
      </div>

      {/* Description input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-forge-text/80 font-display">
          Backstory / Description
          <span className="text-forge-muted font-normal normal-case ml-1">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Give your persona a backstory or role…"
          maxLength={300}
          rows={2}
          className="w-full bg-forge-surface/50 border border-forge-border/80 rounded-xl px-4 py-2.5
                     text-forge-text placeholder-forge-muted text-sm outline-none resize-none
                     focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 focus:bg-forge-surface/80 transition-all duration-200"
        />
        <p className="text-right text-[10px] font-mono text-forge-muted font-semibold">{description.length}/300</p>
      </div>

      {/* Trait sliders */}
      <div className="space-y-5">
        <p className="text-[10px] text-forge-muted font-bold uppercase tracking-widest">
          Personality Traits
        </p>
        {Object.keys(DEFAULT_TRAITS).map((trait) => (
          <TraitSlider
            key={trait}
            trait={trait}
            value={traits[trait]}
            onChange={handleTraitChange}
            disabled={loading}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/15 border border-red-800/40 text-red-400 text-xs
                        rounded-xl px-4 py-3 animate-pulse">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-primary w-full bg-gradient-to-tr from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-550 shadow-md shadow-violet-950/20 py-3 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Forging…</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-display tracking-wider text-xs font-bold uppercase">Forge Persona</span>
          </>
        )}
      </button>
    </div>
  );
}
