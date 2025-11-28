/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      padding: {
        'safe-top': 'max(32px, env(safe-area-inset-top, 32px))',
      },
      colors: {
        netflix: {
          black: '#000000',
          red: '#E50914',
          darkGray: '#222222',
          mediumGray: '#393939',
          lightGray: '#6D6D6D',
          white: '#FFFFFF',
        },
        darkcase: {
          // Base colors
          black: '#000000',
          dark: '#0a0a0a',
          darker: '#050505',
          darkGray: '#1a1a1a',
          mediumGray: '#2a2a2a',
          lightGray: '#6D6D6D',
          white: '#FFFFFF',
          // Blood & Crime theme
          blood: '#8B0000',
          bloodDark: '#5a0000',
          bloodLight: '#a00000',
          crimson: '#DC143C',
          crimsonDark: '#B01030',
          crimsonLight: '#FF1744',
          // Accent colors
          amber: '#FF6B00',
          amberDark: '#CC5500',
          // Status colors
          solved: '#00AA44',
          unsolved: '#DC143C',
          cold: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
        'gradient-blood': 'linear-gradient(135deg, rgba(139,0,0,0.1) 0%, rgba(220,20,60,0.1) 100%)',
        'gradient-crimson': 'linear-gradient(135deg, rgba(220,20,60,0.2) 0%, rgba(139,0,0,0.2) 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'blood': '0 0 20px rgba(220, 20, 60, 0.3)',
        'blood-lg': '0 0 40px rgba(220, 20, 60, 0.4)',
        'dark': '0 4px 20px rgba(0, 0, 0, 0.8)',
        'inner-dark': 'inset 0 2px 10px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(220, 20, 60, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(220, 20, 60, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

