import { useEffect, useState, useCallback } from 'react';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { uploadToCloudinary, isCloudinaryConfigured } from '../lib/cloudinary';
import { banners as DEFAULT_BANNERS } from '../lib/data';
import { isSupabaseConfigured, fileToBase64, ls, safeArray } from '../lib/utils';
import type { Banner } from '../types';

const LS_KEY = 'bakeart-banners-v2';

const mapBannerRow = (row: any): Banner => ({
  id: row.id,
  title: row.title || '',
  subtitle: row.subtitle || '',
  image: row.image || '',
  tag: row.tag || 'Shop Now',
  color: row.color || '#FFE2E7',
  type: row.type || 'new_item',
  promoCode: row.promo_code || undefined,
  productId: row.product_id || undefined,
  noticeText: row.notice_text || undefined,
  active: row.active ?? true,
  sortOrder: row.sort_order ?? 0,
  link: row.link || undefined,
});

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>(() => safeArray<Banner>(ls.get(LS_KEY, DEFAULT_BANNERS), DEFAULT_BANNERS));
  const [loading, setLoading] = useState(false);

  const fetchFromFirebase = useCallback(async () => {
    if (!isFirebaseConfigured()) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'banners'), orderBy('sort_order', 'asc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data && data.length > 0) {
        const validated = safeArray<Banner>((data as any[]).map(mapBannerRow));
        setBanners(validated);
        ls.set(LS_KEY, validated);
      }
    } catch (e) {
      console.warn('Banners fetch failed, using local data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFromFirebase();
  }, [fetchFromFirebase]);

  // Realtime
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const q = query(collection(db, 'banners'), orderBy('sort_order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data.length > 0) {
        const validated = safeArray<Banner>((data as any[]).map(mapBannerRow));
        setBanners(validated);
        ls.set(LS_KEY, validated);
      }
    });
    return () => unsubscribe();
  }, []);

  const saveBanner = useCallback(async (banner: Banner) => {
    const updated = banners.find((b) => b.id === banner.id)
      ? banners.map((b) => (b.id === banner.id ? banner : b))
      : [...banners, banner];
    const validated = safeArray<Banner>(updated);
    setBanners(validated);
    ls.set(LS_KEY, validated);
    if (!isFirebaseConfigured()) return;

    try {
      const refDoc = doc(db, 'banners', banner.id);
      await updateDoc(refDoc, {
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image,
        tag: banner.tag,
        color: banner.color,
        type: banner.type,
        promo_code: banner.promoCode ?? null,
        product_id: banner.productId ?? null,
        notice_text: banner.noticeText ?? null,
        active: banner.active ?? true,
        sort_order: banner.sortOrder ?? 0,
        link: banner.link ?? null,
      }).catch(async () => {
        await setDoc(refDoc, { ...banner, created_at: new Date().toISOString() });
      });
    } catch (e) {
      console.warn('Banner save error:', e);
    }
  }, [banners]);

  const deleteBanner = useCallback(async (id: string) => {
    const updated = banners.filter((b) => b.id !== id);
    const validated = safeArray<Banner>(updated);
    setBanners(validated);
    ls.set(LS_KEY, validated);
    if (!isFirebaseConfigured()) return;
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (e) {
      console.warn('Delete banner error:', e);
    }
  }, [banners]);

  const uploadBannerImage = useCallback(async (file: File): Promise<string> => {
    if (isCloudinaryConfigured()) {
      try {
        return await uploadToCloudinary(file, 'banners');
      } catch (e) {
        console.warn('Cloudinary upload failed, falling back to base64:', e);
      }
    }
    return fileToBase64(file);
  }, []);

  return { banners: Array.isArray(banners) ? banners : [], loading, saveBanner, deleteBanner, uploadBannerImage, refetch: fetchFromFirebase };
}
