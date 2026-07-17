# Agent Log — BAS (Bake Art Style 2)

## Session: Wireframe Gap Review + Coupons Screen (2026-07-17)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Item 1 of `WIREFRAME-GAP-REVIEW-071726.md` — "My Coupons" screen (Check 7: Offers/Promo/Coupon screens, previously entirely missing)

### Context:
- User handed a full grocery-delivery-app Figma wireframe kit to Arena.ai to redesign BAS against. A gap review (`WIREFRAME-GAP-REVIEW-071726.md`) was written comparing all wireframe screens against actual `src/App.tsx` routes + code — found only Home/Categories/ProductCard/ProductScreen/SplashScreen were touched (styling-level), most other wireframe screens untouched.
- **Correction to that review:** on deeper read (this session), Check 3 (Search + Filter) and Check 4 (Address management) turned out to already be functionally implemented — `CategoriesScreen.tsx` already has debounced search, recent searches, suggestions, and a full filter/sort bottom sheet; `ProfileScreen.tsx` already has a full address-book modal (add/edit/delete/set-default/geolocate). Those two were incorrectly marked "missing" in the initial review from a shallow grep — flagging here so no one re-builds them from scratch.
- Check 7 (Coupons) was confirmed genuinely missing: `SiteSettings.coupons: Coupon[]` type existed but was always `[]`, never rendered anywhere, no admin UI, no redemption logic beyond the single legacy `settings.promoCode` string.

### কী হয়েছে:
- **New `src/screens/CouponsScreen.tsx`** — full-screen "My Coupons" list (ticket-style cards: discount %, code, expiry countdown, "Copy code" button), matching the wireframe's Coupon screen intent. Empty state included.
- **`src/lib/store.ts`** — added `{ name: 'coupons' }` to the `View` union so it's a real navigable route.
- **`src/App.tsx`** — imported and routed `CouponsScreen` for `view.name === 'coupons'`.
- **`src/screens/ProfileScreen.tsx`** — added a "My Coupons" row (same style as Address book / Special Dates rows) navigating to the new screen. Not gated behind `user` — coupons are viewable/copyable by guests too.
- **`src/screens/CheckoutScreen.tsx`** — promo code Apply button now checks `settings.coupons[]` first (active + not expired + under maxUses), falling back to the legacy single `settings.promoCode`/`promoPercent`. Fixed the "applied" confirmation message to show whichever code/percent was actually applied instead of always showing the legacy admin promo code.
- **`src/lib/data.ts`** — seeded `DEFAULT_SETTINGS.coupons` with 3 example coupons (`SAVE10`/10%, `FRESH15`/15%, `BAKE25`/25%) so the screen isn't empty out of the box.

### Touched files:
- `src/screens/CouponsScreen.tsx` (new)
- `src/lib/store.ts`
- `src/App.tsx`
- `src/screens/ProfileScreen.tsx`
- `src/screens/CheckoutScreen.tsx`
- `src/lib/data.ts`

