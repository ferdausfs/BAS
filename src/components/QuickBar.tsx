import { useEffect, useRef, useState } from 'react';
import { Bell, Heart, ShoppingBag, Wallet } from 'lucide-react';
import { useUI, useCart, useUser, useAuthStore, useWallet } from '../lib/store';

interface Props {
  onNotificationsOpen: () => void;
}

export default function QuickBar({ onNotificationsOpen }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { go, notifications } = useUI();
  const { items } = useCart();
  const { wishlist } = useUser();
  const { user } = useAuthStore();
  const walletBalance = useWallet((s) => s.balance);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const wishCount = wishlist.length;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalBadge = unreadCount + wishCount + cartCount;

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
        className="flex items-center gap-1.5 rounded-full bg-coral px-3 py-1.5 text-white shadow-lg transition active:scale-95"
        aria-label="Quick actions"
      >
        <ShoppingBag className="h-[15px] w-[15px]" strokeWidth={2} />
        {cartCount > 0 && (
          <span className="text-[11px] font-bold leading-none">{cartCount}</span>
        )}
        {totalBadge > cartCount && (
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ink px-1 text-[9px] font-bold text-white">
            {totalBadge - cartCount}
          </span>
        )}
      </button>

      {/* Popup */}
      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-44 rounded-2xl border border-black/8 bg-white/98 shadow-xl backdrop-blur-sm">
          {/* Arrow */}
          <div className="absolute -top-[5px] right-4 h-2.5 w-2.5 rotate-45 rounded-[1px] border-l border-t border-black/8 bg-white" />

          <div className="p-2.5">
            {/* Row: Bell, Wishlist, Cart */}
            <div className="mb-2 flex gap-1.5">
              {/* Notifications */}
              <button
                onClick={() => { setOpen(false); onNotificationsOpen(); }}
                className="relative flex flex-1 flex-col items-center gap-1 rounded-xl bg-cream py-2.5 transition active:scale-95"
              >
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-coral px-0.5 text-[8px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
                <Bell className="h-5 w-5 text-ink-300" strokeWidth={1.8} />
                <span className="text-[9px] text-ink-300">Notif</span>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => { setOpen(false); go({ name: 'wishlist' }); }}
                className="relative flex flex-1 flex-col items-center gap-1 rounded-xl bg-cream py-2.5 transition active:scale-95"
              >
                {wishCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-coral px-0.5 text-[8px] font-bold text-white">
                    {wishCount}
                  </span>
                )}
                <Heart
                  className={'h-5 w-5 ' + (wishCount > 0 ? 'fill-coral text-coral' : 'text-ink-300')}
                  strokeWidth={1.8}
                />
                <span className="text-[9px] text-ink-300">Wishlist</span>
              </button>

              {/* Cart */}
              <button
                onClick={() => { setOpen(false); go({ name: 'cart' }); }}
                className="relative flex flex-1 flex-col items-center gap-1 rounded-xl bg-cream py-2.5 transition active:scale-95"
              >
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-ink px-0.5 text-[8px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
                <ShoppingBag className="h-5 w-5 text-ink-300" strokeWidth={1.8} />
                <span className="text-[9px] text-ink-300">Cart</span>
              </button>
            </div>

            {/* Wallet row — only if logged in and has balance */}
            {user && walletBalance > 0 && (
              <button
                onClick={() => { setOpen(false); go({ name: 'tabs', tab: 'profile' }); }}
                className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-gold/20 to-gold/10 px-3 py-2 transition active:scale-95"
              >
                <div className="flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
                  <span className="text-[10px] font-medium text-gold-800">Wallet</span>
                </div>
                <span className="text-[13px] font-bold text-gold-800">
                  ৳{walletBalance.toLocaleString('en-BD')}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
