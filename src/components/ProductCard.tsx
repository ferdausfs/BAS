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
  const isCatalog = variant === 'catalog';
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

  const cardClass = isCatalog
    ? 'group relative cursor-pointer overflow-hidden rounded-[18px] border border-border bg-surface p-1.5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[.98]'
    : isGrid
      ? 'group relative cursor-pointer overflow-hidden rounded-[22px] border border-border bg-surface p-2 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[.98]'
      : 'group relative flex w-[172px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-[22px] border border-border bg-surface p-2 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[.98]';

  return (
    <article onClick={onOpen} className={cardClass}>
      <div className={`relative aspect-square overflow-hidden bg-ink-50 ${isCatalog ? 'rounded-[14px]' : 'rounded-[16px]'}`}>
        {!imageLoaded && <span className="shimmer absolute inset-0" aria-label="Loading product image" />}
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
          className={`h-full w-full object-cover transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${zoomed ? 'scale-[1.55]' : 'group-hover:scale-[1.04]'}`}
        />

        {!zoomed && (
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {discountPct !== null && <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-btn ${isCatalog ? 'bg-primary' : 'bg-primary'}`}>{discountPct}% OFF</span>}
            {product.bestseller && <span className="flex items-center gap-1 rounded-full bg-text px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-card"><Award className="h-3 w-3" strokeWidth={2} />Best</span>}
            {product.newArrival && <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary shadow-card"><Sparkles className="h-3 w-3" strokeWidth={2} />New</span>}
          </div>
        )}

        {!zoomed && (
          <button
            type="button"
            onClick={handleWish}
            className={`absolute right-2 top-2 flex items-center justify-center rounded-full border border-border bg-surface shadow-card transition active:scale-90 ${isCatalog ? 'h-10 w-10' : 'h-9 w-9'} ${wished ? 'text-primary' : 'text-text-secondary'}`}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart key={heartKey} className={wished ? 'anim-pop h-4 w-4 fill-primary' : 'h-4 w-4'} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className={isCatalog ? 'px-1.5 pb-1 pt-3' : 'px-1 pt-3 pb-1'}>
        {product.inStock !== false && (product.lowStock || (product.stockCount !== undefined && product.stockCount <= 5)) && (
          <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-1 text-[10px] font-semibold text-error">
            <span className="h-1.5 w-1.5 rounded-full bg-error animate-pulse" />
            {product.stockCount ? `মাত্র ${product.stockCount}টি!` : 'কম বাকি!'}
          </span>
        )}
        <div className="flex items-center justify-between gap-1.5">
          <h3 className={isCatalog ? 'line-clamp-1 text-[18px] font-semibold tracking-[-0.025em] text-text' : 'line-clamp-1 text-[15px] font-semibold tracking-[-0.015em] text-text'}>{product.name}</h3>
          <span className={isCatalog ? 'flex shrink-0 items-center gap-0.5 rounded-full bg-secondary/70 px-1.5 py-1 text-[12px] font-semibold text-text-secondary' : 'flex shrink-0 items-center gap-0.5 rounded-full bg-ink-50 px-1.5 py-1 text-[10px] font-semibold text-text-secondary'}>
            <Star className="h-3 w-3 fill-gold text-gold" />{product.rating}
          </span>
        </div>
        {isCatalog && <div className="mt-1 text-[14px] font-medium text-text-tertiary">{safeWeights[0]?.size ?? '1 lb'}</div>}
        <div className={isCatalog ? 'mt-2 flex items-center justify-between gap-2' : 'mt-2.5 flex items-center justify-between gap-2'}>
          <span className="min-w-0">
            <span className={isCatalog ? 'text-[19px] font-semibold tabular text-primary' : ' text-[16px] font-semibold tabular text-primary'}>{formatINR(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price && <span className="ml-1.5 text-[11px] tabular text-text-tertiary line-through">{formatINR(product.oldPrice)}</span>}
          </span>
          {(product.inStock ?? true) && (
            <button
              type="button"
              onClick={handleAdd}
              className={`flex shrink-0 items-center justify-center text-white shadow-btn transition active:scale-90 ${isCatalog ? 'h-10 w-10 rounded-full' : 'h-8 w-8 rounded-[12px]'} ${added ? 'bg-success' : 'bg-primary hover:bg-primary-hover'}`}
              aria-label="Add to cart"
            >
              {added ? <Check className="h-4 w-4 anim-pop" strokeWidth={2.5} /> : <Plus className={isCatalog ? 'h-6 w-6' : 'h-4 w-4'} strokeWidth={2.4} />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
