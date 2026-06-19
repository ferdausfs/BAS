import { Heart, ShoppingBag, Bell } from 'lucide-react';
import { useUI, useCart, useUser } from '../lib/store';
import BrandLogo from './BrandLogo';

export default function Header() {
  const { go, setTab } = useUI();
  const { items } = useCart();
  const { wishlist } = useUser();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const wishCount = wishlist.length;

  return (
    <header className="flex flex-shrink-0 items-center justify-between px-5 pb-3 pt-4">
      {/* Left: logo + brand mark */}
      <button
        onClick={() => setTab('home')}
        className="flex items-center gap-2.5 transition active:scale-95"
      >
        <BrandLogo size={36} />
        <div className="text-left leading-none">
          <div className="font-display text-[19px] font-bold tracking-tight">
            <span className="text-ink">Bake Art</span>
            <span className="text-coral"> Style</span>
          </div>
          <div className="mt-0.5 text-[10px] font-medium tracking-[0.16em] text-ink-100 uppercase">
            Artisan Bakery
          </div>
        </div>
      </button>

      {/* Right: action icons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setTab('profile')}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-300 transition active:scale-90 hover:bg-ink-50"
          aria-label="Notifications"
        >
          <Bell className="h-[19px] w-[19px]" strokeWidth={1.8} />
        </button>
        <button
          onClick={() => setTab('profile')}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-300 transition active:scale-90 hover:bg-ink-50"
          aria-label="Wishlist"
        >
          <Heart
            className={`h-[19px] w-[19px] ${wishCount > 0 ? 'fill-coral text-coral' : ''}`}
            strokeWidth={1.8}
          />
          {wishCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">
              {wishCount}
            </span>
          )}
        </button>
        <button
          onClick={() => go({ name: 'cart' })}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white transition active:scale-90"
          aria-label="Cart"
        >
          <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white ring-2 ring-cream">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}