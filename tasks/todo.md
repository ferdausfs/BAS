# TODO — BAS0001 Premium Soft-Pink Redesign

> One phase per run. Read `AGENT_LOG.md` first to find the next phase.
> This file is rewritten each run to scope ONLY the current phase.

## Current run → Phase 3: Purchase flow

Scope only: `ProductScreen.tsx`, `CartScreen.tsx`, `CheckoutScreen.tsx`, `CouponsScreen.tsx`, `CustomizeScreen.tsx` (plus this TODO, `AGENT_LOG.md`, optional new reusable lesson, and the phase ZIP).

### Phase 3 checklist
- [ ] Start clean: `git checkout -- . && git pull origin main`; confirmed BAS0001 Phase 2 is complete and **NEXT = Phase 3**.
- [ ] Read `AGENT_LOG.md` top-to-bottom and `tasks/lessons.md` in full; keep native touch gestures untouched and cross-check global overlays (BottomTabBar / QuickBar / modals) against these purchase screens.
- [ ] Rebuild `CustomizeScreen.tsx` to remove `.glass-strong` / backdrop-blur treatment and replace with solid opaque white cards + soft elevation shadows. Eliminate legacy brown/cocoa styles, replace with premium soft-pink elements.
- [ ] Rebuild `CouponsScreen.tsx`: replace old cocoa background (`#FBF6EF`) with premium background (`#FFF9FB`), replace cocoa gradient with premium pink gradient, fix ticket notches to match the page background.
- [ ] Rebuild `CartScreen.tsx` into the premium soft-pink language: opaque white cards (`bg-surface`), generous 8px-grid spacing, soft pink-tinted shadows, and elegant empty-state / add-on designs. Keep native swipe-to-delete event handlers completely untouched to prevent regression.
- [ ] Rebuild `ProductScreen.tsx`: replace `.glass-tint` and `.glass-strong` with solid opaque premium card surfaces, change active select state from cocoa (`#5C3A22`) to primary pink, retune brand/contact cards to soft-pink accents, and verify bottom sticky CTA layouts. Ensure image gallery swipe native listeners remain untouched.
- [ ] Rebuild `CheckoutScreen.tsx`: remove `.glass-strong` from sections, inputs, and components. Change the checkout CTA button from the dark-cocoa gradient (`#5C3A22`) to primary brand pink (`bg-coral`) with `shadow-btn`. Tune section icons, edit buttons, and active states to soft-pink.
- [ ] Verify that no checkout footer/button overlaps with BottomTabBar or QuickBar.
- [ ] Run `npx tsc --noEmit` and compare with baseline; run `npm run build`; fix every new error now.
- [ ] Re-read the touched files against `tasks/lessons.md`, verify every claimed change against source, package ONLY Phase-3 files into one timestamped ZIP, and prepend a Phase-3 handoff entry to `AGENT_LOG.md` with **NEXT = Phase 4**.

### Explicit Phase-3 guardrails
- Do not regress the native touch gallery/swipe gestures on ProductScreen and CartScreen.
- Keep `cart` vs `checkout` routing distinct.
- No editing of any other files outside Phase 3's scope.
