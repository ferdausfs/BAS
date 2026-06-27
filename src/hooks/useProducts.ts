import { useEffect, useState, useCallback } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured, uploadToCloudinary } from '../lib/firebase';
import { products as DEFAULT_PRODUCTS } from '../lib/data';
import { ls, safeArray } from '../lib/utils';
import { mapProductDoc, productToDoc } from '../lib/firestoreMappers';
import type { Product } from '../types';

const LS_KEY = 'bakeart-products-v2';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => safeArray<Product>(ls.get(LS_KEY, DEFAULT_PRODUCTS), DEFAULT_PRODUCTS));
  const [loading, setLoading] = useState(false);

  const applyProducts = useCallback((next: Product[]) => {
    const validated = safeArray<Product>(next, DEFAULT_PRODUCTS);
    if (validated.length > 0) {
      setProducts(validated);
      ls.set(LS_KEY, validated);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    setLoading(true);
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      const prods = snap.docs.map((d) => mapProductDoc(d.id, d.data()));
      applyProducts(prods.sort((a, b) => b.price - a.price));
      setLoading(false);
    }, (e) => {
      console.warn('Products snapshot failed, using local:', e);
      setLoading(false);
    });
    return unsub;
  }, [applyProducts]);

  const refetch = useCallback(async () => {}, []);

  const saveProduct = useCallback(async (product: Product) => {
    const all = safeArray<Product>(products, DEFAULT_PRODUCTS);
    const updated = all.find((p) => p.id === product.id) ? all.map((p) => (p.id === product.id ? product : p)) : [...all, product];
    const validated = safeArray<Product>(updated);
    setProducts(validated);
    ls.set(LS_KEY, validated);
    if (!isFirebaseConfigured()) return;
    await setDoc(doc(db, 'products', product.id), productToDoc(product), { merge: true });
  }, [products]);

  const deleteProduct = useCallback(async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    const validated = safeArray<Product>(updated);
    setProducts(validated);
    ls.set(LS_KEY, validated);
    if (!isFirebaseConfigured()) return;
    await deleteDoc(doc(db, 'products', id));
  }, [products]);

  const uploadProductImage = useCallback(async (file: File): Promise<string> => uploadToCloudinary(file, 'bake-art-style/products'), []);

  return { products: Array.isArray(products) ? products : [], loading, saveProduct, deleteProduct, uploadProductImage, refetch };
}
