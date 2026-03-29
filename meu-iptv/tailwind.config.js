/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /** 
         * NonoTV Design System
         * 60-30-10 Rule: Dark Background (60%), Secondary (30%), Accent (10%)
         */
        bg: {
          primary: '#0A0B0F',
          secondary: '#12131A',
          tertiary: '#1A1C22',
          elevated: '#1E2028',
        },
        surface: {
          DEFAULT: '#1A1C22',
          hover: '#242630',
          active: '#2A2D38',
        },
        primary: {
          DEFAULT: '#F7941D',
          50: '#FFF5EB',
          100: '#FFE6D4',
          200: '#FFCCAA',
          300: '#FFB37F',
          400: '#FF994F',
          500: '#F7941D',
          600: '#C67216',
          700: '#995312',
          800: '#6B390D',
          900: '#3D1F09',
        },
        accent: {
          blue: '#3B82F6',
          emerald: '#10B981',
          rose: '#F43F5E',
          violet: '#8B5CF6',
        },
        content: {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.87)',
          tertiary: 'rgba(255, 255, 255, 0.60)',
          muted: 'rgba(255, 255, 255, 0.38)',
          disabled: 'rgba(255, 255, 255, 0.20)',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.16)',
          active: 'rgba(255, 255, 255, 0.24)',
        },
        state: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-4xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '900' }],
        'display-3xl': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '800' }],
        'display-2xl': ['2rem', { lineHeight: '1.2', letterSpacing: '0', fontWeight: '700' }],
        'display-xl': ['1.5rem', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '700' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2.5rem',
        '5xl': '3rem',
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(247, 148, 29, 0.15)',
        'glow-md': '0 0 40px rgba(247, 148, 29, 0.25)',
        'glow-lg': '0 0 60px rgba(247, 148, 29, 0.35)',
        'glow-accent': '0 0 30px rgba(247, 148, 29, 0.5)',
        'elevation-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'elevation-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'elevation-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
        'elevation-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in-down': 'fadeInDown 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(247, 148, 29, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(247, 148, 29, 0.4)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '450': '450ms',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}