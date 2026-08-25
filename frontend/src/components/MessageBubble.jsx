import { useState, useEffect } from "react";

const DOMINANT_AVATAR_THEMES = {
  confidence: { bg: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" },
  empathy:    { bg: "bg-pink-500/10 border-pink-550/30 text-pink-400" },
  aggression: { bg: "bg-red-500/10 border-red-500/30 text-red-400" },
  humor:      { bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-450" },
};

const getDominantTrait = (traits) => {
  if (!traits) return "confidence";
  let maxTrait = "confidence";
  let maxVal = -1;
  for (const [key, val] of Object.entries(traits)) {
    if (val > maxVal) {
      maxVal = val;
      maxTrait = key;
    }
  }
  return maxTrait;
};

export default function MessageBubble({ role, content, timestamp, personaName, personaTraits }) {
  const isUser = role === "user";
  const time   = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeech = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text to Speech is not supported in your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      if (personaTraits) {
        const { confidence, empathy, aggression, humor } = personaTraits;
        utterance.rate = 0.95 + (aggression / 100) * 0.4;
        utterance.pitch = 1.0 - (empathy / 100) * 0.15;
        if (confidence > 75) utterance.rate += 0.1;
      }

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const dominant = getDominantTrait(personaTraits);
  const bubbleGlowClass = isUser ? "" : `border-glow-${dominant}`;
  const avatarTheme = isUser ? "" : (DOMINANT_AVATAR_THEMES[dominant] || DOMINANT_AVATAR_THEMES.confidence);

  return (
    <div className={`flex gap-3.5 ${isUser ? "flex-row-reverse animate-slide-right" : "flex-row animate-slide-left"}`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold font-display shadow-md transition-all duration-300
          ${isUser
            ? "bg-gradient-to-br from-violet-500 to-indigo-650 text-white shadow-violet-950/25 ring-2 ring-violet-500/10"
            : `border shadow-indigo-950/15 ring-2 ring-violet-500/5 animate-glow-pulse ${avatarTheme.bg} ${avatarTheme.text}`
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

          {!isUser && (
            <button
              onClick={toggleSpeech}
              className={`p-1 rounded-md hover:bg-forge-card/60 transition-colors ml-1.5 cursor-pointer
                ${isSpeaking ? "text-violet-400" : "text-forge-muted hover:text-forge-text"}`}
              title={isSpeaking ? "Stop speaking" : "Speak message"}
            >
              {isSpeaking ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Message content */}
        <div
          className={`px-5 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-lg transition-all duration-300
            ${isUser
              ? "bg-gradient-to-br from-violet-650 to-indigo-650 text-white rounded-tr-none hover:shadow-violet-900/20 hover:shadow-xl"
              : `glassmorphism rounded-tl-none text-forge-text hover:shadow-xl hover:shadow-black/20 ${bubbleGlowClass}`
            }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
