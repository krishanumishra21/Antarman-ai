// src/components/TypingIndicator.jsx
// Enhanced typing dots with glow and slide-in animation

export default function TypingIndicator({ personaName }) {
  return (
    <div className="flex gap-3.5 flex-row animate-slide-left">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl bg-violet-600/15 text-violet-300 border border-violet-600/35
                      flex items-center justify-center text-xs font-bold font-display shadow-md
                      ring-2 ring-violet-500/5 animate-glow-pulse flex-shrink-0">
        {personaName?.charAt(0)?.toUpperCase() || "A"}
      </div>

      {/* Dots */}
      <div className="flex flex-col gap-1.5 items-start">
        <div className="flex items-center gap-2 px-1 text-[10px] font-semibold text-forge-muted uppercase tracking-wider">
          <span>{personaName || "AI"}</span>
          <span className="text-[9px] font-normal lowercase opacity-75">· typing</span>
        </div>
        <div className="bg-gradient-to-br from-forge-card to-[#12121e]/90 border border-forge-border/80 rounded-2xl rounded-tl-none px-5 py-3.5 flex items-center gap-1.5 shadow-lg">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
