/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // This line tells Tailwind to toggle based on a class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}