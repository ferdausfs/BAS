# BAS Phase 4 — Complete Review & Status Report

**Date:** 2026-07-21  
**Repo:** https://github.com/ferdausfs/BAS  
**Scope:** P4-1 Close-button consistency + P4-2 Settings honesty  
**Review type:** Combined report

## Executive Summary

Phase 4 contains two related polish concepts:

- **P4-1:** Audit and propose a consistent close-button language across sheets.
- **P4-2:** Remove misleading Settings placeholder interactions.

P4-2 has been implemented and verified. P4-1 remains proposal-only because the repository lessons classify the current close-button variants as intentional context-specific styles.

---

# P4-1 — Close-button Consistency

## Findings

### 1. NotificationsSheet — reference style

**File:** `src/components/NotificationsSheet.tsx:36`

```tsx
className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-text shadow-card transition active:scale-90"
```

This is the preferred app-level sheet chrome: 44px circular surface control with card shadow and no border.

### 2. OccasionSheet — compact exception

**File:** `src/components/OccasionSheet.tsx:28`

```tsx
className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-secondary text-text-secondary transition active:scale-90"
```

This is smaller and square, but it suits the compact category-picker header and saves vertical space.

### 3. AuthSheet — intentional auth-specific style

**Files:** `src/components/AuthSheet.tsx:105-111,258`

AuthSheet uses text and rounded-square close controls together with its own 28px sheet radius. It must not be blanket-normalized.

### 4. WalletHistoryModal — full-screen back control

**File:** `src/components/WalletHistoryModal.tsx:46`

Wallet History uses a 48px circular ArrowLeft control. It is a full-screen back-navigation control, not a bottom-sheet close button.

### 5. ChatBot — branded header control

**File:** `src/components/ChatBot.tsx:538`

ChatBot uses a translucent 40px rounded-square X control on its coral branded header. It is component-specific and should remain unchanged.

## P4-1 Decision

**No automatic code change recommended.** The current variance is classified as intentional:

| Component | Style | Decision |
|---|---|---|
| NotificationsSheet | 44px circle + surface + shadow | Reference style |
| OccasionSheet | 40px rounded square | Keep unless explicitly approved |
| AuthSheet | Auth-specific controls | Leave untouched |
| WalletHistoryModal | 48px back button | Leave untouched |
| ChatBot | Branded translucent control | Leave untouched |

If stricter consistency is desired later, the only proposed change is `OccasionSheet.tsx:28` to the Notifications 44px style. That requires explicit approval because it overrides a deliberate compact exception.

---

# P4-2 — Settings Placeholder Honesty

## Before

`src/screens/ProfileScreen.tsx:430-436` used misleading “available soon” notifications:

```tsx
label: 'Notification Settings',
action: () => useUI.getState().addNotification(
  'Notifications',
  'Notification preferences will be available soon.'
),
```

```tsx
label: 'Password Manager',
action: () => useUI.getState().addNotification(
  'Password Manager',
  'Account security settings will be available soon.'
),
```

These rows appeared as active destinations with chevrons but had no actual settings screen or password-management logic.

## Implemented fix

**File:** `src/screens/ProfileScreen.tsx:430-436`

```tsx
label: 'Notification Settings · Coming soon',
action: () => useUI.getState().addNotification(
  'Notifications',
  'Notification preferences — Coming soon. Order updates live in Orders tab.'
),
```

```tsx
label: 'Password Manager · Contact support',
action: () => useUI.getState().addNotification(
  'Password Manager',
  'To change password, please contact support securely.'
),
```

### Preserved behavior

- Theme row remains: `Bake Art Style theme is already active."
- Delete Account remains: directs the user to contact support securely.
- No fake notification toggle was added.
- No Firebase `updatePassword` logic was added.
- P3 Help Center rows were not changed in P4-2.

---

# Verification Status

## P4-2 verification

- Baseline TypeScript errors: **30 pre-existing errors**
- Final TypeScript errors: **same 30 errors**
- New ProfileScreen errors: **none**
- Build: **passed** — `✓ built in 5.43s`
- `available soon` placeholder: removed from `ProfileScreen.tsx`
- Protected files: zero diff

## Protected files verified unchanged

- `src/components/ChatBot.tsx`
- `src/components/AuthSheet.tsx`
- `src/components/NotificationsSheet.tsx`
- `src/components/OccasionSheet.tsx`
- `src/components/WalletHistoryModal.tsx`
- `src/lib/store.ts`
- `src/screens/CheckoutScreen.tsx`
- `src/screens/OrdersScreen.tsx`
- `src/screens/CartScreen.tsx`
- `src/components/ProductCard.tsx`
- `src/components/BottomTabBar.tsx`

---

# Final Phase 4 Status

| Phase | Status | Result |
|---|---|---|
| **P4-1** Close-button consistency | Review/proposal complete | No code change; intentional variants documented |
| **P4-2** Settings honesty | Implemented | Two misleading placeholders made honest |

## Recommended next action

P4 is complete as scoped. Do not change P4-1 automatically. If desired, approve a separate one-file change for `OccasionSheet.tsx` after real-device review.

**Combined report status:** Complete.
