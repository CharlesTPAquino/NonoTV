/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#b6a0ff",
        surface: "#0e0e0f",
        nord: {
          gold: "#F7941D"
        },
        nono: {
          gold: "var(--nono-gold)",
          goldGlow: "var(--nono-gold-glow)",
        },
        ds: {
          matteBlack: "var(--ds-matte-black)",
          cardBg: "var(--ds-card-bg)",
        },
        theme: {
          primary: "var(--theme-primary)",
          bg: "var(--theme-bg)",
          surface: "var(--theme-surface)",
          text: "var(--theme-text)",
          muted: "var(--theme-text-muted)",
        },
        tv: {
          bgPrimary: "var(--tv-bg-primary)",
          bgSecondary: "var(--tv-bg-secondary)",
          textPrimary: "var(--tv-text-primary)",
          textSecondary: "var(--tv-text-secondary)",
          accent: "var(--tv-accent)",
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.02em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.03em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.04em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.05em' }],
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.06em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
        '128': '32rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'glow': '0 0 20px var(--nono-gold-glow), 0 0 40px var(--nono-gold-glow)',
        'glow-sm': '0 0 10px var(--nono-gold-glow)',
        'glow-lg': '0 0 30px var(--nono-gold-glow), 0 0 60px var(--nono-gold-glow)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 20px 40px rgba(0, 0, 0, 0.4)',
        'inner-glow': 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        'focus': '0 0 0 3px var(--theme-primary), 0 0 20px var(--theme-primary)',
        'tv-focus': 'var(--tv-focus-border), var(--tv-focus-bg)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
      },
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
      zIndex: {
        'dropdown': '100',
        'modal': '200',
        'overlay': '300',
        'toast': '400',
      },
      screens: {
        'xs': '475px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
      minHeight: {
        'touch': '44px',
        'touch-sm': '36px',
      },
      minWidth: {
        'touch': '44px',
        'touch-sm': '36px',
      },
    },
  },
  plugins: [],
}
