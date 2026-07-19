import { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useUI } from '../lib/store';

const SLIDES = [
  {
    id: 1,
    title: 'Bookmark Your Bakery Favorites',
    desc: 'Save your favorite handcrafted cakes, track live order status and enjoy customized celebrations.',
    tag: 'Handcrafted Bakery',
    icon: '🎂',
  },
  {
    id: 2,
    title: 'Discover Delight: Explore Our Bakery Selection',
    desc: 'From fresh cupcakes and celebration cakes to custom orders — delivered right to your doorstep.',
    tag: 'Fresh Daily',
    icon: '🧁',
  },
  {
    id: 3,
    title: 'Your Preferred Cakes, Saved for You',
    desc: 'Save your favorite items and access them anytime, making reordering quick and effortless.',
    tag: 'Wishlist',
    icon: '💖',
  },
  {
    id: 4,
    title: 'Stay Updated Every Step of the Way',
    desc: 'Enjoy fast, reliable delivery with live tracking, bringing your order right to your doorstep.',
    tag: 'Live Tracking',
    icon: '🚴',
  },
];

export default function SplashScreen() {
  const { setView } = useUI();
  const [slideIdx, setSlideIdx] = useState(0);

  const handleNext = () => {
    if (slideIdx < SLIDES.length - 1) {
      setSlideIdx(slideIdx + 1);
    } else {
      setView({ name: 'tabs', tab: 'home' });
    }
  };

  const handleSkip = () => {
    setView({ name: 'tabs', tab: 'home' });
  };

  const slide = SLIDES[slideIdx];

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-bg px-6 pt-12 pb-8">
      {/* Top Bar — Skip button */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <img
            src="/brand-logo-transparent-crop.png"
            alt="Bake Art Style"
            className="h-8 w-auto object-contain"
          />
        </div>
        <button
          onClick={handleSkip}
          className="text-[13px] font-bold text-ink-200 hover:text-ink transition"
        >
          Skip
        </button>
      </div>

      {/* Main Card Graphic */}
      <div className="relative my-auto flex flex-col items-center justify-center text-center z-10 anim-fade">
        {/* Soft-pink hero card — solid opaque surface, real soft elevation, no gradient/blur */}
        <div className="relative flex h-52 w-full max-w-xs items-center justify-center rounded-[32px] bg-secondary p-6 shadow-card">
          {/* quiet decorative ring for depth (solid, no blur) */}
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full border border-border bg-surface/60" />
          <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-accent/50" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-surface text-5xl shadow-card">
            {slide.icon}
          </div>
        </div>

        <span className="mt-6 inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-coral uppercase tracking-wider">
          {slide.tag}
        </span>

        <h1 className="mt-3 max-w-[18ch] text-[24px] font-bold leading-tight tracking-tight text-ink">
          {slide.title}
        </h1>

        <p className="mt-2.5 max-w-[30ch] text-[13px] leading-relaxed text-ink-300">
          {slide.desc}
        </p>
      </div>

      {/* Footer / Controls */}
      <div className="flex flex-col items-center gap-6 z-10">
        {/* Pagination Dots */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === slideIdx ? 'w-8 bg-coral' : 'w-2 bg-coral-200'
              }`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleNext}
          className="btn-primary flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[14px] font-bold tracking-tight shadow-btn transition active:scale-95"
        >
          {slideIdx === SLIDES.length - 1 ? (
            <>
              Explore Bakery Selection <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </>
          ) : (
            <>
              Continue <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
