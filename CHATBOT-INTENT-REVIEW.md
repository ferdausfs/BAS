# ChatBot Intent-Matching — Review Report

**Trigger:** Screenshot-এ দেখা গেছে user "kintu ami to payment koresi" লিখলে bot fallback না দিয়ে সরাসরি generic `paymentText()` (payment process explanation) দিচ্ছে — যেটা ভুল উত্তর, কারণ user আসলে বলছে "আমি তো টাকা দিয়ে দিয়েছি" (একটা complaint/status-check, process জানতে চাওয়া না)।

এই report-এ শুধু এই একটা bug না, বরং **online store-এ সাধারণত যেসব customer-problem আসে** তার তালিকা ধরে ChatBot.tsx-এর বর্তমান keyword-matching কোনগুলো মিস করছে সেটা বের করা হয়েছে। কোনো code change করা হয়নি — শুধু review।

---

## Check 1: "Payment করে ফেলেছি" bug (screenshot-এর মূল সমস্যা)
**Code reference:** `src/components/ChatBot.tsx:290-292`
```ts
if (has(q, ['price', 'দাম', 'tk', 'টাকা', 'payment', 'পেমেন্ট', 'bkash', 'bikash', 'nagad', 'cash', 'koto taka', 'koto dam', 'daam', 'dam', 'taka koto', 'cost', 'charge', 'fee', 'koye taka', 'koto koye'])) {
  return { text: paymentText(), matched: true };
}
```
**What found:** এই block শুধু "payment" শব্দ আছে কিনা দেখে — user process জানতে চাইছে না already করে ফেলেছে সেটা differentiate করে না। "kintu ami to payment koresi" (payment already করেছি) match করে এই একই branch-এ, ফলে user-কে আবার থেকে "কীভাবে payment করবেন" বলা হয় — যেটা তার প্রশ্নের উত্তর না।
**Gap:** "koresi", "diyechi", "kore disi", "already", "already dise", "hoye gese", "kore ফেলেছি" জাতীয় completed-action শব্দ এই branch-এর আগে check হয় না। এমন phrase আসলে "payment হয়নি reflect করছে" / "screenshot verify হয়নি" ধরনের সমস্যা — এটার জন্য আলাদা intent দরকার (নিচে suggestion আছে)।
**Priority:** High (এটাই screenshot-এ দেখা সমস্যা)

---

## Check 2: "Order confirm হয়েছে কিন্তু cake আসেনি / দেরি হচ্ছে" — delay complaint intent নেই
**Code reference:** `src/components/ChatBot.tsx:267-272` (tracking block) ও `282-284` (delivery/zone block)
**What found:** `track`, `status`, `delivery`, `zone` ইত্যাদি শব্দে match হয় — কিন্তু "deri hocche", "ekhono ase nai", "kotokkhon lagbe r", "time to shesh hoye gese" জাতীয় **impatience/delay-complaint** phrase আলাদা করে ধরা হয় না, এগুলো generic `zoneText()` (delivery zone list) বা `orderStatusText()`-এ চলে যায় যেটা সরাসরি delay নিয়ে সহানুভূতিশীল response দেয় না।
**Gap:** "deri", "দেরি", "ekhono ase nai", "asheni", "koto deri", "late" জাতীয় শব্দের জন্য আলাদা empathetic branch নেই — এখন সেটা generic zone/delivery-estimate text-এ পড়ে, যেটা robotic লাগে।
**Priority:** Medium

---

## Check 3: "ভুল জিনিস পাঠিয়েছে / জিনিস নষ্ট/damage হয়ে এসেছে" — কোনো intent নেই
**Code reference:** পুরো `ruleBasedReply()` (`188-338`)-এ এই ধরনের কোনো keyword block নেই।
**What found:** "wrong item", "ভুল কেক", "damage", "নষ্ট হয়ে এসেছে", "vangা", "pura khaite pari nai" — এসব কোনো keyword match হয় না, সরাসরি fallback (`339`) বা Gemini-তে চলে যায় (Gemini key না থাকলে fallback)।
**Gap:** এটা bakery-তে খুবই common complaint (perishable product) — fallback message ("হুম, ঠিক বুঝলাম না...") একদম কাজের না এই context-এ, উচিত সরাসরি support/WhatsApp-এ পাঠানো (`supportText()`)।
**Priority:** High (perishable/food product — damage complaint দ্রুত human-এ route করা জরুরি)

---

