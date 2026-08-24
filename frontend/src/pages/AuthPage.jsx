// pages/AuthPage.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { useAuth } from "../utils/AuthContext";

export default function AuthPage() {
  const { login } = useAuth();
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [gisLoaded,  setGisLoaded]  = useState(false);

  // ── Google Authentication ──────────────────────────────────────────────────
  const handleGoogleCredentialResponse = useCallback(async (response) => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/google", {
        credential: response.credential,
      });
      login(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Google authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, [login]);

  useEffect(() => {
    const checkGis = setInterval(() => {
      if (window.google?.accounts?.id) {
        setGisLoaded(true);
        clearInterval(checkGis);
      }
    }, 100);
    return () => clearInterval(checkGis);
  }, []);

  useEffect(() => {
    if (gisLoaded && window.google?.accounts?.id) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
      if (!clientId) {
        console.warn("VITE_GOOGLE_CLIENT_ID is not set in environment variables.");
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
      });

      const btnContainer = document.getElementById("googleBtn");
      if (btnContainer) {
        window.google.accounts.id.renderButton(btnContainer, {
          theme: "filled_dark",
          size: "large",
          width: btnContainer.clientWidth || 380,
          shape: "rectangular",
        });
      }
    }
  }, [gisLoaded, handleGoogleCredentialResponse]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-forge-bg noise-overlay"
         style={{ background: "radial-gradient(circle at center, #140b25 0%, #06060a 80%)" }}>
      
      {/* Dynamic ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-650/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-650/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: "1.5s" }} />

      <div className="w-full max-w-md z-10 animate-fade-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4 select-none">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-5.5 h-5.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-black text-2xl tracking-tight text-white">
              अंतरमन <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">AI</span>
            </span>
          </div>
          <p className="text-forge-muted text-xs font-medium tracking-wide">
            Construct your neural parameters and initiate co-evolution.
          </p>
        </div>

        {/* Card */}
        <div className="forge-card p-8 space-y-6 bg-forge-card/30 backdrop-blur-xl border border-forge-border/80 shadow-2xl relative">
          
          {/* Subtle top glare edge */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

          <div className="space-y-4 text-center">
            <h2 className="font-display font-bold text-lg text-white uppercase tracking-wider">
              Neural Authorization
            </h2>
            <p className="text-forge-muted text-xs px-2 leading-relaxed">
              Please authenticate using Google to gain access to the core personality simulation cluster.
            </p>
          </div>

          {error && (
            <div className="bg-red-900/15 border border-red-800/40 text-red-400 text-xs rounded-xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3 text-forge-muted text-sm">
              <span className="w-6 h-6 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
              <span>Establishing connection...</span>
            </div>
          ) : (
            <div className="flex justify-center w-full pt-2">
              <div id="googleBtn" className="w-full max-w-sm h-12 flex justify-center items-center" />
            </div>
          )}

          <div className="text-[10px] text-center text-forge-muted font-medium pt-2">
            By accessing the simulator, you authorize secure credential exchange.
          </div>
        </div>
      </div>
    </div>
  );
}