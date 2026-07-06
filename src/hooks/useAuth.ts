import { useCallback, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  onAuthStateChanged,
  RecaptchaVerifier,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type ConfirmationResult,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { claimReferralRewards, getReferralCode, useAuthStore, useLocation, useUI } from '../lib/store';
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
  referral_code?: string | null;
};

const profileRef = (id: string) => doc(db, 'profiles', id);

// Shared across every useAuth() call so we only ever create one invisible
// reCAPTCHA widget, and only ever try to consume a magic-link URL once.
let recaptchaVerifier: RecaptchaVerifier | null = null;
let magicLinkChecked = false;
const MAGIC_LINK_EMAIL_KEY = 'bas_emailForSignIn';

const mapFirebaseUser = async (authUser: FirebaseUser): Promise<User> => {
  const fallbackName = authUser.displayName || authUser.email?.split('@')[0] || 'User';
  const fallbackAvatar = authUser.photoURL || '';

  let profile: ProfileDoc | null = null;
  try {
    const snap = await getDoc(profileRef(authUser.uid));
    profile = snap.exists() ? (snap.data() as ProfileDoc) : null;

    const profileEmail = authUser.email || profile?.email || '';
    const refCode = getReferralCode({ email: profileEmail, id: authUser.uid });

    if (!profile || profile.email !== (authUser.email || '')) {
      const nextProfile: ProfileDoc = {
        id: authUser.uid,
        name: profile?.name || fallbackName,
        contact: profile?.contact || '',
        email: profileEmail,
        is_admin: profile?.is_admin || false,
        district: profile?.district || null,
        gps_lat: profile?.gps_lat ?? null,
        gps_lng: profile?.gps_lng ?? null,
        location_address: profile?.location_address ?? null,
        location_verified: profile?.location_verified || false,
        avatar: profile?.avatar || fallbackAvatar,
        referral_code: profile?.referral_code || refCode || null,
      };
      await setDoc(profileRef(authUser.uid), { ...nextProfile, updated_at: serverTimestamp() }, { merge: true });
      profile = nextProfile;
    }

    if (!profile?.referral_code && refCode) {
      await setDoc(profileRef(authUser.uid), { referral_code: refCode }, { merge: true });
      profile = { ...(profile ?? {}), referral_code: refCode };
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
    let active = true;

    // One-time: if the user opened this app from an email magic-link,
    // complete the sign-in. Guarded at module scope so it only runs once
    // even though useAuth() is called from more than one component.
    if (!magicLinkChecked) {
      magicLinkChecked = true;
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const storedEmail = window.localStorage.getItem(MAGIC_LINK_EMAIL_KEY);
        const email = storedEmail || window.prompt('কনফার্ম করতে আপনার email address দিন:');
        if (email) {
          signInWithEmailLink(auth, email, window.location.href)
            .then(async (cred) => {
              window.localStorage.removeItem(MAGIC_LINK_EMAIL_KEY);
              if (active) login(await mapFirebaseUser(cred.user));
              window.history.replaceState({}, document.title, window.location.pathname);
            })
            .catch((error) => console.warn('Magic-link sign-in failed:', error));
        }
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        logout();
        return;
      }
      void mapFirebaseUser(firebaseUser).then(async (hydrated) => {
        if (active) {
          login(hydrated);

          // Auto-claim referral rewards after login, even if ProfileScreen is not opened.
          const myCode = getReferralCode(hydrated);
          if (myCode) {
            const claimed = await claimReferralRewards(myCode);
            if (claimed > 0) {
              useUI.getState().addNotification(
                '🎉 Referral reward!',
                `৳${claimed * 100} wallet-এ যোগ হয়েছে`
              );
            }
          }
        }
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
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const refCode = getReferralCode({ email, id: cred.user.uid });
      await setDoc(profileRef(cred.user.uid), {
        id: cred.user.uid,
        name,
        contact: '',
        email,
        is_admin: false,
        avatar: cred.user.photoURL || '',
        referral_code: refCode ?? null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }, { merge: true });
      login(await mapFirebaseUser(cred.user));
      return { needsEmailConfirmation: false };
    } finally {
      setLoading(false);
    }
  }, [login]);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      login(await mapFirebaseUser(cred.user));
      return;
    } catch (error: any) {
      if (String(error?.code || '').startsWith('auth/')) throw new Error('Wrong email or password.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    login(await mapFirebaseUser(cred.user));
  }, [login]);

  // Requires the Facebook provider to be turned on in Firebase Console
  // (Authentication → Sign-in method → Facebook), with the App ID/Secret
  // from a Facebook App created at developers.facebook.com.
  const signInWithFacebook = useCallback(async () => {
    const provider = new FacebookAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    login(await mapFirebaseUser(cred.user));
  }, [login]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    logout();
  }, [logout]);

  // Phone OTP — `containerId` must be an element already present in the DOM
  // (an invisible reCAPTCHA still needs somewhere to mount to).
  const sendPhoneOtp = useCallback(async (phoneNumber: string, containerId: string): Promise<ConfirmationResult> => {
    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
    }
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  }, []);

  const confirmPhoneOtp = useCallback(async (confirmation: ConfirmationResult, code: string) => {
    const cred = await confirmation.confirm(code);
    login(await mapFirebaseUser(cred.user));
  }, [login]);

  // Email magic-link — no password, no Cloud Function needed. Firebase sends
  // the email itself; clicking the link (handled above, on mount) creates the
  // account automatically if it doesn't exist yet.
  const sendMagicLink = useCallback(async (email: string) => {
    await sendSignInLinkToEmail(auth, email, {
      url: window.location.origin + window.location.pathname,
      handleCodeInApp: true,
    });
    window.localStorage.setItem(MAGIC_LINK_EMAIL_KEY, email);
  }, []);

  return {
    user, loading, signUp, signIn, signOut, signInWithGoogle, signInWithFacebook,
    sendPhoneOtp, confirmPhoneOtp, sendMagicLink,
  };
}
