import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#082091",
          darkNavy: "#0A192F",
          sidebar: "#071739",
          gold: "#F5B301",
          goldHover: "#E5A000",
          teal: "#14B8A6",
          tealDark: "#0D9488",
          bg: "#F8FAFC",
        },
        status: {
          paid: "#10B981",
          pending: "#F59E0B",
          overdue: "#EF4444",
        },
        navy: {
          50: "#f0f4f9",
          100: "#d9e2f0",
          200: "#b7c9e3",
          300: "#8ca8d3",
          400: "#6384c1",
          500: "#082091", // Brand Navy
          600: "#081d80",
          700: "#1b365d", 
          800: "#0f2347", 
          900: "#0b1b3d", // Midnight Blue
          950: "#071739", // Deepest Navy
        },
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          500: "#14b8a6", // Brand Teal
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
        },
        amber: {
          400: "#fbbf24",
          500: "#f5b301", // Brand Gold
          600: "#d97706",
          700: "#b45309",
        },
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "Poppins", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
