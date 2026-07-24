
export function hapticTap(pattern: number | number[] = 12) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    (navigator as Navigator & { vibrate: (pattern: number | number[]) => boolean }).vibrate(pattern);
  }
}

export function safeArray<T>(v: unknown, fallback: T[] = []): T[] {
  return Array.isArray(v) ? (v as T[]) : fallback;
}

// LocalStorage helpers
export const ls = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const v = localStorage.getItem(key);
      if (!v) return fallback;
      const parsed = JSON.parse(v);
      if (Array.isArray(fallback)) {
        return (Array.isArray(parsed) ? parsed : fallback) as unknown as T;
      }
      return (parsed !== null && parsed !== undefined ? parsed : fallback) as T;
    } catch {
      return fallback;
    }
  },
  set: <T>(key: string, val: T): void => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota */ }
  },
  remove: (key: string): void => localStorage.removeItem(key),
};

// Simple hash for admin PIN
export const hashPass = (s: string): string => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
};

// Phone validator (Bangladesh)
export const isValidPhone = (p: string): boolean => {
  const digits = p.replace(/\D/g, '');
  return /^(?:8801|01)[3-9]\d{8}$/.test(digits);
};

// WhatsApp link builder
export const waLink = (number: string, msg: string): string =>
  `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;

// Copy text to clipboard. Returns true on success. Falls back to a hidden
// textarea + execCommand for older/in-app WebViews where navigator.clipboard
// may be unavailable or blocked.
export const copyText = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    throw new Error('clipboard API unavailable');
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
};

// bKash/Nagad app deep-link schemes + Play Store fallback. Deep link scheme
// is undocumented/unofficial for both apps, so it may silently fail on some
// devices — the `document.hidden` check + timeout ensures we only fall back
// to Play Store if the app did NOT actually open (tab didn't lose focus).
const PAYMENT_APP_LINKS: Record<'bkash' | 'nagad', { deepLink: string; playStore: string }> = {
  bkash: {
    deepLink: 'bkash://',
    playStore: 'https://play.google.com/store/apps/details?id=com.bKash.customerapp',
  },
  nagad: {
    deepLink: 'nagad://',
    playStore: 'https://play.google.com/store/apps/details?id=com.konasl.nagad',
  },
};

export const openPaymentApp = (method: 'bkash' | 'nagad'): void => {
  const { deepLink, playStore } = PAYMENT_APP_LINKS[method];
  const fallbackTimer = window.setTimeout(() => {
    if (document.hidden) return; // app opened successfully, tab lost focus
    window.location.href = playStore;
  }, 1500);
  const onVisibilityChange = () => {
    if (document.hidden) window.clearTimeout(fallbackTimer);
  };
  document.addEventListener('visibilitychange', onVisibilityChange, { once: true });
  window.location.href = deepLink;
};

// Format price BDT
export const formatBDT = (n: number): string => `৳${n.toLocaleString('en-BD')}`;
// Backward-compatible alias: existing admin/components still import formatINR.
export const formatINR = formatBDT;

// ── ওজন → "কত জনের জন্য" (serving-size) helpers ─────────────────────────────
// মালিকের নিশ্চিত করা হিসাব (2026-07-11): 0.5 পাউন্ড → 2-3 জন, 1 → 4-6,
// 1.5 → 8-10, 2 → 12-15 জন। এর বাইরের ওজনের জন্য প্রতি পাউন্ডে ~6-7 জন ধরে
// একটা আনুমানিক range দেখাই।
const SERVING_PRESETS: { lb: number; label: string }[] = [
  { lb: 0.5, label: '2-3 জন' },
  { lb: 1, label: '4-6 জন' },
  { lb: 1.5, label: '8-10 জন' },
  { lb: 2, label: '12-15 জন' },
];

// যেকোনো ওজন (পাউন্ডে) → "কত জনের জন্য" text। preset হলে হুবহু, নাহলে আনুমানিক।
export const servingForPounds = (lb: number): string => {
  if (!Number.isFinite(lb) || lb <= 0) return '';
  const preset = SERVING_PRESETS.find((p) => Math.abs(p.lb - lb) < 0.001);
  if (preset) return preset.label;
  const low = Math.max(2, Math.round(lb * 6));
  const high = Math.max(low + 1, Math.round(lb * 7.5));
  return `${low}-${high} জন`;
};

// "1 lb" / "0.5 lb" / "1 kg" → পাউন্ডে সংখ্যা (kg হলে convert করে দেয়)।
export const sizeToPounds = (size: string): number => {
  const m = String(size).match(/([\d.]+)\s*(kg|kilo|lb|pound|পাউন্ড|কেজি)?/i);
  if (!m) return 0;
  const val = parseFloat(m[1]);
  if (!Number.isFinite(val)) return 0;
  const unit = (m[2] || 'lb').toLowerCase();
  if (unit.startsWith('kg') || unit.startsWith('kilo') || unit === 'কেজি') return val / 0.45359237;
  return val;
};

// size string → "কত জনের জন্য"
export const servingFor = (size: string): string => servingForPounds(sizeToPounds(size));

// ওজন সহজ বাংলায়: "1 lb" → "1 পাউন্ড", "0.5 lb" → "0.5 পাউন্ড", "1 kg" → "1 কেজি"।
export const formatWeight = (size: string): string => {
  const m = String(size).match(/([\d.]+)\s*(kg|kilo|lb|pound|পাউন্ড|কেজি)?/i);
  if (!m) return size;
  const num = m[1];
  const unit = (m[2] || 'lb').toLowerCase();
  const word = unit.startsWith('kg') || unit.startsWith('kilo') || unit === 'কেজি' ? 'কেজি' : 'পাউন্ড';
  return `${num} ${word}`;
};

// Generate order ID
export const genOrderId = (): string =>
  'BAS-' + Math.floor(10000 + Math.random() * 90000);

// Clamp number
export const clamp = (n: number, min: number, max: number): number =>
  Math.min(Math.max(n, min), max);

// File to base64
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

// Play notification beep
export const playBeep = (): void => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch { /* audio not supported */ }
};

// Export orders as CSV
export const exportOrdersCSV = (orders: import('../types').Order[]): void => {
  const headers = ['Order ID','Customer','Phone','Address','Date','Time','Items','Subtotal','Delivery','Total','Status','Payment'];
  const rows = orders.map((o) => [
    o.id,
    o.customer.name,
    o.customer.phone,
    `"${o.customer.address}"`,
    o.delivery.date,
    o.delivery.time,
    `"${o.items.map((i) => `${i.name}×${i.quantity}`).join('; ')}"`,
    o.subtotal,
    o.deliveryFee,
    o.total,
    o.status,
    o.payment,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
