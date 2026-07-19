# Phase 4 — Post-purchase screens (soft-pink redesign)

## Scope
`src/screens/OrdersScreen.tsx`, `src/screens/TrackingScreen.tsx`,
`src/screens/SuccessScreen.tsx`, `src/screens/ReviewsListScreen.tsx`,
`src/screens/WriteReviewScreen.tsx`

## Checklist

### OrdersScreen.tsx
- [ ] Replace `glass-strong` → `bg-surface border border-border shadow-card rounded-[20px]` (solid opaque)
- [ ] Remove cocoa inline hexes (`#FDF8F1`, `#F3E4D0`, rgba cocoa shadows) → soft-pink system tokens
- [ ] Remove `linear-gradient` (coral→gold top accent, gold→coral progress fill) → flat `bg-coral` / soft primary fill
- [ ] Replace `font-brand` → plain bold Poppins body (no script)
- [ ] Replace `font-display` → remove (already maps to Poppins, but clean up explicit calls → just use `font-bold`)
- [ ] Replace cocoa-tinted inline box-shadows → pink-tinted soft shadows (`shadow-card`)
- [ ] Ensure 8px spacing grid compliance
- [ ] Verify QuickBar-safe header spacing (pr-18 range)
- [ ] Keep tab/search/expand/reorder logic untouched

### TrackingScreen.tsx
- [ ] Replace all `glass-strong` → solid opaque surface tokens
- [ ] Replace cocoa inline box-shadows → pink-tinted soft shadows
- [ ] Replace `bg-ink` support FAB → `bg-coral` (primary CTA color)
- [ ] Ensure back button style matches premium soft-pink (white bg, soft shadow, rounded-full)
- [ ] Verify fixed-position FAB vs BottomTabBar/QuickBar stacking (z-index)
- [ ] Keep native touch listeners / polling / cancel-logic untouched

### SuccessScreen.tsx
- [ ] Replace `mesh-warm` → flat `bg-bg` (`#FFF9FB`)
- [ ] Replace confetti cocoa hexes (`#A8672E`, `#C9963C`, `#E8C68F`, etc.) → soft-pink + amber palette
- [ ] Replace `glass-strong` → solid opaque surface tokens
- [ ] Replace `bg-gradient-to-br from-coral-400 to-coral-600` checkmark → solid `bg-coral` with pink shadow
- [ ] Replace cocoa inline shadow hexes → pink-tinted shadows
- [ ] SVG blob `text-blush-200` → stays (already soft pink)
- [ ] Keep confetti animation, copy-ID, track/home CTAs untouched

### ReviewsListScreen.tsx
- [ ] Replace all `glass-strong` → solid opaque surface tokens
- [ ] Replace header `border-b border-ink-50` → `border-border`
- [ ] Add proper back-button styling (shadow, rounded, matches other screens)
- [ ] Replace `bg-coral` rating bars → `bg-coral` stays (it's already the primary)
- [ ] Add designed empty state (currently bare text)
- [ ] Keep filter/search/sort logic untouched
- [ ] Fix unused `go` import (TS6133)

### WriteReviewScreen.tsx
- [ ] Replace `glass-strong` → solid opaque surface tokens
- [ ] Replace `bg-cocoa-700` submit button → `bg-coral` (primary CTA)
- [ ] Replace header `border-b border-ink-50` → `border-border`
- [ ] Add proper back-button styling
- [ ] Add image upload dashed-border restyle to soft-pink (`border-coral/30`)
- [ ] Keep star input, textarea, file upload, submit logic untouched

### Cross-cutting
- [ ] `npx tsc --noEmit` — zero new errors vs baseline
- [ ] `npm run build` — must succeed
- [ ] No remaining `glass-strong` / `cocoa` / cocoa hexes in Phase 4 files
- [ ] Fixed-overlay cross-check (QuickBar, BottomTabBar, ChatBot) vs new fixed elements
