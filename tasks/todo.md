# TODO — BAS0001 Premium Soft-Pink Redesign

> One phase per run. Read `AGENT_LOG.md` first to find the next phase.
> This file is rewritten each run to scope ONLY the current phase.

## Current run → Phase 2: Core browse screens

Scope only: `HomeScreen.tsx`, `CategoriesScreen.tsx`, routed `src/screens/WishlistScreen.tsx`,
and the documented category-accent handoff in `src/lib/data.ts` that Phase 1 explicitly
left for this screen batch (plus this TODO, `AGENT_LOG.md`, optional new reusable lesson,
and the phase ZIP).

### Phase 2 checklist
- [x] Start clean: `git checkout -- . && git pull origin main`; confirmed BAS0001 Phase 1 is complete and **NEXT = Phase 2**.
- [x] Read `AGENT_LOG.md` top-to-bottom and `tasks/lessons.md` in full; keep native touch gestures untouched and cross-check global overlays (BottomTabBar / QuickBar / modals) against these browse screens.
- [x] Confirm which wishlist file is actually routed/imported. Result: `src/App.tsx` imports `./screens/WishlistScreen`; `src/components/WishlistScreen.tsx` is dead code and stays untouched.
- [x] Retune `src/lib/data.ts` category `color` / `fg` pairs from the old saturated cocoa/plum/sage mix to soft pastel siblings of the new pink system.
- [x] Rebuild `HomeScreen.tsx` into the premium soft-pink browse language: opaque white cards, generous spacing, soft elevation, refined banner/category rails, elegant reorder/for-you modules, and designed search-empty + notice modal states.
- [x] Rebuild `CategoriesScreen.tsx` with the same system: overlay-safe header spacing, premium category chips, soft skeletons, improved results summary, and a solid filter sheet with no blur/glass regression.
- [x] Rebuild routed `WishlistScreen.tsx`: overlay-safe header, elevated summary/chip rail, premium filtered-empty state, and polished guest/user empty states with explicit browse/sign-in CTAs.
- [x] While touching each Phase-2 file, replace legacy `coral` / `ink` / `glass-*` / `font-display` / `font-brand` usage with semantic pink-system classes where practical; remove any leftover cocoa inline hexes in scoped files.
- [x] Verify no Phase-2 modal/sheet sits under fixed global chrome (notably Home notice modal and Categories filter sheet vs BottomTabBar/QuickBar z-index).
- [x] Run `npx tsc --noEmit` and compare with baseline; run `npm run build`; fix every new error now. Result: baseline clean-main = **159** TypeScript error lines, Phase 2 = **85** lines, diff showed **zero new errors** and removed the old Home/Categories browse-screen `unknown` errors; `npm run build` **✓ passed** in 5.94s.
- [x] Re-read the touched files against `tasks/lessons.md`, verify every claimed change against source, package ONLY Phase-2 files into one timestamped ZIP, and prepend a Phase-2 handoff entry to `AGENT_LOG.md` with **NEXT = Phase 3**.

### Explicit Phase-2 guardrails
- `HomeScreen`, `CategoriesScreen`, and routed `WishlistScreen` all consume the shared Phase-1 `ProductCard`; re-check layout usage across all three after the screen-level spacing changes.
- Do not touch Cart/Product swipe code or any other drag gesture. If a browse-screen visual change tempts a gesture rewrite, stop — that belongs elsewhere.
- Keep `cart` vs `checkout` routing distinct. Any CTA from these browse screens that goes to shopping should still enter the existing BAS flow correctly.
- `src/components/WishlistScreen.tsx` is not routed; do not waste scope editing the dead duplicate.
