# Agent Log — BAS (Bake Art Style 2)

## Session: 2026-07-07 (Concept B — background canvas color + product card depth)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** User proposed two ideas: (A) move occasion row into a search-bar popup + enlarge banner, (B) product cards "না দেখা যাওয়া" (poor visual contrast) + trying a different background color. Both reviewed together in one report; user approved via "reviews tumi koro" and asked for a background-color opinion — this session implements **Concept B only** (Concept A — search popup — still pending, separate session).

### Root cause (from review):
`.glass-strong` card background (`#FFFFFF`→`#FFF8FA`) and page canvas (`--color-cream: #F9F9F7`) were nearly identical near-white tones, so ProductCard edges disappeared into the page — especially in the "Popular this week" row which has no `.mesh-warm` backdrop behind it. ProductCard also had no extra inline shadow (unlike the reorder ticket-stub card, which does and looks fine).

### কী হয়েছে:
1. **`src/index.css`** — `--color-cream` token `#F9F9F7` → `#F4EDE7` (warm linen, deliberately a shade deeper so white cards read as raised surfaces). Updated the 3 other hardcoded `#F9F9F7` spots that needed to match: `:root` background, `html, body` background, and `.mesh-warm`'s gradient fallback base.
2. **`src/components/ProductCard.tsx`** — added an explicit inline `boxShadow` to both the `grid` variant article and the horizontal (`Popular this week`) variant article — same treatment style as the reorder card (`HomeScreen.tsx` line ~483), scaled down slightly for these smaller cards. No layout, badge, or behavior changes.

### Build verify:
- `npm run build`: `✓ built in 10.08s`

### Touched files:
- `src/index.css`
- `src/components/ProductCard.tsx`
- `tasks/review-occasion-popup-and-card-contrast-070726.md` (review report, no code)

### Commit:
- (pending — user local এ ZIP apply করে push করবে)

### এখনো Pending:
- **Concept A (occasion → search popup + bigger banner)** — reviewed (see `tasks/review-occasion-popup-and-card-contrast-070726.md`, checks A1-A5) but not yet fixed. Needs: new prop on `SearchBar.tsx` for a trigger button, a new bottom-sheet component reusing the `NotificationsSheet.tsx` pattern, and a decision on exact new banner height once the occasion row is removed from the main flow.
- Since `bg-cream` is used in ~50+ places app-wide (inputs, modals, chat bubbles), the canvas change is global by design — user should eyeball a few other screens (AdminPanel forms, ChatBot) after applying, in case the deeper tone needs a touch more contrast tuning against `border-ink/10` inputs.

### পরবর্তী Agent এর জন্য নোট:
- New canvas hex is `#F4EDE7` — if user wants it lighter/darker later, this is the single token to change (`src/index.css` line ~23), it cascades everywhere via `--color-cream`.

---

**Repo:** https://github.com/ferdausfs/BAS
**Stack:** React 19 + TypeScript + Tailwind v4 + Vite + Zustand + Firebase/Firestore
**Deploy:** Cloudflare Pages — https://bas.umuhammadiswa.workers.dev
**Design tokens:** Fraunces serif (`font-display`), coral (`#E8526A`), blush, gold, ink, plum, sage — `@theme` directive in `src/index.css`

---

## Session: 2026-07-07 (follow-up — "still feels flat" after color pass)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Same-day follow-up. User sent a screenshot after applying the color-pass ZIP and said the page still felt flat overall (not any single specific area — picked "পুরো page-টাই overall flat লাগছে" when asked to narrow down).

### Root cause:
Occasion chips (`HomeScreen.tsx` occasion row) were the only visible element with **zero depth** — flat solid `c.color` square, no shadow, no gradient, no border — while every other surface on the page (SearchBar, `.glass-strong` cards, banner) already carries a layered shadow treatment. Adding 5 distinct hues didn't fix "premium feel" because the actual visual language gap was depth, not hue count.

### Fix:
- `src/screens/HomeScreen.tsx` — occasion chip background: flat `c.color` → `linear-gradient(160deg, c.color 0%, #FFFFFF 130%)` + tinted layered `box-shadow` (built from `c.fg` at low alpha, stronger when active/tapped) + 1px hairline border (`c.fg` at ~12% alpha). Same size/position/tap-lift animation — purely a depth/material change, no layout or behavior touched.

### Lesson captured (`tasks/lessons.md`):
"Premium" feedback after a color-only pass usually means depth is missing, not more hues — check the flat element's CSS against a working reference (`.glass-strong`, SearchBar's `shadow-[...]`) before adding color.

### Build verify:
- `tsc --noEmit`: 162 (unchanged, pre-existing only)
- `npm run build`: `✓ built in 9.84s`

### Touched files:
- `src/screens/HomeScreen.tsx`
- `tasks/todo.md`, `tasks/lessons.md` (session log only)

### Commit:
- (pending — user local এ ZIP apply করে push করবে)

### এখনো Pending:
- Reorder card (ticket-stub) didn't appear in the user's screenshot at all — likely no past order on that account/session, so that specific premium touch is currently unverified in the wild. Not actionable without a real order to test against; flagging for awareness only.

---

## Session: 2026-07-07 (Home screen premium color pass — implemented)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Implementing the previous planning session's approved plan (Occasion category color-coding, reorder card ticket-stub, banner wax-seal, product-card accent).

### Review findings before fixing (২টা জিনিস approved plan থেকে আলাদা ছিল, confirm করে নেওয়া হয়েছে):
- `HomeScreen.tsx`-এ occasion icon color আগে থেকেই category-driven ছিল না — শুধু background chip color category-specific হওয়ার প্ল্যান ছিল, icon glyph সবসময় hardcoded `#9A8E8E`(idle)/coral(tap) ছিল। **User confirm করেছে:** idle + tap দুটোই এখন category `fg` color ব্যবহার করবে।
- `ProductCard.tsx`-এ Best badge already gold ছিল (plan-এ ভুলভাবে ধরে নেওয়া হয়েছিল black/generic), আর "Fresh" নামে কোনো badge/field আদৌ নেই। User এই conflict-এ specific option না বেছে "log-এ যা প্ল্যান আছে সেটা করো" বলেছে — তাই সবচেয়ে minimal-impact interpretation নেওয়া হলো: Best/New badge system অপরিবর্তিত রেখে শুধু একটা পাতলা (3px) category-tint accent strip card-এর উপরে যোগ হয়েছে।

### কী হয়েছে:
1. **`src/types/index.ts`** — `Category` type-এ নতুন `fg: string` field যোগ।
2. **`src/lib/data.ts`** — ৫টা category-র color আলাদা করা হলো (আগে সব `#FFE2E7`):
   - Birthday: bg `#FFE4E9` / fg `#E8526A` (coral, অপরিবর্তিত identity color)
   - Anniversary: bg `#F5E7EC` / fg `#6E2A45` (plum)
   - Wedding: bg `rgba(200,148,74,0.16)` / fg `#C8944A` (gold — token আগে থেকেই ছিল)
   - Cupcakes: bg `#ECF1E9` / fg `#5F7556` (sage)
   - Custom: bg `#F3F1F1` / fg `#3D2D2C` (ink-500)
3. **`src/index.css`** — `@theme`-এ `--color-plum`/`--color-plum-tint` আর `--color-sage`/`--color-sage-tint` নতুন named token যোগ (আগের session-এর note অনুযায়ী raw hex না ছড়িয়ে)।
4. **`src/screens/HomeScreen.tsx`:**
   - Occasion row icon (idle + active উভয় state) এখন `c.fg` ব্যবহার করে (আগে hardcoded ink-200/coral ছিল)।
   - Reorder card ("Tap to reorder") এখন ticket-stub স্টাইল — উপরে gold→plum gradient accent strip (3px) + বাম/ডান পাশে page-bg (`var(--color-cream)`) রঙের perforation-notch cutout circle।
   - Banner carousel-এ ছোট "EST. 2018" wax-seal badge (coral radial-gradient circle, top-right, `z-30`, `pointer-events-none`) — carousel logic/dots/arrows/CTA অপরিবর্তিত।
5. **`src/components/ProductCard.tsx`** — নতুন `occasionAccent()` helper (`lib/data.ts`-এর `categories` থেকে `fg` lookup করে) দিয়ে card-এর উপরে ৩px accent strip (`grid` আর `horizontal` দুটো variant-এই) — Best/New badge system অপরিবর্তিত।

