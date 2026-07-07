import { useEffect, useState, useMemo } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Megaphone, RefreshCw, Cake, Search } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { useUI, useUser, useOrders, useAuthStore, useCart } from '../lib/store';
import { ls, safeArray } from '../lib/utils';
import { categories } from '../lib/data';
import { useProducts } from '../hooks/useProducts';
import { useBanners } from '../hooks/useBanners';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import BrandLogo from '../components/BrandLogo';
import OccasionIcon from '../components/OccasionIcon';
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

export default function HomeScreen({
  onAuthOpen,
}: {
  onAuthOpen?: () => void;
}) {
  const { go } = useUI();
  const { wishlist, toggleWish } = useUser();
  const { orders } = useOrders();
  const { user } = useAuthStore();
  const { products } = useProducts();
  const { banners } = useBanners();
  const activeBanners = useMemo(() => safeArray(banners).filter((b) => b.active !== false), [banners]);
  const upcoming = getUpcomingDate(user?.id);
  const firstName = user?.name?.split(' ')[0] || 'friend';
  const isNonLatin = /[^\u0000-\u007F]/.test(firstName);

  const [bannerIdx, setBannerIdx] = useState(0);
  const [pressedOccasion, setPressedOccasion] = useState<string | null>(null);
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

  // Zoom-in page transition: the tapped occasion chip's color grows from its
  // on-screen position to fill the viewport, then the Categories tab (filtered
  // to that occasion) fades in underneath and the overlay fades out.
  const GROW_DELAY = 260;
  const GROW_DURATION = 680;
  const openOccasion = (c: (typeof categories)[number], btn: HTMLButtonElement) => {
    if (pressedOccasion) return;
    setPressedOccasion(c.id);
    const rect = btn.getBoundingClientRect();
    const { setOccasionZoom, go } = useUI.getState();

    setOccasionZoom({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      radius: 16,
      color: c.color,
      stage: 'start',
    });

    setTimeout(() => {
      setOccasionZoom({
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        radius: 0,
        color: c.color,
        stage: 'grow',
      });
    }, GROW_DELAY);

    setTimeout(() => {
      go({ name: 'tabs', tab: 'categories', categoryId: c.id });
      setOccasionZoom({
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        radius: 0,
        color: c.color,
        stage: 'fadeout',
      });
    }, GROW_DELAY + GROW_DURATION);

    setTimeout(() => {
      setOccasionZoom(null);
      setPressedOccasion(null);
    }, GROW_DELAY + GROW_DURATION + 300);
  };

  const trending = useMemo(
    () =>
      safeArray(products)
        .filter((p) => (p.approved ?? true) && (p.inStock ?? true) && (p.bestseller || p.newArrival))
        .slice(0, 8),
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

  const forYouLabel = orders.length > 0
    ? 'Based on your last order'
    : wishlist.length > 0
      ? 'From your wishlist'
      : 'Trending this week';

  const searchResults = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return [];
    return safeArray(products)
      .filter((p) => (p.approved ?? true) && (p.inStock ?? true))
      .filter((p) => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q))
      .slice(0, 8);
  }, [products, debouncedSearch]);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return safeArray(products)
      .filter((p) => (p.approved ?? true) && p.name.toLowerCase().includes(q))
      .map((p) => p.name)
      .slice(0, 5);
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
        <div className="relative px-5 pb-6 pt-1 anim-up">
          <div className="mesh-warm pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-b-[32px]">
            <span
              aria-hidden="true"
              className="font-brand absolute -right-5 top-5 select-none whitespace-nowrap text-[58px] leading-none text-coral/[0.09] rotate-[-6deg]"
            >
              Bake Art Style
            </span>
          </div>

          <div className="relative text-[12px] font-medium uppercase tracking-[0.2em] text-ink-200">
            {user ? (isNonLatin ? 'Welcome back!' : `Welcome back, ${firstName}`) : 'Welcome to Bake Art Style'}
          </div>

          <h1 className="relative mt-1 font-display text-[24px] font-bold leading-[1.1] tracking-tight text-ink">
            What cake are we
            <br />
            <span className="text-gradient-coral">celebrating today?</span>
          </h1>
          <div className="relative mt-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              onSearch={saveSearch}
              suggestions={suggestions}
              recentSearches={recentSearches}
              onClearRecent={clearRecent}
            />
          </div>
        </div>

        <div className="no-scrollbar -mt-1 flex gap-3 overflow-x-auto px-5 pb-1 anim-up delay-1">
          {categories.map((c) => {
            const active = pressedOccasion === c.id;
            return (
              <button
                key={c.id}
                onClick={(e) => openOccasion(c, e.currentTarget)}
                className="flex flex-shrink-0 flex-col items-center gap-1.5"
              >
                <div
                  className="flex items-center justify-center rounded-2xl transition-transform duration-300"
                  style={{
                    width: 52,
                    height: 52,
                    background: c.color,
                    transform: active ? 'translate3d(0,-4px,0) scale(.92)' : 'translate3d(0,0,0)',
                    transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)',
                  }}
                >
                  <OccasionIcon
                    id={c.id}
                    size={22}
                    className="transition-all duration-300"
                    style={{
                      color: c.fg,
                      filter: active ? `drop-shadow(0 4px 8px ${c.fg}73)` : 'none',
                      transform: active ? 'scale(1.08)' : 'scale(1)',
                      transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)',
                    }}
                  />
                </div>
                <span
                  className="text-[10px] font-semibold transition-colors duration-200"
                  style={{ color: c.fg }}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>

        {!user && (
          <div
            className="mx-5 mb-3 flex items-center gap-3 rounded-2xl border border-white/40 glass-strong px-4 py-3 anim-up"
            style={{ boxShadow: '0 2px 8px -4px rgba(26,19,17,.1)' }}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blush-100">
              <Cake size={20} className="text-coral" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-bold text-ink">Save wishlist &amp; track orders</div>
              <div className="text-[11px] text-ink/60">Sign in for personalized picks</div>
            </div>
            <button
              onClick={onAuthOpen}
              className="flex-shrink-0 rounded-xl bg-coral px-3 py-1.5 text-[11px] font-bold text-white"
            >
              Sign in
            </button>
          </div>
        )}

        {upcoming && (
          <div
            className="mx-5 mb-3 flex items-center gap-3 rounded-2xl glass-strong px-4 py-3 anim-up"
            style={{ boxShadow: '0 2px 8px -4px rgba(242,94,115,.2)' }}
          >
            <Cake size={22} className="flex-shrink-0 text-coral" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-bold text-ink">
                {upcoming.name} {upcoming.daysLeft === 0 ? 'is today!' : `in ${upcoming.daysLeft} day${upcoming.daysLeft > 1 ? 's' : ''}!`}
              </div>
              <div className="text-[11px] text-ink/60">Order a special cake now</div>
            </div>
            <button
              onClick={() => go({ name: 'tabs', tab: 'categories' })}
              className="flex-shrink-0 rounded-xl bg-coral px-3 py-1.5 text-[11px] font-bold text-white"
            >
              Order
            </button>
          </div>
        )}

        {!search.trim() && activeBanners.length > 0 && (
          <div className="mt-5 px-5 anim-up delay-1">
            <div
              className="relative overflow-hidden rounded-[28px] bg-white"
              style={{ boxShadow: '0 1px 2px rgba(26,19,17,.03), 0 18px 50px -28px rgba(26,19,17,.18)' }}
            >
              {/* Wax-seal signature badge — purely decorative */}
              <div
                className="pointer-events-none absolute top-3 right-3 z-30 flex h-9 w-9 flex-col items-center justify-center rounded-full text-center leading-none text-white"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #FF8EA3, #E8526A 55%, #B02D44)',
                  boxShadow: '0 3px 10px -2px rgba(176,45,68,.55), inset 0 1px 1px rgba(255,255,255,.35)',
                }}
              >
                <span className="text-[6px] font-bold tracking-wide">EST.</span>
                <span className="text-[8px] font-extrabold tracking-tight">2018</span>
              </div>

              <div className="relative aspect-[2.5/1] w-full overflow-hidden">
                {activeBanners.map((b, i) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      if (b.productId) {
                        go({ name: 'product', productId: b.productId });
                      } else if (b.link === 'customize') {
                        go({ name: 'customize' });
                      } else if (b.link === 'categories') {
                        go({ name: 'tabs', tab: 'categories' });
                      }
                    }}
                    className={`absolute inset-0 cursor-pointer transition-opacity duration-700 ${
                      i === bannerIdx ? 'z-10 opacity-100' : 'z-0 opacity-0'
                    }`}
                  >
                    <img
                      src={b.image}
                      alt={b.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                    {b.ctaText && (
                      <div className="absolute bottom-4 left-4 z-20">
                        <span className="rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-bold text-ink backdrop-blur-sm">
                          {b.ctaText} →
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col justify-end p-5">
                      <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                        <Sparkles className="h-2.5 w-2.5" /> {b.tag}
                      </span>
                      <h3 className="font-display text-[19px] font-bold leading-tight tracking-tight text-white">
                        {b.title}
                      </h3>
                      <p className="mt-1 text-[12.5px] leading-snug text-white/85">{b.subtitle}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (b.type === 'discount') {
                            if (b.promoCode) {
                              navigator.clipboard?.writeText(b.promoCode);
                              setCopiedId(b.id);
                              setTimeout(() => setCopiedId(null), 1500);
                            }
                          } else if (b.type === 'notice') {
                            setActiveNotice(b);
                          } else if (b.productId) {
                            go({ name: 'product', productId: b.productId });
                          } else if (b.link === 'customize') {
                            go({ name: 'customize' });
                          } else if (b.link === 'categories') {
                            go({ name: 'tabs', tab: 'categories' });
                          } else {
                            go({ name: 'product', productId: safeArray(products)[0]?.id || 'p1' });
                          }
                        }}
                        className="mt-3.5 inline-flex h-10 w-fit items-center gap-1.5 rounded-full bg-white px-4 text-[12.5px] font-bold text-ink shadow transition active:scale-95"
                      >
                        {b.type === 'discount' ? (
                          copiedId === b.id ? 'Copied!' : `Copy: ${b.promoCode || 'CODE'}`
                        ) : (
                          <>
                            {b.tag || 'Order now'}
                            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setBannerIdx((i) => (i - 1 + activeBanners.length) % activeBanners.length)}
                  className="absolute top-1/2 left-3 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur transition active:scale-95 md:flex"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => setBannerIdx((i) => (i + 1) % activeBanners.length)}
                  className="absolute top-1/2 right-3 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur transition active:scale-95 md:flex"
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                </button>

                <div className="absolute right-0 bottom-3 left-0 z-20 flex justify-center gap-1.5">
                  {activeBanners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setBannerIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === bannerIdx ? 'w-6 bg-white shadow' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-6 anim-up delay-2">
            <SectionHeader
              eyebrow="Search"
              title={`Results for "${search.trim()}"`}
              action={{ label: 'See all', onClick: () => go({ name: 'tabs', tab: 'categories' }) }}
            />
            <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
              {searchResults.map((p, i) => (
                <div key={p.id} className={`anim-up flex-shrink-0 ${STAGGER_DELAYS[i % STAGGER_DELAYS.length]}`}>
                  <ProductCard
                    product={p}
                    wished={wishlist.includes(p.id)}
                    onWish={toggleWish}
                    onOpen={() => go({ name: 'product', productId: p.id })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {debouncedSearch.trim() && searchResults.length === 0 && (
          <div
            className="mx-5 mt-4 flex flex-col items-center rounded-2xl glass-strong py-8 text-center anim-up"
            style={{ boxShadow: '0 1px 2px rgba(26,19,17,.02), 0 8px 24px -16px rgba(26,19,17,.14)' }}
          >
            <Search className="h-8 w-8 text-ink-200 opacity-50" strokeWidth={1.5} />
            <p className="mt-2 text-[14px] font-medium text-ink">No results for "{debouncedSearch.trim()}"</p>
            <p className="text-[12px] text-ink-200">Try a different name or browse by occasion</p>
            <button
              onClick={() => {
                setSearch('');
                go({ name: 'tabs', tab: 'categories' });
              }}
              className="mt-3 rounded-xl bg-coral px-4 py-1.5 text-[12px] font-bold text-white"
            >
              Browse all cakes
            </button>
          </div>
        )}

        {orders.length > 0 &&
          (() => {
            const lastOrder = orders[0];
            const firstItem = safeArray(lastOrder?.items)[0];
            return (
              <div className="mt-5 px-5 anim-up delay-2">
                <button
                  onClick={() => {
                    safeArray(lastOrder.items).forEach((item) => useCart.getState().add({ ...item }));
                    go({ name: 'cart' });
                  }}
                  className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/40 glass-strong p-3.5 pt-4 text-left transition active:scale-[.98]"
                  style={{ boxShadow: '0 1px 2px rgba(26,19,17,.02), 0 8px 24px -18px rgba(26,19,17,.18)' }}
                >
                  {/* Ticket-stub accent strip */}
                  <div
                    className="absolute inset-x-0 top-0 h-[3px]"
                    style={{ background: 'linear-gradient(90deg, #C8944A, #6E2A45)' }}
                  />
                  {/* Perforation notches (page-bg cutout circles) */}
                  <div
                    className="absolute top-0 -left-1.5 h-3.5 w-3.5 rounded-full"
                    style={{ background: 'var(--color-cream)' }}
                  />
                  <div
                    className="absolute top-0 -right-1.5 h-3.5 w-3.5 rounded-full"
                    style={{ background: 'var(--color-cream)' }}
                  />
                  {firstItem?.image ? (
                    <img src={firstItem.image} alt="" className="h-11 w-11 flex-shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-ink-50">
                      <RefreshCw className="h-5 w-5 text-ink" strokeWidth={1.75} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-ink">{firstItem?.name ?? 'Order again'}</div>
                    <div className="text-[11.5px] text-ink-200">
                      {lastOrder.items.length > 1 ? `+ ${lastOrder.items.length - 1} more · Tap to reorder` : 'Tap to reorder'}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-ink-200 transition group-hover:translate-x-0.5" />
                </button>
              </div>
            );
          })()}

        <div className="mt-7 anim-up delay-3">
          <SectionHeader
            eyebrow="Trending now"
            title="Popular this week"
            action={{ label: 'See all', onClick: () => go({ name: 'tabs', tab: 'categories' }) }}
          />
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
            {trending.map((p, i) => (
              <div key={p.id} className={`anim-up flex-shrink-0 ${STAGGER_DELAYS[i % STAGGER_DELAYS.length]}`}>
                <ProductCard
                  product={p}
                  wished={wishlist.includes(p.id)}
                  onWish={toggleWish}
                  onOpen={() => go({ name: 'product', productId: p.id })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 px-5 anim-up delay-4">
          <div
            className="relative overflow-hidden rounded-[28px] p-5"
            style={{
              background: 'linear-gradient(135deg, #FFF4F6 0%, #FFE4E9 60%, #FFF9EC 100%)',
              boxShadow: '0 1px 2px rgba(26,19,17,.03), 0 18px 50px -28px rgba(232,82,106,.22)',
              border: '1px solid rgba(232,82,106,0.12)',
            }}
          >
            <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-coral/10 blur-2xl" />
            <div className="absolute bottom-0 -left-8 h-28 w-28 rounded-full bg-gold/12 blur-2xl" />

            <div className="relative flex items-center gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1 rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-coral">
                  <Sparkles className="h-2.5 w-2.5" /> For you
                </div>
                <h3 className="mt-2 font-display text-[20px] font-bold leading-tight tracking-tight text-ink">
                  Picked for your taste
                </h3>
                <p className="mt-1 text-[12px] text-ink-200">{forYouLabel}</p>
                <button
                  onClick={() =>
                    forYouProduct ? go({ name: 'product', productId: forYouProduct.id }) : go({ name: 'customize' })
                  }
                  className="mt-3.5 inline-flex h-9 items-center gap-1.5 rounded-full bg-coral px-3.5 text-[12px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(242,94,115,.55)] transition active:scale-95"
                >
                  {forYouProduct ? 'View cake' : 'Customize yours'} <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                </button>
              </div>
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl shadow-lg">
                <img
                  loading="lazy"
                  decoding="async"
                  src={forYouProduct?.image || '/cakes/logo-cake.png'}
                  alt={forYouProduct?.name || ''}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 px-5 pb-3">
          <div className="flex items-center justify-center gap-2 rounded-2xl glass-subtle py-3 text-ink-200">
            <BrandLogo size={20} />
            <span className="text-[11.5px] font-medium uppercase tracking-wider">
              Handcrafted since 2018
            </span>
          </div>
        </div>
      </div>

      {activeNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm anim-fade">
          <div
            className="w-full max-w-sm overflow-hidden rounded-[28px] glass-strong p-6 shadow-2xl anim-scale"
            style={{ boxShadow: '0 20px 60px -10px rgba(0,0,0,0.15)' }}
          >
            <div className="flex justify-center text-ink">
              <Megaphone size={40} strokeWidth={1.5} />
            </div>
            <h3 className="mt-4 font-display text-[20px] font-bold tracking-tight text-ink">
              {activeNotice.title}
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-200">{activeNotice.noticeText}</p>
            <button
              onClick={() => setActiveNotice(null)}
              className="btn-primary mt-6 flex h-11 w-full items-center justify-center rounded-2xl text-[13px] font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
