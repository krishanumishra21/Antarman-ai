/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        forge: {
          bg:      "#0A0A0F",
          surface: "#12121A",
          card:    "#1A1A26",
          border:  "#2A2A3E",
          accent:  "#7C3AED",
          glow:    "#A855F7",
          text:    "#E2E8F0",
          muted:   "#64748B",
          user:    "#1E3A5F",
          ai:      "#1A1A26",
        },
      },
      animation: {
        "fade-up":      "fadeUp 0.5s ease-out both",
        "fade-in":      "fadeIn 0.6s ease-out both",
        "pulse-slow":   "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "trait-bar":    "traitBar 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        "typing":       "typing 1.2s ease-in-out infinite",
        "slide-left":   "slideInLeft 0.4s ease-out both",
        "slide-right":  "slideInRight 0.4s ease-out both",
        "scale-in":     "scaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "shimmer":      "shimmer 2s linear infinite",
        "float":        "float 6s ease-in-out infinite",
        "float-delay":  "float 8s ease-in-out 2s infinite",
        "glow-pulse":   "glowPulse 3s ease-in-out infinite",
        "gradient-x":   "gradientX 3s ease infinite",
        "spin-slow":    "spin 8s linear infinite",
        "bounce-gentle":"bounceGentle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%":   { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%":   { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "33%":      { transform: "translateY(-12px) rotate(1deg)" },
          "66%":      { transform: "translateY(6px) rotate(-1deg)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124, 58, 237, 0.15)" },
          "50%":      { boxShadow: "0 0 40px rgba(124, 58, 237, 0.3), 0 0 80px rgba(124, 58, 237, 0.1)" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":      { backgroundPosition: "100% 50%" },
        },
        traitBar: {
          "0%":   { width: "0%", opacity: "0.5" },
          "100%": { width: "var(--trait-width)", opacity: "1" },
        },
        typing: {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "30%":            { transform: "translateY(-6px)" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};
