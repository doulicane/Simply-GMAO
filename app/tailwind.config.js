import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Simply GMAO brand palette — Noir / Rouge / Jaune / Orange
        "simply-gmao-green": "#0A0A0A",
        "simply-gmao-green-light": "#1A1A1A",
        "simply-gmao-green-dark": "#000000",
        "simply-gmao-gold": "#E63946",
        "simply-gmao-gold-light": "#FF4D5A",
        "simply-gmao-gold-dark": "#B91C1C",
        "simply-gmao-cream": "#0A0A0A",
        "simply-gmao-cream-dark": "#000000",
        "simply-gmao-warm-gray": "#9CA3AF",
        "simply-gmao-text": "#F1F1F1",
        "simply-gmao-text-light": "#9CA3AF",
        // Status colors (industrial safety palette)
        "status-ok": "#FFD60A",
        "status-warning": "#FF8500",
        "status-critical": "#E63946",
        "status-info": "#FF8500",
        "status-neutral": "#9CA3AF",
        // Legacy aliases for backwards compatibility
        "bg-primary": "#0A0A0A",
        "bg-elevated": "#141414",
        "bg-hover": "#1A1A1A",
        "bg-input": "#1A1A1A",
        "bg-tooltip": "#0A0A0A",
        "text-primary": "#F1F1F1",
        "text-secondary": "#9CA3AF",
        "text-muted": "#9CA3AF",
        "text-inverse": "#0A0A0A",
        "accent-teal": "#E63946",
        "accent-teal-glow": "rgba(230, 57, 70, 0.12)",
      },
      fontFamily: {
        raleway: ['Raleway', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.2)",
        card: "0 4px 20px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 8px 32px rgba(0, 0, 0, 0.5)",
        glow: "0 0 0 3px rgba(224, 180, 139, 0.15)",
        "glow-lg": "0 4px 16px rgba(224, 180, 139, 0.2)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-badge": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "count-up": "count-up 0.8s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "slide-up": "slide-up 0.4s ease-out forwards",
        "pulse-badge": "pulse-badge 1.5s ease-in-out infinite",
        shake: "shake 0.3s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
