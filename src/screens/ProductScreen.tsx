import { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { ArrowLeft, Heart, Star, ShoppingBag, Check, Share2, Truck, Sparkles, Shield, Cake, Pencil, CheckCircle2, Camera, X, AlertTriangle, Bell, Eye, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUI, formatINR, useCart, useUser, useAuthStore, useSettingsStore } from '../lib/store';
import { useProducts } from '../hooks/useProducts';
import { useReviews } from '../hooks/useReviews';
import { useDominantColor } from '../hooks/useDominantColor';
import { ls, safeArray } from '../lib/utils';
import type { Product, Review } from '../types';

const ADDONS = [
  { id: 'candles', name: 'Birthday candles', price: 20 },
  { id: 'message', name: 'Custom message', price: 50 },
  { id: 'card', name: 'Greeting card', price: 30 },
  { id: 'knife', name: 'Cake knife set', price: 80 },
];

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
  const lbTouchStart = useRef({ x: 0, y: 0 });

  // Swipe gesture refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const heroRef = useRef<HTMLDivElement>(null);
  // Store gallery state in refs so native listeners always have latest values
  // without being in the dependency array (which would cause hooks-order crash)
  const galleryRef = useRef<string[]>([]);
  const activeIndexRef = useRef(0);

  // Native touch listener — re-attaches once heroRef actually has an element.
  // product loads async (Firestore); on first render product is null and the
  // "Cake not found" early-return fires, so heroRef stays null and this effect
  // used to run once with el === null and never again. Depending on product?.id
  // makes it re-run on the render where the hero div actually mounts.
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
  }, [product?.id]); // re-run when product loads and hero div actually mounts

  const handleWish = () => {
    setHeartKey(k => k + 1);
    if (product) toggleWish(product.id);
  };

  // Reviews state
  const { reviews: rawReviews, saveReview, uploadReviewImage } = useReviews(product?.id);
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

  // Reset activeImg when product ID changes
  useEffect(() => {
    setActiveImg(null);
  }, [view.name === 'product' ? view.productId : '']);

  if (view.name !== 'product') return null;

  if (!product) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="flex justify-center text-ink-200 opacity-60">
          <Cake size={48} strokeWidth={1.5} />
        </div>
        <h2 className="mt-4 font-display text-[20px] font-bold text-ink">Cake not found</h2>
        <p className="mt-1 text-[12px] text-ink-200">This item may have been removed.</p>
        <button onClick={back} className="btn-primary mt-5 h-12 rounded-2xl px-6 text-[13px] font-bold">
          Go back
        </button>
      </div>
    );
  }

  const currentImg = activeImg || product.image;
  const galleryImages = [product.image, ...safeArray<string>(product.gallery)];
  const activeIndex = galleryImages.indexOf(currentImg);
  // Keep refs in sync so native touch listeners always have latest values
  galleryRef.current = galleryImages;
  activeIndexRef.current = activeIndex;

  // Dominant color extraction for glass-tint (Check 3)
  const dominantColor = useDominantColor(currentImg);
  const productWeights = safeArray<{ size: string; price: number }>(product.weights);
  const productFlavors = safeArray<string>(product.flavors);
  const safeWeights = productWeights.length ? productWeights : [{ size: '1 kg', price: product.price }];
  const safeFlavors = productFlavors.length ? productFlavors : ['Chocolate'];
  const [size, setSize] = useState(safeWeights[1]?.size ?? safeWeights[0]?.size);
  const [selectedFlavor, setSelectedFlavor] = useState(safeFlavors[0]);
  const [addons, setAddons] = useState<Record<string, boolean>>({});
  const [cakeMessage, setCakeMessage] = useState('');
  const [customWeight, setCustomWeight] = useState('1');
  const [weightError, setWeightError] = useState('');
  const wished = wishlist.includes(product.id);

  const selectedWeight = safeWeights.find((w) => w.size === size);
  const addonsCost = ADDONS.reduce((s, a) => s + (addons[a.id] ? a.price : 0), 0);
  const selectedAddons = ADDONS.filter((a) => addons[a.id]).map((a) => a.name);

  // If weight-based pricing is set, compute dynamically
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
        size: `${customWeight} ${product.priceUnit ?? 'kg'}`,
        flavor: selectedFlavor,
        topping: selectedAddons.length ? selectedAddons.join(', ') : undefined,
        message: cakeMessage || undefined,
        price: total,
        quantity: 1,
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
        quantity: 1,
      });
    }
    go({ name: 'cart' });
  };

  return (
    <div className="relative flex h-full flex-col">
      {/* ONE scrollable area: image + all content (parallax scroll) */}
      <div className="no-scrollbar relative flex-1 overflow-y-auto pb-28">
        {/* Hero image — in normal flow so backdrop-filter on content sheet has real pixels behind it */}
        <div
          ref={heroRef}
          onClick={() => setLightboxOpen(true)}
          className="relative w-full bg-blush-100 overflow-hidden"
          style={{ aspectRatio: '4/3' }}
        >
          <img
            loading="lazy"
            decoding="async"
            src={currentImg}
            alt={product.name}
            className="h-full w-full object-cover select-none"
            style={{ display: 'block', pointerEvents: 'none' }}
          />

          {/* Soft top fade for control legibility */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blush-100/85 to-transparent" />

          {product.inStock === false && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-b-[32px]">
              <span className="rounded-full bg-white/90 px-4 py-2 text-[13px] font-bold text-ink backdrop-blur">Out of Stock</span>
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

        {/* Content sheet below image — flows naturally as user scrolls */}
        <div className="glass-tint rounded-t-[28px] -mt-16 relative z-10 px-5 pt-6" style={{ '--tint': dominantColor } as CSSProperties}>
          {/* Gallery Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {galleryImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(url)}
                  className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors ${
                    currentImg === url ? 'border-coral' : 'border-transparent'
                  }`}
                >
                  <img loading="lazy" decoding="async" src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="flex-1 font-display text-[20px] font-bold leading-[1.1] tracking-tight text-ink">
              {product.name}
            </h1>
            {product.tier && product.tier !== 'normal' && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                product.tier === 'premium'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
                  : 'bg-ink text-white'
              }`}>
                {product.tier === 'premium' ? (
                  <>
                    <Star className="h-3 w-3" strokeWidth={2.5} /> Premium
                  </>
                ) : (
                  <>
                    <Pencil className="h-3 w-3" strokeWidth={2.5} /> Custom Order
                  </>
                )}
              </span>
            )}
          </div>

          {/* Rating + meta */}
          <div className="mt-2 flex items-center gap-2 text-[12.5px]">
            <div className="flex items-center gap-0.5 text-gold">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.round(Number(product.rating ?? 0)) ? 'fill-current' : 'opacity-30'}`}
                  strokeWidth={0}
                />
              ))}
            </div>
            <span className="font-bold text-ink">{Number(product.rating ?? 0)}</span>
            <span className="text-ink-200">({Number(product.reviews ?? 0).toLocaleString()} reviews)</span>
          </div>

          {/* Social proof strip */}
          {(product.soldCount || product.viewCount || product.lowStock || product.stockCount) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {product.soldCount && product.soldCount > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-1">
                  <ShoppingBag className="h-3 w-3 text-ink-200" strokeWidth={2} />
                  <span className="text-[11px] font-semibold text-ink-200">
                    {product.soldCount >= 1000
                      ? `${(product.soldCount / 1000).toFixed(1)}k+`
                      : `${product.soldCount}+`} বিক্রি
                  </span>
                </div>
              )}
              {product.viewCount && product.viewCount > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-1">
                  <Eye className="h-3 w-3 text-ink-200" strokeWidth={2} />
                  <span className="text-[11px] font-semibold text-ink-200">
                    {product.viewCount} জন দেখছে
                  </span>
                </div>
              )}
              {product.inStock !== false && (product.lowStock || (product.stockCount !== undefined && product.stockCount <= 5)) && (
                <div className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1">
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
            <span className="font-display text-[26px] font-bold leading-none text-coral tabular">
              {formatINR(base)}
            </span>
            {product.oldPrice && (
              <span className="text-[14px] text-ink-200 line-through">
                {formatINR(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-4 text-[13.5px] leading-relaxed text-ink-200">{product.description}</p>

          {/* Trust row */}
          <div className="mt-5 flex items-center justify-between rounded-2xl glass-strong px-4 py-3">
            <Trust icon={Truck} label="Free delivery" />
            <span className="h-5 w-px bg-ink-50" />
            <Trust icon={Sparkles} label="Freshly baked" />
            <span className="h-5 w-px bg-ink-50" />
            <Trust icon={Shield} label="Secure pay" />
          </div>

          {settings?.deliveryEstimate && (
            <div className="mt-3 flex items-center gap-3 rounded-2xl glass-strong px-4 py-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-green-100">
                <Clock className="h-[18px] w-[18px] text-green-700" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-green-800">আজ অর্ডার করলে</p>
                <p className="text-[11.5px] text-green-600">{settings.deliveryEstimate} এর মধ্যে পৌঁছাবে</p>
              </div>
            </div>
          )}

          {/* Flavor selector */}
          {safeFlavors.length > 1 && (
            <section className="mt-7">
              <h3 className="font-display text-[15px] font-bold tracking-tight text-ink">Flavor</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {safeFlavors.map((f) => {
                  const active = selectedFlavor === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setSelectedFlavor(f)}
                      className={`rounded-full border-2 px-4 py-2 text-[12.5px] font-bold transition active:scale-95 ${
                        active ? 'border-coral bg-coral-50 text-coral' : 'border-white/40 glass-strong text-ink'
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
              <h3 className="font-display text-[15px] font-bold tracking-tight text-ink">Select size</h3>
              <span className="text-[11px] text-ink-200">{product.pricePerUnit ? 'Weight-based' : 'Serves 8-12'}</span>
            </div>
            {product.pricePerUnit ? (
              /* Dynamic weight-based pricing */
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0.25"
                    step="0.25"
                    placeholder={`Enter weight in ${product.priceUnit ?? 'kg'}`}
                    className="flex-1 px-3 py-2.5 rounded-xl border-2 border-ink/10 bg-cream text-sm font-bold text-ink focus:border-coral focus:outline-none"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(e.target.value)}
                  />
                  <span className="text-sm font-bold text-ink/50">{product.priceUnit ?? 'kg'}</span>
                </div>
                {weightError && (
                  <div className="text-[11px] text-red-500 font-semibold">{weightError}</div>
                )}
                {customWeight && +customWeight > 0 && (
                  <div className="mt-2 rounded-xl bg-ink-50 px-3 py-2 flex items-center justify-between">
                    <span className="text-[11px] text-ink/60">{customWeight} {product.priceUnit ?? 'kg'} × ৳{product.pricePerUnit}</span>
                    <span className="font-display text-base font-bold text-ink">৳{(+customWeight * (product.pricePerUnit ?? 0)).toLocaleString()}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Existing static weight chips */
              <div className="mt-3 grid grid-cols-4 gap-2">
                {safeWeights.map((w) => {
                  const fullPrice = product.price + w.price;
                  const active = size === w.size;
                  return (
                    <button
                      key={w.size}
                      onClick={() => setSize(w.size)}
                      className={`flex min-h-[64px] flex-col items-center justify-center rounded-2xl border-2 bg-white transition active:scale-95 ${
                        active
                          ? 'border-coral bg-coral-50 text-coral'
                          : 'border-ink-50 text-ink'
                      }`}
                    >
                      <span className="text-[13px] font-bold">{w.size}</span>
                      <span className="mt-0.5 text-[11px] font-semibold tabular opacity-70">
                        {formatINR(fullPrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Add-ons */}
          <section className="mt-7">
            <h3 className="font-display text-[15px] font-bold tracking-tight text-ink">Add-ons</h3>
            <div className="mt-3 space-y-1.5">
              {ADDONS.map((a) => {
                const active = !!addons[a.id];
                return (
                  <button
                    key={a.id}
                    onClick={() => setAddons((s) => ({ ...s, [a.id]: !s[a.id] }))}
                    className={`flex w-full items-center gap-3 rounded-2xl glass-strong p-3 text-left transition active:scale-[.99] ${
                      active ? 'ring-2 ring-coral/40 bg-coral-50' : ''
                    }`}
                    style={{ boxShadow: '0 1px 2px rgba(26,19,17,.02), 0 4px 16px -10px rgba(26,19,17,.18)' }}
                  >
                    <div
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border-2 transition ${
                        active ? 'border-coral bg-coral' : 'border-ink-50 bg-white'
                      }`}
                    >
                      {active && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                    </div>
                    <span className="flex-1 text-[14px] font-bold text-ink">{a.name}</span>
                    <span className="text-[13.5px] font-extrabold text-ink tabular">
                      {formatINR(a.price)}
                    </span>
                  </button>
                );
              })}
            </div>
            {addons['message'] && (
              <div className="mt-3 overflow-hidden rounded-2xl border-2 border-dashed border-white/40 glass-strong p-3.5">
                <textarea
                  maxLength={40}
                  rows={2}
                  value={cakeMessage}
                  onChange={(e) => setCakeMessage(e.target.value)}
                  placeholder="যেমন: শুভ জন্মদিন আম্মু"
                  className="w-full resize-none rounded-xl bg-white px-3 py-2.5 text-[13px] outline-none placeholder:text-ink-100 focus:border-coral"
                />
                <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-ink-200">
                  <span>কেকের উপরে লেখা হবে</span>
                  <span className="tabular">{cakeMessage.length}/40</span>
                </div>
              </div>
            )}
          </section>

          {/* Customise CTA */}
          <button
            onClick={() => go({ name: 'customize', productId: product.id })}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/40 glass-strong py-3.5 text-[13.5px] font-bold text-ink transition active:scale-[.98]"
          >
            <Sparkles className="h-4 w-4" />
            Fully customize this cake
          </button>
        </div>

        {/* Reviews Section inside scroll container */}
        <div className="px-5 mt-6 pb-4">
      <section className="px-5 mt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-[17px] font-bold text-ink">Reviews</h2>
          {!showReviewForm && (
            <button
              onClick={() => user && setShowReviewForm(true)}
              disabled={!user}
              className="rounded-xl bg-ink-50 px-3 py-1.5 text-[11px] font-bold text-ink disabled:opacity-50"
            >
              {user ? '+ Write a review' : 'Sign in to review'}
            </button>
          )}
        </div>

        {/* Success message */}
        {reviewSuccess && (
          <div className="mb-3 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-[12px] text-emerald-700 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Review submitted! It will appear after admin approval.
          </div>
        )}

        {/* Review form */}
        {showReviewForm && (
          <div className="mb-4 rounded-2xl glass-strong p-4 space-y-3">
            {/* Star rating */}
            <div>
              <div className="text-[11px] font-bold text-ink/50 mb-1">Rating</div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star className={`h-7 w-7 ${s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-ink/20'}`} />
                  </button>
                ))}
              </div>
            </div>
            {/* Comment */}
            <textarea
              placeholder="Share your experience... How was the taste, design, delivery?"
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-ink/10 bg-cream px-3 py-2.5 text-[13px] text-ink placeholder:text-ink/30 focus:border-coral focus:outline-none"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
            {/* Photo upload */}
            <div>
              <div className="text-[11px] font-bold text-ink/50 mb-1">Add photo (optional)</div>
              {reviewImagePreview ? (
                <div className="relative w-20 h-20">
                  <img loading="lazy" decoding="async" src={reviewImagePreview} alt="" className="w-20 h-20 rounded-xl object-cover" />
                  <button
                    onClick={() => { setReviewImageFile(null); setReviewImagePreview(''); }}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-ink text-white flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-ink/20 bg-cream hover:border-coral">
                  <Camera className="h-6 w-6 text-ink-200" strokeWidth={1.5} />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) { alert('Max 2MB'); return; }
                    setReviewImageFile(file);
                    const url = URL.createObjectURL(file);
                    setReviewImagePreview(url);
                  }} />
                </label>
              )}
            </div>
            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSubmitReview}
                disabled={!reviewComment.trim() || submittingReview}
                className="flex-1 py-2.5 rounded-xl bg-coral text-white text-[13px] font-bold disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2.5 rounded-xl bg-ink/5 text-ink/60 text-[13px] font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Approved reviews list */}
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.slice(0, 5).map((r) => (
              <div key={r.id} className="rounded-2xl glass-strong p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ink-50 font-bold text-ink text-[13px]">
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
                    <div className="mt-1 text-[12px] text-ink/70 leading-relaxed">{r.comment}</div>
                    {r.image && (
                      <img loading="lazy" decoding="async" src={r.image} alt="review" className="mt-2 h-24 w-24 rounded-xl object-cover" />
                    )}
                    <div className="mt-1.5 text-[10px] text-ink/30">
                      {new Date(r.created_at).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-[13px] text-ink/40">
            No reviews yet. Be the first!
          </div>
        )}
      </section>

        </div>
      </div>

      {/* Sticky floating controls at top — visible above image, with pointer-events-auto on each button */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-5 pb-2 pointer-events-none">
        <button
          onClick={back}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink transition active:scale-90"
          style={{ boxShadow: '0 8px 22px -10px rgba(26,19,17,.35)' }}
          aria-label="Back"
        >
          <ArrowLeft className="h-[20px] w-[20px]" strokeWidth={2.2} />
        </button>
        <div className="flex gap-2.5 pointer-events-auto">
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink transition active:scale-90"
            style={{ boxShadow: '0 8px 22px -10px rgba(26,19,17,.35)' }}
            aria-label="Share"
          >
            <Share2 className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          <button
            onClick={handleWish}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink transition active:scale-90"
            style={{ boxShadow: '0 8px 22px -10px rgba(26,19,17,.35)' }}
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

      {/* Sticky bottom CTA */}
      <div className="absolute right-0 bottom-0 left-0 z-30 border-t border-white/40 glass-strong px-5 pt-3 pb-6">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-ink-200 uppercase">
              Total
            </div>
            <div className="font-display text-[22px] font-bold text-coral tabular">
              {formatINR(total)}
            </div>
            <div className="text-[10.5px] text-ink-200 mt-0.5">
              {product.pricePerUnit ? `${customWeight} ${product.priceUnit ?? 'kg'}` : size} · {selectedFlavor}
            </div>
          </div>
          {(product.inStock ?? true) ? (
            <button
              onClick={handleAdd}
              className="btn-primary ml-auto flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl text-[14px] font-bold tracking-tight"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2.2} />
              Add to Cart
            </button>
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
                className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold"
              >
                <Bell size={16} />
                Notify Me When Available
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen image lightbox — tap hero image to open, swipe/arrows/dots for gallery */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm"
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
              className="w-full max-h-[70vh] rounded-2xl object-contain select-none"
            />

            {galleryImages.length > 1 && activeIndex > 0 && (
              <button
                onClick={() => setActiveImg(galleryImages[activeIndex - 1])}
                className="absolute left-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white active:scale-90"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
              </button>
            )}
            {galleryImages.length > 1 && activeIndex < galleryImages.length - 1 && (
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

function Trust({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-200">
      <Icon className="h-3.5 w-3.5 text-ink-200" strokeWidth={2} />
      {label}
    </div>
  );
}
