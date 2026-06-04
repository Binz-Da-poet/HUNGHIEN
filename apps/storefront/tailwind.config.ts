import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e3a8a", // Navy Blue
        secondary: "#047857", // Dark Green
        accent: "#f97316", // Orange
      }
    },
  },
  plugins: [],
}
export default config