module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'blue-luxury': {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b8deff',
          300: '#7ac5ff',
          400: '#33a8ff',
          500: '#0a8fff',
          600: '#0070e6',
          700: '#0058b3',
          800: '#054a93',
          900: '#0a3f7a',
          950: '#06284d',
        },
        'blue-wardrobe': {
          light: '#1e40af',
          DEFAULT: '#1e3a8a',
          dark: '#1e293b',
        },
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
