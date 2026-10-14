/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        udemy: {
          dark: '#1c1d1f',
          gray: '#2d2f31',
          lightgray: '#6a6f73',
          border: '#d1d7dc',
          bg: '#f7f9fa',
          purple: {
            DEFAULT: '#a435f0',
            dark: '#8710d8',
            hover: '#5624d0',
            light: '#f3e8ff'
          },
          gold: '#b4690e',
          amber: '#eceb98'
        },
        brand: {
          primary: '#2563eb', // Blue tech brand
          secondary: '#7c3aed', // Purple accent
          accent: '#06b6d4',
          dark: '#0f172a',
          surface: '#1e293b'
        }
      },
      fontFamily: {
        sans: [
          'Udemy Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Roboto',
          '"Segoe UI"',
          'Helvetica',
          'Arial',
          'sans-serif'
        ]
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.08)',
        'card-hover': '0 4px 16px rgba(0,0,0,.14)',
        'popup': '0 2px 4px 0 rgba(0,0,0,0.1), 0 4px 16px 0 rgba(0,0,0,0.15)'
      }
    },
  },
  plugins: [],
}
