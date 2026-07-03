import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Brand Palette (Food App UI Kit — warm orange-red) ─────────────
      colors: {
        brand: {
          50:  '#FFF3EF',
          100: '#FFE4D9',
          200: '#FFCAB3',
          300: '#FFA07A',
          400: '#FF7140',
          500: '#E8472E',   // ← PRIMARY (buttons, active states, icons)
          600: '#CC3520',
          700: '#A82A18',
          800: '#83200F',
          900: '#5C160A',
        },
        accent: {
          DEFAULT: '#2C8C4C',  // green — sale badge, "order again" tag
          light:   '#E5F5EC',
          dark:    '#1F6337',
        },
        // Page backgrounds
        surface: {
          DEFAULT:   '#FFFFFF',   // card background
          page:      '#F7F7F9',   // page background (replaces gray-50)
          muted:     '#F0F0F3',   // input background
          overlay:   'rgba(26,48,55,0.55)',
        },
        // Text
        ink: {
          DEFAULT:     '#1A3037',   // headings
          secondary:   '#64748B',   // subtext
          tertiary:    '#94A3B8',   // placeholders
          inverse:     '#FFFFFF',
        },
        // Borders
        border: {
          DEFAULT: '#E8ECF0',
          strong:  '#CBD5E1',
        },
      },

      // ── Radius ────────────────────────────────────────────────────────
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'pill': '9999px',
      },

      // ── Shadows ───────────────────────────────────────────────────────
      boxShadow: {
        'card':       '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
        'float':      '0 -4px 20px rgba(0,0,0,0.08)',
        'btn':        '0 4px 12px rgba(232,71,46,0.30)',
      },

      // ── Fonts (keep Bengali + add clean system font) ──────────────────
      fontFamily: {
        siliguri: ['"Hind Siliguri"', 'sans-serif'],
        script:   ['"Dancing Script"', 'cursive'],
        playfair: ['"Playfair Display"', 'serif'],
        sans:     ['"Inter"', '"Hind Siliguri"', 'sans-serif'],
      },

      // ── Spacing extras ────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
} satisfies Config
