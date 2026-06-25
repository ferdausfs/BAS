import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ls, isSupabaseConfigured, fileToBase64, safeArray } from '../lib/utils';
import type { GalleryItem } from '../types';

const LS_KEY = 'bakeart-gallery-v2';

export function useGallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>(() => safeArray<GalleryItem>(ls.get(LS_KEY, []), []));
  const [loading, setLoading] = useState(false);

  const fetchGallery = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_items').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const validated = safeArray<GalleryItem>(data);
        setGallery(validated);
        ls.set(LS_KEY, validated);
      }
    } catch (e) { console.warn('Gallery fetch failed:', e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void fetchGallery();
  }, [fetchGallery]);

  const saveGalleryItem = useCallback(async (item: GalleryItem) => {
    const updated = gallery.find((g) => g.id === item.id)
      ? gallery.map((g) => (g.id === item.id ? item : g))
      : [item, ...gallery];
    const validated = safeArray<GalleryItem>(updated);
    setGallery(validated);
    ls.set(LS_KEY, validated);
    if (!isSupabaseConfigured()) return;
    await supabase.from('gallery_items').upsert(item);
  }, [gallery]);

  const deleteGalleryItem = useCallback(async (id: string) => {
    const updated = gallery.filter((g) => g.id !== id);
    const validated = safeArray<GalleryItem>(updated);
    setGallery(validated);
    ls.set(LS_KEY, validated);
    if (!isSupabaseConfigured()) return;
    await supabase.from('gallery_items').delete().eq('id', id);
  }, [gallery]);

  const uploadGalleryImage = useCallback(async (file: File): Promise<string> => {
    if (!isSupabaseConfigured()) return fileToBase64(file);
    const ext = file.name.split('.').pop();
    const path = `gallery/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('gallery').upload(path, file);
    if (error || !data) return fileToBase64(file);
    const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path);
    return urlData.publicUrl;
  }, []);

  return { gallery: Array.isArray(gallery) ? gallery : [], loading, fetchGallery, saveGalleryItem, deleteGalleryItem, uploadGalleryImage };
}
