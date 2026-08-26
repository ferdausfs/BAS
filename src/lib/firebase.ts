import { initializeApp, getApps } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  inMemoryPersistence,
  indexedDBLocalPersistence,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'placeholder-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'placeholder-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:placeholder',
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const createAuth = () => {
  try {
    // Incognito / Safari private often blocks IndexedDB. Fall through to
    // localStorage, then memory, instead of crashing the whole app.
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence],
    });
  } catch {
    return getAuth(app);
  }
};

export const auth = createAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);

export const isFirebaseConfigured = (): boolean =>
  !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID
  );

export const firebaseAuthMessage = (error: unknown): string => {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: string }).code)
    : '';
  const raw = error instanceof Error ? error.message : '';
  const haystack = `${code} ${raw}`;

  if (/network-request-failed|network/i.test(haystack)) {
    return 'ইন্টারনেট সংযোগ পাওয়া যায়নি। Wi-Fi বা মোবাইল ডাটা চেক করে আবার চেষ্টা করুন।';
  }
  if (/too-many-requests/i.test(haystack)) {
    return 'অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন।';
  }
  if (/popup-closed-by-user|popup-blocked|cancelled-popup-request/i.test(haystack)) {
    return 'Login উইন্ডো বন্ধ হয়ে গেছে। আবার চেষ্টা করুন।';
  }
  if (/operation-not-allowed/i.test(haystack)) {
    return 'এই login পদ্ধতি এখন চালু নেই।';
  }
  if (/invalid-credential|wrong-password|user-not-found|invalid-email/i.test(haystack)) {
    return 'ইমেইল বা পাসওয়ার্ড ঠিক নেই।';
  }
  if (/invalid-phone|invalid-verification/i.test(haystack)) {
    return 'ফোন নম্বর বা OTP ঠিক নেই।';
  }
  if (code.startsWith('auth/')) {
    return 'Login করা যায়নি। আবার চেষ্টা করুন।';
  }
  return raw || 'Login করা যায়নি। আবার চেষ্টা করুন।';
};

export async function uploadToCloudinary(file: File, folder = 'bake-art-style'): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary not configured');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);
  form.append('folder', folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    console.warn('Cloudinary upload failed:', await response.text());
    throw new Error('Cloudinary upload failed');
  }

  const data = await response.json();
  if (!data.secure_url && !data.url) {
    throw new Error('Cloudinary upload returned no URL');
  }

  return data.secure_url || data.url;
}
