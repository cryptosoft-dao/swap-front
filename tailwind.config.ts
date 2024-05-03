import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontSize: {
      xss: "10px",
      xs: "12px",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
      "7xl": "4.5rem",
      "8xl": "6rem",
      "9xl": "8rem",
    },
    extend: {
      colors: {
        primary: "#131A22",
        secondary: "#33363D33",
        secondary_50:"#33363D80",
        border_primary: "#33363D",
        text_primary: "#63707D",
        red:"#E25C5C",
        green:"#3F845F",
        blue: "#2752E7",
      },
    },
  },
  plugins: [],
};
export default config;
