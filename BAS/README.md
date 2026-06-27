# বেক আর্ট স্টাইল 🎂

হোমমেড কেক বিক্রির ওয়েব অ্যাপ — React + Vite + TypeScript + Supabase

## Quick Start

```bash
npm install
cp .env.example .env   # .env ফাইলে Supabase keys দিন
npm run dev
```

## Setup

### Supabase
1. [supabase.com](https://supabase.com) এ project তৈরি করুন
2. `supabase-schema.sql` চালান SQL Editor-এ
3. Project URL ও anon key `.env` ফাইলে দিন

### .env
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

> **Supabase ছাড়াও চলবে** — localStorage fallback আছে।

## Deploy (Vercel)

1. GitHub-এ push করুন
2. [vercel.com](https://vercel.com) এ import করুন
3. Environment variables দিন
4. Auto deploy হবে প্রতিটি push-এ

### GitHub Secrets (CI/CD এর জন্য)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

## Admin Panel
Logo-তে ৫ বার tap করুন → PIN দিন (default: `1234`)

## Modal / Popup System

Any modal, sheet, or popup that should hide the bottom navigation bar must use the `useModalDepth` hook.

### How to use

```tsx
import { useModalDepth } from '../hooks/useModalDepth';

export default function MyNewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useModalDepth(open); // ← this one line hides the navbar automatically

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      {/* modal content */}
    </div>
  );
}
```

### How it works

- `useModalDepth(open)` increments a global counter (`modalDepth` in `useUI`) when `open` is true, and decrements it when `open` becomes false or the component unmounts.
- The BottomTabBar is hidden whenever `modalDepth > 0`.
- Counter-based (not boolean), so multiple simultaneous modals work correctly.
- **You never need to touch `App.tsx` or pass callbacks through props** — just add `useModalDepth(open)` to any new modal component.

### z-index conventions

| Layer | z-index | Used for |
|-------|---------|----------|
| Bottom nav | z-30 | BottomTabBar |
| Sheets | z-50 | WalletHistoryModal, InviteSheet |
| Auth / overlay | z-[60], z-[61] | AuthSheet backdrop + panel |
| Notifications | z-[65] | NotificationsSheet |

New modals should use `z-50` minimum to appear above the navbar.

## Project Structure
```
src/
├── components/    ← UI components (Navbar, Hero, Menu, Cart, etc.)
├── pages/         ← HomePage, AdminPanel
├── hooks/         ← useProducts, useOrders, useAuth
├── lib/           ← supabase client, store (Zustand), utils, data
└── types/         ← TypeScript types
```
