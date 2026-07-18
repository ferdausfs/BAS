# Cart — mat-frame item thumbnails + remove Delivery Address quick-access (2026-07-18)

## Context
User approved a mockup (adapted to BAS cream-coral theme, Bengali/৳) with:
1. Cart item thumbnail restyled from glass-strong to a white "mat-frame" —
   matching ProductCard.tsx's existing polaroid treatment (white bg, p-2
   padding border, product-card-shadow, inner image at rounded-[16px]).
2. Remove the "ডেলিভারি ঠিকানা" (Delivery Address) quick-access row entirely
   from CartScreen — user explicitly asked to drop it.

## Review (before fix)
- `src/screens/CartScreen.tsx` L140-151: item thumbnail wrapper is
  `h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl glass-strong` - no
  white mat border, uses the frosted-glass card system instead of
  ProductCard's mat-frame.
- `src/components/ProductCard.tsx` L84-95: reference mat-frame pattern -
  outer `bg-white p-2 border border-ink-50/80 product-card-shadow
  rounded-[22px]`, inner image `rounded-[16px]` (padding creates the visible
  white "mat" band around the photo).
- `src/screens/CartScreen.tsx` L243-275: "ডেলিভারি ঠিকানা" block - a
  horizontally-scrollable row of Home/Office/Parent's/Friend's quick-address
  buttons + "Add New", added in a prior wireframe pass. To be removed per
  user instruction. Note: actual address selection lives in the Checkout
  wizard (untouched) - this was only a Cart-page shortcut into it, so
  removing it does not break address selection, just removes the shortcut.

## Plan
- [ ] `CartScreen.tsx`: restyle item thumbnail wrapper - swap
  `glass-strong` for a mat-frame: outer `bg-white p-1.5 border
  border-ink-50/80 product-card-shadow rounded-2xl`, inner `<img>` wrapper
  `rounded-[14px] overflow-hidden`. Keep same `h-24 w-24` outer footprint so
  layout/spacing with the rest of the card is unaffected.
- [ ] `CartScreen.tsx`: also switch the outer item `<article>` card itself
  (currently `glass-strong`) to the same flat `bg-white border
  border-ink-50/80 product-card-shadow` treatment, so the whole cart row
  reads as one consistent mat-style card, not a glass card containing a
  mat-frame thumbnail (mixed systems would look inconsistent).
- [ ] `CartScreen.tsx`: delete the entire "ডেলিভারি ঠিকানা" section
  (L243-275, the comment block + the div.mt-5.mb-1 wrapper and its
  contents). No other state/props reference this block - safe standalone
  removal.
- [ ] Leave "Suggested add-ons" row and "বিল বিবরণ" (Bill) section
  untouched - out of scope for this change.
- [ ] Leave the empty-cart state's icon tile (uses glass-strong, L79)
  untouched - that's a different, unrelated empty-state icon, not an item
  card.

## Verify
- [ ] `npx tsc --noEmit` - confirm no new errors introduced.
- [ ] `npm run build` - confirm `✓ built`.

## Review (fill in after implementation)
