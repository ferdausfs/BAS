import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Brand Palette — coral pink (PRIMARY brand identity) ───────────
      // Note: ink.*, cream, paper, blush are defined in src/index.css @theme
      // Those take precedence in Tailwind v4 — don't redefine them here.
      colors: {
        brand: {
          50:  '#FFF9EC',
          100: '#FFF4F6',
          200: '#FFE4E9',
          300: '#FFB4C2',
          400: '#F17186',
          500: '#E8526A',   // ← PRIMARY
          600: '#DC3E58',
          700: '#C22E47',
          800: '#8F2135',
          900: '#5C1522',
        },
        gold: {
          DEFAULT: '#C8944A',
          light:   '#E8D3AC',
        },
        accent: {
          DEFAULT: '#2C8C4C',
          light:   '#E5F5EC',
          dark:    '#1F6337',
        },
      },

      // ── Radius ────────────────────────────────────────────────────────
      borderRadius: {
        'xl':   '0.75rem',
        '2xl':  '1rem',
        '3xl':  '1.5rem',
        '4xl':  '2rem',
        'pill': '9999px',
      },

      // ── Shadows ───────────────────────────────────────────────────────
      boxShadow: {
        'card':       '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
        'float':      '0 -4px 20px rgba(0,0,0,0.08)',
        'btn':        '0 4px 12px rgba(232,82,106,0.30)',
      },

      // ── Fonts ─────────────────────────────────────────────────────────
      fontFamily: {
        siliguri: ['"Hind Siliguri"', 'sans-serif'],
        script:   ['"Dancing Script"', 'cursive'],
        playfair: ['"Playfair Display"', 'serif'],
        sans:     ['"Inter"', '"Hind Siliguri"', 'sans-serif'],
      },

      // ── Spacing extras ────────────────────────────────────────────────
      spacing: {
        '18':  '4.5rem',
        '22':  '5.5rem',
        '88':  '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
} satisfies Config
