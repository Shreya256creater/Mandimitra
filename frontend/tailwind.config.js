/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        soil: {
          50: '#f7f3ec',
          100: '#eadfcb',
          700: '#6b4f2a',
          800: '#4a351c',
        },
        crop: {
          50: '#f1f8f2',
          100: '#dceee0',
          500: '#3d8c4e',
          600: '#2f6f3d',
          700: '#245732',
          900: '#14321c',
        },
      },
    },
  },
  plugins: [],
};
