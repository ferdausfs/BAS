import { Home, Search, Receipt, User } from 'lucide-react';
import { useUI, type Tab } from '../lib/store';

const tabs: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Shop', Icon: Home },
  { id: 'categories', label: 'Browse', Icon: Search },
  { id: 'orders', label: 'Orders', Icon: Receipt },
  { id: 'profile', label: 'Profile', Icon: User },
];

export default function BottomTabBar() {
  const { tab, setTab } = useUI();

  return (
    <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-30 flex justify-center pb-3">
      <div className="pointer-events-auto mx-3 flex max-w-[360px] flex-1 items-center justify-between rounded-full border border-ink-50/60 bg-white/95 px-2 py-2 shadow-[0_18px_50px_-20px_rgba(26,19,17,.35),0_1px_0_rgba(26,19,17,.04)] backdrop-blur-xl">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-2 transition-all duration-200 ${
                active ? 'text-coral' : 'text-ink-200 hover:text-ink-300'
              }`}
            >
              {active && (
                <span className="absolute inset-0 rounded-full bg-coral-50" aria-hidden />
              )}
              <span className="relative">
                <t.Icon
                  className="h-[20px] w-[20px]"
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </span>
              <span className={`relative text-[10.5px] font-semibold tracking-wide ${active ? 'opacity-100' : 'opacity-80'}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}