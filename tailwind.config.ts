import type { Config } from "tailwindcss";

/**
 * Token-driven design system (SRS Appendix L.1.2).
 * Every color/spacing/radius value resolves from CSS variables set by the
 * active theme. Components consume tokens only — never literal hex — so a
 * theme switch re-skins the entire UI with zero component changes (UI-F07).
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces & structure
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          foreground: "hsl(var(--surface-foreground) / <alpha-value>)",
          muted: "hsl(var(--surface-muted) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        // Brand
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          muted: "hsl(var(--primary-muted) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          muted: "hsl(var(--accent-muted) / <alpha-value>)",
        },
        // Semantic / status
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
          muted: "hsl(var(--success-muted) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
          muted: "hsl(var(--warning-muted) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "hsl(var(--danger) / <alpha-value>)",
          foreground: "hsl(var(--danger-foreground) / <alpha-value>)",
          muted: "hsl(var(--danger-muted) / <alpha-value>)",
        },
        info: {
          DEFAULT: "hsl(var(--info) / <alpha-value>)",
          foreground: "hsl(var(--info-foreground) / <alpha-value>)",
          muted: "hsl(var(--info-muted) / <alpha-value>)",
        },
      },
      borderRadius: {
        sm: "calc(var(--radius) - 8px)",
        md: "calc(var(--radius) - 6px)",
        lg: "calc(var(--radius) - 4px)",
        xl: "var(--radius)",
        "2xl": "calc(var(--radius) + 4px)",
        "3xl": "calc(var(--radius) + 12px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        xs: "0 1px 2px 0 hsl(var(--shadow-color) / 0.04)",
        sm: "0 1px 2px 0 hsl(var(--shadow-color) / 0.04), 0 2px 6px -2px hsl(var(--shadow-color) / 0.06)",
        md: "0 4px 14px -4px hsl(var(--shadow-color) / 0.10), 0 2px 6px -3px hsl(var(--shadow-color) / 0.06)",
        lg: "0 12px 32px -8px hsl(var(--shadow-color) / 0.14), 0 6px 14px -8px hsl(var(--shadow-color) / 0.10)",
        xl: "0 24px 60px -16px hsl(var(--shadow-color) / 0.20), 0 8px 20px -12px hsl(var(--shadow-color) / 0.12)",
        glass: "0 8px 32px -8px hsl(var(--shadow-color) / 0.16), 0 2px 8px -4px hsl(var(--shadow-color) / 0.08)",
        popover: "0 12px 40px -8px hsl(var(--shadow-color) / 0.22), 0 4px 12px -6px hsl(var(--shadow-color) / 0.12)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out",
        "slide-up": "slide-up 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.24s cubic-bezier(0.16,1,0.3,1)",
        "pulse-dot": "pulse-dot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
