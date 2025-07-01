import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))', // Teal for approved
          '2': 'hsl(var(--chart-2))', // Yellow for pending
          '3': 'hsl(var(--chart-3))', // Red for rejected
          '4': 'hsl(var(--chart-4))', // Blue for trends
          '5': 'hsl(var(--chart-5))'  // Purple for user activity
        },
        teal: {
          500: '#14b8a6',
          600: '#0d9488'
        },
        yellow: {
          500: '#eab308',
          600: '#ca8a04'
        },
        red: {
          500: '#ef4444',
          600: '#dc2626'
        }
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],     // ~11.2px
        sm: ['0.819rem', { lineHeight: '1.2rem' }], // ~13px
        base: ['0.9375rem', { lineHeight: '1.4rem' }], // ~15px
        lg: ['1.0625rem', { lineHeight: '1.6rem' }],   // ~17px
        xl: ['1.1875rem', { lineHeight: '1.7rem' }],   // ~19px
        '2xl': ['1.375rem', { lineHeight: '1.9rem' }], // ~22px
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif']
      },
      spacing: {
        1.5: '0.375rem', // 6px for smaller padding/margins
        3: '0.75rem',    // 12px for compact layouts
        3.5: '0.875rem', // 14px for slightly larger icons
      },
      width: {
        3.5: '0.875rem', // 14px for slightly larger icons
        140: '8.75rem'   // 140px for select inputs
      },
      height: {
        3.5: '0.875rem'  // 14px for slightly larger icons
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fadeIn': 'fadeIn 0.5s ease-in'
      }
    }
  },
  plugins: [tailwindcssAnimate],
};

export default config;