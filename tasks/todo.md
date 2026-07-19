# BAS0002 — Phase L3 (Post-purchase batch C) — todo

Scope: re-measure spacing/structure of the 5 post-purchase screens against the
GroceryApp reference (`orders` / `cancel-order` / `track-order` / `track-map` /
`payment-success` / `reviews` / `review-product`). NO colors, NO logic, NO gestures,
NO BottomTabBar, NO auth screens. Translate reference *proportions* into BAS's
fixed-rem Tailwind scale (calibrated to ~390–430px), consistent with L0/L1/L2.

## Conventions being applied (established in L0/L1/L2)
- [ ] Page edge → 24px (`px-6`); SuccessScreen `px-7`→`px-6` to match BAS-wide edge.
- [ ] Back / round-action buttons → 44px circle (`h-11 w-11`), `rounded-full bg-surface
      shadow-card`, NO border, icon `h-5 w-5` (20px). Already had shadow + no border;
      only bumping 40→44px + icon size.
- [ ] Content card radius `rounded-[20px]` → `rounded-2xl` (16px) ↔ reference
      `.ocard`/`.rcard`/`.bcard`/`paycard`/`ticket` `border-radius:1rem`.
- [ ] Order item-row gap → `gap-4` (16px) ↔ reference `.oitem`/`.citem` `gap:1rem`.
- [ ] Review avatar → `h-11 w-11` ↔ reference `.rcard .rav` 2.9rem.
- [ ] WriteReview footer padding `p-5` → `px-6 py-4` ↔ reference `.btn-row{padding:1rem 1.5rem}`.

## Files
- [ ] `src/screens/OrdersScreen.tsx`      (ref: orders / cancel-order)
- [ ] `src/screens/TrackingScreen.tsx`    (ref: track-order / track-map)
- [ ] `src/screens/SuccessScreen.tsx`     (ref: payment-success success() helper)
- [ ] `src/screens/ReviewsListScreen.tsx` (ref: reviews)
- [ ] `src/screens/WriteReviewScreen.tsx` (ref: review-product)

## Verify (self)
- [ ] `npx tsc --noEmit` — 31 errors, identical to baseline (zero new/removed).
- [ ] `npm run build` — passes.
- [ ] Reference-gray grep (`#909090 #7f7f7f #9b9b9b #969696 #8f8f8f #9c9c9c #acacac
      #c0c0c0 #f7f7f7 #f8f8f8 #f4f4f4 #f5f4f4 #d9d9d9 #e7e7e7 #ededed`) → ZERO in changed files.
- [ ] `git diff`: no color hex, no token change, `BottomTabBar.tsx` ZERO diff,
      no business logic touched, claims re-verified against actual file.
- [ ] Package only changed files into `bas0002-layout-phaseL3-<ts>.zip`.
- [ ] New `AGENT_LOG.md` entry on top (next = Phase L4).
