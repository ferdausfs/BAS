/**
 * The real Bake Art Style mark. The brand type elsewhere now uses the shared
 * bold Poppins/Hind Siliguri stack; this component deliberately stays only
 * the artwork so it can sit cleanly alongside either language.
 */
export default function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-[14px] bg-surface shadow-card"
      style={{ width: size, height: size, padding: size >= 32 ? 4 : 1 }}
    >
      <img
        src="/brand-mark-transparent.png"
        alt="Bake Art Style"
        width={size >= 32 ? size - 8 : size - 2}
        height={size >= 32 ? size - 8 : size - 2}
        className="max-h-full max-w-full object-contain"
        draggable={false}
        decoding="async"
      />
    </span>
  );
}
