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
        "fade-up":    "fadeUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "trait-bar":  "traitBar 0.6s ease-out",
        "typing":     "typing 1.2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        traitBar: {
          "0%":   { width: "0%" },
          "100%": { width: "var(--trait-width)" },
        },
        typing: {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "30%":            { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
