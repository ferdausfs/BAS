import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Order } from '../types';
import { doc, getDoc, setDoc, getDocs, collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { sanitizeForFirestore, orderToDoc, toDbOrderStatus } from './firestoreMappers';

export const pushBrowserRouteState = () => {
  try {
    if (typeof window !== 'undefined') {
      window.history.pushState({ bakeArtRoute: true, t: Date.now() }, '');
    }
  } catch {
    // ignore history errors
  }
};

const readRemoteSetting = async <T,>(key: string): Promise<T | null> => {
  try {
    const snap = await getDoc(doc(db, 'app_settings', key));
    return (snap.exists() ? (snap.data().value as T) : null) ?? null;
  } catch (e) {
    console.warn(`Remote setting read failed: ${key}`, e);
    return null;
  }
};

const writeRemoteSetting = async (key: string, value: unknown): Promise<void> => {
  try {
    await setDoc(doc(db, 'app_settings', key), { key, value, updated_at: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn(`Remote setting write failed: ${key}`, e);
  }
};

// ===== App view routing =====
export type Tab = 'home' | 'categories' | 'orders' | 'profile';

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
};

export type View =
  | { name: 'splash' }
  | { name: 'tabs'; tab: Tab }
  | { name: 'product'; productId: string }
  | { name: 'customize'; productId?: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'success'; orderId: string }
  | { name: 'wishlist' }
  | { name: 'tracking'; orderId?: string }
  | { name: 'admin'; tab?: string };

type UIState = {
  view: View;
  tab: Tab;
  setView: (v: View) => void;
  setTab: (t: Tab) => void;
  back: () => void;
  history: View[];
  go: (v: View) => void;
  promoDiscount: number;
  applyPromo: (pct: number) => void;
  clearPromo: () => void;
  pendingLoyaltyRedeem: number;
  setPendingLoyaltyRedeem: (pts: number) => void;
  clearLoyalty: () => void;
  clearAllCheckoutDiscounts: () => void;
  newOrderCount: number;
  notifications: NotificationItem[];
  addNotification: (title: string, body: string) => void;
  markAllRead: () => void;
  incrementNewOrders: () => void;
  clearNewOrders: () => void;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
  modalDepth: number;
  openModal: () => void;
  closeModal: () => void;
};

export const useUI = create<UIState>((set, get) => ({
  view: { name: 'splash' },
  tab: 'home',
  history: [],
  promoDiscount: 0,
  pendingLoyaltyRedeem: 0,
  newOrderCount: 0,
  notifications: [],
  chatOpen: false,
  modalDepth: 0,
  setView: (v) =>
    set({
      view: v,
      tab: v.name === 'tabs' ? v.tab : get().tab,
      history: v.name === 'splash' ? [] : get().history,
    }),
  setTab: (tab) => {
    const cur = get().view;
    if (!(cur.name === 'tabs' && cur.tab === tab)) pushBrowserRouteState();
    set({
      tab,
      view: { name: 'tabs', tab },
      history: cur.name === 'splash' ? [] : [...get().history, cur].slice(-20),
    });
  },
  go: (v) => {
    const cur = get().view;
    pushBrowserRouteState();
    set({
      view: v,
      tab: v.name === 'tabs' ? v.tab : get().tab,
      history: [...get().history, cur].slice(-12),
    });
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  },
  back: () => {
    const h = [...get().history];
    const prev = h.pop();
    set({
      view: prev ?? { name: 'tabs', tab: get().tab },
      tab: prev?.name === 'tabs' ? prev.tab : get().tab,
      history: h,
    });
    requestAnimationFrame(() => window.scrollTo({ top: 0 }));
  },
  applyPromo: (pct) => set({ promoDiscount: pct, pendingLoyaltyRedeem: 0 }),
  clearPromo: () => set({ promoDiscount: 0 }),
  setPendingLoyaltyRedeem: (pts) => set({ pendingLoyaltyRedeem: Math.max(0, pts), promoDiscount: 0 }),
  clearLoyalty: () => set({ pendingLoyaltyRedeem: 0 }),
  clearAllCheckoutDiscounts: () => set({ promoDiscount: 0, pendingLoyaltyRedeem: 0 }),
  addNotification: (title, body) => set((s) => ({
    notifications: [
      { id: `nt-${Date.now()}`, title, body, createdAt: Date.now(), read: false },
      ...s.notifications,
    ].slice(0, 30),
  })),
  markAllRead: () => set((s) => ({
    notifications: s.notifications.map((n) => ({ ...n, read: true })),
    newOrderCount: 0,
  })),
  incrementNewOrders: () => set((s) => ({
    newOrderCount: s.newOrderCount + 1,
    notifications: [
      { id: `nt-${Date.now()}`, title: '🎂 New order', body: 'A new cake order has been placed.', createdAt: Date.now(), read: false },
      ...s.notifications,
    ].slice(0, 30),
  })),
  clearNewOrders: () => set({ newOrderCount: 0 }),
  setChatOpen: (v) => set({ chatOpen: v }),
  openModal: () => set((s) => ({ modalDepth: s.modalDepth + 1 })),
  closeModal: () => set((s) => ({ modalDepth: Math.max(0, s.modalDepth - 1) })),
}));

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (idx: number) => void;
  setQty: (idx: number, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const dup = s.items.findIndex(
            (i) =>
              i.productId === item.productId &&
              i.size === item.size &&
              i.flavor === item.flavor &&
              (i.topping ?? '') === (item.topping ?? '') &&
              (i.message ?? '') === (item.message ?? '')
          );
          if (dup >= 0) {
            const next = [...s.items];
            next[dup] = { ...next[dup], quantity: next[dup].quantity + item.quantity };
            return { items: next };
          }
          return { items: [...s.items, item] };
        }),
      remove: (idx) => set((s) => ({ items: s.items.filter((_, i) => i !== idx) })),
      setQty: (idx, qty) =>
        set((s) => ({
          items: s.items
            .map((it, i) => (i === idx ? { ...it, quantity: Math.max(0, qty) } : it))
            .filter((it) => it.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'bakeart-cart' }
  )
);

type OrderState = {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  placeOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  setOrderStatus: (id: string, status: Order['status']) => void;
};

export const useOrders = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      setOrders: (orders) => set((s) => ({ orders: Array.isArray(orders) ? orders : s.orders })),
      placeOrder: (data) => {
        const user = useAuthStore.getState().user;
        const hasRemoteUser = !!user?.id && !user.id.startsWith('local-');
        const ui = useUI.getState();
        const pendingRedeem = ui.pendingLoyaltyRedeem;

        const o: Order = {
          ...data,
          id: 'BAS' + Date.now().toString().slice(-6) + Math.random().toString(36).slice(2, 5).toUpperCase(),
          userId: hasRemoteUser ? user!.id : undefined,
          createdAt: Date.now(),
          status: 'placed',
          loyaltyPointsRedeemed: pendingRedeem > 0 ? pendingRedeem : undefined,
        };

        if (o.discount === undefined) {
          o.discount = Math.max(0, Math.round(o.subtotal + o.deliveryFee - o.total));
        }

        set((s) => ({ orders: [o, ...s.orders] }));
        useUI.getState().addNotification('✅ Order placed', `Order #${o.id} has been placed successfully.`);
        useWallet.getState().earnFromOrder(o.id, o.total);

        if (pendingRedeem > 0) {
          useWallet.getState().redeemBalance(pendingRedeem, o.id);
        }
        useUI.getState().clearAllCheckoutDiscounts();

        void setDoc(doc(db, 'orders', o.id), sanitizeForFirestore(orderToDoc(o)), { merge: true }).catch((error) => {
          console.warn('Remote order insert failed:', error?.message || error);
        });

        return o;
      },
      setOrderStatus: (id, status) => {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }));

        useUI.getState().addNotification('📦 Order updated', `Order #${id} status changed to ${status}.`);

        if (status === 'confirmed' || status === 'delivered') {
          useWallet.getState().confirmOrderEarn(id);
        }
        if (status === 'cancelled') {
          useWallet.getState().cancelOrderEarn(id);
          const order = useOrders.getState().orders.find(o => o.id === id);
          const redeemed = order?.loyaltyPointsRedeemed ?? 0;
          if (redeemed > 0) {
            useWallet.getState().refundRedeem(id, redeemed);
            useUI.getState().addNotification('Wallet refund', `৳${redeemed} refunded to your wallet for cancelled order #${id}.`);
          }
        }

        void setDoc(doc(db, 'orders', id), { status: toDbOrderStatus(status), updated_at: new Date().toISOString() }, { merge: true }).catch((error) => {
          console.warn('Remote order status update failed:', error?.message || error);
        });
      },
    }),
    { name: 'bakeart-orders' }
  )
);

