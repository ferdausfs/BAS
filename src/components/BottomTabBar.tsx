import React from 'react';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useUI } from '../lib/store';

export default React.memo(function BottomTabBar() {
  const { tab, setTab } = useUI();

  const tabs = [
    { id: 'home'       as const, icon: Home,       label: 'Shop'    },
    { id: 'categories' as const, icon: Search,      label: 'Browse'  },
    { id: 'orders'     as const, icon: ShoppingBag, label: 'Orders'  },
    { id: 'profile'    as const, icon: User,        label: 'Profile' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100]"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      {/* Floating detached frosted pill */}
      <div className="mx-4 mb-3 rounded-3xl glass-strong">
        <div className="flex items-center justify-around h-[52px] px-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex flex-1 flex-col items-center justify-center h-full transition-all active:scale-90"
                aria-label={t.label}
              >
                <div
                  className="flex flex-col items-center gap-[3px] px-5 py-[6px] rounded-2xl transition-all duration-200"
                  style={active ? {
                    background: 'rgba(232,82,106,0.10)',
                  } : {}}
                >
                  <Icon
                    className="h-[21px] w-[21px] transition-colors duration-200"
                    style={{ color: active ? '#E8526A' : '#9A8E8E' }}
                    strokeWidth={active ? 2.4 : 1.6}
                  />
                  <span
                    className="text-[10px] font-semibold leading-none transition-colors duration-200"
                    style={{ color: active ? '#E8526A' : '#9A8E8E' }}
                  >
                    {t.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});
