/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 12px 40px rgba(124, 58, 237, 0.35)'
      }
    }
  },
  plugins: []
};
