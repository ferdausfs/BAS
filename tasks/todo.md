# TODO — BAS0001 Premium Soft-Pink Redesign

> One phase per run. Read `AGENT_LOG.md` first to find the next phase.
> This file is rewritten each run to scope ONLY the current phase.

## Current run → Phase 0: Design Tokens (foundation)

Scope: `src/index.css` (@theme + all hardcoded old-token usage), `tailwind.config.ts`,
`index.html` (font `<link>`). NOTHING ELSE.

### Phase 0 checklist
- [x] `git checkout -- . && git pull` (clean tree, on main)
- [x] Read `AGENT_LOG.md` + `tasks/lessons.md` — confirmed no soft-pink redesign phase exists yet → start at Phase 0
- [x] Baseline: `npx tsc --noEmit` = 132 pre-existing errors (saved `/tmp/baseline_tsc.txt`), `npm run build` ✓
- [x] **index.html**: swap Google Fonts `<link>` → Poppins (400/500/600/700) + Hind Siliguri (400/500/600/700); drop Fraunces + Great Vibes; bump `theme-color` to `#F65F8F`
- [x] **src/index.css `@theme`**: remap legacy var names to soft-pink (coral→primary pink scale, blush→secondary, cream→bg, paper→surface, ink→neutral text scale, gold→soft amber, plum/sage→pastel siblings) AND add explicit semantic tokens (primary/secondary/accent/bg/surface/border/divider/text/text-secondary/text-tertiary/success/warning/error); fonts → Poppins with Hind Siliguri fallback
- [x] **src/index.css components**: strip cream-coral `.glass-*` gradients → solid opaque white + soft pink-tinted shadows; retune `.btn-primary/.btn-secondary/.btn-ghost`, `.chip-active`, `.section-eyebrow/.section-title`, `.price-display`, `.tab-indicator`, `.badge-premium`, `.text-gradient-coral`, `.hairline`, `.card*`, `.product-card-shadow`, `.shimmer`, `.confetti-dots`, `.mesh-warm`, focus ring, scrollbar, `:root`, `html/body` bg, `.lux-canvas`/`.lux-orb` to the pink system
- [x] **tailwind.config.ts**: `brand.*` → pink scale; `gold` → soft amber; `boxShadow.*` → pink-tinted soft shadows; `fontFamily` → Poppins; keep radius/spacing
- [x] Self-verify: `npx tsc --noEmit` — zero NEW errors vs baseline (132); `npm run build` ✓
- [x] Re-check Phase 0 files vs every rule in `tasks/lessons.md` (depth≠hue, native touch, fixed-overlay, cart≠checkout, ProductCard ripple — note Phase 0 is tokens-only so no JSX/gesture changes, but glass-strip must not break any overlay)
- [x] Package only changed files → `bas-redesign-phase0-<timestamp>.zip`
- [x] New entry at TOP of `AGENT_LOG.md` (Phase 0 done, **next = Phase 1 shared components**)
- [x] Add any new reusable rule to `tasks/lessons.md`

### Phase map (handoff)
- Phase 0 — tokens ✅ (this run)
- Phase 1 — shared components (BottomTabBar, HomeTopBar, SearchBar, SectionHeader, ProductCard, OccasionIcon/Sheet/ZoomOverlay, QuickBar, AuthSheet, NotificationsSheet, WalletHistoryModal, PaymentAppPopup, BrandLogo, PhoneFrame, OrderTimeline, ChatBot)
- Phase 2 — batch A browse (Home, Categories, Wishlist)
- Phase 3 — batch B purchase (Product, Cart, Checkout, Coupons, Customize)
- Phase 4 — batch C post-purchase (Orders, Tracking, Success, ReviewsList, WriteReview)
- Phase 5 — batch D account/admin/splash (Profile, AdminScreen+AdminPanel, Splash)
- Phase 6 — final consistency pass (grep for leftover coral/blush/ink/Fraunces/GreatVibes/glass-strong; side-by-side spacing/radius/shadow/type audit)

### Known handoffs surfaced during Phase 0 (NOT fixed here — out of scope)
- `src/lib/data.ts` lines 4–8 still hold the saturated category hexes (Birthday `#A8672E`,
  Anniversary `#6E2A45`, Wedding `#C9963C`, Cupcakes `#5F7556`, Custom `#4E3626`). The CSS
  vars `--color-plum`/`--color-sage` were retuned to pastel siblings, but those are orphaned
  for category rendering — the real category chip colors come from `data.ts`. **Retune
  `data.ts` category `color`/`fg` pairs to soft pastel siblings during Phase 2 (CategoriesScreen redesign).**
- `src/components/QuickBar.tsx` uses invalid `text-gold-800` (gold has no 800 step) — renders
  with no color. Fix in Phase 1.
- 132 pre-existing `tsc` errors (AdminPanel `unknown` casts, store null/txns, firestoreMappers
  `sizes`/`addons`/`createdAt`, unused-imports) — predate this redesign, unrelated to tokens.
  Left untouched per "don't silently fix unrelated bugs" rule.
