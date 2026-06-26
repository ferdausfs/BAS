import { useCallback, useEffect, useState } from 'react';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { uploadToCloudinary, isCloudinaryConfigured } from '../lib/cloudinary';
import { ls, isSupabaseConfigured, fileToBase64, safeArray } from '../lib/utils';
import type { GalleryItem } from '../types';

const LS_KEY = 'bakeart-gallery-v2';

export function useGallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>(() => safeArray<GalleryItem>(ls.get(LS_KEY, []), []));
  const [loading, setLoading] = useState(false);

  const fetchGallery = useCallback(async () => {
    if (!isFirebaseConfigured()) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'gallery_items'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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

  // Realtime
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const q = query(collection(db, 'gallery_items'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const validated = safeArray<GalleryItem>(data);
      setGallery(validated);
      ls.set(LS_KEY, validated);
    });
    return () => unsubscribe();
  }, []);

  const saveGalleryItem = useCallback(async (item: GalleryItem) => {
    const updated = gallery.find((g) => g.id === item.id)
      ? gallery.map((g) => (g.id === item.id ? item : g))
      : [item, ...gallery];
    const validated = safeArray<GalleryItem>(updated);
    setGallery(validated);
    ls.set(LS_KEY, validated);
    if (!isFirebaseConfigured()) return;
    try {
      const refDoc = doc(db, 'gallery_items', item.id);
      await updateDoc(refDoc, item).catch(async () => {
        await setDoc(refDoc, { ...item, created_at: new Date().toISOString() });
      });
    } catch (e) { console.warn('Save gallery error:', e); }
  }, [gallery]);

  const deleteGalleryItem = useCallback(async (id: string) => {
    const updated = gallery.filter((g) => g.id !== id);
    const validated = safeArray<GalleryItem>(updated);
    setGallery(validated);
    ls.set(LS_KEY, validated);
    if (!isFirebaseConfigured()) return;
    try {
      await deleteDoc(doc(db, 'gallery_items', id));
    } catch (e) { console.warn('Delete gallery error:', e); }
  }, [gallery]);

  const uploadGalleryImage = useCallback(async (file: File): Promise<string> => {
    if (isCloudinaryConfigured()) {
      try {
        return await uploadToCloudinary(file, 'gallery');
      } catch (e) {
        console.warn('Cloudinary upload failed, falling back to base64:', e);
      }
    }
    return fileToBase64(file);
  }, []);

  return { gallery: Array.isArray(gallery) ? gallery : [], loading, fetchGallery, saveGalleryItem, deleteGalleryItem, uploadGalleryImage };
}
