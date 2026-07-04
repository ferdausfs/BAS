import { useEffect, useRef, useState } from 'react';
import { Bell, Heart, ShoppingBag, Wallet } from 'lucide-react';
import { useUI, useCart, useUser, useAuthStore, useWallet, formatINR, cartSubtotal } from '../lib/store';

interface Props {
  onNotificationsOpen: () => void;
}

// Shared "nav-bar recipe" — same opaque background/border/shadow as BottomTabBar's
// floating pill, so the popup reads as one consistent surface family with the nav bar.
const NAV_BAR_SURFACE = {
  background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8FA 100%)',
  border: '0.5px solid rgba(255,255,255,0.9)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.9), 0 18px 34px -18px rgba(74,27,12,0.35), 0 4px 12px -6px rgba(74,27,12,0.15)',
};

export default function QuickBar({ onNotificationsOpen }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { go, notifications, view } = useUI();
  const { items } = useCart();
  const { wishlist } = useUser();
  const { user } = useAuthStore();
  const walletBalance = useWallet((s) => s.balance);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartSubtotal(items);
  const wishCount = wishlist.length;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalBadge = unreadCount + wishCount + cartCount;
  const onWishlistPage = view.name === 'wishlist';
  const onCartPage = view.name === 'cart';
  const onProfileTab = view.name === 'tabs' && view.tab === 'profile';
  const hasWallet = Boolean(user) && walletBalance > 0 && !onProfileTab;
  const showCheckout = cartCount > 0 && !onCartPage;

  // Close on outside tap
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  return (
    <div ref={ref} className="fixed top-3 right-3 z-50">
      {/* Pill trigger — bumped up a size (070426): px-3.5/py-2 -> px-4/py-2.5,
          icon 16px -> 18px, count text 12px -> 13px, +badge 18px -> 20px */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 px-4 py-2.5 text-white transition active:scale-95"
        style={{
          boxShadow:
            '0 6px 18px -4px rgba(212,60,86,0.55), 0 2px 6px -1px rgba(212,60,86,0.35), inset 0 1px 0 rgba(255,255,255,0.35)',
        }}
        aria-label="Quick actions"
      >
        <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2} />
        {cartCount > 0 && (
          <span className="text-[13px] font-bold leading-none">{cartCount}</span>
        )}
        {totalBadge > cartCount && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/25 px-1.5 text-[10px] font-bold text-white">
            +{totalBadge - cartCount}
          </span>
        )}
      </button>

      {/* Popup — now uses the exact same opaque surface recipe as BottomTabBar
          (was `.glass-strong`; kept width/radius the same, just swapped the paint). */}
      {open && (
        <div
          className={`absolute top-[calc(100%+8px)] right-0 rounded-2xl ${
            showCheckout && hasWallet ? 'w-64' : 'w-52'
          }`}
          style={NAV_BAR_SURFACE}
        >
          {/* Arrow */}
          <div
            className="absolute -top-[5px] right-4 h-2.5 w-2.5 rotate-45 rounded-[1px]"
            style={{
              background: '#FFFFFF',
              borderLeft: '0.5px solid rgba(255,255,255,0.9)',
              borderTop: '0.5px solid rgba(255,255,255,0.9)',
            }}
          />

          <div className="p-3">
            {/* Row: Bell, Wishlist/Cart (context-aware), (Wallet if available) */}
            <div className="flex gap-2">
              {/* Notifications */}
              <button
                onClick={() => { setOpen(false); onNotificationsOpen(); }}
                className="relative flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-gradient-to-b from-white to-cream py-3 shadow-[0_1px_3px_rgba(26,19,17,0.06)] transition active:scale-95"
              >
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-coral px-0.5 text-[8px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-coral-100 to-coral-200">
                  <Bell className="h-4 w-4 text-coral-700" strokeWidth={1.8} />
                </span>
                <span className="text-[9px] text-ink-300">Notif</span>
              </button>

              {/* Wishlist (default) — swaps to Cart while already on the Wishlist page */}
              {onWishlistPage ? (
                <button
                  onClick={() => { setOpen(false); go({ name: 'cart' }); }}
                  className="relative flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-gradient-to-b from-white to-cream py-3 shadow-[0_1px_3px_rgba(26,19,17,0.06)] transition active:scale-95"
                >
                  {cartCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-coral px-0.5 text-[8px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-coral-100 to-coral-200">
                    <ShoppingBag className="h-4 w-4 text-coral-700" strokeWidth={1.8} />
                  </span>
                  <span className="text-[9px] text-ink-300">Cart</span>
                </button>
              ) : (
                <button
                  onClick={() => { setOpen(false); go({ name: 'wishlist' }); }}
                  className="relative flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-gradient-to-b from-white to-cream py-3 shadow-[0_1px_3px_rgba(26,19,17,0.06)] transition active:scale-95"
                >
                  {wishCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-coral px-0.5 text-[8px] font-bold text-white">
                      {wishCount}
                    </span>
                  )}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-coral-100 to-coral-200">
                    <Heart
                      className={'h-4 w-4 ' + (wishCount > 0 ? 'fill-coral text-coral-700' : 'text-coral-700')}
                      strokeWidth={1.8}
                    />
                  </span>
                  <span className="text-[9px] text-ink-300">Wishlist</span>
                </button>
              )}

              {/* Wallet — hidden on Profile tab (already shown there via wallet card); row shrinks to 2-column otherwise */}
              {hasWallet && (
                <button
                  onClick={() => { setOpen(false); go({ name: 'tabs', tab: 'profile' }); }}
                  className="relative flex flex-1 flex-col items-center gap-1 rounded-xl bg-gradient-to-b from-gold/15 to-gold/8 py-3 shadow-[0_1px_3px_rgba(26,19,17,0.06)] transition active:scale-95"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-gold/20">
                    <Wallet className="h-4 w-4 text-gold-800" strokeWidth={1.8} />
                  </span>
                  <span className="text-[13px] font-extrabold leading-none text-gold-800">
                    ৳{walletBalance.toLocaleString('en-BD')}
                  </span>
                  <span className="text-[8px] font-medium uppercase tracking-wide text-gold-800/70">Wallet</span>
                </button>
              )}

              {/* Checkout — same card recipe as Wallet (icon tile + bold amount + label),
                  coral tint instead of gold so it reads as its own action. Only shown
                  when the cart has items and we're not already on the cart page.
                  Goes to `cart` (review + extras page), not straight to `checkout` (payment) —
                  user wants to land on the same "My Cart" review screen the bottom-nav cart uses. */}
              {showCheckout && (
                <button
                  onClick={() => { setOpen(false); go({ name: 'cart' }); }}
                  className="relative flex flex-1 flex-col items-center gap-1 rounded-xl bg-gradient-to-b from-coral-100 to-coral-50 py-3 shadow-[0_1px_3px_rgba(26,19,17,0.06)] transition active:scale-95"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-coral-200 to-coral-100">
                    <ShoppingBag className="h-4 w-4 text-coral-700" strokeWidth={1.8} />
                  </span>
                  <span className="text-[13px] font-extrabold leading-none text-coral-700">
                    {formatINR(cartTotal)}
                  </span>
                  <span className="text-[8px] font-medium uppercase tracking-wide text-coral-700/70">Checkout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
