import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Cake, ChevronLeft, ChevronRight, Megaphone, RotateCcw, Search } from 'lucide-react';
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
import OccasionIcon from '../components/OccasionIcon';
import { useModalDepth } from '../hooks/useModalDepth';
import type { Banner, CartItem, Product, SpecialDate } from '../types';

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

export default function HomeScreen({
  onAuthOpen,
  onNotificationsOpen,
}: {
  onAuthOpen?: () => void;
  onNotificationsOpen?: () => void;
}) {
  const { go } = useUI();
  const { wishlist, toggleWish } = useUser();
  const { orders } = useOrders();
  const { user } = useAuthStore();
  const { products } = useProducts();
  const { banners } = useBanners();

  const availableProducts = useMemo(
    () => safeArray<Product>(products).filter((product) => (product.approved ?? true) && (product.inStock ?? true)),
    [products]
  );
  const activeBanners = useMemo(
    () => safeArray<Banner>(banners).filter((banner) => banner.active !== false),
    [banners]
  );
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

  const GROW_DELAY = 260;
  const GROW_DURATION = 680;
  const openOccasion = (category: (typeof categories)[number], button: HTMLButtonElement) => {
    if (pressedOccasion) return;
    setPressedOccasion(category.id);
    const rect = button.getBoundingClientRect();
    const { setOccasionZoom, go: navigate } = useUI.getState();
    setOccasionZoom({ top: rect.top, left: rect.left, width: rect.width, height: rect.height, radius: 22, color: category.color, stage: 'start' });
    setTimeout(() => {
      setOccasionZoom({ top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, radius: 0, color: category.color, stage: 'grow' });
    }, GROW_DELAY);
    setTimeout(() => {
      navigate({ name: 'tabs', tab: 'categories', categoryId: category.id });
      setOccasionZoom({ top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, radius: 0, color: category.color, stage: 'fadeout' });
    }, GROW_DELAY + GROW_DURATION);
    setTimeout(() => {
      setOccasionZoom(null);
      setPressedOccasion(null);
    }, GROW_DELAY + GROW_DURATION + 300);
  };

  const trending = useMemo(
    () => availableProducts.filter((product) => product.bestseller || product.newArrival).slice(0, 8),
    [availableProducts]
  );

  const forYouProduct = useMemo(() => {
    const lastOrderItems = safeArray<CartItem>(orders[0]?.items);
    if (lastOrderItems.length > 0) {
      const found = availableProducts.find((product) => product.id === lastOrderItems[0]?.productId);
      if (found) return found;
    }
    if (wishlist.length > 0) {
      const found = availableProducts.find((product) => product.id === wishlist[0]);
      if (found) return found;
    }
    return availableProducts[3] ?? availableProducts[0] ?? null;
  }, [availableProducts, orders, wishlist]);

  const forYouLabel = orders.length > 0
    ? 'Inspired by your last order'
    : wishlist.length > 0
      ? 'Pulled from your saved collection'
      : 'A calm edit of best sellers this week';

  const searchResults = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return [];
    return availableProducts
      .filter((product) => product.name.toLowerCase().includes(query) || product.tagline.toLowerCase().includes(query))
      .slice(0, 8);
  }, [availableProducts, debouncedSearch]);

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query || query.length < 2) return [];
    return availableProducts
      .filter((product) => product.name.toLowerCase().includes(query))
      .map((product) => product.name)
      .slice(0, 5);
  }, [availableProducts, search]);

  const hasSearch = search.trim().length > 0;
  const searchTerm = debouncedSearch.trim();
  const featuredProducts = trending.slice(0, 6);

  useEffect(() => {
    if (activeBanners.length === 0) return;
    setBannerIdx((current) => (current >= activeBanners.length ? 0 : current));
    const timer = setInterval(() => setBannerIdx((current) => (current + 1) % activeBanners.length), 5500);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="no-scrollbar flex-1 overflow-y-auto pb-36">
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

        {!hasSearch && activeBanners.length > 0 && (
          <section className="mt-6 anim-up delay-1">
            <SectionHeader
              title="Exclusive Offers"
              subtitle="Seasonal picks, limited bundles, and soft-launch specials"
              action={{ label: 'See all', onClick: () => go({ name: 'tabs', tab: 'categories' }) }}
            />
            <div className="mt-4 px-6">
              <div className="rounded-[30px] border border-border bg-surface p-2 shadow-card">
                <div className="relative overflow-hidden rounded-[24px]">
                  <div className="relative aspect-[1.56/1] w-full overflow-hidden bg-secondary">
                    {activeBanners.map((banner, index) => (
                      <div
                        key={banner.id}
                        onClick={() => {
                          if (banner.productId) go({ name: 'product', productId: banner.productId });
                          else if (banner.link === 'customize') go({ name: 'customize' });
                          else if (banner.link === 'categories') go({ name: 'tabs', tab: 'categories' });
                        }}
                        className={`absolute inset-0 cursor-pointer transition-opacity duration-700 ${index === bannerIdx ? 'z-10 opacity-100' : 'z-0 opacity-0'}`}
                      >
                        <img src={banner.image} alt={banner.title} className="absolute inset-0 h-full w-full object-cover" />
                        <div
                          className="absolute inset-0"
                          style={{ background: 'linear-gradient(90deg, rgba(44,44,44,0.54) 0%, rgba(44,44,44,0.2) 56%, rgba(44,44,44,0) 100%)' }}
                        />
                        <div className="absolute inset-0 flex flex-col justify-center p-5 sm:p-6">
                          <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-white/92 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text shadow-card">
                            {banner.tag}
                          </span>
                          <h3 className="max-w-[16ch] text-[24px] font-bold leading-[1.08] tracking-[-0.03em] text-white sm:text-[26px]">
                            {banner.title}
                          </h3>
                          <p className="mt-2 max-w-[23ch] text-[13px] leading-relaxed text-white/86">
                            {banner.subtitle}
                          </p>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (banner.type === 'discount') {
                                if (banner.promoCode) {
                                  navigator.clipboard?.writeText(banner.promoCode);
                                  setCopiedId(banner.id);
                                  setTimeout(() => setCopiedId(null), 1500);
                                }
                              } else if (banner.type === 'notice') {
                                setActiveNotice(banner);
                              } else if (banner.productId) {
                                go({ name: 'product', productId: banner.productId });
                              } else if (banner.link === 'customize') {
                                go({ name: 'customize' });
                              } else if (banner.link === 'categories') {
                                go({ name: 'tabs', tab: 'categories' });
                              } else {
                                go({ name: 'product', productId: availableProducts[0]?.id || 'p1' });
                              }
                            }}
                            className="mt-4 inline-flex h-11 w-fit items-center gap-2 rounded-[18px] bg-primary px-4 text-[13px] font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
                          >
                            {banner.type === 'discount'
                              ? copiedId === banner.id
                                ? 'Copied!'
                                : `Copy: ${banner.promoCode || 'CODE'}`
                              : <>{banner.ctaText || 'Shop Now'} <ArrowRight className="h-4 w-4" strokeWidth={2.2} /></>}
                          </button>
                        </div>
                      </div>
                    ))}
                    {activeBanners.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setBannerIdx((current) => (current - 1 + activeBanners.length) % activeBanners.length)}
                          className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[16px] border border-white/60 bg-white/90 text-text shadow-card transition active:scale-95 md:flex"
                          aria-label="Previous"
                        >
                          <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerIdx((current) => (current + 1) % activeBanners.length)}
                          className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[16px] border border-white/60 bg-white/90 text-text shadow-card transition active:scale-95 md:flex"
                          aria-label="Next"
                        >
                          <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {activeBanners.length > 1 && (
                  <div className="mt-3 flex items-center justify-between gap-3 px-2 pb-1">
                    <div className="flex items-center gap-1.5">
                      {activeBanners.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setBannerIdx(index)}
                          className={`h-2 rounded-full transition-all ${index === bannerIdx ? 'w-7 bg-primary' : 'w-2 bg-accent'}`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                      {bannerIdx + 1} / {activeBanners.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 anim-up delay-2">
          <SectionHeader
            title="Explore Categories"
            subtitle="Browse by occasion with soft pastel cues and quick jumps"
            action={{ label: 'See all', onClick: () => go({ name: 'tabs', tab: 'categories' }) }}
          />
          <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto px-6 pb-1">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={(event) => openOccasion(category, event.currentTarget)}
                className="flex min-w-[98px] shrink-0 flex-col items-start gap-3 rounded-[24px] border border-border bg-surface p-3 text-left shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.98]"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-[16px] ring-1 ring-white/70"
                  style={{ background: category.color, color: category.fg }}
                >
                  <OccasionIcon id={category.icon} size={20} />
                </span>
                <span className="text-[13px] font-semibold leading-tight text-text">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        <OccasionSheet open={occasionSheetOpen} onClose={() => setOccasionSheetOpen(false)} onSelect={(category, button) => openOccasion(category, button)} />

        <div className="mt-5 space-y-3 px-6">
          {!user && (
            <div className="anim-up rounded-[26px] border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-secondary text-primary shadow-card">
                  <Cake size={22} strokeWidth={1.9} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-text">Save wishlist & track orders</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">Sign in once and keep every favourite cake, promo, and past order in one place.</p>
                </div>
                <button
                  type="button"
                  onClick={() => onAuthOpen?.()}
                  className="flex h-11 shrink-0 items-center justify-center rounded-[16px] bg-primary px-4 text-[13px] font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {upcoming && (
            <div className="anim-up rounded-[26px] border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-secondary text-primary shadow-card">
                  <Cake size={22} strokeWidth={1.9} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-text">
                    {upcoming.name} {upcoming.daysLeft === 0 ? 'is today' : `is in ${upcoming.daysLeft} day${upcoming.daysLeft > 1 ? 's' : ''}`}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">Plan a cake early to lock your preferred flavour, finish, and delivery slot.</p>
                </div>
                <button
                  type="button"
                  onClick={() => go({ name: 'tabs', tab: 'categories' })}
                  className="flex h-11 shrink-0 items-center justify-center rounded-[16px] border border-border bg-secondary px-4 text-[13px] font-semibold text-primary shadow-card transition active:scale-95"
                >
                  Order
                </button>
              </div>
            </div>
          )}
        </div>

        {searchResults.length > 0 && (
          <section className="mt-6 px-6 anim-up delay-2">
            <div className="rounded-[28px] border border-border bg-surface p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">Search results</p>
                  <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-text">Results for “{search.trim()}”</h2>
                  <p className="mt-1 text-[14px] text-text-secondary">{searchResults.length} cakes match your taste right now.</p>
                </div>
                <button
                  type="button"
                  onClick={() => go({ name: 'tabs', tab: 'categories' })}
                  className="rounded-full border border-border bg-bg px-3 py-2 text-[12px] font-semibold text-primary transition active:scale-95"
                >
                  View all
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {searchResults.map((product, index) => (
                  <div key={product.id} className={`anim-up ${STAGGER_DELAYS[index % STAGGER_DELAYS.length]}`}>
                    <ProductCard
                      product={product}
                      wished={wishlist.includes(product.id)}
                      onWish={toggleWish}
                      onOpen={() => go({ name: 'product', productId: product.id })}
                      variant="grid"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {searchTerm && searchResults.length === 0 && (
          <section className="mt-6 px-6 anim-up delay-2">
            <div className="rounded-[30px] border border-border bg-surface px-6 py-9 text-center shadow-card">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-secondary text-primary shadow-card">
                <Search className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <h2 className="mt-5 text-[22px] font-bold tracking-[-0.02em] text-text">No results for “{searchTerm}”</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">Try a simpler cake name, another flavour, or browse by occasion instead.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="flex h-12 items-center justify-center rounded-[18px] border border-border bg-bg px-5 text-[13px] font-semibold text-text transition active:scale-95"
                >
                  Clear search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    go({ name: 'tabs', tab: 'categories' });
                  }}
                  className="flex h-12 items-center justify-center rounded-[18px] bg-primary px-5 text-[13px] font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
                >
                  Browse all cakes
                </button>
              </div>
            </div>
          </section>
        )}

        {orders.length > 0 && (() => {
          const lastOrder = orders[0];
          const orderItems = safeArray<CartItem>(lastOrder?.items);
          const firstItem = orderItems[0];
          return (
            <section className="mt-6 px-6 anim-up delay-3">
              <button
                type="button"
                onClick={() => {
                  orderItems.forEach((item) => useCart.getState().add({ ...item }));
                  go({ name: 'cart' });
                }}
                className="group flex w-full items-center gap-4 rounded-[28px] border border-border bg-surface p-4 text-left shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.99]"
              >
                {firstItem?.image ? (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-secondary p-1.5 shadow-card">
                    <img src={firstItem.image} alt="" className="h-full w-full rounded-[16px] object-cover" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-secondary text-primary shadow-card">
                    <RotateCcw className="h-6 w-6" strokeWidth={1.8} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">Order again</p>
                  <h3 className="mt-1 truncate text-[18px] font-semibold tracking-[-0.02em] text-text">
                    {firstItem?.name ?? 'Your last order'}
                    {lastOrder.items.length > 1 ? ` + ${lastOrder.items.length - 1} more` : ''}
                  </h3>
                  <p className="mt-1 text-[13px] text-text-secondary">Re-add everything from your most recent order in one tap.</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-secondary text-primary shadow-card transition group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" strokeWidth={2.1} />
                </span>
              </button>
            </section>
          );
        })()}

        <section className="mt-6 anim-up delay-3">
          <SectionHeader
            title="Featured Products"
            subtitle="Best sellers and fresh arrivals in the BAS collection"
            action={{ label: 'See all', onClick: () => go({ name: 'tabs', tab: 'categories' }) }}
          />
          <div className="mt-4 grid grid-cols-2 gap-4 px-6">
            {featuredProducts.map((product) => (
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
        </section>

        <section className="mt-6 px-6 anim-up delay-4">
          <div className="overflow-hidden rounded-[30px] border border-border bg-surface p-5 shadow-card">
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  For you
                </span>
                <h3 className="mt-3 text-[22px] font-bold tracking-[-0.02em] text-text">Picked for your taste</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">{forYouLabel}</p>
                <button
                  type="button"
                  onClick={() => (forYouProduct ? go({ name: 'product', productId: forYouProduct.id }) : go({ name: 'customize' }))}
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-[18px] bg-primary px-4 text-[13px] font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
                >
                  {forYouProduct ? 'View cake' : 'Customize yours'}
                  <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                </button>
              </div>
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[24px] bg-secondary p-2 shadow-card">
                <img
                  loading="lazy"
                  decoding="async"
                  src={forYouProduct?.image || '/cakes/logo-cake.png'}
                  alt={forYouProduct?.name || ''}
                  className="h-full w-full rounded-[20px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-9 px-6 pb-4 text-center">
          <div className="text-[18px] font-semibold tracking-[-0.02em] text-text">Bake Art Style</div>
          <div className="mt-1 text-[12px] font-medium uppercase tracking-[0.18em] text-text-tertiary">Handcrafted since 2018</div>
        </div>
      </div>

      {activeNotice && (
        <div className="fixed inset-0 z-[145] flex items-center justify-center bg-black/38 p-5 anim-fade" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm overflow-hidden rounded-[30px] border border-border bg-surface p-6 shadow-card-hover anim-scale">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-secondary text-primary shadow-card">
              <Megaphone size={28} strokeWidth={1.75} />
            </div>
            <h3 className="mt-5 text-center text-[22px] font-bold tracking-[-0.02em] text-text">{activeNotice.title}</h3>
            <p className="mt-3 text-center text-[14px] leading-relaxed text-text-secondary">{activeNotice.noticeText}</p>
            <button
              type="button"
              onClick={() => setActiveNotice(null)}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-[18px] bg-primary text-[13px] font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
