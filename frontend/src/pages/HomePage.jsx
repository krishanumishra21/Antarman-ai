// src/pages/HomePage.jsx
// Main landing page — persona builder on the left, persona list on the right

import { useState, useEffect, useCallback } from "react";
import PersonaBuilder from "../components/PersonaBuilder";
import PersonaCard    from "../components/PersonaCard";
import { getAllPersonas, deletePersona } from "../utils/api";

export default function HomePage() {
  const [personas, setPersonas] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  // Fetch all existing personas on mount
  const fetchPersonas = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getAllPersonas();
      setPersonas(data.personas || []);
    } catch {
      setError("Could not load personas. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPersonas(); }, [fetchPersonas]);

  // Prepend new persona to the list after creation
  const handleCreated = (newPersona) => {
    setPersonas((prev) => [newPersona, ...prev]);
  };

  // Remove persona from list after deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this persona? This cannot be undone.")) return;
    try {
      await deletePersona(id);
      setPersonas((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete persona.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* ── Hero header ── */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-600/10 border border-violet-600/20
                        rounded-full px-4 py-1.5 text-violet-400 text-xs font-semibold mb-4 font-display uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          AI Personality Simulator
        </div>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl text-forge-text leading-tight">
          Forge Your AI{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-300">
            Personalities
          </span>
        </h1>
        <p className="text-forge-muted mt-3 text-lg max-w-xl mx-auto">
          Create unique AI personas with custom traits. Watch them evolve as you chat.
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
        {/* ── Left: Builder ── */}
        <div className="sticky top-24">
          <PersonaBuilder onCreated={handleCreated} />
        </div>

        {/* ── Right: Persona list ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-lg text-forge-text">
              Your Personas
              {personas.length > 0 && (
                <span className="ml-2 text-sm font-normal text-forge-muted">
                  ({personas.length})
                </span>
              )}
            </h2>
            <button
              onClick={fetchPersonas}
              className="btn-ghost text-sm py-1.5 px-3"
              title="Refresh"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M4 4v5h5M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 9a8 8 0 0114.54-3M20 15a8 8 0 01-14.54 3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Refresh
            </button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-forge-muted gap-3">
              <span className="w-8 h-8 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
              <span className="text-sm">Loading personas…</span>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="forge-card p-6 text-center text-red-400">
              <p className="text-lg mb-1">⚠️ Connection Error</p>
              <p className="text-sm text-forge-muted">{error}</p>
              <button onClick={fetchPersonas} className="btn-ghost mt-4 text-sm">
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && personas.length === 0 && (
            <div className="forge-card p-10 text-center space-y-3">
              <div className="text-5xl">🧬</div>
              <p className="font-display font-semibold text-forge-text">No personas yet</p>
              <p className="text-forge-muted text-sm">
                Use the builder to create your first AI personality.
              </p>
            </div>
          )}

          {/* Persona cards grid */}
          {!loading && !error && personas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personas.map((p) => (
                <PersonaCard
                  key={p._id}
                  persona={p}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
