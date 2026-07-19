import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Brand Palette — BAS0001 soft-pink (Phase 0, 2026-07-19) ───────
      // `brand-*` mirrors the new `--color-coral` / `--color-primary` pink
      // scale in src/index.css @theme so `bg-brand-500` / `accent-brand-500`
      // (form controls, sliders) render pink, not the old cocoa.
      // NOTE: ink.*, cream, paper, blush, coral, gold, primary/secondary/
      // accent/bg/surface/border/divider/text*/success/warning/error are all
      // defined in src/index.css @theme. Those take precedence in Tailwind v4
      // — don't redefine them here.
      colors: {
        brand: {
          50:  '#FFF9FB',
          100: '#FFE8F0',
          200: '#FFD6E4',
          300: '#FFC1D6',
          400: '#FB9DC0',
          500: '#F65F8F',   // ← PRIMARY (soft-pink base)
          600: '#E84E80',   // hover / pressed
          700: '#C73B68',
          800: '#A82E54',
          900: '#7E1F3E',
        },
        gold: {
          DEFAULT: '#E8A33C',   // retuned soft amber (ratings/badges) — was cocoa gold
          light:   '#FBE9C8',
        },
        accent: {
          DEFAULT: '#2FBF71',   // retuned to brief's success green (was brownish green)
          light:   '#E5F7EE',
          dark:    '#239957',
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

      // ── Shadows (soft, low-opacity, single-source, pink-tinted) ───────
      // Replaced the neutral-black-tinted cocoa shadows with pink-tinted
      // soft equivalents per the BAS0001 brief (depth ≠ hue, but the hue is
      // now pink, not neutral-black).
      boxShadow: {
        'card':       '0 2px 12px rgba(246,95,143,0.08)',
        'card-hover': '0 10px 28px -8px rgba(246,95,143,0.16)',
        'float':      '0 -4px 20px rgba(246,95,143,0.08)',
        'btn':        '0 4px 14px -4px rgba(246,95,143,0.40)',
      },

      // ── Fonts ─────────────────────────────────────────────────────────
      // Poppins governs Latin text/numerals; Hind Siliguri is the Bengali
      // renderer + fallback (most copy is Bengali). Fraunces / Great Vibes /
      // Inter removed from the stack (see index.html font <link>).
      fontFamily: {
        siliguri: ['"Hind Siliguri"', 'sans-serif'],
        sans:     ['"Poppins"', '"Hind Siliguri"', 'sans-serif'],
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
