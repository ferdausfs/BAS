import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Order } from '../types';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
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
  if (!isFirebaseConfigured()) return null;
  try {
    const snap = await getDoc(doc(db, 'app_settings', key));
    return (snap.exists() ? (snap.data().value as T) : null) ?? null;
  } catch (e) {
    console.warn(`Remote setting read failed: ${key}`, e);
    return null;
  }
};

const writeRemoteSetting = async (key: string, value: unknown): Promise<void> => {
  if (!isFirebaseConfigured()) return;
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
  // Promo
  promoDiscount: number;
  applyPromo: (pct: number) => void;
  clearPromo: () => void;
  // Loyalty (pending redemption applied at checkout)
  pendingLoyaltyRedeem: number;
  setPendingLoyaltyRedeem: (pts: number) => void;
  clearLoyalty: () => void;
  clearAllCheckoutDiscounts: () => void;
  // Admin/user notifications
  newOrderCount: number;
  notifications: NotificationItem[];
  addNotification: (title: string, body: string) => void;
  markAllRead: () => void;
  incrementNewOrders: () => void;
  clearNewOrders: () => void;
  // Chat
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
  // Global modal depth counter for permanent navbar hide
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

// ===== Cart =====
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

// ===== Orders =====
type OrderState = {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  placeOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  setOrderStatus: (id: string, status: Order['status']) => void;
};

export const useOrders = create<OrderState>((set) => ({
      orders: [],

      setOrders: (orders) => set((s) => ({ orders: Array.isArray(orders) ? orders : s.orders })),

      placeOrder: (data) => {
        const user = useAuthStore.getState().user;

        const ui = useUI.getState();
        const pendingRedeem = ui.pendingLoyaltyRedeem;

        const o: Order = {
          ...data,
          id: 'BAS' + Date.now().toString().slice(-6) + Math.random().toString(36).slice(2, 5).toUpperCase(),
          userId: user?.id && !user.id.startsWith('local-') ? user.id : null,
          createdAt: Date.now(),
          status: 'placed',
          loyaltyPointsRedeemed: pendingRedeem > 0 ? pendingRedeem : undefined,
        };

        // ensure discount field is populated
        if (o.discount === undefined) {
          o.discount = Math.max(0, Math.round(o.subtotal + o.deliveryFee - o.total));
        }

        set((s) => ({ orders: [o, ...s.orders] }));
        useUI.getState().addNotification('✅ Order placed', `Order #${o.id} has been placed successfully.`);
        
        // BUG 2 FIX: Immediately confirm order reward (no pending state)
        // Admin may skip 'confirmed' status and go directly to 'delivered'
        // So we confirm immediately on 'placed' to ensure customer gets reward
        useWallet.getState().earnFromOrder(o.id, o.total);
        useWallet.getState().confirmOrderEarn(o.id);

        // If user redeemed wallet balance in cart, deduct them now (track per order)
        if (pendingRedeem > 0) {
          useWallet.getState().redeemBalance(pendingRedeem, o.id);
        }
        // clear both promo + loyalty after order
        useUI.getState().clearAllCheckoutDiscounts();

        if (isFirebaseConfigured()) {
          void setDoc(doc(db, 'orders', o.id), sanitizeForFirestore(orderToDoc(o)), { merge: true }).catch((error) => {
            console.warn('Remote order insert failed:', error?.message || error);
          });
        }

        return o;
      },

      setOrderStatus: (id, status) => {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }));

        useUI.getState().addNotification('📦 Order updated', `Order #${id} status changed to ${status}.`);

        // Note: reward is already confirmed on 'placed' status in placeOrder()
        // Leaving this for backward compatibility if admin manually updates
        if (status === 'confirmed' || status === 'delivered') {
          useWallet.getState().confirmOrderEarn(id);
        }
        if (status === 'cancelled') {
          useWallet.getState().cancelOrderEarn(id);
          // find how much was redeemed from order record
          const order = useOrders.getState().orders.find(o => o.id === id);
          const redeemed = order?.loyaltyPointsRedeemed ?? 0;
          if (redeemed > 0) {
            useWallet.getState().refundRedeem(id, redeemed);
            useUI.getState().addNotification('Wallet refund', `৳${redeemed} refunded to your wallet for cancelled order #${id}.`);
          }
        }

      },
    }));

