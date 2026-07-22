import { useCallback, useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured, uploadToCloudinary } from '../lib/firebase';
import { safeArray } from '../lib/utils';
import { mapGalleryDoc, sanitizeForFirestore } from '../lib/firestoreMappers';
import type { GalleryItem } from '../types';

export function useGallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setGallery([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, 'gallery_items'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const validated = safeArray<GalleryItem>(snap.docs.map((d) => mapGalleryDoc(d.id, d.data())), []);
      setGallery(validated);
      setLoading(false);
    }, (e) => {
      console.warn('Gallery snapshot failed:', e);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const fetchGallery = useCallback(async () => {}, []);

  const saveGalleryItem = useCallback(async (item: GalleryItem) => {
    setGallery((prev) => {
      const updated = (prev ?? []).find((g) => g.id === item.id)
        ? (prev ?? []).map((g) => (g.id === item.id ? item : g))
        : [item, ...(prev ?? [])];
      return safeArray<GalleryItem>(updated, []);
    });
    if (!isFirebaseConfigured()) return;
    try {
      await setDoc(doc(db, 'gallery_items', item.id), sanitizeForFirestore(item), { merge: true });
    } catch (e) {
      console.error('Gallery save failed:', e);
    }
  }, []);

  const deleteGalleryItem = useCallback(async (id: string) => {
    setGallery((prev) => safeArray<GalleryItem>((prev ?? []).filter((g) => g.id !== id), []));
    if (!isFirebaseConfigured()) return;
    try {
      await deleteDoc(doc(db, 'gallery_items', id));
    } catch (e) {
      console.error('Gallery delete failed:', e);
    }
  }, []);

  const uploadGalleryImage = useCallback(async (file: File): Promise<string> => uploadToCloudinary(file, 'bake-art-style/gallery'), []);

  return { gallery: Array.isArray(gallery) ? gallery : [], loading, fetchGallery, saveGalleryItem, deleteGalleryItem, uploadGalleryImage };
}
