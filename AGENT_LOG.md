## Session: 2026-07-03, 12:17 (PLAN — full-app glassmorphism theme, next agent shuru koro ekhan theke) — PENDING, work not yet done
**Agent/Tool:** Claude (Sonnet 5, in-chat, direct repo access via git clone)
**Feature worked on:** User চায় পুরো app-e glass morphism feel ("bakery display case" direction) — review complete, plan approved by user, code change এখনো শুরু হয়নি

### Design direction (user-approved):
- Dark iOS Control Center style glass **না** — brand-এর cream + coral-pink identity রেখেই light frosted glass ("কেকের display case এর কাচ" feel)
- Cream (`#FFF8F3`/brand-50) + coral (`#E8526A`/brand-500) ধরে রাখা, শুধু glass alpha/blur tune করা
- Signature element: BottomTabBar কে floating detached frosted pill বানানো (iOS control-center মতো) — সবচেয়ে বেশি চোখে পড়বে

### Review findings (root cause confirmed):

**1. Global backdrop mobile-এ screen content-এর পেছনে নাই — HIGH priority, foundation**
- File: `src/components/PhoneFrame.tsx:15` (outer wrapper has `mesh-warm` class) vs `PhoneFrame.tsx:28` (inner screen content sits on flat `bg-cream`)
- `mesh-warm` gradient def: `src/index.css:223-229` (soft blush radial gradient, looks good)
- Problem: mobile view (`className="relative h-[100dvh] overflow-hidden md:hidden"`, PhoneFrame.tsx ~line 33) renders children directly inside the `bg-cream` solid div, NOT on top of `mesh-warm` — so on real phones (main use case) glass panels blur a flat solid color, not the mesh gradient. Desktop bezel view does show mesh but only around the phone frame, not behind content.
- **Fix direction:** bring `mesh-warm` (or a screen-appropriate variant) behind the actual scrollable content on mobile too — e.g. remove/lighten the intermediate solid `bg-cream` layer or make it semi-transparent so mesh shows through, OR add mesh backdrop at each screen's root instead of relying on PhoneFrame.

**2. Glass token system exists but unstructured — HIGH priority**
- File: `src/index.css:179-207`
- Existing tokens (all already have real backdrop-filter, don't break these): `.glass` (rgba 255,255,255,0.82 / blur 20px), `.glass-strong` (rgba 255,255,255,0.68 / blur 28px, border rgba(255,255,255,.65) — already tuned last session, don't re-lower), `.glass-dark` (rgba(20,18,19,.55) / blur 24px), `.glass-tint` (var(--tint) / blur 24px, has `isolation:isolate` — keep this, needed for backdrop-filter to sample correctly)
- **Fix direction:** rename/restructure into a clear 3-tier system: `glass-subtle` (nav/header, most transparent), `glass-strong` (cards/modals — already close to right, keep alpha ~0.68), `glass-deep` (bottom sheets, slightly more opaque for legibility, ~0.80-0.85). Add consistent `1px solid rgba(255,255,255,.4)` border + soft lift shadow to all tiers for "glass edge" feel. Don't touch `.glass-tint`'s `isolation:isolate` mechanism — reuse the pattern for new tiers if needed.

