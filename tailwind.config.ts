import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Brand Palette — cocoa / caramel (PRIMARY brand identity) ──────
      // Redesigned 2026-07-16 (Phase 2): was rose-pink, now mirrors the
      // cocoa/caramel `--color-coral` scale in src/index.css @theme so
      // `brand-*` classes render brown, not pink.
      // Note: ink.*, cream, paper, blush are defined in src/index.css @theme
      // Those take precedence in Tailwind v4 — don't redefine them here.
      colors: {
        brand: {
          50:  '#FBF3E7',
          100: '#F3E1C4',
          200: '#E8C68F',
          300: '#D9A85E',
          400: '#C68F3F',
          500: '#A8672E',   // ← PRIMARY (cocoa/caramel base)
          600: '#8A4F22',
          700: '#6B3A18',
          800: '#4E2A11',
          900: '#33200F',
        },
        gold: {
          DEFAULT: '#C9963C',   // aligned with --color-gold in src/index.css
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
        'btn':        '0 4px 12px rgba(168,103,46,0.30)',
      },

      // ── Fonts ─────────────────────────────────────────────────────────
      // Note: playfair/script tokens removed — not loaded in index.html and
      // never used anywhere; real brand fonts (Fraunces/Great Vibes/Inter)
      // live as font-display/font-brand/font-body in src/index.css @theme.
      fontFamily: {
        siliguri: ['"Hind Siliguri"', 'sans-serif'],
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
