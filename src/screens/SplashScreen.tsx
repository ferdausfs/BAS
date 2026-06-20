import { useUI } from '../lib/store';
import BrandLogo from '../components/BrandLogo';

export default function SplashScreen() {
  const { setView } = useUI();

  return (
    <div className="mesh-warm relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-7 pt-12 pb-10">
      {/* Soft decorative shapes */}
      <svg
        className="absolute -top-16 -left-16 h-80 w-80 text-blush-200"
        viewBox="0 0 200 200"
        fill="currentColor"
      >
        <path d="M40,-60C50,-50,55,-35,60,-20C65,-5,70,10,65,25C60,40,45,55,28,62C11,69,-8,68,-25,60C-42,52,-57,37,-65,18C-73,-1,-74,-24,-65,-42C-56,-60,-37,-73,-18,-72C1,-71,18,-56,30,-46Z" transform="translate(100 100)" />
      </svg>
      <svg
        className="absolute right-0 -bottom-12 left-0 h-32 w-full text-blush-100"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
      >
        <path d="M0,80 Q100,20 200,60 T400,40 L400,100 L0,100 Z" fill="currentColor" />
      </svg>

      {/* Center logo + title */}
      <div className="relative z-10 mt-12 flex flex-1 flex-col items-center justify-center text-center anim-rise">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-coral/25 blur-2xl" />
          <BrandLogo size={112} />
        </div>

        <h1 className="font-display text-[44px] leading-[1] font-bold tracking-tight anim-rise delay-2">
          <span className="text-ink">Bake Art </span>
          <span className="text-coral">Style</span>
        </h1>

        <p className="mt-3 max-w-[260px] text-[14.5px] leading-relaxed text-ink-200 anim-rise delay-3">
          Handcrafted with love.
          <br />
          Delivered with happiness.
        </p>

        <div className="mt-5 flex items-center gap-1 anim-rise delay-4">
          <span className="h-1 w-1 rounded-full bg-coral" />
          <span className="h-1 w-1 rounded-full bg-coral/40" />
          <span className="h-1 w-1 rounded-full bg-coral/40" />
        </div>
      </div>

      {/* CTAs */}
      <div className="relative z-10 w-full max-w-sm space-y-2.5 anim-up delay-4">
        <button
          onClick={() => setView({ name: 'tabs', tab: 'home' })}
          className="btn-primary h-14 w-full rounded-2xl text-[14.5px] font-bold tracking-tight"
        >
          Welcome to Bake Art Style
        </button>
        <button
          onClick={() => setView({ name: 'tabs', tab: 'home' })}
          className="btn-secondary h-14 w-full rounded-2xl text-[14.5px] font-bold tracking-tight"
        >
          Explore Cakes
        </button>
      </div>
    </div>
  );
}