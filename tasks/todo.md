# Wireframe Layout Redesign Pass — ALL existing screens (2026-07-17 session)

STATUS: COMPLETE. All screens in the locked order below were reviewed against
`Grocery-Delivery-App-Wireframe-Figma-Design.png`. See AGENT_LOG.md top entry
("ALL-SCREENS WIREFRAME PASS — SESSION SUMMARY") for the full rollup.

## Order (all resolved)
- [x] Home - done (prior session)
- [x] Categories - redesigned
- [x] Product Detail - redesigned
- [x] Customize - skipped (no wireframe equivalent)
- [x] Cart - redesigned
- [x] Checkout - reviewed, no change
- [x] Success - reviewed, no change
- [x] Orders - redesigned
- [x] Tracking - reviewed, no change (live map blocked on maps-SDK decision)
- [x] Wishlist - redesigned
- [x] Profile - reviewed, no change
- [x] Reviews (list) - reviewed, no change
- [x] Reviews (write) - redesigned
- [x] Coupons - reviewed, no change
- [x] Splash/Onboarding - redesigned (completed 4/4 slides)
- `AdminScreen.tsx` - skipped intentionally, not in wireframe kit

## Open decisions for the user (NOT auto-implemented, flagged only)
1. Real Pickup order-type support (BAS is currently delivery-only).
2. Dedicated card-based Payment Methods/Add Card screen vs keeping the
   current inline bKash/Nagad/Wallet flow in Checkout step 2.

## Review
Full per-screen review notes are in AGENT_LOG.md (one entry per screen/pair,
newest at top, working backward through 2026-07-17). Zero new tsc errors
introduced anywhere in this pass; several screens (Orders, Wishlist,
WriteReview) had a *net reduction* in pre-existing `unknown`-type errors as a
side effect of adding proper `safeArray<T>()` typing. All builds verified
with `npm run build` -> `✓ built`.