type UserState = {
  wishlist: string[];
  toggleWish: (id: string) => void;
};

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      wishlist: [],
      toggleWish: (id) =>
        set((s) => ({
          wishlist: s.wishlist.includes(id)
            ? s.wishlist.filter((x) => x !== id)
            : [...s.wishlist, id],
        })),
    }),
    { name: 'bakeart-user' }
  )
);

export const formatBDT = (n: number) => `৳${n.toLocaleString('en-BD')}`;
export const formatINR = formatBDT;
export const cartSubtotal = (items: CartItem[]) => items.reduce((s, i) => s + i.price * i.quantity, 0);
export const freeDeliveryThreshold = 999;
export const standardDeliveryFee = 60;
export const qualifiesForFreeDelivery = (sub: number) => sub >= freeDeliveryThreshold;

import type { User, SiteSettings } from '../types';
import { DEFAULT_SETTINGS } from './data';

type AuthState = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => {
        set({ user: null });
        useLocation.getState().clearLocation();
      },
    }),
    { name: 'bakeart-auth' }
  )
);

const ADMIN_ONLY_KEYS = ['adminPin', 'adminEmail', 'geminiApiKey'] as const;
let settingsUnsubscribe: Unsubscribe | null = null;

type SettingsState = {
  settings: SiteSettings;
  loadRemoteSettings: () => Promise<void>;
  subscribeSettings: () => void;
  updateSettings: (patch: Partial<SiteSettings>) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      loadRemoteSettings: async () => {
        const remoteSite = await readRemoteSetting<Partial<SiteSettings>>('site_settings');
        const remoteAdmin = await readRemoteSetting<Partial<SiteSettings>>('admin_settings');
        const configDoc = await getDoc(doc(db, 'app_settings', 'config'));
        const config = configDoc.exists() ? (configDoc.data() as Partial<SiteSettings> & { location?: string; value?: any }) : null;

        if (remoteSite || remoteAdmin || config) {
          set({
            settings: {
              ...DEFAULT_SETTINGS,
              ...get().settings,
              ...(remoteSite || {}),
              ...(remoteAdmin || {}),
              ...(config?.value || {}),
              ...(config?.location ? { location: config.location } as any : {}),
            },
          });
        }
      },
      subscribeSettings: () => {
        settingsUnsubscribe?.();
        settingsUnsubscribe = onSnapshot(collection(db, 'app_settings'), (snap) => {
          const merged: any = { ...DEFAULT_SETTINGS, ...get().settings };
          snap.docs.forEach((d) => {
            const data = d.data() as any;
            if (d.id === 'site_settings' || d.id === 'admin_settings') {
              Object.assign(merged, data.value || {});
            }
            if (d.id === 'config') {
              Object.assign(merged, data.value || {});
              if (typeof data.location === 'string') {
                merged.location = data.location;
              }
            }
            if (d.id === 'whatsapp_number' && typeof data.value === 'string') merged.whatsappNumber = data.value;
            if (d.id === 'allowed_districts' && Array.isArray(data.value)) merged.allowedZones = data.value;
            if (d.id === 'delivery_zones_enabled' && typeof data.value === 'boolean') merged.deliveryZonesEnabled = data.value;
            if (d.id === 'out_of_zone_message' && typeof data.value === 'string') merged.outOfZoneMessage = data.value;
          });
          set({ settings: merged });
        }, (e) => console.warn('Settings snapshot failed:', e));
      },
      updateSettings: (patch) =>
        set((s) => {
          const next = { ...s.settings, ...patch };
          const nonSensitivePart: Partial<SiteSettings> = {};
          const sensitivePart: Partial<SiteSettings> = {};

          (Object.keys(next) as Array<keyof SiteSettings>).forEach((k) => {
            if ((ADMIN_ONLY_KEYS as readonly string[]).includes(k)) {
              (sensitivePart as any)[k] = next[k];
            } else {
              (nonSensitivePart as any)[k] = next[k];
            }
          });

          const patchHasSensitiveKeys = Object.keys(patch).some((k) => (ADMIN_ONLY_KEYS as readonly string[]).includes(k));

          void writeRemoteSetting('site_settings', nonSensitivePart);
          if (patchHasSensitiveKeys) {
            void writeRemoteSetting('admin_settings', sensitivePart);
          }
          if ('whatsappNumber' in patch) {
            void writeRemoteSetting('whatsapp_number', next.whatsappNumber);
          }
          if ('allowedZones' in patch) {
            void writeRemoteSetting('allowed_districts', next.allowedZones ?? []);
          }
          if ('deliveryZonesEnabled' in patch) {
            void writeRemoteSetting('delivery_zones_enabled', next.deliveryZonesEnabled ?? true);
          }
          if ('outOfZoneMessage' in patch) {
            void writeRemoteSetting('out_of_zone_message', next.outOfZoneMessage ?? '');
          }
          if ('location' in (patch as any)) {
            void setDoc(doc(db, 'app_settings', 'config'), { location: (patch as any).location ?? '', updated_at: new Date().toISOString() }, { merge: true });
          }

          return { settings: next };
        }),
    }),
    {
      name: 'bakeart-settings',
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as any),
        settings: {
          ...DEFAULT_SETTINGS,
          ...(current as any)?.settings,
          ...(persisted as any)?.settings,
        },
      }),
    }
  )
);

