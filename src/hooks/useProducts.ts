import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { products as DEFAULT_PRODUCTS } from '../lib/data';
import { isSupabaseConfigured, fileToBase64, ls, safeArray } from '../lib/utils';
import type { Product } from '../types';

const LS_KEY = 'bakeart-products-v2';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => safeArray<Product>(ls.get(LS_KEY, DEFAULT_PRODUCTS), DEFAULT_PRODUCTS));
  const [loading, setLoading] = useState(false);

  const fetchFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        const validated = safeArray<Product>(data);
        setProducts(validated);
        ls.set(LS_KEY, validated);
      }
    } catch (e) { console.warn('Products fetch failed, using local data:', e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFromSupabase(); }, [fetchFromSupabase]);

  const saveProduct = useCallback(async (product: Product) => {
    const updated = products.find((p) => p.id === product.id)
      ? products.map((p) => (p.id === product.id ? product : p))
      : [...products, product];
    const validated = safeArray<Product>(updated);
    setProducts(validated);
    ls.set(LS_KEY, validated);
    if (!isSupabaseConfigured()) return;
    await supabase.from('products').upsert(product);
  }, [products]);

  const deleteProduct = useCallback(async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    const validated = safeArray<Product>(updated);
    setProducts(validated);
    ls.set(LS_KEY, validated);
    if (!isSupabaseConfigured()) return;
    await supabase.from('products').delete().eq('id', id);
  }, [products]);

  const uploadProductImage = useCallback(async (file: File): Promise<string> => {
    if (!isSupabaseConfigured()) return fileToBase64(file);
    const ext = file.name.split('.').pop();
    const path = `products/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('product-images').upload(path, file);
    if (error || !data) return fileToBase64(file);
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
    return urlData.publicUrl;
  }, []);

  return { products, loading, saveProduct, deleteProduct, uploadProductImage, refetch: fetchFromSupabase };
}
