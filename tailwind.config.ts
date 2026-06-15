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
        // Cinematic dark palette
        void: "#05060c",
        ink: "#0a0c16",
        panel: "#0e1120",
        panel2: "#141831",
        line: "#222845",
        mute: "#7b85a8",
        soft: "#aeb6d6",
        ghost: "#5a6685",
        // Brand / branch accents
        brand: {
          DEFAULT: "#7c8cff",
          glow: "#9aa6ff",
          deep: "#4756d6",
        },
        quant: "#5eead4", // teal — Quant Signal Track
        startup: "#fca65a", // amber — Startup Validation Track
        research: "#c084fc", // violet — Research Depth Track
        // Semantic levels
        low: "#5eead4",
        medium: "#fbbf24",
        high: "#fb7185",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,140,255,0.25), 0 0 40px -8px rgba(124,140,255,0.45)",
        "glow-sm": "0 0 24px -6px rgba(124,140,255,0.4)",
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 40px -20px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(124,140,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(124,140,255,0.06) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(60% 50% at 50% 0%, rgba(124,140,255,0.18), transparent 70%)",
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
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
