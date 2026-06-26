import { useEffect, useState, useCallback } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured, uploadToCloudinary } from '../lib/firebase';
import { banners as DEFAULT_BANNERS } from '../lib/data';
import { ls, safeArray } from '../lib/utils';
import { bannerToDoc, mapBannerDoc } from '../lib/firestoreMappers';
import type { Banner } from '../types';

const LS_KEY = 'bakeart-banners-v2';

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>(() => safeArray<Banner>(ls.get(LS_KEY, DEFAULT_BANNERS), DEFAULT_BANNERS));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    setLoading(true);
    const q = query(collection(db, 'banners'), orderBy('sort_order', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const validated = safeArray<Banner>(snap.docs.map((d) => mapBannerDoc(d.id, d.data())));
      if (validated.length > 0) {
        setBanners(validated);
        ls.set(LS_KEY, validated);
      }
      setLoading(false);
    }, (e) => {
      console.warn('Banners snapshot failed, using local data:', e);
      setLoading(false);
    });
    return unsub;
  }, []);

  const refetch = useCallback(async () => {}, []);

  const saveBanner = useCallback(async (banner: Banner) => {
    const updated = banners.find((b) => b.id === banner.id) ? banners.map((b) => (b.id === banner.id ? banner : b)) : [...banners, banner];
    const validated = safeArray<Banner>(updated);
    setBanners(validated);
    ls.set(LS_KEY, validated);
    if (!isFirebaseConfigured()) return;
    await setDoc(doc(db, 'banners', banner.id), bannerToDoc(banner), { merge: true });
  }, [banners]);

  const deleteBanner = useCallback(async (id: string) => {
    const updated = banners.filter((b) => b.id !== id);
    const validated = safeArray<Banner>(updated);
    setBanners(validated);
    ls.set(LS_KEY, validated);
    if (!isFirebaseConfigured()) return;
    await deleteDoc(doc(db, 'banners', id));
  }, [banners]);

  const uploadBannerImage = useCallback(async (file: File): Promise<string> => uploadToCloudinary(file, 'bake-art-style/banners'), []);

  return { banners: Array.isArray(banners) ? banners : [], loading, saveBanner, deleteBanner, uploadBannerImage, refetch };
}
