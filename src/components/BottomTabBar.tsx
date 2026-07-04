import React from 'react';
import { Home, CakeSlice, ShoppingBag, User } from 'lucide-react';
import { useUI } from '../lib/store';

export default React.memo(function BottomTabBar() {
  const { tab, setTab } = useUI();

  const tabs = [
    { id: 'home'       as const, icon: Home,       label: 'Home'    },
    { id: 'categories' as const, icon: CakeSlice,  label: 'Cake'    },
    { id: 'orders'     as const, icon: ShoppingBag, label: 'Orders'  },
    { id: 'profile'    as const, icon: User,        label: 'Profile' },
  ];

  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === tab));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100]"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      {/* Floating detached pill — solid opaque background (no backdrop transparency; see AGENT_LOG) */}
      <div
        className="relative mx-4 mb-3 rounded-3xl p-2"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)',
          border: '0.5px solid rgba(255,255,255,0.9)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.9), 0 18px 34px -18px rgba(74,27,12,0.35), 0 4px 12px -6px rgba(74,27,12,0.15)',
        }}
      >
        {/* Sliding active indicator — matches approved mockup proportions exactly */}
        <div
          className="absolute top-2 left-2 rounded-[18px] transition-transform duration-300 ease-out pointer-events-none"
          style={{
            width: 'calc(25% - 4px)',
            height: 'calc(100% - 16px)',
            transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
            willChange: 'transform',
            background:
              'radial-gradient(circle at 50% 20%, rgba(232,82,106,0.16), rgba(232,82,106,0.06))',
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
                    color: active ? '#E8526A' : '#9A8E8E',
                    transform: active ? 'translate3d(0,-5px,0)' : 'translate3d(0,0,0)',
                    willChange: 'transform',
                    filter: active ? 'drop-shadow(0 6px 10px rgba(232,82,106,0.45))' : 'none',
                    transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)',
                  }}
                  strokeWidth={active ? 2.4 : 1.6}
                />
                <span
                  className="text-[10px] font-semibold leading-none transition-colors duration-200"
                  style={{ color: active ? '#E8526A' : '#9A8E8E' }}
                >
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
