# Agent Log — BAS (Bake Art Style 2)

**Repo:** https://github.com/ferdausfs/BAS
**Stack:** React 19 + TypeScript + Tailwind v4 + Vite + Zustand + Firebase/Firestore
**Deploy:** Cloudflare Pages — https://bas.umuhammadiswa.workers.dev
**Design tokens:** Fraunces serif (`font-display`), coral (`#E8526A`), blush, gold, ink — `@theme` directive in `src/index.css`

---

## Session: 2026-07-05 (Concept 4 — Typography + color system, brand feel)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Concept 4 — Typography + color system (brand feel)

### কী হয়েছে:
- Review report বানিয়ে ৫টা finding flag করা হয়েছিল (header size scale, orphaned font token, বাংলা font, off-token hex color, unused palette token) — ইউজার সবগুলা approve করে Check 1 ও 3 এর সিদ্ধান্ত Claude এর উপর ছেড়ে দিয়েছিল
- **Check 1 (header scale):** দুই-স্তরের header scale ঠিক করা হলো — back-button+inline-title সহ sub-page header (Cart/Checkout/Tracking/Wishlist/Customize) সব **16px**-এ unify (Customize 18→16), আর tab-root hero header (Home/Categories/Orders/Profile) সব **24px**-এ unify (Home 23→24, Categories 22→24, Orders 28→24, Profile 28→24)। ProductScreen এর title আসলে content headline (product name, floating-button header এর সাথে যুক্ত না) — তাই ওটাকে touch করা হয়নি, ভুলবশত প্রথমে 16px করে পরে revert করা হয়েছিল যাচাই করার পর। SuccessScreen ইচ্ছাকৃতভাবে অপরিবর্তিত (celebratory/terminal screen, আলাদা role)
- **Check 2+3 (font token cleanup + বাংলা font):** discover হলো `Hind Siliguri` font `index.html` এ **load-ই হয়নি** — তাই `font-siliguri` class (HomeHeader.tsx) silently কাজ করছিল না। Fix: `index.html` এ Hind Siliguri (400-700 weight) যোগ করা হলো Google Fonts link এ, আর `src/index.css` এর `--font-body`/`:root`/`.font-body` stack এ `"Inter", "Hind Siliguri", ...` হিসেবে fallback যোগ করা হলো — এখন বাংলা টেক্সট (Cart/Checkout সহ পুরো app) সামঞ্জস্যপূর্ণভাবে Hind Siliguri তে fallback করবে। অব্যবহৃত `playfair`/`script` token `tailwind.config.ts` থেকে মুছে ফেলা হলো (কোনো UI change হয়নি, শুধু cleanup)
- **Check 4 (off-token hex):** `CheckoutScreen.tsx` এর stepper এ raw `#E8526A`/`#9A8E8E` কে `var(--color-coral)`/`var(--color-ink-200)` এ বদলানো হলো (কোনো visual change হয়নি)। `ProfileScreen.tsx` এর dark gradient card এ raw `#2A1F1E`/`#3D2D2C` কে আনুষ্ঠানিক token বানানো হলো — `src/index.css` এর `ink` scale এ নতুন `--color-ink-400`/`--color-ink-500` যোগ করে (একই রং, শুধু এখন token, orphaned hex না)
- **Check 5 (unused palette token):** `accent`/`gold.light` অপরিবর্তিত রাখা হলো (future use এর সম্ভাবনা, remove করা risky মনে হয়েছে)
- Build verify করা হয়েছে: `✓ built in 10.73s`। `tsc --noEmit` এ touched files এ কোনো নতুন error নেই — শুধু pre-existing error (HomeScreen/OrdersScreen/CategoriesScreen এ আগে থেকে থাকা unrelated TS error, CheckoutScreen এর `Phone`/`Banknote` unused-import warning) — এই session এ touch হয়নি

