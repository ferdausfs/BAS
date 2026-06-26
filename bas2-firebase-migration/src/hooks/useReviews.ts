import { useCallback, useEffect, useState } from 'react';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { uploadToCloudinary, isCloudinaryConfigured } from '../lib/cloudinary';
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
    if (!isFirebaseConfigured()) {
      const all = sanitizeReviews(ls.get(LS_KEY, []));
      setReviews(visibleForProduct(all, pid));
      return;
    }
    setLoading(true);
    try {
      let q = query(collection(db, 'reviews'), orderBy('created_at', 'desc'));
      if (pid) q = query(collection(db, 'reviews'), where('product_id', '==', pid), where('approved', '==', true), orderBy('created_at', 'desc'));

      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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

  // Realtime
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const q = query(collection(db, 'reviews'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const validated = sanitizeReviews(data);
      if (!productId) ls.set(LS_KEY, validated);
      setReviews(productId ? validated.filter((r) => r.approved) : validated);
    });
    return () => unsubscribe();
  }, [productId]);

  const saveReview = useCallback(async (review: Review) => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    const updated = sanitizeReviews([review, ...all]);
    ls.set(LS_KEY, updated);
    setReviews(visibleForProduct(updated, productId));
    if (!isFirebaseConfigured()) return;
    try {
      await addDoc(collection(db, 'reviews'), { ...review, created_at: new Date().toISOString() });
    } catch (e) { console.warn('Save review error:', e); }
  }, [productId]);

  const approveReview = useCallback(async (id: string, approved: boolean) => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    const updated = sanitizeReviews(all.map((r) => (r.id === id ? { ...r, approved } : r)));
    ls.set(LS_KEY, updated);
    setReviews(visibleForProduct(updated, productId));
    if (!isFirebaseConfigured()) return;
    try {
      await updateDoc(doc(db, 'reviews', id), { approved });
    } catch (e) { console.warn('Approve review error:', e); }
  }, [productId]);

  const deleteReview = useCallback(async (id: string) => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    const updated = sanitizeReviews(all.filter((r) => r.id !== id));
    ls.set(LS_KEY, updated);
    setReviews(visibleForProduct(updated, productId));
    if (!isFirebaseConfigured()) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (e) { console.warn('Delete review error:', e); }
  }, [productId]);

  const uploadReviewImage = useCallback(async (file: File): Promise<string> => {
    if (isCloudinaryConfigured()) {
      try {
        return await uploadToCloudinary(file, 'reviews');
      } catch (e) {
        console.warn('Cloudinary upload failed, falling back to base64:', e);
      }
    }
    return fileToBase64(file);
  }, []);

  const validReviews = safeArray(reviews).filter((r) => r && typeof r.rating === 'number');
  const avgRating = validReviews.length
    ? validReviews.reduce((sum, review) => sum + review.rating, 0) / validReviews.length
    : 0;

  return { reviews: safeArray(reviews), loading, fetchReviews, saveReview, approveReview, deleteReview, uploadReviewImage, avgRating };
}
