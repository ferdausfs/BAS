# BAS0002 Phase L4 — Account/admin/splash/chrome todo

Scope for this run only:
- ProfileScreen.tsx
- AdminScreen.tsx + AdminPanel.tsx
- SplashScreen.tsx
- NotificationsSheet.tsx (structure only; remains a sheet)
- Search dropdown structure in HomeTopBar.tsx / SearchBar.tsx

Completed:
- [x] Re-read GroceryApp reference CSS and render functions for splash, profile / your-profile, notifications, search / search-results, plus general appbar/page/section/card/list-row conventions.
- [x] Applied spacing / sizing / structural rhythm only; no color-token changes, no BottomTabBar, no auth flow.
- [x] Profile account page now uses the 24px page edge, 44/48px list icon rhythm, rounded-2xl content cards, and 22px sheet radii.
- [x] Admin internal panel got a light general-convention pass: 24px content edge, 44px header actions, rounded-2xl admin cards, list row gaps.
- [x] Splash/onboarding first screen was tightened to BAS-wide 24px edge with reference-like 48px CTA and 22px hero-card radius.
- [x] Notifications sheet was restructured into reference-like section header + divided list rows (sheet form preserved).
- [x] Search chrome was retuned to 44px rounded search/action controls with a reference-like recent/search-results dropdown row structure.
- [x] Self-verified: `npx tsc --noEmit` = same 31 pre-existing errors as baseline; `npm run build` passed; reference-gray grep passed; BottomTabBar/ProductScreen/CartScreen have zero diff.
- [x] Added a new shared-search lesson to `tasks/lessons.md`.

Next phase after this ZIP: BAS0002 Phase L5 — Final consistency pass.
