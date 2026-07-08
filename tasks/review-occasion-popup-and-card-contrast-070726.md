# Review Report — (A) Occasion → Search Popup + Bigger Banner, (B) Product Card Contrast

Two concepts reviewed together (per user request), fix হবে আলাদা আলাদা ZIP-এ।

---

## CONCEPT A — Occasion row কে Search bar-এর popup-এ সরানো + Banner বড় করা

### Check A1: বর্তমান occasion row layout
**Code reference:** `src/screens/HomeScreen.tsx` line 219-263
**What found:** Occasion row একটা horizontal scroll strip, hero section-এর ঠিক নিচে, permanently visible (zero-tap browsing)। প্রতিটা chip 52×52px icon + label, `anim-up delay-1` দিয়ে animate হয়।
**Gap:** এই strip vertical space নেয় (icon+label+padding মিলিয়ে ~90px), যেটা সরালে banner-এর জন্য জায়গা ফাঁকা হবে। কিন্তু এটা সরালে "glance করেই সব category দেখা যায়" benefit-টা এক-tap-এর পেছনে চলে যাবে (আগেই আলোচনা হয়েছে)।

### Check A2: Search bar component — button বসানোর জায়গা
**Code reference:** `src/components/SearchBar.tsx` line 18-39
**What found:** Search bar একটা relative wrapper, ভেতরে left icon (Search) + input + conditional right-side clear (X) button (`value &&`)। Clear button আর নতুন occasion-trigger button — দুটোই একসাথে ডান পাশে বসাতে গেলে জায়গা কম পড়বে, বিশেষত input-এ কিছু টাইপ করা অবস্থায়।
**Gap:** নতুন `onOpenOccasions` (বা similar) prop যোগ করতে হবে, আর right-side এ icon button বসানোর জন্য input-এর `pr-12` কে বাড়িয়ে দুটো icon-এর জায়গা বানাতে হবে (e.g. clear button input-এর ভেতরে থাকলে, occasion trigger আরেকটু বামে অথবা input-এর বাইরে, search bar-এর ডান পাশে আলাদা circular button হিসেবে)।

### Check A3: Occasion popup-এর জন্য reusable pattern আছে কিনা
**Code reference:** `src/components/NotificationsSheet.tsx` (পুরো file, 87 lines)
**What found:** App-এ already একটা established bottom-sheet pattern আছে — `useModalDepth` hook, `glass-strong` container, backdrop overlay button, `anim-fade`/`anim-up` animation, header + close (X)। এই একই pattern হুবহু reuse করা যাবে occasion popup-এর জন্য — নতুন animation/CSS system বানাতে হবে না।
**Gap:** কোনো gap না — এটা positive finding, existing pattern অনুসরণ করলে consistency বজায় থাকবে।

### Check A4: Occasion tap করলে zoom-transition animation — modal-এর ভেতর থেকে কাজ করবে কিনা
**Code reference:** `src/screens/HomeScreen.tsx` line 82-127 (`openOccasion` function)
**What found:** এই function `btn.getBoundingClientRect()` দিয়ে **runtime-এ** ক্লিক করা button-এর exact position নেয় — hardcoded position না। তাই chip-টা home screen-এ থাকুক বা popup/modal-এর ভেতরে থাকুক, এই zoom animation code অপরিবর্তিত রেখেই কাজ করবে।
**Gap:** শুধু এটুকু নিশ্চিত করতে হবে — popup বন্ধ (unmount) হওয়ার আগেই zoom overlay শুরু হওয়া উচিত, নাহলে popup close animation আর zoom animation-এ visual conflict হতে পারে। Fix পর্যায়ে সময়মতো `onClose()` কল করে handle করা যাবে (popup বন্ধ করেই zoom শুরু, ~0ms delay)।

### Check A5: Banner বড় করার জায়গা
**Code reference:** `src/screens/HomeScreen.tsx` line 307-420 (banner carousel block)
**What found:** Banner carousel বর্তমানে fixed height/aspect-এ আছে, occasion row (line 219-263) সরালে যে vertical space ফাঁকা হবে সেটা banner-এর height বাড়াতে দেওয়া যাবে অথবা banner-এর margin-top কমিয়ে হিরো section-এর সাথে visually closer করা যাবে।
**Gap:** Exact নতুন height/aspect-ratio এখনো ঠিক হয়নি — fix পর্যায়ে আলোচনা করে ঠিক করবো (কতটা বড় করবে সেটা user-এর preference)।

---

## CONCEPT B — Product Card "ভালো দেখাচ্ছে না" (contrast/depth issue)

### Check B1: Page background color
**Code reference:** `src/index.css` line 62-67
**What found:** `html, body` background flat `#F9F9F7` (off-white/cream) — কোনো gradient/texture নাই।

