import { Check, Package, ChefHat, Truck } from 'lucide-react';
import type { Order } from '../types';

type OrderStatus = Order['status'];
export const STATUSES: { key: OrderStatus; label: string; icon: typeof Check }[] = [
  { key: 'placed', label: 'Placed', icon: Check },
  { key: 'confirmed', label: 'Confirmed', icon: Package },
  { key: 'baking', label: 'Baking', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Package },
  { key: 'out', label: 'Out', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Check },
];

export default function OrderTimeline({ status, compact = false }: { status: OrderStatus; compact?: boolean }) {
  const currentIndex = Math.max(0, STATUSES.findIndex((item) => item.key === status));
  return (
    <div aria-label={`Order progress: ${STATUSES[currentIndex]?.label ?? status}`}>
      <div className="flex items-center gap-1.5">
        {STATUSES.map((item, index) => <span key={item.key} className={`h-1.5 flex-1 rounded-full ${index <= currentIndex ? 'bg-primary shadow-[0_1px_4px_rgba(246,95,143,0.28)]' : 'bg-divider'}`} />)}
      </div>
      {!compact && (
        <div className="mt-3 flex items-start">
          {STATUSES.map((item, index) => {
            const done = index <= currentIndex;
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${done ? 'bg-primary text-white shadow-btn' : 'bg-ink-50 text-text-tertiary'}`}><Icon className="h-3.5 w-3.5" strokeWidth={2.2} /></span>
                <span className={`text-[10px] font-medium leading-tight ${done ? 'text-text' : 'text-text-tertiary'}`}>{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
