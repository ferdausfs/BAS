import { Bell, ChevronDown } from 'lucide-react';
import { useUI, useLocation, useAuthStore } from '../lib/store';
import SearchBar from './SearchBar';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  onSearch?: (value: string) => void;
  suggestions?: string[];
  recentSearches?: string[];
  onClearRecent?: () => void;
  onOpenOccasions?: () => void;
  onNotificationsOpen?: () => void;
}

/** Home chrome: calm location context followed by a solid, sticky search surface. */
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
  const district = useLocation((state) => state.district);
  const initial = (user?.name?.trim()?.[0] ?? 'B').toUpperCase();
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="relative z-10 anim-up">
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setTab('profile')}
            className="flex min-h-11 items-center gap-3 rounded-[18px] text-left transition active:scale-[0.98]"
            aria-label="Delivery location"
          >
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[16px] bg-secondary text-primary shadow-card">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[15px] font-bold">{initial}</span>
              )}
            </span>
            <span className="leading-tight">
              <span className="block text-[12px] font-medium text-text-tertiary">Delivery to</span>
              <span className="flex items-center gap-0.5 text-[15px] font-semibold text-text">
                {district || 'Set your location'}
                <ChevronDown className="h-4 w-4 text-text-secondary" strokeWidth={2} />
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onNotificationsOpen ?? (() => setTab('profile'))}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-surface text-text shadow-card transition active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" strokeWidth={1.8} />
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white ring-2 ring-surface">
              {unreadCount > 0 ? unreadCount : ''}
            </span>
          </button>
        </div>
      </div>

      <div className="sticky top-0 z-20 border-b border-border bg-bg px-6 pb-3 pt-2 shadow-[0_8px_18px_-14px_rgba(246,95,143,0.24)]">
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
