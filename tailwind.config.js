/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf9fa',
          100: '#f4f2f4',
          200: '#e9e5e8',
          300: '#d8d0d6',
          400: '#c1b3bc',
          500: '#a89aa5',
          600: '#8f7f8a',
          700: '#7f6f79',
          800: '#6b5b65',
          900: '#5a4d56',
        },
        accent: {
          400: '#8f7f8a',
          500: '#7f6f79',
          600: '#6b5b65',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'display': ['Cal Sans', 'Inter', 'sans-serif']
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px #6366f1' },
          'to': { boxShadow: '0 0 30px #8b5cf6, 0 0 40px #8b5cf6' },
        }
      }
    },
  },
  plugins: [],
} 