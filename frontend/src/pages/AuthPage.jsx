// pages/AuthPage.jsx
import { useState } from "react";
import api from "../utils/api";
import { useAuth } from "../utils/AuthContext";

export default function AuthPage() {
  const { login } = useAuth();
  const [isLogin,  setIsLogin]  = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [form,     setForm]     = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload  = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

     const { data } = await api.post(endpoint, payload);
      login(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
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
            {isLogin ? "Welcome back! Enter your credentials to access the personality forge." : "Construct your neural parameters and initiate co-evolution."}
          </p>
        </div>

        {/* Card */}
        <div className="forge-card p-8 space-y-6 bg-forge-card/30 backdrop-blur-xl border border-forge-border/80 shadow-2xl relative">
          
          {/* Subtle top glare edge */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

          {/* Toggle tabs */}
          <div className="flex bg-forge-surface/60 rounded-xl p-1 border border-forge-border/40 shadow-inner">
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-display transition-all duration-250 cursor-pointer
                ${isLogin ? "bg-violet-600 text-white shadow-md shadow-violet-950/45" : "text-forge-muted hover:text-forge-text"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-display transition-all duration-250 cursor-pointer
                ${!isLogin ? "bg-violet-600 text-white shadow-md shadow-violet-950/45" : "text-forge-muted hover:text-forge-text"}`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name field — only on register */}
            {!isLogin && (
              <div className="space-y-1.5 animate-fade-up">
                <label className="text-xs font-bold uppercase tracking-wider text-forge-text/80 font-display">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required={!isLogin}
                  className="w-full bg-forge-surface/50 border border-forge-border/80 rounded-xl px-4 py-2.5
                             text-forge-text placeholder-forge-muted text-sm outline-none
                             focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/15 focus:bg-forge-surface/85 transition-all duration-200"
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-forge-text/80 font-display">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@domain.com"
                required
                className="w-full bg-forge-surface/50 border border-forge-border/80 rounded-xl px-4 py-2.5
                           text-forge-text placeholder-forge-muted text-sm outline-none
                           focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/15 focus:bg-forge-surface/85 transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-forge-text/80 font-display">Security Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={isLogin ? "••••••••" : "Min 6 characters"}
                required
                className="w-full bg-forge-surface/50 border border-forge-border/80 rounded-xl px-4 py-2.5
                           text-forge-text placeholder-forge-muted text-sm outline-none
                           focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/15 focus:bg-forge-surface/85 transition-all duration-200"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-900/15 border border-red-800/40 text-red-400 text-xs rounded-xl px-4 py-3 animate-pulse">
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-4 bg-gradient-to-br from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-550 shadow-md shadow-violet-950/20 py-3 cursor-pointer">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isLogin ? "Authorizing…" : "Registering Core…"}</span>
                </div>
              ) : (
                <span className="font-display tracking-wider text-xs font-bold uppercase">{isLogin ? "Access Core" : "Initialize Account"}</span>
              )}
            </button>
          </form>

          {/* Switch link */}
          <p className="text-center text-xs text-forge-muted">
            {isLogin ? "New to the platform? " : "Already registered? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
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