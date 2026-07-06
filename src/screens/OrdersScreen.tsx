import { useEffect, useState } from 'react';
import { Check, Package, ChefHat, Truck, Receipt, Search, RefreshCw, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { useUI, formatINR, useAuthStore, useCart, useUser } from '../lib/store';
import { useOrdersHook } from '../hooks/useOrders';
import { safeArray } from '../lib/utils';

const STATUSES: { key: string; label: string; icon: any }[] = [
  { key: 'placed',    label: 'Placed',    icon: Check },
  { key: 'confirmed', label: 'Confirmed', icon: Package },
  { key: 'baking',    label: 'Baking',    icon: ChefHat },
  { key: 'ready',     label: 'Ready',     icon: Package },
  { key: 'out',       label: 'Out',       icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Check },
];

export default function OrdersScreen() {
  const { orders, loading, fetchMyOrders } = useOrdersHook();
  const user = useAuthStore((s) => s.user);
  const { setTab, go } = useUI();
  const { wishlist } = useUser();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [fetchMyOrders, user]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex-shrink-0 px-5 pt-3 pb-3">
        <div className="section-eyebrow">Activity</div>
        <h1 className="mt-1 font-display text-[24px] font-bold tracking-tight text-ink">
          Your orders
        </h1>
        <p className="mt-0.5 text-[12.5px] text-ink-200">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} · tracked live
        </p>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center anim-fade">
            <div className="flex gap-1.5 justify-center py-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-2 w-2 animate-bounce rounded-full bg-ink-200" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <p className="text-[12px] text-ink-200">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center anim-fade">
            <div
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, #FFF4F6 0%, #FFE4E9 100%)',
                boxShadow: '0 1px 2px rgba(26,19,17,.03), 0 12px 30px -18px rgba(232,82,106,.18)',
                border: '1px solid rgba(232,82,106,0.1)',
              }}
            >
              <ShoppingCart className="h-11 w-11 text-coral" strokeWidth={1.6} />
            </div>
            <div className="mt-4 font-brand text-[22px] text-coral/70">your story starts here</div>
            <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight text-ink">
              No orders yet
            </h2>
            <p className="mt-1.5 max-w-xs text-[13px] text-ink-200">
              {wishlist.length > 0
                ? 'আপনার saved cakes গুলো দেখুন — এখনই order করুন!'
                : 'প্রথম order দিন, real-time এ track করুন।'}
            </p>
            <button
              onClick={() => wishlist.length > 0 ? go({ name: 'wishlist' }) : setTab('home')}
              className="btn-primary mt-6 flex h-12 items-center gap-2 rounded-2xl px-7 text-[13px] font-bold"
            >
              <Receipt className="h-4 w-4" />
              {wishlist.length > 0 ? 'View my wishlist' : 'Browse cakes'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {safeArray(orders).filter(Boolean).map((o) => {
              const currentIdx = STATUSES.findIndex((s) => s.key === o.status);
              const isDelivered = o.status === 'delivered';
              const isCancelled = o.status === 'cancelled';
              const items = safeArray(o.items);
              const isExpanded = expanded.has(o.id);
              const visibleItems = isExpanded ? items : items.slice(0, 2);
              const progressPct = STATUSES.length > 1 ? (Math.max(currentIdx, 0) / (STATUSES.length - 1)) * 100 : 0;

              return (
                <article
                  key={o.id}
                  className="overflow-hidden rounded-3xl glass-strong anim-up"
                  style={{ boxShadow: '0 1px 2px rgba(26,19,17,.03), 0 14px 32px -18px rgba(26,19,17,.20)' }}
                >
                  {/* Premium top accent — coral to gold, like a wax-seal ribbon */}
                  <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, var(--color-coral) 0%, var(--color-gold) 100%)' }} />

                  {/* Header */}
                  <div className="flex items-start justify-between px-4 pt-3.5 pb-3">
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-ink-200 uppercase">
                        Order #{o.id}
                      </div>
                      <div className="mt-0.5 text-[12px] font-medium text-ink-200">
                        {new Date(o.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-[18px] font-bold tabular text-ink">
                        {formatINR(o.total)}
                      </div>
                      <span
                        className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
                        style={{
                          background: isCancelled ? 'rgba(220,38,38,.1)' : isDelivered ? 'rgba(28,17,18,.07)' : 'var(--color-coral-50)',
                          color: isCancelled ? '#DC2626' : isDelivered ? 'var(--color-ink)' : 'var(--color-coral-700)',
                        }}
                      >
                        {isDelivered && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                        {isCancelled ? 'Cancelled' : STATUSES[currentIdx]?.label || 'Placed'}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2.5 px-4 pb-2">
                    {visibleItems.map((it, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-cream ring-1 ring-ink-50">
                          <img src={it.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="line-clamp-1 text-[13px] font-bold text-ink">
                            {it.name}
                          </div>
                          <div className="text-[11px] text-ink-200">
                            {it.size} · ×{it.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                    {items.length > 2 && (
                      <button
                        onClick={() => toggleExpand(o.id)}
                        className="flex w-full items-center justify-center gap-1 py-1 text-[11.5px] font-bold text-coral"
                      >
                        {isExpanded ? (
                          <>Show less <ChevronUp className="h-3.5 w-3.5" /></>
                        ) : (
                          <>+{items.length - 2} more items <ChevronDown className="h-3.5 w-3.5" /></>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Ticket-stub perforation */}
                  <div className="mx-4 border-t border-dashed border-ink-100" />

                  {/* Progress */}
                  <div className="px-4 pt-3.5 pb-4">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider text-ink-200 uppercase">
                        Live status
                      </span>
                      <span className={`text-[12px] font-bold capitalize ${isCancelled ? 'text-red-600' : 'text-ink'}`}>
                        {isCancelled ? 'Cancelled' : STATUSES[currentIdx]?.label || 'Placed'}
                      </span>
                    </div>

                    {isCancelled ? (
                      <div className="rounded-2xl bg-red-50 px-3 py-2.5">
                        <p className="text-[12px] font-semibold text-red-700">অর্ডার বাতিল হয়েছে</p>
                        {o.cancelReason && (
                          <p className="mt-0.5 text-[11px] text-red-700/80">কারণ: {o.cancelReason}</p>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Single continuous progress track with gradient fill */}
                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-ink-50">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${progressPct}%`,
                              background: 'linear-gradient(90deg, var(--color-gold) 0%, var(--color-coral) 100%)',
                            }}
                          />
                        </div>

                        <div className="mt-2.5 flex items-center gap-0.5">
                          {STATUSES.map((s, i) => {
                            const isPast = i < currentIdx;
                            const isCurrent = i === currentIdx;
                            return (
                              <div key={s.key} className="flex flex-1 flex-col items-center gap-1">
                                <div
                                  className={`flex h-5 w-5 items-center justify-center rounded-full transition ${
                                    isPast || isCurrent ? 'bg-coral text-white' : 'bg-ink-50 text-ink-200'
                                  } ${isCurrent && !isDelivered ? 'anim-ring' : ''}`}
                                >
                                  <s.icon className="h-3 w-3" strokeWidth={2.5} />
                                </div>
                                <span className={`text-[9px] font-semibold ${isPast || isCurrent ? 'text-ink' : 'text-ink-200'}`}>
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* Actions */}
                    {isCancelled ? (
                      <div className="mt-3.5">
                        <button
                          onClick={() => go({ name: 'tracking', orderId: o.id })}
                          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl bg-red-500 text-[12px] font-bold text-white transition active:scale-[.98]"
                        >
                          <Search className="h-3.5 w-3.5" /> Track order
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3.5 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => go({ name: 'tracking', orderId: o.id })}
                          className="flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-ink-100 bg-white text-[12px] font-bold text-ink transition active:scale-[.98]"
                        >
                          <Search className="h-3.5 w-3.5" /> Track order
                        </button>
                        <button
                          onClick={() => {
                            const safeItems = safeArray(o.items);
                            safeItems.forEach((item) => useCart.getState().add({ ...item }));
                            useUI.getState().addNotification(
                              'Added to cart!',
                              `${safeItems.length} item${safeItems.length > 1 ? 's' : ''} from Order #${o.id} added to cart.`
                            );
                            setTimeout(() => go({ name: 'cart' }), 600);
                          }}
                          className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-ink text-[12px] font-bold text-white transition active:scale-[.98]"
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Order again
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
