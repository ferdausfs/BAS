# Bake Art Style 🎂

হোমমেড কেক বিক্রির PWA ওয়েব অ্যাপ — **React + Vite + TypeScript + Firebase + Zustand + Tailwind v4**, **Cloudflare Workers**-এ deploy করা হয়।

## Quick Start

```bash
npm install
cp .env.example .env     # .env ফাইলে Firebase + Cloudinary keys দিন
npm run dev             # local dev server (Vite)
npm run build           # production build → dist/index.html (single-file inline)
npm run typecheck       # tsc --noEmit — বর্তমানে 0 errors
```

## Tech Stack

| Concern | Solution |
|---|---|
| UI framework | React 19 + Vite 7 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (`@theme` tokens in `src/index.css`) |
| State | Zustand + persist middleware (`localStorage`) |
| Backend / DB | Firebase Firestore + Auth (email link, email/pass, Google, Facebook, phone OTP) |
| File uploads | Cloudinary (unsigned preset — **replace with signed upload** in production) |
| Chatbot | Google Gemini 2.5 Flash (client-side key; **move to server proxy** in production) |
| Deploy | Cloudflare Workers (Static Assets via `wrangler`) |
| CI/CD | GitHub Actions → `main` এ push হলে auto-deploy |

## Firebase Setup

1. [console.firebase.google.com](https://console.firebase.google.com)-এ project তৈরি করুন
2. Authentication → Sign-in method-এ Email/Password, Email link, Google, Phone চালু করুন
3. Firestore Database create করুন (production mode start করুন, তারপর `firestore.rules` deploy করুন)
4. Web app যোগ করে config copy করুন, `.env`-তে বসান
5. Rules deploy করুন:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # (if not already inited)
firebase deploy --only firestore:rules
```

### Firestore rules overview

- `products`, `banners`, `gallery_items`, `app_settings` — public read, admin write
- `profiles/{userId}` — owner + admin R/W; nested `wallet/` subcollection owner-only
- `orders` — signed-in create; admin + owner read; admin update/delete
- `referral_codes/{code}` — signed-in read; owner/admin write (flat public-lookup collection, avoids profile-collection scans)
- `referral_uses/{id}` — own records read/create; admin update/delete
- `app_settings/referral_*` keys — signed-in users লিখতে পারে (cross-device referral bookkeeping)

### First admin bootstrap

Firebase Console-এ প্রথম admin user-এর profile document-এ `is_admin: true` set করুন। App email-based bootstrap fallback-ও রাখে (`src/App.tsx`-এ `umuhammadiswa@gmail.com` hardcoded), কিন্তু server-side authority সবসময় `profiles.is_admin` flag।

## .env variables

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
# Optional (client-side, key is public — set domain restrictions in Google AI Studio)
VITE_GEMINI_API_KEY=...
```

> **Note:** `VITE_` prefix-এর যেকোনো key production JS bundle-এ inlined থাকে → secret না রাখাই ভালো। Cloudinary unsigned preset, Gemini Key এগুলোর domain restriction / server proxy ব্যবহার করুন।

## Admin Panel

Logo-তে ৫ বার tap করুন → PIN দিন (default `1234` — **production-এ অবশ্যই পরিবর্তন করুন**)।

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Single-file production build (`dist/index.html`) |
| `npm run preview` | Build + preview the production bundle |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run deploy` | Alias for `npm run build` (CI step handles `wrangler deploy`) |

## Project layout

```
src/
├── App.tsx                  # Route tree
├── main.tsx                 # React root
├── index.css                # Tailwind v4 @theme tokens + utilities
├── components/              # Reusable UI
│   ├── AdminPanel.tsx       # Admin dashboard (rendered from AdminScreen)
│   ├── ChatBot.tsx          # BAS chat (rule-based + Gemini fallback)
│   ├── DebugMetrics.tsx     # (removed — dead code)
│   ├── DebugOverlay.tsx     # (removed — dead code)
│   └── ...
├── hooks/                   # Data hooks (Firestore onSnapshot wrappers)
│   ├── useProducts.ts
│   ├── useOrders.ts         # useOrdersHook (live subscriptions)
│   ├── useAuth.ts           # Firebase Auth session
│   └── ...
├── lib/
│   ├── firebase.ts          # Firebase init + isFirebaseConfigured()
│   ├── store.ts             # Zustand stores (UI/cart/orders/settings/wallet/auth/location/user)
│   ├── firestoreMappers.ts  # Firestore doc ⇄ app model
│   ├── data.ts              # Default settings + fallback products
│   ├── utils.ts             # formatBDT, waLink, safeArray, ls, playBeep…
│   └── zones.ts             # BD districts / delivery helpers
├── screens/                 # Full pages
└── types/index.ts           # TypeScript models (Product, Order, CartItem, …)
firestore.rules              # Production security rules
wrangler.jsonc               # Cloudflare Workers config
.github/workflows/deploy.yml # CI/CD
```

## Modal / Popup System

Any modal/sheet/popup that should hide the bottom navigation bar must call `useModalDepth(open)`.

## Accessibility notes

- সমস্ত icon button-এ `aria-label` আছে
- Bottom tab bar fixed, not hidden by keyboard (safe-area inset handled)
- Color palette meets 4.5:1 contrast for primary text on surface (per P5 audit)

## Known caveats (intentional)

- `vite-plugin-singlefile` production build-এ সমস্ত JS/CSS single `index.html`-এ inline করে — easy CF Workers deploy, কিন্তু code-splitting নেই (initial load ~1.28 MB / 355 KB gzip)।
- `public/sw.js` self-unregistering service worker (old PWA attempt cleanup).
- Guest checkout-এর জন্য Firestore rules `orders.create` require `signedIn()` — anonymous auth enable করে guest login flow add করা যেতে পারে।
- Cloudinary unsigned preset domain/IP restriction দিতে হবে production-এ।
- Gemini key client-side — Google AI Studio-তে domain restriction add করুন, অথবা `functions/` proxy-এ move করুন।

## License

Private — Bake Art Style © 2026.
