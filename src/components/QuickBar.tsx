import { useEffect, useRef, useState } from 'react';
import { Bell, Heart, ShoppingBag, Wallet } from 'lucide-react';
import { useUI, useCart, useUser, useAuthStore, useWallet } from '../lib/store';

interface Props {
  onNotificationsOpen: () => void;
}

export default function QuickBar({ onNotificationsOpen }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { go, notifications, view } = useUI();
  const { items } = useCart();
  const { wishlist } = useUser();
  const { user } = useAuthStore();
  const walletBalance = useWallet((s) => s.balance);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const wishCount = wishlist.length;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalBadge = unreadCount + wishCount + cartCount;
  const onWishlistPage = view.name === 'wishlist';
  const onProfileTab = view.name === 'tabs' && view.tab === 'profile';
  const hasWallet = Boolean(user) && walletBalance > 0 && !onProfileTab;

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
      {/* Pill trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 px-3.5 py-2 text-white transition active:scale-95"
        style={{
          boxShadow:
            '0 6px 18px -4px rgba(212,60,86,0.55), 0 2px 6px -1px rgba(212,60,86,0.35), inset 0 1px 0 rgba(255,255,255,0.35)',
        }}
        aria-label="Quick actions"
      >
        <ShoppingBag className="h-4 w-4" strokeWidth={2} />
        {cartCount > 0 && (
          <span className="text-[12px] font-bold leading-none">{cartCount}</span>
        )}
        {totalBadge > cartCount && (
          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white/25 px-1 text-[9.5px] font-bold text-white">
            +{totalBadge - cartCount}
          </span>
        )}
      </button>

      {/* Popup */}
      {open && (
        <div className="glass-strong absolute top-[calc(100%+8px)] right-0 w-52 rounded-2xl">
          {/* Arrow */}
          <div className="absolute -top-[5px] right-4 h-2.5 w-2.5 rotate-45 rounded-[1px] border-l border-t border-black/8 bg-white" />

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
                  className="relative flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-gradient-to-b from-gold/15 to-gold/8 py-3 shadow-[0_1px_3px_rgba(26,19,17,0.06)] transition active:scale-95"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-gold/20">
                    <Wallet className="h-4 w-4 text-gold-800" strokeWidth={1.8} />
                  </span>
                  <span className="text-[9px] font-medium text-gold-800">
                    ৳{walletBalance.toLocaleString('en-BD')}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
