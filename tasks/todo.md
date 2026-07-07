# Todo — Order cancellation reason + tracking/chat cleanup

**Feature:** Admin cancel-reason popup, cancelled-order tracking UI simplification, chatbot cancel-reason awareness

## Plan
- [ ] `src/types/index.ts` — add `Order.cancelReason?: string`
- [ ] `src/lib/firestoreMappers.ts` — map `cancel_reason` <-> `cancelReason` in `mapOrderDoc`/`orderToDoc`
- [ ] `src/lib/store.ts` — `setOrderStatus(id, status, reason?)` stores reason on order + refund notification includes it
- [ ] `src/hooks/useOrders.ts` — `updateStatus(id, status, reason?)` writes `cancel_reason` to Firestore
- [ ] `src/components/AdminPanel.tsx` — intercept cancel action (both the `<select>` and quick-status buttons) with a confirm modal: preset reason chips + custom textarea, Confirm required before actually cancelling. WhatsApp message to customer includes the reason when cancelled.
- [ ] `src/screens/TrackingScreen.tsx` — when `status === 'cancelled'`: hide the 6-step LIVE STATUS timeline entirely, show reason (if present) inside the existing red cancelled card, hide floating "সাহায্য দরকার?" button (redundant with card's সাপোর্ট button)
- [ ] `src/components/ChatBot.tsx` — cancel/refund intent: look up user's latest cancelled order and state the actual `cancelReason` if present, else keep existing generic fallback
- [ ] `npm run build` verify, ZIP changed files only, update `AGENT_LOG.md`

## Review
সব item সম্পূর্ণ। `npm run build` → `✓ built in 6.61s`। `tsc --noEmit` error count touched files-এ আগে (24) ও পরে (24) সমান — নতুন কোনো error যোগ হয়নি (git stash diff দিয়ে confirm করা)। বিস্তারিত `AGENT_LOG.md`-এর সর্বশেষ entry-তে।

---

# Round 2 — Chatbot modal broken + OrdersScreen cancelled display

**Bug reports (screenshots):**
1. Tracking screen-এ "সাপোর্ট"/"সাহায্য দরকার?" ক্লিক করলে কিছু হয় না (cancelled + normal দুই screen-এই)
2. OrdersScreen-এ cancelled order "PLACED" দেখাচ্ছে (ভুল), "Order again" বাটন cancelled order-এও থাকছে

## Root cause
- `ChatBot.tsx` line 401: `if (!embedded) return null;` — non-embedded mode কখনো implement হয়নি, আর কোথাও global `chatOpen` state শুনে `<ChatBot>` mount করা হয় না। তাই `setChatOpen(true)` কল হলেও কিছু render হয় না।
- `OrdersScreen.tsx`-এর `STATUSES` array-তে `'cancelled'` নেই → `findIndex` রিটার্ন করে `-1` → label fallback হয় `'Placed'`।

## Plan
- [ ] `ChatBot.tsx`: `!embedded` মোডে global `chatOpen`/`setChatOpen` (useUI) দিয়ে full-screen modal (backdrop + close X) হিসেবে render করবো
- [ ] `App.tsx`: global `<ChatBot />` (non-embedded) mount করবো root level-এ, যাতে যেকোনো screen থেকে `setChatOpen(true)` কাজ করে
- [ ] `OrdersScreen.tsx`: `status === 'cancelled'` হ্যান্ডল করবো — badge "Cancelled" (red), progress/steps hide, শুধু single full-width red "Track order" বাটন (Order again সরানো), cancelReason থাকলে ছোট করে দেখাবো
- [ ] Build verify + AGENT_LOG.md update + ZIP

## Review (Round 2)
সব item সম্পূর্ণ। `npm run build` → `✓ built in 8.40s`। Root cause দুটোই confirm করা হয়েছে code পড়ে (dead `if (!embedded) return null` branch, আর `STATUSES` array-তে `'cancelled'` না থাকা) — guess করে fix করা হয়নি। বিস্তারিত `AGENT_LOG.md`-এর সর্বশেষ entry-তে।

---

# Home Screen Premium Color Pass (2026-07-07 session, implemented)

Approved direction from AGENT_LOG.md 07-07 session, refined after review + user decisions:

## Decisions locked in this session
- Occasion icon (idle AND tap state) now uses category `fg` color — not just background. (User confirmed.)
- ProductCard badges: keep existing Best=gold / New=coral as-is (don't touch — original plan's "Best=plum/Fresh=sage" assumed a state that doesn't exist in code). Add category color only as a small, low-risk accent — a thin top strip — not a badge rework.

## Tasks
- [ ] `src/types/index.ts` — add `fg: string` to `Category` type
- [ ] `src/lib/data.ts` — replace 5x `color: '#FFE2E7'` with approved bg/fg pairs
- [ ] `src/index.css` — add `--color-plum`, `--color-plum-tint`, `--color-sage`, `--color-sage-tint` tokens (gold already exists)
- [ ] `src/screens/HomeScreen.tsx`
  - [ ] occasion icon idle + active color → `c.fg`
  - [ ] reorder card → ticket-stub treatment (gold→plum top strip + perforation notches)
  - [ ] banner → small wax-seal "Est. 2018" badge, top-right, decorative only
- [ ] `src/components/ProductCard.tsx` — thin top accent strip color-mapped to `product.occasion` (both `grid` and `horizontal` variants)
- [ ] `tsc --noEmit` — diff error count vs baseline (162, all pre-existing per log)
- [ ] `npm run build` — confirm `✓ built`
- [ ] Update `AGENT_LOG.md`
- [ ] ZIP only touched files, unique filename

## Review (fill in after implementation)

---

# Follow-up: "still feels flat" fix (2026-07-07, same day)

User feedback after the color pass: page overall still felt flat despite the
new per-category colors. Root cause: occasion chips were the only element on
the page with zero depth (flat solid color square, no shadow/gradient/border)
while everything else (search bar, cards, banner) already has layered shadows.

## Fix
- `src/screens/HomeScreen.tsx` — occasion chip background changed from flat
  `c.color` to a subtle gradient (`c.color` → white) + tinted layered box-shadow
  (using `c.fg` at low alpha) + hairline border, active state gets a stronger
  tinted shadow. No layout/behavior change, purely visual depth.

## Verify
- `tsc --noEmit`: 162 (unchanged)
- `npm run build`: `✓ built in 9.84s`
