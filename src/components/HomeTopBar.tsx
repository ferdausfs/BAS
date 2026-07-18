import { Bell, ChevronDown } from 'lucide-react';
import { useUI, useLocation, useAuthStore } from '../lib/store';
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
 * Two layers: a location+panel that scrolls away normally, and a search
 * bar that sits flush below it at first, then sticks to the top of the scroll
 * container (rises up and pins) once the panel scrolls out of view.
 * Only the notification (bell) icon lives in the (non-sticky) panel, matching
 * the reference wireframe — cart/wishlist quick-icons were removed from Home
 * (user decision, 2026-07-18); cart/wishlist remain reachable via their own
 * screens/other entry points elsewhere in the app.
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
  const { setTab, notifications } = useUI();
  const { user } = useAuthStore();
  const district = useLocation((s) => s.district);
  const initial = (user?.name?.trim()?.[0] ?? 'B').toUpperCase();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative z-10 anim-up">
      {/* Row 1: location + actions — normal flow, scrolls away with the page */}
      <div
        className="px-5 pt-5 pb-6"
        style={{ background: 'linear-gradient(160deg, #6B3A18 0%, #3D2418 100%)' }}
      >
        <div className="flex items-center justify-between">
        <button
          onClick={() => setTab('profile')}
          className="flex items-center gap-2.5 text-left transition active:scale-95"
          aria-label="Delivery location"
        >
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/20 text-white">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[14px] font-bold">{initial}</span>
            )}
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

        {/* Notifications — only quick-icon in the header, per reference wireframe */}
        <button
          onClick={onNotificationsOpen ?? (() => setTab('profile'))}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6B3A18] transition active:scale-90"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
          {unreadCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-[#3D2418] ring-2 ring-white">
              {unreadCount}
            </span>
          ) : (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold ring-2 ring-white" />
          )}
        </button>
        </div>
      </div>

      {/* Search — sticky layer: sits flush under row 1 at first, then rises up and pins to the top of the scroll container once row 1 scrolls out of view */}
      <div
        className="sticky top-0 z-20 -mt-3 rounded-b-[22px] px-5 pt-3 pb-4"
        style={{
          background: '#3D2418',
          boxShadow: '0 14px 30px -18px rgba(61,36,24,0.55)',
        }}
      >
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
