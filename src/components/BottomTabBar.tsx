import React from 'react';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useUI } from '../lib/store';

export default React.memo(function BottomTabBar() {
  const { tab, setTab } = useUI();

  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Shop' },
    { id: 'categories' as const, icon: Search, label: 'Browse' },
    { id: 'orders' as const, icon: ShoppingBag, label: 'Orders' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-t border-ink-50/80"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom)',
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <div className="flex items-center justify-around h-14 px-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors active:scale-95 ${active ? 'text-coral' : 'text-ink/40'}`}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-semibold leading-none">{t.label}</span>
              {active && <span className="h-1 w-1 rounded-full bg-coral mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
});
