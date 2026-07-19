import { useEffect, useState } from 'react';
import { Check, Package, ChefHat, Truck, Receipt, Search, RefreshCw, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { useUI, formatINR, useAuthStore, useCart, useUser } from '../lib/store';
import { useOrdersHook } from '../hooks/useOrders';
import { safeArray } from '../lib/utils';
import type { Order } from '../types';

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
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const categorize = (status: string) =>
    status === 'cancelled' ? 'cancelled' : status === 'delivered' ? 'completed' : 'active';

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

  const tabbedOrders = safeArray<Order>(orders)
    .filter(Boolean)
    .filter((o) => categorize(o.status) === activeTab)
    .filter((o) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      if (o.id.toLowerCase().includes(q)) return true;
      return safeArray(o.items).some((it: any) => it.name?.toLowerCase().includes(q));
    });

  return (
    <div className="flex h-full flex-col">
      {/* Header — QuickBar-safe with right clearance */}
      <header className="flex-shrink-0 px-6 pr-18 pt-6 pb-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[12px] font-semibold tracking-wider text-primary uppercase">Activity</div>
            <h1 className="mt-1 text-[24px] font-bold tracking-tight text-ink">
              Your orders
            </h1>
          </div>
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-text-tertiary shadow-card transition active:scale-90"
            aria-label="Search orders"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-0.5 text-[12px] text-text-secondary">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} · tracked live
        </p>

        {searchOpen && (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order ID বা item name খুঁজুন…"
            className="mt-3 h-11 w-full rounded-2xl border border-border bg-surface px-4 text-[13px] font-medium text-ink outline-none focus:border-coral focus:ring-4 focus:ring-coral/10"
          />
        )}

        {/* Active / Completed / Cancelled tabs */}
        <div className="mt-3 flex gap-5 border-b border-border">
          {([
            { v: 'active', label: 'Active' },
            { v: 'completed', label: 'Completed' },
            { v: 'cancelled', label: 'Cancelled' },
          ] as const).map((t) => (
            <button
              key={t.v}
              onClick={() => setActiveTab(t.v)}
              className={`relative pb-2.5 text-[13px] font-bold transition ${
                activeTab === t.v ? 'text-ink' : 'text-text-tertiary'
              }`}
            >
              {t.label}
              {activeTab === t.v && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-coral" />
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center anim-fade">
            <div className="flex gap-1.5 justify-center py-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-2 w-2 animate-bounce rounded-full bg-ink-200" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <p className="text-[12px] text-text-tertiary">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Full empty state — no orders at all */
          <div className="flex flex-col items-center justify-center pt-16 text-center anim-fade">
            <div
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary shadow-card"
            >
              <ShoppingCart className="h-11 w-11 text-coral" strokeWidth={1.6} />
            </div>
            <div className="mt-4 text-[22px] font-bold text-coral/70">your story starts here</div>
            <h2 className="mt-1 text-[22px] font-bold tracking-tight text-ink">
              No orders yet
            </h2>
            <p className="mt-2 max-w-xs text-[13px] text-text-secondary leading-relaxed">
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
        ) : tabbedOrders.length === 0 ? (
          /* Per-tab empty state */
          <div className="flex flex-col items-center justify-center pt-16 text-center anim-fade">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-ink-50 text-text-tertiary">
              <Search className="h-9 w-9" strokeWidth={1.6} />
            </div>
            <h2 className="mt-4 text-[17px] font-bold tracking-tight text-ink">
              এই ট্যাবে কোনো অর্ডার নেই
            </h2>
            <p className="mt-1.5 max-w-xs text-[12.5px] text-text-secondary leading-relaxed">
              {activeTab === 'active' && 'এখন কোনো চলমান অর্ডার নেই।'}
              {activeTab === 'completed' && 'এখনো কোনো অর্ডার সম্পন্ন হয়নি।'}
              {activeTab === 'cancelled' && 'কোনো বাতিল অর্ডার নেই।'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {tabbedOrders.map((o) => {
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
                  className="overflow-hidden rounded-2xl bg-surface border border-border shadow-card anim-up"
                >
                  {/* Premium top accent — solid primary pink */}
                  <div className="h-[3px] w-full bg-coral" />

                  {/* Header */}
                  <div className="flex items-start justify-between px-4 pt-3.5 pb-3">
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-text-tertiary uppercase">
                        Order #{o.id}
                      </div>
                      <div className="mt-0.5 text-[12px] font-medium text-text-secondary">
                        {new Date(o.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[18px] font-bold tabular text-ink">
                        {formatINR(o.total)}
                      </div>
                      <span
                        className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
                        style={{
                          background: isCancelled ? 'rgba(231,76,60,.1)' : isDelivered ? 'rgba(47,191,113,.1)' : 'var(--color-secondary)',
                          color: isCancelled ? 'var(--color-error)' : isDelivered ? 'var(--color-success)' : 'var(--color-coral-700)',
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
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-bg ring-1 ring-border">
                          <img src={it.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="line-clamp-1 text-[13px] font-bold text-ink">
                            {it.name}
                          </div>
                          <div className="text-[11px] text-text-secondary">
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
                  <div className="mx-4 border-t border-dashed border-divider" />

                  {/* Progress */}
                  <div className="px-4 pt-3.5 pb-4">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider text-text-tertiary uppercase">
                        Live status
                      </span>
                      <span className={`text-[12px] font-bold capitalize ${isCancelled ? 'text-error' : 'text-ink'}`}>
                        {isCancelled ? 'Cancelled' : STATUSES[currentIdx]?.label || 'Placed'}
                      </span>
                    </div>

                    {isCancelled ? (
                      <div className="rounded-2xl bg-error/8 px-4 py-3">
                        <p className="text-[12px] font-semibold text-error">অর্ডার বাতিল হয়েছে</p>
                        {o.cancelReason && (
                          <p className="mt-0.5 text-[11px] text-error/80">কারণ: {o.cancelReason}</p>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Single continuous progress track — solid primary fill */}
                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-ink-50">
                          <div
                            className="h-full rounded-full bg-coral transition-all duration-700 ease-out"
                            style={{ width: `${progressPct}%` }}
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
                                    isPast || isCurrent ? 'bg-coral text-white' : 'bg-ink-50 text-text-tertiary'
                                  } ${isCurrent && !isDelivered ? 'anim-ring' : ''}`}
                                >
                                  <s.icon className="h-3 w-3" strokeWidth={2.5} />
                                </div>
                                <span className={`text-[9px] font-semibold ${isPast || isCurrent ? 'text-ink' : 'text-text-tertiary'}`}>
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
                          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl bg-error text-[12px] font-bold text-white transition active:scale-[.98]"
                        >
                          <Search className="h-3.5 w-3.5" /> Track order
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3.5 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => go({ name: 'tracking', orderId: o.id })}
                          className="flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-border bg-surface text-[12px] font-bold text-ink transition active:scale-[.98]"
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
                          className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-coral text-[12px] font-bold text-white shadow-btn transition active:scale-[.98]"
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
