import { useEffect } from 'react';
import { useUI } from '../lib/store';

export default function SplashScreen() {
  const { setView } = useUI();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setView({ name: 'tabs', tab: 'home' });
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [setView]);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#f7a0bd]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,.28),transparent_34%),linear-gradient(180deg,#f194b4_0%,#f7a0bd_54%,#f6b0c6_100%)]" />

      <div className="relative z-10 flex flex-col items-center justify-center px-8 text-center anim-fade">
        <img
          src="/splash-logo.png"
          alt="Bake Art Style"
          className="h-auto w-[min(82vw,340px)] max-w-full select-none object-contain"
          draggable={false}
        />

        <div className="mt-7 flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white/95" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-white/70 [animation-delay:.18s]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-white/70 [animation-delay:.36s]" />
        </div>
      </div>
    </div>
  );
}
