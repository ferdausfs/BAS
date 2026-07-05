import React, { useEffect } from 'react';
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
  // Max redeem = min(balance, WALLET_MAX_REDEEM, subtotal cap)
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

  if (items.length === 0) {
    // clear any stale discounts when cart empties
    if (promoDiscount > 0 || pendingLoyaltyRedeem > 0) {
      clearPromo();
      clearLoyalty();
    }
    return (
      <div className="flex h-full flex-col">
        <Header title="আমার কার্ট" onBack={back} />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-3xl glass-strong text-ink-200"
            style={{ boxShadow: '0 1px 2px rgba(26,19,17,.03), 0 12px 30px -18px rgba(26,19,17,.14)' }}
          >
            <ShoppingCart size={44} strokeWidth={1.5} />
          </div>
          <h2 className="mt-5 font-display text-[22px] font-bold tracking-tight text-ink">
            আপনার কার্ট খালি
          </h2>
          <p className="mt-1.5 text-[13.5px] text-ink-200">
            শুরু করতে সুস্বাদু কিছু কেক যোগ করুন।
          </p>
          <button
            onClick={back}
            className="btn-primary mt-6 flex h-12 items-center gap-2 rounded-2xl px-7 text-[13px] font-bold"
          >
            <Sparkles className="h-4 w-4" /> কেক দেখুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="আমার কার্ট" onBack={back} badge={`${items.length}`} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-44 pt-1">
        {/* Free delivery nudge */}
        {remaining > 0 ? (
          <div className="mb-4 rounded-2xl glass-strong p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-50 text-ink-200">
                <Truck className="h-4 w-4" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-ink">
                  ফ্রি ডেলিভারির জন্য আরও {formatINR(remaining)} যোগ করুন
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-ink-200 to-ink-300"
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

        {/* Items */}
        <div className="space-y-3">
          {safeArray<CartItem>(items).map((item, idx) => (
            <article
              key={idx}
              className="flex gap-3 rounded-2xl glass-strong p-3 anim-up"
            >
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl glass-strong">
                <img
                  loading="lazy"
                  decoding="async"
                  src={item.image || '/cakes/logo-cake.png'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/cakes/logo-cake.png';
                  }}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="line-clamp-1 text-[14px] font-bold text-ink">{item.name}</h4>
                    <div className="mt-0.5 text-[12px] text-ink-200">
                      {item.size} · {item.flavor}
                    </div>
                    {item.message && (
                      <div className="mt-0.5 line-clamp-1 text-[11.5px] italic text-coral">
                        "{item.message}"
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => remove(idx)}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-ink-200 transition active:bg-rose-50 active:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <div className="flex items-center rounded-full border border-ink-50 bg-white p-0.5">
                    <button
                      onClick={() => setQty(idx, item.quantity - 1)}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-ink-200 transition hover:bg-cream"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-[12.5px] font-bold tabular text-ink">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQty(idx, item.quantity + 1)}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-ink-200 transition hover:bg-cream"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-display text-[15px] font-bold tabular text-ink">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Suggested add-ons */}
        {settings?.customAddons && settings.customAddons.length > 0 && (
          <div className="mt-5">
            <div className="mb-2.5 text-[11px] font-bold tracking-wider text-ink-200 uppercase">
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
                  className="flex w-[104px] flex-shrink-0 flex-col items-start gap-1.5 rounded-2xl glass-strong p-3 text-left transition active:scale-95"
                >
                  {(() => {
                    const AddonIcon = ADDON_ICON[addon.category] ?? Sparkles;
                    return (
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral/10">
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

        {/* Promo/wallet discounts are now applied from the Checkout → পেমেন্ট step,
            not here. Discount state itself is global (useUI store) so this page's
            Bill below still reflects whatever was applied there. */}
        <section
          className="mt-4 overflow-hidden rounded-2xl glass-strong"
        >
          <div className="px-4 pt-4 pb-2">
            <div className="text-[11px] font-bold tracking-wider text-ink-200 uppercase">
              বিল বিবরণ
            </div>
          </div>
          <div className="space-y-2.5 px-4 py-3 text-[13px]">
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
            <div className="h-px bg-ink-50" />
            <div className="flex items-center justify-between pt-1">
              <span className="font-display text-[15px] font-bold tracking-tight text-ink">
                মোট
              </span>
              <span className="font-display text-[18px] font-bold tabular text-ink">
                {formatINR(total)}
              </span>
            </div>
          </div>
        </section>

        {/* Trust */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-ink-200">
          <Shield className="h-3.5 w-3.5" />
          নিরাপদ ও বিশ্বস্ত অর্ডার প্রসেসিং
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="absolute right-0 bottom-0 left-0 z-30 border-t border-ink-50/80 bg-white/95 px-5 pt-3 pb-6 backdrop-blur-xl">
        <button
          onClick={handleCheckout}
          className="btn-primary flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[14px] font-bold tracking-tight"
        >
          <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2.2} />
          চেকআউট · {formatINR(total)}
        </button>
      </div>
    </div>
  );
}

function Header({ title, onBack, badge }: { title: string; onBack: () => void; badge?: string }) {
  return (
    <header className="flex flex-shrink-0 items-center justify-between px-5 pt-3 pb-3">
      <button
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink transition active:scale-90"
        style={{ boxShadow: '0 1px 2px rgba(26,19,17,.03), 0 6px 16px -10px rgba(26,19,17,.2)' }}
      >
        <ArrowLeft className="h-[20px] w-[20px]" strokeWidth={2} />
      </button>
      <div className="flex items-center gap-2">
        <h1 className="font-display text-[16px] font-bold tracking-tight text-ink">{title}</h1>
        {badge && (
          <span className="rounded-full bg-ink-50 px-2 py-0.5 text-[11px] font-bold text-ink-200">
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
      <span className="text-ink-200">{label}</span>
      <span className={`tabular font-bold ${positive ? 'text-emerald-600' : 'text-ink'}`}>
        {value}
      </span>
    </div>
  );
}
