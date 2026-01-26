import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        brand: ['"Bebas Neue"', 'sans-serif'],
        tagline: ['Cinzel', 'serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'var(--bg-color)',
        foreground: 'var(--text-primary)',
        card: {
          DEFAULT: 'var(--glass-bg)',
          foreground: 'var(--text-primary)',
        },
        popover: {
          DEFAULT: 'var(--glass-bg)',
          foreground: 'var(--text-primary)',
        },
        primary: {
          DEFAULT: 'var(--accent-gold)',
          foreground: 'var(--bg-color)',
        },
        secondary: {
          DEFAULT: 'var(--bg-secondary)',
          foreground: 'var(--text-secondary)',
        },
        muted: {
          DEFAULT: 'var(--bg-secondary)',
          foreground: 'var(--text-secondary)',
        },
        accent: {
          DEFAULT: 'var(--accent-gold)',
          foreground: 'var(--bg-color)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'var(--glass-border)',
        input: 'var(--glass-border)',
        ring: 'var(--accent-gold)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 8px)',
        sm: 'calc(var(--radius) - 12px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
