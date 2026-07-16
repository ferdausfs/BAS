# Agent Log — BAS (Bake Art Style 2)

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
