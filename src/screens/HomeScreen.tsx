import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Cake, Megaphone, RotateCcw, Search } from 'lucide-react';
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
import { useT } from '../lib/i18n';

const STAGGER_DELAYS = ['delay-1', 'delay-2', 'delay-3', 'delay-4', 'delay-5'];

function ShimmerBlock({ className }: { className: string }) {
  return <span className={`shimmer relative block overflow-hidden ${className}`} aria-hidden="true" />;
}

function HomeProductSkeleton() {
  return (
    <article className="overflow-hidden rounded-[24px] border-[5px] border-white bg-surface shadow-card anim-fade" aria-hidden="true" style={{ height: 260 }}>
      <ShimmerBlock className="h-full w-full rounded-[19px]" />
    </article>
  );
}

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
  const { products, loading: productsLoading } = useProducts();
  const { banners } = useBanners();
  const t = useT();

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

  // Interruptible occasion zoom — cleanup on unmount (Fix 9)
  useEffect(() => {
    if (!pressedOccasion) return;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const t1 = setTimeout(() => {
      const current = useUI.getState().occasionZoom;
      if (current) useUI.getState().setOccasionZoom({ ...current, stage: 'grow' });
    }, GROW_DELAY);
    const t2 = setTimeout(() => {
      const cat = categories.find((c) => c.id === pressedOccasion);
      if (cat) useUI.getState().go({ name: 'tabs', tab: 'categories', categoryId: cat.id });
      const current = useUI.getState().occasionZoom;
      if (current) useUI.getState().setOccasionZoom({ ...current, stage: 'fadeout' });
    }, GROW_DELAY + GROW_DURATION);
    const t3 = setTimeout(() => {
      useUI.getState().setOccasionZoom(null);
      setPressedOccasion(null);
    }, GROW_DELAY + GROW_DURATION + 300);

    timeouts.push(t1, t2, t3);
    return () => { timeouts.forEach(clearTimeout); };
  }, [pressedOccasion]);

  const openOccasion = (category: (typeof categories)[number], button: HTMLButtonElement) => {
    if (pressedOccasion) return;

    // Reduced-motion bypass — skip zoom, navigate directly
    const prefersReducedMotion = typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    if (prefersReducedMotion) {
      go({ name: 'tabs', tab: 'categories', categoryId: category.id });
      return;
    }

    setPressedOccasion(category.id);

    requestAnimationFrame(() => {
      const rect = button.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || rect.width;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || rect.height;
      const { setOccasionZoom } = useUI.getState();
      setOccasionZoom({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        scale: Math.max(viewportWidth / rect.width, viewportHeight / rect.height),
        borderRadius: 22,
        color: category.color,
        stage: 'start',
      });
    });
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
    ? t('home.forYouLastOrder')
    : wishlist.length > 0
      ? t('home.forYouWishlist')
      : t('home.forYouDefault');

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

  const openBanner = (banner: Banner) => {
    if (banner.type === 'notice') {
      setActiveNotice(banner);
      return;
    }
    if (banner.productId) go({ name: 'product', productId: banner.productId });
    else if (banner.link === 'customize') go({ name: 'customize' });
    else if (banner.link === 'categories') go({ name: 'tabs', tab: 'categories' });
    else go({ name: 'product', productId: availableProducts[0]?.id || 'p1' });
  };

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
              title={t('home.exclusiveOffers')}
              subtitle={t('home.exclusiveOffersSub')}
              action={{ label: t('common.seeAll'), onClick: () => go({ name: 'tabs', tab: 'categories' }) }}
            />
            <div className="mt-4 px-6">
              <div className="bas-banner-frame relative h-[190px] overflow-hidden rounded-[24px] p-[5px] shadow-card">
                <div className="relative z-[2] h-full overflow-hidden rounded-[19px] bg-ink">
                  {activeBanners.map((banner, index) => (
                    <button
                      key={banner.id}
                      type="button"
                      onClick={() => openBanner(banner)}
                      aria-label={`Open offer: ${banner.title}`}
                      className={`absolute inset-0 cursor-pointer overflow-hidden transition-opacity duration-700 ${
                        index === bannerIdx ? 'z-10 opacity-100' : 'z-0 opacity-0'
                      }`}
                    >
                      <img
                        src={banner.image}
                        alt={banner.title}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { const i = e.currentTarget as HTMLImageElement; i.onerror = null; i.src = '/cakes/logo-cake.png'; }}
                        className="h-full w-full object-cover transition-transform duration-[5000ms] ease-out"
                        style={index === bannerIdx ? { transform: 'scale(1.05)' } : { transform: 'scale(1)' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {!hasSearch && (
          <section className="mt-6 anim-up delay-2">
            <SectionHeader
              title={t('home.exploreCategories')}
              subtitle={t('home.exploreCategoriesSub')}
              action={{ label: t('common.seeAll'), onClick: () => go({ name: 'tabs', tab: 'categories' }) }}
            />
            <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto px-6 pb-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={(event) => openOccasion(category, event.currentTarget)}
                  className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-secondary pl-2 pr-4 text-left transition duration-200 active:scale-[0.97]"
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: category.color, color: category.fg }}
                  >
                    <OccasionIcon id={category.icon} size={14} />
                  </span>
                  <span className="whitespace-nowrap text-base font-medium text-text">{category.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <OccasionSheet open={occasionSheetOpen} onClose={() => setOccasionSheetOpen(false)} onSelect={(category, button) => openOccasion(category, button)} />

        {!hasSearch && (
          <div className="mt-5 space-y-3 px-6">
            {!user && (
              <div className="anim-up rounded-2xl border border-border bg-surface p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-secondary text-primary shadow-card">
                    <Cake size={22} strokeWidth={1.9} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-card-title font-semibold text-text">{t('home.signinHelperTitle')}</p>
                    <p className="mt-1 text-base leading-relaxed text-text-secondary">{t('home.signinHelperBody')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAuthOpen?.()}
                    className="flex h-11 shrink-0 items-center justify-center rounded-[16px] bg-primary px-4 text-base font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
                  >
                    {t('common.signIn')}
                  </button>
                </div>
              </div>
            )}

            {upcoming && (
              <div className="anim-up rounded-2xl border border-border bg-surface p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-secondary text-primary shadow-card">
                    <Cake size={22} strokeWidth={1.9} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-card-title font-semibold text-text">
                      {upcoming.daysLeft === 0
                      ? t('home.upcomingToday', { name: upcoming.name })
                      : t('home.upcomingInDays', { name: upcoming.name, days: upcoming.daysLeft, plural: upcoming.daysLeft > 1 ? 's' : '' })}
                    </p>
                    <p className="mt-1 text-base leading-relaxed text-text-secondary">{t('home.upcomingBody')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => go({ name: 'tabs', tab: 'categories' })}
                    className="flex h-11 shrink-0 items-center justify-center rounded-[16px] border border-border bg-secondary px-4 text-base font-semibold text-primary shadow-card transition active:scale-95"
                  >
                    {t('common.order')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {searchResults.length > 0 && (
          <section className="mt-6 px-6 anim-up delay-2">
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">{t('home.searchPanelEyebrow')}</p>
                  <h2 className="mt-1 text-section-title font-semibold tracking-[-0.02em] text-text">{t('home.searchPanelTitle', { query: search.trim() })}</h2>
                  <p className="mt-1 text-md text-text-secondary">{t('home.searchPanelBody', { count: searchResults.length })}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go({ name: 'tabs', tab: 'categories' })}
                  className="rounded-full border border-border bg-bg px-3 py-2 text-sm font-semibold text-primary transition active:scale-95"
                >
                  {t('common.seeAll')}
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
              <h2 className="mt-5 text-2xl font-bold tracking-[-0.02em] text-text">{t('home.noResultsTitle', { query: searchTerm })}</h2>
              <p className="mt-2 text-md leading-relaxed text-text-secondary">{t('home.noResultsBody')}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="flex h-12 items-center justify-center rounded-[18px] border border-border bg-bg px-5 text-base font-semibold text-text transition active:scale-95"
                >
                  {t('home.clearSearch')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    go({ name: 'tabs', tab: 'categories' });
                  }}
                  className="flex h-12 items-center justify-center rounded-[18px] bg-primary px-5 text-base font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
                >
                  {t('home.browseAllCakes')}
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
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">{t('home.orderAgain')}</p>
                  <h3 className="mt-1 truncate text-xl font-semibold tracking-[-0.02em] text-text">
                    {firstItem?.name ?? 'Your last order'}
                    {lastOrder.items.length > 1 ? ` + ${lastOrder.items.length - 1} more` : ''}
                  </h3>
                  <p className="mt-1 text-base text-text-secondary">{t('home.orderAgainBody')}</p>
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
            title={t('home.featuredProducts')}
            subtitle={t('home.featuredProductsSub')}
            action={{ label: t('common.seeAll'), onClick: () => go({ name: 'tabs', tab: 'categories' }) }}
          />
          <div className="mt-4 grid grid-cols-2 gap-4 px-6">
            {productsLoading
              ? Array.from({ length: 4 }).map((_, index) => <HomeProductSkeleton key={index} />)
              : featuredProducts.map((product) => (
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
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  {t('home.forYou')}
                </span>
                <h3 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-text">{t('home.pickedForTaste')}</h3>
                <p className="mt-2 text-md leading-relaxed text-text-secondary">{forYouLabel}</p>
                <button
                  type="button"
                  onClick={() => (forYouProduct ? go({ name: 'product', productId: forYouProduct.id }) : go({ name: 'customize' }))}
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-[18px] bg-primary px-4 text-base font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
                >
                  {forYouProduct ? t('common.viewCake') : t('common.customizeYours')}
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
          <div className="text-xl font-semibold tracking-[-0.02em] text-text">Bake Art Style</div>
          <div className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-text-tertiary">{t('home.handcrafted')}</div>
        </div>
      </div>

      {activeNotice && (
        <div className="fixed inset-0 z-[145] flex items-center justify-center bg-black/38 p-5 anim-fade" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm overflow-hidden rounded-[30px] border border-border bg-surface p-6 shadow-card-hover anim-scale">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-secondary text-primary shadow-card">
              <Megaphone size={28} strokeWidth={1.75} />
            </div>
            <h3 className="mt-5 text-center text-2xl font-bold tracking-[-0.02em] text-text">{activeNotice.title}</h3>
            <p className="mt-3 text-center text-md leading-relaxed text-text-secondary">{activeNotice.noticeText}</p>
            <button
              type="button"
              onClick={() => setActiveNotice(null)}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-[18px] bg-primary text-base font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
