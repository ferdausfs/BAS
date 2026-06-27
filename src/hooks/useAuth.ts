import { useCallback, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { useAuthStore, useLocation, useWallet } from '../lib/store';
import { ls } from '../lib/utils';
import type { User } from '../types';

type ProfileDoc = {
  id?: string;
  name?: string | null;
  contact?: string | null;
  email?: string | null;
  is_admin?: boolean | null;
  district?: string | null;
  gps_lat?: number | null;
  gps_lng?: number | null;
  location_address?: string | null;
  location_verified?: boolean | null;
  avatar?: string | null;
};

const profileRef = (id: string) => doc(db, 'profiles', id);

const mapFirebaseUser = async (authUser: FirebaseUser): Promise<User> => {
  const fallbackName = authUser.displayName || authUser.email?.split('@')[0] || 'User';
  const fallbackAvatar = authUser.photoURL || '';

  let profile: ProfileDoc | null = null;
  try {
    const snap = await getDoc(profileRef(authUser.uid));
    profile = snap.exists() ? (snap.data() as ProfileDoc) : null;

    // Load wallet balance
    const walletSnap = await getDoc(doc(db, 'profiles', authUser.uid, 'wallet', 'balance'));
    if (walletSnap.exists()) {
      const w = walletSnap.data();
      useWallet.getState().setWallet({
        balance: Number(w.balance ?? 0),
        totalEarned: Number(w.totalEarned ?? 0),
      });
    }

    if (!profile || profile.email !== (authUser.email || '')) {
      const nextProfile: ProfileDoc = {
        id: authUser.uid,
        name: profile?.name || fallbackName,
        contact: profile?.contact || '',
        email: authUser.email || profile?.email || '',
        is_admin: profile?.is_admin || false,
        district: profile?.district || null,
        gps_lat: profile?.gps_lat ?? null,
        gps_lng: profile?.gps_lng ?? null,
        location_address: profile?.location_address ?? null,
        location_verified: profile?.location_verified || false,
        avatar: profile?.avatar || fallbackAvatar,
      };
      await setDoc(profileRef(authUser.uid), { ...nextProfile, updated_at: serverTimestamp() }, { merge: true });
      profile = nextProfile;
    }
  } catch (error) {
    console.warn('Profile fetch failed during auth hydration:', error);
  }

  const nextUser: User = {
    id: authUser.uid,
    name: profile?.name || fallbackName,
    email: profile?.email || authUser.email || '',
    avatar: profile?.avatar || fallbackAvatar,
    isAdmin: !!profile?.is_admin,
    contact: profile?.contact || '',
    district: profile?.district ?? null,
    gpsLat: profile?.gps_lat ?? null,
    gpsLng: profile?.gps_lng ?? null,
    locationAddress: profile?.location_address ?? null,
    locationVerified: !!profile?.location_verified,
  };

  if (nextUser.locationVerified && nextUser.district) {
    useLocation.getState().setLocation(nextUser.district, nextUser.gpsLat ?? 0, nextUser.gpsLng ?? 0);
  }

  return nextUser;
};

export function useAuth() {
  const { user, login, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        logout();
        return;
      }
      void mapFirebaseUser(firebaseUser).then((hydrated) => {
        if (active) login(hydrated);
      });
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
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await setDoc(profileRef(cred.user.uid), {
          id: cred.user.uid,
          name,
          contact: '',
          email,
          is_admin: false,
          avatar: cred.user.photoURL || '',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        }, { merge: true });
        login(await mapFirebaseUser(cred.user));
        return { needsEmailConfirmation: false };
      }

      const accounts = ls.get<Array<any>>('bakeart-local-accounts', []);
      const existing = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
      if (existing) throw new Error('An account with this email already exists. Please sign in instead.');
      const id = `local-${Date.now()}`;
      ls.set('bakeart-local-accounts', [...accounts, { id, name, email, password }]);
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
        const cred = await signInWithEmailAndPassword(auth, email, password);
        login(await mapFirebaseUser(cred.user));
        return;
      }

      const accounts = ls.get<Array<any>>('bakeart-local-accounts', []);
      const matched = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
      if (!matched) throw new Error('Wrong email or password.');
      login({ id: matched.id, name: matched.name, email, avatar: '', isAdmin: false, contact: '' });
    } catch (error: any) {
      if (String(error?.code || '').startsWith('auth/')) throw new Error('Wrong email or password.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured()) throw new Error('Google login requires Firebase to be configured');
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    login(await mapFirebaseUser(cred.user));
  }, [login]);

  const signOut = useCallback(async () => {
    if (isFirebaseConfigured()) await firebaseSignOut(auth);
    logout();
  }, [logout]);

  return { user, loading, signUp, signIn, signOut, signInWithGoogle };
}
