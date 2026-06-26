import { useCallback, useState, useEffect } from 'react';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
import { useAuthStore, useOrders as useOrdersStore, useUI } from '../lib/store';
import { isSupabaseConfigured, playBeep } from '../lib/utils';
import type { Order } from '../types';

type DbOrderRow = {
  id: string;
  user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  district?: string | null;
  delivery_date: string;
  delivery_time: string;
  payment_method: string;
  payment_screenshot?: string | null;
  items: Order['items'];
  subtotal: number;
  discount?: number | null;
  delivery_fee: number;
  total: number;
  status: string;
  promo_code?: string | null;
  gps_lat?: number | null;
  gps_lng?: number | null;
  location_address?: string | null;
  location_verified?: boolean | null;
  created_at: string;
};

const normalizeStatus = (status: string): Order['status'] => {
  if (status === 'pending') return 'placed';
  if (status === 'preparing') return 'baking';
  if (status === 'delivering') return 'out';
  if (status === 'confirmed') return 'confirmed';
  if (status === 'baking') return 'baking';
  if (status === 'ready') return 'ready';
  if (status === 'out') return 'out';
  if (status === 'delivered') return 'delivered';
  if (status === 'cancelled') return 'cancelled';
  return 'placed';
};

const toDbStatus = (status: Order['status']): string => {
  if (status === 'placed') return 'pending';
  if (status === 'baking') return 'preparing';
  if (status === 'out') return 'delivering';
  return status;
};

const normalizePayment = (payment: string): Order['payment'] => {
  if (payment === 'bkash') return 'bkash';
  if (payment === 'nagad') return 'nagad';
  return 'cash';
};

const mapDbOrder = (o: DbOrderRow): Order => ({
  id: o.id,
  userId: o.user_id || undefined,
  items: Array.isArray(o.items) ? o.items : [],
  customer: {
    name: o.customer_name ?? '',
    phone: o.customer_phone ?? '',
    email: '',
    address: o.customer_address ?? '',
    city: o.district ?? '',
    pin: '',
  },
  delivery: {
    date: o.delivery_date ?? '',
    time: o.delivery_time ?? '',
  },
  payment: normalizePayment(o.payment_method),
  subtotal: Number(o.subtotal ?? 0),
  discount: Number(o.discount ?? 0),
  deliveryFee: Number(o.delivery_fee ?? 0),
  total: Number(o.total ?? 0),
  promoCode: o.promo_code ?? undefined,
  paymentScreenshot: o.payment_screenshot ?? undefined,
  gpsLat: o.gps_lat ?? null,
  gpsLng: o.gps_lng ?? null,
  locationAddress: o.location_address ?? undefined,
  locationVerified: !!o.location_verified,
  status: normalizeStatus(o.status),
  createdAt: o.created_at ? new Date(o.created_at).getTime() : Date.now(),
});

export function useOrdersHook() {
  const [loading, setLoading] = useState(false);
  const [realtimeUnsub, setRealtimeUnsub] = useState<(() => void) | null>(null);

  const user = useAuthStore((s) => s.user);
  const { orders, setOrders, setOrderStatus } = useOrdersStore();
  const incrementNewOrders = useUI((s) => s.incrementNewOrders);

  const fetchOrders = useCallback(async () => {
    if (!isFirebaseConfigured()) return;

    setLoading(true);

    try {
      const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders((data ?? []).map((row) => mapDbOrder(row as DbOrderRow)));
    } catch (e) {
      console.warn('Orders fetch failed, using local:', e);
    } finally {
      setLoading(false);
    }
  }, [setOrders]);

  const fetchMyOrders = useCallback(async () => {
    if (!isFirebaseConfigured() || !user?.id) return;

    setLoading(true);

    try {
      let userContact: string | null = null;
      try {
        const profileSnap = await getDocs(query(collection(db, 'profiles'), where('id', '==', user.id)));
        if (!profileSnap.empty) {
          const profile = profileSnap.docs[0].data();
          userContact = profile.contact || null;
        }
      } catch (profileErr) {
        console.warn('Profile fetch failed, continuing without profile correlation:', profileErr);
      }

      let q;
      if (userContact) {
        q = query(collection(db, 'orders'), where('user_id', '==', user.id));
      } else {
        q = query(collection(db, 'orders'), where('user_id', '==', user.id));
      }

      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (data) {
        const fetchedOrders = data.map((row) => mapDbOrder(row as DbOrderRow));
        const localOrders = useOrdersStore.getState().orders;

        const merged = [...localOrders];
        fetchedOrders.forEach((fo) => {
          const idx = merged.findIndex((o) => o.id === fo.id);
          if (idx > -1) {
            merged[idx] = fo;
          } else {
            merged.push(fo);
          }
        });

        merged.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(merged);
      }
    } catch (e) {
      console.warn('My orders fetch failed, using local orders:', e);
    } finally {
      setLoading(false);
    }
  }, [setOrders, user?.id]);

  const updateStatus = useCallback(async (id: string, status: Order['status']) => {
    setOrderStatus(id, status);

    if (!isFirebaseConfigured()) return;

    try {
      await updateDoc(doc(db, 'orders', id), { status: toDbStatus(status) });
    } catch (error) {
      console.error('Status update error:', error);
    }
  }, [setOrderStatus]);

  // Realtime subscription using onSnapshot
  const subscribeToNewOrders = useCallback(() => {
    if (!isFirebaseConfigured()) return () => {};

    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }

    void fetchOrders();

    const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          playBeep();
          incrementNewOrders();
          void fetchOrders();

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Order!', {
              body: 'A new order has been placed.',
            });
          }
        }
        if (change.type === 'modified') {
          void fetchOrders();
        }
      });
    });

    setRealtimeUnsub(() => unsubscribe);

    const timer = window.setInterval(() => {
      void fetchOrders();
    }, 10000);

    return () => {
      window.clearInterval(timer);
      if (realtimeUnsub) realtimeUnsub();
      unsubscribe();
    };
  }, [fetchOrders, incrementNewOrders]);

  return {
    orders: Array.isArray(orders) ? orders : [],
    loading,
    fetchOrders,
    fetchMyOrders,
    updateStatus,
    subscribeToNewOrders,
  };
}
