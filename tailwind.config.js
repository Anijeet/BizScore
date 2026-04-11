/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary navy — matches Poonawalla's deep blue
        navy: {
          50:  '#eef2f9',
          100: '#d5e0f1',
          200: '#adc1e3',
          300: '#7a9bd0',
          400: '#4f78bc',
          500: '#2f5ba6',
          600: '#1e4690',
          700: '#163372',
          800: '#112558',
          900: '#0d1d44',
        },
        // Accent amber — Poonawalla's orange-gold
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Neutral surface colors
        surface: {
          50:  '#f8f9fb',
          100: '#f0f2f7',
          200: '#e2e6ef',
        },
      },
      fontFamily: {
        // Headings — Outfit is clean and modern
        heading: ['Outfit', 'sans-serif'],
        // Body — DM Sans is professional and highly readable
        body: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(13,29,68,0.08), 0 1px 2px -1px rgba(13,29,68,0.06)',
        'card-hover': '0 4px 16px 0 rgba(13,29,68,0.12), 0 2px 6px -1px rgba(13,29,68,0.08)',
        panel: '0 0 0 1px rgba(13,29,68,0.08), 0 2px 8px 0 rgba(13,29,68,0.06)',
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}
