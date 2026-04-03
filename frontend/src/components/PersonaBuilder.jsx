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
    <div className="forge-card p-6 space-y-6">
      {/* Section title */}
      <div>
        <h2 className="font-display font-bold text-xl text-forge-text">Build a Persona</h2>
        <p className="text-forge-muted text-sm mt-1">
          Craft an AI personality with unique traits that evolve as you chat.
        </p>
      </div>

      {/* Preset buttons */}
      <div>
        <p className="text-xs text-forge-muted font-semibold uppercase tracking-widest mb-2">
          Quick Presets
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="text-left text-xs px-3 py-2 rounded-xl border border-forge-border
                         hover:border-violet-600/50 hover:bg-violet-600/10 text-forge-muted
                         hover:text-forge-text transition-all duration-150"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Name input */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold font-display text-forge-text">
          Persona Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Nova, Rex, Lyra…"
          maxLength={60}
          className="w-full bg-forge-surface border border-forge-border rounded-xl px-4 py-2.5
                     text-forge-text placeholder-forge-muted text-sm outline-none
                     focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
        />
      </div>

      {/* Description input */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold font-display text-forge-text">
          Backstory / Description
          <span className="text-forge-muted font-normal ml-1">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Give your persona a backstory or role…"
          maxLength={300}
          rows={2}
          className="w-full bg-forge-surface border border-forge-border rounded-xl px-4 py-2.5
                     text-forge-text placeholder-forge-muted text-sm outline-none resize-none
                     focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
        />
        <p className="text-right text-xs text-forge-muted">{description.length}/300</p>
      </div>

      {/* Trait sliders */}
      <div className="space-y-5">
        <p className="text-xs text-forge-muted font-semibold uppercase tracking-widest">
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
        <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm
                        rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Forging…
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Forge Persona
          </>
        )}
      </button>
    </div>
  );
}
