import { Bell, ChevronDown, MapPin } from 'lucide-react';
import { useUI, useLocation, useAuthStore } from '../lib/store';
import SearchBar from './SearchBar';
import NotificationBadge from './NotificationBadge';
import { useT } from '../lib/i18n';

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
  const t = useT();

  return (
    <div className="relative z-10 anim-up bg-primary px-6 pb-[18px] pt-3">
      <div className="flex items-center gap-3 py-[11px]">
        <button
          type="button"
          onClick={() => setTab('profile')}
          className="flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 text-white transition active:scale-95"
          aria-label={t('home.profile')}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-bold">{initial}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab('profile')}
          className="min-w-0 flex-1 text-left leading-tight"
          aria-label={t('home.deliveryLocation')}
        >
          <span className="block text-sm text-white/75">{t('home.deliveryTo')}</span>
          <span className="mt-[3px] flex items-center gap-[7px] text-card-title font-medium text-white/95">
            <MapPin className="h-[18px] w-[18px] shrink-0 text-white/95" strokeWidth={1.8} />
            <span className="truncate">{district || t('home.setLocation')}</span>
            <ChevronDown className="h-[14px] w-[14px] shrink-0 text-white/70" strokeWidth={2.2} />
          </span>
        </button>

        <button
          type="button"
          onClick={onNotificationsOpen ?? (() => setTab('profile'))}
          className="relative flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-white/16 text-white transition active:scale-95"
          aria-label={t('home.notifications')}
        >
          <Bell className="h-[21px] w-[21px]" strokeWidth={1.8} />
          <NotificationBadge count={unreadCount} tone="light" className="right-[7px] top-[7px]" />
        </button>
      </div>

      <div className="mt-1">
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
