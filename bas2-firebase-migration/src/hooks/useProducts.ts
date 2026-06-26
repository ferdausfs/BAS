import { useEffect, useState, useCallback } from 'react';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { uploadToCloudinary, isCloudinaryConfigured } from '../lib/cloudinary';
import { products as DEFAULT_PRODUCTS } from '../lib/data';
import { isSupabaseConfigured, fileToBase64, ls, safeArray } from '../lib/utils';
import type { Product } from '../types';

const LS_KEY = 'bakeart-products-v2';

const toOccasion = (category?: string): Product['occasion'] => {
  if (category === 'birthday' || category === 'wedding' || category === 'anniversary' || category === 'cupcakes' || category === 'gift' || category === 'premium') {
    return category;
  }
  return 'birthday';
};

const mapDbRowToProduct = (row: any): Product => {
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
  const [unsub, setUnsub] = useState<(() => void) | null>(null);

  const fetchFromFirebase = useCallback(async () => {
    if (!isFirebaseConfigured()) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data && data.length > 0) {
        const mapped = safeArray<Product>((data as any[]).map(mapDbRowToProduct));
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
    void fetchFromFirebase();
  }, [fetchFromFirebase]);

  // Realtime with Firestore onSnapshot
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data.length > 0) {
        const mapped = safeArray<Product>((data as any[]).map(mapDbRowToProduct));
        setProducts(mapped);
        ls.set(LS_KEY, mapped);
      }
    });

    setUnsub(() => unsubscribe);
    return () => unsubscribe();
  }, []);

  const saveProduct = useCallback(async (product: Product) => {
    const all = safeArray<Product>(products, DEFAULT_PRODUCTS);
    const updated = all.find((p) => p.id === product.id)
      ? all.map((p) => (p.id === product.id ? product : p))
      : [...all, product];
    const validated = safeArray<Product>(updated);
    setProducts(validated);
    ls.set(LS_KEY, validated);

    if (!isFirebaseConfigured()) return;

    const badges = [
      product.bestseller ? 'bestseller' : null,
      product.newArrival ? 'new' : null,
      product.tier === 'premium' ? 'premium' : null,
      product.inStock === false ? 'out_of_stock' : null,
    ].filter(Boolean);

    const docData = {
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
      created_at: new Date().toISOString(),
    };

    try {
      const refDoc = doc(db, 'products', product.id);
      await updateDoc(refDoc, docData).catch(async () => {
        await setDoc(refDoc, docData); // fallback create
      });
    } catch (e) {
      console.warn('Product save error:', e);
    }
  }, [products]);

  const deleteProduct = useCallback(async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    const validated = safeArray<Product>(updated);
    setProducts(validated);
    ls.set(LS_KEY, validated);
    if (!isFirebaseConfigured()) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.warn('Delete product error:', e);
    }
  }, [products]);

  const uploadProductImage = useCallback(async (file: File): Promise<string> => {
    if (isCloudinaryConfigured()) {
      try {
        return await uploadToCloudinary(file, 'products');
      } catch (e) {
        console.warn('Cloudinary upload failed, falling back to base64:', e);
      }
    }
    return fileToBase64(file);
  }, []);

  return { products: Array.isArray(products) ? products : [], loading, saveProduct, deleteProduct, uploadProductImage, refetch: fetchFromFirebase };
}
