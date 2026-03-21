/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#b6a0ff",
        surface: "#0e0e0f",
      }
    },
  },
  plugins: [],
}
