import { useMemo, useState } from 'react';
import {
  ArrowDownNarrowWide,
  ArrowLeft,
  ArrowUpNarrowWide,
  Cake,
  Flame,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { useUI, useUser } from '../lib/store';
import { categories } from '../lib/data';
import { useProducts } from '../hooks/useProducts';
import { safeArray } from '../lib/utils';
import { useModalDepth } from '../hooks/useModalDepth';
import ProductCard from '../components/ProductCard';
import { useDebounce } from '../hooks/useDebounce';
import type { Product } from '../types';

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-border bg-surface p-2 shadow-card animate-pulse">
      <div className="aspect-square rounded-[18px] bg-secondary" />
      <div className="space-y-2 p-3">
        <div className="h-2.5 w-20 rounded-full bg-secondary" />
        <div className="h-4 w-full rounded-full bg-secondary" />
        <div className="h-4 w-3/4 rounded-full bg-secondary" />
        <div className="mt-3 flex items-center justify-between">
          <div className="h-5 w-16 rounded-full bg-secondary" />
          <div className="h-9 w-9 rounded-[14px] bg-secondary" />
        </div>
      </div>
    </div>
  );
}

const ALL_CAT = { id: 'all' as const, name: 'All' };

export default function CategoriesScreen() {
  const { go, view } = useUI();
  const { wishlist, toggleWish } = useUser();
  const { products, loading } = useProducts();

  const initialCat = (view as any).categoryId ?? 'all';
  const [active, setActive] = useState<string>(initialCat);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useModalDepth(filterOpen);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price-asc' | 'price-desc'>('popular');
  const [priceMax, setPriceMax] = useState<number>(5000);
  const [minRating, setMinRating] = useState<number>(0);


  const approvedProducts = useMemo(
    () => safeArray<Product>(products).filter((product) => (product.approved ?? true) && (product.inStock ?? true)),
    [products]
  );


  const filtered = useMemo(() => {
    let list = approvedProducts
      .filter((product) => (active === 'all' ? true : product.occasion === active))
      .filter((product) => (debouncedSearch.trim() ? product.name.toLowerCase().includes(debouncedSearch.trim().toLowerCase()) : true))
      .filter((product) => (product.price ?? 0) <= priceMax)
      .filter((product) => (product.rating ?? 0) >= minRating);

    if (sortBy === 'newest') list = list.filter((product) => product.newArrival);
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));

    return list;
  }, [approvedProducts, active, debouncedSearch, sortBy, priceMax, minRating]);


  const filterActive = sortBy !== 'popular' || priceMax < 5000 || minRating > 0;
  const hasSearch = debouncedSearch.trim().length > 0;

  const resetBrowse = () => {
    setActive('all');
    setSearch('');
    setSortBy('popular');
    setPriceMax(5000);
    setMinRating(0);
  };

  return (
    <div className="flex h-full flex-col bg-bg">
      <header className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="relative flex h-14 items-center justify-center">
          <button
            type="button"
            onClick={() => go({ name: 'tabs', tab: 'home' })}
            className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-text-secondary shadow-card transition active:scale-95"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.9} />
          </button>

          {searchOpen ? (
            <div className="mx-14 flex h-11 flex-1 items-center gap-3 rounded-full bg-surface px-4 shadow-card ring-1 ring-border">
              <Search className="h-5 w-5 flex-shrink-0 text-text-secondary" strokeWidth={1.9} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                autoFocus
                placeholder="Search cakes"
                className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-text outline-none placeholder:text-text-tertiary"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-text-secondary"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              )}
            </div>
          ) : (
            <h1 className="text-[20px] font-semibold tracking-tight text-text">
              {hasSearch ? 'Search' : 'Cake'}
            </h1>
          )}

          {!searchOpen && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="absolute right-0 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-text-secondary shadow-card transition active:scale-95"
              aria-label="Search cakes"
            >
              <Search className="h-5 w-5" strokeWidth={1.8} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-shrink-0 px-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="no-scrollbar flex flex-1 gap-3 overflow-x-auto pb-1">
            {[ALL_CAT, ...categories].map((category) => {
              const isActive = active === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActive(category.id)}
                  className={`flex h-11 shrink-0 items-center rounded-full px-4 text-[14px] font-semibold shadow-card transition active:scale-95 ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-surface text-text-secondary'
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-text shadow-card transition active:scale-95"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-5 w-5" strokeWidth={1.9} />
            {filterActive && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary" />}
          </button>
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-36">
        <div className="mb-4 flex items-center justify-between gap-3">
          {hasSearch ? (
            <>
              <h2 className="min-w-0 truncate text-[20px] font-semibold tracking-[-0.03em] text-text">
                Results for “{debouncedSearch.trim()}”
              </h2>
              <span className="shrink-0 text-[13px] font-medium text-text-secondary">
                {filtered.length} Results Found
              </span>
            </>
          ) : (
            <>
              <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-text-secondary shadow-card">
                {filtered.length} results
              </span>
              {filterActive && (
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('popular');
                    setPriceMax(5000);
                    setMinRating(0);
                  }}
                  className="rounded-full bg-secondary px-4 py-2 text-[13px] font-semibold text-primary"
                >
                  Reset filter
                </button>
              )}
            </>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[24px] border border-border bg-surface px-6 py-10 text-center shadow-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary shadow-card">
              <Search size={28} strokeWidth={1.75} />
            </div>
            <h2 className="mt-5 text-[22px] font-semibold tracking-[-0.02em] text-text">No cakes found</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
              Try another search term, a different category, or reset your filters to see the full collection.
            </p>
            <button
              type="button"
              onClick={resetBrowse}
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-[13px] font-semibold text-white shadow-btn transition active:scale-95"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
              Reset browse
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wished={wishlist.includes(product.id)}
                onWish={toggleWish}
                onOpen={() => go({ name: 'product', productId: product.id })}
                variant="catalog"
              />
            ))}
          </div>
        )}
      </div>

      {filterOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[135] bg-black/36 anim-fade"
            onClick={() => setFilterOpen(false)}
            aria-label="Close filters"
          />
          <section
            className="fixed bottom-0 left-0 right-0 z-[140] rounded-t-[22px] border border-border bg-surface px-6 pb-10 pt-5 shadow-float anim-up"
            aria-label="Filter and sort"
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-accent" />
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-text">Filter & Sort</h2>
                <p className="mt-1 text-[14px] text-text-secondary">Shape the catalogue the way you like it.</p>
              </div>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-secondary text-text-secondary transition active:scale-90"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">Sort by</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { v: 'popular', label: 'Popular', icon: Flame },
                    { v: 'newest', label: 'New arrivals', icon: Sparkles },
                    { v: 'price-asc', label: 'Price: low–high', icon: ArrowUpNarrowWide },
                    { v: 'price-desc', label: 'Price: high–low', icon: ArrowDownNarrowWide },
                  ] as const).map((option) => {
                    const Icon = option.icon;
                    const activeOption = sortBy === option.v;
                    return (
                      <button
                        key={option.v}
                        type="button"
                        onClick={() => setSortBy(option.v)}
                        className={`flex items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition active:scale-95 ${
                          activeOption
                            ? 'border-primary bg-secondary text-primary shadow-card'
                            : 'border-border bg-bg text-text-secondary'
                        }`}
                      >
                        <span className={`flex h-9 w-9 items-center justify-center rounded-[14px] ${activeOption ? 'bg-white text-primary shadow-card' : 'bg-surface text-text-secondary shadow-card'}`}>
                          <Icon className="h-4 w-4" strokeWidth={2} />
                        </span>
                        <span className="text-[13px] font-semibold leading-snug">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">Reviews</p>
                <div className="space-y-2">
                  {[
                    { v: 4.5, label: '4.5 and above' },
                    { v: 4.0, label: '4.0 and above' },
                    { v: 3.5, label: '3.5 and above' },
                    { v: 0, label: 'Any rating' },
                  ].map((option) => {
                    const activeOption = minRating === option.v;
                    return (
                      <button
                        key={option.v}
                        type="button"
                        onClick={() => setMinRating(option.v)}
                        className={`flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-[13px] font-semibold transition active:scale-95 ${
                          activeOption
                            ? 'border-primary bg-secondary text-primary'
                            : 'border-border bg-bg text-text-secondary'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-gold">★★★★★</span>
                          <span>{option.label}</span>
                        </span>
                        <span className={`h-4 w-4 rounded-full border-2 ${activeOption ? 'border-primary bg-primary' : 'border-divider bg-white'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">Max price</p>
                  <p className="text-[13px] font-semibold text-text">৳{priceMax.toLocaleString('en-BD')}</p>
                </div>
                <div className="relative mt-1">
                  <div className="h-[6px] rounded-full bg-secondary">
                    <div
                      className="h-[6px] rounded-full bg-primary"
                      style={{ width: `${((priceMax - 500) / (5000 - 500)) * 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={5000}
                    step={100}
                    value={priceMax}
                    onChange={(event) => setPriceMax(Number(event.target.value))}
                    className="absolute inset-x-0 top-1/2 h-[6px] w-full -translate-y-1/2 appearance-none bg-transparent accent-brand-500"
                  />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-text-tertiary">
                  <span>৳500</span>
                  <span>৳5,000</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSortBy('popular');
                  setPriceMax(5000);
                  setMinRating(0);
                }}
                className="flex h-12 flex-1 items-center justify-center rounded-[18px] border border-border bg-bg text-[13px] font-semibold text-text transition active:scale-95"
              >
                Reset filter
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[18px] bg-primary text-[13px] font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
              >
                <Cake className="h-4 w-4" strokeWidth={2} />
                Apply
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
