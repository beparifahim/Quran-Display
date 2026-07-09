/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F4F1EA',
        night: '#121212',
        cream: '#E8E6D9',
      },
      fontFamily: {
        indopak: ['IndoPakQuran', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
