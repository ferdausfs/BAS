## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0002 — Layout & Spacing Pass — Phase L3 (Post-purchase batch C) (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase worked on:** **Phase L3 — Post-purchase (batch C):** `OrdersScreen.tsx`, `TrackingScreen.tsx`,
`SuccessScreen.tsx`, `ReviewsListScreen.tsx`, `WriteReviewScreen.tsx`. The previous BAS0002 entry is Phase L2,
so this run correctly starts at L3. **NEXT RUN = Phase L4 (Account/admin/splash/chrome).**

### কী বদলেছে — measured against the GroceryApp reference (no colors touched)
All changes are spacing / structure only — the reference's *proportions* were translated into BAS's
fixed-rem Tailwind scale; every color stays the finished soft-pink token set (no hex, no token swap).

**Conventions adopted (matching L0 foundation + L1/L2 patterns):**

- **`.page` → 24px page edge (`px-6`)**: applied on every page-edge wrapper / content scroller across all
  five screens. `SuccessScreen` outer `px-7`(28px) → `px-6`(24px) so it matches the BAS-wide 24px edge
  (the reference `success()` / `.succ-wrap` uses 35px, but every other BAS screen is 24px — chose
  consistency with the rest of BAS; noted here as an explicit interpretation). Button-internal `px-5`/`px-7`
  (e.g. `btn-primary px-7` on the Orders empty-state CTA, `btn-primary px-5` on the Tracking "My orders"
  CTA) deliberately LEFT untouched per the page-edge-swap lesson.

- **`.back` / `.round-act` → 44px circle, surface bg, shadow, NO border**:
  - `OrdersScreen` header search button `h-10 w-10` → `h-11 w-11`(44px) + icon `h-[18px] w-[18px]` → `h-5 w-5`(20px).
  - `TrackingScreen` back button `h-10 w-10` → `h-11 w-11` + icon `h-[20px] w-[20px]` → `h-5 w-5`.
  - `ReviewsListScreen` back button `h-10 w-10` → `h-11 w-11` (icon already `h-5 w-5`).
  - `WriteReviewScreen` back button `h-10 w-10` → `h-11 w-11` (icon already `h-5 w-5`).
  - All already had `bg-surface shadow-card` and NO border — only the size + icon were normalized to the
    L0 convention. The `Package` empty-state *icon* (`h-10 w-10`) is not a button and was left as-is.

- **Card radius**: `rounded-[20px]` → `rounded-2xl`(16px) across all five screens — matches reference card
  radius `1rem` (`.ocard`, `.rcard`, `.bcard`, `.paycard`, `.ticket` body). Affects: order cards
  (OrdersScreen / TrackingScreen), SuccessScreen order-ID + item-summary cards, ReviewsListScreen rating
  summary + review cards, WriteReviewScreen order-summary card.

- **Order item-row gap** (matching reference `.oitem`/`.citem` `gap:1rem` ≈ 16px):
  - `OrdersScreen` item rows `gap-3`(12px) → `gap-4`(16px).
  - `TrackingScreen` item rows `gap-3`(12px) → `gap-4`(16px).
  - `WriteReviewScreen` order-summary card `flex items-center gap-3` → `gap-4` (matches reference
    `review-product` `.bcard` `gap:1rem`).

- **Review avatar** (matching reference `.rcard .rav` `2.9rem` ≈ 46px): `ReviewsListScreen` review-card
  avatar `h-9 w-9`(36px) → `h-11 w-11`(44px).

- **TrackingScreen cancelled box inset**: `mx-5`(20px) → `mx-4`(16px) so it aligns with the card's
  `px-4` content padding (was sitting 4px further in than the Live-status section above it).

- **WriteReviewScreen footer** (`p-5` → `px-6 py-4`): matches reference `.btn-row{padding:1rem 1.5rem}`
  (16px vertical / 24px horizontal) for the sticky action bar.

