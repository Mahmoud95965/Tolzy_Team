/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-almarai)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Perk Design System Tokens
        lime: {
          DEFAULT: '#beff50',
          accent: '#beff50',
          hover: '#abf03c',
        },
        ink: {
          DEFAULT: '#14140f',
          muted: '#6e6e64',
        },
        parchment: {
          DEFAULT: '#f5f5eb',
          surface: '#f5f5eb',
          subtle: '#ebebe0',
        },
        ash: {
          DEFAULT: '#d2d2c8',
          subtle: '#e2e2da',
        },
        graphite: '#6e6e64',
        charcoal: '#30302a',
        stone: '#919183',
        smoke: '#b9b9b7',

        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      borderRadius: {
        'card': '28px',
        'button': '28px',
        'inner': '18px',
        'pill': '9999px',
        'input': '8px',
      },
      letterSpacing: {
        'display': '-0.03em',
        'eyebrow': '0.1em',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('/image/grid.svg')",
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'neon': '0 0 10px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  corePlugins: {
    preflight: true,
  },
};