### Build verify:
- `tsc --noEmit`: touched files-এ error count আগে ও পরে **একই** (diff করে শুধু line-number shift, কোনো নতুন error নেই)।
- `npm run build`: `✓ built in 8.78s`।

### Touched files:
- `src/types/index.ts`
- `src/lib/data.ts`
- `src/index.css`
- `src/screens/HomeScreen.tsx`
- `src/components/ProductCard.tsx`
- `tasks/todo.md` (session log only)

### Commit:
- (pending — user local এ ZIP apply করে push করবে)

### এখনো Pending:
- কিছুই urgent না। ভবিষ্যতে সত্যিকারের "Fresh" badge concept চালু করতে হলে (cupcakes-এর জন্য নতুন product field), সেটা আলাদা deliberate session-এ করা উচিত।

### পরবর্তী Agent এর জন্য নোট:
- `occasionAccent()` helper `ProductCard.tsx`-এর top-এ আছে, `lib/data.ts`-এর `categories` array থেকে সরাসরি `fg` lookup করে — কোনো নতুন hardcoded color duplicate হয়নি।
- `plum`/`sage` এখন named CSS token (`--color-plum`, `--color-sage` + `-tint` variants) — raw hex আর ছড়ানো নেই।
- Category color-coding শুধু Home screen occasion row + ProductCard accent strip-এ প্রযোজ্য — `CategoriesScreen.tsx`-এর filter chip (`chip`/`chip-active` class) ইচ্ছাকৃতভাবে touch করা হয়নি (scope-এর বাইরে, ওখানে সবসময় coral active state)।

---

## Session: 2026-07-07 (Home screen premium color pass — planning only, no code yet)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Planning/review only — no code changes this session. Full review + Visualizer mockups approved; actual implementation done in the following session (see entry above).

### Review কী পাওয়া গেছে:
User complained Home screen ("What cake are we celebrating today?") premium লাগছে না। Full review-এ পাওয়া findings:
- **Real bug:** `src/lib/data.ts`-এর `categories` array — সব ৫টা occasion (Birthday/Anniversary/Wedding/Cupcakes/Custom)-এর `color` field হুবহু same hex (`#FFE2E7`)। এই কারণে Round 6-এ বানানো per-category zoom-transition color system আসলে কাজেই লাগছে না — সব chip দেখতে carbon-copy লাগে।
- Reorder card ("Rose Garden +6 more") একদম flat সাদা row — OrdersScreen-এর ticket-stub/ribbon premium treatment-এর সাথে inconsistent।
- Occasion icon row generic delivery-app category-row টেমপ্লেটের মতো লাগে (flat outline icon + solid pastel square)।
- Banner card-এ কোনো BAS-নির্দিষ্ট signature touch নেই।
- User আরও বলেছে: পুরো app এখন "শুধু পিংক" (coral/blush family) — monotonous লাগছে, আরেকটু attractive করতে অন্য color add করা যায় কিনা।

### Approved direction (২টা Visualizer mockup দেখানো হয়েছে, দ্বিতীয়টা approved):
- **Occasion category color-coding (meaning অনুযায়ী, rainbow না):**
  - Birthday → coral (`#E8526A` on `#FFE4E9`) — energetic, brand-primary অপরিবর্তিত
  - Anniversary → deep plum/wine (`#6E2A45` on `#F5E7EC`) — romantic
  - Wedding → gold (`#C8944A` on `rgba(200,148,74,0.16)`) — luxury/elegant
  - Cupcakes → sage green (`#5F7556` on `#ECF1E9`) — fresh/ingredient feel
  - Custom → neutral ink (`#3D2D2C` on `#F3F1F1`) — blank-canvas concept
- **Reorder card:** OrdersScreen-স্টাইল ticket-stub — top accent strip gold→plum gradient (`linear-gradient(90deg,#C8944A,#6E2A45)`) + left/right perforation notch (14px circle, page-bg color cutout)।
- **Trending card badges:** category-অনুযায়ী color ("Best" = plum tint/text, "New" = gold tint/text, "Fresh" = sage tint/text) — আগে সব black/generic tag ছিল।
- **Banner:** ছোট "Est. 2018" wax-seal style badge (coral-gradient circle, top-right corner) — signature touch, purely decorative, existing carousel logic/dots/arrows অপরিবর্তিত।
- **Explicitly NOT changing:** primary hero elements (search bar, greeting text, "Popular this week"/section eyebরo, CTA buttons) থাকবে coral — নতুন color শুধু category-differentiation আর accent badge-এ ব্যবহার হবে, pure identity color হিসেবে coral-ই থাকছে।

### Touched files this session:
- `AGENT_LOG.md` (log only, কোনো source code touch হয়নি)

### Commit:
- (pending — implemented in following session, see entry above)

### এখনো Pending (পরবর্তী session-এর কাজ):
- সবকিছু implement হয়ে গেছে পরের session-এ (উপরের entry দেখুন), except badge-color-mapping — সেটা conflict থাকায় minimal accent-strip approach-এ redirect করা হয়েছে।

### পরবর্তী Agent এর জন্য নোট:
- নতুন color token হিসেবে plum (`#6E2A45`/tint `#F5E7EC`) আর sage (`#5F7556`/tint `#ECF1E9`) এই session-এ প্রথম প্রস্তাবিত হয় — পরের session-এ `index.css`-এ named token আকারে যোগ হয়েছে।
- User-এর explicit constraint: primary brand identity (coral) সরানো/dilute করা যাবে না — নতুন color শুধু secondary/category-differentiation role-এ, coral এখনো app-এর প্রধান accent থাকবে।
- Mockup reference (এই চ্যাটেই বানানো, repo-তে file আকারে সেভ করা হয়নি): `bas_home_multicolor_mockup` — approved version। আগের `bas_home_premium_fullpass_mockup` (single-color coral+gold version) rejected হয়েছে user-এর "আরও color add করা যায়?" feedback-এর কারণে।

---

## Session: 2026-07-06 (Round 6 — Home occasion-row zoom transition)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Home screen occasion row — matched user's approved mockup (`bas_home_banner_occasion_transition_mockup.html`): bottom-nav-style icon coloring + zoom-in page transition into Categories, plus a thinner promo banner.

### কী হয়েছে:
- **New global transition primitive:** `useUI` store-এ `occasionZoom` state + `setOccasionZoom` action যোগ হলো (`top/left/width/height/radius/color/stage`)। নতুন `src/components/OccasionZoomOverlay.tsx` component App root-এ (fixed, `z-[200]`) render হয় — এটা HomeScreen-এর বাইরে থাকে বলে screen swap-এর মাঝেও animation টিকে থাকে (HomeScreen unmount হয়ে গেলেও timers/global store চলতেই থাকে)।
- **HomeScreen occasion tap flow (`openOccasion`):** ট্যাপ করা chip-এর `getBoundingClientRect()` capture → overlay ঐ exact position/size/color-এ বসে (`stage:'start'`) → ২৬০ms পরে fullscreen-এ grow করে (৬৮০ms, cubic-bezier) → grow শেষে `go({tab:'categories', categoryId})` কল হয় + overlay fade শুরু (৩০০ms) → শেষে state clear। Mockup-এর exact timing (260/680/300ms) মেনে করা হয়েছে।
- **Occasion icon color/motion — bottom nav-এর সাথে ভাষা মিলিয়ে:** আগে icon সবসময় coral ছিল; এখন default `#9A8E8E` (ink-200, BottomTabBar-এর inactive color-এর সাথে exact match) আর tap হলে coral (`#E8526A`) + lift (`translate3d(0,-4px,0) scale(.92)`) + drop-shadow — ঠিক `BottomTabBar.tsx`-এর active-tab treatment-এর মতো।
- **`OccasionIcon` component:** নতুন optional `style` prop যোগ হলো (আগে শুধু `className` নিতো, তাই dynamic color/transform পাঠানো যেতো না) — `CSSProperties` import করে `common` object-এ spread করা হয়েছে।
- **Banner thinner করা হলো:** `aspect-[16/9]` → `aspect-[2.5/1]` (mockup-এর ~2.55/1-এর কাছাকাছি), carousel logic/dots/arrows অপরিবর্তিত।
- Build verify: `✓ built in 10.15s`। `tsc --noEmit` error count অপরিবর্তিত (১৬২টা, সব pre-existing — কোনো নতুন error touched files-এ যোগ হয়নি, diff করে confirm করা হয়েছে)।

