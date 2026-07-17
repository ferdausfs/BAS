import { Bell, ShoppingBag, Heart, MapPin, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useUI, useCart, useUser, useLocation } from '../lib/store';
import SearchBar from './SearchBar';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  onSearch?: (v: string) => void;
  suggestions?: string[];
  recentSearches?: string[];
  onClearRecent?: () => void;
  onOpenOccasions?: () => void;
  onNotificationsOpen?: () => void;
}

/**
 * Brown/gold bakery-style home header block.
 * Renders a solid cocoa header panel with two rows — location + bell/wishlist/
 * cart icons, then the search field directly below — matching the reference
 * wireframe's compact 2-row header. Cart/wishlist/notification icons are kept
 * here (not dropped, even though the wireframe's top bar doesn't show them)
 * because Home is the only screen carrying them: BAS's bottom tab bar has no
 * cart/wishlist tab, so removing these would cut off navigation to both.
 */
export default function HomeTopBar({
  search,
  onSearchChange,
  onSearch,
  suggestions,
  recentSearches,
  onClearRecent,
  onOpenOccasions,
  onNotificationsOpen,
}: Props) {
  const { go, setTab, notifications } = useUI();
  const { items } = useCart();
  const { wishlist } = useUser();
  const district = useLocation((s) => s.district);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const wishCount = wishlist.length;
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Cart badge bounce when count grows (mirrors the old Header micro-interaction).
  const [badgeKey, setBadgeKey] = useState(0);
  const prevCount = useRef(cartCount);
  useEffect(() => {
    if (cartCount > prevCount.current) setBadgeKey((k) => k + 1);
    prevCount.current = cartCount;
  }, [cartCount]);

  return (
    <div
      className="sticky top-0 z-20 rounded-b-[22px] px-5 pt-5 pb-4 anim-up"
      style={{
        background: 'linear-gradient(160deg, #6B3A18 0%, #3D2418 100%)',
        boxShadow: '0 14px 30px -18px rgba(61,36,24,0.55)',
      }}
    >
      {/* Row 1: location + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setTab('profile')}
          className="flex items-center gap-2.5 text-left transition active:scale-95"
          aria-label="Delivery location"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
            <MapPin className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="leading-tight">
            <span className="block text-[10px] font-semibold text-white/55">
              Location
            </span>
            <span className="flex items-center gap-0.5 text-[13.5px] font-bold text-white">
              {district || 'Set your location'}
              <ChevronDown className="h-3.5 w-3.5 text-white/70" strokeWidth={2.5} />
            </span>
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Notifications */}
          <button
            onClick={onNotificationsOpen ?? (() => setTab('profile'))}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white transition active:scale-90"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-[#3D2418]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Wishlist */}
          <button
            onClick={() => go({ name: 'wishlist' })}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white transition active:scale-90"
            aria-label="Wishlist"
          >
            <Heart
              className={'h-[18px] w-[18px] ' + (wishCount > 0 ? 'fill-gold text-gold' : '')}
              strokeWidth={1.9}
            />
            {wishCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-[#3D2418]">
                {wishCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => go({ name: 'cart' })}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gold text-[#3D2418] transition active:scale-90"
            aria-label="Cart"
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2.1} />
            {cartCount > 0 && (
              <span
                key={badgeKey}
                className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#6B3A18] ring-2 ring-[#3D2418] anim-pop"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search — reference layout: search row comes directly after location row, no greeting heading in between */}
      <div className="mt-4">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          onSearch={onSearch}
          suggestions={suggestions}
          recentSearches={recentSearches}
          onClearRecent={onClearRecent}
          onOpenOccasions={onOpenOccasions}
        />
      </div>
    </div>
  );
}
