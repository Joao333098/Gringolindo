/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'unbounded': ['Unbounded', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        void: {
          DEFAULT: '#050505',
          surface: '#0A0A0A',
          highlight: '#111111',
          border: '#222222',
        },
        cyber: {
          red: '#FF003C',
          'red-dim': '#990024',
          green: '#00FF9D',
          yellow: '#FFD600',
        },
        text: {
          primary: '#EDEDED',
          secondary: '#888888',
          dim: '#444444',
        }
      },
      backgroundImage: {
        'glitch-border': 'linear-gradient(45deg, #FF003C, transparent 40%, transparent 60%, #FF003C)',
        'void-overlay': 'linear-gradient(to bottom, rgba(5,5,5,0), #050505)',
      },
      animation: {
        'glitch': 'glitch 0.3s infinite',
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        'pulse-red': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}