type LocationState = {
  district: string | null;
  lat: number | null;
  lng: number | null;
  verified: boolean;
  setLocation: (district: string, lat: number, lng: number) => void;
  clearLocation: () => void;
};

export const useLocation = create<LocationState>()((set) => ({
  district: null,
  lat: null,
  lng: null,
  verified: false,
  setLocation: (district, lat, lng) => set({ district, lat, lng, verified: true }),
  clearLocation: () => set({ district: null, lat: null, lng: null, verified: false }),
}));

export const WALLET_EARN_PER_TAKA = 20 / 1000;
export const WALLET_REFERRAL_BONUS = 100;
export const WALLET_MAX_REDEEM = 200;
export const WALLET_MIN_ORDER_TO_REDEEM = 500;

export const getReferralCode = (user: { email?: string; id?: string } | null): string | null => {
  if (!user?.email || !user?.id) return null;
  const emailPart = user.email.replace('@', '').replace('.', '').slice(0, 4).toUpperCase();
  const idPart = user.id.replace(/-/g, '').slice(-4).toUpperCase();
  return emailPart + idPart;
};

export const calcOrderWalletEarn = (orderTotal: number): number => Math.floor((orderTotal / 1000) * 20);

export type WalletTxType = 'order_earn' | 'referral_earn' | 'redeem' | 'refund' | 'referral_bonus';
export type WalletTx = {
  id: string;
  type: WalletTxType;
  amount: number;
  orderId?: string;
  refCode?: string;
  date: number;
  note: string;
  pending?: boolean;
};

