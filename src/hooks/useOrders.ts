import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore, useSettingsStore, useOrders as useOrdersStore, useUI } from '../lib/store';
import { isSupabaseConfigured, playBeep } from '../lib/utils';
import type { Order } from '../types';

export function useOrdersHook() {
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const settings = useSettingsStore((s) => s.settings);
  const { orders, setOrders, upsertOrder, updateOrderStatus } = useOrdersStore();
  const incrementNewOrders = useUI((s) => s.incrementNewOrders);

  const isAdmin = user?.email === settings.adminEmail;

  // Fetch all orders (admin) or just the logged-in user's orders (customer)
  const fetchOrders = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      let query = supabase.from('orders').select('*').order('createdAt', { ascending: false }).limit(500);
      if (!isAdmin && user) {
        query = query.eq('user_id', user.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        setOrders(data as Order[]);
      }
    } catch (e) {
      console.warn('Orders fetch failed, using local cache:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAdmin, setOrders]);

  // Insert a new order into Supabase AND local store (call this instead of store.placeOrder directly when online sync matters)
  const submitOrder = useCallback(async (data: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> => {
    const order: Order = {
      ...data,
      id: 'BAS' + Date.now().toString().slice(-6),
      createdAt: Date.now(),
      status: 'placed',
    };
    upsertOrder(order);

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('orders').insert({
        ...order,
        user_id: user?.id ?? null,
      });
      if (error) console.error('Order sync to Supabase failed:', error);
    }
    return order;
  }, [upsertOrder, user?.id]);

  const updateStatus = useCallback(async (id: string, status: Order['status']) => {
    updateOrderStatus(id, status);
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) console.error('Status update error:', error);
  }, [updateOrderStatus]);

  const subscribeToNewOrders = useCallback(() => {
    if (!isSupabaseConfigured()) return () => {};
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const channel = supabase
      .channel('new-orders-admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new as Order;
        upsertOrder(newOrder);
        playBeep();
        incrementNewOrders();
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🎂 নতুন অর্ডার!', { body: `${newOrder.customer?.name ?? ''} — ৳${newOrder.total ?? ''}` });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [incrementNewOrders, upsertOrder]);

  return { orders, loading, fetchOrders, submitOrder, updateStatus, subscribeToNewOrders };
}
