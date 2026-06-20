/**
 * Brand logo mark from the real Bake Art Style artwork.
 * Transparent PNG is used so it behaves like a real logo on any background.
 */
export default function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/brand-mark-transparent.png"
      alt="Bake Art Style"
      width={size}
      height={size}
      className="flex-shrink-0 object-contain"
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
