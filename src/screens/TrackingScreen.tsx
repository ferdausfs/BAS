import { useEffect, useState } from 'react';
import { ArrowLeft, Package, Search, ShoppingCart, CheckCircle2, Flame, Cake, Truck, PartyPopper, RefreshCw, XCircle, MessageCircle, Clock } from 'lucide-react';
import { useUI, formatINR, useAuthStore, useCart, useSettingsStore } from '../lib/store';
import { useOrdersHook } from '../hooks/useOrders';
import { safeArray } from '../lib/utils';
import type { Order } from '../types';


function ShimmerBlock({ className }: { className: string }) {
  return (
    <span className={`shimmer relative block overflow-hidden ${className}`} aria-hidden="true" />
  );
}

function TrackingSkeletonCard() {
  return (
    <article className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-card anim-fade" role="status" aria-label="Syncing order tracking">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <div className="space-y-2">
          <ShimmerBlock className="h-2.5 w-28 rounded-full" />
          <ShimmerBlock className="h-3 w-36 rounded-full" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <ShimmerBlock className="h-3 w-12 rounded-full" />
          <ShimmerBlock className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="space-y-2.5 px-4 py-3.5">
        {[0, 1].map((item) => (
          <div key={item} className="flex items-center gap-4">
            <ShimmerBlock className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <ShimmerBlock className="h-3.5 w-3/4 rounded-full" />
              <ShimmerBlock className="h-2.5 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-4 py-3.5">
        <div className="mb-4 flex items-center justify-between">
          <ShimmerBlock className="h-2.5 w-20 rounded-full" />
          <ShimmerBlock className="h-3 w-16 rounded-full" />
        </div>
        <div className="space-y-0">
          {TIMELINE_STEPS.slice(0, 5).map((step, i, arr) => (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <ShimmerBlock className="h-9 w-9 rounded-full" />
                {i !== arr.length - 1 && <ShimmerBlock className="my-1 w-0.5 flex-1 rounded-full" />}
              </div>
              <div className="flex-1 space-y-2 pb-4">
                <ShimmerBlock className="h-3.5 w-36 rounded-full" />
                <ShimmerBlock className="h-2.5 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

const TIMELINE_STEPS: { key: string; Icon: typeof ShoppingCart; label: string; sub: string }[] = [
  { key: 'placed',    Icon: ShoppingCart, label: 'Order Placed',      sub: 'We received your order' },
  { key: 'confirmed', Icon: CheckCircle2, label: 'Baker Assigned',     sub: 'A baker is on it' },
  { key: 'baking',    Icon: Flame,        label: 'Baking Started',     sub: 'Your cake is in the oven' },
  { key: 'ready',     Icon: Cake,         label: 'Quality Check',      sub: 'Almost ready!' },
  { key: 'out',       Icon: Truck,        label: 'Out for Delivery',   sub: 'On the way to you' },
  { key: 'delivered', Icon: PartyPopper,  label: 'Delivered',          sub: 'Enjoy your cake!' },
];

const STATUS_ORDER = TIMELINE_STEPS.map((s) => s.key);

export default function TrackingScreen() {
  const { view, back, setTab, go, setChatOpen } = useUI();
  const initial = view.name === 'tracking' ? view.orderId ?? '' : '';
  const [query, setQuery] = useState(initial);
  const [match, setMatch] = useState<Order | null>(null);
  const { orders, loading, fetchMyOrders } = useOrdersHook();
  const user = useAuthStore((s) => s.user);
  const { settings } = useSettingsStore();

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [fetchMyOrders, user]);

  // যদি orderId না আসে, latest active order auto-load করো
  useEffect(() => {
    if (!query && orders.length > 0) {
      const latest = orders.find(o =>
        o.status !== 'delivered' && o.status !== 'cancelled'
      ) ?? orders[0];
      if (latest) setQuery(latest.id);
    }
  }, [orders, query]);

  useEffect(() => {
    if (!query.trim()) {
      setMatch(null);
      return;
    }

    const q = query.toLowerCase().replace(/^#/, '').trim();
    const found = orders.find((o) => o && o.id.toLowerCase() === q);
    setMatch(found ?? null);
  }, [query, orders]);

  // Poll every 30s while the tracked order is active
  useEffect(() => {
    if (!match || match.status === 'delivered' || match.status === 'cancelled') return;

    const interval = setInterval(() => {
      fetchMyOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [match?.id, match?.status, fetchMyOrders]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-shrink-0 items-center justify-between px-6 pt-3 pb-3">
        <button
          onClick={back}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-card active:scale-90"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <h1 className="text-[16px] font-bold tracking-tight text-ink">Order tracking</h1>
        <div className="w-10" />
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-20 pt-1">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-text-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter order ID, e.g. BAS123456"
            className="h-12 w-full rounded-2xl border border-border bg-surface pr-4 pl-11 text-[14px] text-ink outline-none focus:border-coral focus:ring-4 focus:ring-coral/10"
          />
        </div>

        {loading ? (
          <TrackingSkeletonCard />
        ) : match ? (
          <article
            className="mt-4 overflow-hidden rounded-2xl bg-surface border border-border shadow-card"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <div>
                <div className="text-[10px] font-bold tracking-wider text-text-tertiary uppercase">
                  Order #{match.id}
                </div>
                <div className="mt-0.5 text-[12px] font-medium text-text-secondary">
                  {new Date(match.createdAt).toLocaleString('en-BD')}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-1 text-[10px] text-text-tertiary">
                  <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Live
                </div>
                <div className="text-[18px] font-bold tabular text-ink">
                  {formatINR(match.total)}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 px-4 py-3.5">
              {safeArray<import('../types').CartItem>(match.items).slice(0, 3).map((it, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-bg ring-1 ring-border">
                    <img src={it.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="line-clamp-1 text-[12.5px] font-bold text-ink">{it.name}</div>
                    <div className="text-[10.5px] text-text-secondary">{it.size} · ×{it.quantity}</div>
                  </div>
                </div>
              ))}
            </div>

            {match.status === 'cancelled' && (
              <div className="mx-4 mb-4 overflow-hidden rounded-2xl border border-error/20 bg-error/5">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-error/10">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-error/10">
                    <XCircle className="h-5 w-5 text-error" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-error">অর্ডার বাতিল হয়েছে</p>
                    <p className="text-[11px] text-error/70">Order #{match.id} cancelled</p>
                  </div>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {match.cancelReason && (
                    <p className="text-[12px] text-error/80">
                      <span className="font-bold">কারণ:</span> {match.cancelReason}
                    </p>
                  )}
                  <p className="text-[12px] text-error/80">
                    আপনার পেমেন্ট ওয়ালেটে ফেরত দেওয়া হয়েছে বা দেওয়া হবে।
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        safeArray<import('../types').CartItem>(match.items).forEach((item) => useCart.getState().add({ ...item }));
                        go({ name: 'cart' });
                      }}
                      className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-error text-[12px] font-bold text-white"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> পুনরায় অর্ডার করুন
                    </button>
                    <button
                      onClick={() => setChatOpen(true, match.id)}
                      className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-error/20 bg-surface text-[12px] font-bold text-error"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> সাপোর্ট
                    </button>
                  </div>
                </div>
              </div>
            )}

            {match.status !== 'cancelled' && (
            <div className="border-t border-border px-4 py-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-text-tertiary uppercase">Live status</span>
                <span className="text-[12px] font-bold capitalize text-ink">{match.status}</span>
              </div>
              {/* Vertical timeline */}
              <div className="mt-3 space-y-0">
                {TIMELINE_STEPS.map((step, i, arr) => {
                  const currentIdx = STATUS_ORDER.indexOf(match.status);
                  const stepIdx = STATUS_ORDER.indexOf(step.key);
                  const done = stepIdx <= currentIdx && currentIdx !== -1;
                  const active = stepIdx === currentIdx;
                  const isLast = i === arr.length - 1;
                  const StepIcon = step.Icon;
                  return (
                    <div key={step.key} className="flex gap-3">
                      {/* Left: icon + connector */}
                      <div className="flex flex-col items-center">
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                          done
                            ? active
                              ? 'bg-coral text-white ring-2 ring-coral ring-offset-2 scale-110'
                              : 'bg-coral/15 text-coral'
                            : 'bg-ink-50 text-text-tertiary'
                        }`}>
                          <StepIcon className="h-4 w-4" strokeWidth={2} />
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 flex-1 my-1 rounded-full ${done && !active ? 'bg-coral/30' : 'bg-ink-50'}`}
                            style={{ minHeight: 20 }} />
                        )}
                      </div>
                      {/* Right: text */}
                      <div className={`pb-4 flex-1 ${active ? '' : 'opacity-60'}`}>
                        <div className={`text-[13px] font-bold ${done ? 'text-ink' : 'text-ink/40'}`}>{step.label}</div>
                        <div className="text-[11px] text-text-tertiary">{step.sub}</div>
                        {active && match.status === 'delivered' && (
                          <div className="mt-1 text-[11px] font-bold text-success">Delivered successfully!</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {match.status !== 'delivered' && (
                <div className="mt-3 mx-1 flex items-center justify-between rounded-xl bg-secondary px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-coral" />
                    <div>
                      <p className="text-[11px] font-bold text-coral">
                        {match.status === 'out' ? 'প্রায় পৌঁছে গেছে!' : 'আনুমানিক ডেলিভারি সময়'}
                      </p>
                      <p className="text-[11px] text-text-tertiary">
                        {match.status === 'out'
                          ? '~15-20 মিনিট'
                          : settings?.deliveryEstimate ?? '45-60 মিনিট'}
                      </p>
                    </div>
                  </div>
                  {match.status === 'out' && (
                    <div className="flex gap-px">
                      {[0,1,2,3,4].map((i) => (
                        <div key={i} className={`h-1.5 w-4 rounded-full ${i < 4 ? 'bg-coral' : 'bg-coral/20'}`} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            )}
          </article>
        ) : query.trim() ? (
          /* No-results state */
          <div className="mt-8 text-center anim-fade">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-ink-50">
              <Search className="h-9 w-9 text-text-tertiary" strokeWidth={1.6} />
            </div>
            <p className="mt-3 text-[16px] font-bold text-ink">Order not found</p>
            <p className="mt-1 text-[13px] text-text-secondary">Please check the order ID and try again.</p>
          </div>
        ) : (
          /* Initial state — no query yet */
          <div className="mt-8 text-center anim-fade">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary shadow-card">
              <Package className="h-10 w-10 text-coral" strokeWidth={1.8} />
            </div>
            <p className="mt-3 text-[13px] text-text-secondary leading-relaxed">
              Enter an order ID to see live status. You can also open tracking from your Orders page.
            </p>
            {orders.length > 0 && (
              <button
                onClick={() => {
                  const latest = orders.find(o =>
                    o.status !== 'delivered' && o.status !== 'cancelled'
                  ) ?? orders[0];
                  if (latest) setQuery(latest.id);
                }}
                className="mb-3 mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-coral text-[13px] font-bold text-white shadow-btn"
              >
                <Truck className="h-4 w-4" /> সর্বশেষ অর্ডার ট্র্যাক করুন
              </button>
            )}
            <button onClick={() => setTab('orders')} className="btn-primary mt-4 h-11 rounded-2xl px-5 text-[13px] font-bold">
              My orders
            </button>
          </div>
        )}
      </div>
      {match && match.status !== 'delivered' && match.status !== 'cancelled' && (
        <button
          onClick={() => setChatOpen(true, match.id)}
          className="fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-2xl bg-coral px-4 py-2.5 shadow-btn transition active:scale-95"
        >
          <MessageCircle className="h-4 w-4 text-white" strokeWidth={2} />
          <span className="text-[12px] font-bold text-white">সাহায্য দরকার?</span>
        </button>
      )}
    </div>
  );
}
