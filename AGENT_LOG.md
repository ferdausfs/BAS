# Agent Log — BAS (Bake Art Style 2)

## Session: CartScreen — minus button no longer auto-deletes at qty 0 (2026-07-18, immediately after)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** User reported repeatedly tapping the "-" stepper
button eventually deletes the item. Root cause: `useCart.setQty` (in
`lib/store.ts`, pre-existing, not touched this session) filters out any
item whose quantity drops to `0`, so decrementing past 1 silently removes
it — this predates the swipe work but now directly conflicts with the
swipe+confirm-sheet flow just built, which is meant to be the only
deletion path.

### Review (before fix):
- `lib/store.ts` L218–223: `setQty` — `.filter((it) => it.quantity > 0)`,
  confirmed this is the existing store behavior, not something introduced
  by the swipe changes.
- `CartScreen.tsx`: `onDecrease` prop passed `setQty(idx, item.quantity - 1)`
  unconditionally, so at `quantity === 1` this calls `setQty(idx, 0)` →
  store removes the item.

### কী হয়েছে:
- **`src/screens/CartScreen.tsx`**: `onDecrease` now floors at 1 —
  `if (item.quantity > 1) setQty(idx, item.quantity - 1)`. The minus button
  in `CartItemRow` is `disabled` (with a dimmed `disabled:opacity-40`
  style) once `item.quantity <= 1`, so it's visually clear that removal
  now only happens through swipe → confirm sheet, not by decrementing to
  zero. `lib/store.ts` itself was **not** touched — its 0-quantity filter
  may still matter for other callers (e.g. `ProductScreen`'s own quantity
  control), so the fix was scoped to Cart's stepper only.

### Touched files:
- `src/screens/CartScreen.tsx`

### Verify:
- `npx tsc --noEmit`: 0 errors in `CartScreen.tsx`.
- `npm run build`: ✓ built in 10.37s

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- **Swipe-to-delete itself is still unconfirmed working on the user's
  actual device** — this is the third round on the swipe gesture in this
  session (Pointer Events, then native touch listeners, both reported as
  "same" / not working) and the agent cannot test real touch input in this
  sandboxed environment. Before attempting a 4th code-level fix blind,
  asked the user to confirm via `grep -n "touchstart"
  src/screens/CartScreen.tsx` that the native-touch-listener version is
  actually present on disk after unzipping, and to hard-refresh /
  uninstall-reinstall if a cached/PWA build could be serving stale JS —
  per the ZIP-filename-collision and stale-cache mistakes already logged
  in `AGENT-WORKFLOW-PROTOCOL.md`'s "যে ভুলগুলো আগে হয়েছে" section.

---

