import { useCallback, useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured, uploadToCloudinary } from '../lib/firebase';
import { ls, safeArray } from '../lib/utils';
import { mapGalleryDoc } from '../lib/firestoreMappers';
import type { GalleryItem } from '../types';

const LS_KEY = 'bakeart-gallery-v2';

export function useGallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>(() => safeArray<GalleryItem>(ls.get(LS_KEY, []), []));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    setLoading(true);
    const q = query(collection(db, 'gallery_items'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const validated = safeArray<GalleryItem>(snap.docs.map((d) => mapGalleryDoc(d.id, d.data())));
      setGallery(validated);
      ls.set(LS_KEY, validated);
      setLoading(false);
    }, (e) => {
      console.warn('Gallery snapshot failed:', e);
      setLoading(false);
    });
    return unsub;
  }, []);

  const fetchGallery = useCallback(async () => {}, []);

  const saveGalleryItem = useCallback(async (item: GalleryItem) => {
    const updated = gallery.find((g) => g.id === item.id) ? gallery.map((g) => (g.id === item.id ? item : g)) : [item, ...gallery];
    const validated = safeArray<GalleryItem>(updated);
    setGallery(validated);
    ls.set(LS_KEY, validated);
    if (!isFirebaseConfigured()) return;
    await setDoc(doc(db, 'gallery_items', item.id), item, { merge: true });
  }, [gallery]);

  const deleteGalleryItem = useCallback(async (id: string) => {
    const updated = gallery.filter((g) => g.id !== id);
    const validated = safeArray<GalleryItem>(updated);
    setGallery(validated);
    ls.set(LS_KEY, validated);
    if (!isFirebaseConfigured()) return;
    await deleteDoc(doc(db, 'gallery_items', id));
  }, [gallery]);

  const uploadGalleryImage = useCallback(async (file: File): Promise<string> => uploadToCloudinary(file, 'bake-art-style/gallery'), []);

  return { gallery: Array.isArray(gallery) ? gallery : [], loading, fetchGallery, saveGalleryItem, deleteGalleryItem, uploadGalleryImage };
}
