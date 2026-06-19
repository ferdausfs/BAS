/**
 * Brand mark — single inline SVG, crisp at any size.
 * Used in header, splash, splash buttons.
 */
export default function BrandLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
      aria-label="Bake Art Style"
    >
      {/* Soft pink gradient circle */}
      <defs>
        <linearGradient id="bg-coral" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#FFE2E7" />
          <stop offset="100%" stopColor="#FCE4E6" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22.5" fill="url(#bg-coral)" />
      <circle cx="24" cy="24" r="22.5" stroke="#F25E73" strokeOpacity="0.18" strokeWidth="1" />

      {/* Cake base */}
      <rect x="13" y="27" width="22" height="8.5" rx="1.5" fill="#F25E73" />

      {/* Cream drip */}
      <path
        d="M13 28 Q15 31 17 28 Q19 31 21 28 Q23 31 25 28 Q27 31 29 28 Q31 31 33 28 Q34.5 28 35 28 L35 35 L13 35 Z"
        fill="#FFFFFF"
      />

      {/* Top tier */}
      <rect x="16" y="22.5" width="16" height="5" rx="1" fill="#FFFFFF" stroke="#F25E73" strokeOpacity="0.7" strokeWidth="0.8" />

      {/* Cream swirl */}
      <ellipse cx="24" cy="20.5" rx="6" ry="2.8" fill="#FFFFFF" stroke="#F25E73" strokeOpacity="0.7" strokeWidth="0.6" />

      {/* Strawberry */}
      <path
        d="M24 14.5 C26.2 14.5 27.6 15.6 27.6 17.4 C27.6 18.8 26.2 19.7 24 19.7 C21.8 19.7 20.4 18.8 20.4 17.4 C20.4 15.6 21.8 14.5 24 14.5 Z"
        fill="#E0394F"
      />
      {/* Strawberry leaves */}
      <path d="M22.4 14.6 L24 13.4 L25.6 14.6 L24.7 15.5 L24 14.95 L23.3 15.5 Z" fill="#4A8B3A" />
      {/* Strawberry seeds */}
      <circle cx="23" cy="17.2" r="0.45" fill="#FFE2E7" />
      <circle cx="25" cy="17.8" r="0.45" fill="#FFE2E7" />
      <circle cx="24" cy="18.4" r="0.45" fill="#FFE2E7" />

      {/* Tiny heart sparkle */}
      <path
        d="M37.5 14.5 C36.5 13.5 35 13.5 35 15.3 C35 16.7 37.5 18.5 37.5 18.5 C37.5 18.5 40 16.7 40 15.3 C40 13.5 38.5 13.5 37.5 14.5 Z"
        fill="#F25E73"
        opacity="0.9"
      />
    </svg>
  );
}