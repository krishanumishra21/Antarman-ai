// src/components/MessageBubble.jsx
// Renders a single chat message — styled differently for user vs AI

export default function MessageBubble({ role, content, timestamp, personaName }) {
  const isUser = role === "user";
  const time   = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`flex gap-3 animate-fade-up ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold font-display
          ${isUser
            ? "bg-violet-600 text-white"
            : "bg-forge-border text-forge-muted border border-forge-border"
          }`}
      >
        {isUser ? "U" : (personaName?.charAt(0)?.toUpperCase() || "A")}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Sender label */}
        <span className="text-xs text-forge-muted px-1">
          {isUser ? "You" : personaName || "AI"}
        </span>

        {/* Message content */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
            ${isUser
              ? "bg-violet-600 text-white rounded-tr-sm"
              : "bg-forge-card border border-forge-border text-forge-text rounded-tl-sm"
            }`}
        >
          {content}
        </div>

        {/* Timestamp */}
        {time && (
          <span className="text-xs text-forge-muted px-1">{time}</span>
        )}
      </div>
    </div>
  );
}
