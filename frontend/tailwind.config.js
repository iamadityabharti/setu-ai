/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#081220',
          900: '#0E1D33',
          850: '#132A4C', // Core Primary Institutional Trust
          800: '#193660',
          700: '#23497F',
          600: '#2F5F9F',
          200: '#CBD9EC',
          100: '#E4ECF6',
          50:  '#F2F6FB',
        },
        sand: {
          700: '#9E875C',
          600: '#BD9F6F',
          500: '#D4B98B',
          400: '#E8DCC4', // Core Secondary Citizen Warmth
          300: '#F1E8D7',
          200: '#F7F3EA',
          100: '#FAF8F3',
          50:  '#FCFAF7',
        },
        // Terracotta-red ONLY for urgency / high priority signals
        terracotta: {
          DEFAULT: '#C1502E',
          hover:   '#A84223',
          dark:    '#983416',
          light:   '#FDEEE9',
          border:  '#F3C4B6',
        },
        civic: {
          bg: '#F7F6F2',
          surface: '#FFFFFF',
          border: '#DFD9CE',
          subtle: '#ECE8E0',
          emerald: '#1B7A53',
          cyan: '#126D8A',
          amber: '#A36B14',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'IBM Plex Sans', 'Inter', 'sans-serif'],
        serif: ['IBM Plex Serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'civic-xs': '0 1px 2px rgba(11, 23, 40, 0.04)',
        'civic-sm': '0 2px 6px -1px rgba(11, 23, 40, 0.06), 0 1px 3px rgba(11, 23, 40, 0.03)',
        'civic-md': '0 6px 16px -2px rgba(11, 23, 40, 0.08), 0 2px 6px -1px rgba(11, 23, 40, 0.04)',
        'civic-lg': '0 14px 34px -4px rgba(11, 23, 40, 0.11), 0 4px 12px -2px rgba(11, 23, 40, 0.05)',
      }
    },
  },
  plugins: [],
}
