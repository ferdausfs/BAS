import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { useOrders } from '../lib/store';

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: number;
  source: 'google' | 'otp' | 'guest';
};

export function useCustomers() {
  const { orders } = useOrders();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setProfiles([]);
      return;
    }
    const unsub = onSnapshot(collection(db, 'profiles'), (snap) => {
      setProfiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, () => setProfiles([]));
    return unsub;
  }, []);

  useEffect(() => {
    setLoading(true);
    setCustomers(aggregateFromOrders(orders, profiles));
    setLoading(false);
  }, [orders, profiles]);

  return { customers: Array.isArray(customers) ? customers : [], loading };
}

function aggregateFromOrders(orders: any[] | null | undefined, profiles: any[] = []): Customer[] {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const map = new Map<string, Customer>();

  profiles.filter(Boolean).forEach((p) => {
    if (!p || !p.id) return;
    map.set(p.id, {
      id: p.id,
      name: p.name || p.email?.split('@')[0] || 'Anonymous',
      email: p.email || '',
      phone: p.phone || p.contact || '',
      avatar: p.avatar || '',
      totalSpent: 0,
      orderCount: 0,
      lastOrderDate: 0,
      source: p.email?.endsWith('@gmail.com') ? 'google' : 'otp',
    });
  });

  safeOrders.filter(Boolean).forEach((o) => {
    const key = o.userId || o.user_id || o.customer?.phone || `guest-${o.id}`;
    if (!key) return;
    const prev = map.get(key);
    if (prev) {
      prev.totalSpent += o.total || 0;
      prev.orderCount += 1;
      prev.lastOrderDate = Math.max(prev.lastOrderDate, o.createdAt || 0);
      if (o.customer?.name) prev.name = o.customer.name;
      if (o.customer?.email) prev.email = o.customer.email;
      if (o.customer?.phone) prev.phone = o.customer.phone;
    } else {
      map.set(key, {
        id: key,
        name: o.customer?.name || 'Guest',
        email: o.customer?.email || '',
        phone: o.customer?.phone || '',
        avatar: '',
        totalSpent: o.total || 0,
        orderCount: 1,
        lastOrderDate: o.createdAt || Date.now(),
        source: 'guest',
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}
