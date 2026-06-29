import { useState } from 'react';
import { Heart, Plus, Star, Check } from 'lucide-react';
import { useCart, formatINR } from '../lib/store';
import type { Product } from '../types';

type Props = {
  product: Product;
  wished: boolean;
  onOpen: () => void;
  onWish: (id: string) => void;
  variant?: 'horizontal' | 'grid';
};

export default function ProductCard({ product, wished, onOpen, onWish, variant = 'horizontal' }: Props) {
  const { add } = useCart();
  const [heartKey, setHeartKey] = useState(0);
  const [added, setAdded] = useState(false);

  const safeWeights = product.weights?.length ? product.weights : [{ size: '1 kg', price: product.price }];
  const safeFlavors = product.flavors?.length ? product.flavors : ['Chocolate'];

  const handleWish = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setHeartKey(k => k + 1);
    onWish(product.id);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    add({
      productId: product.id,
      name: product.name,
      image: product.image,
      size: safeWeights[0]?.size ?? '1 kg',
      flavor: safeFlavors[0] ?? 'Chocolate',
      price: product.price,
      quantity: 1,
    });
    // confirmation state
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  if (variant === 'grid') {
    return (
      <article
        onClick={onOpen}
        className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white transition-all duration-200 active:scale-[.97]"
        style={{
          border: '1.5px solid rgba(0,0,0,0.055)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -10px rgba(0,0,0,0.11)',
        }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/cakes/logo-cake.png';
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
          {/* Subtle image bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Wishlist */}
          <button
            onClick={handleWish}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md transition-all active:scale-90"
            style={{
              boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
              color: wished ? '#E8526A' : 'rgba(28,17,18,0.4)',
            }}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              key={heartKey}
              className={`h-[15px] w-[15px] ${wished ? 'anim-pop' : ''}`}
              style={{
                fill: wished ? '#E8526A' : 'none',
                transition: 'fill 0.2s ease, color 0.2s ease',
              }}
              strokeWidth={2}
            />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.bestseller && (
              <span className="badge-premium rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider">
                Bestseller
              </span>
            )}
            {product.newArrival && (
              <span
                className="rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-white"
                style={{ background: 'linear-gradient(135deg, #EE6279 0%, #DC3E58 100%)' }}
              >
                New
              </span>
            )}
            {/* Sold count badge */}
            {product.soldCount && product.soldCount > 0 && (
              <span className="rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold text-white/90 uppercase tracking-wide">
                {product.soldCount >= 1000
                  ? `${(product.soldCount / 1000).toFixed(1)}k+ বিক্রি`
                  : `${product.soldCount}+ বিক্রি`}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Low stock urgency */}
          {product.inStock !== false && (product.lowStock || (product.stockCount !== undefined && product.stockCount <= 5)) && (
            <div className="mb-1.5 flex items-center gap-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[9.5px] font-bold text-red-500">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                {product.stockCount !== undefined && product.stockCount <= 5
                  ? `মাত্র ${product.stockCount}টি বাকি!`
                  : 'মাত্র কয়েকটি বাকি!'}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px]">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="font-bold text-ink">{product.rating}</span>
            <span className="text-ink-200">({product.reviews.toLocaleString()})</span>
          </div>
          <h3 className="mt-1.5 line-clamp-1 font-display text-[15.5px] font-bold tracking-tight text-ink">
            {product.name}
          </h3>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="font-display text-[16.5px] font-bold tabular text-gradient-coral">
              {formatINR(product.price)}
            </span>
            {(product.inStock ?? true) && (
              <button
                onClick={handleAdd}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-all active:scale-90 hover:brightness-105"
                style={{
                  background: added
                    ? 'linear-gradient(135deg, #1baf7a 0%, #0e8f63 100%)'
                    : 'linear-gradient(135deg, #EE6279 0%, #DC3E58 100%)',
                  boxShadow: added
                    ? '0 6px 18px -6px rgba(27,175,122,0.5)'
                    : '0 6px 18px -6px rgba(232,82,106,0.5)',
                  transition: 'background 0.3s ease, box-shadow 0.3s ease',
                }}
                aria-label="Add to cart"
              >
                {added
                  ? <Check key="check" className="h-4 w-4 anim-pop" strokeWidth={2.5} />
                  : <Plus className="h-4 w-4" strokeWidth={2.5} />
                }
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={onOpen}
      className="group relative flex w-[170px] flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-3xl bg-white transition-all duration-200 active:scale-[.97]"
      style={{
        border: '1.5px solid rgba(0,0,0,0.055)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -10px rgba(0,0,0,0.11)',
      }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/cakes/logo-cake.png';
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />

        <button
          onClick={handleWish}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-md transition-all active:scale-90"
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            color: wished ? '#E8526A' : 'rgba(28,17,18,0.4)',
          }}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            key={heartKey}
            className={`h-3.5 w-3.5 ${wished ? 'anim-pop' : ''}`}
            style={{
              fill: wished ? '#E8526A' : 'none',
              transition: 'fill 0.2s ease, color 0.2s ease',
            }}
            strokeWidth={2}
          />
        </button>

        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.bestseller && (
            <span className="badge-premium rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
              Best
            </span>
          )}
          {product.newArrival && (
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
              style={{ background: 'linear-gradient(135deg, #EE6279 0%, #DC3E58 100%)' }}
            >
              New
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        {/* Low stock urgency */}
        {product.inStock !== false && (product.lowStock || (product.stockCount !== undefined && product.stockCount <= 5)) && (
          <div className="mb-1 flex items-center gap-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
              {product.stockCount ? `মাত্র ${product.stockCount}টি!` : 'কম বাকি!'}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1 text-[10px]">
          <Star className="h-2.5 w-2.5 fill-gold text-gold" />
          <span className="font-bold text-ink">{product.rating}</span>
          <span className="text-ink-200">({product.reviews.toLocaleString()})</span>
        </div>
        <h3 className="mt-1 line-clamp-1 font-display text-[14.5px] font-bold tracking-tight text-ink">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-[14.5px] font-bold tabular text-gradient-coral">
            {formatINR(product.price)}
          </span>
          {(product.inStock ?? true) && (
            <button
              onClick={handleAdd}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-all active:scale-90"
              style={{
                background: added
                  ? 'linear-gradient(135deg, #1baf7a 0%, #0e8f63 100%)'
                  : 'linear-gradient(135deg, #EE6279 0%, #DC3E58 100%)',
                boxShadow: added
                  ? '0 6px 18px -6px rgba(27,175,122,0.5)'
                  : '0 5px 14px -5px rgba(232,82,106,0.5)',
                transition: 'background 0.3s ease, box-shadow 0.3s ease',
              }}
              aria-label="Add to cart"
            >
              {added
                ? <Check key="check" className="h-3.5 w-3.5 anim-pop" strokeWidth={2.5} />
                : <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              }
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
