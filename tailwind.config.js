/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class", // use class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: "#0284c7", // blue-500-ish
        skybg: "#e0f7fa"
      }
    },
  },
  plugins: [],
};
