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
  const [zoomed, setZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const safeWeights = product.weights?.length ? product.weights : [{ size: '1 lb', price: product.price }];
  const safeFlavors = product.flavors?.length ? product.flavors : ['Chocolate'];
  const isGrid = variant === 'grid' || variant === 'catalog';
  const discountPct = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const handleImageTap = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setZoomed((current) => !current);
  };

  const handleWish = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setHeartKey((current) => current + 1);
    onWish(product.id);
  };

  const handleAdd = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    add({
      productId: product.id,
      name: product.name,
      image: product.image,
      size: safeWeights[0]?.size ?? '1 lb',
      flavor: safeFlavors[0] ?? 'Chocolate',
      price: product.price,
      quantity: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  const cardClass = isGrid
    ? 'group relative h-[248px] cursor-pointer overflow-hidden rounded-[24px] border border-white/70 bg-surface shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[.98]'
    : 'group relative h-[238px] w-[172px] shrink-0 cursor-pointer overflow-hidden rounded-[24px] border border-white/70 bg-surface shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[.98]';

  return (
    <article onClick={onOpen} className={cardClass}>
      {!imageLoaded && <span className="shimmer absolute inset-0 z-[1]" aria-label="Loading product image" />}
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        decoding="async"
        onLoad={() => setImageLoaded(true)}
        onError={(event) => {
          (event.target as HTMLImageElement).src = '/cakes/logo-cake.png';
          setImageLoaded(true);
        }}
        onClick={handleImageTap}
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${zoomed ? 'scale-[1.45]' : 'group-hover:scale-[1.04]'}`}
      />

      {/* Gentle readability fade — image still fills the whole card. */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[48%] bg-gradient-to-b from-white/0 via-bg/55 to-bg/95" />

      {!zoomed && (
        <div className="absolute left-2.5 top-2.5 z-[4] flex flex-col gap-1">
          {discountPct !== null && (
            <span className="rounded-full bg-text/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-card backdrop-blur-md">
              {discountPct}% OFF
            </span>
          )}
          {product.bestseller && (
            <span className="flex items-center gap-1 rounded-full bg-text/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-card backdrop-blur-md">
              <Award className="h-3 w-3" strokeWidth={2} />Best
            </span>
          )}
          {product.newArrival && (
            <span className="flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary shadow-card backdrop-blur-md">
              <Sparkles className="h-3 w-3" strokeWidth={2} />New
            </span>
          )}
        </div>
      )}

      {!zoomed && (
        <button
          type="button"
          onClick={handleWish}
          className={`absolute right-2.5 top-2.5 z-[4] flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-primary shadow-card backdrop-blur-md transition active:scale-90 ${wished ? 'text-primary' : 'text-primary/75'}`}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart key={heartKey} className={wished ? 'anim-pop h-4 w-4 fill-primary' : 'h-4 w-4'} strokeWidth={2} />
        </button>
      )}

      {!zoomed && (
        <div className="absolute inset-x-0 bottom-0 z-[3] p-2.5">
          <div className="rounded-[18px] border border-white/75 bg-white/60 px-2.5 py-2.5 shadow-card backdrop-blur-[7px]">
            {product.inStock !== false && (product.lowStock || (product.stockCount !== undefined && product.stockCount <= 5)) && (
              <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-[9.5px] font-semibold text-error">
                <span className="h-1.5 w-1.5 rounded-full bg-error animate-pulse" />
                {product.stockCount ? `মাত্র ${product.stockCount}টি!` : 'কম বাকি!'}
              </span>
            )}
            <div className="flex items-start justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 text-[15px] font-bold tracking-[-0.025em] text-text">{product.name}</h3>
                <div className="mt-1 line-clamp-1 text-[11px] font-semibold text-text-secondary">
                  {safeWeights[0]?.size ?? '1 lb'} · {safeFlavors[0] ?? 'Chocolate'}
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/65 px-1.5 py-1 text-[10px] font-bold text-text-secondary">
                <Star className="h-3 w-3 fill-gold text-gold" />{product.rating}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <span className="min-w-0">
                <span className="text-[17px] font-bold tabular text-primary">{formatINR(product.price)}</span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="ml-1.5 text-[10px] tabular text-text-tertiary line-through">{formatINR(product.oldPrice)}</span>
                )}
              </span>
              {(product.inStock ?? true) && (
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-btn transition active:scale-90 ${added ? 'bg-success' : 'bg-primary hover:bg-primary-hover'}`}
                  aria-label="Add to cart"
                >
                  {added ? <Check className="h-4 w-4 anim-pop" strokeWidth={2.5} /> : <Plus className="h-5 w-5" strokeWidth={2.4} />}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
