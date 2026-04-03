// src/components/TypingIndicator.jsx
// Animated "AI is thinking" indicator shown while waiting for a response

export default function TypingIndicator({ personaName }) {
  return (
    <div className="flex gap-3 items-end animate-fade-up">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-forge-border border border-forge-border
                      flex items-center justify-center text-xs font-bold font-display text-forge-muted flex-shrink-0">
        {personaName?.charAt(0)?.toUpperCase() || "A"}
      </div>

      <div className="flex flex-col gap-1 items-start">
        <span className="text-xs text-forge-muted px-1">{personaName || "AI"}</span>

        {/* Bubble with animated dots */}
        <div className="bg-forge-card border border-forge-border rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      </div>
    </div>
  );
}
