# BAS0002 — Phase L1 TODO (Browse batch A: HomeScreen, CategoriesScreen, WishlistScreen)

## Scope
Layout/spacing precision pass for the three browse screens, measured against the
GroceryApp reference (`design-reference/GroceryApp/css/style.css` + `js/screens.js`
`home` function). Re-measure & correct: page-edge padding, app-bar / back-button /
round-action geometry, section-header rhythm, section vertical rhythm, chip-row gap.
NO color values, NO behavior/logic, NO BottomTabBar, NO gesture/overlay code, NO ProductCard.

## Pre-flight (done at start)
- [x] `git checkout -- . && git pull origin main` — clean; L0 already merged.
- [x] Read `AGENT_LOG.md` → newest BAS0002 entry = Phase L0 → NEXT = Phase L1.
- [x] Read `tasks/lessons.md` fully (QuickBar-safe headers, bulk-replace w/ counts,
      verify-claim-against-file, native touch, search-whole-file, etc.).
- [x] Read reference `style.css` (`.appbar/.back/.round-act/.badge-pill/.page/.sec-row/
      .sec-title/.see-all/.chip-row`) and `screens.js` `home`.
- [x] `npm ci` + baseline `npx tsc --noEmit` = 31 pre-existing logic errors (out of scope).
- [x] Confirm `SectionHeader` is HomeScreen-only (3 uses) → safe to retune in this phase.

## Edits (this phase)
- [x] `src/components/SectionHeader.tsx`: adopt L0 `.layout-section-*` rhythm — internal
      page-edge px-5→px-6 (matches new 24px convention); trailing "See all" action tuned
      toward reference `.see-all` (text-[13px] font-semibold → text-[12px] font-medium,
      chevron h-4→h-3.5). No color change (stays `text-primary`).
- [x] `src/screens/HomeScreen.tsx`: page-edge px-5→px-6 on all page-edge wrappers/content
      divs (NOT button-internal px-5). Normalize browse-section top rhythm mt-8→mt-6 to
      match reference `.sec-row` 1.5rem top margin (content gap below header stays mt-4=16px).
- [x] `src/screens/CategoriesScreen.tsx`: page-edge px-5→px-6 (header, chips row, scroll
      container) — KEEP `pt-20 pr-18` QuickBar clearance. Filter button → reference
      `.round-act` 44px circle (rounded-full, shadow-card, drop border).
- [x] `src/screens/WishlistScreen.tsx`: page-edge px-5→px-6 (header, scroll container) —
      KEEP `pt-20 pr-18`. Back button → reference `.back` 44px circle (rounded-full,
      shadow-card, drop border). Saved-cakes inline round action → rounded-full.
      Category chip-row gap-2.5→gap-3 (reference `.chip-row` .8rem).
- [x] Delete dead `src/components/WishlistScreen.tsx` (unrouted duplicate confirmed in
      BAS0001 Phase 2/6). Clearly logged.

## Verify (self)
- [ ] `npx tsc --noEmit` — zero NEW errors vs /tmp/baseline_tsc.txt (31 lines).
- [ ] `npm run build` — must pass.
- [ ] `git diff` — no color hex / no BottomTabBar / no gesture / no logic changes.
- [ ] Grep for reference-gray literals (#909090 etc.) in changed files → zero.
- [ ] Re-read each touched file vs lessons (QuickBar-safe header, verify claims, etc.).

## Package & handoff
- [ ] ZIP only files changed this phase → `bas0002-layout-phaseL1-<ts>.zip`.
- [ ] New AGENT_LOG.md entry at TOP: phase #, what changed + reference rules, verify
      results, NEXT = Phase L2 (Purchase flow batch B).
- [ ] `git checkout -- package-lock.json` (revert npm-ci churn) before zip.
- [ ] Add any new lesson to `tasks/lessons.md`.
