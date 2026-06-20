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
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-cream">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(242,94,115,.10),transparent_38%),linear-gradient(180deg,#fff7f8_0%,#fbf7f5_58%,#fff1f3_100%)]" />

      <div className="relative z-10 flex flex-col items-center justify-center px-8 text-center anim-fade">
        <img
          src="/brand-logo-transparent-crop.png"
          alt="Bake Art Style"
          className="h-auto w-[min(84vw,360px)] max-w-full select-none object-contain drop-shadow-[0_18px_40px_rgba(242,94,115,.18)]"
          draggable={false}
        />

        <div className="mt-7 flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-coral" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-coral/55 [animation-delay:.18s]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-coral/55 [animation-delay:.36s]" />
        </div>
      </div>
    </div>
  );
}
