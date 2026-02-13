/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb", // blue-600
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f1f5f9", // slate-100
          foreground: "#0f172a", // slate-900
        },
        muted: "#f3f4f6", // gray-100
        accent: "#22d3ee", // cyan-400
        destructive: "#ef4444", // red-500
        background: "#f8fafc", // slate-50
        foreground: "#0f172a", // slate-900
        card: "#ffffff",
        border: "#e5e7eb", // gray-200
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "Avenir",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        heading: [
          '"DM Sans"',
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Avenir",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      screens: {
        xs: "30rem", // 480px
        "2xl": "100rem", // 1600px
        "3xl": "120rem", // 1920px
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tw-animate-css")],
};