### Touched files:
- `src/lib/store.ts`
- `src/App.tsx`
- `src/components/OccasionZoomOverlay.tsx` (new)
- `src/components/OccasionIcon.tsx`
- `src/screens/HomeScreen.tsx`

### Commit:
- (pending — user local এ ZIP apply করে push করবে: `bas-home-occasion-zoom-transition-070626.zip`)

### এখনো Pending:
- Mockup-এ category screen-টা ছিল শুধু একটা simplified demo (২টা static card) — এখানে real `CategoriesScreen.tsx` already exists এবং `categoryId` prop নেয়, তাই সেটা touch করা হয়নি, শুধু transition-টাই যোগ হয়েছে।

### পরবর্তী Agent এর জন্য নোট:
- `occasionZoom` overlay `z-[200]` এ বসে — `BottomTabBar` (`z-[100]`) আর অন্য সব fixed layer-এর উপরে থাকে ইচ্ছাকৃতভাবে, যাতে transition চলাকালীন কিছু bleed through না করে।
- Timing constants (`GROW_DELAY=260`, `GROW_DURATION=680`) HomeScreen.tsx-এর `openOccasion`-এর ঠিক উপরে — future adjust করতে হলে এখানেই।
- এই একই `occasionZoom` primitive future-এ অন্য কোনো icon-tap-to-fullscreen transition-এও reuse করা যাবে (শুধু rect + color পাঠালেই হবে)।

---

## Session: 2026-07-06 (Round 5 — ProductScreen premium/accessibility pass)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** `src/screens/ProductScreen.tsx` — premium-feel + all-ages accessibility improvements, one real bug fix

### Review cycle followed:
User bola "product screen niya function niya sontosto na, r o premium r o unique, sokol boyoser jonno smooth hote hobe." Full review report (in-chat, not a repo file) covered 8 checks; user approved a mockup (Visualizer) first, then approved the coral/card-style direction, then approved applying it to real code.

### কী হয়েছে:
- **Bug fix:** Reviews section-এ একটা duplicate wrapper `<div className="px-5 mt-6 pb-4">` ছিল যেটা ভেতরের `<section>`-এর সাথে identical padding/margin repeat করছিল (double horizontal padding + double top margin) — outer div সরিয়ে শুধু `<section>` রাখা হয়েছে, matching closing tag-ও সরানো হয়েছে।
- **Quantity stepper** যোগ হলো (নতুন `quantity` state) — আগে সবসময় `quantity: 1` hardcoded ছিল, cart-এ গিয়ে adjust করতে হতো। এখন Size selector-এর নিচে একটা নতুন "Quantity" section-এ −/+ button (44×44px, coral accent on +), `handleAdd()`-এর দুটো branch-এই hardcoded `1` এর বদলে state ব্যবহার হচ্ছে। Sticky bottom CTA-র Total এখন `total * quantity` দেখায়, quantity > 1 হলে meta line-এ `×N` যোগ হয়।
- **Weight preset chips** (weight-based/per-unit priced products-এর জন্য) — নতুন `WEIGHT_PRESETS = ['0.5','1','1.5','2']` constant, 4-col grid button আগে দেখানো হয় (500g/1kg/1.5kg/2kg style), তারপর manual number input থাকে override হিসেবে নিচে। আগে শুধু raw number input ছিল — decimal type করা elderly/less tech-savvy user-দের জন্য কঠিন ছিল।
- **Tap target বৃদ্ধি:** flavor chip (`py-2` → `py-2.5` + `min-h-[44px]`), add-on row `p-3` থেকে `min-h-[56px]`, নতুন quantity buttons সরাসরি ৪৪×৪৪px।
- **Font size bump (secondary/meta text):** ১০–১২.৫px range-এর অনেক জায়গায় ১২.৫–১৪px এ upgrade — flavor chip label, size-selector subtitle, weight error/hint text, static weight chip price/label, add-on name/price, sticky-bottom Total label ও meta line।
- **Add-on icons:** `ADDONS` array-তে প্রতি item-এ `icon` field যোগ (Flame/MessageSquare/Gift/UtensilsCrossed from lucide-react), প্রতিটা add-on row-এ এখন একটা 36×36px coral-tinted (active) বা ink-tinted (inactive) icon circle দেখায় — Cart-এর emoji→Lucide-icon fix (আগের session)-এর সাথে visual language match করানো হলো।
- Build verify: `✓ built in 8.77s`। `tsc --noEmit` error count অপরিবর্তিত (১৬২টা, সব pre-existing), `ProductScreen.tsx`-এ কোনো নতুন error নেই।

### Touched files:
- `src/screens/ProductScreen.tsx`

### Commit:
- (pending — user local এ ZIP apply করে push করবে: `bas-product-screen-premium-070626.zip`)

### এখনো Pending (deliberately not done this cycle, scope-mixing এড়াতে):
- Reviews section "see all" / pagination (5-এর বেশি review invisible, `reviews.slice(0, 5)`)
- Related/upsell products section after Reviews (page currently dead-ends after reviews)
- User দুইটা alternative "more minimal" mockup দেখেছিল (ink-monochrome accent) কিন্তু শেষে original coral card-style-ই approve করেছে — future agent যেন এই minimal direction আবার নিজে থেকে propose না করে, যদি না explicitly চাওয়া হয়।

### পরবর্তী Agent এর জন্য নোট:
- `WEIGHT_PRESETS` constant top-level, `ADDONS`-এর ঠিক নিচে — নতুন preset যোগ করতে হলে এখানে।
- `quantity` state শুধু ProductScreen-local; Cart-এর quantity edit logic আগে থেকেই ছিল, touched হয়নি — এটা শুধু প্রথমবার `add()`-এ কী quantity পাঠানো হচ্ছে সেটা বদলেছে।
- Total display এখন `total * quantity` — ভবিষ্যতে অন্য কোথাও per-unit `total` reuse করলে quantity multiply মনে রাখতে হবে যাতে double-count না হয়।

---

## Session: 2026-07-06 (Round 4 — ChatBot image upload for reference cakes)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** `src/components/ChatBot.tsx` — user এখন chat-এ reference cake ছবি পাঠাতে পারবে

### কী হয়েছে:
- `Message` interface-এ optional `image?: string` (Cloudinary URL) যোগ হলো।
- Input bar-এ নতুন 📷 (Camera icon) বাটন — চাপলে hidden `<input type="file" accept="image/*">` trigger করে।
- Image select হলে client-side validation (শুধু image type, max ৮MB), তারপর `uploadToCloudinary(file, 'bake-art-style/chat-references')` দিয়ে upload — এই helper আগে থেকেই ছিল (`src/lib/firebase.ts`), product/gallery/review/payment-screenshot upload-এ যেভাবে ব্যবহার হয় ঠিক সেভাবেই reuse করা হয়েছে, নতুন কোনো Cloudinary config লাগেনি।
- Upload চলাকালীন "ছবি পাঠানো হচ্ছে..." spinner bubble দেখায়, সফল হলে user bubble-এ thumbnail (max-height ১৬০px, rounded) + bot একটা acknowledgment reply দেয় (রেফারেন্স রাখা হয়েছে, Customize/WhatsApp-এ mention করতে বলে)।
- Upload fail বা invalid file হলে ছোট red error text input bar-এর উপরে দেখায়, chat bubble-এ কিছু যোগ হয় না।
- এই scope-এ bot নিজে থেকে ছবি বুঝে respond করে না (কোনো AI vision analysis না) — শুধু visual reference store/acknowledge করা হয়। Gemini-কে image পাঠানো এই cycle-এ করা হয়নি (future scope হলে আলাদা)।
- Build verify: `✓ built in 13.65s`। `tsc --noEmit` error count অপরিবর্তিত (১৬২টা, সব pre-existing), `ChatBot.tsx`-এ কোনো নতুন error নেই।

### Touched files:
- `src/components/ChatBot.tsx`

### Commit:
- (pending — user local এ ZIP apply করে push করবে: `bas-chatbot-image-upload-070626.zip`)