type WalletState = {
  balance: number;
  totalEarned: number;
  txns: WalletTx[];
  pendingEarn: { orderId: string; amount: number }[];
  earnFromOrder: (orderId: string, orderTotal: number) => void;
  confirmOrderEarn: (orderId: string) => void;
  cancelOrderEarn: (orderId: string) => void;
  refundRedeem: (orderId: string, amount: number) => void;
  earnReferral: (refCode: string, role: 'referrer' | 'buyer') => void;
  redeemBalance: (amount: number, orderId: string) => void;
};

export const useWallet = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 0,
      totalEarned: 0,
      txns: [],
      pendingEarn: [],
      earnFromOrder: (orderId, orderTotal) => {
        const amount = calcOrderWalletEarn(orderTotal);
        if (amount <= 0) return;
        if (get().pendingEarn.find(p => p.orderId === orderId)) return;
        set(s => ({
          pendingEarn: [...s.pendingEarn, { orderId, amount }],
          txns: [{ id: `wtx-${Date.now()}`, type: 'order_earn', amount, orderId, date: Date.now(), note: `Order #${orderId} reward (pending)`, pending: true }, ...s.txns],
        }));
      },
      confirmOrderEarn: (orderId) => {
        const s = get();
        if (s.txns.find(t => t.orderId === orderId && t.type === 'order_earn' && !t.pending)) return;
        const pending = s.pendingEarn.find(p => p.orderId === orderId);
        const amount = pending?.amount ?? 0;
        if (amount <= 0) return;
        set(cur => ({
          balance: cur.balance + amount,
          totalEarned: cur.totalEarned + amount,
          pendingEarn: cur.pendingEarn.filter(p => p.orderId !== orderId),
          txns: cur.txns.map(t => t.orderId === orderId && t.type === 'order_earn' && t.pending ? { ...t, pending: false, note: `Order #${orderId} reward` } : t),
        }));
      },
      cancelOrderEarn: (orderId) => {
        set(s => ({
          pendingEarn: s.pendingEarn.filter(p => p.orderId !== orderId),
          txns: s.txns.filter(t => !(t.orderId === orderId && t.type === 'order_earn' && t.pending)),
        }));
      },
      refundRedeem: (orderId, amount) => {
        if (amount <= 0) return;
        set(s => ({
          balance: s.balance + amount,
          txns: [{ id: `wtx-${Date.now()}`, type: 'refund', amount, orderId, date: Date.now(), note: `Refund for cancelled order #${orderId}` }, ...s.txns],
        }));
      },
      earnReferral: (refCode, role) => {
        const amount = WALLET_REFERRAL_BONUS;
        const note = role === 'referrer' ? `Referral bonus — someone used your code` : `Welcome bonus — referral code used`;
        if (role === 'buyer') {
          const already = get().txns.some(t => t.type === 'referral_bonus');
          if (already) {
            console.warn('Buyer referral bonus already claimed');
            return;
          }
        }
        set(s => ({
          balance: s.balance + amount,
          totalEarned: s.totalEarned + amount,
          txns: [{ id: `wtx-${Date.now()}`, type: role === 'referrer' ? 'referral_earn' : 'referral_bonus', amount, refCode, date: Date.now(), note }, ...s.txns],
        }));
      },
      redeemBalance: (amount, orderId) => {
        const capped = Math.min(amount, WALLET_MAX_REDEEM);
        if (capped <= 0) return;
        set(s => ({
          balance: Math.max(0, s.balance - capped),
          txns: [{ id: `wtx-${Date.now()}`, type: 'redeem', amount: -capped, orderId, date: Date.now(), note: `Redeemed for order #${orderId}` }, ...s.txns],
        }));
      },
    }),
    { name: 'bakeart-wallet' }
  )
);