// ===== Wishlist =====
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
// Backward-compatible alias: existing components still import formatINR.
export const formatINR = formatBDT;

// Selectors / helpers
export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.price * i.quantity, 0);

export const freeDeliveryThreshold = 999;
export const standardDeliveryFee = 60;
export const qualifiesForFreeDelivery = (sub: number) => sub >= freeDeliveryThreshold;



// ── Auth Store ─────────────────────────────────────────────
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

let siteSettingsUnsubscribe: (() => void) | null = null;

// ── Settings Store ─────────────────────────────────────────
type SettingsState = {
  settings: SiteSettings;
  loadRemoteSettings: () => Promise<void>;
  updateSettings: (patch: Partial<SiteSettings>) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      loadRemoteSettings: async () => {
        const remoteSite = await readRemoteSetting<Partial<SiteSettings>>('site_settings');
        const remoteAdmin = await readRemoteSetting<Partial<SiteSettings>>('admin_settings');
        const whatsappNumber = await readRemoteSetting<string>('whatsapp_number');
        const allowedDistricts = await readRemoteSetting<string[]>('allowed_districts');
        const deliveryZonesEnabled = await readRemoteSetting<boolean>('delivery_zones_enabled');
        const outOfZoneMessage = await readRemoteSetting<string>('out_of_zone_message');

        const rowBasedSettings: Partial<SiteSettings> = {
          ...(whatsappNumber ? { whatsappNumber } : {}),
          ...(Array.isArray(allowedDistricts) ? { allowedZones: allowedDistricts } : {}),
          ...(typeof deliveryZonesEnabled === 'boolean' ? { deliveryZonesEnabled } : {}),
          ...(outOfZoneMessage ? { outOfZoneMessage } : {}),
        };

        if (remoteSite || remoteAdmin || Object.keys(rowBasedSettings).length > 0) {
          set({
            settings: {
              ...DEFAULT_SETTINGS,
              ...get().settings,
              ...(remoteSite || {}),
              ...(remoteAdmin || {}),
              ...rowBasedSettings,
            },
          });
        }

        if (isFirebaseConfigured() && !siteSettingsUnsubscribe) {
          siteSettingsUnsubscribe = onSnapshot(doc(db, 'app_settings', 'site_settings'), (snap) => {
            if (!snap.exists()) return;
            const data = snap.data();
            const value = data?.value as (Partial<SiteSettings> & {
              shopLocation?: string;
              shopLat?: number;
              shopLng?: number;
            }) | undefined;

            if (!value) return;

            set({
              settings: {
                ...DEFAULT_SETTINGS,
                ...get().settings,
                ...value,
              },
            });

            if (value.shopLocation) {
              useLocation.getState().setLocation(
                value.shopLocation,
                value.shopLat ?? 0,
                value.shopLng ?? 0
              );
            }
          }, (e) => console.warn('Site settings snapshot failed:', e));
        }
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

          const patchHasSensitiveKeys = Object.keys(patch).some((k) =>
            (ADMIN_ONLY_KEYS as readonly string[]).includes(k)
          );

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

// ── Location Store ─────────────────────────────────────────
type LocationState = {
  district: string | null;
  lat: number | null;
  lng: number | null;
  verified: boolean;
  setLocation: (district: string, lat: number, lng: number) => void;
  clearLocation: () => void;
};

export const useLocation = create<LocationState>()(
  persist(
    (set) => ({
      district: null, lat: null, lng: null, verified: false,
      setLocation: (district, lat, lng) => set({ district, lat, lng, verified: true }),
      clearLocation: () => set({ district: null, lat: null, lng: null, verified: false }),
    }),
    { name: 'bakeart-location' }
  )
);

// ── UI extras (promo, new orders) ─────────────────────────
// Already in useUI above — adding methods via zustand's subscribe pattern
// These are available via useUI():
//   promoDiscount, applyPromo, clearPromo
//   newOrderCount, incrementNewOrders, clearNewOrders
//   chatOpen, setChatOpen

// ─── Wallet (Loyalty + Referral) ─────────────────────────────────────────────

// Business rules — single source of truth
export const WALLET_EARN_PER_TAKA = 20 / 1000;   // ৳20 per ৳1000 spent
export const WALLET_REFERRAL_BONUS = 100;          // ৳100 for both referrer and new buyer
export const WALLET_MAX_REDEEM = 200;              // ৳200 max discount per order
export const WALLET_MIN_ORDER_TO_REDEEM = 500;     // minimum order subtotal to use wallet

// Derive referral code from user profile
export const getReferralCode = (user: { email?: string; id?: string } | null): string | null => {
  if (!user?.email || !user?.id) return null;
  const emailPart = user.email.replace('@', '').replace('.', '').slice(0, 4).toUpperCase();
  const idPart = user.id.replace(/-/g, '').slice(-4).toUpperCase();
  return emailPart + idPart;
};

// How much wallet balance an order earns (pending until confirmed)
export const calcOrderWalletEarn = (orderTotal: number): number =>
  Math.floor((orderTotal / 1000) * 20);

export type WalletTxType = 'order_earn' | 'referral_earn' | 'redeem' | 'refund' | 'referral_bonus';

export type WalletTx = {
  id: string;
  type: WalletTxType;
  amount: number;          // positive = credit, negative = debit (in ৳)
  orderId?: string;
  refCode?: string;        // referral code used (for referral txns)
  date: number;
  note: string;            // human-readable label shown in history
  pending?: boolean;       // true = waiting for order confirmation
};

const syncWalletToFirestore = async (uid: string, balance: number, totalEarned: number) => {
  if (!isFirebaseConfigured() || !uid) return;
  await setDoc(doc(db, 'profiles', uid, 'wallet', 'balance'),
    { balance, totalEarned, updated_at: new Date().toISOString() },
    { merge: true }
  ).catch(e => console.warn('Wallet sync failed:', e));
};

type WalletState = {
  balance: number;                                    // ৳ balance (confirmed only)
  totalEarned: number;                                // lifetime ৳ earned
  txns: WalletTx[];                                   // full transaction history
  pendingEarn: { orderId: string; amount: number }[]; // unconfirmed order earnings

  // Actions
  setWallet: (data: { balance: number; totalEarned: number }) => void;
  earnFromOrder: (orderId: string, orderTotal: number) => void;      // add pending earn
  confirmOrderEarn: (orderId: string) => void;                       // pending → balance
  cancelOrderEarn: (orderId: string) => void;                        // discard pending
  refundRedeem: (orderId: string, amount: number) => void;           // refund a redemption
  earnReferral: (refCode: string, role: 'referrer' | 'buyer') => void; // ৳100 bonus
  redeemBalance: (amount: number, orderId: string) => void;          // spend balance
};

export const useWallet = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 0,
      totalEarned: 0,
      txns: [],
      pendingEarn: [],

      setWallet: (data) => set({ balance: data.balance, totalEarned: data.totalEarned }),

      earnFromOrder: (orderId, orderTotal) => {
        const amount = calcOrderWalletEarn(orderTotal);
        if (amount <= 0) return;
        // prevent duplicate pending
        if (get().pendingEarn.find(p => p.orderId === orderId)) return;
        set(s => ({
          pendingEarn: [...s.pendingEarn, { orderId, amount }],
          txns: [{
            id: `wtx-${Date.now()}`,
            type: 'order_earn',
            amount,
            orderId,
            date: Date.now(),
            note: `Order #${orderId} reward (pending)`,
            pending: true,
          }, ...s.txns],
        }));
      },

      confirmOrderEarn: (orderId) => {
        const s = get();
        // prevent double-credit
        if (s.txns.find(t => t.orderId === orderId && t.type === 'order_earn' && !t.pending)) return;
        const pending = s.pendingEarn.find(p => p.orderId === orderId);
        const amount = pending?.amount ?? 0;
        if (amount <= 0) return;
        set(cur => {
          const next = {
            balance: cur.balance + amount,
            totalEarned: cur.totalEarned + amount,
            pendingEarn: cur.pendingEarn.filter(p => p.orderId !== orderId),
            txns: cur.txns.map(t =>
              t.orderId === orderId && t.type === 'order_earn' && t.pending
                ? { ...t, pending: false, note: `Order #${orderId} reward` }
                : t
            ),
          };
          const uid = useAuthStore.getState().user?.id;
          if (uid) void syncWalletToFirestore(uid, next.balance, next.totalEarned);
          return next;
        });
      },

      cancelOrderEarn: (orderId) => {
        set(s => ({
          pendingEarn: s.pendingEarn.filter(p => p.orderId !== orderId),
          txns: s.txns.filter(t => !(t.orderId === orderId && t.type === 'order_earn' && t.pending)),
        }));
      },

      refundRedeem: (orderId, amount) => {
        if (amount <= 0) return;
        set(s => {
          const next = {
            balance: s.balance + amount,
            txns: [{
              id: `wtx-${Date.now()}`,
              type: 'refund',
              amount,
              orderId,
              date: Date.now(),
              note: `Refund for cancelled order #${orderId}`,
            }, ...s.txns],
          };
          const uid = useAuthStore.getState().user?.id;
          if (uid) void syncWalletToFirestore(uid, next.balance, s.totalEarned);
          return next;
        });
      },

      earnReferral: (refCode, role) => {
        const amount = WALLET_REFERRAL_BONUS;
        const note = role === 'referrer'
          ? `Referral bonus — someone used your code`
          : `Welcome bonus — referral code used`;

        // BUG 3 FIX: Remove the buyer single-use restriction
        // Buyer can now use referral code up to 3 times (enforced in applyReferralCode)
        if (role === 'buyer') {
          // Allow multiple uses (max 3 enforced at applyReferralCode level)
        }

        set(s => {
          const next = {
            balance: s.balance + amount,
            totalEarned: s.totalEarned + amount,
            txns: [{
              id: `wtx-${Date.now()}`,
              type: role === 'referrer' ? 'referral_earn' : 'referral_bonus',
              amount,
              refCode,
              date: Date.now(),
              note,
            }, ...s.txns],
          };
          const uid = useAuthStore.getState().user?.id;
          if (uid) void syncWalletToFirestore(uid, next.balance, next.totalEarned);
          return next;
        });
      },

      redeemBalance: (amount, orderId) => {
        const capped = Math.min(amount, WALLET_MAX_REDEEM);
        if (capped <= 0) return;
        set(s => {
          const next = {
            balance: Math.max(0, s.balance - capped),
            txns: [{
              id: `wtx-${Date.now()}`,
              type: 'redeem',
              amount: -capped,
              orderId,
              date: Date.now(),
              note: `Redeemed for order #${orderId}`,
            }, ...s.txns],
          };
          const uid = useAuthStore.getState().user?.id;
          if (uid) void syncWalletToFirestore(uid, next.balance, s.totalEarned);
          return next;
        });
      },
    }),
    { name: 'bakeart-wallet' }
  )
);

