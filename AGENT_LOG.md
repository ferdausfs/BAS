## Session: 2026-07-21, Phase P6-1A (Admin Phone OS Shell)
**Agent/Tool:** Arena.ai Agent Mode — Standalone Admin Phone OS Redesign
**Feature worked on:** Admin Phone OS Shell, PIN Gate at OS Boot, App Launcher Grid, Sub-App Navigation, Fixed Bottom Admin Dock, Shared Overlays

### কী হয়েছে:
- Refactored `AdminPanel.tsx` into an **Admin Phone OS Shell** featuring a top Android status bar, PIN-at-boot authentication gate, and interactive launcher grid.
- Built **App Launcher Home Screen** with KPI stats cards (Revenue, Pending, Today, Active Products) and 9 dedicated color-coded Android App cards: Orders, Products, Banners, Gallery, Reviews, Customers, Zones, Settings, Analytics.
- Added **Standalone Sub-App Screens** with Android round Back controls (`←`), sector headers, and quick sector actions (e.g. Export CSV, + Add Product).
- Integrated **Fixed Bottom Dock Navigation** for quick switching between Launcher, Orders, Products, Settings, and Exit OS.
- Retained shared root overlays (`viewImage` Lightbox and `cancelModal` order cancellation modal) at the OS Shell level.
- Preserved all `updateSettings` Firebase routes, image upload handlers, state management, and error boundaries.

### Touched files:
- `src/components/AdminPanel.tsx`
- `AGENT_LOG.md`
- `tasks/P6-ADMIN-PHONE-APP-REVIEW-REPORT.md`

### Verification:
- Baseline TypeScript errors: 30.
- Final TypeScript errors: 30; zero new errors introduced.
- Build passed in 5.20s via `npm run build`.

### এখনো Pending:
- Phase 2: Fullscreen integration for 5-tap logo trigger in `ProfileScreen.tsx`.

---

## Session: 2026-07-21, Phase P5-1 + P5-2 + P5-3
**Agent/Tool:** Arena.ai Agent Mode — ProductCard stock state + Wishlist unavailable state
**Feature worked on:** Explicit inventory messaging and saved-product recovery

### কী হয়েছে:
- ProductCard now shows an explicit `Out of Stock` badge instead of silently hiding the Add action.
- Low-stock wording unified to `মাত্র Xটি বাকি!` / `মাত্র কয়েকটি বাকি!`.
- Wishlist keeps unavailable saved products and adds a `Notify me when available` action using the existing `bakeart-alerts` local-storage contract.
- Wishlist empty states and 220ms removal transition were preserved.
- ProductCard radius and Home/Categories browse filtering were preserved.

### Touched files:
- `src/components/ProductCard.tsx`
- `src/screens/WishlistScreen.tsx`
- `AGENT_LOG.md`
- `tasks/P5-1-PRODUCTCARD-CONTRAST-AUDIT.md`
- `tasks/P5-COMPLETE-REVIEW-REPORT-2026-07-21.md`

### Verification:
- Baseline TypeScript errors: 30.
- Final TypeScript errors: 30; no new errors.
- Build passed.
- Protected HomeScreen, CategoriesScreen, store, AdminPanel, ProductScreen, and touch-listener code remained unchanged.

### এখনো Pending:
- Real-device contrast validation for ProductCard remains a manual follow-up; no unverified overlay rewrite was made.
- Inventory policy remains conversion-first: Home/Categories continue to hide out-of-stock products.

### পরবর্তী Agent এর জন্য নোট:
- `Out of Stock` is now rendered by ProductCard for any saved/directly rendered unavailable item.
- Wishlist notify action reuses `bakeart-alerts`; do not create a second alert-storage contract.

---

## Session: 2026-07-21, Phase P4-2
**Agent/Tool:** Arena.ai Agent Mode — Settings honesty
**Feature:** Notification Settings + Password Manager placeholder → honest

### কী হয়েছে:
- Notification Settings is now labeled `Coming soon` and directs users to the Orders tab for live order updates.
- Password Manager is now labeled `Contact support` and gives a secure support instruction; no Firebase password logic was added.
- Theme and Delete Account messages were preserved unchanged.
- P3 Help Center rows and all close-button components were left untouched.

### Touched files:
- `src/screens/ProfileScreen.tsx`
- `AGENT_LOG.md`

### Commit:
- Prepared ZIP; commit/push pending user verification.

### এখনো Pending:
- P4-1 close-button consistency — propose only; Occasion 40px square remains an intentional exception per lessons.

### পরবর্তী Agent এর জন্য নোট:
- `available soon` should be absent from ProfileScreen settings/help rows; no fake notification toggle or password update logic was added.

---

## Session: 2026-07-21, Phase P3-1
**Agent/Tool:** Arena.ai Agent Mode — Help Center honesty
**Feature worked on:** Help Center placeholder → real WhatsApp + honest disabled rows

### কী হয়েছে:
- WhatsApp now opens via `waLink(settings.whatsappNumber)` when a valid number exists; otherwise it shows an honest fallback toast to use Customer Service chat.
- FAQ now says `FAQ — coming soon`, uses a disabled visual treatment, and points users to Customer Service chat.
- Facebook/Instagram now say `Link not available yet`, use disabled styling, and do not invent URLs.
- Preserved Customer Service → ChatBot behavior exactly.

### Touched files:
- `src/screens/ProfileScreen.tsx`
- `AGENT_LOG.md`

### Commit:
- Prepared ZIP; commit/push pending user verification.

### এখনো Pending:
- P4 close-button consistency (separate)
- Settings placeholder rows (Notification Settings, Password Manager)

### পরবর্তী Agent এর জন্য নোট:
- `settings.whatsappNumber` comes from `useSettingsStore`; `waLink` is reused from `src/lib/utils.ts`.
- No verified Facebook/Instagram URL was found, so both remain visibly unavailable.
- `available soon` remains only in settings rows, not in Help Center rows.

---

## Session: 2026-07-21, Phase P2-2 + P2-3
**Agent/Tool:** Arena.ai Agent Mode — consolidated Phase 2 implementation and audit
**Feature worked on:** Orders status palette, pending checkout CTA, overflow consistency, final audit

### কী হয়েছে:
- Orders status steps now carry distinct status colors/backgrounds and use them for badge, progress fill, and step circles.
- Pending checkout card now uses dashed border, card shadow, pulsing accent, orange Pending badge, and emphasized Continue checkout CTA.
- Orders and Cart line-clamp parents now include `min-w-0`; existing flex-shrink behavior preserved.
- Final P2 audit report written to `tasks/PHASE-2-COMPLETION-REPORT.md`.

### Touched files:
- `src/screens/OrdersScreen.tsx`
- `src/screens/CartScreen.tsx`
- `src/screens/CheckoutScreen.tsx` (P2-1)
- `AGENT_LOG.md`
- `tasks/PHASE-2-COMPLETION-REPORT.md`

### Verification:
- `npx tsc --noEmit`: same 30 baseline errors; no new errors (line shifts only in OrdersScreen).
- `npm run build`: passed.
- ChevronRight usages have imports; protected invariant files have zero diff.

### এখনো Pending:
- No P2 code phase remains. The P2-1 ZIP was prepared before the consolidated P2-2 changes; create/use a new combined ZIP for this final state.

### পরবর্তী Agent এর জন্য নোট:
- `rounded-[20px]` occurrences in screens are classified in the final audit; do not blanket-replace deliberate/shared component or chip/icon usages.

---

## Session: 2026-07-21, Phase P2-1
**Agent/Tool:** Arena.ai Agent Mode — Checkout premium polish
**Feature worked on:** Detail sheet + payment cards

### কী হয়েছে:
- Detail sheet: eyebrow + h-28 image shadow + bottom Close CTA
- DetailRow: min-w-0 + flex-shrink-0 + line-clamp value
- Payment cards: shadow-card + scale-[1.01] visual separation
- Copy-number area: bordered surface with icon-enhanced coral Copy button

### Touched files:
- `src/screens/CheckoutScreen.tsx`
- `AGENT_LOG.md`

### Commit:
- Not committed; prepared phase ZIP for handoff.

### এখনো Pending:
- P2-2 Orders status palette + overflow

