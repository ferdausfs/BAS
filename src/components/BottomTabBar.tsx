import React from 'react';
import { Home, CakeSlice, ShoppingBag, User } from 'lucide-react';
import { useUI } from '../lib/store';

export default React.memo(function BottomTabBar() {
  const { tab, setTab } = useUI();

  const tabs = [
    { id: 'home'       as const, icon: Home,        label: 'Home'    },
    { id: 'categories' as const, icon: CakeSlice,   label: 'Cake'    },
    { id: 'orders'     as const, icon: ShoppingBag, label: 'Orders'  },
    { id: 'profile'    as const, icon: User,        label: 'Profile' },
  ];

  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === tab));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', transform: 'translateZ(0)', willChange: 'transform' }}
    >
      {/* Solid warm bakery bar (Phase 2 redesign — de-glassed, no backdrop-filter).
          Opaque ivory surface with a soft cocoa shadow, matching the reference's
          solid navigation chrome. */}
      <div
        className="relative mx-4 mb-3 rounded-3xl p-2"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF6EF 100%)',
          border: '1px solid rgba(107,58,24,0.10)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7), 0 14px 34px -16px rgba(107,58,24,0.4)',
        }}
      >
        <div
          className="absolute top-2 left-2 rounded-[18px] transition-transform duration-300 ease-out pointer-events-none"
          style={{
            width: 'calc(25% - 4px)',
            height: 'calc(100% - 16px)',
            transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
            willChange: 'transform',
            background: 'radial-gradient(circle at 50% 20%, rgba(168,103,46,0.16), rgba(168,103,46,0.05))',
            transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)',
          }}
        />
        <div className="relative flex items-end justify-around h-[52px]">
          {tabs.map((t, i) => {
            const Icon = t.icon;
            const active = i === activeIndex;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex flex-1 flex-col items-center justify-end gap-[3px] py-[6px] transition-all active:scale-90"
                aria-label={t.label}
              >
                <Icon
                  className="h-[21px] w-[21px] transition-all duration-300"
                  style={{
                    color: active ? '#A8672E' : '#A8927F',
                    transform: active ? 'translate3d(0,-5px,0)' : 'translate3d(0,0,0)',
                    willChange: 'transform',
                    filter: active ? 'drop-shadow(0 6px 10px rgba(168,103,46,0.40))' : 'none',
                    transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)',
                  }}
                  strokeWidth={active ? 2.4 : 1.6}
                />
                <span className="text-[10px] font-semibold leading-none transition-colors duration-200" style={{ color: active ? '#A8672E' : '#A8927F' }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});
