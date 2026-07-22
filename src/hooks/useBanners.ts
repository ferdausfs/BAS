import { useCallback, useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured, uploadToCloudinary } from '../lib/firebase';
import { banners as DEFAULT_BANNERS } from '../lib/data';
import { safeArray } from '../lib/utils';
import { bannerToDoc, mapBannerDoc, sanitizeForFirestore } from '../lib/firestoreMappers';
import type { Banner } from '../types';

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setBanners(DEFAULT_BANNERS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, 'banners'), orderBy('sort_order', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const validated = safeArray<Banner>(snap.docs.map((d) => mapBannerDoc(d.id, d.data())), DEFAULT_BANNERS);
      setBanners(validated.length > 0 ? validated : DEFAULT_BANNERS);
      setLoading(false);
    }, (e) => {
      console.warn('Banners snapshot failed:', e);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const refetch = useCallback(async () => {}, []);

  const saveBanner = useCallback(async (banner: Banner) => {
    setBanners((prev) => {
      const updated = (prev ?? []).find((b) => b.id === banner.id)
        ? (prev ?? []).map((b) => (b.id === banner.id ? banner : b))
        : [banner, ...(prev ?? [])];
      const validated = safeArray<Banner>(updated, DEFAULT_BANNERS);
      return validated.length > 0 ? validated : DEFAULT_BANNERS;
    });
    if (!isFirebaseConfigured()) return;
    try {
      await setDoc(doc(db, 'banners', banner.id), sanitizeForFirestore(bannerToDoc(banner)), { merge: true });
    } catch (e) {
      console.error('Banner save/delete failed:', e);
    }
  }, []);

  const deleteBanner = useCallback(async (id: string) => {
    setBanners((prev) => {
      const updated = (prev ?? []).filter((b) => b.id !== id);
      const validated = safeArray<Banner>(updated, DEFAULT_BANNERS);
      return validated.length > 0 ? validated : DEFAULT_BANNERS;
    });
    if (!isFirebaseConfigured()) return;
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (e) {
      console.error('Banner save/delete failed:', e);
    }
  }, []);

  const uploadBannerImage = useCallback(async (file: File): Promise<string> => uploadToCloudinary(file, 'bake-art-style/banners'), []);

  return { banners: Array.isArray(banners) ? banners : [], loading, saveBanner, deleteBanner, uploadBannerImage, refetch };
}
