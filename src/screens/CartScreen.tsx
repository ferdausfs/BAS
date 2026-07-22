import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Sparkles, Truck, Shield, ShoppingCart, Cake, Flower2, Gift } from 'lucide-react';
import {
  useCart,
  useUI,
  useWallet,
  WALLET_MAX_REDEEM,
  formatINR,
  cartSubtotal,
  standardDeliveryFee,
  useSettingsStore,
} from '../lib/store';
import { safeArray } from '../lib/utils';
import type { CartItem } from '../types';

const ADDON_ICON: Record<string, React.ElementType> = {
  decoration: Sparkles,
  theme: Cake,
  flowers: Flower2,
  extras: Gift,
};

export default function CartScreen() {
  const { items, add, setQty, remove } = useCart();
  const {
    back,
    go,
    promoDiscount,
    clearPromo,
    pendingLoyaltyRedeem,
    setPendingLoyaltyRedeem,
    clearLoyalty,
  } = useUI();
  const { balance } = useWallet();

  const { settings } = useSettingsStore();
  const currentDeliveryFee = settings.deliveryFee !== undefined ? settings.deliveryFee : standardDeliveryFee;
  const currentFreeThreshold = settings.freeDeliveryThreshold !== undefined ? settings.freeDeliveryThreshold : 999;

  const subtotal = cartSubtotal(items);
  const isFreeDelivery = subtotal >= currentFreeThreshold;
  const delivery = items.length === 0 ? 0 : (isFreeDelivery ? 0 : currentDeliveryFee);

  // Wallet: balance is in ৳ taka directly
  const maxRedeemable = Math.min(balance, WALLET_MAX_REDEEM, subtotal);
  const walletDiscount = pendingLoyaltyRedeem; // pendingLoyaltyRedeem now stores ৳ directly

  const promoDiscountAmount = promoDiscount > 0 ? (subtotal * promoDiscount) / 100 : 0;
  const discountAmount = promoDiscountAmount + walletDiscount;
  const total = Math.max(0, subtotal + delivery - discountAmount);

  const remaining = currentFreeThreshold - subtotal;
  const progress = Math.min((subtotal / currentFreeThreshold) * 100, 100);

  // Auto-clamp wallet redemption if cart total drops
  useEffect(() => {
    if (pendingLoyaltyRedeem === 0) return;
    if (pendingLoyaltyRedeem > maxRedeemable) {
      setPendingLoyaltyRedeem(maxRedeemable);
    }
  }, [subtotal, balance, pendingLoyaltyRedeem, maxRedeemable, setPendingLoyaltyRedeem]);

  const handleCheckout = () => {
    go({ name: 'checkout' });
  };

  // Swipe-to-delete: index of the item pending removal confirmation (sheet open)
  const [confirmIdx, setConfirmIdx] = useState<number | null>(null);
  const confirmItem = confirmIdx !== null ? items[confirmIdx] : null;

  if (items.length === 0) {
    // clear any stale discounts when cart empties
    if (promoDiscount > 0 || pendingLoyaltyRedeem > 0) {
      clearPromo();
      clearLoyalty();
    }
    return (
      <div className="flex h-full flex-col bg-bg">
        <Header title="আমার কার্ট" onBack={back} />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-surface text-coral shadow-card">
            <ShoppingCart size={40} strokeWidth={1.5} />
          </div>
          <h2 className="mt-6 font-sans text-[22px] font-bold tracking-tight text-ink">
            আপনার কার্ট খালি
          </h2>
          <p className="mt-2 text-[13.5px] text-ink-300">
            শুরু করতে সুস্বাদু কিছু কেক যোগ করুন।
          </p>
          <button
            onClick={back}
            className="btn-primary mt-6 flex h-12 items-center gap-2 rounded-full px-7 text-[13px] font-bold shadow-btn"
          >
            <Sparkles className="h-4 w-4" /> কেক দেখুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-bg">
      <Header title="আমার কার্ট" onBack={back} badge={`${items.length}`} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-44 pt-1">
        {/* Free delivery nudge */}
        {remaining > 0 ? (
          <div className="mb-4 rounded-2xl border border-border bg-surface p-4 shadow-card">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-coral">
                <Truck className="h-4 w-4" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-ink">
                  ফ্রি ডেলিভারির জন্য আরও {formatINR(remaining)} যোগ করুন
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-coral transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-2.5 rounded-2xl bg-emerald-50 px-3.5 py-3 text-emerald-700">
            <Shield className="h-4 w-4" />
            <span className="text-[13px] font-bold">আপনি ফ্রি ডেলিভারি পেয়ে গেছেন</span>
          </div>
        )}

        {/* Items — swipe left to reveal delete, tap to confirm removal */}
        <div className="space-y-3">
          {safeArray<CartItem>(items).map((item, idx) => (
            <CartItemRow
              key={item.productId + "-" + idx}
              item={item}
              onDecrease={() => {
                if (item.quantity > 1) setQty(idx, item.quantity - 1);
              }}
              onIncrease={() => setQty(idx, item.quantity + 1)}
              onRequestRemove={() => setConfirmIdx(idx)}
            />
          ))}
        </div>

        {/* Suggested add-ons */}
        {settings?.customAddons && settings.customAddons.length > 0 && (
          <div className="mt-5">
            <div className="mb-2.5 text-[11px] font-bold tracking-wider text-ink-300 uppercase">
              আরও কিছু যোগ করুন
            </div>
            <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
              {settings.customAddons.slice(0, 6).map((addon) => (
                <button
                  key={addon.id}
                  onClick={() => {
                    add({
                      productId: `addon-${addon.id}`,
                      name: addon.label,
                      image: '/cakes/logo-cake.png',
                      size: '—',
                      flavor: '—',
                      price: addon.price,
                      quantity: 1,
                    });
                  }}
                  className="flex w-[104px] flex-shrink-0 flex-col items-start gap-1.5 rounded-2xl border border-border bg-surface p-3 text-left transition active:scale-95 shadow-card"
                >
                  {(() => {
                    const AddonIcon = ADDON_ICON[addon.category] ?? Sparkles;
                    return (
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                        <AddonIcon className="h-[18px] w-[18px] text-coral" strokeWidth={2} />
                      </div>
                    );
                  })()}
                  <span className="text-[12px] font-bold leading-tight text-ink line-clamp-2">{addon.label}</span>
                  <div className="flex w-full items-center justify-between">
                    <span className="text-[12px] font-bold text-coral">৳{addon.price}</span>
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-coral">
                      <Plus className="h-3 w-3 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bill Details */}
        <section
          className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
        >
          <div className="px-4 pt-4 pb-2 border-b border-divider">
            <div className="text-[11px] font-bold tracking-wider text-coral-700 uppercase">
              বিল বিবরণ
            </div>
          </div>
          <div className="space-y-2.5 px-4 py-4 text-[13px]">
            <Row label={`সাবটোটাল (${items.length} আইটেম)`} value={formatINR(subtotal)} />
            <Row
              label="ডেলিভারি চার্জ"
              value={delivery === 0 ? 'ফ্রি' : formatINR(delivery)}
              positive={delivery === 0}
            />
            {promoDiscountAmount > 0 && (
              <Row
                label="প্রোমো ডিসকাউন্ট"
                value={'-' + formatINR(Math.round(promoDiscountAmount))}
                positive
              />
            )}
            {walletDiscount > 0 && (
              <Row label="Wallet discount" value={'-৳' + walletDiscount} positive />
            )}
            <div className="h-px bg-divider" />
            <div className="flex items-center justify-between pt-1">
              <span className="font-sans text-[15px] font-bold tracking-tight text-ink">
                মোট
              </span>
              <span className="font-sans text-[18px] font-bold tabular text-ink">
                {formatINR(total)}
              </span>
            </div>
          </div>
        </section>

        {/* Trust */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[12px] text-ink-300">
          <Shield className="h-3.5 w-3.5 text-coral/80" />
          নিরাপদ ও বিশ্বস্ত অর্ডার প্রসেসিং
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="absolute right-0 bottom-0 left-0 z-30 bg-white/95 px-6 pt-4 pb-6 shadow-float rounded-t-[22px]">
        <button
          onClick={handleCheckout}
          className="btn-primary flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[14px] font-bold tracking-tight shadow-btn"
        >
          <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2.2} />
          চেকআউট · {formatINR(total)}
        </button>
      </div>

      {/* Remove-item confirmation sheet */}
      {confirmItem && confirmIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-ink/40"
          onClick={() => setConfirmIdx(null)}
        >
          <div
            className="w-full rounded-t-[22px] border-t border-border bg-surface p-6 pb-8 shadow-float anim-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 font-sans text-[18px] font-bold text-ink">কার্ট থেকে সরাবেন?</h2>
            <div className="mb-5 flex gap-3 rounded-2xl border border-border p-3 bg-bg">
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-white">
                <img
                  src={confirmItem.image || '/cakes/logo-cake.png'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/cakes/logo-cake.png';
                  }}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-[14px] font-bold text-ink">{confirmItem.name}</div>
                <div className="text-[12px] text-ink-300">
                  {confirmItem.size} · {confirmItem.flavor}
                </div>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmIdx(null)}
                className="h-12 flex-1 rounded-full bg-secondary text-[14px] font-bold text-coral transition active:scale-95"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  remove(confirmIdx);
                  setConfirmIdx(null);
                }}
                className="h-12 flex-1 rounded-full bg-error text-[14px] font-bold text-white transition active:scale-95"
              >
                হ্যাঁ, সরান
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SWIPE_MAX = 84;

function CartItemRow({
  item,
  onDecrease,
  onIncrease,
  onRequestRemove,
}: {
  item: CartItem;
  onDecrease: () => void;
  onIncrease: () => void;
  onRequestRemove: () => void;
}) {
  const [translateX, setTranslateX] = useState(0);
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);
  const openRef = useRef(open);
  openRef.current = open;
  
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const dragging = useRef(false);
  const lockedAxis = useRef<'none' | 'x' | 'y'>('none');
  const baseX = useRef(0);

  // Native touch listeners (reliable on real mobile devices; pointer events
  // with touchAction:pan-y can still let vertical scroll win before preventDefault).
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      const t = e.touches[0];
      dragging.current = true;
      lockedAxis.current = 'none';
      touchStartX.current = t.clientX;
      touchStartY.current = t.clientY;
      baseX.current = openRef.current ? -SWIPE_MAX : 0;
    };

    const onMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      const t = e.touches[0];
      const dx = t.clientX - touchStartX.current;
      const dy = t.clientY - touchStartY.current;

      if (lockedAxis.current === 'none') {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          lockedAxis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        }
      }

      if (lockedAxis.current === 'x') {
        e.preventDefault();
        const x = Math.max(-SWIPE_MAX, Math.min(0, baseX.current + dx));
        setTranslateX(x);
      }
    };

    const endDrag = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setTranslateX((current) => {
        const nextOpen = current < -SWIPE_MAX / 2;
        setOpen(nextOpen);
        return nextOpen ? -SWIPE_MAX : 0;
      });
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', endDrag, { passive: true });
    el.addEventListener('touchcancel', endDrag, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', endDrag);
      el.removeEventListener('touchcancel', endDrag);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl anim-up">
      <button
        onClick={() => {
          onRequestRemove();
          setOpen(false);
          setTranslateX(0);
        }}
        aria-label="মুছুন"
        className="absolute top-0 right-0 bottom-0 flex items-center justify-center rounded-2xl bg-error text-white"
        style={{ width: SWIPE_MAX }}
      >
        <Trash2 className="h-5 w-5" strokeWidth={2} />
      </button>
      <article
        ref={cardRef}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: dragging.current ? 'none' : 'transform .25s ease',
          touchAction: 'pan-y',
        }}
        className="relative flex cursor-grab gap-4 rounded-2xl border border-border bg-surface p-3.5 shadow-card"
      >
        <div className="h-[84px] w-[84px] flex-shrink-0 rounded-xl border border-border bg-white p-1.5 shadow-sm">
          <div className="h-full w-full overflow-hidden rounded-lg">
            <img
              loading="lazy"
              decoding="async"
              src={item.image || '/cakes/logo-cake.png'}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.onerror = null;
                img.src = '/cakes/logo-cake.png';
              }}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="min-w-0 flex-1">
            <h4 className="line-clamp-1 text-[14px] font-bold text-ink">{item.name}</h4>
            <div className="mt-0.5 text-[12px] text-ink-300">
              {item.size} · {item.flavor}
            </div>
            {item.message && (
              <div className="mt-0.5 line-clamp-1 text-[11.5px] italic text-coral">
                "{item.message}"
              </div>
            )}
          </div>
          <div className="mt-auto flex items-center justify-between pt-1">
            <div className="flex items-center rounded-full border border-border bg-white p-0.5">
              <button
                onClick={() => {
                  if (item.quantity <= 1) onRequestRemove();
                  else onDecrease();
                }}
                aria-label={item.quantity <= 1 ? 'মুছুন' : 'কমান'}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink-300 transition hover:bg-secondary/50"
              >
                {item.quantity <= 1 ? (
                  <Trash2 className="h-3.5 w-3.5 text-error" />
                ) : (
                  <Minus className="h-3.5 w-3.5" />
                )}
              </button>
              <span className="w-7 text-center text-[12.5px] font-bold tabular text-ink">
                {item.quantity}
              </span>
              <button
                onClick={onIncrease}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink-300 transition hover:bg-secondary/50"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="font-sans text-[15px] font-bold tabular text-ink">
              {formatINR(item.price * item.quantity)}
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}

function Header({ title, onBack, badge }: { title: string; onBack: () => void; badge?: string }) {
  return (
    <header className="flex flex-shrink-0 items-center justify-between px-6 pt-3 pb-3">
      <button
        onClick={onBack}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-card transition active:scale-90"
      >
        <ArrowLeft className="h-[20px] w-[20px]" strokeWidth={2} />
      </button>
      <div className="flex items-center gap-2">
        <h1 className="font-sans text-[16px] font-bold tracking-tight text-ink">{title}</h1>
        {badge && (
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-coral">
            {badge}
          </span>
        )}
      </div>
      <div className="w-10" />
    </header>
  );
}

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-300">{label}</span>
      <span className={`tabular font-bold ${positive ? 'text-emerald-600' : 'text-ink'}`}>
        {value}
      </span>
    </div>
  );
}
