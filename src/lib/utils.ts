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

// Format price BDT
export const formatBDT = (n: number): string => `৳${n.toLocaleString('en-BD')}`;
// Backward-compatible alias: existing admin/components still import formatINR.
export const formatINR = formatBDT;

// Generate order ID
export const genOrderId = (): string =>
  'BAS-' + Math.floor(10000 + Math.random() * 90000);

// Clamp number
export const clamp = (n: number, min: number, max: number): number =>
  Math.min(Math.max(n, min), max);

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean =>
  !!(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
  );

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
