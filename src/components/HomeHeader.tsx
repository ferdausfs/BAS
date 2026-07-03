import { Bell, MapPin, Search } from 'lucide-react'

interface HomeHeaderProps {
  userName?: string
  location?: string
  onSearchClick?: () => void
  onNotifClick?: () => void
  notifCount?: number
}

export default function HomeHeader({
  userName = 'অতিথি',
  location = 'ঢাকা, বাংলাদেশ',
  onSearchClick,
  onNotifClick,
  notifCount = 0,
}: HomeHeaderProps) {
  return (
    <div className="bg-white px-4 pt-4 pb-2">
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        {/* Location + Greeting */}
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <MapPin size={13} className="text-brand-500" />
            <span className="text-xs font-medium text-ink-secondary">ডেলিভারি করা হবে</span>
          </div>
          <p className="text-sm font-bold text-ink leading-tight">
            {location} ▾
          </p>
        </div>

        {/* Notification bell */}
        <button
          onClick={onNotifClick}
          className="relative btn-icon"
        >
          <Bell size={20} className="text-ink" />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </button>
      </div>

      {/* Greeting */}
      <h1 className="text-xl font-bold text-ink mb-3 font-siliguri">
        স্বাগতম, {userName} 👋
        <br />
        <span className="text-base font-normal text-ink-secondary">
          আজ কী অর্ডার করবেন?
        </span>
      </h1>

      {/* Search bar */}
      <button
        onClick={onSearchClick}
        className="search-bar w-full mb-2 text-left"
      >
        <Search size={18} className="text-ink-tertiary flex-shrink-0" />
        <span className="text-sm text-ink-tertiary flex-1">কেক, পেস্ট্রি খুঁজুন...</span>
      </button>
    </div>
  )
}
