/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans Devanagari"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        saffron: '#FF9933',
        india: '#138808',
        navy: '#0B1F3A',
        soil: {
          50: '#f7f3ec',
          100: '#eadfcb',
          700: '#6b4f2a',
          800: '#4a351c',
        },
        crop: {
          50: '#eef8f5',
          100: '#d4efe8',
          200: '#a8ddd1',
          300: '#6bc4b4',
          500: '#14967f',
          600: '#0d7a68',
          700: '#0a6b5c',
          800: '#085448',
          900: '#063d34',
        },
      },
    },
  },
  plugins: [],
};