### Touched files:
- `index.html`
- `tailwind.config.ts`
- `src/index.css`
- `src/screens/CustomizeScreen.tsx`
- `src/screens/HomeScreen.tsx`
- `src/screens/CategoriesScreen.tsx`
- `src/screens/OrdersScreen.tsx`
- `src/screens/ProfileScreen.tsx`
- `src/screens/CheckoutScreen.tsx`

### Commit:
- (pending — user local এ ZIP apply করে push করবে: `bas-concept4-typography-color-070526.zip`)

### এখনো Pending:
1. Concept 1 (HomeScreen premium) — STATUS: Done
2. Concept 2 (Product card polish) — STATUS: Done
3. Concept 3 (Cart/Checkout simplify) — STATUS: Done
4. **Concept 4 (Typography + color system) — STATUS: Done** (৪টা planned concept সম্পূর্ণ)

### পরবর্তী Agent এর জন্য নোট:
- `ink` scale এখন `ink-400`/`ink-500` পর্যন্ত বিস্তৃত (darker shades, `ink-300` এর চেয়ে গাঢ়, base `ink` এর চেয়ে হালকা) — ProfileScreen dark card এই দুটো ব্যবহার করে
- Header size convention এখন স্পষ্ট: **sub-page (back button + inline title bar) = 16px**, **tab-root hero header = 24px**। ভবিষ্যতে নতুন screen বানালে এই scale মেনে চলা উচিত
- `Hind Siliguri` এখন body font stack এ fallback হিসেবে load হয় — ভবিষ্যতে যদি পুরো app এর ভাষা Bengali তে সামঞ্জস্য করা হয় (HomeScreen/ProductScreen/CategoriesScreen এখনো English, আগের entry তে নোট করা), তাহলে font rendering ইতিমধ্যে ঠিক থাকবে
- ৪টা planned concept (Home/Product-card/Cart-Checkout/Typography) সবগুলো এখন সম্পন্ন — user চাইলে নতুন scope/concept ঠিক করে নিতে হবে পরবর্তী session এ

---

## Session: 2026-07-05 (log recovery — no code change)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** none — AGENT_LOG.md repair only

### কী হয়েছে:
- আগের commit `259003f` ("docs: update agent log with commit hash for concept 3") এ ভুলবশত পুরো AGENT_LOG.md এর Concept 1/2/3/planning history **overwrite** হয়ে পুরনো ২০২৬-০৭-০২ entry দিয়ে replace হয়ে গিয়েছিল — actual code commits (`7193aaa`, `e12b051`, `a2f326a`, `c9fe8d0`, `1e32ef6`) সব ঠিকই আছে repo তে, শুধু log file এ history হারিয়ে গিয়েছিল
- User এর কাছে থাকা local backup (`AGENT_LOG (2).md`) থেকে সঠিক Concept 1/2/3/planning history নিচে restore করা হলো, সবচেয়ে recent entry (Concept 3) সবার উপরে

### Touched files:
- `AGENT_LOG.md` (log only, কোনো source code touch হয়নি)

