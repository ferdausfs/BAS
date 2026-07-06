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
