import { useEffect, useRef, useState } from 'react';
import { Bell, Heart, ShoppingBag, Wallet } from 'lucide-react';
import { useUI, useCart, useUser, useAuthStore, useWallet, formatINR, cartSubtotal } from '../lib/store';

interface Props { onNotificationsOpen: () => void; }

const popoverSurface = { boxShadow: '0 12px 28px -12px rgba(246,95,143,0.22)' };
const actionCard = 'relative flex flex-1 flex-col items-center gap-1.5 rounded-[16px] border border-border bg-surface py-3 shadow-card transition active:scale-95';
const actionIcon = 'flex h-9 w-9 items-center justify-center rounded-[14px] bg-secondary text-primary';

export default function QuickBar({ onNotificationsOpen }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { go, notifications, view } = useUI();
  const { items } = useCart();
  const { wishlist } = useUser();
  const { user } = useAuthStore();
  const walletBalance = useWallet((state) => state.balance);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartSubtotal(items);
  const wishCount = wishlist.length;
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const totalBadge = unreadCount + wishCount + cartCount;
  const onWishlistPage = view.name === 'wishlist';
  const onCartPage = view.name === 'cart';
  const onProfileTab = view.name === 'tabs' && view.tab === 'profile';
  const hasWallet = Boolean(user) && walletBalance > 0 && !onProfileTab;
  const showCheckout = cartCount > 0 && !onCartPage;

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open]);

  return (
    <div ref={ref} className="fixed right-4 top-4 z-[45]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 items-center gap-1.5 rounded-[16px] bg-primary px-3.5 py-2.5 text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
        aria-label="Quick actions"
        aria-expanded={open}
      >
        <ShoppingBag className="h-5 w-5" strokeWidth={2} />
        {cartCount > 0 && <span className="text-[13px] font-bold leading-none">{cartCount}</span>}
        {totalBadge > cartCount && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1 text-[10px] font-bold">+{totalBadge - cartCount}</span>}
      </button>

      {open && (
        <div className={`absolute right-0 top-[calc(100%+8px)] rounded-[20px] border border-border bg-surface p-3 ${showCheckout && hasWallet ? 'w-64' : 'w-52'}`} style={popoverSurface}>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setOpen(false); onNotificationsOpen(); }} className={actionCard}>
              {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">{unreadCount}</span>}
              <span className={actionIcon}><Bell className="h-4 w-4" strokeWidth={1.8} /></span>
              <span className="text-[10px] font-medium text-text-secondary">Notif</span>
            </button>

            {onWishlistPage ? (
              <button type="button" onClick={() => { setOpen(false); go({ name: 'cart' }); }} className={actionCard}>
                {cartCount > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">{cartCount}</span>}
                <span className={actionIcon}><ShoppingBag className="h-4 w-4" strokeWidth={1.8} /></span>
                <span className="text-[10px] font-medium text-text-secondary">Cart</span>
              </button>
            ) : (
              <button type="button" onClick={() => { setOpen(false); go({ name: 'wishlist' }); }} className={actionCard}>
                {wishCount > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">{wishCount}</span>}
                <span className={actionIcon}><Heart className={`h-4 w-4 ${wishCount > 0 ? 'fill-primary' : ''}`} strokeWidth={1.8} /></span>
                <span className="text-[10px] font-medium text-text-secondary">Wishlist</span>
              </button>
            )}

            {hasWallet && (
              <button type="button" onClick={() => { setOpen(false); go({ name: 'tabs', tab: 'profile' }); }} className={`${actionCard} bg-gold-light/50`}>
                <span className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-gold-light text-gold"><Wallet className="h-4 w-4" strokeWidth={1.8} /></span>
                <span className="text-[12px] font-bold leading-none text-text">৳{walletBalance.toLocaleString('en-BD')}</span>
                <span className="text-[9px] font-medium uppercase tracking-wide text-text-secondary">Wallet</span>
              </button>
            )}

            {showCheckout && (
              <button type="button" onClick={() => { setOpen(false); go({ name: 'cart' }); }} className={`${actionCard} bg-secondary`}>
                <span className={actionIcon}><ShoppingBag className="h-4 w-4" strokeWidth={1.8} /></span>
                <span className="text-[12px] font-bold leading-none text-primary">{formatINR(cartTotal)}</span>
                <span className="text-[9px] font-medium uppercase tracking-wide text-text-secondary">Checkout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
