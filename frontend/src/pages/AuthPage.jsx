// pages/AuthPage.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { useAuth } from "../utils/AuthContext";

export default function AuthPage() {
  const { login } = useAuth();
  const [isLogin,  setIsLogin]  = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [form,     setForm]     = useState({ name: "", email: "", password: "" });
  const [gisLoaded,  setGisLoaded]  = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  // ── Signup ────────────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return setError("All fields are required.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSuccess("Account created successfully!");
      login(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      login(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

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
          text: isLogin ? "signin_with" : "signup_with",
          shape: "rectangular",
        });
      }
    }
  }, [isLogin, gisLoaded, handleGoogleCredentialResponse]);

  const switchMode = (toLogin) => {
    setIsLogin(toLogin);
    setError("");
    setSuccess("");
  };

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
            {isLogin
              ? "Welcome back! Enter your credentials to access the personality forge."
              : "Construct your neural parameters and initiate co-evolution."
            }
          </p>
        </div>

        {/* Card */}
        <div className="forge-card p-8 space-y-6 bg-forge-card/30 backdrop-blur-xl border border-forge-border/80 shadow-2xl relative">
          
          {/* Subtle top glare edge */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

          {/* Toggle tabs */}
          <div className="flex bg-forge-surface/60 rounded-xl p-1 border border-forge-border/40 shadow-inner">
            <button
              onClick={() => switchMode(true)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-display transition-all duration-250 cursor-pointer
                ${isLogin ? "bg-violet-600 text-white shadow-md shadow-violet-950/45" : "text-forge-muted hover:text-forge-text"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode(false)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-display transition-all duration-250 cursor-pointer
                ${!isLogin ? "bg-violet-600 text-white shadow-md shadow-violet-950/45" : "text-forge-muted hover:text-forge-text"}`}
            >
              Sign Up
            </button>
          </div>

          {/* ── LOGIN FORM ── */}
          {isLogin && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forge-text/80 font-display">Email Address</label>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@domain.com" required
                  className="w-full bg-forge-surface/50 border border-forge-border/80 rounded-xl px-4 py-2.5
                             text-forge-text placeholder-forge-muted text-sm outline-none
                             focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/15 focus:bg-forge-surface/85 transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forge-text/80 font-display">Security Password</label>
                <input
                  type="password" name="password" value={form.password} onChange={handleChange}
                  placeholder="••••••••" required
                  className="w-full bg-forge-surface/50 border border-forge-border/80 rounded-xl px-4 py-2.5
                             text-forge-text placeholder-forge-muted text-sm outline-none
                             focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/15 focus:bg-forge-surface/85 transition-all duration-200"
                />
              </div>

              {error && (
                <div className="bg-red-900/15 border border-red-800/40 text-red-400 text-xs rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full mt-4 bg-gradient-to-br from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-550 shadow-md shadow-violet-950/20 py-3 cursor-pointer">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authorizing…</span>
                  </div>
                ) : (
                  <span className="font-display tracking-wider text-xs font-bold uppercase">Access Core</span>
                )}
              </button>
            </form>
          )}

          {/* ── SIGNUP FORM ── */}
          {!isLogin && (
            <form onSubmit={handleSignup} className="space-y-4 animate-fade-up">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forge-text/80 font-display">Full Name</label>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Your full name" required
                  className="w-full bg-forge-surface/50 border border-forge-border/80 rounded-xl px-4 py-2.5
                             text-forge-text placeholder-forge-muted text-sm outline-none
                             focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/15 focus:bg-forge-surface/85 transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forge-text/80 font-display">Email Address</label>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@domain.com" required
                  className="w-full bg-forge-surface/50 border border-forge-border/80 rounded-xl px-4 py-2.5
                             text-forge-text placeholder-forge-muted text-sm outline-none
                             focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/15 focus:bg-forge-surface/85 transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forge-text/80 font-display">Security Password</label>
                <input
                  type="password" name="password" value={form.password} onChange={handleChange}
                  placeholder="Min 6 characters" required
                  className="w-full bg-forge-surface/50 border border-forge-border/80 rounded-xl px-4 py-2.5
                             text-forge-text placeholder-forge-muted text-sm outline-none
                             focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/15 focus:bg-forge-surface/85 transition-all duration-200"
                />
              </div>

              {error && (
                <div className="bg-red-900/15 border border-red-800/40 text-red-400 text-xs rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-900/15 border border-emerald-800/40 text-emerald-400 text-xs rounded-xl px-4 py-3 text-center">
                  {success}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full mt-4 bg-gradient-to-br from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-550 shadow-md shadow-violet-950/20 py-3 cursor-pointer">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account…</span>
                  </div>
                ) : (
                  <span className="font-display tracking-wider text-xs font-bold uppercase">
                    <span className="flex items-center justify-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                      </svg>
                      Create Account
                    </span>
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Google Sign In Divider & Button */}
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-forge-border/40" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-forge-muted">Or continue with</span>
              <div className="h-[1px] flex-1 bg-forge-border/40" />
            </div>

            <div className="flex justify-center w-full">
              <div id="googleBtn" className="w-full max-w-sm h-11 flex justify-center items-center" />
            </div>
          </div>

          {/* Switch link */}
          <p className="text-center text-xs text-forge-muted">
            {isLogin ? "New to the platform? " : "Already registered? "}
            <button
              onClick={() => switchMode(!isLogin)}
              className="text-violet-400 hover:text-violet-300 font-bold transition-colors cursor-pointer"
            >
              {isLogin ? "Sign Up Free" : "Return to Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}