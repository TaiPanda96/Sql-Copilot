/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        excel: ['Arial', 'Helvetica', 'sans-serif'],
        'excel-bold': ['Arial Black', 'Arial Bold', 'Arial', 'sans-serif']
      },
      colors: {
        excel: {
          primary: '#2E8B57',
          secondary: '#98FB98',
          accent: '#C1E1C1',
          dark: '#1A4731',
          light: '#F5F5F5',
          gray: '#E8E8E8'
        }
      },
      animation: {
        blob: "blob 7s infinite"
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)"
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)"
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)"
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)"
          }
        }
      },
      backgroundImage: {
        'gradient-excel': 'linear-gradient(to bottom right, var(--color-excel-accent), var(--color-excel-light), var(--color-excel-gray))'
      },
      boxShadow: {
        'excel': '0 4px 6px -1px rgba(46, 139, 87, 0.1), 0 2px 4px -1px rgba(46, 139, 87, 0.06)'
      }
    }
  },
  plugins: []
}