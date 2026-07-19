import { useUI } from '../lib/store';

/** Expanding occasion transition; rendered at app root so it survives a screen swap. */
export default function OccasionZoomOverlay() {
  const { occasionZoom } = useUI();
  if (!occasionZoom) return null;

  const { top, left, width, height, radius, color, stage } = occasionZoom;
  const fading = stage === 'fadeout';
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[220] shadow-card"
      style={{
        top,
        left,
        width,
        height,
        borderRadius: radius,
        background: color,
        opacity: fading ? 0 : 1,
        transition: fading
          ? 'opacity .28s ease'
          : 'top .62s cubic-bezier(.16,1,.3,1), left .62s cubic-bezier(.16,1,.3,1), width .62s cubic-bezier(.16,1,.3,1), height .62s cubic-bezier(.16,1,.3,1), border-radius .62s cubic-bezier(.16,1,.3,1), opacity .2s ease',
      }}
    />
  );
}
