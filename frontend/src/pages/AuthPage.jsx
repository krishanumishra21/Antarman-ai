// pages/AuthPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import api, { sendOtp, verifyOtp } from "../utils/api";
import { useAuth } from "../utils/AuthContext";

export default function AuthPage() {
  const { login } = useAuth();
  const [isLogin,  setIsLogin]  = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [form,     setForm]     = useState({ name: "", email: "", password: "" });

  // OTP flow state
  const [otpStep,     setOtpStep]     = useState(false);   // true = show OTP input
  const [otpCode,     setOtpCode]     = useState(["", "", "", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown,   setCountdown]   = useState(0);       // seconds remaining
  const [resending,   setResending]   = useState(false);

  const otpRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  // ── OTP input handling ────────────────────────────────────────────────────
  const handleOtpChange = useCallback((index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    setOtpCode((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback((index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otpCode]);

  const handleOtpPaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    const newCode = [...otpCode];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || "";
    }
    setOtpCode(newCode);
    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();
  }, [otpCode]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
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
      await sendOtp(form.email);
      setOtpStep(true);
      setCountdown(300); // 5 minutes
      setSuccess("OTP sent! Check your email inbox.");
      // Focus first OTP input after render
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = otpCode.join("");
    if (code.length !== 6) {
      return setError("Please enter the complete 6-digit code.");
    }

    setLoading(true);
    setError("");
    try {
      await verifyOtp(form.email, code);
      setOtpVerified(true);
      setSuccess("Email verified! Creating your account...");

      // Step 3: Auto-register after verification
      const { data } = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed. Try again.");
      setOtpVerified(false);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setResending(true);
    setError("");
    try {
      await sendOtp(form.email);
      setOtpCode(["", "", "", "", "", ""]);
      setCountdown(300);
      setSuccess("New OTP sent!");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  // ── Login (unchanged) ─────────────────────────────────────────────────────
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

  // Reset OTP state when switching tabs
  const switchMode = (toLogin) => {
    setIsLogin(toLogin);
    setError("");
    setSuccess("");
    setOtpStep(false);
    setOtpCode(["", "", "", "", "", ""]);
    setOtpVerified(false);
    setCountdown(0);
  };

  // Format countdown as M:SS
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

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
              : otpStep
                ? "Enter the verification code sent to your email."
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

          {/* ── SIGNUP FORM — Step 1: Details ── */}
          {!isLogin && !otpStep && (
            <form onSubmit={handleSendOtp} className="space-y-4 animate-fade-up">
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

              <button type="submit" disabled={loading} className="btn-primary w-full mt-4 bg-gradient-to-br from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-550 shadow-md shadow-violet-950/20 py-3 cursor-pointer">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending OTP…</span>
                  </div>
                ) : (
                  <span className="font-display tracking-wider text-xs font-bold uppercase">
                    <span className="flex items-center justify-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      Send Verification Code
                    </span>
                  </span>
                )}
              </button>
            </form>
          )}

          {/* ── SIGNUP FORM — Step 2: OTP Verification ── */}
          {!isLogin && otpStep && !otpVerified && (
            <div className="space-y-5 animate-fade-up">

              {/* Email indicator */}
              <div className="flex items-center gap-2 bg-forge-surface/50 rounded-xl px-4 py-3 border border-forge-border/40">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-violet-400 flex-shrink-0">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="text-xs text-forge-text truncate">{form.email}</span>
                <button
                  onClick={() => { setOtpStep(false); setOtpCode(["","","","","",""]); setCountdown(0); setError(""); setSuccess(""); }}
                  className="ml-auto text-xs text-violet-400 hover:text-violet-300 font-bold cursor-pointer flex-shrink-0"
                >
                  Change
                </button>
              </div>

              {/* OTP inputs */}
              <div className="flex justify-center gap-2.5">
                {otpCode.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    className="w-12 h-14 text-center text-xl font-bold font-display rounded-xl
                               bg-forge-surface/60 border-2 border-forge-border/60 text-forge-text
                               outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20
                               transition-all duration-200"
                  />
                ))}
              </div>

              {/* Timer + Resend */}
              <div className="flex items-center justify-between text-xs">
                {countdown > 0 ? (
                  <span className="text-forge-muted flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Expires in <span className="text-violet-400 font-bold">{formatTime(countdown)}</span>
                  </span>
                ) : (
                  <span className="text-red-400 font-semibold">Code expired</span>
                )}
                <button
                  onClick={handleResendOtp}
                  disabled={resending || countdown > 240} // Can resend after 60s
                  className="text-violet-400 hover:text-violet-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {resending ? "Sending…" : "Resend Code"}
                </button>
              </div>

              {/* Success message */}
              {success && (
                <div className="bg-emerald-900/15 border border-emerald-800/40 text-emerald-400 text-xs rounded-xl px-4 py-3 text-center">
                  {success}
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="bg-red-900/15 border border-red-800/40 text-red-400 text-xs rounded-xl px-4 py-3 text-center">
                  {error}
                </div>
              )}

              {/* Verify button */}
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otpCode.join("").length !== 6 || countdown <= 0}
                className="btn-primary w-full bg-gradient-to-br from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-550 shadow-md shadow-violet-950/20 py-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying…</span>
                  </div>
                ) : (
                  <span className="font-display tracking-wider text-xs font-bold uppercase flex items-center justify-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                    </svg>
                    Verify & Create Account
                  </span>
                )}
              </button>
            </div>
          )}

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