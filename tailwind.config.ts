import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // TaskFlow custom colors
        terracotta: "#e07a5f",
        sage: "#6d8b74",
        lavender: "#8b7ec8",
        warning: "#d4a843",
        danger: "#c44e4e",
        info: "#6b9ac4",
        priority: {
          critical: "#c44e4e",
          high: "#e07a5f",
          medium: "#d4a843",
          low: "#6b9ac4",
        },
        gantt: {
          todo: "#d1d5db",
          progress: "#e07a5f",
          done: "#6d8b74",
          hold: "#9ca3af",
          critical: "#c44e4e",
          milestone: "#8b7ec8",
          dependency: "#9ca3af",
          today: "#c44e4e",
          weekend: "#f5f5f4",
        },
      },
      fontFamily: {
        heading: ["DM Sans", "sans-serif"],
        body: ["Source Serif 4", "Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
