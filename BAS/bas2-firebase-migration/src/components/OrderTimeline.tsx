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
  const currentIdx = Math.max(0, STATUSES.findIndex((s) => s.key === status));

  return (
    <div>
      <div className="flex items-center gap-1">
        {STATUSES.map((s, i) => (
          <div
            key={s.key}
            className={`h-1 flex-1 rounded-full transition-all ${i <= currentIdx ? 'bg-coral' : 'bg-ink-50'}`}
          />
        ))}
      </div>

      {!compact && (
        <div className="mt-2 flex items-center gap-0.5">
          {STATUSES.map((s, i) => {
            const done = i <= currentIdx;
            return (
              <div key={s.key} className="flex flex-1 flex-col items-center gap-1">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full transition ${done ? 'bg-coral text-white' : 'bg-ink-50 text-ink-200'}`}>
                  <s.icon className="h-3 w-3" strokeWidth={2.5} />
                </div>
                <span className={`text-[9px] font-semibold ${done ? 'text-ink' : 'text-ink-200'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