// ─── Cross-device Referral Rewards ───────────────────────────────────────────
// The referral code/share UI already exists (getReferralCode + useWallet.earnReferral).
// The missing piece: crediting the REFERRER on a *different* device when their code
// is used. We do this via the existing `app_settings` table (key/value jsonb), so it
// works genuinely cross-device:
//   • Buyer (CheckoutScreen)  -> pushReferralReward(code, entry)
//   • Referrer (ProfileScreen) -> claimReferralRewards(myCode) on app open
// The `consumed` list (also in app_settings) is the persistent double-credit guard.

export type ReferralPending = {
  refereeId: string;
  refereeName: string;
  usedAt: number;
};

const referralPendingKey = (code: string) => `referral_pending_${code.trim().toUpperCase()}`;
const referralConsumedKey = (code: string) => `referral_consumed_${code.trim().toUpperCase()}`;

/** Called from checkout when an order using a referral code is placed. */
export const pushReferralReward = async (refCode: string, entry: ReferralPending): Promise<void> => {
  const code = refCode.trim().toUpperCase();
  if (!code || !isFirebaseConfigured()) return;
  try {
    const existing = (await readRemoteSetting<ReferralPending[]>(referralPendingKey(code))) ?? [];
    if (existing.some((e) => e.refereeId === entry.refereeId)) return; // dedupe
    await writeRemoteSetting(referralPendingKey(code), [...existing, entry]);
  } catch (e) {
    console.warn('pushReferralReward failed:', e);
  }
};

