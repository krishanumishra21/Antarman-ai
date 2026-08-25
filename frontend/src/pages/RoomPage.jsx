// src/pages/RoomPage.jsx
// Immersive multi-persona group chat page

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MessageBubble from "../components/MessageBubble";
import TypingIndicator from "../components/TypingIndicator";
import { getRoom, sendRoomMessage, triggerRoomInteraction } from "../utils/api";

const TRAIT_META = {
  confidence: { icon: "⚡", label: "Confidence", fill: "#eab308" },
  empathy:    { icon: "💜", label: "Empathy",    fill: "#ec4899" },
  aggression: { icon: "🔥", label: "Aggression", fill: "#ef4444" },
  humor:      { icon: "😄", label: "Humor",      fill: "#22c55e" },
};

const getMoodState = (traits) => {
  if (!traits) return { label: "Balanced Node", icon: "🧬", color: "text-violet-400" };
  const { confidence, empathy, aggression, humor } = traits;
  
  let maxTrait = "confidence";
  let maxVal = -1;
  for (const [key, val] of Object.entries(traits)) {
    if (val > maxVal) {
      maxVal = val;
      maxTrait = key;
    }
  }
  
  const moods = {
    confidence: {
      label: confidence >= 70 ? "Self-Assured" : "Deliberate",
      icon: "⚡",
      color: "text-yellow-400"
    },
    empathy: {
      label: empathy >= 70 ? "Receptive" : "Detached",
      icon: "🌸",
      color: "text-pink-400"
    },
    aggression: {
      label: aggression >= 60 ? "Fierce" : "Pacifist",
      icon: "🔥",
      color: "text-red-400"
    },
    humor: {
      label: humor >= 60 ? "Witty" : "Serious",
      icon: "😄",
      color: "text-emerald-400"
    }
  };
  
  return moods[maxTrait];
};

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingPersona, setTypingPersona] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // ── Load Room details ───────────────────────────────────────────────────
  const fetchRoomDetails = useCallback(async () => {
    try {
      const { data } = await getRoom(roomId);
      setRoom(data.room);
      setMessages(data.room.messages || []);
      setPersonas(data.room.personaIds || []);
    } catch (err) {
      setError("Failed to load room details.");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoomDetails();
  }, [fetchRoomDetails]);

  // ── Speech Recognition setup ───────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // ── Auto scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Speak sequential helper ──────────────────────────────────────────────
  const speakSequential = async (newResponses) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    for (const res of newResponses) {
      await new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(res.content);
        
        if (res.updatedTraits) {
          const { confidence, empathy, aggression } = res.updatedTraits;
          utterance.rate = 0.95 + (aggression / 100) * 0.4;
          utterance.pitch = 1.0 - (empathy / 100) * 0.15;
          if (confidence > 75) utterance.rate += 0.1;
        }

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });
    }
  };

  // ── Send Message ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setInput("");
    setError("");

    // Optimistically add user message
    const userMsg = {
      role: "user",
      content: text,
      senderName: "You",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setTypingPersona("Personas are formulating responses...");

    try {
      const { data } = await sendRoomMessage(roomId, text);
      setMessages(data.messages);

      // Update persona traits from new responses
      if (data.newResponses) {
        setPersonas((prevPersonas) =>
          prevPersonas.map((p) => {
            const match = data.newResponses.find((nr) => nr.personaId === p._id);
            return match ? { ...p, traits: match.updatedTraits } : p;
          })
        );

        if (autoSpeak) {
          speakSequential(data.newResponses);
        }
      }
    } catch (err) {
      setError("Error sending message to group.");
    } finally {
      setIsTyping(false);
      setTypingPersona("");
    }
  };

  // ── Let Them Discuss (AI-to-AI dialogue) ───────────────────────────────
  const handleDiscussion = async () => {
    if (isTyping) return;

    setError("");
    setIsTyping(true);
    setTypingPersona("Initiating AI debate...");

    try {
      const { data } = await triggerRoomInteraction(roomId);
      setMessages(data.messages);

      // Update traits
      if (data.newResponses) {
        setPersonas((prevPersonas) =>
          prevPersonas.map((p) => {
            const match = data.newResponses.find((nr) => nr.personaId === p._id);
            return match ? { ...p, traits: match.updatedTraits } : p;
          })
        );

        if (autoSpeak) {
          speakSequential(data.newResponses);
        }
      }
    } catch (err) {
      setError("Discussion failed.");
    } finally {
      setIsTyping(false);
      setTypingPersona("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen gap-3 text-forge-muted">
        <span className="w-6 h-6 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
        Loading Room...
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="max-w-md mx-auto mt-20 glassmorphism p-6 text-center text-red-400 border border-red-500/20">
        <p className="text-lg mb-2">⚠️ Error Loading Room</p>
        <p className="text-sm text-forge-muted">{error}</p>
        <Link to="/" className="btn-ghost mt-4 inline-block text-xs border-forge-border/60">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] h-[calc(100dvh-64px)] relative z-10">
      
      {/* ── Mobile Sidebar Overlay Backdrop ── */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* ── Left Sidebar: Room Personas list & Traits ── */}
      <div className={`${showSidebar ? "flex fixed inset-y-0 left-0 w-72 h-full z-40 bg-[#0c0c12]/95 shadow-2xl" : "hidden"}
                        lg:flex lg:static lg:h-auto flex-col w-72 flex-shrink-0 border-r border-forge-border/40
                        bg-forge-surface/15 backdrop-blur-md p-4 overflow-y-auto space-y-6 lg:z-10 custom-scrollbar animate-slide-left`}
      >
        {/* Mobile close button */}
        <button
          className="lg:hidden flex items-center gap-2 text-sm text-forge-muted hover:text-forge-text
                     transition-all duration-300 pb-3 border-b border-forge-border/40 group cursor-pointer"
          onClick={() => setShowSidebar(false)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Close Panel
        </button>

        <div>
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-forge-muted select-none">
            Active Personas
          </h3>
          <p className="text-[10px] text-forge-muted mt-0.5">
            Evolving in real-time.
          </p>
        </div>

        <div className="space-y-5">
          {personas.map((p) => {
            const mood = getMoodState(p.traits);
            return (
              <div key={p._id} className="glassmorphism p-3.5 space-y-3.5 border border-forge-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-forge-card border border-forge-border/60 flex items-center justify-center font-display font-bold text-xs">
                    {p.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-forge-text truncate">{p.name}</h4>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold ${mood.color}`}>
                      {mood.icon} {mood.label}
                    </span>
                  </div>
                </div>

                {/* Micro Trait Bars */}
                <div className="space-y-2 pt-1 border-t border-forge-border/30">
                  {Object.entries(TRAIT_META).map(([key, meta]) => {
                    const value = p.traits?.[key] ?? 50;
                    return (
                      <div key={key} className="space-y-0.5">
                        <div className="flex justify-between text-[9px] font-mono">
                          <span className="text-forge-muted">{meta.icon} {meta.label}</span>
                          <span style={{ color: meta.fill }}>{Math.round(value)}</span>
                        </div>
                        <div className="h-1 rounded-full bg-forge-border overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${value}%`, background: meta.fill, opacity: 0.8 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex flex-col h-full bg-forge-surface/5 min-w-0">
        
        {/* Chat Header */}
        <div className="h-14 border-b border-forge-border/40 bg-forge-surface/20 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="p-2 rounded-xl text-forge-muted hover:text-forge-text hover:bg-forge-card transition-all duration-200 shrink-0"
              title="Return Home"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            {/* Mobile sidebar toggle button */}
            <button
              onClick={() => setShowSidebar((prev) => !prev)}
              className="lg:hidden text-forge-muted hover:text-forge-text p-1.5 rounded-lg border border-forge-border/40 bg-forge-card/45 cursor-pointer hover:scale-105 transition-all shrink-0"
              title="Toggle personas panel"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4.5 h-4.5">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="min-w-0">
              <h2 className="font-display font-bold text-sm text-forge-text tracking-wide truncate">
                {room?.name}
              </h2>
              <p className="text-[10px] text-forge-muted mt-0.5">
                Group Room Chat · {personas.length} participants
              </p>
            </div>
          </div>

          {/* Settings dropdown toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl text-forge-muted hover:text-forge-text hover:bg-forge-card transition-all duration-200 cursor-pointer"
              title="Settings"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showSettings && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowSettings(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-[#12121a] border border-forge-border rounded-xl shadow-xl z-40 py-1.5 animate-scale-in">
                  <div className="px-3 py-1.5 text-[9px] uppercase font-bold text-forge-muted tracking-wider border-b border-forge-border/40">
                    Voice Settings
                  </div>
                  <button
                    onClick={() => setAutoSpeak((prev) => !prev)}
                    className="w-full text-left px-3 py-2.5 text-xs text-forge-text hover:bg-forge-card/85 transition-all duration-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Auto Speak Room
                    </span>
                    <span className={`w-8 h-5 rounded-full p-0.5 transition-colors duration-300 relative inline-block ${autoSpeak ? "bg-violet-600" : "bg-forge-border"}`}>
                      <span className={`w-4 h-4 rounded-full bg-white transition-all duration-300 absolute ${autoSpeak ? "translate-x-3" : "translate-x-0"}`} />
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-650/10 border border-violet-500/25 flex items-center justify-center text-xl shadow-lg">
                👥
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="font-display font-bold text-forge-text text-sm">
                  Welcome to the Room Workspace
                </h3>
                <p className="text-xs text-forge-muted">
                  Type a message below to prompt replies from all personas, or tap 'Let Them Discuss' to witness them chat with each other!
                </p>
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <MessageBubble
                key={idx}
                role={m.role}
                content={m.content}
                timestamp={m.timestamp}
                personaName={m.senderName}
                personaTraits={m.traitSnapshot}
              />
            ))
          )}

          {isTyping && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-violet-400 font-mono pl-12 animate-pulse">
                {typingPersona}
              </span>
              <TypingIndicator />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="flex-shrink-0 border-t border-forge-border/80 bg-[#0c0c12]/80 backdrop-blur-md px-6 py-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-3 items-stretch md:items-end">
            
            {/* Let Them Discuss Button */}
            <button
              onClick={handleDiscussion}
              disabled={messages.length === 0 || isTyping}
              className="flex-shrink-0 bg-violet-650/10 hover:bg-violet-650/20 text-violet-300 border border-violet-500/35 hover:border-violet-500/60 rounded-2xl h-12.5 px-4.5 text-xs font-bold transition-all duration-350 cursor-pointer shadow-sm hover:shadow-violet-950/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group animate-pulse-gentle"
              title="Let AI personas respond to each other"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 transform group-hover:rotate-12 transition-transform duration-350">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Let Them Discuss
            </button>

            {/* Input Form */}
            <div className="flex-1 flex gap-3 items-end">
              <div className="flex-1 glow-border rounded-2xl bg-forge-surface/30 backdrop-blur-sm transition-all duration-300 border border-forge-border/60 flex items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? "Listening..." : "Speak to the room…"}
                  rows={1}
                  disabled={isTyping}
                  className="flex-1 bg-transparent pl-4 pr-2 py-3.5 text-sm text-forge-text
                             placeholder-forge-muted resize-none outline-none
                             disabled:opacity-50 max-h-36"
                  style={{ fieldSizing: "content" }}
                />
                <button
                  onClick={toggleListening}
                  disabled={isTyping}
                  className={`p-3 mr-1.5 mb-1.5 rounded-xl cursor-pointer hover:bg-forge-card/50 transition-all duration-300 flex items-center justify-center relative group shrink-0
                    ${isListening ? "text-red-400" : "text-forge-muted hover:text-forge-text"}`}
                  title={isListening ? "Stop listening" : "Speech to Text"}
                >
                  {isListening && (
                    <span className="absolute inset-0 rounded-xl bg-red-500/10 animate-ping" />
                  )}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                    <path d="M19 10v1a7 7 0 01-14 0v-1M12 19v4M8 23h8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="btn-primary h-12.5 w-12.5 p-0 rounded-2xl flex-shrink-0 group cursor-pointer bg-gradient-to-tr from-violet-650 to-indigo-650 hover:from-violet-500 hover:to-indigo-550 flex items-center justify-center"
                title="Send (Enter)"
              >
                {isTyping ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>

          </div>

          <p className="text-center text-[10px] text-forge-muted mt-2.5 select-none">
            Send message to get responses from all personas in order · 'Let Them Discuss' lets AI dialogue with itself
          </p>
        </div>

      </div>

    </div>
  );
}
