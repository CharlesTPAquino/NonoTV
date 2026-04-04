/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.02em', fontWeight: '500' }],
        'sm': ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0', fontWeight: '500' }],
        'base': ['0.9375rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em', fontWeight: '400' }],
        'lg': ['1.0625rem', { lineHeight: '1.5rem', letterSpacing: '-0.015em', fontWeight: '500' }],
        'xl': ['1.1875rem', { lineHeight: '1.75rem', letterSpacing: '-0.02em', fontWeight: '500' }],
        '2xl': ['1.375rem', { lineHeight: '1.75rem', letterSpacing: '-0.03em', fontWeight: '600' }],
        '3xl': ['1.75rem', { lineHeight: '2rem', letterSpacing: '-0.04em', fontWeight: '600' }],
        '4xl': ['2rem', { lineHeight: '2.25rem', letterSpacing: '-0.05em', fontWeight: '600' }],
      },
      borderRadius: {
        'sm': 'var(--r-sm)',
        'DEFAULT': 'var(--r)',
        'md': 'var(--r-md)',
        'lg': 'var(--r-lg)',
      },
      screens: { 'xs': '475px', '3xl': '1920px' },
    },
  },
  plugins: [],
}
