// src/components/TraitEvolutionPanel.jsx
// Shows the live/updated trait values in the chat sidebar.
// Highlights traits that changed since the conversation started.

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
    <div className="space-y-1.5">
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

export default function TraitEvolutionPanel({ currentTraits, initialTraits, messageCount }) {
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
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-600/30">
            Evolved
          </span>
        )}
      </div>

      {/* Trait rows */}
      <div className="space-y-3">
        {Object.entries(currentTraits).map(([key, val]) => (
          <TraitRow
            key={key}
            traitKey={key}
            value={val}
            initialValue={initialTraits?.[key] ?? val}
          />
        ))}
      </div>

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
