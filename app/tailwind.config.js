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
        // Ramondin brand palette — Dark Elegant
        "ramondin-green": "#1D3C34",
        "ramondin-green-light": "#2A5248",
        "ramondin-green-dark": "#152B25",
        "ramondin-gold": "#E0B48B",
        "ramondin-gold-light": "#EDD4B8",
        "ramondin-gold-dark": "#C4936B",
        "ramondin-cream": "#0C1614",
        "ramondin-cream-dark": "#152B25",
        "ramondin-warm-gray": "#8A8478",
        "ramondin-text": "#F0EBE3",
        "ramondin-text-light": "#A8A095",
        // Status colors (wine-inspired, dark-friendly)
        "status-ok": "#7AAF6A",
        "status-warning": "#D4964A",
        "status-critical": "#C44A5C",
        "status-info": "#5A9AAF",
        "status-neutral": "#8A8478",
        // Legacy aliases for backwards compatibility
        "bg-primary": "#0C1614",
        "bg-elevated": "#152B25",
        "bg-hover": "#1D3C34",
        "bg-input": "#152B25",
        "bg-tooltip": "#0C1614",
        "text-primary": "#F0EBE3",
        "text-secondary": "#A8A095",
        "text-muted": "#6B655C",
        "text-inverse": "#0C1614",
        "accent-teal": "#E0B48B",
        "accent-teal-glow": "rgba(224, 180, 139, 0.12)",
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
