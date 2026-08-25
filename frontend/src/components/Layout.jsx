// src/components/Layout.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

export default function Layout({ children }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const isChat    = location.pathname.startsWith("/chat");

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      {/* ── Top Navigation Bar ── */}
      <header className="border-b border-forge-border/60 glassmorphism-header sticky top-0 z-50 shadow-lg shadow-black/30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9.5 h-9.5 rounded-xl bg-gradient-to-tr from-violet-650 to-indigo-650 flex items-center justify-center
                            group-hover:from-violet-500 group-hover:to-indigo-500 transition-all duration-500 shadow-md shadow-violet-900/40
                            group-hover:shadow-violet-650/60 group-hover:scale-108 group-hover:rotate-6 ring-2 ring-violet-500/10">
              <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-white"
                   stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-forge-text group-hover:text-violet-300 transition-colors duration-300">
              अंतरमन <span className="text-violet-400 group-hover:text-violet-300 transition-colors">AI</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3.5">

            {/* Personas nav link */}
            <Link
              to="/"
              className={`relative px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 border
                ${!isChat
                  ? "bg-violet-650/15 border-violet-500/30 text-violet-300 shadow-md shadow-violet-950/20"
                  : "border-transparent text-forge-muted hover:text-forge-text hover:bg-forge-card/50"
                }`}
            >
              Personas
              {!isChat && (
                <span className="absolute -bottom-px left-3.5 right-3.5 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent rounded-full animate-pulse-slow" />
              )}
            </Link>

            {/* User avatar + name */}
            {user && (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl
                              bg-forge-card/30 border border-forge-border/60 shadow-sm ml-1 select-none
                              hover:border-violet-500/40 transition-all duration-300 group">
                <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-violet-650 to-indigo-650 flex items-center
                                justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-inner ring-2 ring-violet-500/20
                                group-hover:ring-violet-500/45 transition-all duration-300">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-forge-text font-semibold hidden sm:block max-w-[120px] truncate">
                  {user.name}
                </span>
              </div>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold
                         text-forge-muted hover:text-red-400 border border-forge-border/60
                         hover:border-red-900/45 hover:bg-red-950/15 transition-all duration-300 cursor-pointer
                         hover:shadow-lg hover:shadow-red-950/10 hover:scale-[1.02] active:scale-95"
            >
              {/* Logout icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2.2" className="w-4 h-4">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden sm:block font-display tracking-wide font-medium">Logout</span>
            </button>

          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  );
}