### এখনো Pending:
- **Admin panel-এ chat history (two-way reply, Option 2)** — এই session-এর পরের অংশে আলাদা ZIP-এ করা হবে (বড় feature, নিজস্ব review cycle প্রয়োজন)।

### পরবর্তী Agent এর জন্য নোট:
- Chat image message local-only (localStorage-based history-তেই save হয়, Firestore-এ না) — Admin chat-history feature implement করার সময় এই image field-ও Firestore doc-এ carry করতে হবে যদি admin-কে reference ছবি দেখাতে হয়।
- `uploadToCloudinary` folder convention অনুসরণ করা হয়েছে: `bake-art-style/chat-references` (অন্যান্য upload-এর মতোই `bake-art-style/{feature}` pattern)।

---

## Session: 2026-07-06 (Round 3 — ChatBot intent-matching gaps, 5 new intents)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** `src/components/ChatBot.tsx` rule-based intent matching — fixed screenshot bug ("kintu ami to payment koresi" got generic payment-process reply) + 4 more common online-store complaint intents

### বাগ রিপোর্ট (screenshot দিয়ে):
User লিখেছিল "kintu ami to payment koresi" (আমি তো payment করে ফেলেছি) — bot generic `paymentText()` (payment process explanation) দিয়েছিল, যেটা ভুল উত্তর কারণ user process জানতে চাইছিল না, already করে ফেলা payment নিয়ে বলছিল।

### Root cause:
`ruleBasedReply()`-এর price/payment keyword block (`payment`, `taka`, `bkash` ইত্যাদি) শুধু topic-level keyword ধরে, completed-action ("koresi", "diyechi") বনাম process-question ("kivabe", "koto") আলাদা করে না — ফলে দুটোই একই generic response পায়।

### একটা পূর্ণ Review Report (`CHATBOT-INTENT-REVIEW.md`) বানিয়ে ৬টা check করা হয়েছিল, user সবগুলো approve করেছে:

### কী হয়েছে (৫টা নতুন intent যোগ হলো, `paymentText()`-এর keyword block-এর আগে/আশেপাশে বসানো হয়েছে যাতে overlapping keyword-এ আগে match করে):
- **Payment already done** (screenshot bug): নতুন `paymentDoneText()` হেল্পার — "payment/taka/bkash" + "koresi/diyechi/already/hoye gese" ইত্যাদি combo ধরে, generic process বলার বদলে user-এর real latest order status দেখায় + verify-তে সময় লাগতে পারে বলে + WhatsApp fallback দেয়।
- **Delivery delay complaint** ("deri hocche", "ashe nai" ইত্যাদি): আগে generic zone/delivery-estimate text পেত, এখন real order status + empathy line + support link দেখায়।
- **Wrong/damaged item complaint** ("vul cake", "damage", "নষ্ট", "vanga" ইত্যাদি): আগে কোনো intent-ই ছিল না, fallback ("হুম বুঝলাম না") এ পড়ে যেত — এখন সরাসরি sympathetic message + support link।
- **Promo code not working** ("promo/discount/code" + "kaj korche na/hocche na/invalid"): আগে generic payment info পেত, এখন promo-specific answer (active থাকলে spelling-check suggestion, না থাকলে জানিয়ে দেওয়া)।
- **Cancel-request vs cancel-reason split**: "cancel korte chai / cancel korbo" (future, নিজে cancel করতে চাওয়া) এখন আলাদা branch — আগের cancel/refund block (যেটা assume করতো order already cancelled) ভুল context দিচ্ছিল এই ক্ষেত্রে।
- Build verify: `✓ built in 12.81s`। `tsc --noEmit` error count আগে/পরে অপরিবর্তিত (১৬২টা, সব pre-existing) — stash করে diff confirm করা হয়েছে।

### Touched files:
- `src/components/ChatBot.tsx`

### Commit:
- (pending — user local এ ZIP apply করে push করবে: `bas-chatbot-intent-fixes-070626.zip`)

### এখনো Pending:
- User আরও দুইটা feature চেয়েছে যেগুলো ইচ্ছাকৃতভাবে এই cycle-এ মেশানো হয়নি (scope-mixing এড়াতে), **পরবর্তী দুই আলাদা cycle-এ (review→approve→fix) করতে হবে:**
  1. **ChatBot-এ image upload** (রেফারেন্স cake ছবির জন্য) — Cloudinary integration লাগবে, message type বদলাতে হবে (`Message` interface-এ শুধু `text` আছে, image support নেই)।
  2. **Chat history AdminPanel-এর Orders-এ visible করা** (admin আগে থেকে conversation পড়ে সরাসরি কথা বলতে পারে) — এটা বড় architecture change: এখন chat শুধু per-device `localStorage`-এ থাকে (`chatHistoryKey()` ফাংশন দেখুন, line ~23), কোনো Firestore sync নেই। Admin থেকে দেখতে হলে chat messages Firestore-এ order-এর সাথে persist করতে হবে + Firestore rules বদলাতে হবে + `AdminPanel.tsx`-এ নতুন UI section লাগবে।

### পরবর্তী Agent এর জন্য নোট:
- নতুন intent block-গুলো keyword-overlap এড়াতে **নির্দিষ্ট ক্রমে বসানো হয়েছে** — যেমন `paymentDoneText()` intent অবশ্যই generic `paymentText()` price/payment block-এর **আগে** থাকতে হবে (নাহলে "payment" শব্দ generic block-এ আগেই match করে ফেলবে)। একইভাবে নতুন "cancel korte chai" future-intent block পুরনো cancel/refund block-এর আগে বসানো হয়েছে। ভবিষ্যতে নতুন intent যোগ করার সময় এই ordering-sensitivity মাথায় রাখতে হবে।
- `has()` ফাংশন word-boundary-aware, কিন্তু শুধু literal token/phrase match করে — Bangla word-এর suffix-variation (যেমন "পাঠিয়েছি" এর ভেতরে "পাঠ") ধরবে না। তাই keyword list-এ পুরো common variation গুলো আলাদা করে লিখতে হয়, prefix ধরে নেওয়া যাবে না।
- Review report `CHATBOT-INTENT-REVIEW.md` repo root-এ যোগ করা হয়েছে ইতিহাস হিসেবে রাখার জন্য।

---

## Session: 2026-07-06 (Round 2 — Chatbot modal broken, OrdersScreen cancelled display)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Fixed non-functional support/chat buttons; fixed OrdersScreen showing "Placed" for cancelled orders

### বাগ রিপোর্ট (screenshot দিয়ে):
1. Tracking screen-এ "সাপোর্ট" (cancelled card-এর ভেতরে) এবং "সাহায্য দরকার?" (floating) — দুটো বাটনই ক্লিক করলে কিছু হতো না।
2. OrdersScreen-এ cancelled order badge "PLACED" দেখাচ্ছিল (ভুল), আর cancelled order-এও "Order again" বাটন থেকে যাচ্ছিল।

### Root cause:
1. `ChatBot.tsx`-এ `if (!embedded) return null;` — non-embedded (global) mode কখনো বাস্তবে implement হয়নি। `TrackingScreen.tsx`-এর বাটনগুলো ঠিকই `setChatOpen(true)` কল করছিল (store-এ state ঠিকই বদলাচ্ছিল), কিন্তু কোথাও global `chatOpen` শুনে `<ChatBot>` mount করা হতো না — তাই click করলে state বদলালেও কোনো UI render হতো না।
2. `OrdersScreen.tsx`-এর `STATUSES` array-তে `'cancelled'` স্ট্যাটাসটাই নেই — `STATUSES.findIndex(s => s.key === o.status)` cancelled order-এর জন্য `-1` রিটার্ন করতো, আর `STATUSES[currentIdx]?.label || 'Placed'` fallback করে "Placed" দেখাতো।

