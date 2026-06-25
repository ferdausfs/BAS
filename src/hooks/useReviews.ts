import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ls, isSupabaseConfigured, fileToBase64, safeArray } from '../lib/utils';
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

const visibleForProduct = (all: Review[], productId?: string) =>
  productId ? all.filter((r) => r.product_id === productId && r.approved) : all;

export function useReviews(productId?: string) {
  const [reviews, setReviews] = useState<Review[]>(() => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    return visibleForProduct(all, productId);
  });
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(async (pid?: string) => {
    if (!isSupabaseConfigured()) {
      const all = sanitizeReviews(ls.get(LS_KEY, []));
      setReviews(visibleForProduct(all, pid));
      return;
    }
    setLoading(true);
    try {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (pid) query = query.eq('product_id', pid).eq('approved', true);
      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        const validated = sanitizeReviews(data);
        if (!pid) ls.set(LS_KEY, validated);
        setReviews(pid ? validated.filter((r) => r.approved) : validated);
      }
    } catch (e) {
      console.warn('Reviews fetch failed:', e);
      const all = sanitizeReviews(ls.get(LS_KEY, []));
      setReviews(visibleForProduct(all, pid));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReviews(productId);
  }, [fetchReviews, productId]);

  const saveReview = useCallback(async (review: Review) => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    const updated = sanitizeReviews([review, ...all]);
    ls.set(LS_KEY, updated);
    setReviews(visibleForProduct(updated, productId));
    if (!isSupabaseConfigured()) return;
    await supabase.from('reviews').insert(review);
  }, [productId]);

  const approveReview = useCallback(async (id: string, approved: boolean) => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    const updated = sanitizeReviews(all.map((r) => (r.id === id ? { ...r, approved } : r)));
    ls.set(LS_KEY, updated);
    setReviews(visibleForProduct(updated, productId));
    if (!isSupabaseConfigured()) return;
    await supabase.from('reviews').update({ approved }).eq('id', id);
  }, [productId]);

  const deleteReview = useCallback(async (id: string) => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    const updated = sanitizeReviews(all.filter((r) => r.id !== id));
    ls.set(LS_KEY, updated);
    setReviews(visibleForProduct(updated, productId));
    if (!isSupabaseConfigured()) return;
    await supabase.from('reviews').delete().eq('id', id);
  }, [productId]);

  const uploadReviewImage = useCallback(async (file: File): Promise<string> => {
    if (!isSupabaseConfigured()) return fileToBase64(file);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `reviews/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('review-images').upload(path, file, { upsert: false });
    if (error || !data) return fileToBase64(file);
    const { data: urlData } = supabase.storage.from('review-images').getPublicUrl(path);
    return urlData.publicUrl;
  }, []);

  const validReviews = safeArray(reviews).filter((r) => r && typeof r.rating === 'number');
  const avgRating = validReviews.length
    ? validReviews.reduce((sum, review) => sum + review.rating, 0) / validReviews.length
    : 0;

  return { reviews: safeArray(reviews), loading, fetchReviews, saveReview, approveReview, deleteReview, uploadReviewImage, avgRating };
}
