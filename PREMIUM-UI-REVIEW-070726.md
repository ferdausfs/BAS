# Premium UI Polish — Review Report

**Repo:** https://github.com/ferdausfs/BAS
**Date:** 2026-07-15
**Scope:** Better design/colors + smooth animations (Home screen, ProductCard, global CSS)
**Method:** Read-only review of `src/index.css`, `src/components/ProductCard.tsx`, `src/screens/HomeScreen.tsx`, `src/screens/ProductScreen.tsx`

---

## Check 1: Card hover / lift feedback
**Code reference:** `src/components/ProductCard.tsx:90-91` (wrapCls), `src/index.css:182` (.card)
**What found:** ProductCard uses `active:scale-[.97]` (press only) and `group-hover:scale-[1.05]` on the image only. The card itself never lifts on hover, and `.card` has no hover transition. On a phone (no real hover) the press feedback exists, but there is zero "raised surface" depth cue and no smooth transition on the container.
**Gap:** No container-level hover-lift + no smooth easing on `.card`. Premium feel needs the whole card to feel tactile (lift + shadow grow).

## Check 2: Transition speed / easing consistency
**Code reference:** `src/index.css:54-72` (easing vars), `src/index.css:161` (.btn-primary transition .15s), `src/index.css:170` (.btn-secondary .15s)
**What found:** Global easing curves exist (`--ease-premium`, `--ease-spring`), good. But most component transitions are `150ms` flat `ease`. That reads "snappy/utilitarian", not "weighty/premium".
**Gap:** Bump key transitions to ~250-300ms with the premium easing so motion feels intentional.

## Check 3: Glass shadow depth
**Code reference:** `src/index.css:219-238` (.glass-strong, .glass-deep)
**What found:** Glass surfaces use multi-layer shadows already (good). But the simpler `.card` / `.card-flat` surfaces are flat with a single soft shadow — they don't share the same depth language as the glass system.
**Gap:** Bring `.card`/`.card-flat` up to the same layered-shadow depth so ALL white surfaces feel cohesive.

## Check 4: Button micro-interaction on tap
**Code reference:** `src/index.css:157-179` (.btn-primary / .btn-secondary / .btn-ghost)
**What found:** Buttons have hover + active translateY, but no scale "pop" and no glow pulse on tap. Tap feels dead.
**Gap:** Add a subtle `active:scale(.97)` + glow so the primary CTA feels alive.

---

## Summary
| Check | Priority | File |
|-------|----------|------|
| 1. Card hover-lift + easing | High | index.css, ProductCard.tsx |
| 2. Slower premium transitions | Med | index.css |
| 3. Deeper cohesive card shadows | Med | index.css |
| 4. Button tap pop + glow | Low | index.css |

## Raw code snippets
```css
/* ProductCard wrapCls (current) */
const wrapCls = isGrid
  ? 'group relative cursor-pointer overflow-hidden rounded-[22px] glass p-2 transition-all duration-200 active:scale-[.97]'
  : 'group relative flex w-[168px] flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-[22px] glass p-2 transition-all duration-200 active:scale-[.97]';

/* .card (current) */
.card {
  background: #FFFFFF;
  border-radius: 24px;
  border: 1.5px solid rgba(0,0,0,0.055);
  box-shadow:
    0 1px 2px rgba(0,0,0,0.04),
    0 6px 18px -8px rgba(0,0,0,0.10);
}
```

---

## How the fix will work (approach)
1. `.card` / `.card-flat` get `transition` + `:hover` lift (translateY -3px) + deeper layered shadow matching the glass system. Pure CSS — no JSX change needed because ProductCard already uses `glass` class which is a sibling of `.card` styling; we add a shared lift behavior.
2. Global transition timing for buttons raised 150ms → 220-260ms using `--ease-premium`.
3. `.btn-primary` gets `active:scale(.97)` + a soft coral glow on `:active`.
4. ProductCard wrapCls gets `hover:-translate-y-1` + `hover:shadow-xl` so the card lifts on pointer devices and keeps press-scale on touch.

All changes are CSS-class + index.css only → **low risk, no logic change, no new imports**.
