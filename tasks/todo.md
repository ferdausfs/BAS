# Phase 5 — Account / Admin / Splash (soft-pink redesign)

## Scope
`src/screens/ProfileScreen.tsx`, `src/screens/SplashScreen.tsx`,
`src/components/AdminPanel.tsx` (+ verify `src/screens/AdminScreen.tsx` — thin
wrapper, expected no visual change).

Previous phase confirmed on main: **Phase 4 (post-purchase)**.
This run: **Phase 5 only**. NEXT after this → Phase 6 (final consistency pass).

## Checklist — STATUS: COMPLETE (`tsc --noEmit` 68→59 baseline-diff clean, zero new; `npm run build` ✓ 5.35s)

### SplashScreen.tsx
- [x] Page bg `bg-[#FBF6EF]` (cocoa ivory hex) → `bg-bg` (#FFF9FB)
- [x] Hero card: strip cocoa `linear-gradient(145deg,#6B3A18,#3D2418)` + `blur-xl` blob + `backdrop-blur` inner tile → solid `bg-secondary` card + white `bg-surface` emoji tile with real `shadow-card` elevation (depth ≠ hue)
- [x] Tag chip `bg-amber-900/10` → `bg-secondary` (semantic soft-pink surface)
- [x] Remove `font-display` explicit calls (Poppins already default)
- [x] Pagination dot active `bg-[#5C3A22]` → `bg-coral`; inactive → `bg-coral-200`
- [x] CTA `shadow-lg` → `shadow-btn` (pink-tinted)

### ProfileScreen.tsx
- [x] Header: add QuickBar-safe clearance (`pr-18`, `pt-6` per Phase-4 OrdersScreen pattern); eyebrow + 24px title; drop `font-display`
- [x] Guest sign-in state → designed empty state: `bg-secondary` icon circle + headline + copy + `bg-coral shadow-btn` CTA
- [x] Identity card: strip ink-gradient + `backdrop-blur` avatar tile + `bg-white/20` chip → white `bg-surface border-border shadow-card` card, coral avatar tile, `bg-secondary text-coral` member chip
- [x] Wallet card: strip cocoa gradient (`#5C3A22`/`#3D2418`) + cocoa rgba shadow → solid `bg-coral shadow-btn` brand card (bKash-pink convention)
- [x] Stat cards + list buttons (Address book / Special Dates / My Coupons) + menu group: `glass-strong` + inline cocoa rgba shadows → `border-border bg-surface shadow-card rounded-[20px]`
- [x] Menu icon tiles `bg-ink-50 text-ink-200` → `bg-secondary text-coral`; row dividers `border-ink-50` → `border-border`
- [x] Wishlist thumbnail rails: inline cocoa shadow → `shadow-card`
- [x] Invite card: `border-dashed border-ink-100` + `bg-ink` icon/button → coral-tinted dashed card, `bg-coral` actions
- [x] Sign out: `border-white/40 glass-strong` → `border-border bg-surface shadow-card text-error` (destructive semantics)
- [x] Admin section header: drop `font-display`; Admin badge → `bg-coral`
- [x] AdminErrorBoundary: `bg-red-50/text-red-*` → error tokens; retry `bg-ink` → `bg-coral`
- [x] All 5 modals: scrims `bg-black/40 backdrop-blur-*` → `bg-ink/45` (NO blur — Phase-1 pattern); sheets `glass-strong`/`glass-deep shadow-2xl` → `bg-surface border-t border-border shadow-float rounded-t-[28px]`; drop `font-display` headings
- [x] Modal inputs/selects/textareas: `border-ink-50/ink-10 bg-white/bg-cream` → `border-border bg-surface` + coral focus ring
- [x] Small destructive buttons `bg-red-50 text-red-400` / `text-red-500` errors → `bg-error/10 text-error`
- [x] Keep ALL logic untouched: geolocation, Firestore profile save, referral claim, address/date CRUD, 5-tap admin shortcut, ChatBot embed, modal depth hooks
- [x] Fixed-overlay cross-check: all modal scrims ≥ z-[60] above QuickBar z45; tab bar already hidden via useModalDepth

### AdminPanel.tsx (admin-only — restyle, ZERO logic changes)
- [x] PIN gate: scrim → `bg-ink/60`; card → `bg-surface border-border shadow-card`; drop `font-display`; lock icon in `bg-secondary text-coral` circle; error → error tokens; CTA + `shadow-btn`
- [x] Root containers `bg-cream` → `bg-bg`; embedded border `border-ink/8` → `border-border`
- [x] Top bar `bg-ink` → `bg-coral` brand bar; tabs strip `bg-white border-ink/8` → `bg-surface border-border`; badge `bg-red-500` → `bg-error`
- [x] Every `bg-white rounded-2xl` card → `rounded-[20px] border border-border bg-surface shadow-card`
- [x] Inputs `border-ink/10 bg-cream/bg-white` → `border-border bg-surface`; sub-panels `bg-cream` → `bg-ink-50`
- [x] Status semantics: in-stock/approved/destructive/error colors → `success`/`error` tokens; off-palette blue/orange "Approved/Hidden" → coral-tint/neutral pair
- [x] Rating stars `fill-amber-400` → `fill-gold text-gold` (Phase-0 soft amber)
- [x] Premium tier `bg-gradient-to-r from-amber-400 to-amber-500` → solid `bg-gold`
- [x] Gallery caption overlay `bg-gradient-to-t from-black/60` → solid `bg-ink/70`
- [x] Lightbox + cancel modal scrims → `bg-ink/…` no blur; cancel confirm `bg-red-500` → `bg-error`
- [x] `EMPTY_BANNER.color '#F3E4D0'` (cocoa) → `#FFD6E4` (accent)
- [x] Empty states (orders/reviews/customers/gallery) → soft designed states (icon + `text-text-tertiary`)
- [x] Clear the file's 8 pre-existing baseline errors while restyling (Phase-4 convention): `(r: any)` in reviews map; drop unused `approveReview` destructure

### AdminScreen.tsx
- [x] Verify only (thin `AdminPanel` wrapper — no own styling); confirm 'admin' route hides BottomTabBar (`showTabBar` gates on `view.name === 'tabs'`)

### Verify (self)
- [x] `npx tsc --noEmit` — zero NEW errors vs `/tmp/baseline_tsc.txt` (68 lines)
- [x] `npm run build` — passes
- [x] grep-sweep the touched files: `glass-strong`, `glass-deep`, `backdrop-blur`, `font-display`, `font-brand`, cocoa hexes, `linear-gradient`, `bg-gradient-*`, `bg-black/*` scrims → zero leftovers
- [x] Update AGENT_LOG.md (top, newest-first) + note Phase 6 is next
- [x] ZIP: `bas-redesign-phase5-<timestamp>.zip` with only the touched files
