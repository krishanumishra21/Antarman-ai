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
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: "radial-gradient(ellipse at top, #1a0a2e 0%, #0A0A0F 60%)" }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/50">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-bold text-2xl text-white">
              अंतरमन <span className="text-violet-400">AI</span>
            </span>
          </div>
          <p className="text-forge-muted text-sm">
            {isLogin ? "Welcome back! Sign in to your account." : "Create an account to get started."}
          </p>
        </div>

        {/* Card */}
        <div className="forge-card p-8 space-y-6">

          {/* Toggle tabs */}
          <div className="flex bg-forge-surface rounded-xl p-1">
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold font-display transition-all
                ${isLogin ? "bg-violet-600 text-white" : "text-forge-muted hover:text-forge-text"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold font-display transition-all
                ${!isLogin ? "bg-violet-600 text-white" : "text-forge-muted hover:text-forge-text"}`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name field — only on register */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold font-display text-forge-text">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required={!isLogin}
                  className="w-full bg-forge-surface border border-forge-border rounded-xl px-4 py-2.5
                             text-forge-text placeholder-forge-muted text-sm outline-none
                             focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold font-display text-forge-text">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full bg-forge-surface border border-forge-border rounded-xl px-4 py-2.5
                           text-forge-text placeholder-forge-muted text-sm outline-none
                           focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold font-display text-forge-text">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={isLogin ? "Your password" : "Min 6 characters"}
                required
                className="w-full bg-forge-surface border border-forge-border rounded-xl px-4 py-2.5
                           text-forge-text placeholder-forge-muted text-sm outline-none
                           focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          {/* Switch link */}
          <p className="text-center text-sm text-forge-muted">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}