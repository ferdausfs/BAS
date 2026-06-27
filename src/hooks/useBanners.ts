import { useEffect, useState, useCallback } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db, uploadToCloudinary } from '../lib/firebase';
import { banners as DEFAULT_BANNERS } from '../lib/data';
import { safeArray } from '../lib/utils';
import { bannerToDoc, mapBannerDoc } from '../lib/firestoreMappers';
import type { Banner } from '../types';

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    const updated = banners.find((b) => b.id === banner.id) ? banners.map((b) => (b.id === banner.id ? banner : b)) : [...banners, banner];
    const validated = safeArray<Banner>(updated, DEFAULT_BANNERS);
    setBanners(validated.length > 0 ? validated : DEFAULT_BANNERS);
    await setDoc(doc(db, 'banners', banner.id), bannerToDoc(banner), { merge: true });
  }, [banners]);

  const deleteBanner = useCallback(async (id: string) => {
    const updated = banners.filter((b) => b.id !== id);
    const validated = safeArray<Banner>(updated, DEFAULT_BANNERS);
    setBanners(validated.length > 0 ? validated : DEFAULT_BANNERS);
    await deleteDoc(doc(db, 'banners', id));
  }, [banners]);

  const uploadBannerImage = useCallback(async (file: File): Promise<string> => uploadToCloudinary(file, 'bake-art-style/banners'), []);

  return { banners: Array.isArray(banners) ? banners : [], loading, saveBanner, deleteBanner, uploadBannerImage, refetch };
}
