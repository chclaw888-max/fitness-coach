import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10182B",
        paper: "#F7F6F2",
        surface: "#FFFFFF",
        line: "#E4E1D9",
        muted: "#6B7280",
        accent: {
          DEFAULT: "#0F9E8E",
          dark: "#0B7A6D",
          soft: "#E4F4F1",
        },
        warn: "#C6552F",
        good: "#2E7D5B",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        lg: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,43,0.04), 0 1px 12px rgba(16,24,43,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