### Verification (self)
- `npx tsc --noEmit`: **✓ 31 errors, identical to the pre-phase baseline** — verified via `git stash`
  (pre) vs working tree (post); `diff` (sorted) shows **zero new and zero removed** errors. The 31 are
  pre-existing logic errors (OrdersScreen/TrackingScreen `safeArray` `unknown` + spread-type, App.tsx,
  hooks/*, lib/*, DebugMetrics, CheckoutScreen) — explicitly OUT of scope, none touched.
- `npm run build`: **✓ Passed** (Vite production bundle built in ~6.0s).
- Reference-gray grep across the 5 changed files → **ZERO** literals.
- `git diff` cross-check: **no color hex, no `@theme` / token color change, `BottomTabBar.tsx`
  ZERO diff, no business logic changed, no swipe/gesture code (none of these 5 screens has gestures).**
- `git diff --stat` (source): `OrdersScreen.tsx` (6±), `TrackingScreen.tsx` (7±), `SuccessScreen.tsx` (3±),
  `ReviewsListScreen.tsx` (6±), `WriteReviewScreen.tsx` (5±).
- Claims re-verified against the actual file (lesson): `px-5`/`px-7` page-edge values gone where intended;
  button-internal `px-5`/`px-7` preserved; `h-11 w-11` + `rounded-2xl` confirmed present; the only
  surviving `h-10 w-10` is the `Package` empty-state *icon*, not a button.

### Handoff / next
- **NEXT RUN = Phase L4 — Account/admin/splash/chrome:** `ProfileScreen.tsx`, `AdminScreen.tsx` +
  `AdminPanel.tsx`, `SplashScreen.tsx`, `NotificationsSheet.tsx` (structure only), search dropdown
  structure in `HomeTopBar.tsx`/`SearchBar.tsx`. Re-measure spacing / structure against reference
  `profile` / `your-profile` / `notifications` / `search` / `search-results` / general chrome + `splash`.

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0002 — Layout & Spacing Pass — Phase L2 (Purchase flow batch B) (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Phase worked on:** **Phase L2 — Purchase flow (batch B):** `ProductScreen.tsx`, `CartScreen.tsx`,
`CheckoutScreen.tsx`, `CouponsScreen.tsx`, `CustomizeScreen.tsx`. The previous BAS0002 entry is Phase L1,
so this run correctly starts at L2. **NEXT RUN = Phase L3 (Post-purchase batch C).**

### কী বদলেছে — measured against the GroceryApp reference (no colors touched)
All changes are spacing / structure only — the reference's *proportions* were translated into BAS's
fixed-rem Tailwind scale; every color stays the finished soft-pink token set (no hex, no token swap).

**Conventions adopted (matching L0 foundation + L1 patterns):**

- **`.page` → 24px page edge** (`px-6`): applied on every page-edge wrapper / content div across
  all five screens. Hero-floating controls (`px-5`) intentionally NOT changed — they sit on the
  image, not in the page content flow (reference `.p-top` uses `left:1.4rem; right:1.4rem` ≈ 22px
  on the hero, not in the `.page` wrapper).

- **`.back` / `.round-act` → 44px circle, surface bg, shadow, NO border**:
  - `ProductScreen` floating back / share / heart buttons: `border border-border` removed,
    `bg-white` → `bg-surface` — matches reference `.back` / `.round-act` (2.75rem circle,
    white bg, shadow only, no border).
  - `CartScreen` header back button: same treatment + `h-10 w-10` → `h-11 w-11` (44px).
  - `CheckoutScreen` header back button: `h-10 w-10` → `h-11 w-11` + `bg-white` → `bg-surface`.
  - `CouponsScreen` back button: `h-9 w-9` → `h-11 w-11` + border removed.
  - `CustomizeScreen` back button: `h-10 w-10` → `h-11 w-11` + border removed.
  - Stepper container in ProductScreen bottom bar: `border border-border` removed.

- **Section rhythm**: `ProductScreen` section headers (Flavor, Weight, Add-ons) `mt-7`(28px) →
  `mt-5`(20px) — closer to reference `.flabel` 1.35rem(≈22px). Reviews section same treatment.

- **Card radius**: `rounded-[20px]` → `rounded-2xl`(16px) across all five screens — matches
  reference card radius `1rem`(`.pcard`, `.citem`, `.icard`, `.rcard`, `.ocard`, `.paycard`,
  `.ticket` body). This affects: cart item cards, bill cards, addon suggestion cards, checkout
  section cards, coupon ticket cards, customize cards, product addon cards, review cards.

- **Content sheet radius**: `ProductScreen` content sheet `rounded-t-[28px]` → `rounded-t-[22px]`
  — matches reference `.phero` bottom radius `1.4rem`(≈22px).

- **Sticky CTA bar**: all three purchase-flow screens get `rounded-t-[22px]` on the sticky bottom
  bar + `border-t border-border` removed + `pt-3.5` → `pt-4` — matches reference `.btn-row.bar`
  radius `1.4rem` top / slightly roomier padding. The remove-confirmation sheet on CartScreen also
  gets `rounded-t-[28px]` → `rounded-t-[22px]`.

- **Cart item card spacing** (matching reference `.citem`):
  - `gap-3`(12px) → `gap-4`(16px) — closer to reference `gap:1rem`.
  - `p-3`(12px) → `p-3.5`(14px) — closer to reference `padding:.85rem`(≈14px).
  - Image `h-24 w-24`(96px) → `h-[84px] w-[84px]` — closer to reference `.citem .oimg`
    `5.2rem×4.9rem`(≈83×78px); inner radius `rounded-[14px]` → `rounded-lg`(8px).

- **Gallery thumbnails** (matching reference `.ptb`):
  - `w-14 h-14`(56px) → `w-[60px] h-[60px]` — closer to reference `3.7rem`(≈59px).
  - `rounded-2xl`(16px) → `rounded-xl`(12px) — closer to reference `.7rem`(≈11px).

- **Weight/chip gaps** (matching reference `.wchips` gap `.7rem` ≈ 12px):
  - `gap-2`(8px) → `gap-3`(12px) on weight preset rows.

- **Checkout payment rows** (matching reference `.payr` gap `1.05rem` ≈ 17px):
  - `gap-3`(12px) → `gap-4`(16px) on payment method rows.

- **Coupon ticket** (matching reference `.ticket`):
  - Discount strip `w-[76px]` → `w-[62px]` — closer to reference `3.9rem`(≈62px).
  - Body padding `p-3.5` → `px-4 py-4` — closer to reference `.bd` padding.
  - Notch circles repositioned to `left-[62px]` matching new strip width.

- **Checkout date input** radius: `rounded-2xl` → `rounded-xl` — matching reference `.inp`
  radius `.65rem`(≈10px).

### Verification (self)
- `npx tsc --noEmit`: **✓ 31 errors, identical to the pre-phase baseline** — `diff` (sorted)
  shows **zero new and zero removed** errors.
- `npm run build`: **✓ Passed** (Vite production bundle built in ~5.6s).
- Reference-gray grep across the 5 changed files → **ZERO** literals.
- `git diff` cross-check: **no color hex, no `@theme` / token color change, `BottomTabBar.tsx`
  ZERO diff, ProductScreen gesture code (native touch listeners 93–115) ZERO diff,
  CartScreen gesture code (pointer listeners 354–357) ZERO diff, no business logic changed.**
- `git diff --stat` (source): `ProductScreen.tsx` (40±), `CartScreen.tsx` (30±),
  `CheckoutScreen.tsx` (16±), `CouponsScreen.tsx` (18±), `CustomizeScreen.tsx` (16±).
- Z-index stacking verified: screen-level overlays (z-20/30/200) remain below global
  QuickBar (z-45) and BottomTabBar (z-100).

### Handoff / next
- **NEXT RUN = Phase L3 — Post-purchase (batch C):** `OrdersScreen.tsx`, `TrackingScreen.tsx`,
  `SuccessScreen.tsx`, `ReviewsListScreen.tsx`, `WriteReviewScreen.tsx`. Re-measure spacing /
  structure against reference `orders` / `cancel-order` / `track-order` / `track-map` /
  `payment-success` / `reviews` / `review-product`.
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0002 — Layout & Spacing Pass — Phase L1 (Browse batch A) (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Phase worked on:** **Phase L1 — Browse (batch A):** `HomeScreen.tsx`, `CategoriesScreen.tsx`,
`WishlistScreen.tsx` (the routed one at `src/screens/`). The previous BAS0002 entry is Phase L0, so this
run correctly starts at L1. **NEXT RUN = Phase L2 (Purchase flow batch B).**

### কী বদলেছে — measured against the GroceryApp reference (no colors touched)
All changes are spacing / structure only — the reference's *proportions* were translated into BAS's
fixed-rem Tailwind scale; every color stays the finished soft-pink token set (no hex, no token swap).

- **`.page` → 24px page edge** (`padding:0 1.5rem`): applied `px-5`(20px) → `px-6`(24px) on every
  page-edge wrapper / content div across the three screens, AND on `SectionHeader`'s internal padding
  (it is HomeScreen-only — 3 uses — so retuning it is safely inside this phase). The L0
  `.layout-page` (1.5rem) primitive is now actually adopted on these screens.
- **`.back` / `.round-act` → 44px circle, white surface, shadow, NO border**:
  - `WishlistScreen` back button `rounded-[16px] border border-border` → `rounded-full` (border
    dropped) — matches reference `.back` (2.75rem circle, `background:#fff`, shadow).
  - `CategoriesScreen` filter button `rounded-[18px] border border-border` → `rounded-full`
    (border dropped) — matches reference `.round-act`.
  - `WishlistScreen` "Saved cakes" inline round action `rounded-[18px]` → `rounded-full`.
  - Icons kept at 20px (`h-5 w-5`) = reference `.back svg` 1.25rem.
- **`.sec-row` / `.sec-title` / `.see-all` rhythm**: `SectionHeader` trailing "See all" action tuned
  toward reference `.see-all` (≈11px / weight 500) — `text-[13px] font-semibold` → `text-[12px]
  font-medium`, chevron `h-4` → `h-3.5`. Color intentionally kept `text-primary` (a semantic token,
  NOT a literal hex — no color change). Title stays 20px / 600 (= `.sec-title`).
- **Section vertical rhythm**: `HomeScreen` browse-section top gaps `mt-8`(32px) → `mt-6`(24px) to
  match reference `.sec-row` `margin:1.5rem .2rem 1rem` (1.5rem top). Content gap below each header
  stays `mt-4`(16px) = reference 1rem bottom. First banner (`mt-6`) and footer (`mt-9`) unchanged.
- **`.chip-row` gap .8rem (≈12.8px)**: `WishlistScreen` category chip-row `gap-2.5` → `gap-3`.
- **QuickBar-safe headers preserved**: `pt-20 pr-18` clearance on `CategoriesScreen` & `WishlistScreen`
  headers left intact (lesson: floating QuickBar sits at `top-4 right-4 z-[45]`, must not be crowded).
- **Dead duplicate deleted**: `src/components/WishlistScreen.tsx` (unrouted — confirmed `grep` finds
  zero imports; BAS0001 Phase 2 / 6 already flagged it dead). Logged here per the brief's cleanup
  note. Buddy / Claude: also `git rm` it when applying / pushing this phase.

### Verification (self)
- `npx tsc --noEmit`: **✓ 31 errors, identical to the pre-phase baseline** (`/tmp/baseline_tsc.txt`)
  — `diff` (sorted) shows **zero new and zero removed** errors. All 31 are pre-existing logic errors
  (App.tsx / DebugMetrics / hooks / etc.) — explicitly OUT of scope, none touched.
- `npm run build`: **✓ Passed** (Vite production bundle built in ~5.9s).
- Reference-gray grep (`#909090 #7f7f7f #9b9b9b #969696 #8f8f8f #9c9c9c #acacac #c0c0c0 #f7f7f7
  #f8f8f8 #f4f4f4 #f5f4f4 #d9d9d9 #e7e7e7 #ededed`) across the 4 changed files → **ZERO** literals.
- `git diff` cross-check: **no color hex, no `@theme` / token color change, `BottomTabBar.tsx` ZERO
  diff, `ProductScreen` / `CartScreen` (gesture / overlay) files untouched, no business logic changed.**
- `git diff --stat` (source): `SectionHeader.tsx` (6±), `HomeScreen.tsx` (22±), `CategoriesScreen.tsx`
  (8±), `WishlistScreen.tsx` (10±), + deleted `src/components/WishlistScreen.tsx`.
- Claims re-verified against the actual file (lesson): `px-6` counts confirmed; `pt-20 pr-18` still
  present; the page-edge `px-5`→`px-6` swap did NOT bleed into HomeScreen CTA button-internal `px-5`
  (those were left intact).

### Handoff / next
- **NEXT RUN = Phase L2 — Purchase flow (batch B):** `ProductScreen.tsx`, `CartScreen.tsx`,
  `CheckoutScreen.tsx`, `CouponsScreen.tsx`, `CustomizeScreen.tsx`. Re-measure spacing / structure
  against reference `product` / `cart` / `order-type`+`delivery-address`+`review-summary`+`payments` /
  `payments` list-rows / general conventions. **Do NOT touch ProductScreen / CartScreen gesture code**
  (native touch listeners) — only padding / spacing around them.
- Buddy / Claude verify-then-push loop: apply the 4 modified source files + this log, and
  `git rm src/components/WishlistScreen.tsx` (dead duplicate deleted this phase).
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0002 — Layout & Spacing Pass — Phase L0 (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Phase worked on:** **Phase L0 — Foundation.** No BAS0002 entry existed, so this run
started at L0 as required. **NEXT RUN = Phase L1.**

### কী বদলেছে — reusable layout foundation
- **`src/index.css`**: added BAS semantic layout primitives, without changing any color
  tokens or screen bodies: `.layout-page` (24px page edge), `.layout-appbar` (4.5rem
  reference-proportioned chrome), `.layout-appbar-title`, `.layout-back`,
  `.layout-round-action`, `.layout-appbar-actions`, `.layout-badge-pill`, and the
  `.layout-section-*` row/title/action rhythm (1.5rem top / 1rem bottom).
- Measurements were translated from GroceryApp `style.css` `.appbar`, `.back`,
  `.round-act`, `.badge-pill`, `.page`, and `.sec-row`/`.sec-title`/`.see-all`.
  Reference grayscale values were not copied; all styling uses existing BAS semantic
  tokens and the finished BAS soft-pink shadow language.
- **`tasks/todo.md`** updated for this one phase. No screen JSX, `BottomTabBar.tsx`,
  gesture code, overlays, business logic, or `tailwind.config.ts` was changed.

### Verification
- `git diff --check`: ✓ passed.
- `npx tsc --noEmit`: ⚠️ could not run against the fresh clone because dependencies are
  not installed; `npx` attempted the unrelated deprecated `tsc` package and reported
  “This is not the tsc command you are looking for”. No source error result is claimed.
- `npm run build`: ⚠️ blocked for the same environment reason (`vite: not found`).
- Reference-gray grep on the changed CSS additions: ✓ no listed reference gray literals.

**Handoff:** Buddy/Claude should install the repo dependencies and rerun `npx tsc
--noEmit` and `npm run build` before applying/pushing. **Next = Phase L1 — Browse (batch A).**
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0001 — PREMIUM SOFT-PINK REDESIGN — Phase 6 (final consistency pass, ALL screens) ✅ (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Agent/Tool:** arena.ai Agent Mode (codename BAS0001)
**Phase worked on:** **Phase 6 — final consistency pass across ALL screens** (the dedicated
side-by-side spacing/radius/shadow/type audit + repo-wide leftover-straggler hunt).
Phases 0–5 were all confirmed done on `main` before this run (newest log entry + commit
history). **NEXT RUN = NONE — the BAS0001 soft-pink redesign is COMPLETE after this
phase.** All 7 phases (0→6) are done; hand the repo to Claude for the final
`tsc --noEmit` + `npm run build` re-verify, `AGENT_LOG.md`/`tasks/lessons.md` review,
and phase-by-phase commit + push (per section 4 of the brief). This run is purely the
consistency/closing pass; no new screen was rebuilt and no business logic was touched.

### কী বদলেছে — final consistency / straggler cleanup (exact Phase-6 source files)

- **`src/index.css`** (tokens + dead-class cleanup; ZERO JSX touched):
  - Removed `--font-display` / `--font-brand` from `@theme` and removed the `.font-display`
    / `.font-brand` custom class definitions. Headings now use the default
    `Poppins`+`Hind Siliguri` body stack (already identical, so render-safe; every
    consumer's weight/size classes were preserved).
  - Removed the dead `.glass-strong` / `.glass-deep` / `.glass-tint` / `.glass` /
    `.glass-subtle` / `.glass-dark` class definitions (all ~19 consumers were migrated to
    solid `bg-surface border-border shadow-card` in phases 1–5; these defs were
    unused dead code).
  - Removed the unused `.mesh-warm`, `.hairline`, `.text-gradient-coral`,
    `.badge-premium`, `.confetti-dots` class definitions (verified 0 JSX usages each) —
    they still carried `linear-gradient`/`radial-gradient` strings that failed the
    grep-zero audit.
  - Kept `.shimmer` (skeleton infra), `.lux-orb` decorative glow, and the
    `.card*`/`.btn*`/`.chip*`/`.section-*`/`.price-display`/`.tab-indicator`/
    `.product-card-shadow` system classes.
  - Updated the two comments that named the now-removed `font-display`/`glass-strong` classes.

- **`src/screens/ProductScreen.tsx`** (GESTURE CODE UNTOUCHED — native `touchstart`/
  `touchmove`{passive:false}/`touchend` at 97–103 intact):
  - Removed the decorative top `from-secondary/80 to-transparent` scrim (no text on the
    image; the back/heart/share controls are already solid white chips) — a true leftover.
  - Premium tier badge `bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600`
    → solid `bg-gold` (soft amber).
  - "Out of Stock" badge `backdrop-blur` removed → solid `bg-surface shadow-card` (no blur).
  - Active flavor/weight chips `shadow-md` → `shadow-btn` (pressed/active pink);
    floating top-bar controls + count badge `shadow-md` → `shadow-card` (soft rest).
  - Comment referencing the removed `.glass-strong` class updated.

- **`src/screens/CartScreen.tsx`** (swipe/delete listeners at 354–357 UNTOUCHED):
  - Delete-confirm button `bg-gradient-to-br from-error to-red-600` → solid `bg-error`.

- **`src/components/LocationGate.tsx`** (presentation-only; logic untouched — Phase-0
  permitted this "trivial quiet swap"): inline cocoa `linear-gradient(135deg,#FDF8F1,
  #F3E4D0,#E8C68F)` → solid `background:'#FFF9FB'` (the `#FFF9FB` app canvas).
  Also normalized its `shadow-2xl` → `shadow-card` while already on that element, for
  shadow-language consistency (zero-risk class swap, logic untouched).

- **`src/components/AdminPanel.tsx`** (admin-only, logic untouched): close button
  `shadow-lg` → `shadow-card`.

- **`font-display` / `font-brand` class tokens removed from all 9 live consumers**
  (render-safe — default body font is already `Poppins`+`Hind Siliguri`): `AuthSheet.tsx`(2),
  `ErrorBoundary.tsx`(1), `NotificationsSheet.tsx`(1), `OccasionSheet.tsx`(1),
  `PaymentAppPopup.tsx`(1), `ProductCard.tsx`(2), `SectionHeader.tsx`(1),
  `WalletHistoryModal.tsx`(2), `CheckoutScreen.tsx`(8). Done via a count-asserted
  script (per the bulk-replace lesson) so no occurrence was missed or half-applied.

### Fixed-overlay / gesture cross-check (no regression)
- ProductScreen native image-gallery touch listeners (97–103) confirmed INTACT (grep).
- CartScreen swipe/delete pointer listeners (354–357) confirmed UNTOUCHED — left
  exactly as the pre-existing implementation (pointer-based, NOT the native-touch pattern
  the swipe-gesture lesson requires). This is a pre-existing behavior, not a regression
  introduced by this visual pass; noted under "pending" below rather than silently
  "fixed" (out of visual-redesign scope).
- No fixed-overlay (BottomTabBar z100 / QuickBar z45 / sheets) was edited this phase,
  so header/footer stacking is unchanged from phases 1–5.

### Verification (self)
- `npx tsc --noEmit`: **✓ Verified.** Baseline (`/tmp/baseline_tsc.txt` = 31
  `error TS` lines) → Phase 6 = **31 lines**. `diff` (sorted) shows **zero new and
  zero removed errors**. All 31 are pre-existing logic errors in `App.tsx`, `hooks/*`,
  `lib/store.ts`, `lib/firestoreMappers.ts`, `DebugMetrics/Overlay.tsx`, and
  `CheckoutScreen`/`OrdersScreen`/`TrackingScreen` browse pipelines — explicitly OUT of
  scope for this visual redesign; none were touched.
- `npm run build`: **✓ Passed** (Vite production bundle built in **5.55s**).
- `grep -rn` straggler sweep across `src/` (results):
  - `glass-*` / `mesh-warm` → **ZERO** live class usages (only two *comments* in
    `index.css` mention the removed names — documentation, not code).
  - `backdrop-blur` → **ZERO** (only an `index.css` comment says "No backdrop-blur").
  - `bg-gradient` (Tailwind class) → **ZERO**.
  - inline cocoa hexes (`#A8672E`,`#2A1B12`,`#C9963C`,`#5C3A22`,`#3D2418`,`#FBF6EF`,
    `#E8C68F`,`#D9A85E`,`#6E2A45`,`#5F7556`,`#EEE1D2`,`#6B3A18`,`#FDF8F1`,`#F3E4D0`)
    → **ZERO**.
  - `Fraunces` / `Great Vibes` → **ZERO** usages (only an `index.css` comment
    documents the Phase-0 removal — intentional history note).
  - `font-display` / `font-brand` → **ZERO** in live code (verified in all 9 consumers
    + `index.css` vars/classes removed). The only remaining hit is
    `src/components/WishlistScreen.tsx` (the DEAD, unrouted duplicate — confirmed
    `App.tsx:17` imports `./screens/WishlistScreen`; nothing imports the `components/`
    copy) which still carries old classes; left untouched per the Phase-2/5 handoff
    (don't restyle dead code).
  - off-system shadows (`shadow-2xl/xl/lg/md`) in JSX → **ZERO** (the 9 hits across
    ProductScreen/AdminPanel/LocationGate were all normalized to `shadow-card`/`shadow-btn`).
  - **Intentional, documented exceptions** (NOT cocoa-era leftovers, kept on purpose):
    1. `HomeScreen.tsx:197` — dark `linear-gradient` legibility scrim behind WHITE
       banner text (functional contrast over user-supplied promo imagery; fade-to-transparent,
       not a heavy/decorative gradient).
    2. `CouponsScreen.tsx:84` — brand-pink `linear-gradient(#F65F8F→#E84E80)`
       discount strip, deliberately retuned from cocoa→pink in Phase 3.
    3. `index.css` `.shimmer` — `linear-gradient` skeleton shimmer (required animation infra).
  - Per the lessons, `coral`/`blush`/`ink`/`primary`/`secondary`/`accent`/`surface`/
    `text-*`/`gold` are the LIVE semantic tokens (intentional; `coral` is the primary
    pink since Phase 0) — they are NOT stragglers and were left as-is.

### Handoff / pending
- **NEXT RUN = NONE.** BAS0001 (phases 0–6) is complete. Do NOT start a new
  redesign phase. Hand to Claude (section 4): re-verify each phase's tree with
  `tsc --noEmit` + `npm run build`, confirm `AGENT_LOG.md`/`tasks/lessons.md` reflect
  all 7 phases newest-first, then commit + push phase-by-phase in order (not one
  merged commit).
- **Pending / notes for Claude (do NOT silently fix in a visual pass):**
  1. `src/components/WishlistScreen.tsx` (dead duplicate) still has old `font-display` +
     glass-era classes — delete it entirely or confirm it's never imported (it isn't)
     before pushing.
  2. `CartScreen.tsx` swipe-to-delete uses pointer events (354–357), not the
     native-touch pattern the swipe-gesture lesson requires for real-device reliability.
     Flag as a behavior bug to fix in a dedicated logic pass (NOT a visual redesign).
  3. `HomeScreen.tsx:197` scrim + `CouponsScreen.tsx:84` brand-pink strip +
     `.shimmer` are intentional gradients (documented above) — keep them.
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
