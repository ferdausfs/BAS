import { useEffect, useState } from 'react';

const cache = new Map<string, string>();
const FALLBACK_TINT = 'rgba(255,244,246,0.55)';

function lightenToPastel(r: number, g: number, b: number): string {
  const mix = 0.82;
  const lr = Math.round(r + (255 - r) * mix);
  const lg = Math.round(g + (255 - g) * mix);
  const lb = Math.round(b + (255 - b) * mix);
  return `rgba(${lr},${lg},${lb},0.60)`;
}

function extractDominant(url: string): Promise<string> {
  return new Promise((resolve) => {
    if (cache.has(url)) {
      resolve(cache.get(url)!);
      return;
    }

    const img = new Image();
    // CRITICAL: crossOrigin must be set BEFORE src to avoid CORS cache poisoning.
    // If src is set first, browser caches without CORS headers and getImageData throws.
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';

    img.onload = () => {
      try {
        const size = 16;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) { resolve(FALLBACK_TINT); return; }

        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        let totalR = 0, totalG = 0, totalB = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          totalR += data[i];
          totalG += data[i + 1];
          totalB += data[i + 2];
          count++;
        }

        if (count === 0) { resolve(FALLBACK_TINT); return; }

        const avgR = Math.round(totalR / count);
        const avgG = Math.round(totalG / count);
        const avgB = Math.round(totalB / count);
        const pastel = lightenToPastel(avgR, avgG, avgB);
        cache.set(url, pastel);
        resolve(pastel);
      } catch {
        resolve(FALLBACK_TINT);
      }
    };

    img.onerror = () => resolve(FALLBACK_TINT);

    // Add cache-busting param so browser re-fetches with CORS headers
    // if the image was previously cached without them.
    const sep = url.includes('?') ? '&' : '?';
    img.src = `${url}${sep}_cors=1`;
  });
}

export function useDominantColor(imageUrl: string | null | undefined): string {
  const [color, setColor] = useState<string>(() => {
    if (!imageUrl) return FALLBACK_TINT;
    return cache.get(imageUrl) ?? FALLBACK_TINT;
  });

  useEffect(() => {
    if (!imageUrl) { setColor(FALLBACK_TINT); return; }
    if (cache.has(imageUrl)) { setColor(cache.get(imageUrl)!); return; }

    let cancelled = false;
    extractDominant(imageUrl).then((c) => {
      if (!cancelled) setColor(c);
    });
    return () => { cancelled = true; };
  }, [imageUrl]);

  return color;
}
