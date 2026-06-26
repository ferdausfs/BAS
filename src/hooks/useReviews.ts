import { useCallback, useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db, isFirebaseConfigured, uploadToCloudinary } from '../lib/firebase';
import { ls, safeArray } from '../lib/utils';
import { mapReviewDoc } from '../lib/firestoreMappers';
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

const visibleForProduct = (all: Review[], productId?: string) => productId ? all.filter((r) => r.product_id === productId && r.approved) : all;

export function useReviews(productId?: string) {
  const [reviews, setReviews] = useState<Review[]>(() => visibleForProduct(sanitizeReviews(ls.get(LS_KEY, [])), productId));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setReviews(visibleForProduct(sanitizeReviews(ls.get(LS_KEY, [])), productId));
      return;
    }
    setLoading(true);
    const constraints: any[] = [orderBy('created_at', 'desc')];
    if (productId) constraints.unshift(where('approved', '==', true), where('product_id', '==', productId));
    const q = query(collection(db, 'reviews'), ...constraints);
    const unsub = onSnapshot(q, (snap) => {
      const validated = sanitizeReviews(snap.docs.map((d) => mapReviewDoc(d.id, d.data())));
      if (!productId) ls.set(LS_KEY, validated);
      setReviews(productId ? validated.filter((r) => r.approved) : validated);
      setLoading(false);
    }, (e) => {
      console.warn('Reviews snapshot failed:', e);
      const all = sanitizeReviews(ls.get(LS_KEY, []));
      setReviews(visibleForProduct(all, productId));
      setLoading(false);
    });
    return unsub;
  }, [productId]);

  const fetchReviews = useCallback(async (pid?: string) => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    setReviews(visibleForProduct(all, pid ?? productId));
  }, [productId]);

  const saveReview = useCallback(async (review: Review) => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    const updated = sanitizeReviews([review, ...all]);
    ls.set(LS_KEY, updated);
    setReviews(visibleForProduct(updated, productId));
    if (!isFirebaseConfigured()) return;
    await setDoc(doc(db, 'reviews', review.id), review, { merge: true }).catch(async () => { await addDoc(collection(db, 'reviews'), review); });
  }, [productId]);

  const approveReview = useCallback(async (id: string, approved: boolean) => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    const updated = sanitizeReviews(all.map((r) => (r.id === id ? { ...r, approved } : r)));
    ls.set(LS_KEY, updated);
    setReviews(visibleForProduct(updated, productId));
    if (!isFirebaseConfigured()) return;
    await updateDoc(doc(db, 'reviews', id), { approved });
  }, [productId]);

  const deleteReview = useCallback(async (id: string) => {
    const all = sanitizeReviews(ls.get(LS_KEY, []));
    const updated = sanitizeReviews(all.filter((r) => r.id !== id));
    ls.set(LS_KEY, updated);
    setReviews(visibleForProduct(updated, productId));
    if (!isFirebaseConfigured()) return;
    await deleteDoc(doc(db, 'reviews', id));
  }, [productId]);

  const uploadReviewImage = useCallback(async (file: File): Promise<string> => uploadToCloudinary(file, 'bake-art-style/reviews'), []);

  const validReviews = safeArray(reviews).filter((r) => r && typeof r.rating === 'number');
  const avgRating = validReviews.length ? validReviews.reduce((sum, review) => sum + review.rating, 0) / validReviews.length : 0;

  return { reviews: safeArray(reviews), loading, fetchReviews, saveReview, approveReview, deleteReview, uploadReviewImage, avgRating };
}
