# BAS P4-1 — Close-Button Consistency Audit

**Date:** 2026-07-21  
**Repo:** https://github.com/ferdausfs/BAS  
**Review type:** Proposal-only audit — no code changes  
**Current state:** P4-2 Settings Honesty completed separately

## Executive Summary

The app has two close-button styles across different interaction contexts:

- **44px circular surface/shadow:** app-level notification sheet
- **40px rounded-square secondary:** compact occasion/auth sheet headers

This is a visible difference, but it is not automatically a bug. Existing lessons explicitly preserve this variance as intentional. Therefore P4-1 should remain a design decision, not a blanket cleanup.

## Check 1 — Notifications reference control

**File/line:** `src/components/NotificationsSheet.tsx:36`

```tsx
<button
  type="button"
  onClick={onClose}
  className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-text shadow-card transition active:scale-90"
  aria-label="Close"
>
  <X className="h-5 w-5" strokeWidth={2} />
</button>
```

**Assessment:** This is the preferred app-level sheet chrome style: 44px circle, surface background, card shadow, no border.

## Check 2 — Occasion compact control

**File/line:** `src/components/OccasionSheet.tsx:28`

```tsx
<button
  type="button"
  onClick={onClose}
  className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-secondary text-text-secondary transition active:scale-90"
  aria-label="Close"
>
  <X className="h-5 w-5" strokeWidth={2} />
</button>
```

**Assessment:** This is smaller and square, but it fits the compact category-picker header and saves vertical space.

## Check 3 — AuthSheet exception

**File/lines:** `src/components/AuthSheet.tsx:105-111,258`

AuthSheet uses a text Close action in one view and a 40px rounded-square X control in another. Auth flow has its own 28px sheet radius and spacing system.

**Decision:** AuthSheet must remain out of scope.

## Check 4 — Wallet history is not a sheet close control

**File/line:** `src/components/WalletHistoryModal.tsx:46`

Wallet History uses a 48px circular ArrowLeft control because it is a full-screen pushed view with back navigation, not a bottom-sheet close button.

**Decision:** Keep unchanged.

## Check 5 — ChatBot is branded chrome

**File/line:** `src/components/ChatBot.tsx:538`

ChatBot uses a 40px translucent rounded-square X control on its coral branded header.

**Decision:** Keep unchanged; it is a branded component-specific treatment.

## Proposal — OccasionSheet only

### Option A: Keep current style — recommended default

**For:**

- Compact header density
- Smaller visual footprint
- Existing lessons already allow this exception
- No risk of changing a deliberate design decision

**Against:**

- Not visually identical to NotificationsSheet

### Option B: Normalize to app-level sheet chrome — requires approval

Change only `src/components/OccasionSheet.tsx:28` to:

```tsx
<button
  type="button"
  onClick={onClose}
  className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-text shadow-card transition active:scale-90"
  aria-label="Close"
>
  <X className="h-5 w-5" strokeWidth={2} />
</button>
```

**For:**

- Consistent 44px hit target across app-level sheets
- Same surface/shadow treatment as Notifications
- Stronger premium floating-chrome language

**Against:**

- Adds one extra pixel on each side and slightly increases header footprint
- Removes the compact OccasionSheet-specific treatment
- Overrides an intentional lesson-backed exception

## Strict Scope if Option B is approved

### In scope

- `src/components/OccasionSheet.tsx` — close button only
- `AGENT_LOG.md`

### Zero-diff files

- `src/components/AuthSheet.tsx`
- `src/components/NotificationsSheet.tsx`
- `src/components/WalletHistoryModal.tsx`
- `src/components/ChatBot.tsx`
- All purchase-flow screens
- Any native touch listener

## Verification commands after approval

```bash
npm install --silent
npx tsc --noEmit 2>&1 | tee /tmp/post-tsc-p4-1.txt
npm run build

grep -n "h-11 w-11\|rounded-full\|shadow-card" src/components/OccasionSheet.tsx
git diff -- src/components/AuthSheet.tsx src/components/NotificationsSheet.tsx src/components/WalletHistoryModal.tsx src/components/ChatBot.tsx
```

Success criteria: build ends with `✓ built in`, no new TypeScript errors against the 30-error baseline, and all named invariant files remain unchanged.

## Final Decision Needed

**Buddy approval required before code change:**

- Keep OccasionSheet’s 40px square as an intentional compact exception, or
- Approve changing only OccasionSheet to the 44px circular app-level sheet style.

**Current recommendation:** Keep the current OccasionSheet style unless real-device review shows the 40px target feels too small.
