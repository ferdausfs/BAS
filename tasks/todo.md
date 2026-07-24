# Pull-to-Refresh Mini-Plan (Round 2 Task 4)

**Status:** proposed only — do not implement until Buddy approves this plan.

## Scope
- `src/hooks/usePullToRefresh.ts` (new reusable hook)
- `src/screens/OrdersScreen.tsx`
- `src/screens/TrackingScreen.tsx`
- `src/screens/HomeScreen.tsx`

## Proposed approach
1. Create `usePullToRefresh({ containerRef, onRefresh, enabled })` using native touch listeners, not React synthetic handlers.
2. Attach listeners in `useEffect` to the scroll container: `touchstart` passive true, `touchmove` passive false, `touchend/touchcancel` passive true.
3. Only start pulling when the container is at scroll-top (`scrollTop <= 0`) and the gesture is clearly vertical downward after a small threshold.
4. While pulling, call `event.preventDefault()` from the non-passive `touchmove` handler, expose `pullDistance`/`refreshing` state, and cap visual distance.
5. Trigger `onRefresh` after release if distance crosses threshold; await the callback; then reset state cleanly.
6. Keep indicator lightweight: a small BAS/logo or spinner pill above content, with no heavy animation.
7. Wire callbacks to existing data APIs: Orders `fetchMyOrders()`, Tracking `fetchMyOrders()` for current order data, Home via existing products/banner refetch paths (if current banner hook lacks refetch, add it deliberately in that same approved task).

## Verification plan
- `npx tsc --noEmit`
- `npm run build`
- Manual mobile/emulator test on all three screens at scroll top and mid-scroll.
- Confirm normal vertical scrolling is unaffected when not at top.

## Approval needed before code
This touches a new shared gesture hook plus three high-traffic screens, so it should be implemented as its own approved mini-phase.

---

# BAS0002 — Phase L5 — Final consistency pass (this run only)

Scope: cross-screen side-by-side spacing/structure audit against the GroceryApp
reference rhythm + the conventions established in L0–L4. Layout/spacing/structure
ONLY — no colors, no BottomTabBar, no gesture code, no auth flow, no business logic.

## Verify (the explicit L5 confirmations)
- [x] `git checkout -- . && git pull origin main` (clean, on main)
- [x] Read AGENT_LOG.md (newest BAS0002 = L4 → this run = L5), tasks/lessons.md, reference CSS
- [x] Reference-gray hex grep across ALL of `src/` → ZERO literals
- [x] BottomTabBar.tsx zero diff across BAS0002 (git history: last touched by BAS0001 Phase 1)
- [x] No swipe/gesture regressions (ProductScreen native touch + CartScreen pointer blocks; zero gesture lines in L2 diff)
- [x] tsc baseline captured (31 pre-existing errors) + build passes at baseline
- [ ] tsc re-run after edits (must stay 31, zero new/removed)
- [ ] build re-run after edits (must pass)

## Audit (side-by-side vs reference rhythm + L0–L4 conventions)
- [x] App-bar back buttons: all 9 = h-11 w-11 rounded-full bg-surface shadow-card, no border
- [x] Page-edge wrappers: all px-6 (24px); remaining px-4/5/7 are button/input/card-internal or hero-floating (correct, left)
- [x] Sheet/bar top-radii landscape mapped (10× rounded-t-[22px]; outliers found below)
- [x] Content-card radii (rounded-2xl convention) checked across screens + shared ProductCard

## Straggler fixes (auto-apply — low-risk, unambiguous convention violations)
- [ ] CouponsScreen back icon 18px → 20px (`h-[18px] w-[18px]` → `h-5 w-5`)
- [ ] CustomizeScreen back icon 18px → 20px (`h-[18px] w-[18px]` → `h-5 w-5`)
- [ ] CategoriesScreen filter sheet: `rounded-t-[32px]` → `rounded-t-[22px]`, edge `px-5` → `px-6`
- [ ] OccasionSheet: `rounded-t-[28px]` → `rounded-t-[22px]`, header `px-5`→`px-6`, grid `p-5`→`p-6`

## Propose only (NOT auto-applied — Buddy decision, high magnitude / BAS0001-set value)
- [ ] Shared ProductCard radius `rounded-[22px]` → `rounded-2xl` (16px) + inner image `rounded-[16px]` → `rounded-xl` (12px)
      to match reference `.pcard{1rem}`/`.pimg{.75rem}` and the BAS0002 content-card convention.
      Deferred: changes the app's most prominent component (set in BAS0001 Phase 1, survived Phase 6).

## Out of scope / deliberately left (logged)
- AuthSheet `rounded-t-[28px]` (auth flow — explicitly out of scope)
- AdminPanel `rounded-t-3xl` + radii (internal tool — don't over-invest)
- ChatBot / QuickBar / PaymentAppPopup / WalletHistoryModal radii (overlay widgets/modals, not screens; fixed-overlay caution per lessons)
- Sheet close-button style variance (NotificationsSheet round-action vs rounded-square secondary elsewhere) — stylistic, not spacing/rhythm
- CategoriesScreen filter button h-12 w-12 (48px) — prominent filter trigger ≈ reference `.flt-btn` (46px), within tolerance

## Deliver
- [ ] One timestamped ZIP of changed files only
- [ ] AGENT_LOG.md entry at top (Bengali/English), next phase stated (L5 = last; pass complete)
- [ ] lessons.md: add L5 rule(s)
