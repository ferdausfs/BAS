import { useCallback, useEffect, useState } from 'react';
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { useAuthStore, useOrders as useOrdersStore, useUI } from '../lib/store';
import { playBeep } from '../lib/utils';
import { mapOrderDoc, toDbOrderStatus } from '../lib/firestoreMappers';
import type { Order } from '../types';

const sortOrders = (orders: Order[]) => [...orders].sort((a, b) => b.createdAt - a.createdAt);

// exported as useOrdersHook to avoid clash with store's useOrders.
export function useOrdersHook() {
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { orders, setOrders, setOrderStatus } = useOrdersStore();
  const incrementNewOrders = useUI((s) => s.incrementNewOrders);

  // One-shot admin fetch (used e.g. by AdminScreen on demand).
  const fetchOrders = useCallback(async () => {
    if (!isFirebaseConfigured()) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'orders'));
      setOrders(sortOrders(snap.docs.map((d) => mapOrderDoc(d.id, d.data()))).slice(0, 300));
    } catch (e) {
      console.warn('Orders fetch failed:', e);
    } finally {
      setLoading(false);
    }
  }, [setOrders]);

  // One-shot customer fetch (used e.g. by TrackingScreen).
  const fetchMyOrders = useCallback(async () => {
    if (!isFirebaseConfigured() || !user?.id) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', user.id));
      const snap = await getDocs(q);
      const fetchedOrders = sortOrders(snap.docs.map((d) => mapOrderDoc(d.id, d.data())));
      const merged = [...useOrdersStore.getState().orders];
      fetchedOrders.forEach((fo) => {
        const idx = merged.findIndex((o) => o.id === fo.id);
        if (idx > -1) merged[idx] = fo;
        else merged.push(fo);
      });
      setOrders(sortOrders(merged));
    } catch (e) {
      console.warn('My orders fetch failed:', e);
    } finally {
      setLoading(false);
    }
  }, [setOrders, user?.id]);

  // Live customer orders subscription.
  useEffect(() => {
    if (!isFirebaseConfigured() || !user?.id || user.isAdmin) return;

    setLoading(true);
    const q = query(collection(db, 'orders'), where('userId', '==', user.id));
    const unsub = onSnapshot(q, (snap) => {
      const remoteOrders = sortOrders(snap.docs.map((d) => mapOrderDoc(d.id, d.data())));
      const otherOrders = useOrdersStore.getState().orders.filter((o) => o.userId && o.userId !== user.id);
      setOrders(sortOrders([...remoteOrders, ...otherOrders]));
      setLoading(false);
    }, (e) => {
      console.warn('Customer orders snapshot failed:', e);
      setLoading(false);
    });

    return () => unsub();
  }, [setOrders, user?.id, user?.isAdmin]);

  // Live admin orders subscription.
  useEffect(() => {
    if (!isFirebaseConfigured() || !user?.isAdmin) return;

    setLoading(true);
    const q = collection(db, 'orders');
    const unsub = onSnapshot(q, (snap) => {
      const nextOrders = sortOrders(snap.docs.map((d) => mapOrderDoc(d.id, d.data()))).slice(0, 300);
      setOrders(nextOrders);
      setLoading(false);
    }, (e) => {
      console.warn('Admin orders snapshot failed:', e);
      setLoading(false);
    });

    return () => unsub();
  }, [setOrders, user?.isAdmin]);

  const updateStatus = useCallback(async (id: string, status: Order['status'], reason?: string) => {
    setOrderStatus(id, status, reason);
    if (!isFirebaseConfigured()) return;
    try {
      await updateDoc(doc(db, 'orders', id), {
        status: toDbOrderStatus(status),
        updated_at: new Date().toISOString(),
        ...(reason ? { cancel_reason: reason } : {}),
      });
    } catch (error) {
      console.error('Status update error:', error);
    }
  }, [setOrderStatus]);

  const subscribeToNewOrders = useCallback(() => {
    if (!isFirebaseConfigured()) return () => {};
    if ('Notification' in window && Notification.permission === 'default') void Notification.requestPermission();

    let initialized = false;
    const unsub = onSnapshot(collection(db, 'orders'), (snap) => {
      const nextOrders = sortOrders(snap.docs.map((d) => mapOrderDoc(d.id, d.data()))).slice(0, 300);
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
            new Notification('New Order!', { body: 'A new cake order has been placed.' });
          }
        }
      });
    }, (e) => console.warn('Realtime subscription failed:', e));

    return unsub;
  }, [incrementNewOrders, setOrders]);

  return { orders: Array.isArray(orders) ? orders : [], loading, fetchOrders, fetchMyOrders, updateStatus, subscribeToNewOrders };
}
