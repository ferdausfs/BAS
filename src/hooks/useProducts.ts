import { useCallback, useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured, uploadToCloudinary } from '../lib/firebase';
import { products as DEFAULT_PRODUCTS } from '../lib/data';
import { safeArray } from '../lib/utils';
import { mapProductDoc, productToDoc, sanitizeForFirestore } from '../lib/firestoreMappers';
import type { Product } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(false);

  const applyProducts = useCallback((next: Product[]) => {
    const validated = safeArray<Product>(next, DEFAULT_PRODUCTS);
    setProducts(validated.length > 0 ? validated : DEFAULT_PRODUCTS);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setProducts(DEFAULT_PRODUCTS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      const prods = snap.docs
        .map((d) => mapProductDoc(d.id, d.data()))
        .sort((a, b) => b.price - a.price);
      applyProducts(prods);
      setLoading(false);
    }, (e) => {
      console.warn('Products snapshot failed:', e);
      setLoading(false);
    });
    return () => unsub();
  }, [applyProducts]);

  const refetch = useCallback(async () => {}, []);

  const saveProduct = useCallback(async (product: Product) => {
    setProducts((prev) => {
      const all = safeArray<Product>(prev, DEFAULT_PRODUCTS);
      const updated = all.find((p) => p.id === product.id)
        ? all.map((p) => (p.id === product.id ? product : p))
        : [...all, product];
      const validated = safeArray<Product>(updated, DEFAULT_PRODUCTS);
      return validated.length > 0 ? validated : DEFAULT_PRODUCTS;
    });
    if (!isFirebaseConfigured()) return;
    await setDoc(doc(db, 'products', product.id), sanitizeForFirestore(productToDoc(product)), { merge: true })
      .catch((e) => console.error('Product save failed:', e));
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setProducts((prev) => {
      const updated = (prev ?? []).filter((p: Product) => p.id !== id);
      const validated = safeArray<Product>(updated, DEFAULT_PRODUCTS);
      return validated.length > 0 ? validated : DEFAULT_PRODUCTS;
    });
    if (!isFirebaseConfigured()) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.error('Product delete failed:', e);
    }
  }, []);

  const uploadProductImage = useCallback(async (file: File): Promise<string> => uploadToCloudinary(file, 'bake-art-style/products'), []);

  return { products: Array.isArray(products) ? products : [], loading, saveProduct, deleteProduct, uploadProductImage, refetch };
}
