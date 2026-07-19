import { useState } from 'react';
import { ArrowLeft, Star, Camera, X } from 'lucide-react';
import { useUI, useAuthStore } from '../lib/store';
import { useReviews } from '../hooks/useReviews';
import { useProducts } from '../hooks/useProducts';
import { safeArray } from '../lib/utils';
import type { Product } from '../types';

export default function WriteReviewScreen() {
  const { back, view } = useUI();
  const { user } = useAuthStore();
  const productId = (view as any).productId as string | undefined;
  const { saveReview, uploadReviewImage } = useReviews(productId);
  const { products } = useProducts();
  const product = safeArray<Product>(products).find((p) => p.id === productId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim() || !user) return;
    setSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) imageUrl = await uploadReviewImage(imageFile);

      await saveReview({
        id: `r-${Date.now()}`,
        product_id: productId || '',
        user_id: user.id,
        user_name: user.name || 'Anonymous',
        rating,
        comment: comment.trim(),
        image: imageUrl || undefined,
        approved: true,
        created_at: new Date().toISOString(),
      });
      back();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex-shrink-0 px-5 pt-3 pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <button
            onClick={back}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-card"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[18px] font-bold text-ink">রিভিউ লিখুন</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-10">
        {/* Order summary card — real product */}
        <div className="rounded-[20px] bg-surface border border-border shadow-card p-4 mb-6 flex items-center gap-3">
          {product?.image && (
            <img src={product.image} className="h-14 w-14 flex-shrink-0 rounded-xl object-cover ring-1 ring-border" />
          )}
          <div className="min-w-0">
            <div className="text-[11px] text-text-secondary">আপনার অর্ডার</div>
            <div className="font-bold mt-0.5 truncate text-ink">{product?.name || 'Product Review'}</div>
            {product?.price != null && (
              <div className="text-[12px] text-text-secondary mt-0.5">৳{product.price}</div>
            )}
          </div>
        </div>

        {/* Star rating */}
        <div className="mb-6">
          <div className="text-[13px] font-bold mb-2 text-ink">আপনার রেটিং</div>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setRating(s)}>
                <Star className={`h-9 w-9 ${s <= rating ? 'fill-gold text-gold' : 'text-ink-50'}`} />
              </button>
            ))}
          </div>
          <div className="mt-1 text-[12px] text-text-secondary">How was your order?</div>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <div className="text-[13px] font-bold mb-2 text-ink">বিস্তারিত রিভিউ</div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="আপনার অভিজ্ঞতা লিখুন..."
            rows={5}
            className="w-full rounded-2xl border border-border bg-surface p-4 text-sm resize-none outline-none focus:border-coral focus:ring-4 focus:ring-coral/10"
            maxLength={500}
          />
          <div className="text-right text-[10px] text-text-tertiary mt-1">{comment.length}/500</div>
        </div>

        {/* Photo */}
        <div>
          <div className="text-[13px] font-bold mb-2 text-ink">ছবি যোগ করুন (ঐচ্ছিক)</div>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} className="w-24 h-24 rounded-2xl object-cover ring-1 ring-border" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(''); }}
                className="absolute -top-1 -right-1 bg-error text-white rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-coral/30 bg-secondary/50 cursor-pointer transition hover:border-coral/50">
              <Camera className="h-6 w-6 text-coral/60" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }} />
            </label>
          )}
        </div>
      </div>

      <div className="p-5 border-t border-border flex gap-3">
        <button
          onClick={back}
          className="flex-1 h-12 rounded-2xl border border-border font-bold text-ink"
        >
          বাতিল
        </button>
        <button
          onClick={handleSubmit}
          disabled={!comment.trim() || submitting}
          className="flex-1 h-12 rounded-2xl bg-coral text-white font-bold shadow-btn disabled:opacity-50"
        >
          {submitting ? 'পাঠানো হচ্ছে...' : 'রিভিউ দিন'}
        </button>
      </div>
    </div>
  );
}