### কী হয়েছে:
- **`ChatBot.tsx`:** `!embedded` মোডে এখন global `chatOpen`/`setChatOpen` (useUI) ব্যবহার করে full-screen modal (backdrop + header-এ close ✕ বাটন) হিসেবে render হয়। `embedded` mode (ProfileScreen-এর ভেতরের inline panel) অপরিবর্তিত।
- **`App.tsx`:** root level-এ global `<ChatBot />` (non-embedded) mount করা হয়েছে — এখন থেকে যেকোনো screen থেকে `setChatOpen(true)` কল করলেই chat modal খুলবে।
- **`OrdersScreen.tsx`:** cancelled order-এর জন্য —
  - Badge এখন সঠিকভাবে "Cancelled" (লাল) দেখায়, "Placed" fallback হয় না
  - পুরো progress bar + ৬-step timeline hide হয়ে যায়, বদলে একটা লাল "অর্ডার বাতিল হয়েছে" card দেখায় (cancelReason থাকলে সেটাও দেখায়)
  - "Order again" বাটন সরিয়ে দেওয়া হয়েছে, শুধু single full-width লাল "Track order" বাটন থাকে
  - Non-cancelled orders-এর জন্য আগের UI (progress bar, ৬-step, দুইটা side-by-side বাটন) অপরিবর্তিত
- Build verify: `✓ built in 8.40s`। `tsc --noEmit` error বৃদ্ধি (18→22) শুধু pre-existing loosely-typed `safeArray`/`o: unknown` pattern-এর বেশি occurrence (নতুন `o.cancelReason` reference-এর কারণে) — কোনো নতুন category-র error না, build ঠিকই pass করেছে।

### Touched files:
- `src/components/ChatBot.tsx`
- `src/App.tsx`
- `src/screens/OrdersScreen.tsx`

### Commit:
- (pending — user local এ ZIP apply করে push করবে: `bas-chatbot-modal-orders-cancelled-070626.zip`)

### এখনো Pending:
- কিছু না

### পরবর্তী Agent এর জন্য নোট:
- `ChatBot` কম্পোনেন্ট এখন দুই মোডে কাজ করে: `<ChatBot embedded />` (ProfileScreen-এর ভেতরে inline, সবসময় visible) এবং `<ChatBot />` (global, `chatOpen` state দিয়ে toggle হওয়া full-screen modal, `App.tsx`-এ mount করা)। নতুন কোনো screen থেকে chat খুলতে চাইলে শুধু `useUI().setChatOpen(true)` কল করলেই হবে — আলাদা করে `<ChatBot>` mount করার দরকার নেই, `App.tsx`-এর global instance-ই কাজ করবে।
- `OrdersScreen.tsx`/`TrackingScreen.tsx` দুই জায়গাতেই এখন cancelled order-এর জন্য একই pattern: timeline/progress hide, single red action button, `cancelReason` দেখানো। ভবিষ্যতে cancelled UI বদলাতে হলে দুই ফাইলেই consistency রাখা উচিত।

---

## Session: 2026-07-06 (Order cancel-reason modal, cancelled-tracking cleanup, chatbot cancel awareness)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Admin order cancellation now requires a reason; customer-facing tracking + chatbot surface that reason

### কী হয়েছে:
- **`Order.cancelReason?: string`** যোগ হলো (`types/index.ts`), Firestore-এ `cancel_reason` field হিসেবে map হয় (`firestoreMappers.ts` — `mapOrderDoc`/`orderToDoc` দুই দিকেই)।
- **Admin cancel flow বদলে গেছে:** আগে status dropdown/quick-button-এ "Cancelled" ক্লিক করলেই সাথে সাথে cancel হয়ে যেত। এখন `AdminPanel.tsx`-এ `requestStatusChange(o, status)` intercept করে — status `cancelled` হলে সরাসরি `updateStatus` না ডেকে একটা modal খোলে (preset reason chips + custom textarea, `cancelReasonInput` state)। "বাতিল নিশ্চিত করুন" চাপলে তবেই `updateStatus(id, 'cancelled', reason)` কল হয় (button reason খালি থাকলে disabled)। WhatsApp customer লিংকেও (`waLink`) cancelled অবস্থায় reason auto-include হয়।
- **`updateStatus`/`setOrderStatus` এখন optional 3rd param `reason` নেয়** (`useOrders.ts`, `store.ts`) — local state-এ order-এ `cancelReason` বসে, Firestore doc-এ `cancel_reason` লেখা হয়, আর wallet-refund notification-এর পাশাপাশি একটা `❌ Order cancelled` notification-ও reason সহ যোগ হয়।
- **`TrackingScreen.tsx`:**
  - Cancelled card-এ এখন `cancelReason` থাকলে "কারণ: ..." লাইন দেখায়।
  - **পুরো ৬-step "LIVE STATUS" timeline এখন cancelled order-এ hide** — `match.status !== 'cancelled'` দিয়ে পুরো block wrap করা হয়েছে, শুধু cancelled card-ই দেখা যায়।
  - **Duplicate floating "সাহায্য দরকার?" বাটন** এখন cancelled-এও hide হয় (আগে শুধু `delivered`-এ hide হতো) — কারণ cancelled card-এর ভেতরেই নিজস্ব "সাপোর্ট" বাটন আছে, দুইটা একই কাজ করছিল।
- **`ChatBot.tsx`:** cancel/refund intent match হলে এখন user-এর সবচেয়ে recent cancelled order খুঁজে বের করে exact `cancelReason` বলে দেয় (admin যা লিখেছিল), reason না থাকলে আগের generic support-redirect fallback থাকে। `orderStatusText()`-এও (নির্দিষ্ট order ID জিজ্ঞেস করলে) cancelled হলে reason line যোগ হয়েছে। WhatsApp bottom bar আগে থেকেই ছিল (human-agent hand-off), নতুন কিছু বানানো লাগেনি।
- Build verify: `✓ built in 6.61s`। `tsc --noEmit` error count touched files-এ পরিবর্তনের আগে/পরে সমান (২৪টা) — সব pre-existing (loosely-typed hooks, unrelated pre-existing `Product` type mismatch ইত্যাদি), নতুন কোনো error যোগ হয়নি (stash করে diff করে confirm করা হয়েছে)।

### Touched files:
- `src/types/index.ts`
- `src/lib/firestoreMappers.ts`
- `src/lib/store.ts`
- `src/hooks/useOrders.ts`
- `src/components/AdminPanel.tsx`
- `src/screens/TrackingScreen.tsx`
- `src/components/ChatBot.tsx`

### Commit:
- (pending — user local এ ZIP apply করে push করবে: `bas-cancel-reason-tracking-chatbot-070626.zip`)

### এখনো Pending:
- কিছু না, এই feature সম্পূর্ণ

### পরবর্তী Agent এর জন্য নোট:
- Cancel reason চাওয়া মানেই এখন `updateStatus(id, status, reason?)` — 3rd param শুধু `cancelled`-এর জন্যই মানে রাখে, অন্য status-এ পাস করলে কোনো effect নেই (harmless)।
- `AdminPanel.tsx`-এ কখনো সরাসরি `updateStatus(o.id, s)` কল না করে `requestStatusChange(o, s)` ব্যবহার করা উচিত (dropdown আর quick-buttons দুই জায়গাতেই) — নাহলে cancel modal bypass হয়ে যাবে।
- `TrackingScreen.tsx`-এ timeline-এর ভেতরের `match.status !== 'delivered' && match.status !== 'cancelled'` চেক সরিয়ে শুধু `!== 'delivered'` করা হয়েছে, কারণ বাইরের block-ই ইতিমধ্যে `cancelled` বাদ দিয়ে দেয় (TS narrowing এই duplicate check-এ TS2367 error দিচ্ছিল)।

---

## Session: 2026-07-06 (OrdersScreen premium redesign — ticket-style card, expandable items, side-by-side buttons)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** `src/screens/OrdersScreen.tsx` visual premium pass

