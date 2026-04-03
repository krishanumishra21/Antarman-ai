// src/components/PersonaCard.jsx
// Displays a saved persona in a card with trait bars and action buttons

import { useNavigate } from "react-router-dom";

const TRAIT_COLORS = {
  confidence: { bg: "bg-yellow-500", text: "text-yellow-400" },
  empathy:    { bg: "bg-pink-500",   text: "text-pink-400"   },
  aggression: { bg: "bg-red-500",    text: "text-red-400"    },
  humor:      { bg: "bg-emerald-500",text: "text-emerald-400"},
};

function MiniTraitBar({ label, value, colors }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-forge-muted">{label}</span>
        <span className={`text-xs font-mono font-bold ${colors.text}`}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-forge-border overflow-hidden">
        <div
          className={`h-full rounded-full ${colors.bg} opacity-80`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function PersonaCard({ persona, onDelete }) {
  const navigate = useNavigate();

  const { _id, name, description, traits, createdAt } = persona;
  const created = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
  });

  return (
    <div className="forge-card p-5 flex flex-col gap-4 hover:border-violet-700/50 transition-all duration-200
                    hover:shadow-lg hover:shadow-violet-900/20 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar circle with initials */}
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-600/30
                          flex items-center justify-center flex-shrink-0">
            <span className="text-violet-300 font-display font-bold text-sm">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-display font-semibold text-forge-text leading-tight">{name}</h3>
            <p className="text-xs text-forge-muted mt-0.5">Created {created}</p>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(_id)}
          className="text-forge-muted hover:text-red-400 transition-colors p-1 rounded"
          title="Delete persona"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-forge-muted leading-relaxed line-clamp-2">{description}</p>
      )}

      {/* Mini trait bars */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {Object.entries(traits).map(([key, val]) => (
          <MiniTraitBar
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            value={val}
            colors={TRAIT_COLORS[key] || { bg: "bg-violet-500", text: "text-violet-400" }}
          />
        ))}
      </div>

      {/* Chat button */}
      <button
        onClick={() => navigate(`/chat/${_id}`)}
        className="btn-primary w-full mt-1"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Chat with {name}
      </button>
    </div>
  );
}
