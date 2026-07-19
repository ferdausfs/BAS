# Phase 6 — Final consistency pass (ALL screens) — soft-pink redesign

## Scope
Full-repo consistency + leftover-straggler hunt. Phases 0–5 are confirmed done on
`main`. This run is the dedicated final pass. One phase only; stop after.

## Pre-flight (done at start)
- [x] `git checkout -- . && git pull origin main` — clean, up to date.
- [x] Read `AGENT_LOG.md` top → Phase 5 done; NEXT = Phase 6.
- [x] Read `tasks/lessons.md` fully — bulk-replace w/ count assertions, QuickBar-safe
      headers, verify claims against real file, native touch listeners, etc.
- [x] Baseline `tsc --noEmit` = 63 lines (all pre-existing logic errors in
      App/hooks/lib/some-screens — OUT of scope, do NOT fix). `npm run build` = ✓.
- [x] Confirm `src/components/WishlistScreen.tsx` is DEAD (App.tsx:17 imports
      `./screens/WishlistScreen`; nothing imports the components/ duplicate) → leave it.

## Straggler hunt (grep -rn across src/) — STATUS
### A. `backdrop-blur` (must be zero)
- [x] `ProductScreen.tsx:316` "Out of Stock" badge `backdrop-blur` → solid
      `bg-surface shadow-card`. (Native touch listeners at 97–103 UNTOUCHED.)

### B. `bg-gradient` / `linear-gradient` JSX (cocoa-era → remove; functional → keep)
- [x] `CartScreen.tsx:376` delete button `bg-gradient-to-br from-error to-red-600`
      → `bg-error` (solid).
- [x] `ProductScreen.tsx:292` premium tier badge
      `bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600` → `bg-gold` (solid).
- [x] `ProductScreen.tsx:285` decorative top `from-secondary/80 to-transparent` scrim
      (no text on image; controls are solid) → REMOVED.
- [x] `LocationGate.tsx:84` inline cocoa `linear-gradient(#FDF8F1,#F3E4D0,#E8C68F)`
      → solid `background:'#FFF9FB'` (Phase-0 permitted trivial swap; presentation-only).
- [~] KEEP (documented intentional): `HomeScreen.tsx:197` dark legibility scrim behind
      white banner text; `CouponsScreen.tsx:84` brand-pink discount strip (Phase 3
      deliberate); `index.css` `.shimmer` skeleton infra. None are cocoa-era leftovers.

### C. `font-display` / `font-brand` (must be zero in live code)
- [x] Remove class token from: AuthSheet(2), ErrorBoundary(1), NotificationsSheet(1),
      OccasionSheet(1), PaymentAppPopup(1), ProductCard(2), SectionHeader(1),
      WalletHistoryModal(2), CheckoutScreen(8). Default body font is already
      Poppins+Hind Siliguri, so removal is render-safe (weights/sizes preserved).
- [x] `src/index.css`: remove `--font-display` / `--font-brand` from `@theme`; remove
      `.font-display` / `.font-brand` class defs; update the two comments that named them.
- [~] `src/components/WishlistScreen.tsx` (dead) keeps its old `font-display` — left
      untouched per handoff (unrouted).

### D. Dead CSS class defs (no JSX consumer → remove for grep-zero)
- [x] `src/index.css`: remove `.glass-strong`, `.glass-deep`, `.glass-tint`, `.glass`,
      `.glass-subtle`, `.glass-dark` (all unused after phases 1–5 solid-surface swap).
- [x] `src/index.css`: remove `.mesh-warm` (unused).
- [x] `src/index.css`: remove unused `.hairline`, `.text-gradient-coral`,
      `.badge-premium`, `.confetti-dots` (verified 0 JSX usages). Keep `.shimmer`.

### E. Off-system shadow normalization (3 files, 9 hits)
- [x] `ProductScreen.tsx`: active flavor/weight chips (486/523/568) `shadow-md` →
      `shadow-btn` (pressed/active pink). Floating control + count badge
      (704/783/790/797) `shadow-md` → `shadow-card`.
- [x] `AdminPanel.tsx:1333` close button `shadow-lg` → `shadow-card`.

### F. Gesture / fixed-overlay regression check
- [x] `ProductScreen.tsx` native `touchstart`/`touchmove`(passive:false)/`touchend`
      at 97–103 UNTOUCHED.
- [x] `CartScreen.tsx` swipe/delete listeners (354–357) UNTOUCHED (pre-existing
      pointer-based impl left as-is; noted as pending behavior fix, NOT a visual
      regression).
- [x] No fixed-overlay (BottomTabBar z100 / QuickBar z45 / sheets) edits this phase.

## Verify (self)
- [ ] `npx tsc --noEmit` — zero NEW errors vs `/tmp/baseline_tsc.txt` (63 lines).
- [ ] `npm run build` — must pass.
- [ ] grep-zero check: `glass-*`, `backdrop-blur`, `Fraunces`(code), `Great Vibes`(code),
      inline cocoa hexes, `bg-gradient`(cocoa) → only documented intentional exceptions.
- [ ] Re-read each touched file for lesson compliance (depth≠hue, native touch, etc.).

## Package & handoff
- [ ] ZIP only files changed this phase → `bas-redesign-phase6-<ts>.zip`.
- [ ] New AGENT_LOG.md entry at TOP: phase #, what changed, tsc/build results, NEXT=done.
- [ ] `git checkout -- package-lock.json` (revert npm-install churn) before zip.
- [ ] Add any new lesson to `tasks/lessons.md`.
