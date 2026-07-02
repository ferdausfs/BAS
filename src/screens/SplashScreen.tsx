import { useEffect } from 'react';
import { useUI } from '../lib/store';

export default function SplashScreen() {
  const { setView } = useUI();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setView({ name: 'tabs', tab: 'home' });
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [setView]);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden mesh-warm">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-coral/15 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-blush-200/40 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-gold/10 blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-8 text-center anim-rise">
        <img
          src="/brand-logo-transparent-crop.png"
          alt="Bake Art Style"
          className="h-auto w-[min(80vw,340px)] max-w-full select-none object-contain drop-shadow-[0_18px_40px_rgba(242,94,115,.22)]"
          draggable={false}
        />

        <div className="font-brand mt-3 text-[28px] text-coral/75 anim-fade" style={{ animationDelay: '0.4s' }}>
          তোমার জন্য বিশেষ কেক
        </div>

        <div className="mt-8 flex items-center gap-2.5" style={{ animationDelay: '0.6s' }}>
          <span className="h-2 w-2 animate-pulse rounded-full bg-coral" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-coral/55" style={{ animationDelay: '0.18s' }} />
          <span className="h-2 w-2 animate-pulse rounded-full bg-coral/55" style={{ animationDelay: '0.36s' }} />
        </div>
      </div>
    </div>
  );
}