/** Called from ProfileScreen on mount — credits the referrer's wallet for any
 *  unclaimed rewards tied to their code. Returns the number of rewards claimed. */
export const claimReferralRewards = async (myCode: string): Promise<number> => {
  const code = (myCode ?? '').trim().toUpperCase();
  if (!code || !isFirebaseConfigured()) return 0;
  try {
    const pending = (await readRemoteSetting<ReferralPending[]>(referralPendingKey(code))) ?? [];
    const consumed = (await readRemoteSetting<string[]>(referralConsumedKey(code))) ?? [];
    const toClaim = pending.filter((e) => !consumed.includes(e.refereeId));
    if (toClaim.length === 0) return 0;

    // Credit the referrer once per pending referral (unlimited times)
    toClaim.forEach(() => useWallet.getState().earnReferral(code, 'referrer'));

    // Mark consumed (cross-device persistent guard) and clear the pending queue
    await writeRemoteSetting(referralConsumedKey(code), [...consumed, ...toClaim.map((e) => e.refereeId)]);
    await writeRemoteSetting(referralPendingKey(code), []);
    return toClaim.length;
  } catch (e) {
    console.warn('claimReferralRewards failed:', e);
    return 0;
  }
};

// ─── BUG 3 FIX: New applyReferralCode with max 3 uses per buyer ───────────────
// Buyer can use any referral code up to 3 times (on different orders)
// Referrer gets ৳100 for each valid use (unlimited)

