import { useCallback, useEffect, useState } from 'react';
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { useAuthStore, useOrders as useOrdersStore, useUI } from '../lib/store';
import { playBeep } from '../lib/utils';
import { mapOrderDoc } from '../lib/firestoreMappers';
import type { Order } from '../types';

const sortOrders = (orders: Order[]) => [...orders].sort((a, b) => b.createdAt - a.createdAt);

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
      // Admin query: read every order from the top-level `orders` collection.
      const snap = await getDocs(collection(db, 'orders'));
      setOrders(sortOrders(snap.docs.map((d) => mapOrderDoc(d.id, d.data()))).slice(0, 300));
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
      // Customer query: only orders that belong to the signed-in user.
      const snap = await getDocs(query(collection(db, 'orders'), where('userId', '==', user.id)));
      const fetchedOrders = sortOrders(snap.docs.map((d) => mapOrderDoc(d.id, d.data())));
      const merged = [...useOrdersStore.getState().orders];
      fetchedOrders.forEach((fo) => {
        const idx = merged.findIndex((o) => o.id === fo.id);
        if (idx > -1) merged[idx] = fo;
        else merged.push(fo);
      });
      setOrders(sortOrders(merged));
    } catch (e) {
      console.warn('My orders fetch failed, using local orders:', e);
    } finally {
      setLoading(false);
    }
  }, [setOrders, user?.id]);

  useEffect(() => {
    if (!isFirebaseConfigured() || !user?.id || user.isAdmin) return;

    setLoading(true);
    const q = query(collection(db, 'orders'), where('userId', '==', user.id));
    const unsub = onSnapshot(q, (snap) => {
      const remoteOrders = sortOrders(snap.docs.map((d) => mapOrderDoc(d.id, d.data())));
      const localGuestOrders = useOrdersStore.getState().orders.filter(o => !o.userId);
      setOrders(sortOrders([...remoteOrders, ...localGuestOrders]));
      setLoading(false);
    }, (e) => {
      console.warn('Customer orders snapshot failed, using local orders:', e);
      setLoading(false);
    });

    return () => unsub();
  }, [setOrders, user?.id, user?.isAdmin]);

  useEffect(() => {
    if (!isFirebaseConfigured() || !user?.isAdmin) return;

    const unsub = onSnapshot(collection(db, 'orders'), (snap) => {
      setOrders(sortOrders(snap.docs.map((d) => mapOrderDoc(d.id, d.data()))).slice(0, 300));
    }, (e) => console.warn('Admin orders snapshot failed:', e));

    return () => unsub();
  }, [user?.isAdmin, setOrders]);

  const updateStatus = useCallback(async (id: string, status: Order['status']) => {
    setOrderStatus(id, status);
    if (!isFirebaseConfigured()) return;
    try {
      await updateDoc(doc(db, 'orders', id), { status, updated_at: new Date().toISOString() });
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
            new Notification('New Order!', { body: 'A new order has been placed.' });
          }
        }
      });
    }, (e) => console.warn('Realtime subscription failed:', e));

    return unsub;
  }, [incrementNewOrders, setOrders]);

  return { orders: Array.isArray(orders) ? orders : [], loading, fetchOrders, fetchMyOrders, updateStatus, subscribeToNewOrders };
}
