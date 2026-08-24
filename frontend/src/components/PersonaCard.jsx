// src/components/PersonaCard.jsx
// Displays a saved persona in a card with trait bars and action buttons

import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const TRAIT_COLORS = {
  confidence: { bg: "bg-gradient-to-r from-yellow-600 to-yellow-500", text: "text-yellow-400", glow: "rgba(234, 179, 8, 0.3)" },
  empathy:    { bg: "bg-gradient-to-r from-pink-600 to-pink-500",   text: "text-pink-400",   glow: "rgba(236, 72, 153, 0.3)" },
  aggression: { bg: "bg-gradient-to-r from-red-600 to-red-500",    text: "text-red-400",    glow: "rgba(239, 68, 68, 0.3)" },
  humor:      { bg: "bg-gradient-to-r from-emerald-600 to-emerald-500",text: "text-emerald-400", glow: "rgba(52, 211, 153, 0.3)" },
};

function MiniTraitBar({ label, value, colors, animate }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-semibold text-forge-muted tracking-wide">{label}</span>
        <span className={`text-[10px] font-mono font-bold ${colors.text}`}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-forge-border/60 overflow-hidden">
        <div
          className={`h-full rounded-full ${colors.bg} transition-all duration-1000 ease-out`}
          style={{
            width: animate ? `${value}%` : "0%",
            boxShadow: animate ? `0 0 8px ${colors.glow}` : "none",
          }}
        />
      </div>
    </div>
  );
}

export default function PersonaCard({ persona, onDelete, index = 0 }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [traitsAnimated, setTraitsAnimated] = useState(false);
  const cardRef = useRef(null);

  // Intersection observer to trigger entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Delay trait bars to animate after card appears
          setTimeout(() => setTraitsAnimated(true), 300 + (index * 80));
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  const { _id, name, description, traits, createdAt } = persona;
  const created = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
  });

  return (
    <div
      ref={cardRef}
      className={`gradient-border forge-card p-5 flex flex-col gap-4 relative overflow-hidden bg-forge-card/35 backdrop-blur-md border border-forge-border/80 rounded-2xl shadow-md hover-lift hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-950/20
        ${isVisible ? "animate-fade-up" : "opacity-0"}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Glare border light */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar circle with initials */}
          <div className="w-10 h-10 rounded-xl bg-violet-650/15 border border-violet-500/30
                          flex items-center justify-center flex-shrink-0 shadow-inner
                          animate-glow-pulse">
            <span className="text-violet-300 font-display font-bold text-sm">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-forge-text tracking-wide">{name}</h3>
            <p className="text-[10px] text-forge-muted font-medium mt-0.5">Forged {created}</p>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(_id)}
          className="text-forge-muted hover:text-red-400 border border-transparent hover:border-red-900/30 hover:bg-red-950/20 transition-all duration-300 p-1.5 rounded-xl cursor-pointer hover:scale-110"
          title="Delete persona"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Description */}
      {description ? (
        <p className="text-xs text-forge-muted leading-relaxed line-clamp-2 min-h-[32px]">{description}</p>
      ) : (
        <p className="text-xs text-forge-muted italic leading-relaxed line-clamp-2 min-h-[32px]">No description defined for this simulator state.</p>
      )}

      {/* Mini trait bars */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-forge-border/40 pt-3">
        {Object.entries(traits).map(([key, val]) => (
          <MiniTraitBar
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            value={val}
            colors={TRAIT_COLORS[key] || { bg: "bg-violet-500", text: "text-violet-400", glow: "rgba(124, 58, 237, 0.3)" }}
            animate={traitsAnimated}
          />
        ))}
      </div>

      {/* Chat button */}
      <button
        onClick={() => navigate(`/chat/${_id}`)}
        className="btn-primary w-full mt-1.5 bg-gradient-to-tr from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-550 shadow-md shadow-violet-950/15 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-display cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Initiate Chat
      </button>
    </div>
  );
}
