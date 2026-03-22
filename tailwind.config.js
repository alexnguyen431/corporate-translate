/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Figtree",
          "system-ui",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        gasoek: ['"Gasoek One"', "Figtree", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          blue: "#1a73e8",
          "blue-hover": "#1557b0",
          surface: "#f8f9fa",
          border: "#dadce0",
          ink: "#202124",
          muted: "#5f6368",
        },
      },
      minHeight: {
        11: "2.75rem",
      },
      minWidth: {
        11: "2.75rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 2px 6px 2px rgba(60, 64, 67, 0.15)",
      },
    },
  },
  plugins: [],
};
