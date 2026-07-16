import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-surface)",
        foreground: "var(--color-text)",
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted)",
        },
        primary: {
          DEFAULT: "#286255",
          foreground: "#FFFFFF",
          50: "#E5F0ED", 100: "#CBE0DA", 200: "#97C2B5", 300: "#63A390",
          400: "#44917A", 500: "#286255", 600: "#1C4A40",
          700: "#1A3D35", 800: "#152F29", 900: "#0F201C",
        },
        error: {
          DEFAULT: "#EF4444",
          50: "#FEF2F2", 500: "#EF4444", 700: "#B91C1C",
        },
        accent: {
          50: "#F4ECDD",
          100: "#EAD9BB",
          200: "#DDBB84",
          300: "#D49A44",
          400: "#C18830",
          500: "#A07024",
          600: "#7D581C",
          700: "#5B4015",
          800: "#3A280D",
          900: "#1D1406",
        },
        success: {
          50: "#F0FDF4",
          500: "#22C55E",
          700: "#15803D",
        },
        warning: {
          50: "#FFFBEB",
          500: "#F59E0B",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          secondary: "var(--color-bg)",
        },
        text: {
          primary: "var(--color-text)",
          secondary: "var(--color-muted)",
          onPrimary: "#FFFFFF",
        },
        border: {
          DEFAULT: "var(--color-line)",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.875rem", { lineHeight: "1.5" }],
        lg: ["0.9375rem", { lineHeight: "1.5" }],
        xl: ["1.0625rem", { lineHeight: "1.5" }],
        "2xl": ["1.25rem", { lineHeight: "1.2" }],
        "3xl": ["1.5rem", { lineHeight: "1.15" }],
        "4xl": ["1.75rem", { lineHeight: "1.12" }],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "18px",
        xl: "24px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,.04)",
        md: "0 2px 12px rgba(0,0,0,.06)",
        lg: "0 6px 24px rgba(0,0,0,.08)",
      },
      maxWidth: {
        text: "65ch",
        content: "1240px",
      },
      minWidth: {
        touch: "44px",
      },
      minHeight: {
        touch: "44px",
      },
      width: {
        touch: "44px",
      },
      height: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
export default config;
