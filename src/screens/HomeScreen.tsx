import { useEffect, useState, useMemo } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Megaphone, RotateCcw, Cake, Search } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { useUI, useUser, useOrders, useAuthStore, useCart } from '../lib/store';
import { ls, safeArray } from '../lib/utils';
import { categories } from '../lib/data';
import { useProducts } from '../hooks/useProducts';
import { useBanners } from '../hooks/useBanners';
import HomeTopBar from '../components/HomeTopBar';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import OccasionSheet from '../components/OccasionSheet';
import { useModalDepth } from '../hooks/useModalDepth';
import type { Banner, SpecialDate } from '../types';

const STAGGER_DELAYS = ['delay-1', 'delay-2', 'delay-3', 'delay-4', 'delay-5'];

const getUpcomingDate = (userId?: string): { name: string; daysLeft: number } | null => {
  if (!userId) return null;
  const dates = ls.get<SpecialDate[]>(`bakeart-dates-${userId}`, []);
  const today = new Date();
  const currentYear = today.getFullYear();
  for (const d of dates) {
    const [month, day] = d.date.split('-').map(Number);
    const event = new Date(currentYear, month - 1, day);
    const diff = Math.ceil((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff <= 7) return { name: d.name, daysLeft: diff };
  }
  return null;
};

export default function HomeScreen({ onAuthOpen, onNotificationsOpen }: { onAuthOpen?: () => void; onNotificationsOpen?: () => void }) {
  const { go } = useUI();
  const { wishlist, toggleWish } = useUser();
  const { orders } = useOrders();
  const { user } = useAuthStore();
  const { products } = useProducts();
  const { banners } = useBanners();
  const activeBanners = useMemo(() => safeArray(banners).filter((b) => b.active !== false), [banners]);
  const upcoming = getUpcomingDate(user?.id);

  const [bannerIdx, setBannerIdx] = useState(0);
  const [pressedOccasion, setPressedOccasion] = useState<string | null>(null);
  const [occasionSheetOpen, setOccasionSheetOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeNotice, setActiveNotice] = useState<Banner | null>(null);
  useModalDepth(!!activeNotice);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('bas-recent-searches') || '[]'); } catch { return []; }
  });
  const saveSearch = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('bas-recent-searches', JSON.stringify(updated));
  };
  const clearRecent = () => { setRecentSearches([]); localStorage.removeItem('bas-recent-searches'); };

  const GROW_DELAY = 260;
  const GROW_DURATION = 680;
  const openOccasion = (c: (typeof categories)[number], btn: HTMLButtonElement) => {
    if (pressedOccasion) return;
    setPressedOccasion(c.id);
    const rect = btn.getBoundingClientRect();
    const { setOccasionZoom, go } = useUI.getState();
    setOccasionZoom({ top: rect.top, left: rect.left, width: rect.width, height: rect.height, radius: 16, color: c.color, stage: 'start' });
    setTimeout(() => {
      setOccasionZoom({ top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, radius: 0, color: c.color, stage: 'grow' });
    }, GROW_DELAY);
    setTimeout(() => {
      go({ name: 'tabs', tab: 'categories', categoryId: c.id });
      setOccasionZoom({ top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, radius: 0, color: c.color, stage: 'fadeout' });
    }, GROW_DELAY + GROW_DURATION);
    setTimeout(() => { setOccasionZoom(null); setPressedOccasion(null); }, GROW_DELAY + GROW_DURATION + 300);
  };

  const trending = useMemo(
    () => safeArray(products).filter((p) => (p.approved ?? true) && (p.inStock ?? true) && (p.bestseller || p.newArrival)).slice(0, 8),
    [products]
  );

  const forYouProduct = useMemo(() => {
    const allProducts = safeArray(products).filter((p) => (p.approved ?? true) && (p.inStock ?? true));
    const lastOrderItems = safeArray(orders[0]?.items);
    if (lastOrderItems.length > 0) {
      const found = allProducts.find((p) => p.id === lastOrderItems[0]?.id);
      if (found) return found;
    }
    if (wishlist.length > 0) {
      const found = allProducts.find((p) => p.id === wishlist[0]);
      if (found) return found;
    }
    return allProducts[3] ?? allProducts[0] ?? null;
  }, [products, orders, wishlist]);

  const forYouLabel = orders.length > 0 ? 'Based on your last order' : wishlist.length > 0 ? 'From your wishlist' : 'Trending this week';

  const searchResults = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return [];
    return safeArray(products).filter((p) => (p.approved ?? true) && (p.inStock ?? true)).filter((p) => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q)).slice(0, 8);
  }, [products, debouncedSearch]);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return safeArray(products).filter((p) => (p.approved ?? true) && p.name.toLowerCase().includes(q)).map((p) => p.name).slice(0, 5);
  }, [products, search]);

  useEffect(() => {
    if (activeBanners.length === 0) return;
    setBannerIdx((i) => (i >= activeBanners.length ? 0 : i));
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % activeBanners.length), 5500);
    return () => clearInterval(t);
  }, [activeBanners.length]);

  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto pb-32">
        {/* Brown/gold bakery home header (Phase 2 redesign) */}
        <HomeTopBar
          search={search}
          onSearchChange={setSearch}
          onSearch={saveSearch}
          suggestions={suggestions}
          recentSearches={recentSearches}
          onClearRecent={clearRecent}
          onOpenOccasions={() => setOccasionSheetOpen(true)}
          onNotificationsOpen={onNotificationsOpen}
        />

        {/* Category glass tiles */}
        <div className="no-scrollbar mt-5 flex gap-3 overflow-x-auto px-5 pb-1 anim-up delay-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={(e) => openOccasion(c, e.currentTarget)}
              className="flex flex-shrink-0 flex-col items-center gap-2 transition active:scale-90"
            >
              <span className="glass-strong flex h-14 w-14 items-center justify-center rounded-[20px]" style={{ color: c.fg }}>
                <Cake className="h-6 w-6" strokeWidth={1.9} />
              </span>
              <span className="text-[11px] font-semibold text-ink-300">{c.name}</span>
            </button>
          ))}
        </div>

        <OccasionSheet open={occasionSheetOpen} onClose={() => setOccasionSheetOpen(false)} onSelect={(c, btn) => openOccasion(c, btn)} />

        {!user && (
          <div className="mx-5 mt-4 flex items-center gap-3 rounded-2xl glass px-4 py-3 anim-up">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/60">
              <Cake size={20} className="text-coral" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-bold text-ink">Save wishlist &amp; track orders</div>
              <div className="text-[11px] text-ink-300">Sign in for personalized picks</div>
            </div>
            <button onClick={onAuthOpen} className="flex-shrink-0 rounded-xl bg-coral px-3 py-1.5 text-[11px] font-bold text-white">Sign in</button>
          </div>
        )}

        {upcoming && (
          <div className="mx-5 mt-4 flex items-center gap-3 rounded-2xl glass px-4 py-3 anim-up">
            <Cake size={22} className="flex-shrink-0 text-coral" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-bold text-ink">
                {upcoming.name} {upcoming.daysLeft === 0 ? 'is today!' : `in ${upcoming.daysLeft} day${upcoming.daysLeft > 1 ? 's' : ''}!`}
              </div>
              <div className="text-[11px] text-ink-300">Order a special cake now</div>
            </div>
            <button onClick={() => go({ name: 'tabs', tab: 'categories' })} className="flex-shrink-0 rounded-xl bg-coral px-3 py-1.5 text-[11px] font-bold text-white">Order</button>
          </div>
        )}

        {/* Hero banner */}
        {!search.trim() && activeBanners.length > 0 && (
          <div className="mt-5 px-5 anim-up delay-1">
            <div className="relative overflow-hidden rounded-[26px]">
              <div className="relative aspect-[1.7/1] w-full overflow-hidden">
                {activeBanners.map((b, i) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      if (b.productId) go({ name: 'product', productId: b.productId });
                      else if (b.link === 'customize') go({ name: 'customize' });
                      else if (b.link === 'categories') go({ name: 'tabs', tab: 'categories' });
                    }}
                    className={`absolute inset-0 cursor-pointer transition-opacity duration-700 ${i === bannerIdx ? 'z-10 opacity-100' : 'z-0 opacity-0'}`}
                  >
                    <img src={b.image} alt={b.title} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-center p-5">
                      <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">{b.tag}</span>
                      <h3 className="max-w-[9ch] font-display text-[22px] font-semibold leading-tight tracking-tight text-white">{b.title}</h3>
                      <p className="mt-1 max-w-[18ch] text-[12px] leading-snug text-white/85">{b.subtitle}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (b.type === 'discount') {
                            if (b.promoCode) { navigator.clipboard?.writeText(b.promoCode); setCopiedId(b.id); setTimeout(() => setCopiedId(null), 1500); }
                          } else if (b.type === 'notice') setActiveNotice(b);
                          else if (b.productId) go({ name: 'product', productId: b.productId });
                          else if (b.link === 'customize') go({ name: 'customize' });
                          else if (b.link === 'categories') go({ name: 'tabs', tab: 'categories' });
                          else go({ name: 'product', productId: safeArray(products)[0]?.id || 'p1' });
                        }}
                        className="mt-3 inline-flex h-9 w-fit items-center gap-1.5 rounded-full bg-white px-4 text-[12.5px] font-bold text-ink transition active:scale-95"
                      >
                        {b.type === 'discount' ? (copiedId === b.id ? 'Copied!' : `Copy: ${b.promoCode || 'CODE'}`) : (<>{b.tag || 'Order now'} <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} /></>)}
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={() => setBannerIdx((i) => (i - 1 + activeBanners.length) % activeBanners.length)} className="absolute top-1/2 left-3 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink backdrop-blur transition active:scale-95 md:flex" aria-label="Previous"><ChevronLeft className="h-4 w-4" strokeWidth={2.5} /></button>
                <button onClick={() => setBannerIdx((i) => (i + 1) % activeBanners.length)} className="absolute top-1/2 right-3 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink backdrop-blur transition active:scale-95 md:flex" aria-label="Next"><ChevronRight className="h-4 w-4" strokeWidth={2.5} /></button>
                <div className="absolute right-0 bottom-3 left-0 z-20 flex justify-center gap-1.5">
                  {activeBanners.map((_, i) => (
                    <button key={i} onClick={() => setBannerIdx(i)} className={`h-1.5 rounded-full transition-all ${i === bannerIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="mt-6 anim-up delay-2">
            <SectionHeader eyebrow="Search" title={`Results for "${search.trim()}"`} action={{ label: 'See all', onClick: () => go({ name: 'tabs', tab: 'categories' }) }} />
            <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
              {searchResults.map((p, i) => (
                <div key={p.id} className={`anim-up flex-shrink-0 ${STAGGER_DELAYS[i % STAGGER_DELAYS.length]}`}>
                  <ProductCard product={p} wished={wishlist.includes(p.id)} onWish={toggleWish} onOpen={() => go({ name: 'product', productId: p.id })} />
                </div>
              ))}
            </div>
          </div>
        )}

        {debouncedSearch.trim() && searchResults.length === 0 && (
          <div className="mx-5 mt-4 flex flex-col items-center rounded-2xl glass py-8 text-center anim-up">
            <Search className="h-8 w-8 text-ink-200 opacity-50" strokeWidth={1.5} />
            <p className="mt-2 text-[14px] font-medium text-ink">No results for "{debouncedSearch.trim()}"</p>
            <p className="text-[12px] text-ink-200">Try a different name or browse by occasion</p>
            <button onClick={() => { setSearch(''); go({ name: 'tabs', tab: 'categories' }); }} className="mt-3 rounded-xl bg-coral px-4 py-1.5 text-[12px] font-bold text-white">Browse all cakes</button>
          </div>
        )}

        {/* Reorder — calm glass row */}
        {orders.length > 0 && (() => {
          const lastOrder = orders[0];
          const firstItem = safeArray(lastOrder?.items)[0];
          return (
            <div className="mt-5 px-5 anim-up delay-2">
              <button
                onClick={() => { safeArray(lastOrder.items).forEach((item) => useCart.getState().add({ ...item })); go({ name: 'cart' }); }}
                className="group flex w-full items-center gap-3 rounded-2xl glass p-3 text-left transition active:scale-[.98]"
              >
                {firstItem?.image ? (
                  <img src={firstItem.image} alt="" className="h-12 w-12 flex-shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/60"><RotateCcw className="h-5 w-5 text-coral" strokeWidth={1.75} /></div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-200">Order again</div>
                  <div className="truncate font-display text-[15px] font-semibold text-ink">
                    {firstItem?.name ?? 'Your last order'}{lastOrder.items.length > 1 ? ` + ${lastOrder.items.length - 1} more` : ''}
                  </div>
                </div>
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/60 text-coral transition group-hover:translate-x-0.5"><ArrowRight className="h-4 w-4" /></span>
              </button>
            </div>
          );
        })()}

        {/* Popular */}
        <div className="mt-7 anim-up delay-3">
          <SectionHeader eyebrow="Trending now" title="Popular this week" action={{ label: 'See all', onClick: () => go({ name: 'tabs', tab: 'categories' }) }} />
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
            {trending.map((p, i) => (
              <div key={p.id} className={`anim-up flex-shrink-0 ${STAGGER_DELAYS[i % STAGGER_DELAYS.length]}`}>
                <ProductCard product={p} wished={wishlist.includes(p.id)} onWish={toggleWish} onOpen={() => go({ name: 'product', productId: p.id })} />
              </div>
            ))}
          </div>
        </div>

        {/* For you — glass */}
        <div className="mt-7 px-5 anim-up delay-4">
          <div className="relative flex items-center gap-4 overflow-hidden rounded-[24px] glass-strong p-5">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1 rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-coral">For you</div>
              <h3 className="mt-2 font-display text-[19px] font-semibold leading-tight tracking-tight text-ink">Picked for your taste</h3>
              <p className="mt-1 text-[12px] text-ink-300">{forYouLabel}</p>
              <button
                onClick={() => (forYouProduct ? go({ name: 'product', productId: forYouProduct.id }) : go({ name: 'customize' }))}
                className="mt-3.5 inline-flex h-9 items-center gap-1.5 rounded-full bg-coral px-3.5 text-[12px] font-bold text-white transition active:scale-95"
              >
                {forYouProduct ? 'View cake' : 'Customize yours'} <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
              </button>
            </div>
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl">
              <img loading="lazy" decoding="async" src={forYouProduct?.image || '/cakes/logo-cake.png'} alt={forYouProduct?.name || ''} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>

        <div className="mt-7 px-5 pb-3 text-center">
          <div className="font-brand text-[22px] text-ink">Bake Art Style</div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-200">Handcrafted since 2018</div>
        </div>
      </div>

      {activeNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm anim-fade">
          <div className="w-full max-w-sm overflow-hidden rounded-[28px] glass-strong p-6 anim-scale">
            <div className="flex justify-center text-ink"><Megaphone size={40} strokeWidth={1.5} /></div>
            <h3 className="mt-4 font-display text-[20px] font-bold tracking-tight text-ink">{activeNotice.title}</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-300">{activeNotice.noticeText}</p>
            <button onClick={() => setActiveNotice(null)} className="mt-6 flex h-11 w-full items-center justify-center rounded-2xl bg-coral text-[13px] font-bold text-white">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
