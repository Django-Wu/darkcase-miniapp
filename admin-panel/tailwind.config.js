/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkcase: {
          black: '#000000',
          dark: '#0a0a0a',
          darkGray: '#1a1a1a',
          mediumGray: '#2a2a2a',
          lightGray: '#6D6D6D',
          white: '#FFFFFF',
          crimson: '#DC143C',
          red: '#8B0000',
        },
      },
    },
  },
  plugins: [],
}

