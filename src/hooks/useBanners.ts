import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { banners as DEFAULT_BANNERS } from '../lib/data';
import { isSupabaseConfigured, fileToBase64, ls, safeArray } from '../lib/utils';
import type { Banner } from '../types';

const LS_KEY = 'bakeart-banners-v2';

type BannerRow = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  color: string;
  type: Banner['type'];
  promo_code?: string | null;
  product_id?: string | null;
  notice_text?: string | null;
  active?: boolean | null;
  sort_order?: number | null;
  link?: string | null;
};

const mapBannerRow = (row: BannerRow): Banner => ({
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

  const fetchFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('id, title, subtitle, image, tag, color, type, promo_code, product_id, notice_text, active, sort_order, link')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        const validated = safeArray<Banner>((data as BannerRow[]).map(mapBannerRow));
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
    void fetchFromSupabase();
  }, [fetchFromSupabase]);

  const saveBanner = useCallback(async (banner: Banner) => {
    const updated = banners.find((b) => b.id === banner.id)
      ? banners.map((b) => (b.id === banner.id ? banner : b))
      : [...banners, banner];
    const validated = safeArray<Banner>(updated);
    setBanners(validated);
    ls.set(LS_KEY, validated);
    if (!isSupabaseConfigured()) return;
    await supabase.from('banners').upsert({
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
    }, { onConflict: 'id' });
  }, [banners]);

  const deleteBanner = useCallback(async (id: string) => {
    const updated = banners.filter((b) => b.id !== id);
    const validated = safeArray<Banner>(updated);
    setBanners(validated);
    ls.set(LS_KEY, validated);
    if (!isSupabaseConfigured()) return;
    await supabase.from('banners').delete().eq('id', id);
  }, [banners]);

  const uploadBannerImage = useCallback(async (file: File): Promise<string> => {
    if (!isSupabaseConfigured()) return fileToBase64(file);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `banners/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('banner-images').upload(path, file, { upsert: false });
    if (error || !data) return fileToBase64(file);
    const { data: urlData } = supabase.storage.from('banner-images').getPublicUrl(path);
    return urlData.publicUrl;
  }, []);

  return { banners: Array.isArray(banners) ? banners : [], loading, saveBanner, deleteBanner, uploadBannerImage, refetch: fetchFromSupabase };
}
