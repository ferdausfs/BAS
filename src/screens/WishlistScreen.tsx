import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Heart, RotateCcw } from 'lucide-react';
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

  const saved = useMemo(
    () => safeArray<Product>(products).filter((product) => (product.approved ?? true) && wishlist.includes(product.id)),
    [products, wishlist]
  );
  const list = activeCat === 'all' ? saved : saved.filter((product) => product.occasion === activeCat);
  const activeCategoryName = activeCat === 'all'
    ? 'All occasions'
    : (categories.find((category) => category.id === activeCat)?.name ?? 'All occasions');

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

  return (
    <div className="flex h-full flex-col bg-bg">
      <header className="flex-shrink-0 px-5 pb-4 pt-20 pr-18">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={back}
            className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-border bg-surface text-text shadow-card transition active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">Saved collection</p>
            <h1 className="mt-1 text-[24px] font-bold tracking-[-0.03em] text-text">Wishlist</h1>
          </div>
        </div>
        <p className="mt-3 max-w-[26ch] text-[14px] leading-relaxed text-text-secondary">
          {user
            ? 'A calm place for every cake you want to come back to later.'
            : 'Sign in to keep your saved cakes synced across visits and devices.'}
        </p>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28">
        {saved.length > 0 && (
          <section className="rounded-[30px] border border-border bg-surface p-4 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">Saved cakes</p>
                <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-text">
                  {saved.length} item{saved.length > 1 ? 's' : ''}
                </h2>
                <p className="mt-1 text-[14px] leading-relaxed text-text-secondary">
                  {activeCat === 'all'
                    ? 'Tap the heart on any card to softly remove it from your collection.'
                    : `Currently showing ${activeCategoryName.toLowerCase()} picks only.`}
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-secondary text-primary shadow-card">
                <Heart className="h-5 w-5 fill-primary" strokeWidth={1.8} />
              </div>
            </div>

            <div className="no-scrollbar mt-4 flex gap-2.5 overflow-x-auto pb-1">
              {[ALL_CAT, ...categories].map((category) => {
                const isActive = activeCat === category.id;
                const tint = category.id === 'all'
                  ? { background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }
                  : { background: category.color, color: category.fg };

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCat(category.id)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-[20px] border px-3.5 py-2.5 text-[13px] font-semibold shadow-card transition active:scale-95 ${
                      isActive ? 'border-primary bg-secondary text-primary' : 'border-border bg-bg text-text-secondary'
                    }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-[12px]" style={tint}>
                      <OccasionIcon id={category.id} size={16} />
                    </span>
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {saved.length > 0 && list.length === 0 ? (
          <div className="mt-5 rounded-[30px] border border-border bg-surface px-6 py-9 text-center shadow-card anim-fade">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-secondary text-primary shadow-card">
              <Heart className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <h2 className="mt-5 text-[22px] font-bold tracking-[-0.02em] text-text">No saved cakes in this filter</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
              Switch back to all occasions to see every cake you have saved so far.
            </p>
            <button
              type="button"
              onClick={() => setActiveCat('all')}
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-primary px-5 text-[13px] font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
              Show all saved cakes
            </button>
          </div>
        ) : list.length === 0 ? (
          <div className="mt-6 rounded-[32px] border border-border bg-surface px-6 py-10 text-center shadow-card anim-fade">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-secondary text-primary shadow-card">
              <Heart className="h-11 w-11 fill-primary/15 text-primary" strokeWidth={1.6} />
            </div>

            {!user ? (
              <>
                <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">Save what you love</p>
                <h2 className="mt-2 text-[24px] font-bold tracking-[-0.03em] text-text">Sign in to save favourites</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-text-secondary">
                  আপনার পছন্দের cake, future ideas, আর quick re-order shortlist এক জায়গায় রাখুন।
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => onAuthOpen?.()}
                    className="flex h-12 items-center justify-center rounded-[18px] bg-primary px-6 text-[13px] font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
                  >
                    Sign in / Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => go({ name: 'tabs', tab: 'categories' })}
                    className="flex h-12 items-center justify-center gap-2 rounded-[18px] border border-border bg-bg px-6 text-[13px] font-semibold text-text transition active:scale-95"
                  >
                    Browse cakes
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">Nothing saved yet</p>
                <h2 className="mt-2 text-[24px] font-bold tracking-[-0.03em] text-text">Your wishlist is empty</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-text-secondary">
                  যেকোনো cake card-এ থাকা heart icon tap করলেই সেটা এখানে নরম, organised collection হিসেবে জমা হবে।
                </p>
                <button
                  type="button"
                  onClick={() => go({ name: 'tabs', tab: 'categories' })}
                  className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-primary px-6 text-[13px] font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
                >
                  Browse cakes
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </button>
              </>
            )}
          </div>
        ) : (
          <section className="mt-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[13px] font-medium text-text-secondary">
                Showing <span className="font-semibold text-text">{list.length}</span> of {saved.length} saved cake{saved.length > 1 ? 's' : ''}
              </p>
              <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-text-secondary shadow-card">
                {activeCategoryName}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {list.map((product) => (
                <div
                  key={product.id}
                  style={{
                    opacity: fadingIds.has(product.id) ? 0.45 : 1,
                    transition: 'opacity .2s ease',
                    pointerEvents: fadingIds.has(product.id) ? 'none' : 'auto',
                  }}
                >
                  <ProductCard
                    product={product}
                    wished
                    onWish={handleUnwish}
                    onOpen={() => go({ name: 'product', productId: product.id })}
                    variant="grid"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