export type ReferralPending = {
  refereeId: string;
  refereeName: string;
  usedAt: number;
};

const referralPendingKey = (code: string) => `referral_pending_${code.trim().toUpperCase()}`;
const referralConsumedKey = (code: string) => `referral_consumed_${code.trim().toUpperCase()}`;

export const pushReferralReward = async (refCode: string, entry: ReferralPending): Promise<void> => {
  const code = refCode.trim().toUpperCase();
  if (!code) return;
  try {
    const existing = (await readRemoteSetting<ReferralPending[]>(referralPendingKey(code))) ?? [];
    if (existing.some((e) => e.refereeId === entry.refereeId)) return;
    await writeRemoteSetting(referralPendingKey(code), [...existing, entry]);
  } catch (e) {
    console.warn('pushReferralReward failed:', e);
  }
};

export const claimReferralRewards = async (myCode: string): Promise<number> => {
  const code = (myCode ?? '').trim().toUpperCase();
  if (!code) return 0;
  try {
    const pending = (await readRemoteSetting<ReferralPending[]>(referralPendingKey(code))) ?? [];
    const consumed = (await readRemoteSetting<string[]>(referralConsumedKey(code))) ?? [];
    const toClaim = pending.filter((e) => !consumed.includes(e.refereeId));
    if (toClaim.length === 0) return 0;
    toClaim.forEach(() => useWallet.getState().earnReferral(code, 'referrer'));
    await writeRemoteSetting(referralConsumedKey(code), [...consumed, ...toClaim.map((e) => e.refereeId)]);
    await writeRemoteSetting(referralPendingKey(code), []);
    return toClaim.length;
  } catch (e) {
    console.warn('claimReferralRewards failed:', e);
    return 0;
  }
};
