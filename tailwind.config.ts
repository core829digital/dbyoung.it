import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#0A0A0B",
          soft: "#121214",
          card: "#161618",
          line: "#26262A",
        },
        fire: {
          DEFAULT: "#FF4D00",
          hot: "#FF6A00",
          ember: "#FFB25E",
          deep: "#B23200",
        },
        bone: "#FFFFFF",
        smoke: "rgba(255,255,255,0.72)",
        ash: "rgba(255,255,255,0.55)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        fire: "0 0 24px rgba(255,77,0,0.45), 0 8px 40px rgba(255,77,0,0.18)",
        card: "0 20px 60px rgba(0,0,0,0.55)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