### পরবর্তী Agent এর জন্য নোট:
- Detail sheet keeps the existing `rounded-t-[28px]` deliberately; do not change it without escalation.
- Verify `Close details`, `shadow-card`, and `scale-[1.01]` directly in `CheckoutScreen.tsx`.

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0034 — Fix ProductCard layout regression with Option-B shadow-text cards (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy reported the previous product-card attempt broke the Home Featured Products area (cards collapsed into thin strips / looked wrong). Requested the correct Option-B style: full image card with text directly on a bottom shadow, no inner card/glass box.

**Root cause:** The previous shared ProductCard styling was not stable enough across all consumers and could collapse visually in grid contexts. It also still did not match the requested no-inner-card shadow-text interpretation closely enough.

**In scope (files touched):** `src/components/ProductCard.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** product data, cart add logic, wishlist logic, product detail screen, checkout/order logic.

### কী বদলেছে
- Rebuilt `ProductCard.tsx` as a stable fixed-height image card using inline `style={{ height }}` so grid contexts cannot collapse.
- Product image fills the whole card.
- Removed inner details card/glass panel entirely.
- Details are written directly over a bottom dark gradient/shadow, matching the Option-B direction.
- Floating badge + heart remain on top of image.
- Add button is a white `Add +` pill.
- Preserved all behavior: image fallback, wishlist toggle, add-to-cart, bestseller/new/discount/low-stock badges.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new ProductCard errors.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- This is a regression fix. After deploy, check Home Featured Products first: cards should be normal height again, not thin strips.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0033 — Product cards no-box shadow-text overlay style (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy clarified the desired Option-B product-card style: do not create a visible inner card/glass box. The full cake image should fill the card, and product details should be written directly over a bottom shadow/gradient on the image.

**In scope (files touched):** `src/components/ProductCard.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** product data, cart add logic, wishlist logic, product detail screen, checkout/order logic.

### কী বদলেছে
- Removed the inner frosted details box from ProductCard.
- Product image now fills the entire card.
- Added only a bottom shadow/gradient overlay for readability.
- Product name, size/flavor, rating, price, and Add action are now written directly over that shadow.
- Add action is now a white pill (`Add +`) matching the Option-B reference direction.
- Badge and heart remain floating over the image.
- Add-to-cart, wishlist, image fallback, low-stock, bestseller/new logic unchanged.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new ProductCard errors.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, review product cards across Home/Cake/Wishlist/Search. Details should no longer look like a separate card; they should sit directly on the image shadow.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0031 — Product cards thin edgeless glass detail overlay (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy approved the refined product-card mockup: full-image cards with the detail area over the cake image, but the glass panel should be thinner and more edgeless/feathered so the start/end of the glass is less obvious.

**In scope (files touched):** `src/components/ProductCard.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** product data, cart add logic, wishlist logic, product detail screen, checkout/order logic.

### কী বদলেছে
- ProductCard detail glass panel made thinner and softer:
  - bottom readability fade reduced from heavier `48%` to lighter `42%`.
  - detail wrapper padding reduced.
  - visible border removed from the glass panel.
  - glass changed to lighter `bg-white/45` with lower blur (`backdrop-blur-[5px]`).
  - added subtle radial highlight + inset highlight pseudo-elements to feather the edge.
  - title/subtitle/price/add button slightly compacted to match the thinner panel.
- The full-card image background, floating badges/heart, add-to-cart logic, and wishlist logic are unchanged.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new ProductCard errors.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, review Home/Cake/Wishlist product cards: the glass detail area should feel lighter, thinner, and less boxed-in while keeping text readable.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0030 — Product cards full-image light-glass overlay style (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy wanted all app product cards to move toward the supplied image-first reference style. After mockup iteration, Buddy clarified the correct design: the full card should be the cake image, and the details should sit on top of that same image with a light glass/blur overlay — not a separate image/details split card and not a heavy muddy glass layer.

**In scope (files touched):** `src/components/ProductCard.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** product data, cart add logic, wishlist logic, product detail screen, checkout/order logic.

### কী বদলেছে
- Rebuilt `ProductCard` visual structure so every `grid` / `catalog` / `horizontal` product-card usage shares one image-first card system.
- The product image now fills the entire card as the background.
- Details now overlay the image at the bottom using a small/light frosted panel:
  - gentle white/pink fade for readability
  - low blur (`backdrop-blur-[7px]`) instead of heavy blur
  - dark readable text
  - BAS primary/coral price and add button
- Badge and heart remain floating over the image.
- Add-to-cart behavior, wishlist behavior, image fallback, low-stock badge, bestseller/new badges, and duplicate-cart logic are unchanged.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new ProductCard errors.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, review Home featured/search cards, Cake tab catalog cards, and Wishlist cards. The same full-image/light-glass style should be used consistently.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0029 — Replace onboarding slides with 2s glass heartbeat logo splash (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy requested removing the onboarding slides that appeared on every refresh. Desired behavior: show only the supplied BAS logo with a 2-second heartbeat animation, no extra `Bake Art Style` duplicate title, keep a logo-style `Handcrafted Bakery` tagline, use a glass/blur overlay over the last saved tab, then auto-open the last saved tab.

**In scope (files touched):** `src/screens/SplashScreen.tsx`, `src/App.tsx`, `src/index.css`, `public/bas_default_logo.png`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** auth flow, tab navigation internals, product/order/checkout logic.

### কী বদলেছে
- Removed the old multi-slide onboarding UI from `SplashScreen.tsx`.
- New splash behavior:
  - shows supplied BAS logo only (no duplicate `Bake Art Style` heading)
  - `Handcrafted Bakery` tagline in a softer logo-like serif/italic style
  - glass overlay with blurred app/tab silhouette behind it
  - 2-second heartbeat animation: logo pulse, glow pulse, ring pulse, subtle screen vibration, progress shimmer
  - after 2 seconds, automatically opens last saved tab
- `App.tsx` now persists the current active tab to `localStorage` as `bas-last-tab`.
- `SplashScreen.tsx` reads `bas-last-tab` and falls back to Home if unavailable/invalid.
- Added the provided logo asset to `public/bas_default_logo.png`.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new SplashScreen/App errors. The visible App `PhoneFrame` unused warning is pre-existing.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, refresh the app: old onboarding slides should be gone; glass heartbeat logo splash should run for ~2s and then open the last saved tab.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0028 — Checkout step animation + item expand/detail sheet (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy requested checkout step labels to animate like the Orders tabs, and reported the `+ more items` row in checkout did nothing. Also requested tapping an item to show details: size, price, and selected cart options.

**In scope (files touched):** `src/screens/CheckoutScreen.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** cart store logic, order submission/payment logic, product data.

### কী বদলেছে
- Checkout step labels (`ঠিকানা / নিশ্চিত / পেমেন্ট`) now animate:
  - active step label grows slightly (`scale-110`, 11px)
  - smooth `transition-all duration-300`
  - small `anim-pop` on active label
- Checkout item list now supports expand/collapse:
  - first 3 items show by default
  - `+N আরও আইটেম` expands to show all
  - `কম দেখান` collapses again
- Tapping a checkout item now opens an item details bottom sheet showing:
  - image/name
  - size
  - flavor
  - add-ons/topping if present
  - custom message if present
  - unit price
  - quantity
  - item total

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new CheckoutScreen errors. Remaining Checkout warnings are existing unused location-helper declarations.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, test checkout step 1: tap `+N আরও আইটেম`, tap individual item, verify details sheet opens and closes.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0027 — Chat WhatsApp CTA appears only when support is suggested (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy requested the WhatsApp contact button should not permanently occupy the bottom of Customer Service chat. The bottom area should remain the message/send input by default, and the WhatsApp tap button should animate in only when BAS mentions contacting WhatsApp/support.

**In scope (files touched):** `src/components/ChatBot.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** ChatBot reply/rule logic, WhatsApp URL generation, Profile navigation, order/payment logic.

### কী বদলেছে
- Removed the always-visible bottom WhatsApp bar from ChatBot.
- Added `showWhatsappCta`, based on the latest bot message containing WhatsApp/support intent.
- WhatsApp CTA now appears with `anim-up` only after BAS suggests WhatsApp/support.
- Before that, the bottom area stays focused on the normal camera + message input + paper-plane send button.
- The CTA still uses the existing `waLink()` and WhatsApp number validation behavior.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new ChatBot errors.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, test Customer Service: open chat → no WhatsApp bar initially; ask a support/contact question → WhatsApp CTA animates in above the input; send button remains visible.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0026 — Customer Service true fullscreen chat + hide bottom nav (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy reported the Customer Service chat was still not right: it opened inside Profile with the bottom navigation covering the input area. Requested a true fullscreen chat page like the supplied reference, and hide the navigation bar while chatting.

**In scope (files touched):** `src/screens/ProfileScreen.tsx`, `src/components/ChatBot.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** ChatBot reply/rule logic, WhatsApp link logic, global store, order/payment logic.

### কী বদলেছে
- Profile `chat` view now hides the normal Profile header and fills the available screen with the chat page.
- Added `useModalDepth(profileView === 'chat')` so the bottom navigation bar hides while Customer Service chat is open.
- `ChatBot` now has proper `fullPage` behavior:
  - no rounded embedded card/border in full-page mode
  - full-height chat surface
  - top chat header with close/back button
  - input area no longer sits behind the bottom nav
- Added `onClose` support to `ChatBot`; Profile passes `onClose={() => setProfileView('help')}` so closing returns to Help Center.
- Send button remains the paper-plane send button; no microphone button is introduced.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new ProfileScreen/ChatBot errors.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, test Profile → Help Center → Customer Service: it should be a full-height page, bottom nav hidden, and the message input/send button fully visible.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0025 — Help Center Customer Service as full page chat (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy clarified Customer Service should not open as a popup/bottom sheet. It should open as a separate in-app chat page like the supplied reference.

**In scope (files touched):** `src/screens/ProfileScreen.tsx`, `src/components/ChatBot.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** ChatBot reply/rule logic, WhatsApp link, global store, order/payment logic.

### কী বদলেছে
- Help Center → Customer Service now opens an in-profile full page (`profileView='chat'`) instead of opening the support popup/sheet.
- Added `fullPage` support to `ChatBot` so embedded chat can fill the page height instead of using the old fixed 440px embedded card.
- Profile header shows `Customer Service`; back returns to Help Center/Profile flow.
- The chat input still uses the paper-plane Send button; no microphone button is introduced.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new ProfileScreen/ChatBot errors.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, test Profile → Help Center → Customer Service: it should navigate to a full chat page, not dim the screen or show a popup.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0024 — Help Center customer-service double-open bug fix (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy reported that tapping Help Center → Customer Service opens the chat in a broken/double state: what used to require two taps happens at once. Also requested keeping send button behavior, not microphone-style UI.

**Root cause:** `ProfileScreen.tsx` had a `useEffect` that called `setChatOpen(contactOpen || customerOpen)`. When the Help Center opened the local support sheet (`contactOpen=true`) with `<ChatBot embedded />`, that effect also opened the global `<ChatBot />` overlay from `App.tsx` at the same time. Result: embedded support sheet + global chat overlay stacked together, causing the double-open/broken live state.

**In scope (files touched):** `src/screens/ProfileScreen.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** ChatBot message/reply logic, WhatsApp link logic, support content/rules, global store code.

### কী বদলেছে
- Removed the ProfileScreen effect that forced `setChatOpen(true)` when `contactOpen` or `customerOpen` became true.
- Help Center → Customer Service now opens only the intended local support sheet with embedded chat.
- Bottom navigation hiding is still handled by existing `useModalDepth(contactOpen)` / modal depth logic, so no global chat-open side effect is needed.
- Chat input already uses the `Send` icon button; no microphone button is introduced.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new ProfileScreen/ChatBot errors.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, test: Profile → Help Center → Customer Service. It should open one support sheet only; close button should close it cleanly; send button should remain the paper-plane send action.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0023 — Move Help Center to Profile main list + profile-style help UI (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy requested moving the Help Center function out to the main Profile screen and making Help Center UI/UX match the Profile list style.

**In scope (files touched):** `src/screens/ProfileScreen.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** support/chat logic, auth/sign-out logic, order/cart/payment logic.

### কী বদলেছে
- Added `Help Center` as a main Profile list row, between `My Wallet` and `Settings`.
- Removed the separate boxed Help Center shortcut from Settings, so Settings stays focused on account settings only.
- Rebuilt Help Center subview to match Profile's row-based style:
  - icon circle on left
  - label + short detail
  - chevron on right
  - divider rows, no large tab/card layout
- `Customer Service` still opens the existing support/chat sheet.
- Other help rows currently trigger safe informational notifications until final links/pages are added.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new ProfileScreen errors.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, test Profile → Help Center row → profile-style Help Center screen → Customer Service opens support sheet.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0022 — Checkout summary edit opens in-place pickers (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy requested that `Edit` from the checkout order-summary step should not navigate back to the previous checkout step. Instead, editing the address/time sections should open the same in-place bottom-sheet pickers already used on the address/date step.

**In scope (files touched):** `src/screens/CheckoutScreen.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** payment/order submission logic, address/date picker internals, cart logic, store/Firebase code.

### কী বদলেছে
- In the checkout `Order summary` card:
  - Delivery address `Edit` now opens the `Delivery Address` bottom sheet on the same confirmation step.
  - Delivery time `Edit` now opens the `Delivery Time` bottom sheet on the same confirmation step.
- Removed the previous behavior where both Edit buttons called `goToStep(0)` and moved the user back to the address step.
- Existing picker behavior and selected-address/date state are unchanged.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new CheckoutScreen errors. Remaining Checkout warnings are existing unused location-helper declarations.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, test checkout step 2/confirm: tap address Edit → address picker opens without leaving step 2; tap time Edit → delivery time picker opens without leaving step 2.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0021 — Checkout selected-address applied-through-payment fix (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy reported the address picker visually selected a non-default address, but the confirmation/payment step still used the default address.

**Root cause:** Address selection updated the selected card state, but checkout form fields could still retain stale/default phone/address values in some flows. Phone especially was using `prev.phone || addr.phone`, so an existing default/user phone prevented the selected address phone from being applied. Confirmation/submission also read directly from `form.*`, so stale values could survive even when `selectedAddressId` was correct.

**In scope (files touched):** `src/screens/CheckoutScreen.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** saved-address storage format, Profile address editor, payment/order submission mechanics beyond using the selected address values.

### কী বদলেছে
- Selecting an address now overwrites checkout phone with the selected address phone when available (`addr.phone || prev.phone`) instead of preserving stale/default phone.
- Added effective selected-address values:
  - `checkoutPhone`
  - `checkoutAddress`
  - `checkoutDistrict`
- Validation, order payload, profile sync, location address, CTA disabled state, and confirmation summary now use those effective selected-address values.
- Manual address typing still clears `selectedAddressId`, so manual values remain supported.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new CheckoutScreen errors. Remaining Checkout warnings are existing unused location-helper declarations.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, test specifically: choose non-default address in Checkout → go next → confirmation shows non-default phone/address → submit/payment uses that selected address.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0020 — Checkout app-styled address picker + selected-address persistence fix (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy reported the checkout address UI was still confusing: address selection in step 1 did not reliably carry into the confirmation/payment step, default address appeared to override the chosen address, and requested the delivery-address UI to use an app-styled picker like the custom calendar picker.

**In scope (files touched):** `src/screens/CheckoutScreen.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** order submission/payment logic, Profile saved-address localStorage format, cart logic, store/Firebase code.

### কী বদলেছে
- Checkout delivery address section is now a single selected-address summary card with a `Change` action, instead of a horizontal row that could look like multiple cards were active.
- Added a custom app-styled bottom-sheet address picker:
  - rounded sheet + drag handle
  - saved address list
  - single selected indicator
  - `Default` badge
  - `Add New` action routes safely to Profile tab
- Address selection now goes through a single `applyCheckoutAddress()` path that updates both `selectedAddressId` and checkout `form.address/form.district/phone` together.
- Auto-default logic now applies the saved default address only when no explicit address has been selected yet; after the user selects another address, the default no longer overrides it.
- Manual address typing clears `selectedAddressId`, preventing stale selected-card state.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new CheckoutScreen errors. Remaining Checkout warnings are existing unused location-helper declarations.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, test: save 2 addresses, set one default, go Checkout, tap Change, choose non-default address, proceed to Confirm step, verify the selected non-default address appears and is submitted.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0019 — Checkout custom delivery date/time picker (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy reported the checkout delivery date currently opens the browser/system calendar. Requested an in-app date/time picker styled like the supplied pickup-time reference, matching BAS UI.

**In scope (files touched):** `src/screens/CheckoutScreen.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** checkout validation/order submission logic, payment logic, delivery slot values, store/Firebase code.

### কী বদলেছে
- Replaced the native `<input type="date">` with a BAS-styled button that opens a custom bottom sheet.
- Added in-app delivery date/time picker sheet:
  - rounded bottom sheet with drag handle
  - 14 upcoming delivery-date cards from `getMinDeliveryDate()`
  - delivery slot buttons using existing `SLOTS`
  - Reset and Confirm actions
  - BAS coral/pink styling, no system calendar UI
- Existing `form.date` and `form.time` state are still used, so checkout submission behavior remains unchanged.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new CheckoutScreen errors. Remaining Checkout warnings are the existing unused location-helper declarations.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, test checkout step 1: tap delivery date row → custom sheet opens → choose date/slot → Confirm → selected values remain through next steps.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0018 — Orders tab active-label scale animation (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy requested a small animation on the Orders screen tabs: when tapping `Pending`, `Active`, `Completed`, or `Cancelled`, the selected tab text should become slightly larger via animation.

**In scope (files touched):** `src/screens/OrdersScreen.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** Orders data/filtering logic, order cards, cart/pending logic, BottomTabBar.

### কী বদলেছে
- Orders tab buttons now animate with `transition-all duration-300 ease-out`.
- Active tab text changes from `13px` to `15px` and scales to `scale-110`.
- Inactive tabs stay `13px / scale-100`.
- Added a small `anim-pop` on the active label so tab changes feel responsive without changing the layout structure.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new OrdersScreen errors from this animation change.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- Single visual micro-interaction. Review on mobile: active tab should gently grow, not jump harshly.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0017 — Orders pending-checkout tab + remove global QuickBar (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy requested functional/UI changes on the Orders page: add a `Pending` section before Active for checkout/cart items not paid/submitted yet, and remove the top floating QuickBar (notification/wallet/wishlist/checkout bubble) so the app feels more premium.

**In scope (files touched):** `src/screens/OrdersScreen.tsx`, `src/App.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** order placement/payment logic, cart store logic, BottomTabBar, NotificationsSheet.

### কী বদলেছে
- **OrdersScreen.tsx**
  - Added a new first tab: `Pending`, before `Active / Completed / Cancelled`.
  - Pending tab shows current cart/checkout items as a pending checkout card when payment/order submission has not happened yet.
  - Pending card includes item thumbnails, quantity/size, pending total, `View cart`, and `Continue checkout` actions.
  - It is explicitly treated as *not a placed order yet*; once submitted successfully, the order appears under Active as before.
- **App.tsx**
  - Removed the global floating `QuickBar` render from the app. This removes the top-right floating notification/wallet/wishlist/checkout bubble from Orders and all remaining screens.
  - Existing bottom navigation remains untouched; Home notification bell / normal sheets remain available where already built.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new errors from the pending-card additions. (OrdersScreen's existing `unknown` item/spread errors are pre-existing baseline issues.)
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- After deploy, test: add items to cart → open Orders → Pending tab shows pending checkout → Continue checkout works → submit order → Pending clears when cart clears and placed order appears under Active.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0016 — Checkout address single-select + Profile default-address fix (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy reported remaining address bugs in Checkout: multiple address cards appeared selected at the same time, saved/default address handling was confusing, and Profile Manage Address needed a clear `Use as default` action.

**Root cause:** Checkout selected cards by comparing `form.address === addr.address`, so duplicate/similar saved addresses could all render selected. Selection needed a stable selected-address ID, not address text matching.

**In scope (files touched):** `src/screens/CheckoutScreen.tsx`, `src/screens/ProfileScreen.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** order submission/payment logic, localStorage key format, cart logic, store/Firebase code.

### কী বদলেছে
- **CheckoutScreen.tsx**
  - Added `selectedAddressId` state so only one address card can be selected at a time.
  - On checkout load, automatically selects the saved default address if one exists; otherwise selects the first available saved/current address.
  - Selecting an address now marks only that card selected and fills `address`, `district`, and phone fallback.
  - Manual address typing clears `selectedAddressId`, so typed/custom address does not leave stale selected cards highlighted.
- **ProfileScreen.tsx**
  - Address list action label changed from `Default` to clear `Use as default`.
  - If the current default address is removed, the first remaining address is promoted as default to avoid ending up with no default when addresses remain.

### Verification (self)
- `npx tsc --noEmit`: **30 known pre-existing errors** remain; no new Checkout/Profile errors. Remaining Checkout warnings are the existing unused location-helper declarations.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- This is the final address bugfix for the reported issues. After deploy, test: create 2+ addresses in Profile, set one as default, go Checkout, confirm exactly one card is selected, tap another card, confirm previous one unselects, type manual address, confirm no saved card remains selected.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0015 — Checkout saved-address selection crash fix (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy reported a critical checkout issue after the Profile/Address UI work: saved addresses did not appear in Checkout, selecting addresses was not possible, and tapping `+ Add New` crashed the app.

**Root cause:** `CheckoutScreen.tsx` still used hardcoded demo address cards (`Home`, `Office`, etc.) instead of the real `bakeart-addresses-${user.id}` saved-address store used by ProfileScreen. The `+ Add New` button also routed to `go({ name: 'profile' })`, which is not a valid app route type (Profile lives under `{ name: 'tabs', tab: 'profile' }`), causing a runtime/navigation failure.

**In scope (files touched):** `src/screens/CheckoutScreen.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** order submission logic, payment logic, ProfileScreen address save logic, cart logic, store/Firebase code.

### কী বদলেছে
- Checkout delivery-address cards now read real saved addresses from `localStorage` via the same key as ProfileScreen: `bakeart-addresses-${user.id}`.
- Selecting a saved address now fills `form.address`, `form.district`, and phone fallback correctly.
- If no saved address exists but checkout already has an address from profile/recent order, it shows a `Current` card.
- `+ Add New` no longer crashes: it safely routes to `{ name: 'tabs', tab: 'profile' }` and labels the flow as `Profile → Manage Address`.
- Added a fallback manual address textarea in the checkout address section so checkout is still usable even without saved addresses.
- Removed the invalid checkout route usage; as a side effect, the TypeScript baseline improved from 31 to 30 known pre-existing errors.

### Verification (self)
- `npx tsc --noEmit`: **30 errors** now (one pre-existing invalid route error in CheckoutScreen was fixed); no new errors. Remaining CheckoutScreen warnings are pre-existing unused location-helper declarations.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- This is a bugfix, not just UI polish. After deploy, test: Profile → Manage Address save address → Cart/Checkout → saved address appears → tap address selects it → `+ Add New` no longer crashes.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0014 — Product detail card separation after floating thumbnails (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy reviewed the live product page after the floating-thumbnail pass and said the product card still felt attached/overlapped with the image strip; text was starting too low. Requested: make the product card clearly separate like the reference and bring the content text higher.

**In scope (files touched):** `src/screens/ProductScreen.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** image swipe/touch listener logic, lightbox behavior, cart/add-to-cart logic, wishlist/share logic, product data.

### কী বদলেছে
- Floating thumbnail strip remains above the card, but now has a clearer gap (`mb-5`) and a slightly stronger white surface (`bg-white/90`).
- Product content is no longer a full-width attached sheet with large top padding. It is now a separate rounded card (`mx-4 rounded-[24px] border bg-surface`) below the thumbnail strip.
- Removed the previous conditional `pt-16` spacing that pushed title/rating/price too far down; product text now starts near the top of the card (`pt-5`).
- Existing thumbnail tap behavior and gallery/image logic are preserved.

### Verification (self)
- `npx tsc --noEmit`: still reports the known **31 pre-existing errors**; no new `ProductScreen.tsx` errors.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- Single focused visual adjustment. Review product detail on a real phone: the thumbnail strip should now float over the hero while the product info card reads as a separate card, with title text starting higher.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0013 — Product detail floating thumbnail strip adjustment (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy reviewed the product-page mockup and requested the multiple product images/thumbnails to sit **above the product card/sheet**, like the supplied reference.

**In scope (files touched):** `src/screens/ProductScreen.tsx`, `AGENT_LOG.md` plus earlier pending cumulative UI files already in this ZIP.
**Out of scope (untouched):** ProductScreen native touch/swipe listener blocks, lightbox swipe behavior, cart/add-to-cart logic, wishlist/share logic, product data.

### কী বদলেছে
- Moved the gallery thumbnail strip out of the content sheet body and into a floating strip positioned over the top edge of the product card/sheet.
- Floating strip now uses a translucent surface, rounded 18px container, 56px thumbnail tiles, active coral ring/lift, and a `+N` tile when there are more than five gallery images.
- Product sheet top padding is conditionally increased when thumbnails exist, so the product title/rating starts below the floating thumbnails without crowding.
- Existing image selection logic is preserved: tapping a thumbnail still calls `setActiveImg(url)`; hero swipe and lightbox code are unchanged.

### Verification (self)
- `npx tsc --noEmit`: still reports the known **31 pre-existing errors**; no new `ProductScreen.tsx` errors.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local install was reverted.

### Handoff / next
- Single focused adjustment. Review product detail on real mobile viewport, especially products with 2–5 images and products with 6+ images to confirm the `+N` tile reads correctly.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0012 — Manage Address editor + Product detail rhythm retune (single phase, complete) ✅ (2026-07-20, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy selected two more areas for UI work: the Manage Address add/edit flow and Product detail page. Supplied reference screens for location permission / enter-location and product detail. Requested HomeScreen-sized typography/spacing, not oversized reference text.

**In scope (files touched):** `src/screens/ProfileScreen.tsx`, `src/screens/ProductScreen.tsx`, `AGENT_LOG.md` plus earlier pending UI files already in this cumulative ZIP.
**Out of scope (untouched):** ProductScreen native touch/swipe listener logic, cart/add-to-cart logic, address save/geolocation logic, store/Firebase code, `BottomTabBar.tsx`.

### কী বদলেছে
- **Manage Address add/edit flow (`ProfileScreen.tsx`)**
  - Address add/edit modal changed from the older bottom sheet into a cleaner full-screen `Enter Your Location` / `Manage Address` flow inspired by the reference.
  - Added compact centered header + round back control, search-style address field, `Use my current location` row, address details section, and HomeScreen-scale field/button typography.
  - Existing address list, add/edit, default, delete, GPS lookup, validation, and local save behavior are preserved.
- **Product detail (`ProductScreen.tsx`)**
  - Product detail layout retuned closer to the supplied reference while preserving the existing BAS product image/gallery behavior.
  - Reduced large title/price/section typography to better match HomeScreen rhythm.
  - Tightened content-sheet spacing, thumbnail size, rating/price/description spacing, and bottom add-to-cart bar.
  - Top action buttons remain circular reference-style controls; native image swipe/touch listeners were not changed.

### Verification (self)
- `npx tsc --noEmit`: still reports the known **31 pre-existing errors**; no new errors from `ProfileScreen.tsx` or `ProductScreen.tsx`.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local `npm install` was reverted.

### Handoff / next
- Single complete pass. Real-device review should focus on: (1) Address add/edit full-screen flow, (2) Product detail hero/content-sheet balance, (3) Product image swipe still working.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0011 — Order success page reference-style redesign + success-check transition (single phase, complete) ✅ (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy showed the current order-success page and supplied a minimal payment-success reference plus a Transitions.dev self-contained success-check animation snippet. Requested: redesign the success page to match the reference style and use the success-check transition.

**In scope (files touched):** `src/screens/SuccessScreen.tsx`, `src/components/SuccessCheckTransition.tsx`, `AGENT_LOG.md` plus earlier pending UI files already in this ZIP.
**Out of scope (untouched):** order creation/store logic, tracking route behavior, cart/checkout logic, `BottomTabBar.tsx`.

### কী বদলেছে
- **SuccessScreen.tsx**
  - Replaced the previous decorative blob/confetti-heavy success page with a cleaner reference-style layout: centered success badge, `Payment Successful!`, short confirmation text, compact order-id card, optional item summary, and bottom action buttons.
  - Kept existing behavior: copy order ID still works, primary button still opens order tracking, secondary button returns home (label is `Back Home` because BAS does not have a separate e-receipt route).
  - Typography/spacing uses the scaled BAS rhythm, not oversized reference text.
- **SuccessCheckTransition.tsx**
  - Added a self-contained success-check transition component adapted from Buddy's provided snippet.
  - Auto-injects CSS once via `#transitions-p10`, with document guard and `prefers-reduced-motion` support.
  - Runs fade + rotate + blur + Y-bob + stroke-draw animation when the success page mounts.

### Verification (self)
- `npx tsc --noEmit`: still reports the known **31 pre-existing errors**; no new errors from `SuccessScreen.tsx` or `SuccessCheckTransition.tsx`.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local `npm install` was reverted.

### Handoff / next
- Single complete pass for the order success page. Review after deploy by placing a test order and checking the success animation on real mobile Chrome.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0010 — Profile option subpages/sheets reference-style pass (single phase, complete) ✅ (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy showed the current Profile → Your profile bottom sheet and provided reference screens for profile edit, manage address, payment methods, wallet, coupons, settings, help/contact, FAQ, and location/search-style pages. Requested: redesign the Profile option destinations so the whole Profile area follows the same reference-style UI, while keeping BAS colors and existing logic.

**In scope (files touched):** `src/screens/ProfileScreen.tsx`, `src/components/WalletHistoryModal.tsx`, `src/screens/CouponsScreen.tsx`, `AGENT_LOG.md` plus earlier pending UI files already in this ZIP (`App.tsx`, `HomeTopBar.tsx`, `QuickBar.tsx`, `NotificationBadge.tsx`, `CategoriesScreen.tsx`, `ProductCard.tsx`).
**Out of scope (untouched):** store/Firebase logic, auth logic, order/cart/product detail flows, `BottomTabBar.tsx`.

### কী বদলেছে
- **ProfileScreen.tsx**
  - `Your profile` no longer opens the old checkout-profile bottom sheet first; it now opens a full-page `Your Profile` subview like the reference: centered title/back, avatar with edit chip, Name/Email/Phone/Address/District fields, and bottom `Update` action.
  - `Manage Address` now opens a full-page address list view like the reference: saved address rows with icon bubbles, details, default pill, and a dashed `Add New Shipping Address` action. Existing address add/edit logic is preserved by launching the existing editor when editing/adding.
  - `Payment Methods` now opens a full-page payment method view like the reference: grouped Cash, Mobile Payment, and Add Card rows with radio indicators and a `Confirm Payment` action. Existing `draftProfile.payment` + save behavior is preserved.
  - Existing main Profile, Settings, and Help Center reference-style subviews remain; typography stays downscaled to match HomeScreen rhythm.
- **WalletHistoryModal.tsx**
  - Restyled to a reference-like full-screen wallet page: centered `My Wallet` header, round back, balance card, Add Money CTA, and transaction cards grouped in a simple list.
  - Wallet data and transaction logic unchanged.
- **CouponsScreen.tsx**
  - Restyled to match the supplied coupon ticket reference: centered `Coupon` header, `Best offers for you`, vertical discount strip, dashed divider, expiry/T&C line, and copy button.
  - Coupon filtering/copy logic unchanged.

### Verification (self)
- `npx tsc --noEmit`: still reports the known **31 pre-existing errors**; no new errors from ProfileScreen, WalletHistoryModal, or CouponsScreen.
- `npm run build`: ✓ passed.
- `package-lock.json` churn from local `npm install` was reverted.

### Handoff / next
- Single complete pass for the Profile option destinations Buddy supplied. Review the Profile → Your profile / Manage Address / Payment Methods / My Wallet / My Coupons paths on a real mobile viewport after deploy.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0009 — Notification badge transition integration (single phase, complete) ✅ (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy provided a Transitions.dev-style self-contained notification badge animation snippet and asked to use it for notifications.

**In scope (files touched):** `src/components/NotificationBadge.tsx`, `src/components/HomeTopBar.tsx`, `src/components/QuickBar.tsx`, `AGENT_LOG.md`
**Out of scope (untouched):** notification data/store behavior, `NotificationsSheet.tsx`, cart/wishlist badge behavior, business logic.

### কী বদলেছে
- Added `src/components/NotificationBadge.tsx`, adapted from Buddy's provided snippet:
  - Self-injects the transition CSS once via `#transitions-p1`.
  - SSR/document guard included.
  - Uses the slide + pop/fade/blur open/close transition with `prefers-reduced-motion` support.
  - Controlled by real notification count instead of demo click-toggle state.
  - Supports `primary` and `light` tone so HomeTopBar can keep its white-on-coral badge style.
- `HomeTopBar.tsx`: unread notification badge now uses `NotificationBadge` on the bell button.
- `QuickBar.tsx`: notification action badge in the quick actions popover now uses `NotificationBadge`.

### Verification (self)
- `npx tsc --noEmit`: still reports the known **31 pre-existing errors**; no new errors from `NotificationBadge`, `HomeTopBar`, or `QuickBar`.
- `npm run build`: ✓ passed.
- No notification read/unread logic changed; this is animation/presentation only.

### Handoff / next
- If Buddy wants the same transition on cart/wishlist count badges too, that should be a separate small pass because this request was specifically for notification.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0008 — Profile + Cake typography/spacing downscale to match HomeScreen rhythm (single phase, complete) ✅ (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy reviewed the newly updated Profile and Cake/Categories pages and reported the text/spacing felt too large compared with the existing HomeScreen. Requested: keep the new reference-style UI, but scale typography and spacing down so it matches HomeScreen's app rhythm.

**In scope (files touched):** `src/screens/ProfileScreen.tsx`, `src/screens/CategoriesScreen.tsx`, `src/components/ProductCard.tsx`, `AGENT_LOG.md`
**Out of scope (untouched):** business logic, navigation logic, `BottomTabBar.tsx`, modal internals, Firebase/store code.

### কী বদলেছে
- **ProfileScreen.tsx**
  - Appbar title reduced `22px → 20px`.
  - Profile avatar reduced from oversized `118px` to HomeScreen-compatible `96px`.
  - Profile name reduced `25px → 20px` and tightened vertical gap.
  - Main/settings/help list labels reduced from large reference sizes (`18–20px`) to BAS/Home-style `15–15.5px`.
  - Row gaps/padding and icon sizes reduced (`gap-5 → gap-4`, `py-[18]/py-5 → py-4`, 24px icons → 20px icons) while keeping the reference layout.
- **CategoriesScreen.tsx**
  - Appbar/search/category chip typography reduced to HomeScreen-like sizing (`22px title → 20px`, `18px chips/search → 14px`).
  - Category chips height reduced `48px → 44px`, filter button `48px → 44px`.
  - Search-results title/count reduced and product grid gap returned from very airy reference spacing to BAS/HomeScreen-like `gap-4`.
- **ProductCard.tsx**
  - `catalog` variant text reduced: title `18px → 15px`, weight `14px → 12px`, price `19px → 16px`, rating `12px → 10px`.
  - Heart/add buttons reduced from 40px to 36px, plus icon reduced accordingly.
  - Card structure remains reference-style, but visual density now matches the rest of BAS better.

### Verification (self)
- `npx tsc --noEmit`: still reports the known **31 pre-existing errors**; no new errors from Profile/Categories/ProductCard.
- `npm run build`: ✓ passed.
- No business logic or data flow changed; this was a typography/spacing-only retune.

### Handoff / next
- Single complete adjustment. Buddy should re-check on live mobile after deploy; if still large, next tweak should be a very small per-section downscale only, not another full layout rewrite.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0007 — Cake/Categories tab reference-style catalogue UI pass (single phase, complete) ✅ (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy showed the current live Cake tab (`All Cakes` browse page) and then supplied reference screenshots for a minimal grocery/favorites catalogue grid. Requested: redesign the Cake navigation-tab page UI/UX like the reference, while keeping BAS app colors (do not copy the reference grayscale palette).

**In scope (files touched):** `src/screens/CategoriesScreen.tsx`, `src/components/ProductCard.tsx`, `src/App.tsx`, `AGENT_LOG.md`
**Out of scope (untouched):** product data/filter logic, cart logic, wishlist logic, `BottomTabBar.tsx`, product detail/cart/checkout screens, Firebase/store code.

### কী বদলেছে

**CategoriesScreen.tsx**
- Replaced the previous bulky marketing header (`Curated browse`, `All Cakes`, paragraph, always-visible search bar) with the reference-style compact top appbar: round back button, centered `Cake` title, and round search action.
- Search now becomes a compact pill in the appbar when opened, closer to the reference search-results screenshot.
- Category filters are now simple horizontal rounded pills (active = BAS primary coral, inactive = BAS surface), matching the reference's minimal chip row rather than the previous icon-heavy cards.
- Results summary area now matches the reference pattern:
  - Normal browse: small rounded `{n} results` pill.
  - Search mode: `Results for “...”` title + `{n} Results Found` text.
- Product grid spacing changed to the airier reference rhythm (`gap-x-8 gap-y-8`) with less surrounding chrome.
- Empty state kept functional but simplified to match the new minimal catalogue style.
- Existing filter bottom sheet preserved (same sort/rating/max-price behavior), only its trigger now sits as a round action at the end of the chip row.

**ProductCard.tsx**
- Added a new `variant="catalog"` used only by `CategoriesScreen`, so Home/Wishlist/search result cards keep their existing `grid` look.
- Catalogue variant translates the reference card shape: tighter 18px card radius, 14px image radius, larger product title, visible weight line, larger price, round plus button, and larger heart chip — all using BAS semantic colors.
- Discount badge text changed to `% OFF` in this catalogue card context to match the reference's label style; BAS color token remains primary/coral.

**App.tsx**
- Global `QuickBar` is hidden on the Cake/Categories tab, matching the supplied reference (no top-right floating cart badge over the catalogue header). BottomTabBar is untouched.

### Verification (self)
- `npx tsc --noEmit`: still reports the known **31 pre-existing errors**; no new errors from `CategoriesScreen.tsx` or `ProductCard.tsx`. The visible `App.tsx` unused `PhoneFrame` error is pre-existing.
- `npm run build`: ✓ passed (Vite singlefile bundle built successfully).
- `git diff --stat`: source changes are the intended Profile carryover + this Cake/Categories pass; `package-lock.json` churn from local `npm install` was reverted.

### Handoff / next
- Single complete phase. Review on real mobile width: the page intentionally removes the current large `Curated browse` header to match the reference's compact catalogue flow.
- If Buddy wants the active tab title to say `Favorite`/`All Cakes` instead of `Cake`, that is a one-line copy tweak in `CategoriesScreen.tsx`.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0006 — Profile section reference-style UI pass (single phase, complete) ✅ (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy supplied three profile-area reference screenshots (Profile, Settings, Help Center) and asked to make BAS's profile section match that UI/UX closely while **not copying the reference colors** — keep BAS's existing coral/pink semantic color system.

**Interpretation stated in-work:** Treat the screenshots as layout/spacing/structure reference only: centered profile header, large circular avatar, soft icon-list rows, full-screen settings/help subviews, and no extra floating QuickBar over the profile tab. BAS colors, icons, data, wallet/profile/address/payment handlers, support chat, modals, auth/admin hooks, and business logic remain BAS-native.

**In scope (files touched):** `src/screens/ProfileScreen.tsx`, `src/App.tsx`
**Out of scope (untouched):** `BottomTabBar.tsx`, wallet/history modal internals, address/date/customer editor modal internals, auth/admin/business logic, Firebase/store code, product/order/cart screens.

### কী বদলেছে

**ProfileScreen.tsx**
- Main profile tab rebuilt toward the supplied Profile screenshot:
  - Centered app-bar title (`Profile`) with 44–48px round back control.
  - Large centered circular avatar (~118px) and name underneath.
  - Replaced the previous dashboard-heavy stack (hero card, wallet card, stats grid, quick-access cards, wishlist preview, invite card) with the screenshot-style vertical row list: `Your profile`, `Manage Address`, `Payment Methods`, `My Orders`, `My Coupons`, `My Wallet`, `Settings`.
  - Each row uses large circular BAS-colored icon chips (`bg-secondary text-coral`), 20px-ish label text, right chevron, and subtle dividers — translating the reference grayscale rows into BAS semantic colors.
- Added internal full-screen `Settings` subview matching the second screenshot's structure: centered `Settings` title, round back button, four large rows (`Notification Settings`, `Password Manager`, `Theme`, `Delete Account`) plus BAS support/sign-out affordances below.
- Added internal full-screen `Help Center` subview matching the third screenshot's structure: search pill, FAQ/Contact Us tabs, contact cards/accordions for Customer Service, WhatsApp, Website, Facebook, X, Instagram. The Customer Service accordion opens the existing BAS `ChatBot` support sheet rather than adding a new support system.
- Existing feature handlers were preserved/relocated:
  - `Your profile` / `Payment Methods` still open the checkout profile editor.
  - `Manage Address` still opens the address manager modal.
  - `My Orders`, `My Coupons`, `My Wallet` still route/open their existing destinations.
  - Admin hidden logo-tap shortcut remains available from the profile footer.
  - Customer editor, address modal, special dates modal, wallet history modal, invite sheet, and support chat code were not rewritten.

**App.tsx**
- Global `QuickBar` is now hidden on the Profile tab, matching the reference screenshots (no top-right floating quick action over the profile header). Home was already excluded; splash/product remain excluded as before. BottomTabBar is untouched.

### Verification (self)
- `npx tsc --noEmit`: still reports **31 pre-existing errors**; no `ProfileScreen.tsx` errors and no new errors from this phase. The visible `App.tsx` TS6133 `PhoneFrame` unused error is pre-existing.
- `npm run build`: ✓ passed (Vite singlefile bundle built successfully).
- `git diff --stat`: only `src/screens/ProfileScreen.tsx`, `src/App.tsx`, and this log entry are changed. `package-lock.json` churn from local `npm install` was reverted.
- Claim checks: grepped build output/error output to confirm no `ProfileScreen` TypeScript errors; checked diff stat to confirm only intended source files changed.

### Handoff / next
- Single complete phase. Buddy should review on real mobile width because this intentionally makes Profile much closer to the supplied minimal reference and removes the previous profile dashboard density.
- No pending code phase unless Buddy wants the Settings rows to become real functional pages instead of current safe placeholder notifications for Notification/Password/Theme/Delete.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0005 — HomeScreen: header/categories/offer-card restyle to match GroceryApp reference (single phase, complete) ✅ (2026-07-19, chat agent, direct shell)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy shared a screenshot that turned out to be `design-reference/GroceryApp`'s own home
screen (already in the repo, previously used for BAS0001/BAS0002 spacing/rhythm passes). Requested:
match layout, visual style, font size, and spacing to the reference image for Header, Explore
Categories, and the Exclusive Offers card — but keep BAS's own color tokens (coral/pink), not the
reference's gray/mono palette.

**In scope (files touched):** `src/components/HomeTopBar.tsx`, `src/screens/HomeScreen.tsx`
**Out of scope (untouched):** every other screen/component; `SearchBar.tsx` was NOT touched — it
already matched the reference's `.hd-search`/`.flt-btn` pill-search-bar + circular-filter-button
pattern from an earlier session, so no change was needed there.

**Interpretation stated (per lessons.md rule):** the reference offer card has a hardcoded "Up to 30%"
number; BAS's `Banner` type has no percent field (it's admin-editable: title/subtitle/tag/promoCode/
image, type discount|new_item|notice). Took the reference's card SHAPE (flat solid card, tag pill,
headline, CTA, decorative photo on the right, dots below the card) but kept BAS's real dynamic
title/subtitle text instead of forcing a fake percent — translating structure, not literal content.

### কী বদলেছে

**HomeTopBar.tsx**
- Header restructured into one solid `bg-primary` (coral) panel — matches reference `.hd{background:
  var(--primary)}` — replacing the previous plain-bg header + separately-styled sticky search row.
- Avatar: `rounded-[16px]` square → `rounded-full` circle, 50px, on `bg-white/20` (was `bg-secondary`)
  to sit on the coral panel; initial/photo logic unchanged.
- Location line: added `MapPin` icon inline before the district name (reference `.hd-loc .l2` has the
  pin icon inline), label copy kept as "Delivery to" (business copy, not a visual element, so left as
  BAS's own wording per the earlier "translate proportions, not literal values" convention).
- Bell button: square-ish `shadow-card` surface circle → `bg-white/16` circle matching reference `.bell`,
  unread-count badge only renders when `unreadCount > 0` now (was always rendering an empty pill).
- Search row: removed the `sticky top-0` wrapper + border/shadow (reference keeps search inside the
  static header panel, not stuck on scroll) — `SearchBar` component itself is unchanged, only its
  wrapper. **Cross-check:** `SearchBar` is also used by `CategoriesScreen` — confirmed only the
  HomeTopBar-local sticky wrapper was removed, not anything inside `SearchBar.tsx` itself, so
  CategoriesScreen's search chrome is unaffected.

**HomeScreen.tsx — Explore Categories**
- Vertical icon-over-label cards (`min-w-[98px]`, `rounded-[24px]`, icon top / label below) → horizontal
  pill chips (`h-[37px]`, `rounded-full`, `bg-secondary`, small icon-circle + label inline) matching
  reference `.chip`. Kept BAS's existing per-category `color`/`fg` on the small icon bubble (own colors,
  per Buddy's scope) instead of the reference's flat gray/primary chip fill.

**HomeScreen.tsx — Exclusive Offers card**
- Removed the outer bordered `p-2 shadow-card` wrapper + full-bleed photo-carousel-with-dark-gradient-
  overlay-text treatment. Replaced with a flat `bg-secondary` card (reference `.offer{background:
  var(--fill)}`) — tag pill, headline, subtitle, CTA button on the left; banner photo as a contained
  96px rounded thumbnail on the right (reference's decorative-shape position), not full-bleed.
- Dot pagination moved from inside the card (bottom-right, elongated-pill active state) to below the
  card, centered, plain small circles (reference `.dots`) — the "X / Y" count badge was removed (not
  present in the reference, purely decorative).
- Prev/next arrow buttons kept (still `hidden md:flex`, desktop-only convenience) — reference screenshot
  is single-viewport mobile so doesn't show these; left them since they predate this pass and aren't a
  layout regression.
- All banner `onClick` routing logic (discount copy-code, notice modal, product/customize/categories
  links) is byte-identical, only the JSX wrapper/classes changed.

### Verification (self)
- `npx tsc --noEmit`: baseline captured before edit (31 pre-existing errors) → re-ran after edit →
  sorted-line diff = **identical, zero new, zero removed**.
- `npm run build`: ✓ passed (Vite singlefile bundle, 8.82s).
- `git diff --stat`: only `src/components/HomeTopBar.tsx` + `src/screens/HomeScreen.tsx` changed
  (`package-lock.json` churn from `npm install` reverted via `git checkout`, not in this ZIP).
- Claims re-verified against the actual files (not inferred): grepped for the coral header panel class,
  the circular avatar class, the pill category-chip class, and the plain-circle dots class — all present
  exactly as claimed.
- No touch/gesture/swipe listeners exist in either touched file, so no gesture-regression check applied.

### Handoff / next
- **Single, complete phase — no next phase.**
- Apply the ZIP, run `npx tsc --noEmit` (expect the same 31 pre-existing errors) and `npm run build`,
  then push to `github.com/ferdausfs/BAS`.
- Worth a real-device check after deploy: the coral header panel is a visual departure from the previous
  soft-pastel header, and the offer-card thumbnail is now a small contained photo instead of full-bleed —
  confirm both read well against actual banner images in `Firebase`/admin data, not just placeholder art.
- No judgment calls deferred; no cleanup suggested.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0004 — Fix: Chrome mobile text auto-sizing inflating fonts app-wide (single phase, complete) ✅ (2026-07-19, chat agent, direct shell)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Buddy reported the live deployed app (bas.umuhammadiswa.workers.dev, opened directly in
mobile Chrome, not installed as a PWA) rendering headings/labels visibly larger than the coded
sizes on several screens (Wishlist called out specifically, with "half the screen taken by the
title" — but described as app-wide/inconsistent, not one screen's JSX bug).

**Root cause (confirmed, not guessed):** every affected screen's JSX already used correct,
small, explicit px font sizes (`text-[24px]`, `text-[14px]`, etc. — verified in
`WishlistScreen.tsx` and others). `src/index.css` had no `text-size-adjust` rule on `html`.
Mobile Chrome's built-in text-autosizer ("font boosting") inflates font sizes at render time —
independent of the coded CSS values — when a page is opened as a normal browser tab (not an
installed/standalone PWA) and it judges the text column too narrow relative to viewport. This
explains why it wasn't caught by `tsc`/`npm run build` (a browser rendering behavior, not a
compile-time issue) and why the inflation looked inconsistent across blocks (the autosizer
applies its own per-block heuristic, not a uniform scale).

**In scope (only file touched):** `src/index.css` — one rule added to the existing `html`
selector.
**Out of scope:** no JSX/component file needed changes; the coded font sizes were already
correct.

### কী বদলেছে
- `src/index.css`: `html { scroll-behavior: smooth; }` → added
  `-webkit-text-size-adjust: 100%; text-size-adjust: 100%;` to the same rule, disabling Chrome's
  mobile text-autosizer app-wide so rendered text always matches the coded px values, on every
  screen, not just Wishlist.

### Verification (self)
- `npx tsc --noEmit`: re-verified on a **fresh clone** confirmed current with the just-landed
  BAS0003 commit (`45e874c`) — 31 errors, identical (sorted-line diff) to the documented
  pre-existing baseline.
- `npm run build`: ✓ passed (Vite singlefile bundle, 10.76s).
- Claim re-verified against the actual file: grepped `src/index.css` and confirmed both
  `-webkit-text-size-adjust: 100%;` and `text-size-adjust: 100%;` lines are present exactly as
  claimed.
- `git diff --stat` on the fresh clone: only `src/index.css` changed (`package-lock.json` churn
  from `npm install` reverted, not included).

### Handoff / next
- **Single, complete phase — no next phase.**
- This is a global CSS fix; Buddy should reload/re-check the live app on the same real device
  after deploying to confirm the visual size now matches the mockup screenshots. If any specific
  screen still looks oversized after this fix, that would point to a real per-screen sizing bug
  (worth a fresh screenshot to isolate) rather than the autosizing issue this phase addresses.
- No judgment calls deferred; no cleanup suggested.

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0003 — ProfileScreen Layout Restructure (single phase, complete) ✅ (2026-07-19, chat agent, direct shell)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Restyle `ProfileScreen.tsx`'s layout structure to match a supplied generic wireframe
kit (centered circular avatar + name, grouped/titled menu sections), while keeping every
existing BAS feature and handler (wallet card, referral/invite, stats, address book, special
dates, coupons, settings menu, admin shortcut) fully intact — Buddy explicitly chose "layout
structure only, keep all features" over "visual style only" when asked.

**In scope (only file touched):** `src/screens/ProfileScreen.tsx`
**Out of scope (untouched, confirmed zero diff):** every other screen/component; no business
logic, no `onClick` handlers, no modal state, no Firestore/localStorage calls changed.

### কী বদলেছে
- **Profile header card** — avatar changed from a 64px `rounded-2xl` square (left-aligned row
  with name/email beside it) to a 96px (`h-24 w-24`) `rounded-full` circle, with name/email/
  "Member" badge now centered underneath (`flex flex-col items-center text-center`) instead of
  beside it. Decorative background circles, avatar image/initials fallback logic, and the
  Member badge markup are unchanged — only the layout direction (row → column, left → center).
- **Address book / Special Dates / My Coupons** — were 3 separate floating cards; merged into
  one bordered `rounded-2xl` list container (matching the existing `menu` list's visual
  convention) under a new "Quick Access" section title, each row keeping its exact original
  `onClick` handler, icon, and sub-label logic.
- **Main menu list** — added an "Account" section title above the existing 6-item menu
  (Wishlist / Delivery address / Payment methods / Notifications / Contact & Support /
  Settings); the list itself, its `menu` array, and all handlers are untouched.
- Wallet card, stats grid, wishlist horizontal scroll, invite banner, sign-out button, admin
  dashboard, and all modals/sheets (customer editor, address modal, dates modal, invite sheet)
  are **unchanged** — these are feature cards, not generic nav rows, so they were deliberately
  left outside the wireframe's grouped-list treatment per Buddy's "keep all features" scope.

### Verification (self)
- `npx tsc --noEmit`: baseline captured before edit (31 pre-existing errors, matches BAS0002
  L5's documented count) → re-ran after edit → sorted-line diff = **identical, zero new, zero
  removed**.
- `npm run build`: ✓ passed (Vite singlefile bundle, 12.29s).
- `git diff --stat`: only `src/screens/ProfileScreen.tsx` changed (`package-lock.json` churn
  from a fresh `npm install` was `git checkout`'d back per the lessons.md rule — not in this
  ZIP).
- Claims re-verified against the actual file (not inferred): grepped for the `rounded-full`
  avatar, the centered flex wrapper, both new section-title strings ("Quick Access", "Account"),
  and all three quick-access `onClick` handlers — all present exactly as claimed.
- No touch/gesture listeners exist in this file, so no gesture-regression check was applicable.

### Handoff / next
- **This is a single, complete phase — no next phase.** Delivered as one ZIP
  (`ProfileScreen.tsx` + this `AGENT_LOG.md` entry).
- Apply the ZIP, run `npx tsc --noEmit` (expect the same 31 pre-existing errors) and
  `npm run build`, then push to `github.com/ferdausfs/BAS`.
- No judgment calls deferred; no cleanup suggested.

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0002 — Layout & Spacing Pass — Phase L5 (Final consistency pass — ALL screens) ✅ (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase worked on:** **Phase L5 — Final consistency pass.** The previous BAS0002 entry is Phase L4, so this
run correctly starts at L5. **This is the LAST phase — BAS0002 is now complete.** No "next phase"; handoff
below tells Buddy what to decide/apply.

This was an audit-first pass (like BAS0001 Phase 6): a side-by-side check of every screen against the
GroceryApp reference rhythm + the conventions established in L0–L4, fixing only genuine, low-risk
stragglers and *proposing* (not auto-applying) the one high-magnitude judgment call.

### কী বদলেছে — straggler cleanup (spacing/structure only, no color pass)
All four auto-fixes translate the reference's measured proportions / the L0–L4 conventions; no color, no
token, no business-logic, no gesture, no `BottomTabBar`, no auth-flow change.

**Reference material re-read:** `style.css` `.back`/`.back svg` (2.75rem circle / 1.25rem icon = 44px / 20px),
`.sheet`/`.btn-row.bar`/`.phero` radii, `.page` (1.5rem edge), `.pcard{1rem}`/`.pimg{.75rem}`; `screens.js`
back-button + bottom-sheet structures.

- **CouponsScreen.tsx** — back-button icon `h-[18px] w-[18px]` (18px) → `h-5 w-5` (20px). L2 had normalized
  this button's *size* (`h-9→h-11`) and removed its border, but missed the icon; every other back button in
  the app and the reference `.back svg` (1.25rem) use a 20px icon. Now consistent.
- **CustomizeScreen.tsx** — same fix: back-button icon `h-[18px] w-[18px]` → `h-5 w-5` (20px).
- **CategoriesScreen.tsx** (filter bottom sheet) — `rounded-t-[32px]` → `rounded-t-[22px]` and edge
  `px-5` → `px-6`. Every in-scope sheet in BAS is `rounded-t-[22px]` + 24px edge (NotificationsSheet, the 5
  ProfileScreen sheets, ProductScreen content sheet, both CartScreen sheets, CheckoutScreen bar = 10 instances);
  this filter sheet (an L1-batch screen whose sheet L1 didn't address) was the lone `32px / px-5` outlier.
- **OccasionSheet.tsx** (shared "Browse by occasion" bottom sheet) — `rounded-t-[28px]` → `rounded-t-[22px]`,
  header `px-5`→`px-6`, occasion grid `p-5`→`p-6`. Same sheet convention; this shared sheet wasn't in any
  per-phase batch and was overlooked. (It is NOT the auth flow — that stays untouched.)

### Audit findings — confirmed CLEAN (the explicit L5 checks)
- **Reference-gray hex across ALL of `src/`** (whole-tree, all extensions): **ZERO** literals
  (`#909090 #7f7f7f #9b9b9b #969696 #8f8f8f #9c9c9c #acacac #c0c0c0 #f7f7f7 #f8f8f8 #f4f4f4 #f5f4f4
  #d9d9d9 #e7e7e7 #ededed`).
- **`BottomTabBar.tsx` zero diff across ALL of BAS0002:** `git log` shows its most recent commit is
  `87a130f BAS0001 Phase 1` — **no BAS0002 commit ever touched it**. Current file also gray-hex-clean.
- **No swipe/gesture regressions:** ProductScreen native touch listeners (lines ~97–104:
  touchstart passive:true / touchmove passive:false / touchend) and CartScreen pointer-listener swipe
  (~320–363: pointerdown/move/up/cancel + setPointerCapture) are both intact. `git diff 6c0e9df(BAS0001 P6)
  → 980017a(BAS0002 L2)` for those two files shows **ZERO** touch/pointer/swipe lines changed (the 40/30
  changed lines were spacing-only).
- **App-bar back buttons (all 9 pushed screens):** CartScreen, CheckoutScreen, CouponsScreen, CustomizeScreen,
  ProductScreen, ReviewsListScreen, TrackingScreen, WishlistScreen, WriteReviewScreen — every one is
  `h-11 w-11 rounded-full bg-surface shadow-card`, **no border**, 20px icon (after the two fixes above).
- **Page-edge wrappers:** all `px-6` (24px). Every surviving `px-4/px-5/px-7` was triaged and is
  button-internal, form-input-internal, card-internal, or hero-floating (ProductScreen `px-5 pt-5` on the
  image) — all correct and deliberately left per the page-edge-swap lesson.
- **Sheet/bar top-radii landscape mapped:** 10× `rounded-t-[22px]` (in-scope convention). Remaining
  non-`22px` are all deliberately out of scope: AuthSheet `28px` (auth flow), AdminPanel `rounded-t-3xl`
  (internal tool). After this phase the only non-auth/non-admin sheets (CategoriesScreen filter,
  OccasionSheet) are now `22px` too.
- **Fixed-overlay z-index:** no z-index line changed this phase; OccasionSheet stays `z-[120]`, the
  CategoriesScreen filter sheet stays `z-[140]` (backdrop `z-[135]`) — still below global QuickBar/BottomTabBar.

### ⚠️ Proposal for Buddy — NOT auto-applied (high magnitude, BAS0001-set value)
**Shared `ProductCard.tsx` radius `rounded-[22px]` (22px) → `rounded-2xl` (16px), and its inner image
`rounded-[16px]` → `rounded-xl` (12px).** Reasoning: the reference `.pcard{border-radius:1rem}` is 16px and
`.pimg{.75rem}` is 12px; the BAS0002 convention (lessons.md) is `rounded-2xl` for bordered content cards; and
**every sibling content card** (ProductScreen addons/reviews, CartScreen items/bills, OrdersScreen order
cards, CheckoutScreen, Coupons, Customize, Tracking, Success, ReviewsList, WriteReview) is already
`rounded-2xl`/16px from L2/L3. `ProductCard` is the lone holdout at 22px — it survived the L2/L3
`rounded-[20px]→rounded-2xl` sweep *because its value was 22px, not 20px*. **Why deferred:** it was set
deliberately in `87a130f BAS0001 Phase 1` (and kept through Phase 6), it is the app's single most prominent
component (every product tile on Home / Categories / Wishlist), and changing it is an app-wide visual change
that overrides a BAS0001 choice. Buddy: if you want full reference/convention consistency, it's a 2-line
change in `ProductCard.tsx` (lines 58–59 outer radius, line 63 image radius); if you prefer the softer 22px
premium look from BAS0001, leave it — both are defensible. **Not touched this run.**

### Suggestion for Buddy — optional cleanup (do NOT auto-delete)
Now that BAS0002 is done, `design-reference/GroceryApp/` has served its purpose. It sits outside
`src/`/`public/` so it never enters the Vite bundle (confirmed), but if you want a leaner repo you can
`git rm -r design-reference/GroceryApp/`. **Suggestion only — left in place this run; Buddy decides.**

### Verification (self)
- `npx tsc --noEmit`: **✓ 31 errors, identical to the pre-phase baseline** — captured baseline before edits,
  re-ran after; `diff` of sorted `error TS*` lines = **identical (zero new, zero removed)**. The 31 are the
  same pre-existing out-of-scope logic errors (TS6133/TS18046/TS2339/TS2345/TS2698/TS2322/TS2571/TS2353).
- `npm run build`: **✓ Passed** (Vite singlefile bundle, ~5.35s).
- Reference-gray grep on the 4 changed files → **ZERO**; whole-`src/` grep → **ZERO**.
- `git diff` cross-check: changed source = `OccasionSheet.tsx`, `CategoriesScreen.tsx`, `CouponsScreen.tsx`,
  `CustomizeScreen.tsx` ONLY. **Zero diff** on `BottomTabBar.tsx`, `ProductScreen.tsx`, `CartScreen.tsx`,
  `AuthSheet.tsx`, `NotificationsSheet.tsx`, `QuickBar.tsx`, `ChatBot.tsx`. No z-index changed.
- Claims re-verified against the actual files (lesson): all four edits confirmed present via `grep`; no
  `rounded-t-[28px]`/`rounded-t-[32px]`/`px-5 py-4`/`p-5 pb-8`/`h-[18px] w-[18px]` (back icons) remain.
- `tasks/lessons.md`: added the L5 rule (triage straggler greps by category; auto-fix vs propose by magnitude;
  sheet convention recap).

### Handoff / next — BAS0002 COMPLETE
- **There is no next phase.** Phases L0→L5 are all done. Buddy: apply this ZIP (4 source files + AGENT_LOG.md
  + tasks/lessons.md + tasks/todo.md), have Claude run `npx tsc --noEmit` (expect the same 31 pre-existing
  errors) and `npm run build`, then push to `github.com/ferdausfs/BAS`.
- **Two Buddy decisions pending** (both logged above, neither auto-done): (1) the `ProductCard` 22px→16px
  radius proposal; (2) optional `git rm -r design-reference/GroceryApp/`.
- `package-lock.json` was churned by the fresh-clone `npm install` and is intentionally **NOT** in this ZIP
  (per the lessons.md rule) — only intended files are packaged.

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0002 — Layout & Spacing Pass — Phase L4 (Account/admin/splash/chrome batch D) (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase worked on:** **Phase L4 — Account/admin/splash/chrome:** `ProfileScreen.tsx`, `AdminScreen.tsx` +
`AdminPanel.tsx`, `SplashScreen.tsx`, `NotificationsSheet.tsx`, search chrome in `HomeTopBar.tsx` /
`SearchBar.tsx`. The previous BAS0002 entry is Phase L3, so this run correctly starts at L4.
**NEXT RUN = Phase L5 (Final consistency pass).**

### কী বদলেছে — measured against GroceryApp reference (spacing/structure only, no color pass)
All changes translate the reference's measured proportions into BAS's existing Tailwind/rem scale. Colors
remain BAS semantic soft-pink tokens; no reference gray hexes were added.

**Reference material re-read:** `style.css` `.page`, `.appbar`, `.back`, `.round-act`, `.badge-pill`,
`.sec-row`, `.sec-title`, `.see-all`, `.mrow`, `.ic-chip`, `.nrow`, `.nhead`, `.sbar`, `.rchips`,
`.btn-row.bar`, splash rules; `screens.js` `splash`, `profile`, `your-profile`, `notifications`,
`search`, `search-results` render structures.

- **ProfileScreen.tsx** (`profile` / `your-profile` + general `.mrow` rules):
  - Page-edge wrappers moved from `px-5` / one wallet `px-4` to the BAS0002-wide `px-6` (24px) edge.
  - Account/profile hero and wallet card radius normalized to `rounded-[22px]` (sheet/hero proportion),
    while content/list cards and stat cards moved from `rounded-[20px]` to `rounded-2xl` (16px card rule).
  - Profile quick rows/menu rows now use reference-like list rhythm: larger circular icon chips (`h-12 w-12`),
    `gap-4`, and menu row `py-4` spacing, matching `.mrow{gap:1rem;padding:1.05rem .5rem}` /
    `.ic-chip{3rem}` rather than the older tighter 36px icon chips.
  - Wishlist mini section header retuned toward `.sec-row`/`.sec-title`/`.see-all` sizing (20px title,
    11px action) without changing product data/flow.
  - Profile-owned sheets/modals (`Checkout Profile`, contact/help, address manager, special dates,
    invite sheet) changed `rounded-t-[28px]` → `rounded-t-[22px]` per the BAS0002 sticky/sheet convention;
    sheet horizontal padding moved to 24px where relevant.

- **AdminPanel.tsx / AdminScreen.tsx** (no direct reference counterpart, general conventions only):
  - `AdminScreen.tsx` was checked and left unchanged because it only routes into `AdminPanel`.
  - Internal admin panel got a light spacing pass only: 24px content edge (`p-6`), 24px tab padding,
    44px top-bar round actions, `rounded-[24px]` containers → `rounded-[22px]`, and all admin
    `rounded-[20px]` content cards → `rounded-2xl`.
  - Dashboard/product/order list row gaps tightened to reference list-row rhythm (`gap-4`, roomier row
    padding). Business/admin logic, Firestore calls, status updates, CSV export, uploads: **untouched**.

- **SplashScreen.tsx** (`splash` + success/hero padding interpretation from lessons):
  - Kept BAS's existing onboarding-style splash (not a full reference color/logo rewrite), but tuned the
    layout proportions: 24px edge retained, vertical padding tightened (`pt-11 pb-6`), hero-card radius
    `32px → 22px`, tag/title spacing tightened, title `24px → 22px`, and CTA `h-14 rounded-2xl` →
    `h-12 rounded-full` to align with reference `.btn` height/radius.

- **NotificationsSheet.tsx** (`notifications`, structure only — still a BAS sheet):
  - Sheet radius `28px → 22px`, no conversion to a full screen.
  - Header translated to a compact title + BAS semantic `NEW` badge-pill style; close action normalized to
    44px round action with `bg-surface shadow-card` and no border.
  - Notification cards converted into reference-like divided list rows: section header (`TODAY` + mark read),
    48px circular icon chip, `gap-4`, `py-[18px]`, title/time baseline row, body below, unread dot.

- **HomeTopBar.tsx / SearchBar.tsx** (`search` / `search-results`, dropdown structure not full route):
  - Home search chrome side padding moved to 24px (`px-6`) and the notification bell is now the L0 44px
    round-action convention (surface + shadow, no border).
  - Search input and occasion/filter action retuned to 44px (`h-11`), rounded-full, 20px search icon;
    occasion action also follows the round-action convention (surface + shadow, no border).
  - Added the existing `suggestions` / `recentSearches` props into a visual dropdown: recent/search-results
    header row, optional `Clear All`, divided rows with 40px icon chip and `gap-4`/`py-3` rhythm. This is
    structural search UI only; data source and search handlers are unchanged.
  - Cross-consumer check: `grep -R "<SearchBar" src` shows `SearchBar` is used by `HomeTopBar` and
    `CategoriesScreen`. This shared chrome effect is logged deliberately and a lessons.md rule was added.

### Verification (self)
- `npx tsc --noEmit`: **✓ 31 errors, identical to the pre-phase baseline** — verified by running post-change,
  stashing the phase diff, running baseline, popping the stash, and diffing sorted `error TS*` lines. There
  are **zero new and zero removed** TypeScript errors; the 31 are pre-existing out-of-scope errors.
- `npm run build`: **✓ Passed** (Vite production build completed, singlefile bundle generated).
- Reference-gray grep across touched source files (`ProfileScreen.tsx`, `AdminPanel.tsx`, `SplashScreen.tsx`,
  `NotificationsSheet.tsx`, `HomeTopBar.tsx`, `SearchBar.tsx`) → **ZERO** literal reference-gray hex leaks.
- `git diff` cross-check: **no `BottomTabBar.tsx` diff**, **no `ProductScreen.tsx` / `CartScreen.tsx` diff**
  (so native touch/swipe listener blocks remain untouched), no auth-sheet/login/onboarding flow conversion,
  and no business logic/state/Firestore behavior changes intended.
- Fixed-overlay z-index sanity: `NotificationsSheet` remains `z-[120]`; profile local sheets remain at
  `z-[60]/[61]` or `z-[80]`; AdminPanel remains `z-[70]`; no app-bar z-index was raised over global overlays.
- `tasks/lessons.md`: added shared SearchBar/chrome consumer-footprint rule.

### Handoff / next
- **NEXT RUN = Phase L5 — Final consistency pass:** full side-by-side spacing audit of every screen,
  confirm zero reference-gray literals anywhere, confirm `BottomTabBar.tsx` stayed unchanged through BAS0002,
  confirm no swipe/gesture regressions, `tsc` baseline/build clean, and optionally suggest (do not auto-delete)
  removing `design-reference/GroceryApp/` after Buddy approves.

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0002 — Layout & Spacing Pass — Phase L3 (Post-purchase batch C) (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase worked on:** **Phase L3 — Post-purchase (batch C):** `OrdersScreen.tsx`, `TrackingScreen.tsx`,
`SuccessScreen.tsx`, `ReviewsListScreen.tsx`, `WriteReviewScreen.tsx`. The previous BAS0002 entry is Phase L2,
so this run correctly starts at L3. **NEXT RUN = Phase L4 (Account/admin/splash/chrome).**

### কী বদলেছে — measured against the GroceryApp reference (no colors touched)
All changes are spacing / structure only — the reference's *proportions* were translated into BAS's
fixed-rem Tailwind scale; every color stays the finished soft-pink token set (no hex, no token swap).

**Conventions adopted (matching L0 foundation + L1/L2 patterns):**

- **`.page` → 24px page edge (`px-6`)**: applied on every page-edge wrapper / content scroller across all
  five screens. `SuccessScreen` outer `px-7`(28px) → `px-6`(24px) so it matches the BAS-wide 24px edge
  (the reference `success()` / `.succ-wrap` uses 35px, but every other BAS screen is 24px — chose
  consistency with the rest of BAS; noted here as an explicit interpretation). Button-internal `px-5`/`px-7`
  (e.g. `btn-primary px-7` on the Orders empty-state CTA, `btn-primary px-5` on the Tracking "My orders"
  CTA) deliberately LEFT untouched per the page-edge-swap lesson.

- **`.back` / `.round-act` → 44px circle, surface bg, shadow, NO border**:
  - `OrdersScreen` header search button `h-10 w-10` → `h-11 w-11`(44px) + icon `h-[18px] w-[18px]` → `h-5 w-5`(20px).
  - `TrackingScreen` back button `h-10 w-10` → `h-11 w-11` + icon `h-[20px] w-[20px]` → `h-5 w-5`.
  - `ReviewsListScreen` back button `h-10 w-10` → `h-11 w-11` (icon already `h-5 w-5`).
  - `WriteReviewScreen` back button `h-10 w-10` → `h-11 w-11` (icon already `h-5 w-5`).
  - All already had `bg-surface shadow-card` and NO border — only the size + icon were normalized to the
    L0 convention. The `Package` empty-state *icon* (`h-10 w-10`) is not a button and was left as-is.

- **Card radius**: `rounded-[20px]` → `rounded-2xl`(16px) across all five screens — matches reference card
  radius `1rem` (`.ocard`, `.rcard`, `.bcard`, `.paycard`, `.ticket` body). Affects: order cards
  (OrdersScreen / TrackingScreen), SuccessScreen order-ID + item-summary cards, ReviewsListScreen rating
  summary + review cards, WriteReviewScreen order-summary card.

- **Order item-row gap** (matching reference `.oitem`/`.citem` `gap:1rem` ≈ 16px):
  - `OrdersScreen` item rows `gap-3`(12px) → `gap-4`(16px).
  - `TrackingScreen` item rows `gap-3`(12px) → `gap-4`(16px).
  - `WriteReviewScreen` order-summary card `flex items-center gap-3` → `gap-4` (matches reference
    `review-product` `.bcard` `gap:1rem`).

- **Review avatar** (matching reference `.rcard .rav` `2.9rem` ≈ 46px): `ReviewsListScreen` review-card
  avatar `h-9 w-9`(36px) → `h-11 w-11`(44px).

- **TrackingScreen cancelled box inset**: `mx-5`(20px) → `mx-4`(16px) so it aligns with the card's
  `px-4` content padding (was sitting 4px further in than the Live-status section above it).

- **WriteReviewScreen footer** (`p-5` → `px-6 py-4`): matches reference `.btn-row{padding:1rem 1.5rem}`
  (16px vertical / 24px horizontal) for the sticky action bar.

### Verification (self)
- `npx tsc --noEmit`: **✓ 31 errors, identical to the pre-phase baseline** — verified via `git stash`
  (pre) vs working tree (post); `diff` (sorted) shows **zero new and zero removed** errors. The 31 are
  pre-existing logic errors (OrdersScreen/TrackingScreen `safeArray` `unknown` + spread-type, App.tsx,
  hooks/*, lib/*, DebugMetrics, CheckoutScreen) — explicitly OUT of scope, none touched.
- `npm run build`: **✓ Passed** (Vite production bundle built in ~6.0s).
- Reference-gray grep across the 5 changed files → **ZERO** literals.
- `git diff` cross-check: **no color hex, no `@theme` / token color change, `BottomTabBar.tsx`
  ZERO diff, no business logic changed, no swipe/gesture code (none of these 5 screens has gestures).**
- `git diff --stat` (source): `OrdersScreen.tsx` (6±), `TrackingScreen.tsx` (7±), `SuccessScreen.tsx` (3±),
  `ReviewsListScreen.tsx` (6±), `WriteReviewScreen.tsx` (5±).
- Claims re-verified against the actual file (lesson): `px-5`/`px-7` page-edge values gone where intended;
  button-internal `px-5`/`px-7` preserved; `h-11 w-11` + `rounded-2xl` confirmed present; the only
  surviving `h-10 w-10` is the `Package` empty-state *icon*, not a button.

### Handoff / next
- **NEXT RUN = Phase L4 — Account/admin/splash/chrome:** `ProfileScreen.tsx`, `AdminScreen.tsx` +
  `AdminPanel.tsx`, `SplashScreen.tsx`, `NotificationsSheet.tsx` (structure only), search dropdown
  structure in `HomeTopBar.tsx`/`SearchBar.tsx`. Re-measure spacing / structure against reference
  `profile` / `your-profile` / `notifications` / `search` / `search-results` / general chrome + `splash`.

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0002 — Layout & Spacing Pass — Phase L2 (Purchase flow batch B) (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Phase worked on:** **Phase L2 — Purchase flow (batch B):** `ProductScreen.tsx`, `CartScreen.tsx`,
`CheckoutScreen.tsx`, `CouponsScreen.tsx`, `CustomizeScreen.tsx`. The previous BAS0002 entry is Phase L1,
so this run correctly starts at L2. **NEXT RUN = Phase L3 (Post-purchase batch C).**

### কী বদলেছে — measured against the GroceryApp reference (no colors touched)
All changes are spacing / structure only — the reference's *proportions* were translated into BAS's
fixed-rem Tailwind scale; every color stays the finished soft-pink token set (no hex, no token swap).

**Conventions adopted (matching L0 foundation + L1 patterns):**

- **`.page` → 24px page edge** (`px-6`): applied on every page-edge wrapper / content div across
  all five screens. Hero-floating controls (`px-5`) intentionally NOT changed — they sit on the
  image, not in the page content flow (reference `.p-top` uses `left:1.4rem; right:1.4rem` ≈ 22px
  on the hero, not in the `.page` wrapper).

- **`.back` / `.round-act` → 44px circle, surface bg, shadow, NO border**:
  - `ProductScreen` floating back / share / heart buttons: `border border-border` removed,
    `bg-white` → `bg-surface` — matches reference `.back` / `.round-act` (2.75rem circle,
    white bg, shadow only, no border).
  - `CartScreen` header back button: same treatment + `h-10 w-10` → `h-11 w-11` (44px).
  - `CheckoutScreen` header back button: `h-10 w-10` → `h-11 w-11` + `bg-white` → `bg-surface`.
  - `CouponsScreen` back button: `h-9 w-9` → `h-11 w-11` + border removed.
  - `CustomizeScreen` back button: `h-10 w-10` → `h-11 w-11` + border removed.
  - Stepper container in ProductScreen bottom bar: `border border-border` removed.

- **Section rhythm**: `ProductScreen` section headers (Flavor, Weight, Add-ons) `mt-7`(28px) →
  `mt-5`(20px) — closer to reference `.flabel` 1.35rem(≈22px). Reviews section same treatment.

- **Card radius**: `rounded-[20px]` → `rounded-2xl`(16px) across all five screens — matches
  reference card radius `1rem`(`.pcard`, `.citem`, `.icard`, `.rcard`, `.ocard`, `.paycard`,
  `.ticket` body). This affects: cart item cards, bill cards, addon suggestion cards, checkout
  section cards, coupon ticket cards, customize cards, product addon cards, review cards.

- **Content sheet radius**: `ProductScreen` content sheet `rounded-t-[28px]` → `rounded-t-[22px]`
  — matches reference `.phero` bottom radius `1.4rem`(≈22px).

- **Sticky CTA bar**: all three purchase-flow screens get `rounded-t-[22px]` on the sticky bottom
  bar + `border-t border-border` removed + `pt-3.5` → `pt-4` — matches reference `.btn-row.bar`
  radius `1.4rem` top / slightly roomier padding. The remove-confirmation sheet on CartScreen also
  gets `rounded-t-[28px]` → `rounded-t-[22px]`.

- **Cart item card spacing** (matching reference `.citem`):
  - `gap-3`(12px) → `gap-4`(16px) — closer to reference `gap:1rem`.
  - `p-3`(12px) → `p-3.5`(14px) — closer to reference `padding:.85rem`(≈14px).
  - Image `h-24 w-24`(96px) → `h-[84px] w-[84px]` — closer to reference `.citem .oimg`
    `5.2rem×4.9rem`(≈83×78px); inner radius `rounded-[14px]` → `rounded-lg`(8px).

- **Gallery thumbnails** (matching reference `.ptb`):
  - `w-14 h-14`(56px) → `w-[60px] h-[60px]` — closer to reference `3.7rem`(≈59px).
  - `rounded-2xl`(16px) → `rounded-xl`(12px) — closer to reference `.7rem`(≈11px).

- **Weight/chip gaps** (matching reference `.wchips` gap `.7rem` ≈ 12px):
  - `gap-2`(8px) → `gap-3`(12px) on weight preset rows.

- **Checkout payment rows** (matching reference `.payr` gap `1.05rem` ≈ 17px):
  - `gap-3`(12px) → `gap-4`(16px) on payment method rows.

- **Coupon ticket** (matching reference `.ticket`):
  - Discount strip `w-[76px]` → `w-[62px]` — closer to reference `3.9rem`(≈62px).
  - Body padding `p-3.5` → `px-4 py-4` — closer to reference `.bd` padding.
  - Notch circles repositioned to `left-[62px]` matching new strip width.

- **Checkout date input** radius: `rounded-2xl` → `rounded-xl` — matching reference `.inp`
  radius `.65rem`(≈10px).

### Verification (self)
- `npx tsc --noEmit`: **✓ 31 errors, identical to the pre-phase baseline** — `diff` (sorted)
  shows **zero new and zero removed** errors.
- `npm run build`: **✓ Passed** (Vite production bundle built in ~5.6s).
- Reference-gray grep across the 5 changed files → **ZERO** literals.
- `git diff` cross-check: **no color hex, no `@theme` / token color change, `BottomTabBar.tsx`
  ZERO diff, ProductScreen gesture code (native touch listeners 93–115) ZERO diff,
  CartScreen gesture code (pointer listeners 354–357) ZERO diff, no business logic changed.**
- `git diff --stat` (source): `ProductScreen.tsx` (40±), `CartScreen.tsx` (30±),
  `CheckoutScreen.tsx` (16±), `CouponsScreen.tsx` (18±), `CustomizeScreen.tsx` (16±).
- Z-index stacking verified: screen-level overlays (z-20/30/200) remain below global
  QuickBar (z-45) and BottomTabBar (z-100).

### Handoff / next
- **NEXT RUN = Phase L3 — Post-purchase (batch C):** `OrdersScreen.tsx`, `TrackingScreen.tsx`,
  `SuccessScreen.tsx`, `ReviewsListScreen.tsx`, `WriteReviewScreen.tsx`. Re-measure spacing /
  structure against reference `orders` / `cancel-order` / `track-order` / `track-map` /
  `payment-success` / `reviews` / `review-product`.
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0002 — Layout & Spacing Pass — Phase L1 (Browse batch A) (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Phase worked on:** **Phase L1 — Browse (batch A):** `HomeScreen.tsx`, `CategoriesScreen.tsx`,
`WishlistScreen.tsx` (the routed one at `src/screens/`). The previous BAS0002 entry is Phase L0, so this
run correctly starts at L1. **NEXT RUN = Phase L2 (Purchase flow batch B).**

### কী বদলেছে — measured against the GroceryApp reference (no colors touched)
All changes are spacing / structure only — the reference's *proportions* were translated into BAS's
fixed-rem Tailwind scale; every color stays the finished soft-pink token set (no hex, no token swap).

- **`.page` → 24px page edge** (`padding:0 1.5rem`): applied `px-5`(20px) → `px-6`(24px) on every
  page-edge wrapper / content div across the three screens, AND on `SectionHeader`'s internal padding
  (it is HomeScreen-only — 3 uses — so retuning it is safely inside this phase). The L0
  `.layout-page` (1.5rem) primitive is now actually adopted on these screens.
- **`.back` / `.round-act` → 44px circle, white surface, shadow, NO border**:
  - `WishlistScreen` back button `rounded-[16px] border border-border` → `rounded-full` (border
    dropped) — matches reference `.back` (2.75rem circle, `background:#fff`, shadow).
  - `CategoriesScreen` filter button `rounded-[18px] border border-border` → `rounded-full`
    (border dropped) — matches reference `.round-act`.
  - `WishlistScreen` "Saved cakes" inline round action `rounded-[18px]` → `rounded-full`.
  - Icons kept at 20px (`h-5 w-5`) = reference `.back svg` 1.25rem.
- **`.sec-row` / `.sec-title` / `.see-all` rhythm**: `SectionHeader` trailing "See all" action tuned
  toward reference `.see-all` (≈11px / weight 500) — `text-[13px] font-semibold` → `text-[12px]
  font-medium`, chevron `h-4` → `h-3.5`. Color intentionally kept `text-primary` (a semantic token,
  NOT a literal hex — no color change). Title stays 20px / 600 (= `.sec-title`).
- **Section vertical rhythm**: `HomeScreen` browse-section top gaps `mt-8`(32px) → `mt-6`(24px) to
  match reference `.sec-row` `margin:1.5rem .2rem 1rem` (1.5rem top). Content gap below each header
  stays `mt-4`(16px) = reference 1rem bottom. First banner (`mt-6`) and footer (`mt-9`) unchanged.
- **`.chip-row` gap .8rem (≈12.8px)**: `WishlistScreen` category chip-row `gap-2.5` → `gap-3`.
- **QuickBar-safe headers preserved**: `pt-20 pr-18` clearance on `CategoriesScreen` & `WishlistScreen`
  headers left intact (lesson: floating QuickBar sits at `top-4 right-4 z-[45]`, must not be crowded).
- **Dead duplicate deleted**: `src/components/WishlistScreen.tsx` (unrouted — confirmed `grep` finds
  zero imports; BAS0001 Phase 2 / 6 already flagged it dead). Logged here per the brief's cleanup
  note. Buddy / Claude: also `git rm` it when applying / pushing this phase.

### Verification (self)
- `npx tsc --noEmit`: **✓ 31 errors, identical to the pre-phase baseline** (`/tmp/baseline_tsc.txt`)
  — `diff` (sorted) shows **zero new and zero removed** errors. All 31 are pre-existing logic errors
  (App.tsx / DebugMetrics / hooks / etc.) — explicitly OUT of scope, none touched.
- `npm run build`: **✓ Passed** (Vite production bundle built in ~5.9s).
- Reference-gray grep (`#909090 #7f7f7f #9b9b9b #969696 #8f8f8f #9c9c9c #acacac #c0c0c0 #f7f7f7
  #f8f8f8 #f4f4f4 #f5f4f4 #d9d9d9 #e7e7e7 #ededed`) across the 4 changed files → **ZERO** literals.
- `git diff` cross-check: **no color hex, no `@theme` / token color change, `BottomTabBar.tsx` ZERO
  diff, `ProductScreen` / `CartScreen` (gesture / overlay) files untouched, no business logic changed.**
- `git diff --stat` (source): `SectionHeader.tsx` (6±), `HomeScreen.tsx` (22±), `CategoriesScreen.tsx`
  (8±), `WishlistScreen.tsx` (10±), + deleted `src/components/WishlistScreen.tsx`.
- Claims re-verified against the actual file (lesson): `px-6` counts confirmed; `pt-20 pr-18` still
  present; the page-edge `px-5`→`px-6` swap did NOT bleed into HomeScreen CTA button-internal `px-5`
  (those were left intact).

### Handoff / next
- **NEXT RUN = Phase L2 — Purchase flow (batch B):** `ProductScreen.tsx`, `CartScreen.tsx`,
  `CheckoutScreen.tsx`, `CouponsScreen.tsx`, `CustomizeScreen.tsx`. Re-measure spacing / structure
  against reference `product` / `cart` / `order-type`+`delivery-address`+`review-summary`+`payments` /
  `payments` list-rows / general conventions. **Do NOT touch ProductScreen / CartScreen gesture code**
  (native touch listeners) — only padding / spacing around them.
- Buddy / Claude verify-then-push loop: apply the 4 modified source files + this log, and
  `git rm src/components/WishlistScreen.tsx` (dead duplicate deleted this phase).
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0002 — Layout & Spacing Pass — Phase L0 (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Phase worked on:** **Phase L0 — Foundation.** No BAS0002 entry existed, so this run
started at L0 as required. **NEXT RUN = Phase L1.**

### কী বদলেছে — reusable layout foundation
- **`src/index.css`**: added BAS semantic layout primitives, without changing any color
  tokens or screen bodies: `.layout-page` (24px page edge), `.layout-appbar` (4.5rem
  reference-proportioned chrome), `.layout-appbar-title`, `.layout-back`,
  `.layout-round-action`, `.layout-appbar-actions`, `.layout-badge-pill`, and the
  `.layout-section-*` row/title/action rhythm (1.5rem top / 1rem bottom).
- Measurements were translated from GroceryApp `style.css` `.appbar`, `.back`,
  `.round-act`, `.badge-pill`, `.page`, and `.sec-row`/`.sec-title`/`.see-all`.
  Reference grayscale values were not copied; all styling uses existing BAS semantic
  tokens and the finished BAS soft-pink shadow language.
- **`tasks/todo.md`** updated for this one phase. No screen JSX, `BottomTabBar.tsx`,
  gesture code, overlays, business logic, or `tailwind.config.ts` was changed.

### Verification
- `git diff --check`: ✓ passed.
- `npx tsc --noEmit`: ⚠️ could not run against the fresh clone because dependencies are
  not installed; `npx` attempted the unrelated deprecated `tsc` package and reported
  “This is not the tsc command you are looking for”. No source error result is claimed.
- `npm run build`: ⚠️ blocked for the same environment reason (`vite: not found`).
- Reference-gray grep on the changed CSS additions: ✓ no listed reference gray literals.

**Handoff:** Buddy/Claude should install the repo dependencies and rerun `npx tsc
--noEmit` and `npm run build` before applying/pushing. **Next = Phase L1 — Browse (batch A).**
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BAS0001 — PREMIUM SOFT-PINK REDESIGN — Phase 6 (final consistency pass, ALL screens) ✅ (2026-07-19, arena.ai Agent Mode)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Agent/Tool:** arena.ai Agent Mode (codename BAS0001)
**Phase worked on:** **Phase 6 — final consistency pass across ALL screens** (the dedicated
side-by-side spacing/radius/shadow/type audit + repo-wide leftover-straggler hunt).
Phases 0–5 were all confirmed done on `main` before this run (newest log entry + commit
history). **NEXT RUN = NONE — the BAS0001 soft-pink redesign is COMPLETE after this
phase.** All 7 phases (0→6) are done; hand the repo to Claude for the final
`tsc --noEmit` + `npm run build` re-verify, `AGENT_LOG.md`/`tasks/lessons.md` review,
and phase-by-phase commit + push (per section 4 of the brief). This run is purely the
consistency/closing pass; no new screen was rebuilt and no business logic was touched.

### কী বদলেছে — final consistency / straggler cleanup (exact Phase-6 source files)

- **`src/index.css`** (tokens + dead-class cleanup; ZERO JSX touched):
  - Removed `--font-display` / `--font-brand` from `@theme` and removed the `.font-display`
    / `.font-brand` custom class definitions. Headings now use the default
    `Poppins`+`Hind Siliguri` body stack (already identical, so render-safe; every
    consumer's weight/size classes were preserved).
  - Removed the dead `.glass-strong` / `.glass-deep` / `.glass-tint` / `.glass` /
    `.glass-subtle` / `.glass-dark` class definitions (all ~19 consumers were migrated to
    solid `bg-surface border-border shadow-card` in phases 1–5; these defs were
    unused dead code).
  - Removed the unused `.mesh-warm`, `.hairline`, `.text-gradient-coral`,
    `.badge-premium`, `.confetti-dots` class definitions (verified 0 JSX usages each) —
    they still carried `linear-gradient`/`radial-gradient` strings that failed the
    grep-zero audit.
  - Kept `.shimmer` (skeleton infra), `.lux-orb` decorative glow, and the
    `.card*`/`.btn*`/`.chip*`/`.section-*`/`.price-display`/`.tab-indicator`/
    `.product-card-shadow` system classes.
  - Updated the two comments that named the now-removed `font-display`/`glass-strong` classes.

- **`src/screens/ProductScreen.tsx`** (GESTURE CODE UNTOUCHED — native `touchstart`/
  `touchmove`{passive:false}/`touchend` at 97–103 intact):
  - Removed the decorative top `from-secondary/80 to-transparent` scrim (no text on the
    image; the back/heart/share controls are already solid white chips) — a true leftover.
  - Premium tier badge `bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600`
    → solid `bg-gold` (soft amber).
  - "Out of Stock" badge `backdrop-blur` removed → solid `bg-surface shadow-card` (no blur).
  - Active flavor/weight chips `shadow-md` → `shadow-btn` (pressed/active pink);
    floating top-bar controls + count badge `shadow-md` → `shadow-card` (soft rest).
  - Comment referencing the removed `.glass-strong` class updated.

- **`src/screens/CartScreen.tsx`** (swipe/delete listeners at 354–357 UNTOUCHED):
  - Delete-confirm button `bg-gradient-to-br from-error to-red-600` → solid `bg-error`.

- **`src/components/LocationGate.tsx`** (presentation-only; logic untouched — Phase-0
  permitted this "trivial quiet swap"): inline cocoa `linear-gradient(135deg,#FDF8F1,
  #F3E4D0,#E8C68F)` → solid `background:'#FFF9FB'` (the `#FFF9FB` app canvas).
  Also normalized its `shadow-2xl` → `shadow-card` while already on that element, for
  shadow-language consistency (zero-risk class swap, logic untouched).

- **`src/components/AdminPanel.tsx`** (admin-only, logic untouched): close button
  `shadow-lg` → `shadow-card`.

- **`font-display` / `font-brand` class tokens removed from all 9 live consumers**
  (render-safe — default body font is already `Poppins`+`Hind Siliguri`): `AuthSheet.tsx`(2),
  `ErrorBoundary.tsx`(1), `NotificationsSheet.tsx`(1), `OccasionSheet.tsx`(1),
  `PaymentAppPopup.tsx`(1), `ProductCard.tsx`(2), `SectionHeader.tsx`(1),
  `WalletHistoryModal.tsx`(2), `CheckoutScreen.tsx`(8). Done via a count-asserted
  script (per the bulk-replace lesson) so no occurrence was missed or half-applied.

### Fixed-overlay / gesture cross-check (no regression)
- ProductScreen native image-gallery touch listeners (97–103) confirmed INTACT (grep).
- CartScreen swipe/delete pointer listeners (354–357) confirmed UNTOUCHED — left
  exactly as the pre-existing implementation (pointer-based, NOT the native-touch pattern
  the swipe-gesture lesson requires). This is a pre-existing behavior, not a regression
  introduced by this visual pass; noted under "pending" below rather than silently
  "fixed" (out of visual-redesign scope).
- No fixed-overlay (BottomTabBar z100 / QuickBar z45 / sheets) was edited this phase,
  so header/footer stacking is unchanged from phases 1–5.

### Verification (self)
- `npx tsc --noEmit`: **✓ Verified.** Baseline (`/tmp/baseline_tsc.txt` = 31
  `error TS` lines) → Phase 6 = **31 lines**. `diff` (sorted) shows **zero new and
  zero removed errors**. All 31 are pre-existing logic errors in `App.tsx`, `hooks/*`,
  `lib/store.ts`, `lib/firestoreMappers.ts`, `DebugMetrics/Overlay.tsx`, and
  `CheckoutScreen`/`OrdersScreen`/`TrackingScreen` browse pipelines — explicitly OUT of
  scope for this visual redesign; none were touched.
- `npm run build`: **✓ Passed** (Vite production bundle built in **5.55s**).
- `grep -rn` straggler sweep across `src/` (results):
  - `glass-*` / `mesh-warm` → **ZERO** live class usages (only two *comments* in
    `index.css` mention the removed names — documentation, not code).
  - `backdrop-blur` → **ZERO** (only an `index.css` comment says "No backdrop-blur").
  - `bg-gradient` (Tailwind class) → **ZERO**.
  - inline cocoa hexes (`#A8672E`,`#2A1B12`,`#C9963C`,`#5C3A22`,`#3D2418`,`#FBF6EF`,
    `#E8C68F`,`#D9A85E`,`#6E2A45`,`#5F7556`,`#EEE1D2`,`#6B3A18`,`#FDF8F1`,`#F3E4D0`)
    → **ZERO**.
  - `Fraunces` / `Great Vibes` → **ZERO** usages (only an `index.css` comment
    documents the Phase-0 removal — intentional history note).
  - `font-display` / `font-brand` → **ZERO** in live code (verified in all 9 consumers
    + `index.css` vars/classes removed). The only remaining hit is
    `src/components/WishlistScreen.tsx` (the DEAD, unrouted duplicate — confirmed
    `App.tsx:17` imports `./screens/WishlistScreen`; nothing imports the `components/`
    copy) which still carries old classes; left untouched per the Phase-2/5 handoff
    (don't restyle dead code).
  - off-system shadows (`shadow-2xl/xl/lg/md`) in JSX → **ZERO** (the 9 hits across
    ProductScreen/AdminPanel/LocationGate were all normalized to `shadow-card`/`shadow-btn`).
  - **Intentional, documented exceptions** (NOT cocoa-era leftovers, kept on purpose):
    1. `HomeScreen.tsx:197` — dark `linear-gradient` legibility scrim behind WHITE
       banner text (functional contrast over user-supplied promo imagery; fade-to-transparent,
       not a heavy/decorative gradient).
    2. `CouponsScreen.tsx:84` — brand-pink `linear-gradient(#F65F8F→#E84E80)`
       discount strip, deliberately retuned from cocoa→pink in Phase 3.
    3. `index.css` `.shimmer` — `linear-gradient` skeleton shimmer (required animation infra).
  - Per the lessons, `coral`/`blush`/`ink`/`primary`/`secondary`/`accent`/`surface`/
    `text-*`/`gold` are the LIVE semantic tokens (intentional; `coral` is the primary
    pink since Phase 0) — they are NOT stragglers and were left as-is.

### Handoff / pending
- **NEXT RUN = NONE.** BAS0001 (phases 0–6) is complete. Do NOT start a new
  redesign phase. Hand to Claude (section 4): re-verify each phase's tree with
  `tsc --noEmit` + `npm run build`, confirm `AGENT_LOG.md`/`tasks/lessons.md` reflect
  all 7 phases newest-first, then commit + push phase-by-phase in order (not one
  merged commit).
- **Pending / notes for Claude (do NOT silently fix in a visual pass):**
  1. `src/components/WishlistScreen.tsx` (dead duplicate) still has old `font-display` +
     glass-era classes — delete it entirely or confirm it's never imported (it isn't)
     before pushing.
  2. `CartScreen.tsx` swipe-to-delete uses pointer events (354–357), not the
     native-touch pattern the swipe-gesture lesson requires for real-device reliability.
     Flag as a behavior bug to fix in a dedicated logic pass (NOT a visual redesign).
  3. `HomeScreen.tsx:197` scrim + `CouponsScreen.tsx:84` brand-pink strip +
     `.shimmer` are intentional gradients (documented above) — keep them.
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