### Check B2: `.glass-strong` card background (ProductCard যা ব্যবহার করে)
**Code reference:** `src/index.css` line 201-210
**What found:** `.glass-strong` হলো `linear-gradient(158deg, #FFFFFF 0%, #FFF8FA 100%)` + খুবই হালকা shadow (max alpha 0.09) + 1px near-invisible border (`rgba(232,82,106,0.07)`)। এটা আসলে backdrop-blur na — flat opaque near-white card (comment-এ লেখা আছে "no backdrop-filter dependency" — আগের glassmorphism theme থেকে already সরানো হয়েছে)।
**Gap:** **এখানেই মূল সমস্যা** — card-এর background (`#FFFFFF`→`#FFF8FA`) আর page background (`#F9F9F7`) — দুটোই প্রায় same near-white টোন। শুধু ~8-9% alpha shadow দিয়ে এত কাছাকাছি দুটো রঙের মধ্যে boundary বোঝানো কঠিন — বিশেষ করে "Popular this week" horizontal row-এ (line 519-537) যেখানে card গুলো plain cream background-এর উপর বসে, কোনো mesh/gradient backdrop নাই (hero section-এর মতো `.mesh-warm` এখানে নাই)।

### Check B3: ProductCard-এর horizontal variant (screenshot-এ যেটা দেখা গেছে)
**Code reference:** `src/components/ProductCard.tsx` line 210-317
**What found:** Card-এ occasion accent strip (line 216, 3px top), badges (Best/New, line 265-281), floating price+add (line 283-293) — সবই ঠিকঠাক আছে এবং individually ভালো দেখায়। কিন্তু card-এর নিজের **body boundary** (photo-এর নিচের content অংশ, line 296-315 — সাদা background-এর উপর সাদা-ঘেঁষা card) কোনো visible edge/depth ছাড়াই page-এর সাথে মিশে যাচ্ছে।
**Gap:** Reorder ticket-stub card (`HomeScreen.tsx` line 483-484) একই issue-এ পড়েনি কারণ ওটায় explicit `boxShadow: '0 1px 2px rgba(26,19,17,.02), 0 8px 24px -18px rgba(26,19,17,.18)'` (অনেক বেশি strength) দেওয়া আছে ইনলাইনে, `.glass-strong`-এর default shadow-এর বাইরে গিয়ে। ProductCard কোনো extra inline shadow ছাড়া শুধু class-এর default (0.08-0.09 alpha) নির্ভর করে আছে।

---

## Summary

| Check | Priority |
|-------|----------|
| A1 — Occasion row space claim, tradeoff acknowledged | Info |
| A2 — SearchBar needs new prop + right-side button slot | High |
| A3 — Reusable bottom-sheet pattern available (NotificationsSheet) | Info (positive) |
| A4 — Zoom-transition compatible with modal, needs close-timing care | Medium |
| A5 — Banner size increase — needs user's target size | Medium (needs decision) |
| B1 — Page bg vs card bg near-identical tone | Info |
| B2 — `.glass-strong` shadow too weak for its own contrast | **High** |
| B3 — ProductCard missing the extra inline shadow that reorder-card has | **High** |

---

## Raw code snippets

**`.glass-strong` (src/index.css:201-210):**
```css
.glass-strong {
  background: linear-gradient(158deg, #FFFFFF 0%, #FFF8FA 100%);
  border: 1px solid rgba(232,82,106,0.07);
  box-shadow:
    0 1px 2px rgba(0,0,0,0.04),
    0 6px 20px -6px rgba(0,0,0,0.08),
    0 20px 48px -16px rgba(232,82,106,0.09),
    inset 0 1px 0 rgba(255,255,255,1);
}
```

**Reorder card's stronger inline shadow (src/screens/HomeScreen.tsx:483-484):**
```tsx
className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/40 glass-strong p-3.5 pt-4 text-left transition active:scale-[.98]"
style={{ boxShadow: '0 1px 2px rgba(26,19,17,.02), 0 8px 24px -18px rgba(26,19,17,.18)' }}
```

**SearchBar current right-side slot (src/components/SearchBar.tsx:30-39):**
```tsx
{value && (
  <button
    onMouseDown={(e) => e.preventDefault()}
    onClick={() => onChange('')}
    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-ink-50 text-ink-300 transition active:scale-90"
    aria-label="Clear search"
  >
    <X className="h-3.5 w-3.5" strokeWidth={2.5} />
  </button>
)}
```

**openOccasion zoom-transition (src/screens/HomeScreen.tsx:82-96) — uses runtime rect, modal-safe:**
```tsx
const openOccasion = (c: (typeof categories)[number], btn: HTMLButtonElement) => {
  if (pressedOccasion) return;
  setPressedOccasion(c.id);
  const rect = btn.getBoundingClientRect();
  const { setOccasionZoom, go } = useUI.getState();
  setOccasionZoom({ top: rect.top, left: rect.left, width: rect.width, height: rect.height, radius: 16, color: c.color, stage: 'start' });
  // ...grow + navigate + fadeout timeouts follow
};
```
