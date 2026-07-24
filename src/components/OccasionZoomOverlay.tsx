import { useUI } from '../lib/store';

/** Expanding occasion transition; rendered at app root so it survives a screen swap. */
export default function OccasionZoomOverlay() {
  const { occasionZoom } = useUI();
  if (!occasionZoom) return null;

  const { x, y, scale, borderRadius, color, stage } = occasionZoom;
  const fading = stage === 'fadeout';
  const startScale = scale > 0 ? 1 / scale : 0.1;
  const transformScale = stage === 'start' ? startScale : 1;
  const visualBorderRadius = stage === 'start' ? borderRadius * scale : 0;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[220] h-[100vmax] w-[100vmax] shadow-card"
      style={{
        top: y,
        left: x,
        borderRadius: visualBorderRadius,
        background: color,
        opacity: fading ? 0 : 1,
        transform: `translate(-50%, -50%) scale(${transformScale})`,
        transformOrigin: 'center',
        willChange: 'transform, opacity',
        transition: fading
          ? 'opacity .28s ease'
          : 'transform .62s cubic-bezier(.16,1,.3,1), border-radius .62s cubic-bezier(.16,1,.3,1), opacity .2s ease',
      }}
    />
  );
}
