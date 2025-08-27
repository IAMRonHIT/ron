import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Aesthetic-specific colors
        canvas: '#000000',
        surface: {
          primary: '#0B0B0C',
          secondary: '#111216',
          tertiary: '#14161A',
        },
        'brand-accent-start': '#3B82F6',
        'brand-accent-middle': '#8B5CF6',
        'brand-accent-end': '#06B6D4',

        // Default colors for ShadCN compatibility, mapped to new system
        border: "rgba(255, 255, 255, 0.06)",
        divider: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.06)", // Using border color for input
        ring: "#3B82F6", // Using accent color for rings
        background: "#000000", // Canvas
        foreground: "hsl(var(--foreground))", // Keep this for text, will define in globals.css

        primary: {
          DEFAULT: "#0B0B0C", // Surface Primary
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#111216", // Surface Secondary
          foreground: "hsl(var(--secondary-foreground))",
        },
        tertiary: { // Custom addition
          DEFAULT: "#14161A", // Surface Tertiary
          foreground: "hsl(var(--tertiary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))", // Will map to a surface color in globals
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#3B82F6", // Accent color start
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "#0B0B0C", // Surface Primary for popovers
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "#0B0B0C", // Surface Primary for cards
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        outer: '18px',
        inner: '14px',
        chip: '10px',
        // ShadCN compatibility
        lg: "18px", // outer
        md: "14px", // inner
        sm: "10px", // chip
      },
      boxShadow: {
        'glow-sm': '0 0 16px rgba(59, 130, 246, 0.18), inset 0 0 1px rgba(255, 255, 255, 0.06)',
        'glow-md': '0 0 24px rgba(59, 130, 246, 0.22), inset 0 0 1px rgba(255, 255, 255, 0.06)',
        'focus-ring': '0 0 0 2px #06B6D4, 0 0 16px rgba(59, 130, 246, 0.18)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(215deg, #3B82F6, #8B5CF6, #06B6D4)',
      },
      letterSpacing: {
        headings: '-0.02em',
        body: '-0.006em',
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
