// pages/AuthPage.jsx — Ultra-Premium Immersive Split Landing & Auth Portal
import { useState, useEffect, useCallback, useRef } from "react";
import api from "../utils/api";
import { useAuth } from "../utils/AuthContext";

// ── Interactive Neural Flow Canvas ──────────────────────────────────────────
function NeuralCanvas() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const mouse = { x: null, y: null, radius: 180 };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Particle class definition
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
        this.baseColor = Math.random() > 0.4 ? "124, 58, 237" : "99, 102, 241"; // violet vs indigo
      }

      update() {
        // Move particle
        this.x += this.vx;
        this.y += this.vy;

        // Bounce on boundaries
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction (push away gently)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 1.5;
            this.y += Math.sin(angle) * force * 1.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.baseColor}, 0.75)`;
        ctx.fill();
      }
    }

    // Initialize particles based on screen size
    const particleCount = Math.min(100, Math.floor((width * height) / 9000));
    const particles = Array.from({ length: particleCount }, () => new Particle());

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 120;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Draw gradient-like connection lines
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint mouse glow
      if (mouse.x !== null && mouse.y !== null) {
        const radGrd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
        radGrd.addColorStop(0, "rgba(124, 58, 237, 0.04)");
        radGrd.addColorStop(1, "rgba(124, 58, 237, 0)");
        ctx.fillStyle = radGrd;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      drawConnections();
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

export default function AuthPage() {
  const { login } = useAuth();
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [gisLoaded, setGisLoaded] = useState(false);

  const handleGoogleCredentialResponse = useCallback(async (response) => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/google", { credential: response.credential });
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
    if (!gisLoaded || !window.google?.accounts?.id) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    window.google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleCredentialResponse });
    const btn = document.getElementById("googleBtn");
    if (btn) {
      window.google.accounts.id.renderButton(btn, {
        theme: "filled_dark", size: "large",
        width: btn.clientWidth || 360, shape: "rectangular",
      });
    }
  }, [gisLoaded, handleGoogleCredentialResponse]);

  return (
    <div className="min-h-screen w-full flex bg-[#060608] text-forge-text font-body overflow-hidden">
      
      {/* ── Left Column: Immersive Generative Art & Product Copy ── */}
      <div className="hidden lg:flex lg:w-[58%] relative flex-col justify-between p-16 overflow-hidden border-r border-violet-950/20">
        
        {/* Generative Interactive Canvas */}
        <NeuralCanvas />

        {/* Ambient Gradient Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-delay" />

        {/* Header/Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-650 flex items-center justify-center shadow-lg shadow-violet-950/30">
            <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-white" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-white select-none">
            अंतरमन <span className="text-violet-400">AI</span>
          </span>
        </div>

        {/* Copy/Product Feature Focus */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto pr-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 font-semibold tracking-wider font-display uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Neural Evolution Engine
          </div>
          <h2 className="font-display font-black text-4xl xl:text-5xl text-white leading-tight tracking-tight select-none">
            Simulate the depth of the{" "}
            <span className="gradient-text-animated block">
              Inner Mind.
            </span>
          </h2>
          <p className="text-forge-muted text-sm xl:text-base leading-relaxed font-medium">
            Forge responsive AI personalities and observe how Empathy, Confidence, Aggression, and Humor adapt in real time during dynamic dialogues.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-forge-border/40 max-w-md">
            <div>
              <p className="font-display font-black text-2xl text-violet-400">4D</p>
              <p className="text-[10px] uppercase font-bold text-forge-muted tracking-wider mt-1">Trait Dimensions</p>
            </div>
            <div>
              <p className="font-display font-black text-2xl text-indigo-400">100%</p>
              <p className="text-[10px] uppercase font-bold text-forge-muted tracking-wider mt-1">Adaptive Response</p>
            </div>
            <div>
              <p className="font-display font-black text-2xl text-purple-400">LLM</p>
              <p className="text-[10px] uppercase font-bold text-forge-muted tracking-wider mt-1">Neural Engine</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-forge-muted font-medium">
          <span>© {new Date().getFullYear()} Antarman</span>
          <span className="font-mono opacity-60">v1.2.0-stable</span>
        </div>
      </div>

      {/* ── Right Column: Minimalist Elegant Google Authorization ── */}
      <div className="w-full lg:w-[42%] flex flex-col justify-center items-center px-6 md:px-16 py-12 relative bg-[#09090d]">
        
        {/* Subtle background graphics for mobile/tablet where left col is hidden */}
        <div className="lg:hidden absolute inset-0 -z-10 overflow-hidden">
          <NeuralCanvas />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-violet-600/5 rounded-full blur-[80px] pointer-events-none" />
        </div>

        {/* Small Screen Logo Header */}
        <div className="lg:hidden flex items-center gap-2 mb-10 select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-650 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display font-black text-lg tracking-tight text-white">
            अंतरमन <span className="text-violet-400">AI</span>
          </span>
        </div>

        <div className="w-full max-w-sm space-y-8">
          
          {/* Header Texts */}
          <div className="space-y-3 text-center lg:text-left">
            <h3 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight select-none">
              Neural Authorization
            </h3>
            <p className="text-forge-muted text-xs md:text-sm leading-relaxed font-medium">
              Authenticate using Google to coordinate and configure custom psychological simulations.
            </p>
          </div>

          {/* Form Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-forge-border/60" />
            <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-violet-400/80 font-mono">Secure Access Gate</span>
            <div className="flex-1 h-px bg-forge-border/60" />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="text-xs text-center py-3 px-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 animate-scale-in font-medium">
              {error}
            </div>
          )}

          {/* Authorization Interaction Box */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3.5">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <span className="absolute w-10 h-10 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                </div>
                <span className="text-xs text-forge-muted font-semibold tracking-wider uppercase animate-pulse">
                  Linking Credentials...
                </span>
              </div>
            ) : (
              <div className="flex justify-center w-full">
                <div id="googleBtn" className="w-full h-12 flex justify-center items-center shadow-lg shadow-black/35 hover:shadow-violet-950/10 transition-all duration-300 rounded-xl overflow-hidden border border-forge-border/40 hover:border-violet-500/50" />
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="space-y-4 pt-6 border-t border-forge-border/40">
            <div className="flex gap-3 items-start text-[11px] text-forge-muted leading-relaxed">
              <span className="text-violet-400 text-xs">🔒</span>
              <p>Your authentication is validated directly through Google OAuth 2.0. No password storage, maximum security.</p>
            </div>
            <div className="flex gap-3 items-start text-[11px] text-forge-muted leading-relaxed">
              <span className="text-violet-400 text-xs">⚡</span>
              <p>Access custom simulation features immediately, and auto-sync logs with the remote database cluster.</p>
            </div>
          </div>

          {/* Footer custom domain tag */}
          <p className="text-center text-[10px] text-forge-muted/60 font-mono tracking-widest pt-4">
            antarman.krishanu.space
          </p>
        </div>
      </div>
    </div>
  );
}