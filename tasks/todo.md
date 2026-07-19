# TODO — BAS0001 Premium Soft-Pink Redesign

> One phase per run. Read `AGENT_LOG.md` first to find the next phase.
> This file is rewritten each run to scope ONLY the current phase.

## Current run → Phase 1: Shared components

Scope only: `BottomTabBar.tsx`, `HomeTopBar.tsx`, `SearchBar.tsx`, `SectionHeader.tsx`,
`ProductCard.tsx`, `OccasionIcon.tsx`, `OccasionSheet.tsx`, `OccasionZoomOverlay.tsx`,
`QuickBar.tsx`, `AuthSheet.tsx`, `NotificationsSheet.tsx`, `WalletHistoryModal.tsx`,
`PaymentAppPopup.tsx`, `BrandLogo.tsx`, `PhoneFrame.tsx`, `OrderTimeline.tsx`, and
`ChatBot.tsx` (plus this TODO, `AGENT_LOG.md`, optional new reusable lesson, and the phase ZIP).

### Phase 1 checklist
- [x] Start clean: `git checkout -- . && git pull origin main`; confirmed BAS0001 Phase 0 is complete and Phase 1 is next.
- [x] Read `AGENT_LOG.md` and all of `tasks/lessons.md`; preserve native touch gestures and cross-check fixed overlays.
- [x] Inspect every scoped component and its imports/usages; inventory inline legacy cocoa hexes and global overlay interactions.
- [x] Rebuild shared chrome/cards/sheets in the opaque white + restrained soft-pink system: 8px rhythm, 20–24px cards, 16–20px controls, quiet borders, actual soft elevation — no gradients, glass, or backdrop blur.
- [x] Restyle `ProductCard` as a premium shared product tile and replace its inline legacy hexes; check its Home/Categories/Wishlist consumers without editing Phase 2 screen files.
- [x] Restyle BottomTabBar, QuickBar, and ChatBot fixed/launcher layers; verify their z-index/clearance against screen headers and each other.
- [x] Preserve existing component behavior and modal accessibility; do not refactor unrelated logic. Do not add/regress any synthetic pointer/touch gesture.
- [x] Add elegant loading/empty treatment where these shared components currently expose a bare spinner/blank state (notably ChatBot).
- [x] Run `npx tsc --noEmit` and compare with clean baseline; run `npm run build`; fix all new errors. (baseline: 160 pre-existing error lines; Phase 1: 159 — one stale ProductCard unused import removed; zero new.)
- [x] Re-read every touched Phase 1 file against `tasks/lessons.md`, verify claimed edits against source, then package ONLY Phase 1 files to one timestamped ZIP.
- [x] Prepend one Phase 1 handoff entry to `AGENT_LOG.md` naming exact files, verification results, and **NEXT = Phase 2**; no new reusable lesson discovered.

### Explicit Phase-1 guardrails
- `ProductCard` is shared by Home, Categories, and Wishlist: visually inspect source usage after its change; screens are Phase 2 and must not be rewritten now.
- BottomTabBar, QuickBar, ChatBot launcher, and component modals are global/fixed overlays: retain their safe-area handling and ensure z-index ordering does not compete with screen headers/each other.
- Cart and ProductScreen swipe gestures are out of this phase: do not touch their native `touchmove` listener pattern.
- Replace the Phase-0 handoff’s scoped inline cocoa literals in BottomTabBar, HomeTopBar, ProductCard, and QuickBar with semantic pink-system tokens while restyling.
- Do not touch data/business logic, screens, hooks, or lib code outside required prop/type compatibility.
