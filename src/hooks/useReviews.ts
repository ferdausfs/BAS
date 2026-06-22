import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ls, isSupabaseConfigured } from '../lib/utils';
import type { Review } from '../types';

const LS_KEY = 'bakeart-reviews-v2';

function sanitizeReviews(arr: unknown): Review[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter((r): r is Review => {
    if (!r || typeof r !== 'object') return false;
    const review = r as Record<string, unknown>;
    return typeof review.id === 'string' && typeof review.rating === 'number';
  });
}

export function useReviews(productId?: string) {
  const [reviews, setReviews] = useState<Review[]>(() => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    return productId ? all.filter((r) => r.product_id === productId && r.approved) : all;
  });
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(async (pid?: string) => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (pid) query = query.eq('product_id', pid).eq('approved', true);
      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        const validated = sanitizeReviews(data);
        setReviews(validated);
        if (!pid) ls.set(LS_KEY, validated);
      }
    } catch (e) { console.warn('Reviews fetch failed:', e); }
    finally { setLoading(false); }
  }, []);

  const saveReview = useCallback(async (review: Review) => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    const updated = sanitizeReviews([review, ...all]);
    ls.set(LS_KEY, updated);
    setReviews((prev) => sanitizeReviews([review, ...prev]));
    if (!isSupabaseConfigured()) return;
    await supabase.from('reviews').insert(review);
  }, []); // wait, use login? No, keep it empty or use hook deps. Let's look at previous saveReview dependency. It was empty. Let's leave dependency list empty.

  const approveReview = useCallback(async (id: string, approved: boolean) => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    const updated = sanitizeReviews(all.map((r) => (r.id === id ? { ...r, approved } : r)));
    ls.set(LS_KEY, updated);
    setReviews(updated);
    if (!isSupabaseConfigured()) return;
    await supabase.from('reviews').update({ approved }).eq('id', id);
  }, []);

  const deleteReview = useCallback(async (id: string) => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    const updated = sanitizeReviews(all.filter((r) => r.id !== id));
    ls.set(LS_KEY, updated);
    setReviews(updated);
    if (!isSupabaseConfigured()) return;
    await supabase.from('reviews').delete().eq('id', id);
  }, []);

  const validReviews = reviews.filter((r) => r && typeof r.rating === 'number');
  const avgRating = validReviews.length
    ? validReviews.reduce((s, r) => s + r.rating, 0) / validReviews.length
    : 0;

  return { reviews, loading, fetchReviews, saveReview, approveReview, deleteReview, avgRating };
}
