import { useMemo, useState } from 'react';
import {
  ArrowDownNarrowWide,
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
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import OccasionIcon from '../components/OccasionIcon';
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
  useModalDepth(filterOpen);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price-asc' | 'price-desc'>('popular');
  const [priceMax, setPriceMax] = useState<number>(5000);
  const [minRating, setMinRating] = useState<number>(0);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('bas-recent-searches') || '[]');
    } catch {
      return [];
    }
  });

  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter((item) => item !== query)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('bas-recent-searches', JSON.stringify(updated));
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('bas-recent-searches');
  };

  const approvedProducts = useMemo(
    () => safeArray<Product>(products).filter((product) => (product.approved ?? true) && (product.inStock ?? true)),
    [products]
  );

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query || query.length < 2) return [];
    return approvedProducts
      .filter((product) => product.name.toLowerCase().includes(query))
      .map((product) => product.name)
      .slice(0, 5);
  }, [approvedProducts, search]);

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

  const activeCategoryName = active === 'all'
    ? 'All Cakes'
    : (categories.find((category) => category.id === active)?.name ?? 'All Cakes');

  const sortLabel = sortBy === 'popular'
    ? 'Popular'
    : sortBy === 'newest'
      ? 'New arrivals'
      : sortBy === 'price-asc'
        ? 'Price: low to high'
        : 'Price: high to low';

  const filterActive = sortBy !== 'popular' || priceMax < 5000 || minRating > 0;
  const hasSearch = debouncedSearch.trim().length > 0;
  const activeChips = [
    `${filtered.length} results`,
    active !== 'all' ? activeCategoryName : null,
    filterActive ? sortLabel : null,
    minRating > 0 ? `${minRating.toFixed(1)}★+` : null,
    priceMax < 5000 ? `Up to ৳${priceMax.toLocaleString('en-BD')}` : null,
  ].filter(Boolean) as string[];

  const resetBrowse = () => {
    setActive('all');
    setSearch('');
    setSortBy('popular');
    setPriceMax(5000);
    setMinRating(0);
  };

  return (
    <div className="flex h-full flex-col bg-bg">
      <header className="flex-shrink-0 px-6 pb-4 pt-20 pr-18">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">Curated browse</p>
          <h1 className="mt-2 text-[24px] font-bold tracking-[-0.03em] text-text">
            {hasSearch ? `Results for “${debouncedSearch.trim()}”` : activeCategoryName}
          </h1>
          <p className="mt-2 max-w-[26ch] text-[14px] leading-relaxed text-text-secondary">
            Browse occasion-led cakes with soft filters, clean cards, and minimal distractions.
          </p>
        </div>

        <div className="mt-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={saveSearch}
            placeholder="Search cakes, flavours, or occasions"
            suggestions={suggestions}
            recentSearches={recentSearches}
            onClearRecent={clearRecent}
          />
        </div>
      </header>

      <div className="flex items-center gap-3 px-6 pb-3">
        <div className="no-scrollbar flex flex-1 gap-2.5 overflow-x-auto pb-1">
          {[ALL_CAT, ...categories].map((category) => {
            const isActive = active === category.id;
            const tint = category.id === 'all'
              ? { background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }
              : { background: category.color, color: category.fg };

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActive(category.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-[20px] border px-3.5 py-2.5 text-[13px] font-semibold shadow-card transition active:scale-95 ${
                  isActive ? 'border-primary bg-secondary text-primary' : 'border-border bg-surface text-text-secondary'
                }`}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-[12px]"
                  style={tint}
                >
                  <OccasionIcon id={category.id} size={16} />
                </span>
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-text shadow-card transition active:scale-95"
          aria-label="Open filters"
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={1.9} />
          {filterActive && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary" />}
        </button>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-36">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <span key={chip} className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-text-secondary shadow-card">
              {chip}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[30px] border border-border bg-surface px-6 py-10 text-center shadow-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-secondary text-primary shadow-card">
              <Search size={28} strokeWidth={1.75} />
            </div>
            <h2 className="mt-5 text-[22px] font-bold tracking-[-0.02em] text-text">No cakes found</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
              Try another search term, a different category, or reset your filters to see the full collection.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={resetBrowse}
                className="flex h-12 items-center justify-center gap-2 rounded-[18px] border border-border bg-bg px-5 text-[13px] font-semibold text-text transition active:scale-95"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={2} />
                Reset browse
              </button>
              <button
                type="button"
                onClick={() => go({ name: 'tabs', tab: 'home' })}
                className="flex h-12 items-center justify-center rounded-[18px] bg-primary px-5 text-[13px] font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
              >
                Back to home
              </button>
            </div>
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
                variant="grid"
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
