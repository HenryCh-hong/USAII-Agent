import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Signal Horizon palette — charcoal base, electric cyan for signal,
        // sunrise orange for action, slate-blue alt; no SaaS purple.
        void: "#0e1217",
        ink: "#11161c",
        panel: "#161b22",
        panel2: "#1c232c",
        line: "#2b333d",
        mute: "#8a93a0",
        soft: "#d7dde3",
        ghost: "#5d6675",
        // Brand / branch accents
        brand: {
          DEFAULT: "#38e0d0", // electric cyan — signal / primary identity
          glow: "#6ff0e2",
          deep: "#179e92",
        },
        quant: "#38e0d0", // cyan — Quant Signal Track (the signal)
        startup: "#ff9b50", // sunrise orange — Startup Validation Track (action)
        research: "#7c93b8", // slate-blue — Research Depth Track (depth)
        // Semantic levels
        low: "#38e0d0",
        medium: "#f5b342",
        high: "#ff7a6b",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,224,208,0.22), 0 0 40px -8px rgba(56,224,208,0.40)",
        "glow-sm": "0 0 24px -6px rgba(56,224,208,0.38)",
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 40px -20px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(56,224,208,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,224,208,0.05) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(60% 50% at 50% 0%, rgba(56,224,208,0.15), transparent 70%)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "dash": {
          to: { strokeDashoffset: "0" },
        },
        // Cockpit atmosphere
        "starfield-drift": {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(-40px,-30px,0)" },
        },
        "trail-flow": {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "0% -200%" },
        },
        "scan": {
          "0%, 100%": { opacity: "0.15", transform: "translateY(0)" },
          "50%": { opacity: "0.4" },
        },
        "led": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both",
        "starfield-drift": "starfield-drift 60s linear infinite alternate",
        "trail-flow": "trail-flow 8s linear infinite",
        led: "led 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