### কী হয়েছে:
- User চেয়েছিল: "+N more items" ক্লিক করলে full order details দেখাবে, "Open tracking"/"Order Again" বাটন পাশাপাশি (নিচে নিচে না), আর overall আরো premium দেখাক
- **Expandable items:** `useState<Set<string>>` দিয়ে per-order expand state track করা হয় (`expanded` set-এ order.id থাকলে expanded)। আগে item list hard-coded `slice(0, 2)` ছিল — এখন `+N more items` বাটনে ক্লিক করলে (ChevronDown/ChevronUp সহ) পুরো item list দেখায়, আবার ক্লিক করলে "Show less" হয়ে ফিরে যায়
- **বাটন side-by-side:** "Open tracking" আর "Order Again" আগে stacked (`mt-3`/`mt-2` দিয়ে দুইটা আলাদা full-width বাটন) ছিল, এখন `grid grid-cols-2 gap-2` দিয়ে পাশাপাশি — "Track order" (outline style) আর "Order again" (solid ink)
- **Premium visual touches (নতুন, brand token-এর মধ্যেই থেকে — কোনো off-brand রং যোগ করা হয়নি):**
  - প্রতিটা order card-এর উপরে ৩px coral→gold gradient accent strip (wax-seal ribbon এর মতো)
  - Header-এ total-এর নিচে ছোট status pill/chip (Delivered হলে ink-tinted + checkmark, বাকি সব coral-tinted) — বিস্তারিত progress bar দেখার আগেই এক নজরে status বোঝা যায়
  - Item thumbnail ৪৮px থেকে ৫৬px করা হলো, subtle ring border যোগ
  - Item list আর progress section-এর মাঝে dashed "ticket-stub" perforation divider (বেকারির order-slip/receipt vibe)
  - Progress bar পুরোপুরি redesign: আগে প্রতি step-এর জন্য আলাদা আলাদা segment bar ছিল, এখন একটাই continuous track + coral→gold gradient fill যেটা progress percentage অনুযায়ী animate করে (`transition-all duration-700`)। Current active step-এর icon-এ `.anim-ring` (আগে থেকেই index.css-এ থাকা pulseRing keyframe) দিয়ে pulsing halo — "tracked live" copy-র সাথে মানানসই। Past step vs current step visually আলাদা করা হয়েছে (আগে সব done step একই রকম দেখাতো)
- Build verify করা হয়েছে: `✓ built in 10.03s`। `tsc --noEmit`-এ কিছু `TS18046 'o'/'it' is of type unknown` error আছে কিন্তু এগুলো **pre-existing** (এই screen-এর আগে থেকেই loosely-typed `useOrdersHook()` return value-র কারণে, AGENT_LOG-এর আগের entry-তেও উল্লেখ আছে এই screen-এ pre-existing error ignore করার কথা) — নতুন কোনো error টাইপ যোগ হয়নি।

### Touched files:
- `src/screens/OrdersScreen.tsx`

### Commit:
- (pending — user local এ ZIP apply করে push করবে: `bas-orders-premium-redesign-070626.zip`)

### এখনো Pending:
- কিছু না, এই feature সম্পূর্ণ

### পরবর্তী Agent এর জন্য নোট:
- Ticket-stub perforation effect ইচ্ছাকৃতভাবে simple রাখা হয়েছে (শুধু dashed border, কোনো cutout/notch circle না) — কারণ card-এর background `glass-strong` (translucent blur), তাই cutout circle বানাতে গেলে outer page background-এর সাথে exact রং মেলাতে হতো, যেটা background পরিবর্তন হলেই ভেঙে যেত। ভবিষ্যতে যদি সত্যিকারের cutout notch দরকার হয়, page-এর actual bg color/gradient জেনে সেটার সাথে match করে বানাতে হবে।
- `.anim-ring` class আগে থেকেই `index.css`-এ ছিল (pulseRing keyframe) কিন্তু কোথাও ব্যবহৃত হচ্ছিল না — এখানেই প্রথম ব্যবহার হলো। ভবিষ্যতে অন্য "live"/"active" indicator দরকার হলে এই একই class reuse করা যাবে।
- Brand-এ শুধু coral/blush/cream/ink/gold টোকেন আছে (`src/index.css` দ্রষ্টব্য) — future status-color কাজে (যেমন multi-color status badges) নতুন off-brand রং (নীল/সবুজ) যোগ করার আগে এই constraint মাথায় রাখা উচিত; এই session-এ ইচ্ছাকৃতভাবে শুধু বিদ্যমান ২টা accent (coral+gold) দিয়েই কাজ করা হয়েছে।

---

## Session: 2026-07-06 (Phone OTP + Email magic-link + Facebook gated as "coming soon")
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Login overhaul — Phone OTP, Email magic-link (passwordless), Facebook button UX fix, visual polish

### কী হয়েছে:
- **Facebook button "coming soon" gating:** Facebook App এখনো Business Verification/Publish process এ থাকায়, customer রা "Continue with Facebook" চাপলে Facebook-এর নিজের raw error page ("Sorry, something went wrong") দেখতো — খারাপ experience। `AuthSheet.tsx`-এ একটা `FACEBOOK_LOGIN_LIVE = false` constant যোগ করা হলো — false থাকলে বাটনের বদলে dashed-border disabled state দেখায় "Facebook — শীঘ্রই আসছে"। **App Publish হয়ে গেলে শুধু এই constant `true` করে দিলেই আসল বাটন ফিরে আসবে** — কোনো বড় change লাগবে না।
- **Phone OTP login (নতুন):** `useAuth.ts`-এ Firebase `RecaptchaVerifier` (invisible) + `signInWithPhoneNumber` দিয়ে `sendPhoneOtp(phoneNumber, containerId)` আর `confirmPhoneOtp(confirmation, code)` যোগ হলো। `AuthSheet.tsx`-এ নতুন "Phone" method tab — Bangladesh number ফরম্যাট (`01XXXXXXXXX` → `+8801XXXXXXXXX`, `toE164Bangladesh()` helper দিয়ে validate) → OTP পাঠানো → ৬-ডিজিট verify screen। Invisible reCAPTCHA mount point (`<div id="auth-recaptcha-container" />`) সবসময় DOM-এ থাকে (conditionally render করা যাবে না, reCAPTCHA-র জন্য দরকার)।
  - **⚠️ গুরুত্বপূর্ণ constraint:** Firebase Console-এর screenshot অনুযায়ী নতুন project-এ **SMS quota দিনে ১০টা** (billing account যোগ না করা পর্যন্ত)। বেশি testing/customer traffic হলে এই quota শেষ হয়ে গিয়ে OTP পাঠানো বন্ধ হয়ে যাবে — তখন Firebase Console-এ billing account (Blaze plan, pay-as-you-go) যোগ করতে হবে।
- **Email magic-link login (নতুন, password ছাড়া):** সত্যিকারের ৬-ডিজিট email OTP এর জন্য Cloud Function + email-sending service (SendGrid/Mailgun ইত্যাদি) লাগতো — এই project-এ এখনো কোনো Cloud Functions/backend নাই (শুধু Firestore + client), তাই সেটা নতুন infra হতো। এর বদলে Firebase-এর নিজস্ব **passwordless email link** (magic link) ব্যবহার করা হলো — কোনো backend/Blaze plan লাগে না, Firebase নিজেই email পাঠায়। `useAuth.ts`-এ `sendMagicLink(email)` (Firebase `sendSignInLinkToEmail`) আর app load-এ automatic completion (Firebase `isSignInWithEmailLink`/`signInWithEmailLink`, `useAuth`-এর mount effect-এ, module-level `magicLinkChecked` flag দিয়ে guard করা যাতে একাধিক component-এ `useAuth()` call হলেও link একবারই consume হয়)। Link-এ ক্লিক করলে account না থাকলে **automatically তৈরি হয়ে যায়** (Firebase-এর built-in behavior)।
  - Email method-এর ভেতরে password login-এর নিচে "Password ছাড়া, email-এ login link পাঠান" লিংক — click করলে magic-link mode-এ toggle হয়, back button দিয়ে password mode-এ ফেরত যাওয়া যায়।
- **UI polish ("premium" touch):** Header title-এ `font-display` (Fraunces serif, বাকি app-এর brand token অনুযায়ী) যোগ করা হলো, বাটনগুলোতে subtle shadow + `active:scale-[0.98]` press animation, input focus-এ smooth transition। বড় redesign না করে existing coral/ink brand system-এর মধ্যেই refine করা হয়েছে।
- Build verify করা হয়েছে: `✓ built in 10.09s`, `tsc --noEmit`-এ `AuthSheet.tsx`/`useAuth.ts`-এ কোনো error নেই।

### Touched files:
- `src/hooks/useAuth.ts`
- `src/components/AuthSheet.tsx`

### Commit:
- (pending — user local এ ZIP apply করে push করবে: `bas-phone-otp-magiclink-login-070626.zip`)