## Check 4: "Discount/Promo code কাজ করছে না" — আলাদা intent নেই
**Code reference:** কোনো reference নেই; `paymentText()` (`153-159`)-এ শুধু promo আছে কিনা mention করে, "কাজ করছে না" এমন complaint ধরার জন্য কিছু নেই।
**What found:** "promo code hocche na", "discount কাজ করছে না", "code error" — এসব `price/payment` branch-এ পড়ে গিয়ে generic payment info পায়, promo-specific answer পায় না।
**Gap:** Promo validity/expiry নিয়ে আলাদা branch না থাকায় user confuse হতে পারে।
**Priority:** Low-Medium

---

## Check 5: "Order ভুল করে দিয়ে ফেলেছি, বাতিল/edit করতে চাই" (submit-এর ঠিক পরে) — cancel-এর সাথে গুলিয়ে যাচ্ছে
**Code reference:** `src/components/ChatBot.tsx:306-319`
```ts
if (has(q, ['cancel', 'refund', 'বাতিল', 'রিফান্ড'])) {
  const cancelled = myOrders().filter((o) => o.status === 'cancelled');
  ...
```
**What found:** এই branch ধরে নেয় user জিজ্ঞেস করছে "আমার order টা কেন cancel হলো" (admin-initiated cancel-এর কারণ জানতে চাওয়া)। কিন্তু user নিজে ভুল order দিয়ে ফেলে **নিজে cancel করতে চাইলে** ("amar order ta cancel korte chai", "vul order hoye gese") এই একই branch-এ পড়ে, অথচ response টা assume করে order ইতিমধ্যে cancelled — যেটা ভুল context।
**Gap:** "cancel করতে চাই" (future/request) vs "কেন cancel হলো" (past/explanation) — এই দুই intent আলাদা করা দরকার।
**Priority:** Medium

---

## Check 6: Order ID ছাড়া "amar order ki obosthay" (আমার অর্ডার কী অবস্থায়) ঠিকই কাজ করে — এটা ভালো
**Code reference:** `191-218` (`orderStatusText`)
**What found:** এটা ইতিমধ্যে ভালোভাবে handle করা — order ID match, saved customer phone/name match সবই আছে। কোনো gap নেই, শুধু reference হিসেবে রাখা হলো।
**Priority:** N/A (no action needed)

---

## Summary

| Check | বিষয় | Priority |
|-------|------|----------|
| 1 | "Payment করেছি" completed-action bug (screenshot bug) | **High** |
| 2 | Delivery delay complaint (empathetic branch নেই) | Medium |
| 3 | Wrong/damaged item complaint (কোনো intent নেই) | **High** |
| 4 | Promo code কাজ না করা | Low-Medium |
| 5 | Self-initiated cancel request vs cancel-reason confusion | Medium |
| 6 | Order status lookup | ঠিক আছে |

---

## প্রস্তাবিত fix approach (approval-এর জন্য, এখনই code change করা হয়নি)

1. **Check 1 (High):** "payment" branch-এর **আগে** একটা নতুন `paymentAlreadyDone` intent বসানো — keywords: `koresi`, `kore disi`, `diyechi`, `dise`, `already`, `already dise`, `hoye gese`, `screenshot dise`, `taka dise`, `send korsi` + সাথে payment-related শব্দ (`payment`, `taka`, `bkash`, `nagad`) থাকলে match। Response: user-এর latest order-এ payment/verification status দেখিয়ে বলবে — যদি এখনো "placed"-এর আগে আটকে থাকে, screenshot verify হতে একটু সময় লাগে + support link দেবে; user-এর সংশ্লিষ্ট saved order থাকলে `orderStatusText()`-এর মতো real data দেখাবে।
2. **Check 3 (High):** নতুন `damagedOrWrongItem` intent — keywords: `wrong item`, `ভুল কেক`, `damage`, `damaged`, `নষ্ট`, `vanga`, `bhanga`, `pochonsod hoyni`, `kharap ese` → সরাসরি `supportText()` + সহানুভূতিশীল opening line ("দুঃখিত এই সমস্যার জন্য...")।
3. **Check 2 (Medium):** `deri`, `late`, `ekhono ashe nai`, `asheni` জাতীয় শব্দে delay-empathy branch, যেটা current order status + support link দুটোই দেখাবে।
4. **Check 5 (Medium):** cancel branch-কে দুই ভাগে split — "cancel korte chai / korbo" (future intent) হলে "কীভাবে cancel request করবেন" বলা, আর "keno cancel hoyeche" (past) হলে বর্তমান logic।
5. **Check 4 (Low-Medium):** সময় থাকলে optional, পরের cycle-এ করা যায়।

**অনুরোধ:** এই ৫টার মধ্যে কোনগুলো এখনই fix করবো বলুন (সবগুলো, নাকি শুধু High priority ২টা — Check 1 ও Check 3)? Approve করলে আমি শুধু approved item-গুলোর জন্য `ChatBot.tsx`-এ fix করে ZIP দেবো, protocol অনুযায়ী।
