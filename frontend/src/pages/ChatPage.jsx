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
  const [traitHistory,  setTraitHistory]  = useState([]);
  const [showMenu,      setShowMenu]      = useState(false);
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
        setTraitHistory([{ ...data.persona.traits }]);
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
        setTraitHistory((prev) => [...prev, data.updatedTraits]);
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
    setTraitHistory(initialTraits ? [{ ...initialTraits }] : []);
  };

  // ── Export conversation to Markdown (.md) ──────────────────────────────
  const exportToMarkdown = () => {
    if (messages.length === 0) return alert("No messages to export!");
    
    let content = `# Antarman Conversation Transcript with ${persona.name}\n\n`;
    content += `**Export Date**: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
    content += `**Persona**: ${persona.name}\n`;
    content += `**Description**: ${persona.description || "No description provided."}\n\n`;
    
    content += `## Evolution of Personality Traits\n\n`;
    content += `| Trait | Starting Value | Final Value | Change |\n`;
    content += `| :--- | :---: | :---: | :---: |\n`;
    const getDeltaString = (key) => {
      const delta = (currentTraits?.[key] ?? 50) - (initialTraits?.[key] ?? 50);
      return delta > 0 ? `+${delta}` : `${delta}`;
    };
    content += `| Confidence | ${initialTraits?.confidence ?? 50}/100 | ${currentTraits?.confidence ?? 50}/100 | ${getDeltaString("confidence")} |\n`;
    content += `| Empathy | ${initialTraits?.empathy ?? 50}/100 | ${currentTraits?.empathy ?? 50}/100 | ${getDeltaString("empathy")} |\n`;
    content += `| Aggression | ${initialTraits?.aggression ?? 50}/100 | ${currentTraits?.aggression ?? 50}/100 | ${getDeltaString("aggression")} |\n`;
    content += `| Humor | ${initialTraits?.humor ?? 50}/100 | ${currentTraits?.humor ?? 50}/100 | ${getDeltaString("humor")} |\n\n`;
    
    content += `## Transcript Details\n\n`;
    messages.forEach((msg, idx) => {
      const sender = msg.role === "user" ? "User" : persona.name;
      content += `**[Turn ${idx + 1}] ${sender}**:\n`;
      content += `> ${msg.content}\n\n`;
    });
    
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `antarman_${persona.name.toLowerCase().replace(/\s+/g, '_')}_transcript.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Export conversation to JSON (.json) ────────────────────────────────
  const exportToJSON = () => {
    if (messages.length === 0) return alert("No messages to export!");
    
    const data = {
      exportTimestamp: new Date().toISOString(),
      persona: {
        id: persona._id,
        name: persona.name,
        description: persona.description,
        initialTraits,
        finalTraits: currentTraits,
        traitHistory
      },
      messages: messages.map((m, idx) => ({
        turn: idx + 1,
        sender: m.role,
        content: m.content,
        timestamp: m.timestamp
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `antarman_${persona.name.toLowerCase().replace(/\s+/g, '_')}_data.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Loading / error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-forge-muted gap-4 bg-forge-bg">
        <div className="relative">
          <span className="w-10 h-10 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin block" />
          <div className="absolute inset-0 w-10 h-10 rounded-full animate-glow-pulse" />
        </div>
        <span className="text-sm font-medium animate-pulse">Loading persona…</span>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4 text-center bg-forge-bg animate-scale-in">
        <p className="text-2xl">😶</p>
        <p className="text-forge-muted">Persona not found.</p>
        <Link to="/" className="btn-primary">← Back to Home</Link>
      </div>
    );
  }

  const userMessageCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-forge-bg relative noise-overlay">

      {/* ── Left sidebar: persona info + trait evolution ── */}
      <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 border-r border-forge-border
                        bg-forge-surface/50 backdrop-blur-md p-4 gap-4 overflow-y-auto z-10 animate-slide-left">

        {/* Back link */}
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-forge-muted hover:text-forge-text
                     transition-all duration-300 pb-3 border-b border-forge-border group"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          All Personas
        </Link>

        {/* Persona info card */}
        <div className="forge-card p-4 space-y-2 bg-forge-card/40 backdrop-blur-sm shadow-md animate-fade-up stagger-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-600/30
                            flex items-center justify-center shadow-inner animate-glow-pulse">
              <span className="text-violet-300 font-display font-bold">
                {persona.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-display font-bold text-forge-text text-sm">{persona.name}</p>
              <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Simulator
              </p>
            </div>
          </div>
          {persona.description && (
            <p className="text-xs text-forge-muted leading-relaxed pt-1.5 border-t border-forge-border/40">{persona.description}</p>
          )}
        </div>

        {/* Live trait evolution panel */}
        <div className="animate-fade-up stagger-2">
          <TraitEvolutionPanel
            currentTraits={currentTraits}
            initialTraits={initialTraits}
            messageCount={userMessageCount}
            traitHistory={traitHistory}
          />
        </div>

        {/* Sidebar Actions */}
        {messages.length > 0 && (
          <div className="mt-auto space-y-2 border-t border-forge-border/40 pt-3 animate-fade-up stagger-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportToMarkdown}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-forge-border bg-forge-card/40 hover:bg-violet-600/10 hover:border-violet-500 hover:text-forge-text text-[11px] font-semibold text-forge-muted transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                title="Export transcript to Markdown"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Markdown
              </button>
              <button
                onClick={exportToJSON}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-forge-border bg-forge-card/40 hover:bg-violet-600/10 hover:border-violet-500 hover:text-forge-text text-[11px] font-semibold text-forge-muted transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                title="Export raw JSON logs"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                </svg>
                JSON Data
              </button>
            </div>
            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-red-950 bg-red-950/10 hover:bg-red-900/20 hover:border-red-650 transition-all duration-300 text-xs font-semibold text-red-400 cursor-pointer hover:scale-[1.01]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              New Session
            </button>
          </div>
        )}
      </aside>

      {/* ── Main chat area ── */}
      <div className="flex flex-col flex-1 min-w-0 bg-forge-bg z-10">

        {/* Chat header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-forge-border
                        bg-forge-surface/40 backdrop-blur-md flex-shrink-0 z-20 animate-fade-in">
          <div className="flex items-center gap-3">
            {/* Mobile back button */}
            <Link to="/" className="lg:hidden text-forge-muted hover:text-forge-text group">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-600/30
                            flex items-center justify-center shadow-md animate-glow-pulse">
              <span className="text-violet-300 font-display font-bold text-sm">
                {persona.name.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-forge-text text-sm truncate">{persona.name}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Simulator Online
              </p>
            </div>
          </div>

          {/* Options Dropdown for mobile and desktop header */}
          {messages.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-forge-border hover:border-violet-500 bg-forge-card hover:bg-violet-600/10 text-forge-muted hover:text-forge-text transition-all duration-300 cursor-pointer hover:scale-105"
                title="Export & Session settings"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-forge-card border border-forge-border rounded-xl shadow-xl z-40 py-1.5 animate-scale-in">
                    <div className="px-3 py-1.5 text-[9px] uppercase font-bold text-forge-muted tracking-wider border-b border-forge-border/40">
                      Export Analysis
                    </div>
                    <button
                      onClick={() => { exportToMarkdown(); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2.5 text-xs text-forge-text hover:bg-violet-650 hover:bg-violet-600 hover:text-white transition-all duration-200 flex items-center gap-2 cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <path d="M14 2v6h6M16 13H8M16 17H8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Download MD (.md)
                    </button>
                    <button
                      onClick={() => { exportToJSON(); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2.5 text-xs text-forge-text hover:bg-violet-650 hover:bg-violet-600 hover:text-white transition-all duration-200 flex items-center gap-2 cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      </svg>
                      Download Data (.json)
                    </button>
                    
                    <div className="border-t border-forge-border/40 my-1" />
                    <button
                      onClick={() => { handleClear(); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2.5 text-xs text-red-400 hover:bg-red-600 hover:text-white transition-all duration-200 flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      New Session
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Empty state / welcome */}
          {messages.length === 0 && !isTyping && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-12 animate-fade-up">
              {/* Animated floating orbs behind the welcome card */}
              <div className="relative">
                <div className="absolute -top-8 -left-8 w-24 h-24 bg-violet-600/10 rounded-full blur-2xl animate-float pointer-events-none" />
                <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-indigo-600/10 rounded-full blur-2xl animate-float-delay pointer-events-none" />

                <div className="w-20 h-20 rounded-2xl bg-violet-600/20 border border-violet-600/30
                                flex items-center justify-center text-4xl font-display font-bold text-violet-300
                                shadow-lg shadow-violet-950/20 animate-glow-pulse relative z-10">
                  {persona.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="animate-fade-up stagger-1">
                <p className="font-display font-bold text-xl text-forge-text">
                  Start chatting with <span className="gradient-text-animated">{persona.name}</span>
                </p>
                <p className="text-forge-muted text-sm mt-1 max-w-sm">
                  {persona.description || "Say anything — watch the personality come alive."}
                </p>
              </div>

              {/* Conversation starters */}
              <div className="flex flex-wrap gap-2 justify-center mt-2 animate-fade-up stagger-2">
                {[
                  "Tell me about yourself",
                  "What do you think about AI?",
                  "Give me your best advice",
                  "Tell me a joke",
                ].map((starter, i) => (
                  <button
                    key={starter}
                    onClick={() => { setInput(starter); inputRef.current?.focus(); }}
                    className="text-xs px-4 py-2 rounded-full border border-forge-border
                               text-forge-muted hover:border-violet-600/50 hover:text-forge-text
                               hover:bg-violet-600/10 transition-all duration-300 hover:scale-105
                               hover:shadow-md hover:shadow-violet-950/10 active:scale-95"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {starter}
                  </button>
                ))}
              </div>

              {/* Decorative separator */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-8 h-px bg-gradient-to-r from-transparent to-violet-500/30" />
                <div className="w-1 h-1 rounded-full bg-violet-500/40 animate-pulse" />
                <div className="w-8 h-px bg-gradient-to-l from-transparent to-violet-500/30" />
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
                            rounded-xl px-4 py-3 text-center animate-scale-in">
              {error}
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ── */}
        <div className="flex-shrink-0 border-t border-forge-border bg-forge-bg/80 backdrop-blur-md px-4 py-4">
          <div className="max-w-4xl mx-auto flex gap-3 items-end">
            <div className="flex-1 glow-border rounded-2xl bg-forge-surface transition-all duration-300">
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
              className="btn-primary h-11 w-11 p-0 rounded-xl flex-shrink-0 group"
              title="Send (Enter)"
            >
              {isTyping ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
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
