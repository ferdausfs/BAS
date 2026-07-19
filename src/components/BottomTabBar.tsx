import React from 'react';
import { Home, CakeSlice, ShoppingBag, User } from 'lucide-react';
import { useUI } from '../lib/store';

export default React.memo(function BottomTabBar() {
  const { tab, setTab } = useUI();
  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'categories' as const, icon: CakeSlice, label: 'Cake' },
    { id: 'orders' as const, icon: ShoppingBag, label: 'Orders' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];
  const activeIndex = Math.max(0, tabs.findIndex((item) => item.id === tab));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none"
      aria-label="Primary navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', transform: 'translateZ(0)' }}
    >
      <div className="pointer-events-auto relative mx-4 mb-3 rounded-[24px] border border-border bg-surface p-1.5 shadow-float">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-1.5 left-1.5 rounded-[18px] bg-secondary shadow-card transition-transform duration-300"
          style={{
            width: 'calc(25% - 3px)',
            transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
            transitionTimingFunction: 'cubic-bezier(.16,1,.3,1)',
          }}
        />
        <div className="relative flex h-14 items-center">
          {tabs.map((item, index) => {
            const Icon = item.icon;
            const active = index === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-[18px] transition active:scale-95 ${
                  active ? 'text-primary' : 'text-text-tertiary'
                }`}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.2 : 1.7} />
                <span className="text-[11px] font-semibold leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});
