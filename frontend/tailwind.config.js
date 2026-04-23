/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        text: 'var(--text)',
        'text-soft': 'var(--text-soft)',
        accent: 'var(--accent)',
        warm: 'var(--accent-warm)',
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 80px rgba(10, 31, 25, 0.14)',
      },
      backgroundImage: {
        'mesh-grid':
          'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