export type ReferralUseEntry = {
  code: string;
  usedAt: number;
  orderId: string;
};

export interface ReferralUseRecord {
  codes: ReferralUseEntry[];
}

/**
 * Apply a referral code for a buyer.
 * - Max 3 uses per buyer (tracked in Firestore)
 * - Buyer gets ৳100 immediately
 * - Referrer gets ৳100 (pending claim in ProfileScreen)
 * 
 * @returns success status and user-friendly message
 */
export const applyReferralCode = async (
  code: string,
  buyerUserId: string,
  orderId: string
): Promise<{ success: boolean; message: string }> => {
  // Validation
  if (!code || !buyerUserId || !isFirebaseConfigured()) {
    return { success: false, message: 'Invalid referral code or user' };
  }

  const normalizedCode = code.trim().toUpperCase();

  // Validate code format (8 alphanumeric characters)
  if (!/^[A-Z0-9]{8}$/i.test(normalizedCode)) {
    return { success: false, message: 'Code টি ৮ অক্ষরের হতে হবে' };
  }

  try {
    // 1. Check buyer's referral use history from Firestore
    const buyerKey = `referral_uses_${buyerUserId}`;
    const existing = await readRemoteSetting<ReferralUseRecord>(buyerKey);
    const uses = existing?.codes ?? [];

    // 2. Max 3 uses check
    if (uses.length >= 3) {
      return { success: false, message: 'আপনি সর্বোচ্চ ৩ বার referral code ব্যবহার করতে পারবেন' };
    }

    // 3. Same order duplicate check
    if (uses.some(u => u.orderId === orderId)) {
      return { success: false, message: 'এই order-এ আগেই code ব্যবহার হয়েছে' };
    }

    // 4. Check if buyer is trying to use their own code
    const buyerCurrentCode = getReferralCode({ id: buyerUserId });
    if (buyerCurrentCode && normalizedCode === buyerCurrentCode) {
      return { success: false, message: 'নিজের referral code ব্যবহার করা যাবে না' };
    }

    // 5. Give buyer ৳100 wallet credit immediately
    useWallet.getState().earnReferral(normalizedCode, 'buyer');

    // 6. Save referral use to Firestore (for tracking max 3 uses)
    const newUse: ReferralUseEntry = {
      code: normalizedCode,
      usedAt: Date.now(),
      orderId,
    };
    await writeRemoteSetting(buyerKey, {
      codes: [...uses, newUse],
    });

    // 7. Push pending reward to referrer (will be claimed when referrer opens app)
    await pushReferralReward(normalizedCode, {
      refereeId: buyerUserId,
      refereeName: 'Customer',
      usedAt: Date.now(),
    });

    return { success: true, message: '৳100 wallet-এ যোগ হয়েছে!' };
  } catch (e) {
    console.warn('applyReferralCode failed:', e);
    return { success: false, message: 'Referral code apply করা যায়নি। আবার চেষ্টা করুন।' };
  }
};