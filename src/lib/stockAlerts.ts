import { ls } from './utils';
import { useAuthStore, useUI } from './store';
import type { Product } from '../types';

export type StockAlert = {
  productId: string;
  productName: string;
  date: number;
  userId?: string;
};

const guestKey = 'bakeart-alerts-guest';
const userKey = (userId: string) => `bakeart-alerts-${userId}`;

const scopeKey = (): string => {
  const uid = useAuthStore.getState().user?.id;
  return uid ? userKey(uid) : guestKey;
};

const readAlerts = (key: string): StockAlert[] =>
  ls.get<StockAlert[]>(key, []);

export const listStockAlerts = (): StockAlert[] => {
  const key = scopeKey();
  const scoped = readAlerts(key);
  // One-time migrate the old device-wide key into this account/guest scope.
  const legacy = readAlerts('bakeart-alerts');
  if (legacy.length === 0) return scoped;
  const merged = [...scoped];
  legacy.forEach((alert) => {
    if (!merged.some((item) => item.productId === alert.productId)) merged.push(alert);
  });
  ls.set(key, merged);
  ls.remove('bakeart-alerts');
  return merged;
};

export const addStockAlert = (productId: string, productName: string): boolean => {
  const alerts = listStockAlerts();
  if (alerts.some((alert) => alert.productId === productId)) return false;
  const next: StockAlert = {
    productId,
    productName,
    date: Date.now(),
    userId: useAuthStore.getState().user?.id,
  };
  ls.set(scopeKey(), [...alerts, next]);
  return true;
};

export const consumeRestockedAlerts = (products: Product[]): StockAlert[] => {
  const alerts = listStockAlerts();
  if (alerts.length === 0) return [];
  const inStockIds = new Set(
    products.filter((product) => product.inStock !== false).map((product) => product.id)
  );
  const ready = alerts.filter((alert) => inStockIds.has(alert.productId));
  if (ready.length === 0) return [];
  const remaining = alerts.filter((alert) => !inStockIds.has(alert.productId));
  ls.set(scopeKey(), remaining);
  ready.forEach((alert) => {
    useUI.getState().addNotification(
      'স্টকে এসেছে',
      `${alert.productName} এখন অর্ডার করা যাবে।`
    );
  });
  return ready;
};
