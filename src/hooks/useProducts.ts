import { useEffect, useState, useCallback } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db, uploadToCloudinary } from '../lib/firebase';
import { products as DEFAULT_PRODUCTS } from '../lib/data';
import { safeArray } from '../lib/utils';
import { mapProductDoc, productToDoc } from '../lib/firestoreMappers';
import type { Product } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(false);

  const applyProducts = useCallback((next: Product[]) => {
    const validated = safeArray<Product>(next, DEFAULT_PRODUCTS);
    setProducts(validated.length > 0 ? validated : DEFAULT_PRODUCTS);
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      applyProducts(snap.docs.map((d) => mapProductDoc(d.id, d.data())));
      setLoading(false);
    }, (e) => {
      console.warn('Products snapshot failed:', e);
      setLoading(false);
    });
    return () => unsub();
  }, [applyProducts]);

  const refetch = useCallback(async () => {}, []);

  const saveProduct = useCallback(async (product: Product) => {
    const all = safeArray<Product>(products, DEFAULT_PRODUCTS);
    const updated = all.find((p) => p.id === product.id) ? all.map((p) => (p.id === product.id ? product : p)) : [...all, product];
    const validated = safeArray<Product>(updated, DEFAULT_PRODUCTS);
    setProducts(validated.length > 0 ? validated : DEFAULT_PRODUCTS);
    await setDoc(doc(db, 'products', product.id), productToDoc(product), { merge: true });
  }, [products]);

  const deleteProduct = useCallback(async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    const validated = safeArray<Product>(updated, DEFAULT_PRODUCTS);
    setProducts(validated.length > 0 ? validated : DEFAULT_PRODUCTS);
    await deleteDoc(doc(db, 'products', id));
  }, [products]);

  const uploadProductImage = useCallback(async (file: File): Promise<string> => uploadToCloudinary(file, 'bake-art-style/products'), []);

  return { products: Array.isArray(products) ? products : [], loading, saveProduct, deleteProduct, uploadProductImage, refetch };
}
