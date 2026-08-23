// src/components/MessageBubble.jsx
// Renders a single chat message — styled with premium gradients and shadows

export default function MessageBubble({ role, content, timestamp, personaName }) {
  const isUser = role === "user";
  const time   = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`flex gap-3.5 animate-fade-up ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold font-display shadow-md transition-all duration-300
          ${isUser
            ? "bg-gradient-to-br from-violet-500 to-indigo-650 text-white shadow-violet-950/25 ring-2 ring-violet-500/10"
            : "bg-violet-600/15 text-violet-300 border border-violet-600/35 shadow-indigo-950/15 ring-2 ring-violet-500/5"
          }`}
      >
        {isUser ? "U" : (personaName?.charAt(0)?.toUpperCase() || "A")}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1.5 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Sender label + Time */}
        <div className="flex items-center gap-2 px-1 text-[10px] font-semibold text-forge-muted uppercase tracking-wider">
          <span>{isUser ? "You" : personaName || "AI"}</span>
          {time && <span className="text-[9px] font-normal lowercase opacity-75">· {time}</span>}
        </div>

        {/* Message content */}
        <div
          className={`px-4.5 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-lg transition-all duration-300
            ${isUser
              ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-none hover:shadow-violet-900/15"
              : "bg-gradient-to-br from-forge-card to-[#12121e]/90 border border-forge-border/80 text-forge-text rounded-tl-none hover:border-violet-600/20 hover:shadow-black/20"
            }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
