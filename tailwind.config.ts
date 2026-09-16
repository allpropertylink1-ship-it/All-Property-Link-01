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
          DEFAULT: "#1E3A40",
          foreground: "#FFFFFF",
          50: "#EDF4F4", 100: "#D3E5E8", 200: "#A9C6CB", 300: "#6E99A1",
          400: "#35616A", 500: "#1E3A40", 600: "#162C31",
          700: "#12242A", 800: "#0E1E23", 900: "#0A1519",
        },
        error: {
          DEFAULT: "#BA1A1A",
          50: "#FFF5F4", 200: "#FFDAD6", 500: "#BA1A1A", 600: "#93000A", 700: "#680008",
        },
        accent: {
          50: "#FEF6EA",
          100: "#FCEBD3",
          200: "#F8D5A8",
          300: "#F4B978",
          400: "#EC9448",
          500: "#E27A23",
          600: "#C25E12",
          700: "#9A4A0E",
          800: "#7A3A0B",
          900: "#4E2507",
        },
        whatsapp: {
          DEFAULT: "#25D366",
          dark: "#1DA851",
        },
        success: {
          50: "#F0FDF4",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
        },
        warning: {
          50: "#FFFBEB",
          200: "#FDE68A",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
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
        sm: "0 1px 3px 0 rgba(30,58,64,.04), 0 1px 2px -1px rgba(30,58,64,.02)",
        md: "0 1px 3px 0 rgba(30,58,64,.05), 0 4px 8px -2px rgba(30,58,64,.04)",
        lg: "0 12px 24px -4px rgba(30,58,64,.08), 0 4px 8px -2px rgba(30,58,64,.03)",
      },
      maxWidth: {
        text: "65ch",
        content: "1440px",
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
