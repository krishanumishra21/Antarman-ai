// src/components/TraitSlider.jsx
// A single labelled slider for one personality trait (0–100)

const TRAIT_META = {
  confidence: {
    label: "Confidence",
    icon:  "⚡",
    low:   "Hesitant",
    high:  "Assertive",
    color: "from-yellow-600 to-yellow-400",
    track: "#854d0e",
    fill:  "#eab308",
  },
  empathy: {
    label: "Empathy",
    icon:  "💜",
    low:   "Cold",
    high:  "Warm",
    color: "from-pink-700 to-pink-400",
    track: "#831843",
    fill:  "#ec4899",
  },
  aggression: {
    label: "Aggression",
    icon:  "🔥",
    low:   "Gentle",
    high:  "Fierce",
    color: "from-red-700 to-red-400",
    track: "#7f1d1d",
    fill:  "#ef4444",
  },
  humor: {
    label: "Humor",
    icon:  "😄",
    low:   "Serious",
    high:  "Hilarious",
    color: "from-emerald-700 to-emerald-400",
    track: "#14532d",
    fill:  "#22c55e",
  },
};

export default function TraitSlider({ trait, value, onChange, disabled }) {
  const meta = TRAIT_META[trait] || {};

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-forge-text font-display">
          <span>{meta.icon}</span>
          {meta.label}
        </span>
        {/* Numeric badge */}
        <span
          className="min-w-[2.5rem] text-center text-xs font-mono font-bold rounded-md px-2 py-0.5"
          style={{ background: meta.track + "55", color: meta.fill }}
        >
          {value}
        </span>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(trait, Number(e.target.value))}
          disabled={disabled}
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            // Dynamic gradient fill behind the thumb
            background: `linear-gradient(to right, ${meta.fill} 0%, ${meta.fill} ${value}%, #2A2A3E ${value}%, #2A2A3E 100%)`,
          }}
        />
      </div>

      {/* Low / High labels */}
      <div className="flex justify-between text-xs text-forge-muted">
        <span>{meta.low}</span>
        <span>{meta.high}</span>
      </div>
    </div>
  );
}
