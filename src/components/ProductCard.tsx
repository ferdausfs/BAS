import { useState } from 'react';
import { Heart, Plus, Star, Check, Award, Sparkles } from 'lucide-react';
import { useCart, formatINR } from '../lib/store';
import type { Product } from '../types';

type Props = {
  product: Product;
  wished: boolean;
  onOpen: () => void;
  onWish: (id: string) => void;
  variant?: 'horizontal' | 'grid' | 'catalog';
};

export default function ProductCard({ product, wished, onOpen, onWish, variant = 'horizontal' }: Props) {
  const { add } = useCart();
  const [heartKey, setHeartKey] = useState(0);
  const [added, setAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const safeWeights = product.weights?.length ? product.weights : [{ size: '1 lb', price: product.price }];
  const safeFlavors = product.flavors?.length ? product.flavors : ['Chocolate'];
  const isGrid = variant === 'grid' || variant === 'catalog';
  const cardHeight = isGrid ? 248 : 238;
  const discountPct = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const handleWish = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setHeartKey((current) => current + 1);
    onWish(product.id);
  };

  const handleAdd = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const firstWeight = safeWeights[0] ?? { size: '1 lb', price: 0 };
    add({
      productId: product.id,
      name: product.name,
      image: product.image,
      size: firstWeight.size,
      flavor: safeFlavors[0] ?? 'Chocolate',
      price: product.price + (firstWeight.price ?? 0),
      quantity: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  const cardClass = isGrid
    ? 'group relative cursor-pointer overflow-hidden rounded-[24px] border-[5px] border-white bg-ink shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[.98]'
    : 'group relative w-[172px] shrink-0 cursor-pointer overflow-hidden rounded-[24px] border-[5px] border-white bg-ink shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[.98]';

  return (
    <article onClick={onOpen} className={cardClass} style={{ height: cardHeight }}>
      {!imageLoaded && <span className="shimmer absolute inset-0 z-[1]" aria-label="Loading product image" />}
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        decoding="async"
        onLoad={() => setImageLoaded(true)}
        onError={(event) => {
          const img = event.currentTarget as HTMLImageElement;
          img.onerror = null;
          img.src = '/cakes/logo-cake.png';
          setImageLoaded(true);
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-[1.04]`}
      />

      {/* Option-B style: image fills the whole card; text sits directly on the shadow. */}
      <span className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/0 via-black/5 to-black/75" />
      <span className="pointer-events-none absolute inset-x-[-15%] bottom-[-18%] z-[2] h-[56%] bg-[radial-gradient(ellipse_at_center,rgba(246,95,143,.18),rgba(0,0,0,0)_62%)]" />

      <div className="absolute left-2.5 top-2.5 z-[4] flex flex-col gap-1">
        {discountPct !== null && (
          <span className="rounded-full bg-text/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-card backdrop-blur-md">
            {discountPct}% OFF
          </span>
        )}
        {product.bestseller && (
          <span className="flex items-center gap-1 rounded-full bg-text/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-card backdrop-blur-md">
            <Award className="h-3 w-3" strokeWidth={2} />Best
          </span>
        )}
        {product.newArrival && (
          <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary shadow-card backdrop-blur-md">
            <Sparkles className="h-3 w-3" strokeWidth={2} />New
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleWish}
        className="absolute right-2.5 top-2.5 z-[4] flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-primary shadow-card backdrop-blur-md transition active:scale-90"
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart key={heartKey} className={wished ? 'anim-pop h-4 w-4 fill-primary' : 'h-4 w-4'} strokeWidth={2} />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-[3] px-3 pb-3 text-white [text-shadow:0_2px_12px_rgba(0,0,0,.44)]">
        {product.inStock === false ? (
          <span className="mb-1.5 inline-flex rounded-full bg-surface/90 px-3 py-1 text-[10px] font-bold text-error shadow-card">
            Out of Stock
          </span>
        ) : product.lowStock || (product.stockCount !== undefined && product.stockCount <= 5) ? (
          <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[9.5px] font-semibold text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-error" />
            {product.stockCount ? `মাত্র ${product.stockCount}টি বাকি!` : 'মাত্র কয়েকটি বাকি!'}
          </span>
        ) : null}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 text-[16px] font-bold tracking-[-0.035em] text-white">{product.name}</h3>
            <div className="mt-1 line-clamp-1 text-[11px] font-semibold text-white/80">
              {safeWeights[0]?.size ?? '1 lb'} · {safeFlavors[0] ?? 'Chocolate'}
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-white">
            <Star className="h-3 w-3 fill-gold text-gold" />{product.rating}
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="min-w-0">
            <span className="text-[18px] font-bold tabular text-white">{formatINR(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="ml-1.5 text-[10px] tabular text-white/65 line-through">{formatINR(product.oldPrice)}</span>
            )}
          </span>
          {(product.inStock ?? true) && (
            <button
              type="button"
              onClick={handleAdd}
              className={`flex h-8 min-w-[72px] shrink-0 items-center justify-center gap-1 rounded-full bg-white px-3 text-[12px] font-bold text-text shadow-card transition active:scale-90 ${added ? 'text-success' : 'hover:bg-white/95'}`}
              aria-label="Add to cart"
            >
              {added ? <><Check className="h-4 w-4 anim-pop" strokeWidth={2.5} />Added</> : <>Add <Plus className="h-4 w-4 text-primary" strokeWidth={2.4} /></>}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
