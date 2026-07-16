import { Bell, ShoppingBag, Heart, MapPin, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useUI, useCart, useUser, useAuthStore, useLocation } from '../lib/store';
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
 * Brown/gold bakery-style home header block (Phase 2 redesign).
 * Replaces the old orphaned Header.tsx / HomeHeader.tsx. Renders a solid cocoa
 * header panel with: location row + bell/cart icons, a greeting, and the search
 * field — mirroring the reference bakery UI kit's brown header composition.
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
  const { user } = useAuthStore();
  const district = useLocation((s) => s.district);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const wishCount = wishlist.length;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const firstName = user?.name?.split(' ')[0] || '';
  const isNonLatin = /[^\u0000-\u007F]/.test(firstName);
  const greetingName = user ? (isNonLatin ? '' : `, ${firstName}`) : '';

  // Cart badge bounce when count grows (mirrors the old Header micro-interaction).
  const [badgeKey, setBadgeKey] = useState(0);
  const prevCount = useRef(cartCount);
  useEffect(() => {
    if (cartCount > prevCount.current) setBadgeKey((k) => k + 1);
    prevCount.current = cartCount;
  }, [cartCount]);

  return (
    <div
      className="sticky top-0 z-20 rounded-b-[26px] px-5 pt-5 pb-5 anim-up"
      style={{
        background: 'linear-gradient(160deg, #6B3A18 0%, #3D2418 100%)',
        boxShadow: '0 14px 30px -18px rgba(61,36,24,0.55)',
      }}
    >
      {/* Row 1: location + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setTab('profile')}
          className="flex items-center gap-1.5 text-left transition active:scale-95"
          aria-label="Delivery location"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12">
            <MapPin className="h-4 w-4 text-gold" strokeWidth={2} />
          </span>
          <span className="leading-tight">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
              Deliver to
            </span>
            <span className="flex items-center gap-0.5 text-[13px] font-bold text-white">
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

      {/* Greeting */}
      <h1 className="mt-4 font-display text-[24px] font-semibold leading-[1.15] tracking-tight text-white">
        {user ? (
          <>Welcome back{greetingName} <span className="text-gold">🎂</span></>
        ) : (
          <>What are we <span className="italic text-gold">celebrating?</span></>
        )}
      </h1>

      {/* Search */}
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
