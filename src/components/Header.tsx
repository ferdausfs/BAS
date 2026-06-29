import { Heart, ShoppingBag, Bell, Wallet } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useUI, useCart, useUser, useAuthStore, useWallet } from '../lib/store';
import BrandLogo from './BrandLogo';

interface Props {
  onLogoTap?: () => void;
  onNotificationsOpen?: () => void;
}

export default function Header({ onLogoTap, onNotificationsOpen }: Props) {
  const { go, setTab, notifications } = useUI();
  const { items } = useCart();
  const { wishlist } = useUser();
  const { user } = useAuthStore();
  const walletBalance = useWallet((s) => s.balance);
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const wishCount = wishlist.length;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [badgeKey, setBadgeKey] = useState(0);
  const prevCountRef = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setBadgeKey(k => k + 1);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  return (
    <header className="flex flex-shrink-0 items-center justify-between px-5 pb-3 pt-4">
      <button
        onClick={onLogoTap ?? (() => setTab('home'))}
        className="flex items-center gap-2.5 transition active:scale-95"
      >
        <BrandLogo size={48} />
        <div className="text-left leading-none">
          <div className="font-brand text-[30px] font-bold leading-[0.9] tracking-normal">
            <span className="text-[#4b2318]">Bake Art</span>
            <span className="text-coral"> Style</span>
          </div>
          <div className="mt-1 text-[9px] font-bold tracking-[0.2em] text-ink-100 uppercase">
            Artisan Bakery
          </div>
        </div>
      </button>

      <div className="flex items-center gap-1">
        <button
          onClick={onNotificationsOpen ?? (() => setTab('profile'))}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-300 transition active:scale-90 hover:bg-ink-50"
          aria-label="Notifications"
        >
          <Bell className="h-[19px] w-[19px]" strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => go({ name: 'wishlist' })}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-300 transition active:scale-90 hover:bg-ink-50"
          aria-label="Wishlist"
        >
          <Heart
            className={"h-[19px] w-[19px] " + (wishCount > 0 ? 'fill-coral text-coral' : '')}
            strokeWidth={1.8}
          />
          {wishCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">
              {wishCount}
            </span>
          )}
        </button>
        {user && walletBalance > 0 && (
          <button
            onClick={() => go({ name: 'tabs', tab: 'profile' })}
            className="flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 transition active:scale-95"
            aria-label="Wallet balance"
          >
            <Wallet className="h-3 w-3 text-gold" strokeWidth={2} />
            <span className="text-[11px] font-bold text-gold">
              ৳{walletBalance.toLocaleString()}
            </span>
          </button>
        )}
        <button
          onClick={() => go({ name: 'cart' })}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white transition active:scale-90"
          aria-label="Cart"
        >
          <div className="relative">
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2} />
            {badgeKey > 0 && (
              <span
                key={`ring-${badgeKey}`}
                className="absolute inset-0 rounded-full anim-ring pointer-events-none"
                style={{ margin: '-4px' }}
              />
            )}
          </div>
          {cartCount > 0 && (
            <span
              key={badgeKey}
              className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white ring-2 ring-cream anim-pop"
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
