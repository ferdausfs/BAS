# Review Report — Site-wide Animation System (Premium Pass)

## Check 1: Sheets/modals have zero exit (close) animation — app-wide
**Code reference:**
- `src/components/NotificationsSheet.tsx` line 10 — `if (!open) return null;`
- `src/components/AuthSheet.tsx` line 83 — `if (!open) return null;`
- `src/components/WalletHistoryModal.tsx` line 67 — `if (!open) return null;`
- `src/components/OccasionSheet.tsx` (line ~19, same pattern — just built this session)

**What found:** Every bottom-sheet/modal in the app opens with `anim-fade` (backdrop) + `anim-up` (sheet slides up, .5s). But closing is an instant unmount — no reverse slide-down/fade-out at all. The moment `open` flips to `false`, the component just vanishes on the next render.

**Gap:** This is very likely the single biggest reason things "feel না premium" — an animated open followed by a hard snap-shut reads as unfinished/cheap, and it's the same pattern repeated in 4 different components. This is the highest-value, most consistent fix in the whole app.

## Check 2: Entrance-animation easing is a plain decelerate curve, not a "spring" — inconsistent with the one place that already has a spring feel
**Code reference:** `src/index.css` line 123-131 (`.anim-up`, `.anim-fade`, `.anim-scale`, etc. — all `cubic-bezier(.22,.7,.22,1)`, a decelerate-only curve, no overshoot)

**What found:** Compare to the occasion-chip tap animation (`HomeScreen.tsx`, and now `OccasionSheet.tsx`) which deliberately uses `cubic-bezier(.34,1.56,.64,1)` — a curve with overshoot (springy "settle" feel). That one spot already has the "premium bounce" character; every full-section entrance (28 uses of `.anim-up`, 9 of `.anim-fade` sitewide) uses the flatter, generic curve instead.

**Gap:** The app currently has two different animation "personalities" living side by side (spring on tap-feedback, flat-decelerate on entrances) instead of one consistent premium feel.

## Check 3: Screen/tab transitions are a plain opacity fade, no directional motion
**Code reference:** `src/App.tsx` line 97 — `<div key={screenKey} className="h-full w-full anim-fade">`

**What found:** Switching screens (e.g. Home → Categories → Product) is a flat `.4s` opacity fade only — no slide, no scale, no sense of spatial navigation.

**Gap:** Lower priority than Check 1/2 — a fade is a perfectly normal choice and safe to leave as-is, but if going for a more premium feel this is the next place it'd show. Flagging for awareness, not proposing to touch it in this pass unless asked.

## Check 4: Button tap feedback (`active:scale-90/95/[.98]`) — durations mostly rely on Tailwind's unset default
**Code reference:** 79 elements across the codebase use `transition` + `active:scale-*` without an explicit `duration-*` class (relies on Tailwind's default 150ms).

**What found:** This is actually consistent (everything defaults to the same 150ms), so it's not a "gap" so much as a note — no change needed here, mentioning only so the summary is complete.

---

## Summary

| Check | Priority |
|-------|----------|
| 1 — No exit/close animation on any sheet or modal (4 components) | **High — biggest lever** |
| 2 — Entrance-curve vs tap-curve mismatch (flat decel vs spring) | **High — sitewide, one CSS file** |
| 3 — Screen/tab transition is flat fade only | Low / optional |
| 4 — Button tap durations already consistent | Info only, no action needed |

## Proposed phased fix (pending approval)
- **Phase 1** (`src/index.css` only, one file, sitewide effect): give `.anim-up` / `.anim-scale` / `.anim-fade` a touch of the same spring character as the chip-tap curve, so entrances and taps feel like one consistent design language.
- **Phase 2** (4 components — `NotificationsSheet.tsx`, `AuthSheet.tsx`, `WalletHistoryModal.tsx`, `OccasionSheet.tsx`): add a real close animation — delay the unmount by ~200ms while playing a reverse slide-down/fade-out, instead of vanishing instantly. This is the same fix repeated in 4 places (same shell pattern), so it's mechanical, not a redesign.
- Check 3 (screen transitions) — leaving untouched unless you want it in this pass too.

## Raw code snippets

**Current sheet close pattern (identical in all 4 components):**
```tsx
if (!open) return null;
```

**Current entrance curve (`src/index.css:123-131`):**
```css
.anim-fade      { animation: fadeIn .4s ease-out both; }
.anim-scale     { animation: scaleIn .38s cubic-bezier(.22,.7,.22,1) both; }
.anim-up        { animation: slideUp .5s cubic-bezier(.22,.7,.22,1) both; }
```

**Existing spring curve already used for chip taps (`HomeScreen.tsx`, `OccasionSheet.tsx`):**
```
cubic-bezier(.34,1.56,.64,1)
```
