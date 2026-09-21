import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FAF6EC",
          50: "#FFFDF9",
          100: "#FAF6EC",
          200: "#F3EBD8",
          300: "#EADFC4",
        },
        ink: {
          DEFAULT: "#2B2A28",
          soft: "#5A574F",
        },
        perch: {
          DEFAULT: "#2F4D3A",
          50: "#EEF3EE",
          100: "#D9E4DB",
          200: "#A9C2AE",
          400: "#4C6F58",
          600: "#2F4D3A",
          700: "#233B2C",
          900: "#152219",
        },
        clay: {
          DEFAULT: "#C97C4B",
          light: "#E8B992",
        },
      },
      fontFamily: {
        serif: [
          '"Fraunces"',
          '"Iowan Old Style"',
          "Georgia",
          "Cambria",
          "serif",
        ],
        sans: [
          '"Inter"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(43, 42, 40, 0.06), 0 1px 2px rgba(43, 42, 40, 0.04)",
        lift: "0 8px 24px rgba(43, 42, 40, 0.10)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