### এখনো Pending:
- **Firebase Console → Authentication → Settings → Authorized domains** এ deploy domain (`bas.umuhammadiswa.workers.dev`) যোগ করা আছে কিনা confirm করা — Google login already কাজ করছে মানে সম্ভবত আগে থেকেই আছে, কিন্তু magic-link এই একই check-এর উপর নির্ভর করে, তাই যদি link পাঠাতে গিয়ে `auth/unauthorized-continue-uri` error আসে, এই list-এ domain যোগ করতে হবে
- SMS quota (দিনে ১০টা) শেষ হলে Firebase billing (Blaze plan) enable করা লাগবে
- Facebook App Business Verification/Publish শেষ হলে `AuthSheet.tsx`-এর `FACEBOOK_LOGIN_LIVE` constant `true` করে দেওয়া

### পরবর্তী Agent এর জন্য নোট:
- `FACEBOOK_LOGIN_LIVE` constant — `AuthSheet.tsx`-এর টপে, Facebook button আসল না placeholder দেখাবে সেটা control করে। App Publish হওয়ার আগে এটা true করলে customer রা আবার broken Facebook error page দেখবে।
- Phone আর magic-link দুটোই `mapFirebaseUser()` reuse করে (Google/Facebook/email-password-এর মতোই), তাই profile hydration, referral reward auto-claim ইত্যাদি সব provider-এই এক পথেই কাজ করে — নতুন provider যোগ করলে এই pattern-ই follow করা উচিত।
- `auth-recaptcha-container` div-টা conditionally render করা যাবে না (এমনকি phone method select না করলেও DOM-এ থাকতে হবে) — RecaptchaVerifier lazily মাউন্ট হয় শুধু `sendPhoneOtp()` কল হওয়ার সময়, কিন্তু container আগে থেকেই থাকা লাগবে।

---

## Session: 2026-07-05 (Privacy Policy page — for Facebook App publish requirement)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Static Privacy Policy page, needed to publish/go-Live the Facebook App used for Facebook Login

### কী হয়েছে:
- Facebook App এখনো "Unpublished" (Development mode) থাকায়, App owner ছাড়া অন্য কেউ (customer) "Continue with Facebook" দিয়ে login করতে গেলে **"App not active"** error পাচ্ছিল
- App-কে **Live/Publish** করার জন্য Facebook Basic Settings-এ একটা **Privacy Policy URL** বাধ্যতামূলক — সেটার জন্য নতুন static page বানানো হলো: `public/privacy-policy.html`
- **কেন `public/` folder এ:** এই repo `vite-plugin-singlefile` দিয়ে main app bundle একটা `index.html`-এ inline করে, কিন্তু `public/` folder-এর যেকোনো file build-এর সময় হুবহু `dist/` root-এ copy হয় (singlefile plugin শুধু main entry bundle-কে touch করে) — তাই `privacy-policy.html` আলাদা static page হিসেবে ঠিকভাবে কাজ করবে, deploy হওয়ার পর URL হবে: `https://bas.umuhammadiswa.workers.dev/privacy-policy.html`
- Page-এ যা আছে: কী তথ্য সংগ্রহ করা হয় (নাম/ফোন/ঠিকানা/GPS/email, Facebook Login profile+email, payment screenshot), কীভাবে ব্যবহার হয়, কোথায় store হয় (Firebase/Firestore/Cloudinary), কার সাথে share হয় (delivery staff, service provider — বিক্রি করা হয় না), এবং **Data Deletion Instructions** section (`#data-deletion` anchor) — এটা Facebook Login ব্যবহারকারী app-এর জন্য বাধ্যতামূলক requirement (ব্যবহারকারী কীভাবে account/data deletion request করবে তার instructions, callback URL ছাড়াই এই instructions-page approach acceptable)
- **⚠️ Placeholder আছে, পূরণ করতে হবে:** page-এর মধ্যে দুই জায়গায় `[আপনার business phone number বসান]` আর `[আপনার email/phone বসান]` লেখা আছে — real contact info দিয়ে বদলে নিতে হবে (raw HTML edit করে, বা future session-এ চাইলে বলবেন করে দিব)। Facebook Page link-ও `href="#"` বসানো আছে, real Facebook Page URL দিয়ে বদলাতে হবে।
- Build verify করা হয়েছে: `✓ built in 15.23s`, `dist/privacy-policy.html` ঠিকভাবে static file হিসেবে output-এ আছে confirm করা হয়েছে

### Touched files:
- `public/privacy-policy.html` (নতুন file)

### Commit:
- (pending — user local এ ZIP apply করে push করবে: `bas-privacy-policy-070526.zip`)

### এখনো Pending:
- Placeholder contact info (`[আপনার business phone number বসান]`, `[আপনার email/phone বসান]`, Facebook Page link) real তথ্য দিয়ে replace করা
- Facebook App → Basic Settings → Privacy Policy URL ফিল্ডে `https://bas.umuhammadiswa.workers.dev/privacy-policy.html` বসিয়ে App Publish/Live করা
- App Live করার পরেও App Icon + Category select করা লাগতে পারে Basic Settings-এ (Facebook require করে)

### পরবর্তী Agent এর জন্য নোট:
- `public/` folder-এ নতুন static HTML page যোগ করলে Vite build-এ automatically `dist/` root এ চলে যায় — কোনো router config লাগে না, `vite-plugin-singlefile` শুধু main SPA bundle কে touch করে। ভবিষ্যতে Terms of Service বা অন্য static legal page লাগলে এই একই pattern follow করা যাবে।

---

## Session: 2026-07-05 (Facebook login added — Firebase auth)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Facebook sign-in alongside existing Google sign-in

### কী হয়েছে:
- User এর app-এ আগে থেকেই Google login ছিল, এখন Facebook login-ও যোগ করতে চেয়েছিল
- `src/hooks/useAuth.ts`: `firebase/auth` থেকে `FacebookAuthProvider` import করা হলো, নতুন `signInWithFacebook()` function যোগ হলো — `signInWithGoogle()` এর মতোই pattern (`signInWithPopup` + `mapFirebaseUser()` দিয়ে profile hydration reuse)। Hook-এর return object-এ `signInWithFacebook` যোগ করা হলো
- `src/components/AuthSheet.tsx`: `signInWithFacebook` destructure করা হলো, `handleFacebook()` handler যোগ (Google-এর প্যাটার্নে, error হলে toast দেখায়)। Google বাটনের ঠিক নিচে "Continue with Facebook" বাটন যোগ (inline SVG Facebook "f" logo, `lucide-react`-এ brand icon নেই তাই custom SVG ব্যবহার করা হয়েছে)
- **এখনো বাকি (code-এর বাইরে, user কে নিজে করতে হবে):**
  1. `developers.facebook.com`-এ একটা Facebook App তৈরি করে "Facebook Login" product যোগ করা, App ID + App Secret নেওয়া (user-কে জানানো হয়েছে যে এই portal Android phone browser-এ ভালো কাজ করে না — iPad/PC/desktop browser লাগবে এই একটা ধাপের জন্য)
  2. Firebase Console → Authentication → Sign-in method → Facebook enable করে ওই App ID/Secret বসানো, আর Firebase যে OAuth redirect URI দিবে সেটা ফেরত Facebook App-এর settings-এ বসানো
  3. এই দুটো ধাপ complete না হলে "Continue with Facebook" বাটনে click করলে Firebase error দিবে (provider not enabled) — এটা normal, code ঠিক আছে
- Build verify করা হয়েছে: `✓ built in 9.63s`, `useAuth.ts`/`AuthSheet.tsx`-এ কোনো নতুন TS error নেই

### Touched files:
- `src/hooks/useAuth.ts`
- `src/components/AuthSheet.tsx`

### Commit:
- (pending — user local এ ZIP apply করে push করবে: `bas-facebook-login-070526.zip`)

### এখনো Pending:
- Firebase Console-এ Facebook provider enable করা (user এর কাজ, কোনো code লাগবে না)
- Facebook App review/business verification (যদি ভবিষ্যতে public users-এর জন্য প্রয়োজন হয় Meta-র policy অনুযায়ী — dev mode-এ শুধু test users দিয়ে login test করা যাবে সেটা ছাড়াই)

### পরবর্তী Agent এর জন্য নোট:
- `signInWithFacebook` ঠিক `signInWithGoogle`-এর মতোই কাজ করে — নতুন কোনো social provider (Apple, Twitter ইত্যাদি) যোগ করতে চাইলে এই একই pattern follow করা যাবে (Firebase provider class + `signInWithPopup` + `mapFirebaseUser`)
- App ID/Secret কোথাও code-এ hardcode করা হয়নি — এটা সম্পূর্ণ Firebase Console side-এ configure হয়, তাই এই commit deploy হলেও provider enable না করা পর্যন্ত বাটন কাজ করবে না (expected, bug না)

