import { useCallback, useEffect, useState } from 'react';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthStore, useLocation } from '../lib/store';
import { isSupabaseConfigured, ls } from '../lib/utils';
import type { User } from '../types';

type ProfileRow = {
  id: string;
  name: string | null;
  contact: string | null;
  email: string | null;
  is_admin: boolean | null;
  district?: string | null;
  gps_lat?: number | null;
  gps_lng?: number | null;
  location_address?: string | null;
  location_verified?: boolean | null;
};

const mapFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const fallbackName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
  const fallbackAvatar = firebaseUser.photoURL || '';

  let profile: ProfileRow | null = null;

  try {
    if (isFirebaseConfigured()) {
      const profileRef = doc(db, 'profiles', firebaseUser.uid);
      const snap = await getDoc(profileRef);

      if (snap.exists()) {
        profile = snap.data() as ProfileRow;
      } else {
        // Create initial profile
        profile = {
          id: firebaseUser.uid,
          name: fallbackName,
          contact: '',
          email: firebaseUser.email || '',
          is_admin: false,
          district: null,
          gps_lat: null,
          gps_lng: null,
          location_address: null,
          location_verified: false,
        };
        await setDoc(profileRef, profile);
      }
    }
  } catch (error) {
    console.warn('Profile fetch failed during auth hydration:', error);
  }

  const nextUser: User = {
    id: firebaseUser.uid,
    name: profile?.name || fallbackName,
    email: profile?.email || firebaseUser.email || '',
    avatar: fallbackAvatar,
    isAdmin: !!profile?.is_admin,
    contact: profile?.contact || '',
    district: profile?.district ?? null,
    gpsLat: profile?.gps_lat ?? null,
    gpsLng: profile?.gps_lng ?? null,
    locationAddress: profile?.location_address ?? null,
    locationVerified: !!profile?.location_verified,
  };

  if (nextUser.locationVerified && nextUser.district) {
    useLocation.getState().setLocation(
      nextUser.district,
      nextUser.gpsLat ?? 0,
      nextUser.gpsLng ?? 0
    );
  }

  return nextUser;
};

export function useAuth() {
  const { user, login, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!active) return;

      if (!firebaseUser) {
        logout();
        return;
      }

      const hydrated = await mapFirebaseUser(firebaseUser);
      if (active) login(hydrated);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [login, logout]);

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<{ needsEmailConfirmation: boolean }> => {
    setLoading(true);
    try {
      if (isFirebaseConfigured()) {
        const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

        // Create profile
        await setDoc(doc(db, 'profiles', firebaseUser.uid), {
          id: firebaseUser.uid,
          name,
          contact: '',
          email,
          is_admin: false,
          district: null,
          gps_lat: null,
          gps_lng: null,
          location_address: null,
          location_verified: false,
        });

        const hydrated = await mapFirebaseUser(firebaseUser);
        login(hydrated);
        return { needsEmailConfirmation: false };
      }

      // Local demo mode
      const accounts = ls.get<Array<any>>('bakeart-local-accounts', []);
      const existing = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      const id = `local-${Date.now()}`;
      const newAcc = { id, name, email, password };
      ls.set('bakeart-local-accounts', [...accounts, newAcc]);
      login({ id, name, email, avatar: '', isAdmin: false, contact: '' });
      return { needsEmailConfirmation: false };
    } finally {
      setLoading(false);
    }
  }, [login]);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      if (isFirebaseConfigured()) {
        const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
        const hydrated = await mapFirebaseUser(firebaseUser);
        login(hydrated);
        return;
      }

      const accounts = ls.get<Array<any>>('bakeart-local-accounts', []);
      const matched = accounts.find(
        (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
      );
      if (!matched) {
        throw new Error('Wrong email or password.');
      }
      login({ id: matched.id, name: matched.name, email, avatar: '', isAdmin: false, contact: '' });
    } finally {
      setLoading(false);
    }
  }, [login]);

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      throw new Error('Google login requires Firebase to be configured');
    }
    const provider = new GoogleAuthProvider();
    const { user: firebaseUser } = await signInWithPopup(auth, provider);
    const hydrated = await mapFirebaseUser(firebaseUser);
    login(hydrated);
  }, [login]);

  const signOut = useCallback(async () => {
    if (isFirebaseConfigured()) {
      await firebaseSignOut(auth);
    }
    logout();
  }, [logout]);

  return { user, loading, signUp, signIn, signOut, signInWithGoogle };
}
