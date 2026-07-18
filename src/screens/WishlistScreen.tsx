import { useState } from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import { useUI, useUser, useAuthStore } from '../lib/store';
import { useProducts } from '../hooks/useProducts';
import { categories } from '../lib/data';
import { safeArray } from '../lib/utils';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import OccasionIcon from '../components/OccasionIcon';

const ALL_CAT = { id: 'all' as const, name: 'All' };

export default function WishlistScreen({
  onAuthOpen,
}: {
  onAuthOpen?: () => void;
}) {
  const { back, go } = useUI();
  const { wishlist, toggleWish } = useUser();
  const { user } = useAuthStore();
  const { products } = useProducts();
  const [activeCat, setActiveCat] = useState<string>('all');
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set());

  const handleUnwish = (id: string) => {
    setFadingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      toggleWish(id);
      setFadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 220);
  };
  const saved = safeArray<Product>(products).filter((p) => (p.approved ?? true) && wishlist.includes(p.id));
  const list = activeCat === 'all' ? saved : saved.filter((p) => p.occasion === activeCat);

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-shrink-0 items-center justify-between px-5 pt-3 pb-3">
        <button
          onClick={back}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink active:scale-90"
          style={{ boxShadow: '0 1px 2px rgba(26,19,17,.03), 0 6px 16px -10px rgba(26,19,17,.2)' }}
        >
          <ArrowLeft className="h-[20px] w-[20px]" strokeWidth={2} />
        </button>
        <h1 className="font-display text-[16px] font-bold tracking-tight text-ink">Wishlist</h1>
        <div className="w-10" />
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-32 pt-1">
        {saved.length > 0 && (
          <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
            {[ALL_CAT, ...categories].map((c) => {
              const isActive = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className={`chip flex-shrink-0 ${isActive ? 'chip-active' : ''}`}
                >
                  <OccasionIcon id={c.id} size={15} />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {saved.length > 0 && list.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center anim-fade">
            <p className="text-[13px] text-ink-200">এই ক্যাটেগরিতে কোনো saved cake নেই।</p>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center anim-fade">
            <div
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, #FDF8F1 0%, #F3E4D0 100%)',
                boxShadow: '0 1px 2px rgba(26,19,17,.03), 0 12px 30px -18px rgba(168,103,46,.18)',
                border: '1px solid rgba(168,103,46,0.15)',
              }}
            >
              <Heart className="h-11 w-11 fill-coral text-coral" strokeWidth={1.6} />
            </div>

            {!user ? (
              <>
                <div className="mt-4 font-brand text-[22px] text-coral/70">save what you love</div>
                <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight text-ink">
                  Sign in to save favourites
                </h2>
                <p className="mt-1.5 max-w-xs text-[13px] text-ink-200">
                  আপনার পছন্দের cake গুলো এক জায়গায় রাখুন।
                </p>
                <button
                  onClick={onAuthOpen}
                  className="btn-primary mt-6 h-12 rounded-2xl px-7 text-[13px] font-bold"
                >
                  Sign in / Sign up
                </button>
              </>
            ) : (
              <>
                <div className="mt-4 font-brand text-[22px] text-coral/70">nothing saved yet</div>
                <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight text-ink">
                  Your wishlist is empty
                </h2>
                <p className="mt-1.5 max-w-xs text-[13px] text-ink-200">
                  যেকোনো cake এ ❤️ tap করে এখানে save করুন।
                </p>
                <button onClick={back} className="btn-primary mt-6 h-12 rounded-2xl px-7 text-[13px] font-bold">
                  Browse cakes
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <p className="mb-3 text-[12px] font-medium text-ink-200">
              <span className="font-bold text-ink">{list.length}</span> saved cakes
            </p>
            <div className="grid grid-cols-2 gap-3">
              {list.map((p) => (
                <div
                  key={p.id}
                  style={{
                    opacity: fadingIds.has(p.id) ? 0.45 : 1,
                    transition: 'opacity .2s ease',
                    pointerEvents: fadingIds.has(p.id) ? 'none' : 'auto',
                  }}
                >
                  <ProductCard
                    product={p}
                    wished
                    onWish={handleUnwish}
                    onOpen={() => go({ name: 'product', productId: p.id })}
                    variant="grid"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
