import { useEffect } from 'react';
import { useUI, type Tab } from '../lib/store';

const LAST_TAB_KEY = 'bas-last-tab';
const validTabs: Tab[] = ['home', 'categories', 'orders', 'profile'];

function readLastTab(): Tab {
  try {
    const saved = localStorage.getItem(LAST_TAB_KEY) as Tab | null;
    return saved && validTabs.includes(saved) ? saved : 'home';
  } catch {
    return 'home';
  }
}

export default function SplashScreen() {
  const { setView } = useUI();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setView({ name: 'tabs', tab: readLastTab() });
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [setView]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg">
      {/* Blurred last-tab style app silhouette behind the glass splash. */}
      <div className="absolute inset-0 scale-[1.04] opacity-90 blur-[5px]" aria-hidden="true">
        <div className="absolute left-6 right-6 top-10 flex items-center justify-between">
          <span className="h-12 w-12 rounded-full bg-surface shadow-card" />
          <span className="h-6 w-32 rounded-full bg-secondary" />
          <span className="h-12 w-12 rounded-full bg-surface shadow-card" />
        </div>
        <div className="absolute left-6 right-6 top-36 space-y-4">
          <div className="h-36 rounded-[24px] border border-border bg-surface shadow-card" />
          <div className="h-36 rounded-[24px] border border-border bg-surface shadow-card" />
          <div className="h-36 rounded-[24px] border border-border bg-surface shadow-card" />
        </div>
        <div className="absolute bottom-5 left-4 right-4 h-[72px] rounded-[26px] border border-border bg-surface shadow-float" />
      </div>

      {/* Glass splash layer — intentionally no solid extra background. */}
      <div className="bas-splash-glass absolute inset-0 flex flex-col items-center justify-center px-8">
        <div className="bas-logo-heart relative grid h-[258px] w-[258px] place-items-center">
          <span className="bas-logo-glow absolute inset-1.5 rounded-full" />
          <span className="bas-logo-ring absolute -inset-0.5 rounded-full" />
          <span className="bas-logo-ring two absolute -inset-0.5 rounded-full" />
          <img
            src="/bas_default_logo.png"
            alt="Bake Art Style"
            className="relative h-[230px] w-[230px] object-contain drop-shadow-[0_18px_26px_rgba(92,35,58,0.16)]"
          />
        </div>

        <div className="bas-splash-tagline mt-5 text-center font-serif text-[19px] font-semibold italic tracking-[0.04em] text-[#4B2B22]">
          Handcrafted Bakery
        </div>

        <div className="bas-splash-loader absolute bottom-[98px] left-[104px] right-[104px] h-[5px] overflow-hidden rounded-full bg-primary/15">
          <span className="block h-full w-[42%] rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
