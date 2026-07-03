import { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  Search,
  X,
  Flame,
  Sparkles,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
  Cake,
} from 'lucide-react';
import { useUI, useUser } from '../lib/store';
import { categories } from '../lib/data';
import { useProducts } from '../hooks/useProducts';
import { safeArray } from '../lib/utils';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import OccasionIcon from '../components/OccasionIcon';
import { useDebounce } from '../hooks/useDebounce';

function SkeletonCard() {
  return (
    <div
      className="overflow-hidden rounded-3xl bg-white animate-pulse"
      style={{ boxShadow: '0 1px 2px rgba(26,19,17,.03), 0 8px 24px -16px rgba(26,19,17,.12)' }}
    >
      <div className="aspect-square bg-ink-50" />
      <div className="p-4 space-y-2">
        <div className="h-2.5 w-16 rounded-full bg-ink-50" />
        <div className="h-3.5 w-full rounded-full bg-ink-50" />
        <div className="h-3.5 w-3/4 rounded-full bg-ink-50" />
        <div className="mt-3 flex items-center justify-between">
          <div className="h-4 w-14 rounded-full bg-ink-50" />
          <div className="h-8 w-8 rounded-2xl bg-ink-50" />
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
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price-asc' | 'price-desc'>('popular');
  const [priceMax, setPriceMax] = useState<number>(5000);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('bas-recent-searches') || '[]');
    } catch {
      return [];
    }
  });

  const saveSearch = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('bas-recent-searches', JSON.stringify(updated));
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('bas-recent-searches');
  };

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return safeArray(products)
      .filter((p) => (p.approved ?? true) && p.name.toLowerCase().includes(q))
      .map((p) => p.name)
      .slice(0, 5);
  }, [products, search]);

  const filtered = useMemo(() => {
    let list = safeArray(products)
      .filter((p) => (p.approved ?? true) && (p.inStock ?? true))
      .filter((p) => (active === 'all' ? true : p.occasion === active))
      .filter((p) =>
        debouncedSearch.trim() ? p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) : true
      )
      .filter((p) => (p.price ?? 0) <= priceMax);

    if (sortBy === 'newest') list = list.filter((p) => p.newArrival);
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));

    return list;
  }, [products, active, debouncedSearch, sortBy, priceMax]);

  return (
    <div className="flex h-full flex-col bg-cream">
      {/* Header */}
      <header className="flex-shrink-0 px-5 pt-3 pb-2">
        <div className="flex items-end justify-between">
          <div>
            <div className="section-eyebrow">Explore</div>
            <h1 className="mt-1 font-display text-[22px] font-bold tracking-tight text-ink">
              All cakes
            </h1>
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-200 transition active:scale-90"
            style={{ boxShadow: '0 1px 2px rgba(26,19,17,.03), 0 8px 24px -16px rgba(26,19,17,.16)' }}
          >
            <SlidersHorizontal className="h-[18px] w-[18px]" />
            {(sortBy !== 'popular' || priceMax < 5000) && (
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-coral" />
            )}
          </button>
        </div>

        <div className="mt-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={saveSearch}
            placeholder="Search cakes…"
            suggestions={suggestions}
            recentSearches={recentSearches}
            onClearRecent={clearRecent}
          />
        </div>
      </header>

      {/* Filter chips */}
      <div className="no-scrollbar mt-3 flex flex-shrink-0 gap-2 overflow-x-auto px-5 pb-3">
        {[ALL_CAT, ...categories].map((c) => {
          const isActive = active === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`chip flex-shrink-0 ${isActive ? 'chip-active' : ''}`}
            >
              <OccasionIcon id={c.id} size={15} />
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-32">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12px] font-medium text-ink-200">
            <span className="font-bold text-ink">{filtered.length}</span> cakes
          </p>
          <p className="text-[12px] font-medium text-ink-200">
            Sorted by {sortBy === 'popular' ? 'Popular' : sortBy === 'newest' ? 'Newest' : sortBy === 'price-asc' ? 'Price ↑' : 'Price ↓'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex justify-center text-ink-200 opacity-60">
              <Search size={44} strokeWidth={1.5} />
            </div>
            <p className="mt-2 text-[14px] font-medium text-ink-300">No cakes found</p>
            <p className="text-[12px] text-ink-200">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                wished={wishlist.includes(p.id)}
                onWish={toggleWish}
                onOpen={() => go({ name: 'product', productId: p.id })}
                variant="grid"
              />
            ))}
          </div>
        )}
      </div>

      {filterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setFilterOpen(false)}
          />
          {/* Sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] bg-white px-5 pt-5 pb-10"
            style={{ boxShadow: '0 -8px 40px -8px rgba(26,19,17,.18)' }}
          >
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-ink-100" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[18px] font-bold text-ink">Filter & Sort</h2>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-50"
              >
                <X className="h-4 w-4 text-ink" />
              </button>
            </div>

            {/* Sort options */}
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-200">Sort by</p>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {([
                { v: 'popular', label: 'Popular', icon: Flame },
                { v: 'newest', label: 'New arrivals', icon: Sparkles },
                { v: 'price-asc', label: 'Price: low–high', icon: ArrowUpNarrowWide },
                { v: 'price-desc', label: 'Price: high–low', icon: ArrowDownNarrowWide },
              ] as const).map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.v}
                    onClick={() => setSortBy(opt.v)}
                    className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-[12px] font-semibold transition ${
                      sortBy === opt.v ? 'bg-coral text-white' : 'bg-ink-50 text-ink-300'
                    }`}
                  >
                    <Icon className="h-[14px] w-[14px]" strokeWidth={2} />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Price range */}
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-200">
              Max price — ৳{priceMax.toLocaleString()}
            </p>
            <div className="relative mt-1">
              <div className="h-[5px] rounded-full bg-ink-50">
                <div
                  className="h-[5px] rounded-full bg-coral"
                  style={{ width: `${((priceMax - 500) / (5000 - 500)) * 100}%` }}
                />
              </div>
              <input
                type="range"
                min={500}
                max={5000}
                step={100}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="absolute inset-x-0 top-1/2 h-[5px] w-full -translate-y-1/2 appearance-none bg-transparent accent-brand-500"
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-ink-200">
              <span>৳500</span>
              <span>৳5,000</span>
            </div>

            {/* Apply button */}
            <button
              onClick={() => setFilterOpen(false)}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-coral text-[13px] font-bold text-white"
            >
              <Cake className="h-4 w-4" strokeWidth={2} />
              Show {filtered.length} cakes
            </button>

            {/* Reset */}
            {(sortBy !== 'popular' || priceMax < 5000) && (
              <button
                onClick={() => {
                  setSortBy('popular');
                  setPriceMax(5000);
                }}
                className="mt-2 w-full text-center text-[12px] font-medium text-ink-200"
              >
                Reset filters
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