## Session: CartScreen — swipe-to-delete fixed to use native touch listeners (2026-07-18, immediately after)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Second follow-up correction in the same Cart session
— user reported swipe still didn't work after the previous entry (which
used React's synthetic Pointer Events). Root cause: same class of bug
already solved once before in this repo for `ProductScreen.tsx`'s
image-gallery swipe — see new `tasks/lessons.md` entry ("Swipe/drag
gestures on real touch devices need native touch listeners, not Pointer
Events alone"). Mobile browsers hand vertical-scroll gestures to their own
built-in recognizer before React's synthetic pointer handlers get a chance
to call `preventDefault()`, so the drag was silently cancelled on real
touch input despite `tsc`/`npm run build` passing cleanly both times.

### Review (before fix):
- `CartScreen.tsx` (prior version): `CartItemRow` used
  `onPointerDown/Move/Up/Cancel` (React synthetic Pointer Events) with
  `touchAction: 'pan-y'` — type-checks and builds fine, but the actual drag
  never visibly starts on a real device.
- `ProductScreen.tsx` L74–116: existing, previously-verified-working native
  `touchstart`/`touchmove` (`passive: false`)/`touchend` pattern for the
  hero-image gallery swipe — used as the reference fix.

### কী হয়েছে:
- **`src/screens/CartScreen.tsx`**: `CartItemRow` rewritten to attach real
  native touch listeners via `useEffect` on a `cardRef` (`touchstart` /
  `touchmove` with `{ passive: false }` / `touchend` / `touchcancel`), with
  a small-movement threshold that decides horizontal-vs-vertical intent
  before locking the gesture and calling `preventDefault()` — matches
  `ProductScreen.tsx`'s established working pattern exactly. Kept a
  lightweight `onMouseDown` + `window` mousemove/mouseup handler alongside
  it purely so the gesture is also draggable with a mouse for desktop/
  Termux-browser preview testing; the touch path is the one that matters
  on the actual Android device.
- **`tasks/lessons.md`**: added a new lesson capturing this pattern so
  future swipe/drag features go straight to native touch listeners instead
  of re-discovering the Pointer-Events pitfall.

### Touched files:
- `src/screens/CartScreen.tsx`
- `tasks/lessons.md`

### Verify:
- `npx tsc --noEmit`: 0 errors in `CartScreen.tsx`.
- `npm run build`: ✓ built in 11.96s
- **Not yet confirmed on an actual device by the agent** — this fix mirrors
  a pattern already verified working elsewhere in the repo, but the agent
  cannot itself perform a real touch-swipe test in this environment. User
  should swipe-test on the Android device after applying this ZIP before
  considering this fully closed.

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- If swipe still doesn't register after this fix, next things to check on
  the actual device: (1) confirm the ZIP was actually unzipped over the old
  file (`grep -n "touchstart" src/screens/CartScreen.tsx` should show the
  new listener code), (2) confirm the browser/WebView is loading the fresh
  build and not a cached service-worker/PWA version of the old bundle, (3)
  try swiping with a clearly horizontal gesture — the 6px move-threshold +
  horizontal-vs-vertical lock means a mostly-vertical or very short swipe
  won't trigger it by design.

---

## Session: CartScreen — real swipe-to-delete implemented, standalone delete icon removed (2026-07-18, immediately after)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Follow-up correction — the previous entry in this same
session only restyled the item card to mat-frame and removed the Delivery
Address block; it explicitly left the swipe gesture from the original HTML
mockup unimplemented. User pointed out the HTML wasn't fully applied
("swipe kaj kore na") and asked to also remove the standalone trash icon
button, since swipe now owns deletion.

### Review (before fix):
- `CartScreen.tsx` (prior version, this session): each item `<article>` had
  a fixed `Trash2` icon button in the top-right corner calling `remove(idx)`
  directly, with no confirmation and no swipe gesture at all.
- Reference: `cart-swipe-delete-preview.html` — pointer-based drag on the
  card revealing a trash panel behind it, tap-to-confirm via a bottom sheet
  before actual removal.

### কী হয়েছে:
- **`src/screens/CartScreen.tsx`**: extracted a new `CartItemRow` component
  implementing the swipe gesture with `onPointerDown/Move/Up/Cancel`
  (mirrors the approved HTML mockup's drag math — `SWIPE_MAX = 84`, clamps
  `translateX` between `-SWIPE_MAX` and `0`, snaps open/closed based on
  whether the drag passed the halfway point). The revealed trash panel
  (rose gradient, `Trash2` icon) sits behind the card and, on tap, opens a
  confirmation bottom sheet (`confirmIdx` state on `CartScreen`) rather than
  deleting immediately — sheet shows the item thumbnail/name/size/flavor
  and Cancel / "হ্যাঁ, সরান" buttons; only the latter calls `remove(idx)`.
  Removed the old standalone top-right `Trash2` button from the item card
  entirely — swipe + confirm sheet is now the only removal path. Pointer
  handlers check `e.target.closest('button')` and bail out so the qty
  +/− stepper buttons still receive their own clicks uninterrupted by the
  drag capture.

### Touched files:
- `src/screens/CartScreen.tsx`

### Verify:
- `npx tsc --noEmit`: 0 errors in `CartScreen.tsx`.
- `npm run build`: ✓ built in 12.39s

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- Swipe is pointer-events based (`touchAction: 'pan-y'`), same approach as
  the approved HTML mockup — works for touch and mouse. Not yet tested on
  an actual Android device inside the app WebView; if the drag feels
  laggy/jumpy on-device, first thing to check is whether `pan-y` needs to
  be `none` there, or whether the outer scroll container's own touch
  handling is fighting the per-row pointer capture.
- Only one row can usefully be "open" at a time in the current
  implementation — swiping a second row does not auto-close a previously
  open one. Not a reported issue, but worth flagging if the user tests
  multiple open swipes and finds it confusing.

---

## Session: CartScreen — mat-frame item cards + removed Delivery Address quick-access (2026-07-18, later same day)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** User shared a swipe-to-delete cart HTML mockup, asked
for it adapted to BAS's cream-coral theme, then specifically requested the
item cards use the same "polaroid/mat-frame" treatment as `ProductCard.tsx`
(not glass-strong). Also asked to remove the "ডেলিভারি ঠিকানা" (Delivery
Address) quick-access row from the Cart page entirely. Mockups were shown
via the visualizer for approval before touching any repo code; the actual
swipe-to-delete gesture itself was not implemented in this session — only
the card style + section removal, which is what was explicitly approved.

### Review (before fix):
- `CartScreen.tsx` L140–151 (old): item thumbnail was
  `h-24 w-24 ... rounded-2xl glass-strong` — frosted-glass system, not the
  white mat-frame used elsewhere in the app.
- `ProductCard.tsx` L84–95: reference mat-frame pattern — outer
  `bg-white p-2 border border-ink-50/80 product-card-shadow rounded-[22px]`,
  inner image at `rounded-[16px]`.
- `CartScreen.tsx` L243–275 (old): "ডেলিভারি ঠিকানা" horizontally-scrollable
  quick-address row (Home/Office/Parent's/Friend's + Add New), all routing
  to `checkout`. Confirmed this was purely a Cart-page shortcut into the
  Checkout wizard's address step, not the actual address-selection logic —
  safe to remove without touching Checkout.

### কী হয়েছে:
- **`src/screens/CartScreen.tsx`**: item `<article>` card and its thumbnail
  wrapper both switched from `glass-strong` to the flat mat-frame treatment
  (`bg-white border border-ink-50/80 product-card-shadow`), with the
  thumbnail getting an inner `p-1.5` white border band + `rounded-[14px]`
  image, matching `ProductCard.tsx`'s existing pattern. Deleted the entire
  "ডেলিভারি ঠিকানা" quick-access section (comment + `div.mt-5.mb-1` block).
  `go` import/usage untouched — still used by `handleCheckout`.

### Touched files:
- `src/screens/CartScreen.tsx`

### Verify:
- `npx tsc --noEmit`: 0 errors in `CartScreen.tsx`.
- `npm run build`: ✓ built in 10.20s

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- Swipe-to-delete gesture (from the original HTML mockup) was **not**
  implemented — user only approved the card-style + section-removal parts
  this session. If swipe-to-delete is wanted on the real Cart items, that's
  a separate follow-up (would need pointer-event handling similar to the
  mockup, applied per cart-item `<article>`, plus a confirm bottom-sheet
  before actually calling `remove(idx)`).
- Address selection itself still lives entirely in the Checkout wizard,
  unchanged — Cart no longer has any address-related UI at all.

---

## Session: ProductScreen — quantity stepper moved to bottom CTA bar (2026-07-18, later same day)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** User shared a new grocery-app wireframe screenshot for the Product Detail page and asked for a mockup preview (fondant-designer flow) before any code change. Full-screen review found most sections (hero image/gallery, "Bake Art Style" brand contact card, Flavor selector) already closely matched the wireframe's intent structurally — the one real gap was the Quantity stepper's position: wireframe puts it directly in the sticky bottom bar next to the Add-to-cart button, while BAS had it as a separate mid-page section. User approved applying that change.

### Review (before fix):
- `ProductScreen.tsx` L610–636: standalone "Quantity" `<section>` with its own +/− stepper, positioned mid-page after the Weight selector.
- `ProductScreen.tsx` L876–898 (old): sticky bottom CTA bar had only the Total price summary and the "Add to Cart" button — no quantity control.

### কী হয়েছে:
- **`src/screens/ProductScreen.tsx`**: removed the standalone mid-page "Quantity" section entirely. Added a compact quantity stepper (smaller `h-8 w-8` +/− buttons in a pill-shaped `bg-ink-50` wrapper) directly inside the sticky bottom CTA bar, positioned between the Total price block and the "Add to Cart" button — matches the wireframe's bottom-bar layout. Same `quantity`/`setQuantity` state, same `Minus`/`Plus` icons — no new imports needed, no behavior change, purely a relocation + restyle to fit the smaller bottom-bar footprint.

### Touched files:
- `src/screens/ProductScreen.tsx`

### Verify:
- `npx tsc --noEmit`: 0 errors in `ProductScreen.tsx`.
- `npm run build`: ✓ built in 8.36s

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- The out-of-stock branch of the bottom CTA bar (Notify Me button) was left untouched — it doesn't show a quantity stepper since you can't add an out-of-stock item, which is correct as-is.
- Everything else compared against this wireframe (hero image + rounded overlap sheet, thumbnail ring-highlight, brand contact card, flavor pills) was already a close match to the wireframe's intent using BAS's existing premium visual language — no further ProductScreen changes were requested or made this session.

---


**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** After the header/search-filter session, user shared a live screenshot of the deployed Home screen and asked to match text size below the header to the wireframe (`need_to_apply_on_bas_HomeScreen.html`'s `.section-title` at 19px, uniform across sections).

### Review (before fix):
Section titles were inconsistent: `SectionHeader.tsx` ("Exclusive Offers", "Featured Products") used `text-[17px]`, while the custom "Explore Categories" heading in `HomeScreen.tsx` used `text-[16px]` — neither matched the wireframe's uniform 19px `.section-title`. Category pill (`.chip` class in `index.css`) text was `13px` vs wireframe's `14px`.

### কী হয়েছে:
- **`src/components/SectionHeader.tsx`**: title `text-[17px]` → `text-[19px]` (affects "Exclusive Offers" and "Featured Products").
- **`src/screens/HomeScreen.tsx`**: "Explore Categories" heading `text-[16px]` → `text-[19px]` — now matches the other two section titles exactly.
- **`src/index.css`**: `.chip` (category pill) `font-size: 13px` → `14px`.

### Touched files:
- `src/components/SectionHeader.tsx`
- `src/screens/HomeScreen.tsx`
- `src/index.css`

### Verify:
- `npx tsc --noEmit`: same 57 pre-existing `unknown`-type errors in `HomeScreen.tsx` as documented in the 2026-07-17 log entry (line numbers shifted by +1 from the one added line) — zero new errors.
- `npm run build`: ✓ built in 9.46s

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- "See all" label size (13px) and category pill padding already matched the wireframe closely — untouched.
- The pre-existing 57 `unknown`-type errors in `HomeScreen.tsx` (from `useProducts`/`useBanners`/`useOrders` returning loosely-typed data) are unrelated to this session and still unresolved — flagged again in case a future session wants to properly type those hooks.

---


**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Comprehensive review of a new full-screen HTML wireframe (`need_to_apply_on_bas_HomeScreen.html`, grayscale placeholder) against live Home, then applied the two user-approved, non-conflicting fixes.

### Review (before fix):
Full-screen review against the wireframe surfaced 3 items conflicting with earlier documented decisions (header had 3 icons vs wireframe's 1, offer card was a real photo vs wireframe's flat text-card, bottom nav had 4 labeled tabs vs wireframe's 5 icon-only) plus 2 safe/non-conflicting items (search+filter button overlap style, categories already close). User decisions: (1) header → bell-only, cart/wishlist icons removed (explicitly accepted losing that quick-access path since bottom nav has no cart/wishlist tab), (2) offer card → keep the real photo, no fabricated discount %, card-frame styling only, (3) bottom nav → explicitly left unchanged ("nav bar eta balo premium fell dey"). Search+filter button style approved as a safe standalone fix.

### কী হয়েছে:
- **`src/components/HomeTopBar.tsx`**: removed the Wishlist and Cart quick-icon buttons from the header — only the Notifications (bell) button remains, matching the wireframe. Removed now-unused `useCart`/`useUser` hooks, `Heart`/`ShoppingBag` imports, `cartCount`/`wishCount`/badge-bounce state (`useEffect`/`useRef`/`useState` for `badgeKey`), and the now-unused `go` from `useUI()` (was only used by the removed wishlist/cart `onClick`s). Bell's existing behavior (`onNotificationsOpen` popup) unchanged.
- **`src/components/SearchBar.tsx`**: restructured from an absolutely-positioned, overlapping filter button (`-right-2`, sat partly outside the pill) to a flex-row layout — search pill and filter button are now siblings with a `gap-2.5`, filter button no longer overlaps the pill's edge. Kept the existing dark rounded-square button and sliders-style icon (no icon swap — matches wireframe's "separated filter button" concept, not a shape change).
- Offer card (`HomeScreen.tsx`): **no change** — user confirmed keep the real photo banner; already had matching card-frame details (rounded card, tag chip, pagination dots below the card with elongated active-dot) from the previous wireframe pass, so nothing was out of sync once the "no photo" idea was dropped.
- Bottom nav (`BottomTabBar.tsx`): **no change** — user explicitly kept the current 4-tab labeled design.

### Touched files:
- `src/components/HomeTopBar.tsx`
- `src/components/SearchBar.tsx`

### Verify:
- `npx tsc --noEmit`: 0 errors in both touched files.
- `npm run build`: ✓ built in 8.36s

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- Cart and wishlist are no longer reachable from the Home header at all — confirm this doesn't surprise the user later; they explicitly accepted this trade-off in this session but there's no other quick-access entry point to wishlist from Home now (cart is somewhat reachable via product pages / "Order again" flow, wishlist has no Home-screen entry point anymore).
- The offer-card discount-percentage question (no numeric field in `Banner` type) is still open if the user later wants a real "Up to X%" number shown — would need either a new `discountPercent` field on `Banner` or displaying `tag` text instead. Not needed for this session's approved scope.

---


**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Two related Home-header requests: (1) the search bar's filter/occasion icon button didn't match the reference wireframe's style, (2) on scroll, the search bar should detach from the header and stick/float to the top of the screen ("uthe jabe" — rises up).

### Review (before fix):
- `HomeTopBar.tsx`: the whole header (location row + search row together) was `position: sticky; top: 0`, meaning it was already permanently pinned from the very top of the scroll — nothing actually scrolled away, so there was no "rise up" moment to see. This wasn't matching the requested behavior: location/icon row should scroll away normally, only the search bar should stick, and it should visually detach and pin once the location row scrolls past.
- `SearchBar.tsx`: the occasion/filter button was a light (`bg-white/70`) inset circle using a `LayoutGrid` icon, fully inside the pill. Reference shows a dark, rounded-square button with a sliders/adjustments icon that overlaps the pill's right edge (sits partly outside it).

### কী হয়েছে:
- **`src/components/SearchBar.tsx`**: swapped `LayoutGrid` → `SlidersHorizontal` (lucide) to match the reference's sliders-style filter icon. Restyled the button from a light inset circle (`bg-white/70`, inside the pill) to a dark rounded-square button (`bg-ink`, `rounded-[15px]`, `h-11 w-11`) positioned to overlap the pill's right edge (`-right-1.5`), matching the reference's floating filter button. Adjusted input `pr` since the button now hangs mostly outside the pill instead of fully inside it.
- **`src/components/HomeTopBar.tsx`**: split the single sticky header div into two layers — (1) the location+icons panel, now plain `relative` flow (no longer sticky, scrolls away with the page), and (2) the search bar in its own `sticky top-0` wrapper directly below it, with a solid `#3D2418` background (matches the gradient's dark end so the seam between the two layers is invisible) and the header's `rounded-b-[22px]`/shadow moved onto this layer. Because the search-bar layer is a sticky element sitting right after the (now non-sticky) location panel in document flow, plain CSS handles the "rises up and pins" behavior — no scroll listener or IntersectionObserver needed. Cart/wishlist/bell icons stayed in the (now non-sticky) location panel — unchanged from the standing decision that they must live in the Home header since the bottom tab bar has no cart/wishlist tab.

### Touched files:
- `src/components/HomeTopBar.tsx`
- `src/components/SearchBar.tsx`

### Verify:
- `npx tsc --noEmit`: 0 errors in both touched files (before and after — clean either way).
- `npm run build`: ✓ built in 14.17s

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- The sticky search layer uses a solid `#3D2418` background rather than a token — if the header gradient's colors ever change, this hardcoded hex needs to be updated to match, or it'll create a visible seam. Worth extracting to a shared constant if the header gradient is touched again.
- `BAS-redesign-plan.md` (the broader 21-screen plan) is still parked — user said to finish Home-only fixes first, hasn't brought the bigger plan back up yet.

---

## Session: Home — full A-Z pass vs reference wireframe (header/banner/badges) (2026-07-17)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Follow-up to the section-reorder session below. User said the live Home screen still didn't match the reference (`Grocery-Delivery-App-Wireframe-Figma-Design.png`) and, when asked 3 specific yes/no questions (banner photo, header greeting, chip active-state), answered "look at the full screen, everything in it needs work, A to Z" for the first two and picked "keep uniform (no change)" for chips. Interpreted as: keep the real banner photo (explicit — "tumi banner-r photo niya aso", i.e. keep it), but do a comprehensive layout/detail pass on every other element of the screen to close the gap with the reference, not just the two items already fixed.

### Review (before fix):
- **Header**: still 3 rows (location+icons, "Welcome back 🎂" greeting, search) vs reference's 2 rows (location+icons, search directly below). Confirmed with user this greeting row should go.
- **Banner**: real photo kept (explicit instruction), but the dark gradient overlay (`from-black/70 via-black/30`) was heavier/darker than the reference's light, airy card — adjusted the overlay to feel lighter while keeping the photo and all existing interaction logic (carousel, promo-code copy, notice modal, deep links).
- **Section headers**: "Exclusive Offers" and "Featured Products" both had a small eyebrow line above them (`Today's picks`, `Handpicked`) that the reference doesn't have — reference goes straight from the big title into the "See All" row.
- **Product badges**: reference's discount badge ("15% OFF") is a solid dark pill. BAS's "Best" badge was a light frosted pill (`bg-white/80`); "New" was already a solid coral pill. Restyled "Best" to a solid dark pill (`bg-ink/85`) to match the reference's uniform dark-badge treatment (BAS still shows "Best"/"New" text, not a fabricated percentage — no per-product discount field exists in the data model, confirmed in the previous review).
- **Category chips**: user explicitly said keep the current uniform style, no active/selected state added — confirmed, not touched.

### কী হয়েছে:
- **`src/components/HomeTopBar.tsx`**: removed the "Welcome back" greeting `<h1>` entirely — search now sits directly under the location/icons row. Removed the now-unused `firstName`/`isNonLatin`/`greetingName` variables and the now-unused `useAuthStore`/`user` import+destructure (greeting was their only consumer in this file). Tightened header padding/curve slightly (`pb-5`→`pb-4`, `rounded-b-[26px]`→`rounded-b-[22px]`) now that the header is shorter. Cart/wishlist/notification icons were **not** removed — same standing reason as the earlier Home session: Home is the only screen carrying them since the bottom tab bar (kept as-is per user instruction) has no cart/wishlist tab.
- **`src/screens/HomeScreen.tsx`**: lightened the banner's photo overlay gradient (`black/70,black/30` → `black/55,black/20`); removed the `eyebrow` prop from the "Exclusive Offers" and "Featured Products" `SectionHeader`s so both go straight from title to "See all", matching the reference.
- **`src/components/ProductCard.tsx`**: "Best" badge restyled from `bg-white/80 text-coral` to `bg-ink/85 text-white` — now visually a solid dark pill like "New" and like the reference's badge.

### Touched files:
- `src/components/HomeTopBar.tsx`
- `src/screens/HomeScreen.tsx`
- `src/components/ProductCard.tsx`

### Verify:
- `npx tsc --noEmit`: 57 pre-existing `unknown`-type errors across `HomeScreen.tsx`/`ProductCard.tsx` both before and after (confirmed via `git stash` diff — same errors, only line numbers shifted from the header/eyebrow removals). `HomeTopBar.tsx`: 0 errors, unchanged. Zero new errors anywhere.
- `npm run build`: ✓ built in 10.86s

### Output ZIP:
- See ZIP filename in the next log update from this same session (packaged after this entry was written, per protocol — ZIP includes this file).

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- User is holding a separate, much larger draft — `BAS-redesign-plan.md` — proposing a full 21-screen wireframe redesign pass (Splash/Onboarding, Login/OTP, full Categories grid, Product Detail, Checkout, Order Confirmation, Notifications, etc.), with 6 open questions in its Section 3 still unanswered. User explicitly said: finish the current Home-only fix first, deal with that plan doc afterward. **Do not start executing that broader plan until the user brings it up again** — it's parked, not declined.
- If the user asks for more Home-screen detail passes, keep checking the actual rendered result against the reference screenshot section-by-section rather than assuming the previous "wireframe pass" sessions already closed things out — this is now the second follow-up round on the same screen where earlier "done" claims turned out to have gaps (see the "Restyling ≠ reordering" lesson in `tasks/lessons.md`).

---

## Session: Home layout — Exclusive Offers moved before Explore Categories + banner dots outside card (2026-07-17)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Reported by:** user, unhappy with the live Home screen vs a grayscale reference wireframe screenshot (`Grocery-Delivery-App-Wireframe-Figma-Design.png` reference — same one used in the earlier "Home Screen Layout Redesign" session).

### Review (before fix):
- The earlier Home wireframe pass (see session below, same date) added an "Exclusive Offers" `SectionHeader` above the banner and reshaped the category row into pill chips, but **kept the original section order**: Explore Categories first, then Exclusive Offers banner below it.
- Re-checked against the reference: the reference shows Exclusive Offers **first**, Explore Categories **second** — order was never actually flipped in that earlier pass, only the individual sections were restyled in place.
- Banner pagination dots were absolute-positioned *inside* the image (`absolute right-0 bottom-3 left-0`), overlaid on the photo. Reference shows the dots as a separate row **below/outside** the framed banner card.
- Header (avatar+location, bell/wishlist/cart icons), category chip style, and the Featured Products 2-column grid were re-verified against the same reference and already match — not touched again (per the existing decision logged in the prior Home session: cart/wishlist/notification icons must stay in the header because the bottom tab bar — kept as-is per user instruction — has no cart/wishlist tab).
- Product card's discount badge in the reference reads "15% OFF" (a percentage). BAS's `Product` type has no per-product discount-percentage field (only coupon-level/order-level discount exists) — kept the existing "BEST"/"NEW" badges rather than fabricate a percentage; flagged to the user as an intentional adaptation, not a gap.

### কী হয়েছে (fix):
- **`src/screens/HomeScreen.tsx`**: moved the entire "Hero banner / Exclusive Offers" block to render **before** the "Category row / Explore Categories" block (pure JSX reorder, no logic changes — `bannerIdx`, `activeBanners`, category `.map`, `openOccasion` etc. all untouched).
- Removed the pagination-dot `<div className="absolute ... bottom-3 ...">` that overlaid the banner image; added a new dot row **outside** the image container, inside the same `px-5` wrapper, styled `bg-coral`/`bg-ink-100` (was `bg-white`/`bg-white/50`, which only worked visually against the photo — now sits on the cream page background so needed the app's ink/coral tokens instead).

### Touched files:
- `src/screens/HomeScreen.tsx`

### Verify:
- `npx tsc --noEmit`: 56 pre-existing `unknown`-type errors in this file both before and after (confirmed via `git stash` diff) — zero new errors.
- `npm run build`: ✓ built in 9.41s

### Output ZIP:
- `home-offers-before-categories-0717-1832.zip` — 1 file (`src/screens/HomeScreen.tsx`), no top-level folder.

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- User said they'll give further layout-change instructions after this one is applied — expect a follow-up request in the same thread, likely still Home-screen-scoped. Don't assume the reference wireframe pass is "done" again just because this reorder is in — ask what's next rather than closing this out unprompted.
- Banner photo itself was deliberately **kept** (reference shows a flat text-only promo card, BAS uses real uploaded promo photos) — this is a live open point the user may still want changed; if they ask for the banner to drop the photo entirely, that's a new, larger UI change (removes real content, not just layout) and should get its own review before implementing.

---

## Session: BUG FIX — duplicate "Bake Art Style" contact card on Product screen (2026-07-17)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Reported by:** user, from live screenshots of the deployed app (Screenshot_20260717_141122 / _141211) showing the Rose Garden product page with **two** near-identical "Bake Art Style" contact rows (one labeled "দোকান সহায়তা" with an in-app-chat icon, one labeled "Official Bakery • Since 2018" with WhatsApp/tel: links).

### Root cause:
- Earlier this session, the "Product Detail" wireframe redesign step added a store-contact row to `ProductScreen.tsx` right after the rating line, believing this closed a genuine wireframe gap.
- **That review was incomplete** — `grep`/`view` at the time only covered the section immediately around the rating row, not the full 1000+ line file. A near-identical card already existed further down the page (tagged `{/* Bake Art Style brand card (Check 1 Option 2) */}` — built in an *even earlier* session, already resolving this same wireframe gap with a better implementation: real `wa.me` deep-link with a prefilled message, `tel:` link for an actual phone call, and an "Official Bakery • Since 2018" trust badge). The new addition duplicated it instead of finding and reusing it.
- This is now recorded as a lesson in `tasks/lessons.md` ("Search the whole file for existing UI before adding new UI").

### কী হয়েছে (fix):
- **`src/screens/ProductScreen.tsx`**: removed the duplicate store-contact row added earlier this session (the "দোকান সহায়তা" / chat-modal + wa.me version). The pre-existing "Bake Art Style brand card (Check 1 Option 2)" — the better-built one with real WhatsApp/tel: links and the "Official Bakery • Since 2018" badge — is kept as the single, correct contact card.
- Removed the now-unused `setChatOpen` from the `useUI()` destructure (was only used by the deleted block).

### Touched files:
- `src/screens/ProductScreen.tsx`
- `tasks/lessons.md` (new lesson entry)

### Verify:
- `npx tsc --noEmit`: 0 errors in this file.
- `npm run build`: built in 11.49s

### Output ZIP:
- `product-screen-duplicate-contact-fix-071726.zip` — 1 file (`src/screens/ProductScreen.tsx`), no top-level folder.

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- **User has explicitly asked for a stricter "full/exact" redesign standard going forward** — not just "close enough, adapted where BAS differs" but matching the wireframe precisely wherever BAS's own data model allows it. Any future redesign work on this app should re-verify each target file's *entire* existing content first (not just the section being touched) before adding anything, per the new lesson above.
- User shared 2 live screenshots (Home + Rose Garden product detail) as the trigger for this bug report. Home screen screenshot showed no other obvious mismatch on inspection. If the user has more specific mismatches in mind beyond the duplicate card, they should be captured here as soon as raised.

---

## Session: Self-review follow-up — Categories icon-grid (2026-07-17)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Follow-up fix after a self-review of the earlier wireframe pass (see `tasks/self-review-wireframe-pass-071726.md`). Screen: `CategoriesScreen.tsx`.

### Review (gap found during self-review, before fix):
- The earlier Categories redesign (see the "Wireframe Redesign Pass — Categories screen" entry below) kept the pre-existing single-line horizontal chip row for category selection and only assumed it was an adequate stand-in for the wireframe's dedicated "Explore Categories" screen.
- On self-review, that assumption was flagged as wrong: the wireframe explicitly shows a **multi-row icon grid** (circle icon + label underneath each tile, wrapping across rows) as its own distinct category-browse screen — not a single-line chip strip. This was a genuine miss, not an intentional adaptation.

### কী হয়েছে:
- **`src/screens/CategoriesScreen.tsx`**: replaced the horizontal `.chip` row (All + 5 occasion categories) with a **wrapping icon-grid** — `grid-cols-4`, each tile a rounded-2xl circle icon (`OccasionIcon`, active = coral fill / inactive = ink-50) with the category label centered underneath. Same `active`/`setActive` filter logic reused untouched — only the visual shape changed from a horizontal strip to a grid, matching the wireframe's actual category-grid pattern. BAS only has 5 real categories (birthday/anniversary/wedding/cupcakes/custom) vs the wireframe's 20+ grocery departments — grid uses BAS's real category list, not fabricated extra categories, consistent with the "adapt, don't invent" principle used elsewhere in this pass (e.g. the Product screen's store-contact row).

### Touched files:
- `src/screens/CategoriesScreen.tsx`

### Verify:
- `npx tsc --noEmit`: 18 pre-existing errors in this file both before and after (confirmed via `git stash` diff, only line numbers shifted) — zero new errors.
- `npm run build`: built in 12.89s

### Output ZIP:
- `categories-icon-grid-fix-071726.zip` — 1 file (`src/screens/CategoriesScreen.tsx`), no top-level folder.

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- This was the one concrete gap surfaced by the self-review in `tasks/self-review-wireframe-pass-071726.md`. The other two items noted there (Product screen's store-contact being an adaptation not a literal copy, Cart's order-type/address selection staying in Checkout) were **intentional, reasoned adaptations**, not gaps — left as-is, not further action needed.
- With this fix, the full wireframe layout pass (`tasks/todo.md`, STATUS: COMPLETE) plus this follow-up are both done. No further wireframe-alignment work is queued unless the user raises something new.

---

## Session: Wireframe Pass — Splash/Onboarding COMPLETE (2026-07-17)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Final item (13) of the all-screens wireframe layout pass (`tasks/todo.md`). Screen: `SplashScreen.tsx`. **This closes out the entire locked-in screen list from this session.**

### Review (before fix):
- Wireframe's onboarding set has 4 slides: "Find fresh groceries anytime, anywhere" / "All Your Grocery Needs in One Place" / "Your Preferred Items, Saved for You" / "Stay Updated Every Step of the Way".
- BAS's `SplashScreen.tsx` only had 2 of these adapted (bakery-favorites + explore-selection) — 2/4, as flagged in an older log entry.

### কী হয়েছে:
- **`src/screens/SplashScreen.tsx`**: added the remaining 2 slides, bakery-adapted from the wireframe's 3rd and 4th slides — "Your Preferred Cakes, Saved for You" (wishlist theme, 💖) and "Stay Updated Every Step of the Way" (live delivery tracking theme, 🚴). `SLIDES` array now has all 4. No structural change needed — pagination dots, Skip button, and the dynamic last-slide CTA (`slideIdx === SLIDES.length - 1`) all already handle an arbitrary slide count correctly.

### Touched files:
- `src/screens/SplashScreen.tsx`

### Verify:
- `npx tsc --noEmit`: 0 errors in this file, unchanged.
- `npm run build`: built in 9.81s

### Output ZIP:
- `splash-onboarding-redesign-071726.zip` — 1 file (`src/screens/SplashScreen.tsx`), no top-level folder.

---

## ✅ ALL-SCREENS WIREFRAME PASS — SESSION SUMMARY (2026-07-17)

Full locked-in list from `tasks/todo.md`, all resolved this session:

| Screen | Result |
|---|---|
| Home | done (prior session) |
| Categories | redesigned — dynamic results header, Reviews rating filter, Reset/Apply footer |
| Product Detail | redesigned — added store-contact row (chat + WhatsApp) |
| Customize | **skipped** — BAS-specific, no wireframe equivalent |
| Cart | redesigned — reordered items→address→bill to match wireframe flow |
| Checkout | reviewed, no change — already closely mirrors wireframe |
| Success | reviewed, no change — already matches + richer |
| Orders | redesigned — Active/Completed/Cancelled tabs + search |
| Tracking | reviewed, no change — live map blocked on maps-SDK decision (Check 9, still open) |
| Wishlist | redesigned — added category filter chips |
| Profile | reviewed, no change — menu-row pattern already matches |
| Reviews (list) | reviewed, no change |
| Reviews (write) | redesigned — real product thumbnail/name/price instead of placeholder |
| Coupons | reviewed, no change — ticket-card design already matches exactly |
| Splash/Onboarding | redesigned — completed 4/4 slides (was 2/4) |
| Admin | **skipped intentionally** — not in wireframe kit, internal tool |

**All 8 ZIPs produced this session** (apply in any order, all touch different files):
`categories-screen-redesign-071726.zip`, `product-screen-redesign-071726.zip`, `cart-screen-redesign-071726.zip`, `orders-screen-redesign-071726.zip`, `wishlist-screen-redesign-071726.zip`, `write-review-screen-redesign-071726.zip`, `splash-onboarding-redesign-071726.zip`.

**Two open decisions surfaced but intentionally NOT auto-implemented** (genuine new features, not layout, flagged for the user to decide explicitly later):
1. Real Pickup order-type support (BAS is currently delivery-only).
2. Whether to build a dedicated card-based Payment Methods/Add Card screen, or keep the current inline bKash/Nagad/Wallet flow in Checkout step 2 (leaning toward keeping as-is — already functions well).

### পরবর্তী Agent এর জন্য নোট:
- The wireframe pass (`tasks/todo.md` from 2026-07-17) is now fully done. No further screens are pending from that plan.
- If the user wants either of the two open decisions above implemented, that's a new feature-scoped task — start a fresh review→report→approve cycle for it, don't fold it into "layout redesign" scope.
- Reminder carried forward: when diffing tsc errors before/after a change, run `git stash`, the tsc/grep command, and `git stash pop` as separate commands (not one `&&`-chained line) — a `grep` with no matches exits 1 and will abort a chain before the stash gets popped.

---

## Session: Wireframe Pass — Profile (no change) + Reviews screens (2026-07-17)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Items 11 & 12 of the all-screens wireframe layout pass (`tasks/todo.md`). Screens: `ProfileScreen.tsx` (reviewed, no change), `ReviewsListScreen.tsx` (reviewed, no change), `WriteReviewScreen.tsx` (redesigned).

### Profile screen — review (no fix applied):
- Wireframe's Profile screen: avatar/name header, then a menu list of icon-box + label/sub-label + chevron rows (Your profile / Manage Address / Payment / Notification / Security / Help / Logout).
- BAS's `ProfileScreen.tsx` (1217 lines) already has exactly this pattern (`menu.map(...)` rendering icon-box + label + sub + chevron rows for Wishlist / Delivery address / Payment methods / Notifications / Contact & Support / Settings), plus a wallet balance card, stats row (Orders/Wishlist/In cart), referral/invite modal, admin dashboard section for admin users. Already a strong match, richer than the wireframe. No changes made.

### Reviews (list) screen — review (no fix applied):
- Wireframe's Review screen: big average-rating number + star row + rating-breakdown bars, search + filter row, review cards (avatar, name, stars, comment, date).
- BAS's `ReviewsListScreen.tsx` already has this exact structure end to end. One wireframe element not present — a bottom "Write Review" CTA on the list screen — was deliberately **not** added: BAS's reviews are per-product (`WriteReviewScreen` requires a `productId`), while this list screen is a shop-wide aggregate with no single product in context, so a generic CTA here would have nowhere correct to send the user. The real entry point (writing a review from the product page) already exists and was improved instead (see below). No changes made to this file.

### কী হয়েছে (WriteReviewScreen):
- **`src/screens/WriteReviewScreen.tsx`**: the "order summary" card at the top used to show a hardcoded placeholder ("Product Review") instead of anything real. Now fetches the actual product via `useProducts()` + the `productId` carried on the nav view, and renders its real thumbnail, name, and price — matching the wireframe's Write Review screen, which shows the actual product being reviewed.
- Also cleaned up a pre-existing type issue: `view.productId` was accessed directly even though `productId` isn't on the base `View` union type (2 pre-existing `TS2339` errors). Introduced a single `const productId = (view as any).productId as string | undefined` and reused it everywhere instead of repeating the unsafe access — net result is 0 errors in this file now (was 2).

### Touched files:
- `src/screens/WriteReviewScreen.tsx`

### Verify:
- `npx tsc --noEmit`: before = 2 errors in this file, after = **0 errors** — net improvement, zero new errors (confirmed via `git stash` diff).
- `npm run build`: built in 13.80s

### Output ZIP:
- `write-review-screen-redesign-071726.zip` — 1 file (`src/screens/WriteReviewScreen.tsx`), no top-level folder.

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- Next in the locked order (`tasks/todo.md`): **Coupons (`CouponsScreen.tsx`)** — confirm-only pass (it was built new against the wireframe's Coupon ticket-style screen already, per the 2026-07 "My Coupons" session — just double-check it still lines up). Then **Splash/Onboarding (`SplashScreen.tsx`)** — the last item, remaining slides vs the wireframe's 4-slide onboarding set (2/4 done per an older log entry). After that, the entire locked-in screen list in `tasks/todo.md` is complete.

---

## Session: Wireframe Pass — Tracking (no change) + Wishlist category tabs (2026-07-17)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Items 9 & 10 of the all-screens wireframe layout pass (`tasks/todo.md`). Screens: `TrackingScreen.tsx` (reviewed, no change), `WishlistScreen.tsx` (redesigned).

### Tracking screen — review (no fix applied):
- Wireframe's Track Order screen: item card + vertical "Order Status" timeline + estimated-arrival box — BAS's `TrackingScreen.tsx` already has exactly this (item card, 6-step vertical timeline with icons, live estimated-delivery box, cancelled-state red card). The wireframe's separate live-map/"Get Direction"/"You Have Arrived!" screens require an actual maps SDK — this is the same still-open "Check 9" decision noted in the older wireframe gap review, correctly left unimplemented rather than faked. No changes made.

### Wishlist screen — review (before fix):
- Wireframe's "Favorite" screen: header + search icon, **category tabs** (All/Fresh Produce/Beverages/Dairy...), 2-col product grid.
- BAS's `WishlistScreen.tsx` had the header + grid but **no category filter tabs at all** — every saved item shown in one flat grid regardless of occasion. Genuine gap.

### কী হয়েছে:
- **`src/screens/WishlistScreen.tsx`**: added the same `.chip`/`OccasionIcon` category filter row already used on `CategoriesScreen.tsx` (reused per the established "reach for `.chip` before inventing new styles" lesson) — All + each occasion category, filtering the saved-products grid by `product.occasion`. Chips only render when there's at least one saved item (`saved.length > 0`) so the empty/sign-in states stay unchanged. Added a distinct lightweight "এই ক্যাটেগরিতে কোনো saved cake নেই" message for the case where items exist overall but none match the selected category (kept separate from the existing full illustrated empty-wishlist state).
- Typed the products filter chain with `safeArray<Product>` (imported `Product` type) — fixed all 5 of the file's pre-existing `unknown`-type errors as a side effect, same pattern as the Orders screen fix.

### Touched files:
- `src/screens/WishlistScreen.tsx`

### Verify:
- `npx tsc --noEmit`: before = 5 errors in this file, after = **0 errors** — net improvement, zero new errors.
- `npm run build`: built in 7.57s

### Output ZIP:
- `wishlist-screen-redesign-071726.zip` — 1 file (`src/screens/WishlistScreen.tsx`), no top-level folder.

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- Next in the locked order (`tasks/todo.md`): **Profile (`ProfileScreen.tsx`)**. Then Reviews (`ReviewsListScreen.tsx` + `WriteReviewScreen.tsx`) -> Coupons (confirm-only) -> Splash/Onboarding.
- Running total of screens done this session: Home (prior session), Categories, Product Detail, Cart, Orders, Wishlist redesigned; Customize skipped (no wireframe match); Checkout, Success, Tracking reviewed with no change needed (already well-aligned or blocked on a bigger feature decision).

---

## Session: Wireframe Pass — Success (no change) + Orders tabs (2026-07-17)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Items 7 & 8 of the all-screens wireframe layout pass (`tasks/todo.md`). Screens: `SuccessScreen.tsx` (reviewed, no change), `OrdersScreen.tsx` (redesigned).

### Success screen — review (no fix applied):
- Wireframe's "Payment Successful!" screen: checkmark badge, headline, subtext, then "View Order" / "View E-Receipt" buttons — minimal, centered.
- BAS's `SuccessScreen.tsx` already has this exact pattern plus richer additions (Order ID card w/ copy button, delivery-estimate card, item summary card, confetti) — a reasonable premium enhancement over the wireframe's minimalism, not a gap. No changes made.

### Orders screen — review (before fix):
- Wireframe's "My Orders" screen has a search icon in the header and three tabs — **Active / Completed / Cancelled** — each showing only orders in that bucket.
- BAS's `OrdersScreen.tsx` showed all orders together in one continuous list with an inline status badge per card — no tab segmentation, no search. Genuine structural gap vs wireframe.

### কী হয়েছে:
- **`src/screens/OrdersScreen.tsx`**:
  - Added **Active / Completed / Cancelled tabs** (underlined active-tab indicator, wireframe pattern) below the header. `categorize(status)`: `cancelled` -> Cancelled tab, `delivered` -> Completed tab, everything else (placed/confirmed/baking/ready/out) -> Active tab. No `Order` status values changed — purely a view-layer bucket.
  - Added a **search toggle** icon in the header (matches wireframe) that reveals an inline text input filtering by Order ID or item name within the current tab.
  - Added a **per-tab empty state** ("এই ট্যাবে কোনো অর্ডার নেই" + tab-specific subtext) distinct from the existing "no orders at all" empty state (kept unchanged, still shows for brand-new accounts).
  - Render loop switched from mapping raw `orders` to the new `tabbedOrders` (tab + search filtered).
  - Imported `Order` type and used `safeArray<Order>(orders)` for the new filter chain — this also happened to eliminate ~16 of the file's pre-existing `unknown`-type errors as a side effect (the old code's untyped `safeArray(orders).map((o) => ...)` is what caused most of them).

### Touched files:
- `src/screens/OrdersScreen.tsx`

### Verify:
- `npx tsc --noEmit`: before = 21 errors in this file, after = 5 errors — net improvement, zero new errors (confirmed message-by-message, not just count: the remaining 5 are a strict subset of the original 21, same `it`/spread-type issues untouched by this change).
- `npm run build`: built in 9.56s

### Output ZIP:
- `orders-screen-redesign-071726.zip` — 1 file (`src/screens/OrdersScreen.tsx`), no top-level folder.

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- Next in the locked order (`tasks/todo.md`): **Tracking (`TrackingScreen.tsx`)**. Then Wishlist -> Profile -> Reviews -> Coupons -> Splash/Onboarding.
- Reminder: when running `git stash` / `git stash pop` around tsc-diff checks, run each command separately (not chained with `&&` after a `grep` that might exit 1 on no matches) — otherwise a stash can be left un-popped. Always confirm `git status` is clean of unexpected stash state before moving to the next screen.

---

## Session: Wireframe Review — Checkout screen, no change needed (2026-07-17)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Item 6 of the all-screens wireframe layout pass (`tasks/todo.md`). Screen: `CheckoutScreen.tsx` (1299 lines, 3-step wizard).

### Review (result: no fix applied):
- Wireframe splits checkout into separate screens: Delivery Address, Order Type (Delivery/Pickup), Review Summary, Payment Methods, Add Card.
- BAS's `CheckoutScreen.tsx` combines these into one 3-step wizard: **Step 0** (`ঠিকানা`) = items recap + address card-selector + date/time slots; **Step 1** (`নিশ্চিত`) = gift mode + wallet/promo/referral extras + read-only order summary with Edit buttons + bill breakdown; **Step 2** (`পেমেন্ট`) = advance payment method list (bKash/Nagad, icon-box + name/desc + radio, matches wireframe's Payment Methods row pattern almost exactly already) + payment screenshot upload + remaining-amount method choice. This is a deliberate, already-good architecture from earlier sessions — combining screens into a wizard rather than separate full-screen navigations.
- Conclusion: layout/structure already closely mirrors the wireframe's intent (progress indicator, card-style sections, radio-select payment rows, Edit-to-go-back links). **No changes made** — rewriting a payment-critical, 1299-line flow for cosmetic parity would be needless risk for negligible visual gain (Simplicity First / Minimal Impact).
- **Gap noted but NOT implemented:** wireframe's Order Type has a Delivery-vs-Pickup toggle; BAS is currently delivery-only with no pickup fulfillment option anywhere in the data model or checkout flow. Adding real pickup support (store address, no delivery fee, different confirmation copy) is a genuine new feature, not a layout tweak — same category as the still-open "Check 5" (Payment Methods/Add Card) decision from the older wireframe gap review. Left for a future explicit feature decision, not auto-implemented here.

### Touched files:
- none (review-only, no code changed)

### Verify:
- N/A — no code changed, no rebuild needed.

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- Next in the locked order (`tasks/todo.md`): **Success (`SuccessScreen.tsx`)** — wireframe's "Payment Successful!" / "You Have Arrived!" states. Then Orders -> Tracking -> Wishlist -> Profile -> Reviews -> Coupons -> Splash/Onboarding.
- Two now-explicit open decisions for the user to weigh in on eventually (not urgent, don't block the rest of the pass): (1) whether to build real Pickup order-type support, (2) how to adapt wireframe's card-based Payment Methods/Add Card screens onto BAS's real bKash/Nagad/Wallet model (currently already reasonably handled inline in Checkout step 2, may not need a dedicated screen at all).

---

## Session: Wireframe Redesign Pass — Cart screen (2026-07-17)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Item 5 of the all-screens wireframe layout pass (`tasks/todo.md`). Screen: `CartScreen.tsx`.

### Review (before fix):
- Wireframe Cart order: item list (qty stepper + trash) -> "Order Type" card (Delivery/Pickup radio + time estimate) -> "Delivery/Pickup Address" summary card -> "Proceed to Checkout" button.
- BAS's `CartScreen.tsx` deliberately handles order-type and address **selection** inside the existing `CheckoutScreen.tsx` 3-step wizard (an earlier, intentional architecture decision — confirmed in older `AGENT_LOG.md` entries about the checkout wizard). Cart itself only had a quick-access row of address chips (Home/Office/Parent's/Friend's) that all just jump to Checkout.
- Gap found: layout **order** didn't match the wireframe — the address chips row was placed above the item list (free-delivery nudge -> address chips -> items -> add-ons -> bill), whereas the wireframe places item review first and the type/address summary near the bottom, right before the final CTA/bill.
- Decision: reorder only (items -> add-ons -> delivery-address quick row -> bill -> CTA) to match the wireframe's visual flow, without touching the actual order-type/address **selection** logic — that stays in `CheckoutScreen.tsx` per the existing architecture, avoiding the risk of restructuring the checkout flow for a pass that's scoped to layout only.

### কী হয়েছে:
- **`src/screens/CartScreen.tsx`**: moved the "ডেলিভারি ঠিকানা" (delivery address) quick-access chip row from above the item list to below the items + suggested add-ons section, immediately before the bill breakdown — matching the wireframe's items -> address -> bill -> CTA order. No change to click behavior (still navigates to `checkout`), no change to any pricing/discount logic.

### Touched files:
- `src/screens/CartScreen.tsx`

### Verify:
- `npx tsc --noEmit`: **0 errors** in this file both before and after (confirmed via `git stash` diff) — zero new errors.
- `npm run build`: built in 7.72s

### Output ZIP:
- `cart-screen-redesign-071726.zip` — 1 file (`src/screens/CartScreen.tsx`), no top-level folder.

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- Next in the locked order (`tasks/todo.md`): **Checkout (`CheckoutScreen.tsx`, 1299 lines, 3-step wizard)** — compare against wireframe's Order Type / Delivery Address / Review Summary / Payment Methods / Add Card screens. Then Success -> Orders -> Tracking -> Wishlist -> Profile -> Reviews -> Coupons -> Splash/Onboarding.
- Reminder for whoever continues: the wireframe literally has a "Payment Methods" screen with Cash/Wallet/Card/Paypal/Apple Pay/Google Pay options and an "Add Card" screen — BAS's real payment model is bKash/Nagad-number screenshot + in-app Wallet, so this will need the same "adapt, don't fabricate" treatment as the Product screen's store-contact row (Check 5 from the older `WIREFRAME-GAP-REVIEW-071726.md`, still open) — map wireframe's *layout* (list of payment method rows with icons + radio selection) onto BAS's *real* payment options, don't invent a literal credit-card entry flow BAS doesn't support.

---

## Session: Wireframe Redesign Pass — Product Detail screen (2026-07-17)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Item 3 of the all-screens wireframe layout pass (`tasks/todo.md`). Screen: `ProductScreen.tsx`.

### Review (before fix):
- Wireframe product-detail screen order: image gallery -> product name -> store/manager contact row (avatar + name/role + chat icon + call icon) -> weight chips -> product details -> bottom bar (qty stepper + Add Item button).
- BAS's `ProductScreen.tsx` (1013 lines) already closely matches most of this: gallery with swipe, title, rating+meta, social proof strip, price, Flavor chips, Select Weight chips (already refined in an earlier Phase 10 session), Quantity stepper, Add-ons, reviews section, sticky Add to Cart bar. The one structural piece genuinely missing was the wireframe's **store/manager contact row** — nothing between the rating row and the price/details let a customer reach the shop directly from the product page.
- Constraint: BAS is a single-shop app, not a multi-vendor marketplace, so a literal "Sophia Mitchell, Manager" fabricated contact card would be dishonest UI. Used BAS's actual existing support channels instead (global ChatBot modal + `settings.whatsappNumber`) rather than inventing fake staff data.

### কী হয়েছে:
- **`src/screens/ProductScreen.tsx`**: added a **store contact row** right after the rating/meta line — shop icon + "Bake Art Style" / "দোকান সহায়তা" label on the left, two action buttons on the right: a chat icon that opens the existing global `ChatBot` (`setChatOpen(true)` from `useUI`), and a WhatsApp/phone icon (only rendered if `settings.whatsappNumber` is set) linking to `https://wa.me/<number>`. No new data model, no fabricated contact identity — reuses `useSettingsStore` (already imported) and `useUI` (added `setChatOpen` to the existing destructure).

### Touched files:
- `src/screens/ProductScreen.tsx`

### Verify:
- `npx tsc --noEmit`: **0 errors** in this file both before and after (confirmed via `git stash` diff) — zero new errors.
- `npm run build`: built in 7.90s

### Output ZIP:
- `product-screen-redesign-071726.zip` — 1 file (`src/screens/ProductScreen.tsx`), no top-level folder.

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- Next in the locked order (`tasks/todo.md`): **Customize (`CustomizeScreen.tsx`)** — need to first check whether it maps to any wireframe screen at all (it may be BAS-specific with no wireframe equivalent, in which case skip with a note, same treatment as `AdminScreen.tsx`). Then Cart -> Checkout -> Success -> Orders -> Tracking -> Wishlist -> Profile -> Reviews -> Coupons -> Splash/Onboarding.
- Reminder: `git stash` / `git stash pop` around tsc-diff checks — if piping tsc output through `grep` with `&&` chains, a "no matches" grep (exit 1) will abort the chain **before** `git stash pop` runs, leaving changes stashed. Safer pattern: run each step as a separate command (or use `;` instead of `&&` after the grep), always confirm `git status` shows the stash was restored before moving on.

---

## Session: Wireframe Redesign Pass — Categories screen (2026-07-17)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Item 2 of the all-screens wireframe layout pass (see `tasks/todo.md` for the full locked-in order — user explicitly said do all screens one by one without asking each time, just keep this log updated). Screen: `CategoriesScreen.tsx` (bottom-tab "Categories" — BAS's combined category-browse + product-results screen).

### Review (before fix):
- Wireframe's category/results flow has two relevant screens: a big 4-column category icon grid, and a "Results for 'Fruits'" search-results screen (header = query/category name, subtitle "56 Results Found", 2-col product grid with heart/discount/add-button — this already matches BAS's existing grid closely).
- BAS's `CategoriesScreen.tsx` combines both roles in one screen (chips row for category select + grid for results) — this was already a reasonable pre-existing adaptation, so it was kept as-is (not rebuilt) per the `.chip` reuse lesson in `tasks/lessons.md`.
- Gaps found: (1) header always said static "All cakes" regardless of active category/search — wireframe's header is dynamic ("Results for X"); (2) results count line said "N cakes" instead of wireframe's "N Results Found" wording; (3) Filter sheet was missing the wireframe's "Reviews" (min star rating) filter section entirely; (4) Filter sheet footer was a single "Show N cakes" button + a small text-link reset, whereas wireframe uses a two-button footer (outline "Reset Filter" + solid "Apply").

### কী হয়েছে:
- **`src/screens/CategoriesScreen.tsx`**:
  - Header title now dynamic: shows `Results for "<search query>"` while searching, else the active category's display name (`activeCategoryName`, falls back to "All Cakes") — matches wireframe wording pattern.
  - Results count line reworded from "N cakes" to **"N Results Found"**.
  - Added a **Reviews (min rating)** filter section in the filter sheet (4.5+/4.0+/3.5+/Any rating, radio-style buttons with gold star icon) between Sort and Price Range, matching the wireframe's filter screen section order. Uses the existing `product.rating` field (already in `Product` type) — no data model change needed.
  - Filter sheet footer replaced: single "Show N cakes" button + text-link reset → **two-button row**, outline "Reset Filter" + solid "Apply" (wireframe pattern). Reset now also clears `minRating`.
  - Filter-active red-dot badge on the toolbar icon now also lights up when `minRating > 0`.

### Touched files:
- `src/screens/CategoriesScreen.tsx`

### Verify:
- `npx tsc --noEmit`: 17 pre-existing `unknown`-type errors in this file both before and after (confirmed via `git stash` diff, only line numbers shifted by +1 from the new `activeCategoryName` line) — zero new errors.
- `npm run build`: built in 8.59s

### Output ZIP:
- `categories-screen-redesign-071726.zip` — 1 file (`src/screens/CategoriesScreen.tsx`), no top-level folder.

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- Continuing the locked-in order in `tasks/todo.md` next: Product Detail (`ProductScreen.tsx`), then Customize -> Cart -> Checkout -> Success -> Orders -> Tracking -> Wishlist -> Profile -> Reviews -> Coupons -> Splash/Onboarding. `AdminScreen.tsx` is intentionally skipped (not in the wireframe kit).
- User will not be re-asked which screen is next each time — just proceed down the locked order and log each one here.
- `npm install` was needed once this session (fresh container/checkout had no `node_modules`) — `tsc`/`build` won't run without it if starting completely fresh.

---

## Session: Home Screen Layout Redesign to match wireframe (2026-07-17)
**Agent/Tool:** Claude (chat, Code Master protocol)
**Feature worked on:** Redesign existing pages' UI layout to match the wireframe (user's follow-up direction after the gap review — building NEW missing screens is on hold; instead, existing screens get a layout pass against the wireframe reference). Started with Home screen per user's choice.

### Review (before fix):
- Wireframe Home layout: avatar circle + "Location / New York, USA" + bell (top bar) → search bar with filter icon → "Exclusive Offers  See All" header + promo banner carousel → "Explore Categories  See All" header + horizontal pill chips (icon+label) → "Featured Products  See All" header + 2-column product grid.
- BAS's actual `HomeTopBar.tsx` had: pin-in-circle + "Deliver to" (uppercase label) + bell/wishlist/cart icons + a large greeting heading + search. `HomeScreen.tsx` had: "Categories" header with vertical icon-circle+label stack (not chips), banner carousel with NO header above it, and "Popular this week" as a horizontal-scroll row (not a grid) — none matched the wireframe's section headers or the grid layout.
- **Important constraint found during review:** Home is the ONLY screen carrying cart/wishlist/notification icons — `App.tsx` explicitly hides the floating `QuickBar` on Home ("the new brown HomeTopBar carries cart/bell there"). So those icons could NOT be removed from the top bar without breaking navigation, even though the wireframe's top bar doesn't show them (wireframe puts cart/wishlist behind its own bottom tab bar, which BAS's `Tab` type doesn't have — BAS tabs are home/categories/orders/profile only). Kept all 3 icons, only restyled the location block.

### কী হয়েছে:
- **`src/components/HomeTopBar.tsx`** — location block restyled to match wireframe: plain avatar circle (was pin-in-circle), label simplified from uppercase "Deliver to" to "Location" (wireframe wording), slightly larger avatar (36px) and tighter type scale. Cart/wishlist/notification icons and the personalized greeting were deliberately kept (removing them would have broken the only path to cart/wishlist/notifications from Home).
- **`src/screens/HomeScreen.tsx`**:
  - Category row: "Categories" → **"Explore Categories"** header (wireframe wording), and the layout changed from vertical icon-circle+label stack to horizontal pill chips (icon inside small colored circle + label, single row) — reuses the existing `.chip` CSS class already used on `CategoriesScreen.tsx`, so it's visually consistent with the rest of the app, not a new style.
  - Banner: added a **"Exclusive Offers / See all"** `SectionHeader` above the promo carousel (wireframe has a header here; BAS's banner previously had none).
  - "Popular this week" (horizontal scroll) → **"Featured Products"** 2-column grid (`variant="grid"` on `ProductCard`, same component already used on `CategoriesScreen.tsx`), matching the wireframe's grid layout instead of a horizontal scroll row.

### Touched files:
- `src/screens/HomeScreen.tsx`
- `src/components/HomeTopBar.tsx`

### Verify:
- `npm run build`: **✓ built in 15.42s**
- `npx tsc --noEmit`: `HomeScreen.tsx` has the same 56 pre-existing `unknown`-type errors as the untouched baseline (verified by diffing error count against a clean checkout of the same commit) — **zero new errors**. `HomeTopBar.tsx`: zero errors, same as before.

### Output ZIP:
- `home-screen-redesign-071726.zip` — 2 files, no top-level folder.

### এখনো Pending / পরবর্তী Agent এর জন্য নোট:
- User wants this same review→redesign pass repeated for other existing screens next (their choice, one at a time) — not new screens, just layout alignment to the wireframe reference (`Grocery-Delivery-App-Wireframe-Figma-Design.png`, referenced in `WIREFRAME-GAP-REVIEW-071726.md`).
- The Check 5 (Payment Methods screen) discussion is still unresolved — BAS has no customer-owned saved card/payment-method concept (customers always send money to the shop's fixed bKash/Nagad number, verified via screenshot), so the wireframe's literal "Add Card" screen doesn't map onto BAS's business model. User was asked to pick an adapted approach (saved-number book / info screen / skip) but then redirected to "redesign existing pages" instead — this decision is still open whenever Check 5 comes back up.
- Reference for future screens: `.chip`/`.chip-active` CSS classes (index.css) and `ProductCard` `variant="grid"` are the reusable building blocks that keep new layout work visually consistent with the rest of the app — reach for those before inventing new one-off styles.

---

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
