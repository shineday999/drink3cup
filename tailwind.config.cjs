/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#F2EFE5",
          100: "#DDD8C7",
          200: "#BFB89E",
          300: "#9A9175",
          400: "#73704D",
          500: "#64452e",
          600: "#4e3422",
          700: "#39281c",
          800: "#291c12",
          900: "#1c130d",
        },
        cream: {
          50: "#FAF7EE",
          100: "#F2EDDF",
          200: "#E8E2D0",
          300: "#D8D1BB",
        },
        terra: {
          300: "#D29E7B",
          500: "#A45E3D",
          700: "#5F3220",
        },
        accent: {
          300: "var(--color-accent-300)",
          500: "var(--color-accent-500)",
          700: "var(--color-accent-700)",
        },
        bamboo: {
          400: "#a06c46",
          500: "#815231",
        },
        stone: {
          400: "#8B8275",
          600: "#4A4538",
        },
        // 別名給現有程式碼繼續運作
        bg: {
          base: "var(--color-bg-base)",
          card: "var(--color-bg-card)",
          elevated: "var(--color-bg-elevated)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Noto Serif SC"', "Georgia", "serif"],
        sans: ["Inter", '"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-md": [
          "3.75rem",
          { lineHeight: "1.15", letterSpacing: "-0.01em" },
        ],
        "display-sm": [
          "2.5rem",
          { lineHeight: "1.2", letterSpacing: "-0.005em" },
        ],
      },
      spacing: {
        section: "5rem",
        "section-lg": "6rem",
      },
      borderRadius: {
        card: "4px",
      },
      boxShadow: {
        soft: "0 2px 24px rgba(41, 28, 18, 0.06)",
        "soft-lg": "0 8px 48px rgba(41, 28, 18, 0.1)",
      },
      borderColor: {
        DEFAULT: "var(--color-text-primary)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "accent-300": "var(--color-accent-300)",
        "accent-500": "var(--color-accent-500)",
        "accent-700": "var(--color-accent-700)",
      },
      transitionTimingFunction: {
        organic: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
