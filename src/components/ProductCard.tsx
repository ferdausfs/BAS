import { useState } from 'react';
import { Heart, Plus, Star, Check, Award, Sparkles, ZoomIn } from 'lucide-react';
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
  const [zoomed, setZoomed] = useState(false);

  const handleImageTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setZoomed((z) => !z);
  };

  const safeWeights = product.weights?.length ? product.weights : [{ size: '1 lb', price: product.price }];
  const safeFlavors = product.flavors?.length ? product.flavors : ['Chocolate'];

  const handleWish = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setHeartKey((k) => k + 1);
    onWish(product.id);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
    setTimeout(() => setAdded(false), 1200);
  };

  const AddButton = ({ size = 30 }: { size?: number }) =>
    (product.inStock ?? true) ? (
      <button
        onClick={handleAdd}
        className={`flex items-center justify-center rounded-full text-white transition-all active:scale-90 ${
          added
            ? 'bg-emerald-500 shadow-[0_6px_16px_-4px_rgba(27,175,122,.5)]'
            : 'bg-coral shadow-[0_6px_16px_-4px_rgba(168,103,46,.5)]'
        }`}
        style={{ width: size, height: size, transition: 'background .3s ease, box-shadow .3s ease' }}
        aria-label="Add to cart"
      >
        {added ? <Check className="h-3.5 w-3.5 anim-pop" strokeWidth={2.5} /> : <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />}
      </button>
    ) : null;

  const Badges = () =>
    !zoomed ? (
      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
        {product.bestseller && (
          <span className="flex items-center gap-1 rounded-full bg-ink/85 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
            <Award className="h-2.5 w-2.5" strokeWidth={2.5} /> Best
          </span>
        )}
        {product.newArrival && (
          <span className="flex items-center gap-1 rounded-full bg-coral/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
            <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} /> New
          </span>
        )}
      </div>
    ) : null;

  const isGrid = variant === 'grid';
  const wrapCls = isGrid
    ? 'group relative cursor-pointer overflow-hidden rounded-[22px] bg-white p-2 border border-ink-50/80 product-card-shadow transition-all duration-200 active:scale-[.97]'
    : 'group relative flex w-[168px] flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-[22px] bg-white p-2 border border-ink-50/80 product-card-shadow transition-all duration-200 active:scale-[.97]';

  return (
    <article onClick={onOpen} className={wrapCls}>
      <div className="relative aspect-square overflow-hidden rounded-[16px]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={(e) => { (e.target as HTMLImageElement).src = '/cakes/logo-cake.png'; }}
          onClick={handleImageTap}
          className={`h-full w-full object-cover transition-transform duration-300 ${zoomed ? 'scale-[1.7]' : 'group-hover:scale-[1.05]'}`}
        />
        <Badges />
        {!zoomed && (
          <button
            onClick={handleWish}
            className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition-all active:scale-90"
            style={{ color: wished ? '#A8672E' : 'rgba(59,37,48,.4)' }}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart key={heartKey} className={`h-3.5 w-3.5 ${wished ? 'anim-pop' : ''}`} style={{ fill: wished ? '#A8672E' : 'none' }} strokeWidth={2} />
          </button>
        )}
        {!zoomed && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-ink shadow-sm">
            <Star className="h-3 w-3 fill-gold text-gold" />
            {product.rating}
            <span className="text-ink-200">({product.reviews.toLocaleString()})</span>
          </span>
        )}
      </div>

      <div className="px-1.5 pt-2.5 pb-1">
        {product.inStock !== false && (product.lowStock || (product.stockCount !== undefined && product.stockCount <= 5)) && (
          <div className="mb-1 flex items-center gap-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50/80 px-1.5 py-0.5 text-[9px] font-bold text-red-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
              {product.stockCount ? `মাত্র ${product.stockCount}টি!` : 'কম বাকি!'}
            </span>
          </div>
        )}
        <h3 className="line-clamp-1 font-display text-[15px] font-bold tracking-tight text-ink">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-display text-[16px] font-bold tabular text-coral">{formatINR(product.price)}</span>
          <AddButton size={isGrid ? 32 : 30} />
        </div>
      </div>
    </article>
  );
}
