import { useEffect, useRef, useState } from 'react';
import { useFlavorThemeStore } from '../lib/flavorTheme';

export default function FlavorThemeSync() {
  const palette = useFlavorThemeStore((state) => state.palette);
  const tick = useFlavorThemeStore((state) => state.tick);
  const [wash, setWash] = useState(false);
  const skipWash = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--flavor-primary', palette.primary);
    root.style.setProperty('--flavor-hover', palette.hover);
    root.style.setProperty('--flavor-deep', palette.deep);
    root.style.setProperty('--flavor-mid', palette.mid);
    root.style.setProperty('--flavor-accent', palette.accent);
    root.style.setProperty('--flavor-secondary', palette.secondary);
    root.style.setProperty('--flavor-bg', palette.bg);
    root.style.setProperty('--flavor-border', palette.border);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', palette.primary);
  }, [palette]);

  useEffect(() => {
    if (skipWash.current) {
      skipWash.current = false;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setWash(true);
    const id = window.setTimeout(() => setWash(false), 720);
    return () => window.clearTimeout(id);
  }, [tick]);

  if (!wash) return null;

  return (
    <div
      aria-hidden="true"
      className="flavor-wash pointer-events-none fixed inset-0 z-[9]"
      style={{
        background: `radial-gradient(ellipse at 50% 38%, color-mix(in srgb, ${palette.primary} 40%, transparent), transparent 68%)`,
      }}
    />
  );
}
