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
      <header className="border-b border-forge-border bg-forge-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center
                            group-hover:bg-violet-500 transition-colors duration-200 shadow-lg shadow-violet-900/40">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white"
                   stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-forge-text">
              अंतरमन <span className="text-violet-400">AI</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Personas nav link */}
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                ${!isChat
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-forge-muted hover:text-forge-text hover:bg-forge-card"
                }`}
            >
              Personas
            </Link>

            {/* User avatar + name */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                              bg-forge-card border border-forge-border ml-1">
                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center
                                justify-center text-xs font-bold text-white flex-shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-forge-text font-medium hidden sm:block max-w-[120px] truncate">
                  {user.name}
                </span>
              </div>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                         text-forge-muted hover:text-red-400 border border-forge-border
                         hover:border-red-800/50 hover:bg-red-900/10 transition-all duration-150"
            >
              {/* Logout icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" className="w-4 h-4">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden sm:block">Logout</span>
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