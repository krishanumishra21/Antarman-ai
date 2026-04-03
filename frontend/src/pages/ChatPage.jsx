// src/pages/ChatPage.jsx
// Full-screen chat interface for talking with a selected persona

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link }              from "react-router-dom";

import MessageBubble       from "../components/MessageBubble";
import TypingIndicator     from "../components/TypingIndicator";
import TraitEvolutionPanel from "../components/TraitEvolutionPanel";
import { getPersona, sendMessage } from "../utils/api";

export default function ChatPage() {
  const { id }     = useParams();    // personaId from URL
  const navigate   = useNavigate();

  // ── State ────────────────────────────────────────────────────────────────
  const [persona,       setPersona]       = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState("");
  const [isTyping,      setIsTyping]      = useState(false);
  const [chatId,        setChatId]        = useState(null);
  const [currentTraits, setCurrentTraits] = useState(null);
  const [initialTraits, setInitialTraits] = useState(null);
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(true);

  // Ref to auto-scroll chat to bottom
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);

  // ── Load persona on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return navigate("/");

    (async () => {
      try {
        const { data } = await getPersona(id);
        setPersona(data.persona);
        setCurrentTraits({ ...data.persona.traits });
        setInitialTraits({ ...data.persona.traits });
      } catch {
        setError("Persona not found.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  // ── Auto-scroll when messages change ────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Send a message ───────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setInput("");
    setError("");

    // Optimistically append user message
    const userMsg = {
      role:      "user",
      content:   text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const { data } = await sendMessage(id, text, chatId);

      // Save chat session ID for subsequent messages
      if (data.chatId) setChatId(data.chatId);

      // Append AI reply
      const aiMsg = {
        role:      "assistant",
        content:   data.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Update evolved traits
      if (data.updatedTraits) {
        setCurrentTraits(data.updatedTraits);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send message. Check your backend.");
      // Remove the optimistic user message on failure
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }, [input, isTyping, id, chatId]);

  // ── Submit on Enter (Shift+Enter = newline) ──────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Clear conversation (keeps persona, starts new chat) ──────────────────
  const handleClear = () => {
    if (!window.confirm("Start a new conversation? Current history will be cleared from view.")) return;
    setMessages([]);
    setChatId(null);
    setCurrentTraits(initialTraits ? { ...initialTraits } : null);
  };

  // ── Loading / error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] text-forge-muted gap-3">
        <span className="w-6 h-6 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
        Loading persona…
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4 text-center">
        <p className="text-2xl">😶</p>
        <p className="text-forge-muted">Persona not found.</p>
        <Link to="/" className="btn-primary">← Back to Home</Link>
      </div>
    );
  }

  const userMessageCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ── Left sidebar: persona info + trait evolution ── */}
      <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 border-r border-forge-border
                        bg-forge-surface p-4 gap-4 overflow-y-auto">

        {/* Back link */}
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-forge-muted hover:text-forge-text
                     transition-colors duration-150 pb-3 border-b border-forge-border"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          All Personas
        </Link>

        {/* Persona info card */}
        <div className="forge-card p-4 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-600/30
                            flex items-center justify-center">
              <span className="text-violet-300 font-display font-bold">
                {persona.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-display font-bold text-forge-text">{persona.name}</p>
              <p className="text-xs text-violet-400">Active</p>
            </div>
          </div>
          {persona.description && (
            <p className="text-xs text-forge-muted leading-relaxed">{persona.description}</p>
          )}
        </div>

        {/* Live trait evolution panel */}
        <TraitEvolutionPanel
          currentTraits={currentTraits}
          initialTraits={initialTraits}
          messageCount={userMessageCount}
        />

        {/* Clear chat button */}
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="btn-ghost text-sm w-full mt-auto"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            New Conversation
          </button>
        )}
      </aside>

      {/* ── Main chat area ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Chat header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-forge-border
                        bg-forge-bg/80 backdrop-blur-md flex-shrink-0">
          {/* Mobile back button */}
          <Link to="/" className="lg:hidden text-forge-muted hover:text-forge-text">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-600/30
                          flex items-center justify-center">
            <span className="text-violet-300 font-display font-bold text-sm">
              {persona.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-forge-text truncate">{persona.name}</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Online
            </p>
          </div>

          {/* Mobile: clear chat */}
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="text-forge-muted hover:text-red-400 transition-colors"
              title="New conversation"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Empty state / welcome */}
          {messages.length === 0 && !isTyping && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
              <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-600/30
                              flex items-center justify-center text-3xl">
                {persona.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-display font-bold text-xl text-forge-text">
                  Start chatting with {persona.name}
                </p>
                <p className="text-forge-muted text-sm mt-1 max-w-sm">
                  {persona.description || "Say anything — watch the personality come alive."}
                </p>
              </div>

              {/* Conversation starters */}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {[
                  "Tell me about yourself",
                  "What do you think about AI?",
                  "Give me your best advice",
                  "Tell me a joke",
                ].map((starter) => (
                  <button
                    key={starter}
                    onClick={() => { setInput(starter); inputRef.current?.focus(); }}
                    className="text-xs px-3 py-1.5 rounded-full border border-forge-border
                               text-forge-muted hover:border-violet-600/50 hover:text-forge-text
                               hover:bg-violet-600/10 transition-all"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
              personaName={persona.name}
            />
          ))}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator personaName={persona.name} />}

          {/* Error banner */}
          {error && (
            <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm
                            rounded-xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ── */}
        <div className="flex-shrink-0 border-t border-forge-border bg-forge-bg px-4 py-4">
          <div className="max-w-4xl mx-auto flex gap-3 items-end">
            <div className="flex-1 glow-border rounded-2xl bg-forge-surface">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${persona.name}…`}
                rows={1}
                disabled={isTyping}
                className="w-full bg-transparent px-4 py-3 text-sm text-forge-text
                           placeholder-forge-muted resize-none outline-none
                           disabled:opacity-50 max-h-36"
                style={{ fieldSizing: "content" }}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="btn-primary h-11 w-11 p-0 rounded-xl flex-shrink-0"
              title="Send (Enter)"
            >
              {isTyping ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-forge-muted mt-2">
            Enter to send · Shift+Enter for new line · Traits evolve with every message
          </p>
        </div>
      </div>
    </div>
  );
}
