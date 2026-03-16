import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.12)"
      },
      colors: {
        sand: "#f6f0df",
        pine: "#1d4d3b",
        moss: "#5e7f54",
        ember: "#e98d5b",
        ink: "#1e293b"
      }
    }
  },
  plugins: []
};

export default config;
