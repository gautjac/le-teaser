/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Le Teaser — a confident content desk. Near-black studio, electric
        // tangerine, acid lime, warm bone. Punchy, sleek, built-in-public.
        studio: {
          DEFAULT: "#0d0b12", // deep ink-plum
          raise: "#16131e", // raised panel
          card: "#1c1826", // card surface
          line: "#2c2738", // hairline
          muted: "#3a3348",
        },
        bone: {
          DEFAULT: "#f6f0e6",
          dim: "#cbc3b6",
          faint: "#8f887c",
        },
        flare: {
          DEFAULT: "#ff5a3c", // tangerine — primary
          soft: "#ff7a5f",
          deep: "#e0421f",
        },
        lime: {
          DEFAULT: "#c8ff4d", // acid lime — accent
          deep: "#a9e02b",
        },
        violet: {
          DEFAULT: "#9a7bff", // electric violet — third
          deep: "#7a56f0",
        },
        sky: "#4dd0ff",
        chan: {
          x: "#e9e9ea",
          instagram: "#ff5a3c",
          linkedin: "#4dd0ff",
          threads: "#c8ff4d",
          tiktok: "#9a7bff",
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"Space Grotesk"', "system-ui", "sans-serif"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        pop: "0 0 0 1px rgba(255,90,60,0.35), 0 18px 40px -18px rgba(255,90,60,0.45)",
        lift: "0 22px 50px -24px rgba(0,0,0,0.8)",
        chip: "0 2px 0 0 rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        grid: "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        sweep: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        riseIn: "riseIn 0.45s cubic-bezier(0.16,1,0.3,1) both",
        popIn: "popIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
        pulseDot: "pulseDot 1.1s ease-in-out infinite",
        sweep: "sweep 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};
