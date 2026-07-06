import { useUI } from '../lib/store';

/**
 * Renders a color chip that grows from an occasion icon's on-screen position
 * to fill the viewport, then fades out — used as a "zoom into the category"
 * page transition when tapping an occasion on the Home screen.
 *
 * Lives at the App root (not inside HomeScreen) so the animation survives
 * the screen swap that happens mid-transition.
 */
export default function OccasionZoomOverlay() {
  const { occasionZoom } = useUI();
  if (!occasionZoom) return null;

  const { top, left, width, height, radius, color, stage } = occasionZoom;
  const fading = stage === 'fadeout';

  return (
    <div
      aria-hidden="true"
      className="fixed z-[200] pointer-events-none"
      style={{
        top,
        left,
        width,
        height,
        borderRadius: radius,
        background: color,
        opacity: fading ? 0 : 1,
        transition: fading
          ? 'opacity .3s ease'
          : 'top .68s cubic-bezier(.5,0,.15,1), left .68s cubic-bezier(.5,0,.15,1), width .68s cubic-bezier(.5,0,.15,1), height .68s cubic-bezier(.5,0,.15,1), border-radius .68s cubic-bezier(.5,0,.15,1)',
      }}
    />
  );
}
