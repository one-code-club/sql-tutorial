import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#ff7a00',
          50: '#fff1e5',
          100: '#ffd9b3',
          200: '#ffc180',
          300: '#ffa94d',
          400: '#ff9426',
          500: '#ff7a00',
          600: '#cc6300',
          700: '#994b00',
          800: '#663200',
          900: '#331900',
        },
      },
      borderRadius: {
        lg: '12px',
        md: '10px',
        sm: '8px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config


