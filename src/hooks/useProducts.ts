import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { products as DEFAULT_PRODUCTS } from '../lib/data';
import { isSupabaseConfigured, fileToBase64, ls, safeArray } from '../lib/utils';
import type { Product } from '../types';

const LS_KEY = 'bakeart-products-v2';

type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  tag: string | null;
  weight: string | null;
  image: string | null;
  description: string | null;
  approved: boolean;
  badges: string[] | null;
  data?: Product | null;
};

const toOccasion = (category?: string): Product['occasion'] => {
  if (category === 'birthday' || category === 'wedding' || category === 'anniversary' || category === 'cupcakes' || category === 'gift' || category === 'premium') {
    return category;
  }
  return 'birthday';
};

const mapDbRowToProduct = (row: ProductRow): Product => {
  if (row.data && typeof row.data === 'object') {
    return {
      ...row.data,
      id: row.id,
      name: row.data.name || row.name || 'Cake',
      occasion: toOccasion(row.data.occasion || row.category),
      price: Number(row.data.price ?? row.price ?? 0),
      rating: Number(row.data.rating ?? row.rating ?? 0),
      reviews: Number(row.data.reviews ?? row.reviews ?? 0),
      image: row.data.image || row.image || '',
      description: row.data.description || row.description || '',
      approved: row.approved,
      inStock: row.data.inStock ?? true,
    };
  }

  return {
    id: row.id,
    name: row.name || 'Cake',
    tagline: row.tag || row.name || 'Freshly baked',
    description: row.description || '',
    price: Number(row.price ?? 0),
    image: row.image || '',
    rating: Number(row.rating ?? 4.5),
    reviews: Number(row.reviews ?? 0),
    occasion: toOccasion(row.category),
    flavors: ['Chocolate'],
    weights: [{ size: row.weight || '1 lb', price: 0 }],
    tags: row.tag ? [row.tag] : [],
    bestseller: !!row.badges?.includes('bestseller'),
    newArrival: !!row.badges?.includes('new'),
    tier: row.badges?.includes('premium') ? 'premium' : 'normal',
    priceUnit: 'pound',
    inStock: true,
    approved: row.approved,
  };
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => safeArray<Product>(ls.get(LS_KEY, DEFAULT_PRODUCTS), DEFAULT_PRODUCTS));
  const [loading, setLoading] = useState(false);

  const fetchFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, price, rating, reviews, tag, weight, image, description, approved, badges, data')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        const mapped = safeArray<Product>((data as ProductRow[]).map(mapDbRowToProduct));
        setProducts(mapped);
        ls.set(LS_KEY, mapped);
      }
    } catch (e) {
      console.warn('Products fetch failed, using local:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFromSupabase();
  }, [fetchFromSupabase]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const channel = supabase
      .channel(`products-live-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        void fetchFromSupabase();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFromSupabase]);

  const saveProduct = useCallback(async (product: Product) => {
    const all = safeArray<Product>(products, DEFAULT_PRODUCTS);
    const updated = all.find((p) => p.id === product.id)
      ? all.map((p) => (p.id === product.id ? product : p))
      : [...all, product];
    const validated = safeArray<Product>(updated);
    setProducts(validated);
    ls.set(LS_KEY, validated);

    if (!isSupabaseConfigured()) return;

    const badges = [
      product.bestseller ? 'bestseller' : null,
      product.newArrival ? 'new' : null,
      product.tier === 'premium' ? 'premium' : null,
      product.inStock === false ? 'out_of_stock' : null,
    ].filter(Boolean);

    const { error } = await supabase.from('products').upsert({
      id: product.id,
      name: product.name,
      category: product.occasion || 'birthday',
      price: Math.round(product.price),
      rating: product.rating ?? 4.5,
      reviews: product.reviews ?? 0,
      tag: product.tags?.[0] ?? product.tagline ?? null,
      weight: product.weights?.[0]?.size ?? '1 lb',
      image: product.image ?? null,
      description: product.description ?? null,
      approved: product.approved ?? true,
      badges,
      data: product,
    }, { onConflict: 'id' });

    if (error) console.warn('Product save error:', error.message);
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
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `products/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
    if (error || !data) return fileToBase64(file);
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
    return urlData.publicUrl;
  }, []);

  return { products: Array.isArray(products) ? products : [], loading, saveProduct, deleteProduct, uploadProductImage, refetch: fetchFromSupabase };
}
