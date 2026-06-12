import type { Config } from "tailwindcss";

const sharedPreset = require('@repo/shared/tailwind-preset');

const config: Config = {
  presets: [sharedPreset],
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [],
};
export default config;
