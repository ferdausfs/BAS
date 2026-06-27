import { useCallback, useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db, uploadToCloudinary } from '../lib/firebase';
import { safeArray } from '../lib/utils';
import { mapReviewDoc, sanitizeForFirestore } from '../lib/firestoreMappers';
import type { Review } from '../types';

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const constraints: any[] = [orderBy('created_at', 'desc')];
    if (productId) constraints.unshift(where('approved', '==', true), where('product_id', '==', productId));
    const q = query(collection(db, 'reviews'), ...constraints);
    const unsub = onSnapshot(q, (snap) => {
      const validated = sanitizeReviews(snap.docs.map((d) => mapReviewDoc(d.id, d.data())));
      setReviews(productId ? validated.filter((r) => r.approved) : validated);
      setLoading(false);
    }, (e) => {
      console.warn('Reviews snapshot failed:', e);
      setLoading(false);
    });
    return () => unsub();
  }, [productId]);

  const fetchReviews = useCallback(async (_pid?: string) => {}, []);

  const saveReview = useCallback(async (review: Review) => {
    const updated = sanitizeReviews([review, ...reviews]);
    setReviews(visibleForProduct(updated, productId));
    await setDoc(doc(db, 'reviews', review.id), sanitizeForFirestore(review), { merge: true }).catch(async () => { await addDoc(collection(db, 'reviews'), sanitizeForFirestore(review)); });
  }, [productId, reviews]);

  const approveReview = useCallback(async (id: string, approved: boolean) => {
    const updated = sanitizeReviews(reviews.map((r) => (r.id === id ? { ...r, approved } : r)));
    setReviews(visibleForProduct(updated, productId));
    await updateDoc(doc(db, 'reviews', id), { approved });
  }, [productId, reviews]);

  const deleteReview = useCallback(async (id: string) => {
    const updated = sanitizeReviews(reviews.filter((r) => r.id !== id));
    setReviews(visibleForProduct(updated, productId));
    await deleteDoc(doc(db, 'reviews', id));
  }, [productId, reviews]);

  const uploadReviewImage = useCallback(async (file: File): Promise<string> => uploadToCloudinary(file, 'bake-art-style/reviews'), []);

  const validReviews = safeArray(reviews).filter((r) => r && typeof r.rating === 'number');
  const avgRating = validReviews.length ? validReviews.reduce((sum, review) => sum + review.rating, 0) / validReviews.length : 0;

  return { reviews: safeArray(reviews), loading, fetchReviews, saveReview, approveReview, deleteReview, uploadReviewImage, avgRating };
}
