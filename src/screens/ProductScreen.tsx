import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Heart, Star, ShoppingBag, Check, Share2, Sparkles, Cake, Pencil, CheckCircle2, Camera, X, AlertTriangle, Bell, Eye, Clock, ChevronLeft, ChevronRight, Plus, Minus, Flame, MessageSquare, Gift, UtensilsCrossed, Phone } from 'lucide-react';
import { useUI, formatINR, useCart, useUser, useAuthStore, useSettingsStore } from '../lib/store';
import { useProducts } from '../hooks/useProducts';
import { useReviews } from '../hooks/useReviews';

import { ls, safeArray, servingFor, servingForPounds, formatWeight } from '../lib/utils';
import type { Product, Review } from '../types';

// Small reusable component for description Read more
function DescriptionWithReadMore({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const shouldClamp = text.length > 140;

  return (
    <div className="mt-4">
      <p className={`text-[13.5px] leading-relaxed text-ink-300 ${!expanded && shouldClamp ? 'line-clamp-3' : ''}`}>
        {text}
      </p>
      {shouldClamp && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-[12.5px] font-bold text-coral"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

const ADDONS = [
  { id: 'candles', name: 'Birthday candles', price: 20, icon: Flame },
  { id: 'message', name: 'Custom message', price: 50, icon: MessageSquare },
  { id: 'card', name: 'Greeting card', price: 30, icon: Gift },
  { id: 'knife', name: 'Cake knife set', price: 80, icon: UtensilsCrossed },
];

const WEIGHT_PRESETS = ['0.5', '1', '1.5', '2'];

export default function ProductScreen() {
  const { view, back, go } = useUI();
  const { add } = useCart();
  const { wishlist, toggleWish } = useUser();
  const { products } = useProducts();
  const { settings } = useSettingsStore();

  const typedProducts = products as Product[];
  const product = view.name === 'product' ? typedProducts.find((p) => p.id === view.productId) : null;
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [heartKey, setHeartKey] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const lbTouchStart = useRef({ x: 0, y: 0 });

  // Swipe gesture refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<string[]>([]);
  const activeIndexRef = useRef(0);

  // Native touch listener — re-attaches once heroRef actually has an element.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const onMove = (e: TouchEvent) => {
      if (galleryRef.current.length <= 1) return;
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        e.preventDefault();
      }
    };

    const onEnd = (e: TouchEvent) => {
      const imgs = galleryRef.current;
      if (imgs.length <= 1) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const idx = activeIndexRef.current;
        if (dx < 0) {
          setActiveImg(imgs[Math.min(idx + 1, imgs.length - 1)]);
        } else {
          setActiveImg(imgs[Math.max(idx - 1, 0)]);
        }
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
    };
  }, [product?.id]);

  const handleWish = () => {
    setHeartKey(k => k + 1);
    if (product) toggleWish(product.id);
  };

  // Reviews state
  const { reviews: rawReviews, saveReview, uploadReviewImage, avgRating } = useReviews(product?.id);
  const reviews = rawReviews as Review[];
  const { user } = useAuthStore();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const [reviewImagePreview, setReviewImagePreview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleSubmitReview = async () => {
    if (!product || !reviewComment.trim() || submittingReview) return;
    setSubmittingReview(true);
    try {
      let imageUrl = '';
      if (reviewImageFile) {
        imageUrl = await uploadReviewImage(reviewImageFile);
      }
      if (!user?.id) return;
      const review: Review = {
        id: `r-${Date.now()}`,
        product_id: product.id,
        user_id: user.id,
        user_name: user.name || 'Anonymous',
        rating: reviewRating,
        comment: reviewComment.trim(),
        image: imageUrl || undefined,
        approved: false,
        created_at: new Date().toISOString(),
      };
      await saveReview(review);
      setReviewSuccess(true);
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
      setReviewImageFile(null);
      setReviewImagePreview('');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    setActiveImg(null);
  }, [view.name === 'product' ? view.productId : '']);

  const currentImg = activeImg || product?.image || '';
  const galleryImages = product ? [product.image, ...safeArray<string>(product.gallery)] : [];
  const activeIndex = galleryImages.indexOf(currentImg);

  useEffect(() => {
    if (!lightboxOpen) setLightboxZoomed(false);
  }, [lightboxOpen]);
  useEffect(() => {
    setLightboxZoomed(false);
  }, [currentImg]);
  galleryRef.current = galleryImages;
  activeIndexRef.current = activeIndex;

  const productWeights = safeArray<{ size: string; price: number }>(product?.weights);
  const productFlavors = safeArray<string>(product?.flavors);
  const safeWeights = productWeights.length ? productWeights : [{ size: '1 lb', price: product?.price ?? 0 }];
  const safeFlavors = productFlavors.length ? productFlavors : ['Chocolate'];

  const [size, setSize] = useState(safeWeights[1]?.size ?? safeWeights[0]?.size);
  const [selectedFlavor, setSelectedFlavor] = useState(safeFlavors[0]);
  const [addons, setAddons] = useState<Record<string, boolean>>({});
  const [cakeMessage, setCakeMessage] = useState('');
  const [customWeight, setCustomWeight] = useState('1');
  const [weightError, setWeightError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    setSize(safeWeights[1]?.size ?? safeWeights[0]?.size);
    setSelectedFlavor(safeFlavors[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (view.name !== 'product') return null;

  if (!product) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center bg-bg">
        <div className="flex justify-center text-coral opacity-60">
          <Cake size={48} strokeWidth={1.5} />
        </div>
        <h2 className="mt-4 font-sans text-[20px] font-bold text-ink">Cake not found</h2>
        <p className="mt-1 text-[12px] text-ink-300">This item may have been removed.</p>
        <button onClick={back} className="btn-primary mt-5 h-12 rounded-full px-6 text-[13px] font-bold shadow-btn">
          Go back
        </button>
      </div>
    );
  }

  const wished = wishlist.includes(product.id);

  const realReviewCount = reviews.length;
  const displayRating = realReviewCount > 0 ? avgRating : Number(product.rating ?? 0);
  const displayReviewCount = realReviewCount > 0 ? realReviewCount : Number(product.reviews ?? 0);

  const selectedWeight = safeWeights.find((w) => w.size === size);
  const addonsCost = ADDONS.reduce((s, a) => s + (addons[a.id] ? a.price : 0), 0);
  const selectedAddons = ADDONS.filter((a) => addons[a.id]).map((a) => a.name);

  const weightPrice = product.pricePerUnit && customWeight && +customWeight > 0
    ? +customWeight * product.pricePerUnit
    : 0;
  const base = product.pricePerUnit
    ? weightPrice
    : (product.price + (selectedWeight?.price ?? 0));
  const total = base + addonsCost;

  const handleAdd = () => {
    if (product.pricePerUnit) {
      const w = parseFloat(customWeight);
      if (!customWeight || isNaN(w) || w <= 0) {
        setWeightError('Please enter a valid weight');
        return;
      }
      setWeightError('');
      add({
        productId: product.id,
        name: product.name,
        image: product.image,
        size: `${customWeight} ${product.priceUnit ?? 'lb'}`,
        flavor: selectedFlavor,
        topping: selectedAddons.length ? selectedAddons.join(', ') : undefined,
        message: cakeMessage || undefined,
        price: total,
        quantity,
      });
    } else {
      add({
        productId: product.id,
        name: product.name,
        image: product.image,
        size,
        flavor: selectedFlavor,
        topping: selectedAddons.length ? selectedAddons.join(', ') : undefined,
        message: cakeMessage || undefined,
        price: total,
        quantity,
      });
    }
    go({ name: 'cart' });
  };

  return (
    <div className="relative flex h-full flex-col bg-bg">
      {/* ONE scrollable area */}
      <div className="no-scrollbar relative flex-1 overflow-y-auto pb-32">
        {/* Hero image */}
        <div
          ref={heroRef}
          onClick={() => setLightboxOpen(true)}
          className="relative w-full bg-secondary overflow-hidden"
          style={{ aspectRatio: '4/4.6' }}
        >
          <img
            loading="lazy"
            decoding="async"
            src={currentImg}
            alt={product.name}
            className="h-full w-full object-cover select-none"
            style={{ display: 'block', pointerEvents: 'none' }}
          />


          {/* Tier badge */}
          {product.tier && product.tier !== 'normal' && (
            <div
              className={`absolute left-4 top-[74px] z-10 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white ${
                product.tier === 'premium'
                  ? 'bg-gold'
                  : 'bg-ink'
              }`}
              style={{
                boxShadow:
                  product.tier === 'premium'
                    ? '0 6px 16px -4px rgba(217,155,20,0.55), 0 2px 6px -1px rgba(217,155,20,0.35), inset 0 1px 0 rgba(255,255,255,0.35)'
                    : '0 6px 16px -4px rgba(26,19,17,0.35)',
              }}
            >
              {product.tier === 'premium' ? (
                <>
                  <Star className="h-3 w-3 fill-current" strokeWidth={0} /> Premium
                </>
              ) : (
                <>
                  <Pencil className="h-3 w-3" strokeWidth={2.5} /> Custom Order
                </>
              )}
            </div>
          )}

          {product.inStock === false && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-b-[32px]">
              <span className="rounded-full bg-surface shadow-card px-4 py-2 text-[13px] font-bold text-ink">Out of Stock</span>
            </div>
          )}

          {/* Pagination dots */}
          {galleryImages.length > 1 && (
            <div className="absolute right-0 bottom-20 left-0 flex justify-center gap-1.5 pointer-events-none">
              {galleryImages.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex ? 'w-5 bg-coral' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content sheet below image — redesigned to be a solid premium card with soft shadow */}
        <div className="bg-surface rounded-t-[28px] -mt-16 relative z-10 px-5 pt-6 border-t border-border shadow-card">
          {/* Gallery Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-4 pt-1 scrollbar-hide">
              {galleryImages.map((url, i) => {
                const isActive = currentImg === url;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveImg(url)}
                    className={`flex-shrink-0 w-14 h-14 rounded-2xl overflow-hidden transition-all duration-200 ${
                      isActive ? '-translate-y-1 ring-2 ring-coral ring-offset-2 ring-offset-white' : 'opacity-80'
                    }`}
                    style={{
                      boxShadow: isActive
                        ? '0 10px 20px -8px rgba(246,95,143,0.25), 0 2px 6px -2px rgba(246,95,143,0.12)'
                        : '0 2px 8px -4px rgba(246,95,143,0.18)',
                    }}
                  >
                    <img loading="lazy" decoding="async" src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="flex-1 font-sans text-[22px] font-bold leading-[1.2] tracking-tight text-ink">
              {product.name}
            </h1>
          </div>

          {/* Rating + meta */}
          <div className="mt-3.5 flex items-center gap-2 text-[12.5px]">
            <div className="flex items-center gap-0.5 text-gold" style={{ filter: 'drop-shadow(0 1px 3px rgba(232,163,60,0.3))' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.round(Number(displayRating)) ? 'fill-current' : 'opacity-30'}`}
                  strokeWidth={0}
                />
              ))}
            </div>
            <span className="font-bold text-ink">{Number(displayRating).toFixed(1)}</span>
            <span className="text-ink-300 font-medium">
              {displayReviewCount > 0
                ? `(${Number(displayReviewCount).toLocaleString()} রিভিউ)`
                : 'নতুন — এখনো রিভিউ নেই'}
            </span>
          </div>

          {/* Social proof strip */}
          {(product.soldCount || product.viewCount || product.lowStock || product.stockCount) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {product.soldCount && product.soldCount > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
                  <ShoppingBag className="h-3 w-3 text-coral" strokeWidth={2.2} />
                  <span className="text-[11px] font-bold text-coral-700">
                    {product.soldCount >= 1000
                      ? `${(product.soldCount / 1000).toFixed(1)}k+`
                      : `${product.soldCount}+`} বিক্রি
                  </span>
                </div>
              )}
              {product.viewCount && product.viewCount > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
                  <Eye className="h-3 w-3 text-coral" strokeWidth={2.2} />
                  <span className="text-[11px] font-bold text-coral-700">
                    {product.viewCount} জন দেখছে
                  </span>
                </div>
              )}
              {product.inStock !== false && (product.lowStock || (product.stockCount !== undefined && product.stockCount <= 5)) && (
                <div className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                  <span className="text-[11px] font-bold text-red-500">
                    {product.stockCount ? `মাত্র ${product.stockCount}টি বাকি!` : 'মাত্র কয়েকটি বাকি!'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-sans text-[28px] font-bold leading-none text-coral tabular">
              {formatINR(base)}
            </span>
            {product.oldPrice && (
              <span className="text-[14px] text-ink-300 line-through font-medium">
                {formatINR(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Description */}
          <DescriptionWithReadMore text={product.description} />

          {settings?.deliveryEstimate && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5">
              <Clock className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
              <p className="text-[11.5px] font-bold text-emerald-700">
                আজ অর্ডার করলে {settings.deliveryEstimate} এর মধ্যে পৌঁছাবে
              </p>
            </div>
          )}

          {/* Bake Art Style brand card — redesigned with soft-pink palette */}
          <div className="mt-5 flex items-center justify-between rounded-[20px] border border-border bg-surface px-4 py-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xl font-bold text-coral">
                🍞
              </div>
              <div>
                <div className="font-bold text-ink text-[14px]">Bake Art Style</div>
                <div className="text-[11px] text-ink-300 font-medium">Official Bakery • Since 2018</div>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`https://wa.me/${settings?.whatsappNumber?.replace(/\D/g, '') || '8801XXXXXXXXX'}?text=Hi%20Bake%20Art%20Style`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 active:scale-95 transition shadow-sm border border-emerald-100"
              >
                <MessageSquare size={16} />
              </a>
              <a
                href={`tel:${settings?.whatsappNumber || '+8801XXXXXXXXX'}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-coral active:scale-95 transition shadow-sm border border-coral-100"
              >
                <Phone size={16} />
              </a>
            </div>
          </div>

          {/* Flavor selector */}
          {safeFlavors.length > 1 && (
            <section className="mt-7">
              <h3 className="font-sans text-[15px] font-bold tracking-tight text-ink">Flavor</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {safeFlavors.map((f) => {
                  const active = selectedFlavor === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setSelectedFlavor(f)}
                      className={`min-h-[42px] rounded-full border px-4 py-2 text-[13px] font-bold transition active:scale-95 ${
                        active
                          ? 'border-coral bg-coral text-white shadow-btn'
                          : 'border-border bg-surface text-ink hover:border-coral-300'
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Size selector */}
          <section className="mt-7">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-[15px] font-bold tracking-tight text-ink">Select Weight</h3>
              <span className="text-[12.5px] font-bold text-coral">
                {product.pricePerUnit
                  ? (customWeight && +customWeight > 0 && servingForPounds(+customWeight)
                      ? `≈ ${servingForPounds(+customWeight)} Servings`
                      : 'Weight based')
                  : (servingFor(size) ? `≈ ${servingFor(size)} Servings` : '')}
              </span>
            </div>
            {product.pricePerUnit ? (
              /* Dynamic weight-based pricing */
              <div className="mt-3">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {WEIGHT_PRESETS.map((w) => {
                    const active = customWeight === w;
                    const unitWord = product.priceUnit === 'kg' ? 'kg' : 'lb';
                    return (
                      <button
                        key={w}
                        onClick={() => { setCustomWeight(w); setWeightError(''); }}
                        className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-sm font-bold transition active:scale-95 ${
                          active
                            ? 'border-coral bg-coral text-white shadow-btn'
                            : 'border-border bg-surface text-ink hover:border-coral-300'
                        }`}
                      >
                        {w} {unitWord}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="number"
                    min="0.25"
                    step="0.25"
                    placeholder={`Custom weight (${product.priceUnit === 'kg' ? 'kg' : 'lb'})`}
                    className="flex-1 min-h-[44px] px-4 py-2.5 rounded-2xl border border-border bg-surface text-sm font-bold text-ink focus:border-coral focus:ring-2 focus:ring-coral/15 focus:outline-none transition shadow-sm"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(e.target.value)}
                  />
                  <span className="text-sm font-bold text-ink-300">{product.priceUnit === 'kg' ? 'kg' : 'lb'}</span>
                </div>

                {weightError && (
                  <div className="mt-1.5 text-[12.5px] text-error font-semibold">{weightError}</div>
                )}
                {customWeight && +customWeight > 0 && (
                  <div className="mt-2.5 rounded-xl bg-secondary/30 border border-coral-100 px-3.5 py-2 flex items-center justify-between">
                    <span className="text-[12.5px] text-coral-800 font-medium">{customWeight} {product.priceUnit === 'kg' ? 'kg' : 'lb'} × ৳{product.pricePerUnit}</span>
                    <span className="font-sans text-base font-bold text-coral">৳{(+customWeight * (product.pricePerUnit ?? 0)).toLocaleString()}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Static weight selector */
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {safeWeights.map((w) => {
                  const fullPrice = product.price + w.price;
                  const active = size === w.size;
                  return (
                    <button
                      key={w.size}
                      onClick={() => setSize(w.size)}
                      className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-sm font-bold transition active:scale-95 whitespace-nowrap ${
                        active
                          ? 'border-coral bg-coral text-white shadow-btn'
                          : 'border-border bg-surface text-ink hover:border-coral-300'
                      }`}
                    >
                      {formatWeight(w.size)} · {formatINR(fullPrice)}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Add-ons */}
          <section className="mt-7">
            <h3 className="font-sans text-[15px] font-bold tracking-tight text-ink">Add-ons</h3>
            <div className="mt-3 space-y-2">
              {ADDONS.map((a) => {
                const active = !!addons[a.id];
                const Icon = a.icon;
                return (
                  <button
                    key={a.id}
                    onClick={() => setAddons((s) => ({ ...s, [a.id]: !s[a.id] }))}
                    className={`flex min-h-[56px] w-full items-center gap-3 rounded-[20px] border border-border bg-surface p-3 text-left transition active:scale-[.99] shadow-sm ${
                      active ? 'ring-2 ring-coral/40 bg-secondary/30 border-coral/30' : ''
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition ${
                        active ? 'bg-secondary text-coral' : 'bg-secondary/40 text-ink-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <span className="flex-1 text-[14.5px] font-bold text-ink">{a.name}</span>
                    <span className="text-[14px] font-extrabold text-ink tabular">
                      {formatINR(a.price)}
                    </span>
                    <div
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border transition ${
                        active ? 'border-coral bg-coral' : 'border-border bg-white'
                      }`}
                    >
                      {active && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
            {addons['message'] && (
              <div className="mt-3.5 overflow-hidden rounded-[20px] border border-border bg-surface p-3.5 shadow-sm">
                <textarea
                  maxLength={40}
                  rows={2}
                  value={cakeMessage}
                  onChange={(e) => setCakeMessage(e.target.value)}
                  placeholder="যেমন: শুভ জন্মদিন আম্মু"
                  className="w-full resize-none rounded-2xl border border-border bg-coral-50/20 px-4 py-3 text-[13px] text-ink outline-none placeholder:text-ink-200 focus:border-coral focus:ring-2 focus:ring-coral/15 transition"
                />
                <div className="mt-2 flex items-center justify-between text-[11px] text-ink-300 font-medium">
                  <span>কেকের উপরে লেখা হবে</span>
                  <span className="tabular">{cakeMessage.length}/40</span>
                </div>
              </div>
            )}
          </section>

          {/* Customise CTA */}
          <button
            onClick={() => go({ name: 'customize', productId: product.id })}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-coral-200 bg-secondary/20 py-3.5 text-[13.5px] font-bold text-coral transition active:scale-[.98] hover:bg-secondary/35 shadow-sm"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            Fully customize this cake
          </button>
        </div>

        {/* Reviews Section inside scroll container */}
        <section className="px-5 mt-7 pb-4">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="font-sans text-[17px] font-bold text-ink">রিভিউ</h2>
            {!showReviewForm && (
              <div className="flex gap-2">
                <button
                  onClick={() => go({ name: 'reviews' })}
                  className="rounded-xl border border-border bg-surface shadow-sm px-3.5 py-2 text-[11.5px] font-bold text-coral transition active:scale-95"
                >
                  সব রিভিউ দেখুন
                </button>
                <button
                  onClick={() => user && go({ name: 'write-review', productId: product.id })}
                  disabled={!user}
                  className="rounded-xl border border-border bg-surface shadow-sm px-3.5 py-2 text-[11.5px] font-bold text-coral transition active:scale-95 disabled:opacity-50"
                >
                  {user ? '+ রিভিউ লিখুন' : 'রিভিউ দিতে সাইন ইন করুন'}
                </button>
              </div>
            )}
          </div>

          {/* Success message */}
          {reviewSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-[12px] text-emerald-700 font-semibold shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              রিভিউ যুক্ত হয়েছে, ধন্যবাদ! 🎉
            </div>
          )}

          {/* Review form */}
          {showReviewForm && (
            <div className="mb-4 rounded-[20px] border border-border bg-surface p-4 shadow-card space-y-3">
              <div>
                <div className="text-[11px] font-bold text-ink-300 uppercase tracking-wide mb-1">রেটিং</div>
                <div className="flex gap-1.5">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} onClick={() => setReviewRating(s)}>
                      <Star className={`h-7 w-7 ${s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-ink/15'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="আপনার অভিজ্ঞতা লিখুন... স্বাদ, ডিজাইন, ডেলিভারি কেমন ছিল?"
                rows={3}
                maxLength={500}
                className="w-full resize-none rounded-2xl border border-border bg-coral-50/20 px-4 py-3 text-[13px] text-ink placeholder:text-ink-200 focus:border-coral focus:ring-2 focus:ring-coral/15 focus:outline-none transition"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
              <div>
                <div className="text-[11.5px] font-bold text-ink-300 uppercase tracking-wide mb-1.5">ছবি যোগ করুন (ঐচ্ছিক)</div>
                {reviewImagePreview ? (
                  <div className="relative w-20 h-20">
                    <img loading="lazy" decoding="async" src={reviewImagePreview} alt="" className="w-20 h-20 rounded-xl object-cover" />
                    <button
                      onClick={() => { setReviewImageFile(null); setReviewImagePreview(''); }}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-ink text-white flex items-center justify-center shadow-card"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border border-border bg-secondary/20 hover:bg-secondary/40 transition">
                    <Camera className="h-6 w-6 text-coral" strokeWidth={1.5} />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) { alert('সর্বোচ্চ ২MB'); return; }
                      setReviewImageFile(file);
                      const url = URL.createObjectURL(file);
                      setReviewImagePreview(url);
                    }} />
                  </label>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSubmitReview}
                  disabled={!reviewComment.trim() || submittingReview}
                  className="flex-1 py-2.5 rounded-full bg-coral text-white text-[13px] font-bold disabled:opacity-50 shadow-btn transition active:scale-95"
                >
                  {submittingReview ? 'পাঠানো হচ্ছে...' : 'রিভিউ দিন'}
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2.5 rounded-full bg-secondary text-coral text-[13px] font-bold transition active:scale-95"
                >
                  বাতিল
                </button>
              </div>
            </div>
          )}

          {/* Approved reviews list */}
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.slice(0, 5).map((r) => (
                <div key={r.id} className="rounded-[20px] border border-border bg-surface p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-coral text-[13px]">
                      {r.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="text-[12px] font-bold text-ink">{r.user_name}</div>
                        <div className="flex">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`h-3 w-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-ink/15'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="mt-1 text-[12px] text-ink-300 leading-relaxed font-medium">{r.comment}</div>
                      {r.image && (
                        <img loading="lazy" decoding="async" src={r.image} alt="review" className="mt-2 h-24 w-24 rounded-xl object-cover border border-border" />
                      )}
                      <div className="mt-2 text-[10px] text-ink-200 font-semibold">
                        {new Date(r.created_at).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-[13px] text-ink-300 font-medium">
              এখনো কোনো রিভিউ নেই। প্রথম রিভিউটা আপনিই দিন!
            </div>
          )}
        </section>
      </div>

      {/* Sticky floating controls at top */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-5 pb-2 pointer-events-none">
        <button
          onClick={back}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink border border-border shadow-card transition active:scale-90"
          aria-label="Back"
        >
          <ArrowLeft className="h-[20px] w-[20px]" strokeWidth={2.2} />
        </button>
        <div className="flex gap-2.5 pointer-events-auto">
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink border border-border shadow-card transition active:scale-90"
            aria-label="Share"
          >
            <Share2 className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          <button
            onClick={handleWish}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink border border-border shadow-card transition active:scale-90"
            aria-label="Wishlist"
          >
            <Heart
              key={heartKey}
              className={`h-[19px] w-[19px] ${wished ? 'fill-coral text-coral anim-pop' : ''}`}
              style={{ transition: 'fill 0.2s ease, color 0.2s ease' }}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {/* Sticky bottom CTA — solid surface (depth ≠ hue) */}
      <div className="absolute right-0 bottom-0 left-0 z-30 border-t border-border bg-white/95 px-5 pt-3.5 pb-6 shadow-float">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-ink-300 uppercase">
              Total
            </div>
            <div className="font-sans text-[22px] font-bold text-coral tabular">
              {formatINR(total * quantity)}
            </div>
            <div className="text-[11.5px] text-ink-300 font-bold mt-0.5 max-w-[120px] truncate">
              {product.pricePerUnit ? formatWeight(`${customWeight} ${product.priceUnit ?? 'lb'}`) : formatWeight(size)} · {selectedFlavor}
              {quantity > 1 ? ` · ×${quantity}` : ''}
            </div>
          </div>
          {(product.inStock ?? true) ? (
            <div className="ml-auto flex flex-1 items-center gap-2">
              <div className="flex flex-shrink-0 items-center gap-2.5 rounded-full border border-border bg-secondary/40 p-1 shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-ink transition active:scale-90 disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
                <span className="min-w-[14px] text-center font-sans text-[14px] font-bold text-ink tabular">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-coral text-white transition active:scale-90 shadow-sm"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </div>
              <button
                onClick={handleAdd}
                className="btn-primary flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl text-[14px] font-bold tracking-tight shadow-btn"
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2.2} />
                Add to Cart
              </button>
            </div>
          ) : (
            <div className="flex flex-1 ml-auto flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] text-ink/50 font-semibold">
                <AlertTriangle size={12} />
                Currently out of stock
              </div>
              <button
                onClick={() => {
                  const key = `bakeart-alerts`;
                  const alerts = ls.get<{productId: string; productName: string; date: number}[]>(key, []);
                  const exists = alerts.find(a => a.productId === product.id);
                  if (!exists) {
                    ls.set(key, [...alerts, { productId: product.id, productName: product.name, date: Date.now() }]);
                  }
                  useUI.getState().addNotification(
                    'Alert set!',
                    `We'll notify you when ${product.name} is back in stock.`
                  );
                }}
                className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold shadow-btn"
              >
                <Bell size={16} />
                Notify Me When Available
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:scale-90"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2.2} />
          </button>

          <div
            className="relative w-full max-w-md px-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              lbTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }}
            onTouchEnd={(e) => {
              if (lightboxZoomed) return;
              const dx = e.changedTouches[0].clientX - lbTouchStart.current.x;
              const dy = e.changedTouches[0].clientY - lbTouchStart.current.y;
              if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                if (dx < 0 && activeIndex < galleryImages.length - 1) {
                  setActiveImg(galleryImages[activeIndex + 1]);
                } else if (dx > 0 && activeIndex > 0) {
                  setActiveImg(galleryImages[activeIndex - 1]);
                }
              }
            }}
          >
            <img
              src={currentImg}
              alt={product.name}
              onDoubleClick={() => setLightboxZoomed((z) => !z)}
              className={`w-full max-h-[70vh] rounded-2xl object-contain select-none transition-transform duration-300 ${
                lightboxZoomed ? 'scale-[2] cursor-zoom-out' : 'cursor-zoom-in'
              }`}
            />
            {!lightboxZoomed && (
              <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold text-white/85">
                Double-tap to zoom
              </span>
            )}

            {!lightboxZoomed && galleryImages.length > 1 && activeIndex > 0 && (
              <button
                onClick={() => setActiveImg(galleryImages[activeIndex - 1])}
                className="absolute left-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white active:scale-90"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
              </button>
            )}
            {!lightboxZoomed && galleryImages.length > 1 && activeIndex < galleryImages.length - 1 && (
              <button
                onClick={() => setActiveImg(galleryImages[activeIndex + 1])}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white active:scale-90"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
              </button>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="mt-4 flex gap-1.5">
              {galleryImages.map((url, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveImg(url); }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
