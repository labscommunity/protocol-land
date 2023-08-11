/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'liberty-dark': {
          50: '#4C61A2',
          100: '#445792',
          200: '#3d4e82',
          300: '#354471',
          400: '#2e3a61',
          500: '#263151',
          600: '#1e2741',
          700: '#171d31',
          800: '#0f1320',
          900: '#080a10'
        },
        'liberty-light': {
          50: '#edeff6',
          100: '#dbdfec',
          200: '#c9d0e3',
          300: '#b7c0da',
          400: '#a6b0d1',
          500: '#94a0c7',
          600: '#8290be',
          700: '#7081b5',
          800: '#5e71ab',
          900: '#4c61a2'
        }
      }
    }
  },
  plugins: []
}