### Commit:
- (pending — user's next push এ include হবে)

### এখনো Pending:
1. Concept 1 (HomeScreen premium) — STATUS: Done
2. Concept 2 (Product card polish) — STATUS: Done
3. Concept 3 (Cart/Checkout simplify) — STATUS: Done
4. **Concept 4 (Typography + color system, brand feel) — STATUS: Pending ← এখন এটা নিয়ে কাজ করা হবে**

### পরবর্তী Agent এর জন্য নোট:
- docs-only commit দেওয়ার সময়ও পুরো file content ভালোভাবে diff/verify করে নিশ্চিত হতে হবে যে পুরনো কনটেন্ট accidentally আসেনি — এই incident টাই সেটার প্রমাণ

---

## Session: 2026-07-05 (Concept 3 — Cart/Checkout simplify, all-ages easy)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Concept 3 — Cart/Checkout simplify (all-ages easy)

### কী হয়েছে:
- Review report বানিয়ে ৬টা finding flag করা হয়েছিল, ইউজার সবগুলা approve করেছে (Check 6 এর জন্য direction: CartScreen কে Bengali তে আনা, Checkout এর মতো)
- **Check 1 (icon fix):** `CheckoutScreen.tsx` এর "অর্ডারের আইটেম" section এ ভুল `MapPin` icon ছিল, `ShoppingCart` এ ঠিক করা হলো
- **Check 2 (payment step reorder + accordion):** Step 1 (পেমেন্ট) এ আগে Gift/Wallet/Promo/Payment/Screenshot/Referral সবকিছু একসাথে expanded ছিল। এখন: Payment method selection সবার আগে (মূল কাজ), তারপর Gift toggle (আগে থেকেই collapsed ছিল, অপরিবর্তিত), তারপর নতুন collapsible "ডিসকাউন্ট / রেফারেল (ঐচ্ছিক)" section — এতে Wallet redeem card + Promo code + Referral code একসাথে, ডিফল্ট বন্ধ থাকে, কিন্তু আগে থেকে কিছু apply করা থাকলে (promo/wallet/referral) অটো-open হয় (`extrasAlreadyApplied` চেক দিয়ে) যাতে ইউজার হারিয়ে না ফেলে
- **Check 3 (font size):** Checkout ফর্মের সব label (11px→12px) আর hint text (10.5px→11.5px, 10px→11px) বাড়ানো হয়েছে — readability সব বয়সের জন্য। CartScreen এও item meta/addon/bill label text bump করা হয়েছে
- **Check 4 (Edit button):** Review step (step 2) এ প্রতিটা সামারি row এর পাশে ছোট "Edit" বাটন যোগ করা হয়েছে (`EditButton` helper component, `goToStep()` reuse করে) — আগে শুধু উপরের tiny stepper bar clickable ছিল যেটা discoverable না
- **Check 5 (error visibility):** আগে submit error শুধু sticky footer এর নিচে ছোট লাইন হিসেবে দেখাতো। এখন scroll container এর একদম উপরে একটা লাল banner (icon সহ) দেখায়, আর validation fail হলে `scrollToTop()` কল হয়ে স্বয়ংক্রিয়ভাবে ইউজারকে error এর কাছে নিয়ে আসে (নতুন `scrollRef` + `useRef` যোগ)
- **Check 6 (ভাষা):** `CartScreen.tsx` এর সব ইংরেজি UI copy Bengali তে আনা হলো (title, empty state, free-delivery nudge, bill labels, trust line, CTA) — এখন Cart ও Checkout দুই স্ক্রিনেই সামঞ্জস্যপূর্ণ ভাষা। "Wallet discount" শব্দটা ইচ্ছাকৃতভাবে English রাখা হয়েছে কারণ CheckoutScreen নিজেও এটা একই ভাবে ব্যবহার করে (brand/system term হিসেবে)
- Build verify করা হয়েছে: `✓ built in 9.26s`। `tsc --noEmit` এ touched files এ কোনো নতুন error নেই — শুধু ২টা pre-existing unused-import warning (`Phone`, `Banknote`) আগে থেকেই ছিল, এই session এ touch হয়নি

### Touched files:
- `src/screens/CartScreen.tsx`
- `src/screens/CheckoutScreen.tsx`

### Commit:
- `1e32ef6` — fix: cart/checkout simplify - payment step accordion, edit buttons, bengali cart, bigger fonts

### এখনো Pending:
1. **Concept 3 (Cart/Checkout simplify)** — STATUS: **Done**
2. **Typography + color system (brand feel)** — STATUS: Pending

### পরবর্তী Agent এর জন্য নোট:
- Checkout step 1 এ এখন `showExtras` state আছে (wallet/promo/referral এর জন্য) — auto-expand হয় `extrasAlreadyApplied` true হলে। ভবিষ্যতে নতুন discount-related feature যোগ করলে এই accordion এর ভেতরেই রাখা ভালো (scope creep এড়াতে payment method section কে হালকা রাখতে)
- Review step এর `EditButton` শুধু `goToStep(0)` / `goToStep(1)` কল করে — protocol অনুযায়ী `goToStep` আগে থেকেই `i <= step` guard করে, তাই নতুন কোনো permission logic লাগেনি
- CartScreen এখন পুরোপুরি Bengali (Checkout এর মতো), কিন্তু HomeScreen/ProductScreen/CategoriesScreen এখনো English — এটা এই session এর scope এ ছিল না, ভবিষ্যতে পুরো app এর ভাষা সামঞ্জস্য করতে চাইলে আলাদা concept হিসেবে ধরতে হবে

---

## Session: 2026-07-05 (Concept 2 — Product card + interaction polish)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Concept 2 — Product card + interaction polish

### কী হয়েছে:
- Review করে দেখা গেছে `ProductScreen.tsx` (detail page) এ আগে থেকেই gallery/lightbox/pagination-dots/thumbnail-strip এবং weight-flavor selector সহ live price calculation ছিল — এই concept এর বেশিরভাগ অংশ detail screen এ আগে থেকেই সম্পন্ন
- **B (lightbox zoom, ছোট gap fix):** `ProductScreen.tsx` এর fullscreen lightbox এ double-tap-to-zoom যোগ করা হলো (`lightboxZoomed` state) — zoom অবস্থায় swipe-navigation ও prev/next arrows disable করা হয়েছে (gesture conflict এড়াতে), zoom auto-reset হয় lightbox close বা image পরিবর্তনে
- **A (main gap):** `ProductCard.tsx` (list card — HomeScreen/CategoriesScreen/WishlistScreen এ ব্যবহৃত, 170px horizontal + grid variant) এ আগে কোনো zoom/interaction ছিল না। Tap-to-zoom (`zoomed` state, `handleImageTap` — `stopPropagation` দিয়ে `onOpen` থেকে আলাদা) এবং একটা subtle zoom-hint icon যোগ করা হলো, দুই variant এ। Zoom অবস্থায় wishlist/badges/price-add overlay hide করা হয়েছে যাতে zoomed photo পরিষ্কার দেখা যায়
- Scope decision অনুযায়ী **কোনো weight/flavor pill selector card এ যোগ করা হয়নি** — 170px/grid width এ জায়গা নেই বলে review report এ আগেই flag করা হয়েছিল, তাই `handleAdd` এখনো আগের মতোই default (index[0]) weight/flavor ব্যবহার করে — কোনো mismatch risk নেই
- Build verify করা হয়েছে: `✓ built in 10.11s`, এবং `tsc --noEmit` এ touched files এ কোনো নতুন error নেই (repo তে আগে থেকেই কিছু unrelated pre-existing TS error আছে অন্য screens এ — HomeScreen/OrdersScreen/TrackingScreen/WishlistScreen, এইগুলা এই session এ touch করা হয়নি)

### Touched files:
- `src/screens/ProductScreen.tsx`
- `src/components/ProductCard.tsx`

### Commit:
- `e12b051` — feat: product card + lightbox tap-to-zoom (concept 2)

### এখনো Pending:
1. **Concept 2 (Product card + interaction polish)** — STATUS: **Done**
2. **Cart/Checkout simplify (all-ages easy)** — STATUS: Pending
3. **Typography + color system (brand feel)** — STATUS: Pending

### পরবর্তী Agent এর জন্য নোট:
- `ProductCard.tsx` এ `zoomed` state যোগ হয়েছে — grid এবং horizontal দুই variant এই আলাদা করে duplicate করা আছে (component এ কোনো shared sub-component নাই), future change এ দুই জায়গাতেই mirror করে দিতে হবে
- Lightbox zoom শুধু scale-transform (center-origin) — pan/drag-to-reposition করা হয়নি, ইচ্ছাকৃতভাবে simple রাখা হয়েছে (over-engineering এড়াতে)
- Product card এ weight/flavor selector এখনো যোগ হয়নি — যদি ভবিষ্যতে দরকার হয়, card width বাড়ানো লাগবে অথবা bottom-sheet quick-view বানাতে হবে

---

## Session: 2026-07-05 (update)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Concept 1 — HomeScreen/Browsing premium redesign

### কী হয়েছে:
- HomeScreen এ quick occasion/category row যোগ করা হলো (search bar এর ঠিক নিচে) — existing `categories` data (`lib/data.ts`) আর `OccasionIcon` component reuse করে, tap করলে category filter সহ Categories tab এ যায়
- Trending + Search results horizontal card row এ per-card stagger reveal animation যোগ করা হলো — existing `.delay-1` থেকে `.delay-5` CSS utility reuse করে (`STAGGER_DELAYS` constant)
- `View` type এ `categoryId?: string` optional field যোগ করা হলো (`lib/store.ts`) — এটা আগে থেকেই `CategoriesScreen.tsx` পড়ছিল কিন্তু কোথাও set হচ্ছিল না, এখন কাজ করছে
- Build verify করা হয়েছে: `✓ built in 17.62s`, push সফল

### Touched files:
- `src/screens/HomeScreen.tsx`
- `src/lib/store.ts`

### Commit:
- `7193aaa` — feat: home quick-category row + product card stagger animation

### এখনো Pending:
1. **HomeScreen/Browsing premium redesign** — STATUS: **Done** (এই session এ সম্পন্ন)
2. **Product card + interaction polish** — tap/zoom interaction, image feel, price/customize live feedback — STATUS: Pending
3. **Cart/Checkout simplify (all-ages easy)** — kom steps, boro button, shohoj bhasha — STATUS: Pending
4. **Typography + color system (brand feel)** — elegant serif accent + clean sans, raspberry/maroon + neutral consistent branding — STATUS: Pending

### পরবর্তী Agent এর জন্য নোট:
- Concept ১ এর quick-category row `categories` array (`lib/data.ts`) আর `OccasionIcon` (`components/OccasionIcon.tsx`) reuse করে বানানো — নতুন icon/data লাগেনি, দরকার হলে ঐগুলাই বাড়াও
- `View.tabs.categoryId` এখন optional field হিসেবে আছে — `CategoriesScreen.tsx` এই field read করে filter করে, future navigation এ এইটা ব্যবহার করা যাবে
- বাকি ৩টা concept (Product card polish, Cart/Checkout simplify, Typography/color system) — একটা একটা করে ধরতে হবে, পূর্ববর্তী entry (নিচে) এ scope detail আছে

---

## Session: 2026-07-05 (planning)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Planning only — no code changes this session

### কী হয়েছে:
- User এর সাথে আলোচনা করে app এর "premium cake shop experience" upgrade এর জন্য ৪টা concept ঠিক করা হয়েছে
- এখনো কোনো concept এ কাজ শুরু হয়নি — শুধু scope planning হয়েছে
- এই session এ AGENT_LOG.md প্রথমবার তৈরি করা হলো (আগে repo তে ছিল না)

### Touched files:
- (কোনো code file touch হয়নি — শুধু AGENT_LOG.md তৈরি)

### Commit:
- `7206967` — chore: init AGENT_LOG.md with 4 pending upgrade concepts

### এখনো Pending:
1. HomeScreen/Browsing premium redesign — STATUS: Pending
2. Product card + interaction polish — STATUS: Pending
3. Cart/Checkout simplify (all-ages easy) — STATUS: Pending
4. Typography + color system (brand feel) — STATUS: Pending

### পরবর্তী Agent এর জন্য নোট:
- এই ৪টা concept থেকে একটা একটা করে ধরতে হবে, scope mix করা যাবে না (protocol অনুযায়ী)
- User explicitly বলেছে: "premium, minimal, easy for all ages, boring না লাগে" — এই direction এ থেকে design decision নিতে হবে

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
