/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        lekton: ['Lekton', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif']
      },
      dropShadow: {
        default: '0 50px 60px rgba(109, 171, 213, 0.4)'
      },
      backgroundImage: {
        'gradient-dark':
          'linear-gradient(275deg, rgba(255, 255, 255, 0.50) -23.79%, rgba(255, 255, 255, 0.17) 141.13%)',
        'gradient-dark-hover':
          'linear-gradient(275deg, rgba(180, 180, 180, 0.40) -23.79%, rgba(255, 255, 255, 0.1) 141.13%)'
      },
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
        },
        primary: {
          50: '#F5FCFF',
          100: '#EBF8FF',
          200: '#D7F1FE',
          300: '#BBE6FB',
          400: '#92D5F6',
          500: '#77C6ED',
          600: '#56ADD9',
          700: '#419AC6',
          800: '#387C9E',
          900: '#30637D'
        },
        gray: {
          50: '#F9FAFB',
          100: '#F2F4F7',
          200: '#EAECF0',
          300: '#D0D5DD',
          400: '#98A2B3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1D2939',
          900: '#101828'
        },
        error: {
          50: '#FEF3F2',
          100: '#FEE4E2',
          200: '#FECDCA',
          300: '#FDA29B',
          400: '#F97066',
          500: '#F04438',
          600: '#D92D20',
          700: '#B42318',
          800: '#912018',
          900: '#7A271A'
        },
        warning: {
          50: '#FFFAEB',
          100: '#FEF0C7',
          200: '#FEDF89',
          300: '#FEC84B',
          400: '#FDB022',
          500: '#F79009',
          600: '#DC6803',
          700: '#B54708',
          800: '#93370D',
          900: '#7A2E0E'
        },
        success: {
          50: '#ECFDF3',
          100: '#D1FADF',
          200: '#A6F4C5',
          300: '#6CE9A6',
          400: '#32D583',
          500: '#12B76A',
          600: '#039855',
          700: '#027A48',
          800: '#05603A',
          900: '#054F31'
        }
      }
    }
  },
  plugins: []
}
