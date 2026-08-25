// src/pages/HomePage.jsx
// Main landing page — persona builder on the left, persona list on the right

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import PersonaBuilder from "../components/PersonaBuilder";
import PersonaCard from "../components/PersonaCard";
import {
  getAllPersonas,
  deletePersona,
  getAllRooms,
  createRoom,
  deleteRoom
} from "../utils/api";

export default function HomePage() {
  const [personas, setPersonas] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  // Room states
  const [rooms, setRooms] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [creatingRoom, setCreatingRoom] = useState(false);

  // Fetch all existing personas and rooms on mount
  const fetchPersonas = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [personasRes, roomsRes] = await Promise.all([
        getAllPersonas(),
        getAllRooms()
      ]);
      setPersonas(personasRes.data.personas || []);
      setRooms(roomsRes.data.rooms || []);
    } catch {
      setError("Could not load data. Is the backend running?");
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
      // Also filter out deleted persona from any loaded rooms
      setRooms((prev) =>
        prev.map((r) => ({
          ...r,
          personaIds: r.personaIds.filter((p) => p._id !== id),
        }))
      );
    } catch {
      alert("Failed to delete persona.");
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return alert("Please enter a room name.");
    if (selectedPersonas.length < 2) return alert("Select at least 2 personas to form a room.");

    setCreatingRoom(true);
    try {
      const { data } = await createRoom({
        name: roomName.trim(),
        personaIds: selectedPersonas,
      });
      setRooms((prev) => [data.room, ...prev]);
      setRoomName("");
      setSelectedPersonas([]);
      setShowRoomModal(false);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create room.");
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this persona room? All messages will be lost.")) return;
    try {
      await deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
    } catch {
      alert("Failed to delete room.");
    }
  };

  const toggleSelectPersona = (id) => {
    setSelectedPersonas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 relative z-10 noise-overlay">
      {/* ── Animated background orbs ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-float" />
      <div className="absolute top-32 -left-20 w-72 h-72 bg-indigo-500/8 rounded-full blur-[110px] pointer-events-none -z-10 animate-float-delay" />
      <div className="absolute top-48 -right-16 w-72 h-72 bg-purple-500/8 rounded-full blur-[110px] pointer-events-none -z-10 animate-float" />

      {/* ── Hero header ── */}
      <div className="mb-14 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-650/15 border border-violet-500/25
                        rounded-full px-5 py-1.5 text-violet-300 text-[10px] font-bold tracking-widest mb-5 font-display uppercase shadow-inner
                        animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Neural Co-Evolution Engine
        </div>
        <h1 className="font-display font-black text-4xl md:text-5xl text-forge-text leading-tight tracking-tight select-none animate-fade-up stagger-1">
          Forge Your AI{" "}
          <span className="gradient-text-animated">
            Personalities
          </span>
        </h1>
        <p className="text-forge-muted mt-4 text-sm md:text-base max-w-lg mx-auto font-medium leading-relaxed animate-fade-up stagger-2">
          Create custom AI personas, configure their starting neural parameters, and witness quantitative traits adapt to conversational tone.
        </p>

        {/* Decorative separator */}
        <div className="flex items-center justify-center gap-2 mt-6 animate-fade-up stagger-3">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-violet-500/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-violet-500/60 animate-pulse" />
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-violet-500/40" />
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
        {/* ── Left: Builder ── */}
        <div className="lg:sticky lg:top-24 z-20 animate-fade-up stagger-2">
          <PersonaBuilder onCreated={handleCreated} />
        </div>

        {/* ── Right: Persona list ── */}
        <div className="space-y-5 animate-fade-up stagger-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-extrabold text-base text-forge-text tracking-wide select-none">
              Configured Personas
              {personas.length > 0 && (
                <span className="ml-2 text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/10">
                  {personas.length}
                </span>
              )}
            </h2>
            <button
              onClick={fetchPersonas}
              className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl border border-forge-border/80 bg-forge-card/45 hover:bg-violet-600/10 hover:border-violet-500 hover:text-forge-text text-xs font-semibold text-forge-muted transition-all duration-300 cursor-pointer shadow-sm hover:shadow-violet-950/10"
              title="Refresh list"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5">
                <path d="M4 4v5h5M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 9a8 8 0 0114.54-3M20 15a8 8 0 01-14.54 3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Refresh
            </button>
          </div>

          {/* Loading state — shimmer skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="glassmorphism p-5 space-y-4 animate-fade-in border border-forge-border/40" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forge-border/30 shimmer" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-24 rounded-full bg-forge-border/30 shimmer" />
                      <div className="h-2 w-16 rounded-full bg-forge-border/20 shimmer" />
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-forge-border/25 shimmer" />
                  <div className="h-2 w-3/4 rounded-full bg-forge-border/15 shimmer" />
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="h-1.5 rounded-full bg-forge-border/25 shimmer" />
                    <div className="h-1.5 rounded-full bg-forge-border/25 shimmer" />
                    <div className="h-1.5 rounded-full bg-forge-border/25 shimmer" />
                    <div className="h-1.5 rounded-full bg-forge-border/25 shimmer" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="glassmorphism p-6 text-center text-red-400 animate-scale-in border border-red-500/20">
              <p className="text-lg mb-1">⚠️ Connection Error</p>
              <p className="text-sm text-forge-muted">{error}</p>
              <button onClick={fetchPersonas} className="btn-ghost mt-4 text-sm border-forge-border/60">
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && personas.length === 0 && (
            <div className="glassmorphism p-10 text-center space-y-4 animate-scale-in border border-forge-border/40">
              <div className="text-5xl animate-bounce-gentle">🧬</div>
              <p className="font-display font-semibold text-forge-text">No personas yet</p>
              <p className="text-forge-muted text-sm">
                Use the builder to create your first AI personality.
              </p>
            </div>
          )}

          {/* Persona cards grid */}
          {!loading && !error && personas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personas.map((p, index) => (
                <PersonaCard
                  key={p._id}
                  persona={p}
                  onDelete={handleDelete}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* ── Persona Rooms Section ── */}
          {!loading && !error && (
            <div className="pt-8 border-t border-forge-border/40 mt-8 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-base text-forge-text tracking-wide select-none">
                    Persona Rooms
                    {rooms.length > 0 && (
                      <span className="ml-2 text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/10">
                        {rooms.length}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-forge-muted mt-0.5">
                    Connect multiple AI personas inside a single conversation workspace.
                  </p>
                </div>
                <button
                  onClick={() => setShowRoomModal(true)}
                  disabled={personas.length < 2}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl border border-violet-500/30 bg-violet-650/10 hover:bg-violet-650/20 text-xs font-semibold text-violet-300 transition-all duration-300 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title={personas.length < 2 ? "Create at least 2 personas first" : "Create a new group room"}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 animate-pulse">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Create Room
                </button>
              </div>

              {rooms.length === 0 ? (
                <div className="glassmorphism p-8 text-center space-y-3 border border-forge-border/45">
                  <div className="text-4xl animate-bounce-gentle">💬</div>
                  <p className="font-display font-semibold text-forge-text text-sm">No Persona Rooms Created</p>
                  <p className="text-forge-muted text-xs max-w-sm mx-auto">
                    Combine your customized personas together to watch them dialogue and debate. Click 'Create Room' to begin.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rooms.map((room) => (
                    <Link
                      to={`/room/${room._id}`}
                      key={room._id}
                      className="glassmorphism p-5 space-y-4 hover:border-violet-500/40 border border-forge-border/40 transition-all duration-350 cursor-pointer group flex flex-col justify-between hover:shadow-violet-950/15"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-display font-bold text-sm text-forge-text group-hover:text-violet-400 transition-colors duration-250">
                            {room.name}
                          </h3>
                          <button
                            onClick={(e) => handleDeleteRoom(room._id, e)}
                            className="text-forge-muted hover:text-red-400 p-1 rounded-lg hover:bg-forge-card transition-all duration-200"
                            title="Delete Room"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {room.personaIds.map((p) => (
                            <span
                              key={p._id}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-forge-card border border-forge-border/40 text-forge-text"
                            >
                              👤 {p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-forge-muted font-semibold group-hover:text-forge-text transition-colors duration-250 pt-3 border-t border-forge-border/30">
                        <span>{room.messages?.length || 0} messages</span>
                        <span className="flex items-center gap-1 text-violet-400">
                          Enter Room
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-250">
                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Create Room Modal ── */}
          {showRoomModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="glassmorphism w-full max-w-md p-6 space-y-5 animate-scale-in border border-forge-border/80 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-forge-text">
                    Create Persona Room
                  </h3>
                  <button
                    onClick={() => {
                      setShowRoomModal(false);
                      setRoomName("");
                      setSelectedPersonas([]);
                    }}
                    className="text-forge-muted hover:text-forge-text p-1 rounded-lg hover:bg-forge-card transition-all duration-200 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-forge-muted">
                      Room Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. The Philosophy Circle"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      maxLength={100}
                      className="w-full bg-forge-surface/40 border border-forge-border/80 focus:border-violet-500 rounded-xl px-4 py-2.5 text-sm text-forge-text outline-none placeholder-forge-muted transition-colors duration-250"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-forge-muted block">
                      Select Personas (Min 2)
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {personas.map((p) => {
                        const isSelected = selectedPersonas.includes(p._id);
                        return (
                          <div
                            key={p._id}
                            onClick={() => toggleSelectPersona(p._id)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-250 select-none
                              ${isSelected
                                ? "bg-violet-650/10 border-violet-500/50 text-forge-text"
                                : "bg-forge-surface/30 border-forge-border/40 text-forge-muted hover:border-forge-border/80"}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-forge-card flex items-center justify-center text-xs font-bold font-display border border-forge-border/60">
                                {p.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-forge-text">{p.name}</p>
                                <p className="text-[10px] text-forge-muted truncate max-w-[200px]">{p.description || "No backstory."}</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="w-4 h-4 accent-violet-600 cursor-pointer"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoomModal(false);
                        setRoomName("");
                        setSelectedPersonas([]);
                      }}
                      className="flex-1 btn-ghost py-2.5 rounded-xl border-forge-border/60 hover:bg-forge-card cursor-pointer text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingRoom || !roomName.trim() || selectedPersonas.length < 2}
                      className="flex-1 btn-primary py-2.5 rounded-xl bg-gradient-to-tr from-violet-650 to-indigo-650 hover:from-violet-500 hover:to-indigo-550 text-xs cursor-pointer font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creatingRoom ? "Creating..." : "Create Room"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
