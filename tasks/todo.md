# BAS0002 — Phase L2: Purchase flow (batch B)

**Scope:** `ProductScreen.tsx`, `CartScreen.tsx`, `CheckoutScreen.tsx`, `CouponsScreen.tsx`, `CustomizeScreen.tsx`

**Reference screens:** `product`, `cart`, `order-type` + `delivery-address` + `review-summary` + `payments` (checkout steps)

**Key measurements to translate:**
- `.page` → 24px edge (`px-6`) — already adopted in L1
- `.back` / `.round-act` → 44px circle (2.75rem), white surface, shadow, NO border
- `.flabel` → 1.02rem / 600 / ink, margin 1.35rem top / .95rem bottom
- `.sec-row` rhythm → 1.5rem top / 1rem bottom
- `.citem` → border card, 1rem radius, .85rem padding, 1rem gap
- `.step` → 1.9rem circles, .85rem icon
- `.btn-row.bar` → rounded-top footer CTA bar
- `.paycard` / `.payr` → grouped radio rows
- `.ticket` → coupon ticket card
- `.phero` → 20.6rem hero, bottom rounded corners
- `.p-top` → floating controls on hero
- `.ptumbs` → thumbnail strip
- `.wchips` → weight chip row
- `.scontact` → store contact row with round-act buttons

**DO NOT TOUCH:**
- ProductScreen native touch listeners (lines 93–115)
- CartScreen swipe pointer listeners (lines 354–357)
- BottomTabBar.tsx
- Any color value
- Business logic / state management
