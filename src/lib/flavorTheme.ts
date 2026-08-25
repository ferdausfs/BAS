import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const BRAND_FLAVOR_PRIMARY = '#F65F8F';

export type FlavorPalette = {
  flavor: string;
  primary: string;
  hover: string;
  deep: string;
  mid: string;
  accent: string;
  secondary: string;
  bg: string;
  border: string;
};

const NAMED: { match: string[]; hex: string }[] = [
  { match: ['white chocolate', 'white forest'], hex: '#C4A35A' },
  { match: ['red velvet', 'রেড ভেলভেট', 'velvet'], hex: '#9B2D3A' },
  { match: ['black forest', 'cherry', 'kirsch'], hex: '#7A1F32' },
  { match: ['butterscotch', 'caramel', 'toffee', 'biscoff', 'lotus', 'praline', 'বাটারস্কচ'], hex: '#C47A2C' },
  { match: ['chocolate', 'choco', 'truffle', 'ganache', 'cocoa', 'nutella', 'mocha', 'coffee', 'espresso', 'চকলেট'], hex: '#6B3F2A' },
  { match: ['strawberry', 'raspberry', 'berry', 'pink', 'স্ট্রবেরি', 'স্ট্রবেরী'], hex: '#E85A7A' },
  { match: ['vanilla', 'cream', 'buttercream', 'ভ্যানিলা'], hex: '#C49A3C' },
  { match: ['mango', 'pineapple', 'orange', 'citrus', 'lemon', 'passion', 'আম'], hex: '#E09B1A' },
  { match: ['blueberry', 'blackcurrant'], hex: '#5C4B8A' },
  { match: ['matcha', 'pistachio', 'mint', 'green tea', 'পস্তা'], hex: '#5F8A4B' },
  { match: ['coconut', 'rasmalai', 'malai', 'saffron', 'রাসমালাই'], hex: '#D4A24F' },
  { match: ['rose', 'lychee', 'floral', 'গোলাপ'], hex: '#D46A8A' },
  { match: ['oreo', 'cookies', 'cookie'], hex: '#3F3A38' },
];

const hexToRgb = (hex: string): [number, number, number] => {
  const raw = hex.replace('#', '').trim();
  const n = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const v = Number.parseInt(n, 16);
  if (!Number.isFinite(v)) return [246, 95, 143];
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('')}`;

const mixHex = (a: string, b: string, t: number): string => {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
};

const luminance = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ensureCta = (hex: string): string => {
  let out = hex;
  for (let i = 0; i < 8 && luminance(out) > 0.32; i += 1) {
    out = mixHex(out, '#1A120C', 0.18);
  }
  return out;
};

const hslToHex = (h: number, s: number, l: number): string => {
  const sat = s / 100;
  const lig = l / 100;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return lig - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
};

const hueHex = (name: string): string => {
  let hash = 2166136261;
  for (let i = 0; i < name.length; i += 1) hash = Math.imul(hash ^ name.charCodeAt(i), 16777619);
  return hslToHex(Math.abs(hash) % 360, 48, 38);
};

export const resolveFlavorHex = (name: string): string => {
  const key = name.trim().toLowerCase();
  if (!key) return BRAND_FLAVOR_PRIMARY;
  const hits = NAMED.flatMap((row) => row.match.map((match) => ({ match, hex: row.hex })))
    .sort((a, b) => b.match.length - a.match.length);
  for (const hit of hits) {
    if (key.includes(hit.match)) return hit.hex;
  }
  return hueHex(key);
};

export const flavorSwatch = (name: string): string => resolveFlavorHex(name);

export const buildFlavorPalette = (flavor: string): FlavorPalette => {
  const primary = flavor.trim() ? ensureCta(resolveFlavorHex(flavor)) : BRAND_FLAVOR_PRIMARY;
  return {
    flavor,
    primary,
    hover: mixHex(primary, '#000000', 0.14),
    deep: mixHex(primary, '#000000', 0.28),
    mid: mixHex(primary, '#ffffff', 0.28),
    accent: mixHex(primary, '#ffffff', 0.55),
    secondary: mixHex(primary, '#ffffff', 0.88),
    bg: mixHex(primary, '#ffffff', 0.90),
    border: mixHex(primary, '#ffffff', 0.82),
  };
};

const BRAND_PALETTE = buildFlavorPalette('');

type FlavorThemeState = {
  flavor: string;
  palette: FlavorPalette;
  tick: number;
  setFlavor: (flavor: string) => void;
  resetFlavor: () => void;
};

export const useFlavorThemeStore = create<FlavorThemeState>()(
  persist(
    (set) => ({
      flavor: '',
      palette: BRAND_PALETTE,
      tick: 0,
      setFlavor: (flavor) => {
        const next = flavor.trim();
        set((state) => ({
          flavor: next,
          palette: buildFlavorPalette(next),
          tick: state.tick + 1,
        }));
      },
      resetFlavor: () => set({ flavor: '', palette: BRAND_PALETTE, tick: 0 }),
    }),
    {
      name: 'bakeart-flavor-theme',
      partialize: (state) => ({ flavor: state.flavor }),
      merge: (persisted, current) => {
        const flavor = typeof (persisted as { flavor?: string } | undefined)?.flavor === 'string'
          ? (persisted as { flavor: string }).flavor
          : current.flavor;
        return {
          ...current,
          flavor,
          palette: flavor ? buildFlavorPalette(flavor) : BRAND_PALETTE,
        };
      },
    }
  )
);
