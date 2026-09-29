import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        main: "var(--main)",
        mtext: "var(--mtext)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--muted)",
        overlay: "var(--overlay)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
        ring: "var(--ring)",
        // legacy alias kept for classes that still reference it
        bw: "var(--surface)",
      },
      borderRadius: {
        base: "10px",
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(2, 6, 17, 0.45), 0 10px 28px -14px rgba(2, 6, 17, 0.65)",
        pop: "0 16px 48px -12px rgba(2, 6, 17, 0.85)",
        glow: "0 0 0 1px rgba(56, 189, 248, 0.22), 0 6px 24px -8px rgba(56, 189, 248, 0.4)",
      },
      fontWeight: {
        base: "500",
        heading: "700",
      },
      fontFamily: {
        sans: ["Inter", "Vazirmatn", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        "pop-in": "pop-in 0.2s ease-out both",
        "slide-up": "slide-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