---

## Session: 2026-07-05 (Checkout reorder + 2-part advance payment)
**Agent/Tool:** Claude (claude.ai)
**Feature worked on:** Checkout step reorder (ঠিকানা → নিশ্চিত → পেমেন্ট) + advance/remaining payment split

### কী হয়েছে:
- User request: checkout-এর step order বদলে address → confirm(review) → payment করা, আর payment step-এ নতুন logic যোগ করা — cake production শুরুর জন্য মোট টাকার ১/৩ অংশ অগ্রিম (advance) দিতে হবে, এবং এই অগ্রিম **সবসময় online (bKash/Nagad)** হতে হবে (Cash on Delivery option advance-এ নেই)। বাকি ২/৩ টাকা customer ইচ্ছামতো Cash on Delivery বা online দিয়ে ডেলিভারির সময় দিতে পারবে, এবং তার জন্য checkout-এ কোনো screenshot লাগবে না (শুধু advance-এর screenshot মাস্ট)।
- **Step reorder (`CheckoutScreen.tsx`):** Header stepper label বদলে `['ঠিকানা', 'নিশ্চিত', 'পেমেন্ট']` করা হলো। `step 1` (আগে payment ছিল) এখন **confirm/review** — Gift toggle + Wallet/Promo/Referral extras + delivery address/time recap + Bill (subtotal/delivery/discount/total সহ নতুন "অগ্রিম" ও "বাকি" row)। `step 2` (আগে review ছিল) এখন **payment** — advance section + remaining section, আর submit (`handleSubmit`) এই step থেকেই হয়।
- **Advance/remaining calculation:** `advanceAmount = Math.ceil(total / 3)` (নিকটতম ৳১ এ round up, যাতে advance কখনো কম না হয়), `remainingAmount = total - advanceAmount`।
- **Advance payment section (step 2):** নতুন `ADVANCE_METHODS` constant (`PAYMENT_METHODS` থেকে `cash` বাদ দিয়ে) — শুধু bKash/Nagad দেখায়। নতুন `advancePayment` state (default `'bkash'`)। Screenshot upload (আগে থেকেই থাকা `paymentScreenshotFile`/`paymentScreenshotPreview` state reuse করা হয়েছে, এখন conceptually এটা advance-এর proof) — এখন **সবসময় mandatory** (আগে শুধু non-cash হলে লাগতো, এখন cash option-ই নেই advance-এ)।
- **Remaining payment section (step 2):** পুরনো payment method selector (`form.payment`, সব ৩টা method: bKash/Nagad/Cash) এখানে move করা হয়েছে — এটা এখন "বাকি টাকা কীভাবে দিবেন" বোঝায়, screenshot লাগে না।
- **Validation:** `validatePaymentStep()` ও `handleSubmit()` এর screenshot check বদলে সবসময় mandatory করা হলো (cash branch বাদ দেওয়া হলো, যেহেতু advance আর কখনো cash হয় না)। Sticky footer CTA-তে step 2-তে "অগ্রিম দিন" label + advance amount দেখায় (আগে "পেমেন্ট" + total দেখাতো), আর submit button `paymentScreenshotFile` না থাকলে disabled থাকে।
- **Data model (`types/index.ts`):** `Order` type-এ নতুন optional fields: `advancePayment?: 'bkash' | 'nagad'`, `advanceAmount?: number`, `remainingAmount?: number`। পুরনো `payment` field এখন conceptually "remaining/final payment method" বোঝায় (backward-compatible, কোনো existing code ভাঙেনি)। `paymentScreenshot` field এখনো advance-এর proof হিসেবে ব্যবহৃত হয় (field rename করা হয়নি, শুধু comment দিয়ে clarify করা হয়েছে)। `DbOrder` interface-এও mirror করে `advance_payment`/`advance_amount`/`remaining_amount` যোগ করা হলো (ভবিষ্যতে দরকার হতে পারে, Firestore schema-less বলে migration লাগেনি)।
- **`AdminPanel.tsx`:** Order card-এ advance/remaining breakdown দেখানো হচ্ছে (amount + method দুটোই)। CSV export-এ ৩টা নতুন column যোগ (Advance Amount/Advance Method/Remaining Amount)। "Payment proof" বাটন relabel করে "Advance proof" করা হলো (clarity)।
- **`ChatBot.tsx` (BAS assistant) — user explicitly চেয়েছিল Order Tracking-এর "সাহায্য দরকার?" বাটনে (যেটা আগে থেকেই ChatBot খোলে, `TrackingScreen.tsx` লাইন ২৮৪-২৯৪) BAS যেন নতুন payment system সম্পর্কে জানে:**
  - `paymentText()` (rule-based reply, payment/bkash/nagad/cash keyword এ trigger হয়) নতুন ২-ধাপ payment ব্যাখ্যা করে rewrite করা হলো
  - `appGuideText()` এর payment bullet আপডেট
  - `orderText()` এর step 5 আপডেট (আগে ছিল "Payment select করে order confirm করুন", এখন advance/screenshot উল্লেখ করে)
  - Gemini `systemPrompt` (AI fallback path)-এর Store info payment line আপডেট, যাতে rule-based match না হলেও AI সঠিক info দেয়
- Build verify করা হয়েছে: `✓ built in 6.81s`। `tsc --noEmit`-এ `CheckoutScreen.tsx`/`AdminPanel.tsx`/`ChatBot.tsx`/`types/index.ts`-এ কোনো নতুন error নেই — শুধু pre-existing error (HomeScreen/OrdersScreen/TrackingScreen/WishlistScreen-এ আগে থেকে থাকা unrelated TS error, CheckoutScreen-এর `Phone` unused-import warning, AdminPanel-এর `approveReview` unused + কিছু `unknown` type warning) — এগুলো এই session-এ touch হয়নি।

### Touched files:
- `src/screens/CheckoutScreen.tsx`
- `src/types/index.ts`
- `src/components/AdminPanel.tsx`
- `src/components/ChatBot.tsx`

### Commit:
- `a2b91c7` — feat: checkout reorder + 2-part advance payment (1/3 online, rest flexible)

### এখনো Pending:
- Concept 1-4 (Home/Product-card/Cart-Checkout/Typography) — সব আগেই Done ছিল
- **Checkout reorder + advance payment — STATUS: Done, pushed & deployed (এই session)**

### পরবর্তী Agent এর জন্য নোট:
- `form.payment` field এখন **"remaining/final payment method"** বোঝায় (bKash/Nagad/Cash সবগুলোই valid), আর নতুন `advancePayment` state (শুধু bKash/Nagad) হলো **advance/production payment method**। এই দুটো field গুলিয়ে ফেলবেন না — `Order.payment` ≠ advance, `Order.advancePayment` = advance।
- `paymentScreenshotFile`/`paymentScreenshotPreview` state (এবং `Order.paymentScreenshot` field) এখন conceptually **advance-এর proof**, remaining-এর জন্য কোনো screenshot নেই — field rename করা হয়নি backward-compat এর জন্য, শুধু comment এ clarify করা আছে।
- Advance amount round হয় `Math.ceil(total / 3)` দিয়ে (নিকটতম ৳১, ছোট taka-ও advance-এ যোগ হয়ে যায় যাতে remaining short না হয়)। এটা user-approved default; ভবিষ্যতে round-to-৳১০ বা অন্য rule দরকার হলে এই একলাইন বদলালেই হবে।
- Checkout step index এখন: **0 = ঠিকানা, 1 = নিশ্চিত (review+extras+gift+bill), 2 = পেমেন্ট (advance+remaining, submit এখানেই হয়)** — আগে ছিল 0=ঠিকানা, 1=পেমেন্ট, 2=নিশ্চিত। ভবিষ্যতে `goToStep()`/`EditButton` reference যোগ করার সময় এই নতুন index মনে রাখা দরকার।
- ChatBot-এর payment knowledge (rule-based + Gemini system prompt দুটোই) আপডেট করা হয়েছে — ভবিষ্যতে advance fraction (১/৩) বা logic বদলালে এই টেক্সটগুলোও sync রাখতে হবে, নাহলে BAS পুরনো তথ্য বলবে।

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