### Verify:
- `npm run build`: **✓ built in 13.50s**
- `npx tsc --noEmit`: same pre-existing `unknown`-type errors in Home/Orders/Reviews/Tracking/Wishlist/WriteReview as before (all listed in this repo's own error baseline) — **zero new errors** in any of the 6 touched/new files.

### Output ZIP:
- `coupons-screen-071726.zip` — contains only the 6 files listed above, no top-level folder (starts at `src/`).

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- **No admin UI to manage coupons yet** — `AdminScreen.tsx` was intentionally left untouched (out of scope for this task). The 3 seeded coupons are hardcoded in `data.ts` as a starting point; a real admin coupon-management tab (create/edit/deactivate/track usage) is a separate future task if wanted.
- **`usedCount` is not incremented on order placement** — redemption validates `maxUses`/`usedCount`/`expiresAt`/`active` but doesn't write back usage count when an order is placed (would need a Firestore write in the order-creation path in `store.ts` — deliberately left out to keep this change low-risk/read-only-logic).
- Remaining items from `WIREFRAME-GAP-REVIEW-071726.md` still open: Check 1 (onboarding slides — 2/4 done, wrong visual style), Check 2 (Login/Signup/OTP as dedicated screens vs current sheet), Check 5 (Payment methods management + Add Card screen), Check 9 (order tracking live map — needs a maps-SDK scoping decision first).
- User's build/push environment: Android via Termux, GitHub for version control, Cloudflare Pages for auto-deploy on push to `main`.

---

## Session: Phase 10 — Onboarding Carousel & Nearby Bakeries Explore Polish (2026-07-16)
**Agent/Tool:** Arena.ai Agent Mode (Code Master protocol)
**Feature worked on:** Phase 10 — Onboarding Slide Carousel & Nearby Kitchens Explore Section

### কী হয়েছে:
- **Interactive Onboarding Slider** — `src/screens/SplashScreen.tsx`: Added multi-slide onboarding carousel matching Bakery UI Kit reference ("Bookmark Your Bakery Favorites", "Discover Delight: Explore Our Bakery Selection") with pagination indicators and Skip / Explore actions.
- **Bakeries Near You Section** — `src/screens/CategoriesScreen.tsx`: Integrated featured nearby kitchen/bakery cards with ratings, delivery estimates ("14 min • 2.2 km"), and Free Delivery tags matching reference kit layout.
- **Build Verification** — `npm run build` verified cleanly (**✓ built in 5.89s**).

### Touched files:
- `src/screens/CategoriesScreen.tsx`
- `src/screens/SplashScreen.tsx`
- `AGENT_LOG.md`

### Output ZIP:
- `app-final-polish-p10-071626.zip`

---

## Session: Phase 10 — ProductScreen Chip & Surface Refinements (2026-07-16)
**Agent/Tool:** Arena.ai Agent Mode (Code Master protocol)
**Feature worked on:** Phase 10 — ProductScreen Wireframe Layout & Design Token Alignment

### কী হয়েছে:
- **Refined Weight & Flavor Chips** — `src/screens/ProductScreen.tsx`: Active chip state now uses solid cocoa theme token (`bg-[#5C3A22]`), inactive state uses crisp `border-amber-900/15 bg-white`, matching Phase 10 design rules.
- **Improved Layout Titles** — Renamed weight section label to "Select Weight" matching reference UI kit rhythm.
- **Verified Build** — Verified with `npm run build` (**✓ built in 5.59s**).

### Touched files:
- `src/screens/ProductScreen.tsx`
- `AGENT_LOG.md`

### Output ZIP:
- `product-detail-refine-p10-0716.zip`

---

## Session: Phase 10 — Full App Redesign (Grocery Wireframe Layout + Bakery Color) (2026-07-16)
**Agent/Tool:** Arena.ai Agent Mode (Code Master protocol)
**Feature worked on:** Phase 10 — HomeScreen & ProductCard Grocery Wireframe Alignment

### কী হয়েছে:
- **HomeScreen category chips aligned with Wireframe layout** — `src/screens/HomeScreen.tsx`: Category row styled with distinct rounded chips, soft border (`border-ink-50/60`), category title row header with "See all" quick navigation button.
- **ProductCard unified border & shadow** — `src/components/ProductCard.tsx`: Applied Phase 10 design tokens with clean white background, `border border-ink-50/80`, overlay rating badge, and consistent card shadow.
- **Build & TypeScript verification** — Verified zero build errors, `npm run build` succeeded cleanly (**✓ built in 5.90s**).

### Touched files:
- `src/screens/HomeScreen.tsx`
- `src/components/ProductCard.tsx`
- `AGENT_LOG.md`

### Output ZIP:
- `app-phase10-full-redesign-071626.zip`

---

## Session: Phase 3 — Home + Categories + Product listing (2026-07-16)
**Agent/Tool:** Arena.ai Agent Mode (Code Master protocol)
**Feature worked on:** Phase 3 of the brown/gold redesign — home banner, category icons, product cards, categories filter sheet

### কী হয়েছে:
- **Home banner aligned with bakery reference** — `src/screens/HomeScreen.tsx`: replaced the frosted-white tag/button with a clean opaque tag chip, enlarged title (`max-w-[16ch]`, `text-[26px]`), and a gold `Shop Now` CTA pill (`bg-gold` + gold shadow). Left carousel arrows/dots untouched.
- **Category row now uses per-category icons & colors** — `src/lib/data.ts`: updated `icon` field for each category to a valid `OccasionIcon` id (`birthday`, `anniversary`, `wedding`, `cupcakes`, `gift`). `src/screens/HomeScreen.tsx`: replaced the hardcoded `<Cake />` icon and `.glass-strong` circle with `<OccasionIcon id={c.icon} />` on a solid `c.color` circular background.
- **ProductCard rating moved to image overlay** — `src/components/ProductCard.tsx`: added a white rating pill (star + rating + review count) overlay at the bottom-left of the image, removed the old below-image rating row, and cleaned up the card surface to `bg-white product-card-shadow` instead of `.glass`.
- **Removed leftover pink shadow** — `src/components/ProductCard.tsx`: the add button had an inline `box-shadow: rgba(232,82,106,.5)` (Phase 1 rgba miss). Replaced with theme-based Tailwind classes: `bg-coral` + `shadow-[0_6px_16px_-4px_rgba(168,103,46,.5)]`; kept green confirmation state.
- **Categories filter sheet active chips now cocoa** — `src/screens/CategoriesScreen.tsx`: active sort option uses `btn-primary` (dark-cocoa gradient) instead of `bg-coral`, matching app-wide CTA style.

### Touched files:
- `src/screens/HomeScreen.tsx`
- `src/screens/CategoriesScreen.tsx`
- `src/components/ProductCard.tsx`
- `src/lib/data.ts`
- `AGENT_LOG.md`

### Review report:
- `PHASE3-HOME-CATEGORIES-REVIEW-071626.md`

### Verify:
- `npx tsc --noEmit`: same pre-existing `unknown`-type errors in Home/Orders/Tracking/Wishlist as before; zero new errors in the touched files.
- `npm run build`: **✓ built in 8.88s** cleanly.

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- **ProductCard zoom indicator** (small bottom-center magnifier) was intentionally left; remove later if it conflicts with the reference.
- **Home banner prev/next arrows** remain hidden on mobile and visible on `md:` — acceptable but can be removed if a simpler one-slide-per-view reference is desired.
- **Next recommended phase:** Phase 4 — Product detail screen.

---

**Repo:** https://github.com/ferdausfs/BAS
**Stack:** React 19 + TypeScript + Tailwind v4 + Vite + Zustand + Firebase/Firestore
**Deploy:** Cloudflare Pages — https://bas.umuhammadiswa.workers.dev
**Design tokens:** Fraunces serif (`font-display`), coral (`#E8526A`), blush, gold, ink — `@theme` directive in `src/index.css`

---

## Session: 2026-07-02 (multiple commits, one long session)
**Agent/Tool:** Claude (orchestrator) + external coding agent (via Code Master protocol)
**Feature worked on:** Full UI/UX premium upgrade pass — personalization, search, tracking, category density, input methods, micro-interactions, social proof, wallet prominence, banner CTA, typography scale, checkout logic, profile/success consolidation, customize simplification, cart consistency, address label clarity

### কী হয়েছে (chronological):

1. **Personalization** — guest CTA banner on Home, dynamic greeting with name, real "For You" product (from last order/wishlist instead of static index), personalized "Order again" with product image, auth-aware empty states on Wishlist/Orders.
2. **Search UX** — debounce (300ms) via new `useDebounce` hook, autocomplete suggestions, recent searches (localStorage), zero-result state, filter/sort bottom sheet with price slider.
3. **Order tracking** — cancelled order state with reason + reorder/support CTA, removed manual refresh button (replaced with "Live" pulse indicator), auto-load latest active order, ETA shown at all active steps, sticky "Need help?" FAB.
4. **Category screen density** — skeleton loading cards while products fetch, image `onError` fallback, occasion chip on Home now passes `categoryId` to Categories screen.
5. **Input methods** — `type="tel"` on phone fields, real `<label>` elements on all Checkout inputs, cart stepper buttons enlarged to 44×44px tap target.
6. **Micro-interactions** — heart pop animation on wishlist toggle, cart badge bounce in Header, "+" button shows checkmark confirmation, screen-level fade transition in App.tsx.
7. **Social proof** — added `soldCount`, `lowStock`, `stockCount`, `viewCount` optional fields to `Product` type; badges on ProductCard grid + social proof strip on ProductScreen (all optional, safe for existing data).
8. **Wallet prominence** — balance chip in Header, proactive "you have ৳X" prompt on Home (threshold ≥50), prominent wallet section in Checkout.
9. **Banner CTA** — `link`, `productId`, `ctaText` fields added to `Banner` type + Firestore mapper; tapping banner now navigates; CTA text overlay shown when set.
10. **⚠️ Incident:** a ZIP named `output.zip` accidentally applied a totally different/old design system (orange Tailwind v3 tokens) on top of `HomeScreen`, `ProductCard`, `tailwind.config.ts`, `CartScreen`. Caught via build error, reverted with `git revert HEAD --no-edit` (commit `451fc9e`). **Lesson learned → ZIP filenames must always be unique**, this is now enforced in the protocol.
11. **Typography scale-down** — hero/section/banner/price/title font sizes reduced across Home, Product, Categories, and the shared `SectionHeader` component — app felt "loud" before, now tighter hierarchy.
12. **Filter sheet + ProductCard polish** — drag handle, icon-labeled sort pills, custom coral range slider in the Categories filter sheet; smaller refined badges/heart/add buttons on ProductCard grid variant.
13. **Checkout date + payment fix** — today's date disabled in delivery date picker (4pm cutoff logic: before 4pm → next day min, after 4pm → 2 days min), calendar icon styling, branded bKash (pink) / Nagad (orange) / COD payment rows replacing generic black-box icons.
14. **Profile + Success screen consolidation** — wallet card shrunk (was `text-[40px]`, now `text-[26px]`), stats (Orders/Wishlist/Cart) made clickable with navigation, "Quick checkout profile" card removed entirely (redundant), Success screen reduced from 6 stacked cards to 3 (checkmark+title, id+delivery combined, summary), WhatsApp share button removed for cleanliness (Copy ID retained).
15. **Customize screen simplified** — replaced the old rigid 7-step wizard (Reference → Flavour → Weight → Shape → Add-ons → Message → Review, 538 lines) with a single simple page (120 lines): reference photo upload + free-text note + "WhatsApp এ কথা বলুন" CTA using `settings.whatsappNumber`. Rationale: custom cake requests are too varied for structured forms — direct human conversation via WhatsApp is more practical.
16. **Cart consistency + suggested add-ons** — added matching `boxShadow` to promo box and wallet redeem box (previously shadow-less, inconsistent with other white cards), added new "Add something extra" horizontal-scroll add-on section using `settings.customAddons`.
17. **Address label clarity fix** — discovered two different, disconnected "address" concepts both visible on ProfileScreen showing contradictory states ("No saved addresses" vs "Comilla · saved"). Renamed: the single default/checkout address → **"Delivery address"**; the multi-address book feature → **"Address book"**. No state/logic merge (would be a larger, riskier refactor) — just clarity via labeling.
18. **Cart addon emoji → icon fix** — addon cards were using raw emoji (🕯️🎂📸🌷) which clashed with the rest of the app's clean coral/gold Lucide-icon language. Replaced with category-mapped Lucide icons (`Sparkles`/`Cake`/`Flower2`/`Gift`) in coral-tinted circles.

### Touched files (cumulative, this session):
- `src/screens/HomeScreen.tsx`
- `src/screens/ProductScreen.tsx`
- `src/screens/CategoriesScreen.tsx`
- `src/screens/CheckoutScreen.tsx`
- `src/screens/CartScreen.tsx`
- `src/screens/OrdersScreen.tsx`
- `src/screens/WishlistScreen.tsx`
- `src/screens/TrackingScreen.tsx`
- `src/screens/SuccessScreen.tsx`
- `src/screens/ProfileScreen.tsx`
- `src/screens/CustomizeScreen.tsx` (fully rewritten, simplified)
- `src/components/ProductCard.tsx`
- `src/components/Header.tsx`
- `src/components/SearchBar.tsx`
- `src/components/SectionHeader.tsx`
- `src/components/OccasionIcon.tsx`
- `src/hooks/useDebounce.ts` (new)
- `src/lib/store.ts`
- `src/lib/firestoreMappers.ts`
- `src/types/index.ts`
- `src/index.css`
- `src/App.tsx`
- `tailwind.config.ts` (briefly corrupted then reverted — see incident above)

### Commits (chronological, most relevant):
- `f7cb4ee` — personalization screens
- (search UX commit)
- `97c8ff0` — tracking cancelled state, support FAB, ETA
- `de066cc` — category skeleton loading, image fallback
- `9b2214a` — input methods (tel, labels, tap targets)
- `b7ccba6` — micro-interactions
- `87b03bd` — social proof fields + UI
- `cb464db` — wallet prominence
- `2eb5015` — banner CTA
- `451fc9e` — **revert** of bad `output.zip` design-system corruption
- `f4e49d9` — typography scale-down
- `20be28a` — filter sheet + product card polish
- (checkout date/payment commit)
- (profile/success consolidation commit)
- `da900e6` — customize screen simplified
- (cart consistency + add-ons commit)
- `bbf681f` — address label clarity + cart addon icons

### এখনো Pending (কিছুই urgent না, but noted):
- App-wide visual-noise pass was planned but not done in depth (only spot-fixed as issues surfaced: emoji removal, shadow consistency). A full audit of `boxShadow`/background-color variety across all screens could still tighten things further if user wants.
- No further screen has been fully audited beyond what's listed above (e.g. `AdminScreen.tsx` was intentionally left alone — admin-only, not customer facing).

### পরবর্তী Agent এর জন্য নোট:
- **ZIP filenames must always be unique and descriptive** — a generic name like `output.zip` previously caused a stale/wrong file to be applied from the user's Downloads folder, corrupting the design system. This is now a hard rule (see `AGENT-WORKFLOW-PROTOCOL.md` in this repo/conversation).
- **Never dump the whole repo in a ZIP unless explicitly asked** — one agent once returned 40+ files when only 1 was requested. It turned out harmless (all files were byte-identical to repo except the 1 real change + 2 junk files), but it added unnecessary verification overhead and risk. Always scope ZIPs to only the changed files.
- **Termux `/tmp` is not writable** — extraction scratch dirs must go under `~/` (home directory), not `/tmp`.
- ProfileScreen has TWO separate address concepts by design (`savedProfile.district` for quick-checkout default vs `addresses[]` array for a full address book) — do not try to merge them without a deliberate refactor decision; for now they are just clearly labeled ("Delivery address" vs "Address book").
- `CustomizeScreen.tsx` is intentionally minimal now (photo + note + WhatsApp) — do not re-add the old multi-step wizard unless explicitly requested.
- User's build/push environment: Android via Termux, GitHub for version control, Cloudflare Pages for auto-deploy on push to `main`.
- User communicates in mixed Bengali/English; prefers concise step-by-step Termux commands, one command block at a time, with explicit "✓ built in" confirmation before any push.

---

## Session: Brown/Gold Bakery Redesign — Foundation (2026-07-16)

**Goal**: Full app-wide redesign away from the pink glassmorphism theme, toward a
dark-cocoa/gold bakery aesthetic, matching a reference bakery UI kit the user
supplied (onboarding, product listing, cart, reviews, checkout, order tracking
screens). This is Phase 1 of a multi-phase rollout (same pattern as the earlier
glass rollout: foundation → navigation → screens → cards).

**Phase 1 (this session) — Foundation only:**
- Rewrote `src/index.css` `@theme` palette: `--color-coral` family repurposed
  from rose-pink (#E8526A) to a cocoa/caramel scale (#A8672E base, #6B3A18
  deep, #FBF3E7 light), `--color-blush` → warm tan/latte tints, `--color-cream`
  → warm ivory (#FBF6EF, was pink #FCE3EC), `--color-ink` → warm espresso
  (#2A1B12). `--color-gold` kept close to original (#C9963C).
- **Removed the pink "LUXURY GLASS LAYER" frosted-glass block** (blur + pink
  tint) and replaced it with a **solid warm-surface system** — same
  `.glass-strong` / `.glass` / `.glass-subtle` / `.glass-deep` class names
  (zero JSX changes needed anywhere) but now render as opaque white/ivory
  cards with a soft cocoa-tinted shadow, no `backdrop-filter`. This matches
  the reference, which uses solid cards throughout, not glassmorphism.
- `.btn-primary` / `.chip-active` now use a dark cocoa gradient
  (#5C3A22 → #3D2418) with white text — matches reference's solid dark
  "Add to Cart" / "Sign Up" / "Continue to Payment" buttons.
- `.badge-premium`, ratings/price accents use the gold token.
- Swept all hardcoded pink hex literals out of component files (not just
  CSS vars) so nothing regresses to pink: `BottomTabBar.tsx`, `ProductCard.tsx`,
  `data.ts` (category chip colors), `SuccessScreen.tsx` (confetti palette),
  `LocationGate.tsx`, `AdminPanel.tsx`, `WishlistScreen.tsx`, `OrdersScreen.tsx`
  (empty-state gradients).
- Verified: `tsc --noEmit` shows the same 160-line pre-existing error set as
  the unmodified repo (unrelated `unknown` type issues in HomeScreen/
  OrdersScreen/TrackingScreen/WishlistScreen — not touched, not introduced
  by this session). `npm run build` succeeds cleanly.

### Touched files (this session):
- `src/index.css`
- `src/lib/data.ts`
- `src/components/AdminPanel.tsx`
- `src/components/BottomTabBar.tsx`
- `src/components/LocationGate.tsx`
- `src/components/ProductCard.tsx`
- `src/screens/OrdersScreen.tsx`
- `src/screens/SuccessScreen.tsx`
- `src/screens/WishlistScreen.tsx`

### এখনো Pending (next phases, user wants the whole app redone):
- **Typography/layout pass per-screen** to more closely mirror the reference
  kit's specific compositions (e.g. large hero product photo + floating
  bottom sheet on ProductScreen, star-breakdown review screen, order-tracking
  map-style layout). Foundation colors now cascade everywhere automatically,
  but layout structure has not been touched yet.
- **New screens the reference has that BAS doesn't yet**: a dedicated
  "Write a Review" screen with star input, a richer review-list screen with
  rating breakdown bars — not built yet, only styled if/when they exist.
- **BottomTabBar / Header** icon set and active-state visuals should get a
  dedicated pass (currently just recolored, not restructured).
- Pre-existing `unknown`-type TS errors (160 lines, listed above) are
  untouched — out of scope for this redesign session, flagged for a separate
  cleanup pass if the user wants it.

### পরবর্তী Agent এর জন্য নোট:
- The new palette is a **cocoa/caramel + gold** system — do not reintroduce
  pink/rose hex values (`#E8526A`, `#FFE4E9`, `#FFCCD5`, etc.) anywhere,
  even in new one-off inline styles. Use the CSS vars or the hex values
  documented above.
- `--color-coral` is a **legacy variable name** now holding the cocoa/caramel
  scale, not an actual coral color — kept only so existing Tailwind classes
  (`bg-coral-500`, `text-coral-600`, etc.) don't require a repo-wide rename.
  Don't be confused by the name when reading old code.
- `.glass-*` classes are **no longer glassmorphic** — they're solid opaque
  cards now. Don't add `backdrop-filter` back to them.
- ZIP filenames must stay unique/descriptive (established rule, see above).

## ═══════════════════════════════════════════════════════════
## FULL REDESIGN ROADMAP — Brown/Gold Bakery Theme (all screens)
## Written 2026-07-16. Read this whole section before doing any work
## if you are picking this up as a fresh agent.
## ═══════════════════════════════════════════════════════════

### Reference material
User supplied two reference images (not stored in this repo — describing
them here so a fresh agent has the brief without needing the originals):

1. **A bakery-shop UI kit** (primary reference — replicate this, not the
   old glass theme): dark cocoa-brown + gold color scheme, warm ivory
   canvas. Screens shown: splash (circular logo badge, "Bakery Shop" title
   on white), onboarding carousel (phone mockup floating over a brown
   header block, "Bookmark Your Bakery Favorites" / "Discover Delight"
   copy), sign-in/sign-up (clean white form, circular dark-brown back
   button, Apple/Google/Facebook social login row, solid dark-cocoa
   "Sign Up" button), home (brown header with location dropdown + search +
   cart/notification icons, a photo banner card with a gold "Shop Now"
   pill button, a horizontal category icon row with peach/tan circular
   backgrounds — Cup Cake / Cookies / Donuts / Breads, a featured-products
   grid with a rating pill and heart-wishlist icon on each card), product
   detail (full-bleed hero cake photo, floating back/heart/share circle
   buttons over the photo, seller card with avatar + chat + call icons,
   description with "Read more", weight-selector chip row 0.5kg–4kg,
   sticky bottom bar with total price + solid dark "Add to Cart" button),
   reviews (large "4.9" rating number + 5-row star breakdown bars, search
   bar, filter chips "Verified / Latest / Detailed Reviews", review list
   with avatar/stars/text/photo thumbnails, sticky "Write Review" button),
   checkout (Shipping Address list as selectable cards — Home/Office/
   Parent's House/Friend's House, each with an icon + address + a "Add New"
   dashed card; Order List with item thumbnails + prices; "Continue to
   Payment" button), payment/add-card (Visa-style card input), order/
   product photo screen with a bottom thumbnail filmstrip, and an
   explore/map screen (map pins showing bakery distance, bottom nav
   Home/Explore/Wishlist/Chat/Profile, bakery list cards with rating +
   delivery time + free-delivery tag).
2. A grocery-delivery wireframe — secondary reference, used only for
   general layout/spacing inspiration, not colors.

**Design rule for every phase below**: match the reference's actual layout
structure (card shapes, icon placement, button style, spacing rhythm) —
don't just recolor the existing glass-era layouts. Rule 0 from the
frontend-design discipline applies: reference wins over invented style.

### Status

- **Phase 1 — Foundation: ✅ DONE** (see session entry above this one).
  `src/index.css` palette + `.glass-*` → solid warm cards + all hardcoded
  pink hex swept from components. Verified with `tsc --noEmit` (no new
  errors) and `npm run build` (clean). This is committed/pushed by the
  time you read this (confirm with `git log` if unsure).

- **Phase 2 — Navigation & Chrome: not started.**
  Files: `BottomTabBar.tsx`, `Header.tsx`, `HomeHeader.tsx` (currently
  orphaned dead code per earlier architecture notes — decide whether to
  wire it up for the new brown header-block look, or delete it),
  `SearchBar.tsx`, `SplashScreen.tsx`, `AuthSheet.tsx`.
  Target: brown header block on Home (location dropdown + search + cart/
  bell icons), circular dark-brown back buttons app-wide (replace whatever
  back-button style currently exists), bottom tab bar active-state icon
  should use the new cocoa accent (already recolored in Phase 1, but the
  tab bar's structural layout has not been touched — compare against the
  reference's 5-icon bar: Home/Explore/Wishlist/Chat/Profile, and decide
  if BAS's existing tab set should change to match).

- **Phase 3 — Home + Categories + Product listing: not started.**
  Files: `HomeScreen.tsx`, `CategoriesScreen.tsx`, `ProductCard.tsx`,
  `OccasionSheet.tsx`, `OccasionIcon.tsx`, `QuickBar.tsx`.
  Target: photo banner card with gold "Shop Now" pill (reference), circular
  tan-background category icons in a horizontal row, product grid cards
  with a rating pill + heart icon exactly like the reference (BAS already
  has heart/rating on `ProductCard.tsx` — check spacing/pill-shape against
  reference rather than rebuilding from scratch).

- **Phase 4 — Product detail: not started.**
  Files: `ProductScreen.tsx`, `CustomizeScreen.tsx`.
  Target: full-bleed hero photo top with floating circular back/heart/share
  buttons, seller info card (BAS doesn't have a "seller" concept currently
  — confirm with user whether to add one or adapt the card to show bakery/
  prep info instead), weight-selector chip row (BAS's `weights` array in
  `data.ts` already has 0.5lb–2lb — just needs the chip UI treatment),
  sticky bottom total-price + Add to Cart bar matching the reference style.

- **Phase 5 — Cart + Checkout + Payment: not started.**
  Files: `CartScreen.tsx`, `CheckoutScreen.tsx`, `PaymentAppPopup.tsx`.
  Target: Shipping-address-as-selectable-cards layout (Home/Office/other,
  each with icon + "Add New" dashed card), Order List with item thumbnails,
  solid dark "Continue to Payment" button. BAS uses bKash/Nagad (not Visa
  cards like the reference) — adapt the payment step's visual language
  (card-style selector) to bKash/Nagad logos instead of literally copying
  a Visa input field.

- **Phase 6 — Orders + Tracking + Success: not started.**
  Files: `OrdersScreen.tsx`, `TrackingScreen.tsx`, `SuccessScreen.tsx`,
  `OrderTimeline.tsx`. Already recolored in Phase 1 (empty-state gradients,
  confetti palette) but layout/structure untouched.

- **Phase 7 — Reviews (NEW screens needed): not started.**
  BAS has a working `useReviews(productId)` hook (`src/hooks/useReviews.ts`)
  and reviews are currently rendered inline inside `ProductScreen.tsx` —
  there is **no dedicated review-list screen or write-review screen yet**.
  This phase means building two new screens from scratch, matching the
  reference: (a) a review-list screen with the big rating number + 5-row
  star breakdown bars + search + filter chips (Verified/Latest/Detailed) +
  review cards with photo thumbnails; (b) a write-review screen with a
  tappable 5-star input + detail textarea + add-photo + Cancel/Submit.
  Confirm with the user before building whether these become full routed
  screens (added to `App.tsx`'s screen stack / `useModalDepth.ts`) or
  bottom sheets — check how other secondary flows (e.g. `OccasionSheet`)
  are wired for the existing pattern to follow.

- **Phase 8 — Profile, Wishlist, Auth polish: not started.**
  Files: `ProfileScreen.tsx`, `WishlistScreen.tsx` (colors done, layout
  not), `AuthSheet.tsx`. Reference sign-up/sign-in screens are clean white
  forms with social-login icons — check if BAS's `AuthSheet` already has
  social login or just email/password; don't add new auth providers
  without asking, just restyle what exists.

- **Phase 9 — Admin panel: explicitly OUT OF SCOPE** unless the user asks
  otherwise — `AdminScreen.tsx`/`AdminPanel.tsx` are admin-only, not
  customer-facing (this exclusion predates this redesign, see earlier log
  entries).

### How to proceed as a fresh agent
1. Read this whole roadmap + the Phase 1 session entry above it.
2. Clone the repo fresh, confirm Phase 1 is actually merged (`git log`,
   check `src/index.css` for the cocoa palette / no `#E8526A`).
3. Ask the user which phase number to do next if they haven't said —
   don't assume; they've been choosing phase order interactively.
4. Follow the same ZIP + AGENT_LOG.md update discipline as this session:
   unique ZIP filename, only changed files, `tsc --noEmit` + `npm run
   build` verification before delivering, append a session entry here.
