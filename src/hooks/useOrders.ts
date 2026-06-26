import { useCallback, useState } from 'react';
import { collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { useAuthStore, useOrders as useOrdersStore, useUI } from '../lib/store';
import { playBeep } from '../lib/utils';
import { mapOrderDoc, toDbOrderStatus } from '../lib/firestoreMappers';
import type { Order } from '../types';

// NOTE: exported as useOrdersHook to avoid clash with store's useOrders.
export function useOrdersHook() {
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { orders, setOrders, setOrderStatus } = useOrdersStore();
  const incrementNewOrders = useUI((s) => s.incrementNewOrders);

  const fetchOrders = useCallback(async () => {
    if (!isFirebaseConfigured()) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('created_at', 'desc')));
      setOrders(snap.docs.slice(0, 300).map((d) => mapOrderDoc(d.id, d.data())));
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
      const snap = await getDocs(query(collection(db, 'orders'), where('user_id', '==', user.id), orderBy('created_at', 'desc')));
      const fetchedOrders = snap.docs.map((d) => mapOrderDoc(d.id, d.data()));
      const merged = [...useOrdersStore.getState().orders];
      fetchedOrders.forEach((fo) => {
        const idx = merged.findIndex((o) => o.id === fo.id);
        if (idx > -1) merged[idx] = fo;
        else merged.push(fo);
      });
      merged.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(merged);
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
      await updateDoc(doc(db, 'orders', id), { status: toDbOrderStatus(status), updated_at: new Date().toISOString() });
    } catch (error) {
      console.error('Status update error:', error);
    }
  }, [setOrderStatus]);

  const subscribeToNewOrders = useCallback(() => {
    if (!isFirebaseConfigured()) return () => {};
    if ('Notification' in window && Notification.permission === 'default') void Notification.requestPermission();

    let initialized = false;
    const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const nextOrders = snap.docs.slice(0, 300).map((d) => mapOrderDoc(d.id, d.data()));
      setOrders(nextOrders);
      if (!initialized) {
        initialized = true;
        return;
      }
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          playBeep();
          incrementNewOrders();
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Order!', { body: 'A new order has been placed.' });
          }
        }
      });
    }, (e) => console.warn('Realtime subscription failed:', e));

    return unsub;
  }, [incrementNewOrders, setOrders]);

  return { orders: Array.isArray(orders) ? orders : [], loading, fetchOrders, fetchMyOrders, updateStatus, subscribeToNewOrders };
}