**3. Coverage — only 7/20 files use any glass class — MEDIUM/LOW priority, later batches**
- Currently using glass: `HomeScreen.tsx`, `ProductScreen.tsx`, `ProfileScreen.tsx`, `ProductCard.tsx`, `AdminPanel.tsx`, `NotificationsSheet.tsx`, `AuthSheet.tsx`
- NOT using glass yet (148 raw `bg-white` occurrences across these): `CartScreen.tsx`, `CheckoutScreen.tsx`, `CategoriesScreen.tsx`, `CustomizeScreen.tsx`, `OrdersScreen.tsx`, `SuccessScreen.tsx`, `TrackingScreen.tsx`, `WishlistScreen.tsx`, `BottomTabBar.tsx`, `Header.tsx`
- Brand colors reference (don't guess, use these): `tailwind.config.ts` — `brand.50` #FFF9EC (ivory bg), `brand.100` #FFF4F6 (blush panel), `brand.500` #E8526A (primary coral), `gold.DEFAULT` #C8944A

### Approved rollout plan (execute ONE batch at a time — review→fix→ZIP→verify build→push each, per AGENT-WORKFLOW-PROTOCOL.md — user explicitly wants no batching of untested changes):

1. **Foundation** — fix mesh backdrop visibility on mobile (`PhoneFrame.tsx`) + restructure/rename glass tokens (`index.css`) into `glass-subtle`/`glass-strong`/`glass-deep`
2. **Navigation** — `BottomTabBar.tsx` → floating detached frosted pill (signature element, most visible change) + `Header.tsx` → glass
3. **Screens** — extend glass to remaining 8 screens one at a time (CartScreen, CheckoutScreen, CategoriesScreen, CustomizeScreen, OrdersScreen, SuccessScreen, TrackingScreen, WishlistScreen)
4. **Cards/chips** — smaller polish pass (ProductCard price chip, cart line items, badges)

### এখনো Pending:
- **সবকিছু** — এই session-এ শুধু review + plan হয়েছে, কোনো code change হয়নি, কোনো commit নাই।
- পরবর্তী agent সরাসরি ধাপ 1 (Foundation) দিয়ে শুরু করবে — user কে আবার জিজ্ঞেস করার দরকার নাই "কোথা থেকে শুরু করবো", প্ল্যান এখানেই confirmed।

### পরবর্তী Agent এর জন্য নোট:
- User explicitly বলেছে: dark/black iOS glass না, cream+coral bakery identity বজায় রাখতে হবে।
- `.glass-strong` এর opacity আগেই 96%→68% এ tune হয়ে গেছে (আগের session) — আবার lower করার দরকার নাই, শুধু rename/restructure বিবেচনা করো।
- `.glass-tint` এর `isolation:isolate` + `will-change:backdrop-filter` mechanism ভাঙবে না — এটা backdrop-filter সঠিকভাবে কাজ করার জন্য জরুরি ছিল।
- Foundation ধাপ শেষ না করে Navigation/Screens ধাপে যাওয়া যাবে না — mesh backdrop ঠিক না থাকলে বাকি সব glass flat-ই দেখাবে।

---

## Session: 2026-07-03 (user screenshot follow-up — gallery data bug, Checkout Profile GPS, product image lightbox)
**Agent/Tool:** Claude (Sonnet 5, in-chat, direct repo access via git clone)
**Feature worked on:** User reported (via screenshots) "Checkout Profile" modal missing GPS button + multi-image swipe still not showing any images. Diagnosed both, fixed both, then added a requested fullscreen image lightbox.

### কী হয়েছে:
1. **Real root cause of "multi-image swipe never works" found (previous session's fix #1 only fixed the touch-listener race condition, not this):** `src/lib/firestoreMappers.ts` → `mapProductDoc()` never read the `gallery` field from Firestore docs at all, even though `productToDoc()` (save direction) always wrote it correctly. So Admin-uploaded gallery images were persisted fine but never came back down to the frontend — `product.gallery` was always `undefined`, so `galleryImages.length` was always 1 (no dots, no thumbnails, nothing to swipe to). Fixed: added `gallery: Array.isArray(d?.gallery) ? d.gallery : []` to the mapper. Existing products with previously-saved gallery images should now show them without re-uploading.
2. **GPS button missing in "Checkout Profile" modal:** This is a *separate* modal from the Address Book modal fixed last session — `customerOpen` state, `draftProfile` form, ~`src/screens/ProfileScreen.tsx:648`. Added the same GPS pattern (geolocation + Nominatim reverse-geocode + `BD_DISTRICTS` match) as a new `handleLocateProfile()` writing to `draftProfile` instead of `addrForm`.
3. **New: fullscreen image lightbox on ProductScreen (user-requested, not a bug fix):** Tapping the hero image now opens a fullscreen dark overlay (`lightboxOpen` state). If the product has a gallery, supports swipe (touch handlers directly on the lightbox image container, no native-listener ref hacks needed since it's not inside a scrollable page), left/right arrow buttons, and dot indicators — same gallery data (`galleryImages`/`activeIndex`/`currentImg`) as the existing hero/thumbnail strip.

### Touched files:
- `src/lib/firestoreMappers.ts`
- `src/screens/ProfileScreen.tsx`
- `src/screens/ProductScreen.tsx`

### Build:
- ✓ built in 10.00s (gallery mapping + profile GPS) / ✓ built in 17.59s (lightbox)

### Commits:
- `f756b42` — fix: gallery images never loaded from Firestore (mapProductDoc missing field) + GPS button in Checkout Profile modal
- `2df8712` — feat: fullscreen image lightbox on ProductScreen — tap to open, swipe/arrows/dots for gallery

### এখনো Pending:
- None reported as of this entry.

### পরবর্তী Agent এর জন্য নোট:
- There are now **two separate address-entry forms** with GPS buttons: Address Book modal (`showAddressModal`/`addrForm`/`handleLocateAddress`) and Checkout Profile modal (`customerOpen`/`draftProfile`/`handleLocateProfile`). They're intentionally separate state — don't try to merge them without user request.
- If any *other* screen reads `product.gallery` and still shows only 1 image after this fix, check whether that specific product actually has gallery URLs saved in Firestore (Admin → product edit → Additional Images) — the mapping bug is fixed, but products with no gallery uploaded will still correctly show only the main image.

---

## Session: 2026-07-03 (all 3 diagnosed bugs fixed — plan below fully executed)
**Agent/Tool:** Claude (Sonnet 5, in-chat, direct repo access via git clone)
**Feature worked on:** Fix #1, #2, #3 from the plan in the entry directly below — all done, build-verified, pushed one at a time per AGENT-WORKFLOW-PROTOCOL.md

### কী হয়েছে:
- **Fix #1 (ProductScreen swipe race condition):** `useEffect` dependency changed from `[]` to `[product?.id]` so touch listeners attach on the render where the hero div actually exists (after async product load). Verified live in repo — comment at `src/screens/ProductScreen.tsx:42` confirms.
- **Fix #2 (glass-strong opacity):** `src/index.css` — `.glass-strong` background alpha lowered from 0.96 to 0.68 so `backdrop-filter: blur(28px)` has translucency to actually blur, across all 9 usage sites (Home, Profile ×4, AdminPanel, NotificationsSheet, AuthSheet ×2).
- **Fix #3 (Address Book modal — ProfileScreen.tsx):** All labels/placeholders translated to Bengali matching CheckoutScreen's wording; added "বর্তমান অবস্থান ব্যবহার করুন" GPS button reusing CheckoutScreen's geolocation + Nominatim reverse-geocode + BD_DISTRICTS match pattern (manual entry still works as fallback); district field changed from free-text to `BD_DISTRICTS` `<select>`; input styling upgraded from `bg-cream border-ink/10` to Checkout's `bg-white border-ink-50` + coral focus ring for visual consistency.

### Touched files:
- `src/screens/ProductScreen.tsx` (fix #1, prior to this log entry)
- `src/index.css` (fix #2)
- `src/screens/ProfileScreen.tsx` (fix #3)

### Build:
- ✓ built in 18.54s (fix #2) / ✓ built in 17.82s (fix #3)

### Commits:
- `6bd1c98` — fix: glass-strong was 96% opaque, defeating backdrop-blur — lowered to 68% for real frosted-glass effect
- `84fc8e4` — fix: address book modal — Bengali labels, GPS auto-fill, Checkout-matching input styling
- (fix #1 commit hash not captured in this session's visible log — verify via `git log -p -- src/screens/ProductScreen.tsx` if needed)

### এখনো Pending:
- None from this diagnosed list. All 3 items from the plan entry below are complete.

### পরবর্তী Agent এর জন্য নোট:
- The plan entry immediately below this one is now historical — its 3 items are done, don't re-diagnose or re-fix them.
- No new bugs reported by user as of this entry.

---

## Session: 2026-07-03 (PLAN — next agent shuru koro ekhan theke) — PENDING, work not yet done
**Agent/Tool:** Claude (Sonnet 5, in-chat, direct repo access via git clone)
**Feature worked on:** 3 diagnosed bugs from user screenshot review — NOT YET FIXED

### Diagnosed problems (review complete, root cause confirmed, fix pending):

**1. ProductScreen image swipe never works — race condition bug**
- File: `src/screens/ProductScreen.tsx`
- Touch listeners (`onStart`/`onMove`/`onEnd`) attach via `useEffect(() => {...}, [])` — empty deps, runs once on mount only, reading `heroRef.current`.
- `product` loads async (Firestore). On first render `product` is `null` → early-return branch fires (`if (!product) return (...)`, ~line 140) → hero image div (with `ref={heroRef}`) never mounts on that first render → effect runs with `heroRef.current === null` → `if (!el) return` exits immediately → listeners never attach.
- When `product` data arrives and hero div finally renders, the effect does NOT re-run (empty deps array) — so listeners are permanently never attached in the common async-load case.
- **Fix direction:** change effect dependency array to re-run when the ref actually has a value / when `product?.id` becomes available — e.g. `}, [product?.id]);` or a callback-ref pattern so listeners attach on the render where the div actually exists.

**2. "Glass" effect looks like flat solid panel, not iOS frosted glass — app-wide**
- File: `src/index.css`, class `.glass-strong` (~line 185)
- `background: rgba(255,255,255,0.96)` — 96% opaque. `backdrop-filter: blur(28px)` is applied but has almost nothing translucent to blur — reads as solid white.
- Used in **9 places across 5 files**: `HomeScreen.tsx` (1), `ProfileScreen.tsx` (4 — includes Address book + Special Dates modals), `AdminPanel.tsx` (1), `NotificationsSheet.tsx` (1), `AuthSheet.tsx` (2).
- This is the main reason "GLASS morphism full app e koro" request didn't produce a visible effect anywhere `.glass-strong` is used.
- **Fix direction:** lower the background alpha meaningfully (e.g. ~0.55–0.65 range, similar to `.glass-tint`'s tuned 0.55) so blur is actually visible, test each of the 9 usage sites for text-legibility after the change (don't break readability).

**3. Address Book modal (ProfileScreen.tsx, ~line 726) — language mismatch + no GPS + generic form styling**
- All labels English ("LABEL (E.G. HOME, OFFICE)", "FULL ADDRESS", "DISTRICT", "PHONE") while Checkout Profile section (`CheckoutScreen.tsx`) uses Bengali for the same conceptual fields — inconsistent within the same app.
- No GPS-based address entry — manual-only. `LocationGate.tsx` already has a working pattern (`navigator.geolocation.getCurrentPosition` + Nominatim reverse-geocode + zone match) that can be reused for a "Use GPS" button to auto-fill address + district.
- Plain generic input styling (`bg-cream border-ink/10`) — functional but doesn't carry the same visual polish as ProductScreen.
- **Fix direction:** rewrite labels to Bengali matching CheckoutScreen's wording, add "📍 GPS দিয়ে ঠিকানা বসান" button reusing LocationGate's geolocation+reverse-geocode logic (user can still edit manually after), keep manual entry as fallback/override.

### Plan for execution (one at a time, review→fix→ZIP→verify build→push, per AGENT-WORKFLOW-PROTOCOL.md):
1. Fix #1 (swipe race condition) — isolated, low risk
2. Fix #2 (glass-strong opacity) — CSS-only, check all 9 usage sites for legibility
3. Fix #3 (Address book Bengali + GPS + polish) — larger, touches ProfileScreen.tsx

### পরবর্তী Agent এর জন্য নোট:
- User has requested NO more bugs — verify build after every single change before moving to the next fix, do not batch untested changes.
- Do not touch unrelated code. Do not re-diagnose these 3 issues — root cause is already confirmed above, go straight to fix + verify.

---

## Session: 2026-07-03 (continued — blush shade consolidation)
**Agent/Tool:** Claude (Sonnet 5, in-chat, direct repo access via git clone)
**Feature worked on:** Color token consistency, part 2

### কী হয়েছে:
- `LocationGate.tsx`: blush gradient (`#fff0f3`/`#ffe4ec`/`#ffd6e7`) replaced with same brand-100/200/300 tokens used across Home/Wishlist/Success screens
- `AdminPanel.tsx`: default banner color placeholder aligned from `#FFE2E7` to exact `#FFE4E9` token

### Build:
- ✓ built in 21.29s

### Commit:
- `ec44bfc` — fix: align blush background shades to unified brand tokens

### পরবর্তী Agent এর জন্য নোট:
- Font system checked and found already correct — `.font-display` (Fraunces) consistently used across 18+ files for headings; `.font-brand` (Great Vibes script) intentionally limited to Home/Splash/Header hero moments only. No action needed there.
- Color token consolidation is now largely complete. Any remaining "doesn't feel premium" feedback should be diagnosed screen-by-screen from live visual feedback, not assumed to be a token issue.

---

# Agent Log — BAS (Bake Art Style 2)

## Session: 2026-07-03 (Repo cleanup + brand color fix)
**Agent/Tool:** Claude (Sonnet 5, in-chat, direct repo access via git clone)
**Feature worked on:** Repo hygiene cleanup + brand identity color fix

### কী হয়েছে:
1. Removed nested `BAS/BAS/` duplicate copy (64MB, stale — old ZIP apply mistake)
2. Removed committed binary ZIP, dead scripts (`fix.js`, `fix-cart.js`, `fix-merge.js`), leftover Supabase-era SQL files + `src/lib/supabase.ts` (0 references, app fully on Firebase), `bas2-firebase-migration/` staging folder
3. Added `.env` to `.gitignore`
4. Found `tailwind.config.ts` had a mismatched orange "food app" brand palette (`#E8472E`) leaking onto `HomeHeader.tsx` (location pin + notification badge) while the rest of the app uses coral-pink (`#E8526A`) — replaced with the app's real coral-pink identity + added `gold` token for caramel accents
5. Fixed `accent-coral` on checkboxes/slider (CheckoutScreen, CategoriesScreen) — "coral" wasn't a real defined color, so accent styling was silently falling back to browser default; now uses `accent-brand-500`

### Touched files:
- 258 files removed (cleanup)
- `tailwind.config.ts`, `src/screens/CheckoutScreen.tsx`, `src/screens/CategoriesScreen.tsx`

### Build:
- ✓ built in 18.07s (cleanup) / ✓ built in 17.70s (color fix)

### Commits:
- `c2a451b` — chore: repo cleanup
- `c2c3a0b` — fix: replace mismatched orange brand palette with actual coral-pink identity

### পরবর্তী Agent এর জন্য নোট:
- Still pending: ~10 hardcoded pink hex values scattered across `ProductCard.tsx`, `SuccessScreen.tsx`, `HomeScreen.tsx`, `WishlistScreen.tsx`, `LocationGate.tsx` need consolidating to the same brand token values for exact shade consistency.
- `.font-brand` (Great Vibes signature script) used in only 5/33 files — core screens like Product, Cart, Checkout, Profile don't use it. Next pass: apply consistently for premium feel.
- Do NOT touch `#d32f2f`/`#f57c00`/`#f5f5f5` (DebugOverlay/ErrorBoundary — dev-only) or `#FEF0E6`/`#EC6608` (Nagad) / `#FCE8F1`/`#E2136E` (bKash) — those are intentional partner/semantic colors, not brand.

---

# Agent Log — BAS (Bake Art Style 2)

## Session: 2026-07-02 (glass-tint fix — real glass instead of solid color repaint)
**Agent/Tool:** Claude (Sonnet 5, in-chat, direct repo access via git clone)
**Feature worked on:** FIX pass — previous session's glass-tint (Check 3, dominant color) was reported by user as "background changes হয়ে যাচ্ছে, glassy feel না" — regression fix on that same feature.

### Review findings (approved by user — "দুটোই একসাথে"):
1. Content sheet only overlapped hero image by `-mt-5` (20px) — too little for `backdrop-filter: blur(20px)` to have real photo to blur, so the panel read as a flat solid-color repaint instead of frosted glass.
2. `lightenToPastel()` mix (0.72) + `.glass-tint` alpha (0.72) made the dominant-color tint dominate the panel almost as a solid fill instead of a subtle accent.

### কী হয়েছে:
- `src/screens/ProductScreen.tsx`:
  - Content sheet overlap increased `-mt-5` → `-mt-16` (64px) so backdrop-blur has real image content behind it → genuine glass effect.
  - Pagination dots moved `bottom-5` → `bottom-20` — companion fix, otherwise the larger overlap would visually cover them. Not scope creep, direct consequence of the overlap change.
- `src/hooks/useDominantColor.ts`:
  - `lightenToPastel()` white-mix `0.72` → `0.88`, alpha `0.72` → `0.55` — dominant color now reads as a whisper of warmth, not a per-photo background repaint.
  - `FALLBACK_TINT` alpha matched to `0.55` for consistency.
- `src/index.css`:
  - `.glass-tint` default fallback alpha `0.72` → `0.55` to match the hook.

### Touched files:
- `src/screens/ProductScreen.tsx`
- `src/hooks/useDominantColor.ts`
- `src/index.css`

### Build:
- `npm run build` → ✓ built in 13.45s (verified before ZIP)

### Commit:
- Not yet pushed — ZIP delivered for local apply/build/push (`bas-glasstint-fix-070226.zip`)

### পরবর্তী Agent এর জন্য নোট:
- If dots at `bottom-20` still feel too high/low visually once seen live, that's the only "eyeball it" number in this fix — safe to nudge without touching the other two changes.
- Don't revert the tint alpha back toward 0.72 — that was the exact cause of the reported bug.

---

## Session: 2026-07-02 (ProductScreen hero swipe + glass tint + dominant color)
**Agent/Tool:** Arena.ai Agent Mode
**Feature worked on:** FIX pass — 3 approved review findings on ProductScreen

### কী হয়েছে:

1. **Check 1 — Hero swipe gesture** (`src/screens/ProductScreen.tsx`):
   - Added `useRef` import; created `touchStartX` and `touchStartY` refs (not state — avoids re-renders).
   - Added `onTouchStart` and `onTouchEnd` handlers on the hero wrapper div (not on `<img>`) so Out-of-Stock overlay doesn't block swipes.
   - Threshold: |deltaX| > 48px and |deltaX| > |deltaY|.
   - Swipe left → next image (`min(activeIndex+1, len-1)`), swipe right → previous (`max(activeIndex-1, 0)`).
   - Guarded with `galleryImages.length <= 1` — no handlers fire on single-image products.
   - No `onTouchMove`/`preventDefault` — vertical scroll is untouched.

2. **Check 2 — Text-side glass panel** (`src/index.css` + `src/screens/ProductScreen.tsx`):
   - Added `.glass-tint` class in `index.css`: `background: var(--tint, rgba(255,244,246,0.72))` + `backdrop-filter: saturate(180%) blur(20px)`.
   - Existing `.glass` and `.glass-strong` classes untouched.
   - Content sheet div: removed `bg-white`, added `glass-tint` class + `style={{ '--tint': dominantColor }}` via `React.CSSProperties` cast.

3. **Check 3 — Dynamic color extraction** (`src/hooks/useDominantColor.ts` — new file):
   - Canvas downscale approach: 16×16 draw → pixel average → pastel lightening.
   - `img.crossOrigin = 'anonymous'` mandatory (Cloudinary).
   - `getImageData` wrapped in try/catch — fallback `rgba(255,244,246,0.72)` (neutral blush).
   - Raw average is pastel-lightened (72% white mix) to avoid muddy brown.
   - Results cached in module-level `Map<string, string>` — no re-extraction for same URL.
   - Hook re-runs when `currentImg` changes; `useDominantColor(currentImg)` in ProductScreen.
   - No new npm dependency — pure canvas API.

### Touched files:
- `src/screens/ProductScreen.tsx` (swipe refs, swipe handlers on hero div, dominantColor hook call, glass-tint class + --tint style)
- `src/index.css` (added `.glass-tint` class after `.glass-strong`)
- `src/hooks/useDominantColor.ts` (new file)

### Build:
- `npm run build` → ✓ built in 5.40s (verified before ZIP)

### Deviations/Assumptions:
- None — all three fixes follow the approved review spec exactly.

---

---

## Session: 2026-07-02 (ProductCard — photo becomes the hero)
**Agent/Tool:** Claude (Sonnet 5, in-chat, direct repo access via git clone)
**Feature worked on:** Premium-feel review → Direction D (card-language differentiation), customer-attraction priority — picked over Direction C for this pass since product photos drive purchase decisions directly.

### কী হয়েছে:
- `ProductCard.tsx` (both `grid` and `horizontal` variants) — image aspect ratio changed `aspect-square` → `aspect-[4/5]` for a more immersive/editorial photo.
- Price and the "Add to cart" button moved off the flat white content area and onto the photo itself, as a floating `glass-strong` frosted pill (price) + coral gradient circle (add button), sitting on a bottom gradient scrim for legibility. Thumb-reachable, visible while browsing, no extra tap needed to see price.
- Content area below the photo simplified to just: low-stock urgency chip, rating, product name — price is no longer duplicated there.
- Extracted a small internal `AddButton` helper inside the component (avoids repeating the button's inline style block 2x now that it appears in both variants at different sizes).
- Reused the existing `.glass-strong` class from `index.css` (previously only used in the notice modal) — no CSS changes needed.

### Touched files:
- `src/components/ProductCard.tsx` (only file touched this pass)

### Commit:
- Not yet pushed — ZIP delivered for local apply/build/push (`bas-productcard-photo-hero-070226.zip`)

### এখনো Pending:
- Direction C (cinematic banner hero) still deferred — next candidate if another attraction-focused pass is wanted.
- Check 2 (repetitive white-card grammar) partially addressed by this fix (photo now differs materially from other white cards); other card types (banners, wallet card, order-again card) untouched.

### পরবর্তী Agent এর জন্য নোট:
- Build verified locally (`npm run build` → `✓ built in 7.36s`) before ZIP was created; only `ProductCard.tsx` in the diff.
- Pre-existing, unrelated `tsc` typecheck errors exist in `OrdersScreen.tsx`, `TrackingScreen.tsx`, `WishlistScreen.tsx`, and one spot in `HomeScreen.tsx` (unknown/`{}` types from untyped state) — these are NOT caused by this fix and were present before it. Worth a dedicated typecheck-cleanup pass later if the user wants; not touched here since it's out of this session's single-concept scope.
- Do not re-duplicate price/add-button back into the white content area below the photo — that was intentionally removed to avoid redundancy now that it lives on the image.

---


## Session: 2026-07-02 (Home hero signature moment)
**Agent/Tool:** Claude (Sonnet 5, in-chat, direct repo access via git clone — not Arena.ai this time)
**Feature worked on:** Premium-feel / signature-identity review → Fix (Code Master protocol, single concept)

### কী হয়েছে:
- Review report first identified 5 gaps (no hero moment, repetitive white-card grammar, underused Fraunces/Great Vibes, unused `.mesh-warm`/`.confetti-dots`, generic section-header pattern) — no code changed in review pass.
- User approved direction **A + B**: script-forward hero + textured mesh background, combined into one signature moment at the top of Home only (rest of the screen left untouched, per "spend boldness in one place").
- Home hero block (greeting + headline + search) changed from flat `bg-cream` + two decorative blur circles → `.mesh-warm` textured background on a `rounded-b-[32px]` panel, with a large (58px), low-opacity (9%), rotated Great Vibes ("Bake Art Style") watermark behind the content as a decorative signature mark (`aria-hidden`, `pointer-events-none`).
- Rest of Home (banner carousel, wallet nudge, order-again, categories, trending, for-you) intentionally untouched.

### Touched files:
- `src/screens/HomeScreen.tsx` (hero block only, lines ~143–166 pre-change)

### Commit:
- Not yet pushed — ZIP delivered to user for local apply/build/push (`bas-home-hero-signature-070226.zip`)

### এখনো Pending (যদি থাকে):
- Directions C (cinematic banner hero) and D (card-language differentiation) were reviewed but deferred — noted as future options if user wants a second pass later.
- Full white-card-grammar audit (Check 2 in the review) not addressed — lower priority, left as-is.

### পরবর্তী Agent এর জন্য নোট:
- `.mesh-warm` and `font-brand` (Great Vibes) were already defined in `src/index.css` — no CSS changes were needed for this fix, only usage in `HomeScreen.tsx`.
- The script watermark is intentionally decorative/low-opacity (`text-coral/[0.09]`) — do not increase opacity much further or it will hurt text legibility of the headline/search sitting on top of it.
- Build verified locally (`npm run build` → `✓ built in 9.34s`) before ZIP was created.

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
