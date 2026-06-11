/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rust: '#C0392B',
        chalk: '#F5F0E8',
        ink: '#1A1A1A',
        slate: '#4A4A4A',
        smoke: '#E8E2D9',
        steel: '#7F8C8D',
        sprocket: '#F39C12',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        // Avoiding rounded-lg intentionally per your spec
      }
    },
  },
  plugins: [],
} 