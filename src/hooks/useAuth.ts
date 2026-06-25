import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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

const mapSupabaseUser = async (authUser: any): Promise<User> => {
  const fallbackName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
  const fallbackAvatar = authUser.user_metadata?.avatar_url || '';

  let profile: ProfileRow | null = null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, contact, email, is_admin, district, gps_lat, gps_lng, location_address, location_verified')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) throw error;
    profile = data as ProfileRow | null;

    if (!profile || profile.email !== (authUser.email || '')) {
      await supabase.from('profiles').upsert({
        id: authUser.id,
        name: profile?.name || fallbackName,
        contact: profile?.contact || '',
        email: authUser.email || profile?.email || '',
        is_admin: profile?.is_admin || false,
        district: profile?.district || null,
        gps_lat: profile?.gps_lat || null,
        gps_lng: profile?.gps_lng || null,
        location_address: profile?.location_address || null,
        location_verified: profile?.location_verified || false,
      }, { onConflict: 'id' });

      profile = {
        id: authUser.id,
        name: profile?.name || fallbackName,
        contact: profile?.contact || '',
        email: authUser.email || profile?.email || '',
        is_admin: profile?.is_admin || false,
        district: profile?.district || null,
        gps_lat: profile?.gps_lat || null,
        gps_lng: profile?.gps_lng || null,
        location_address: profile?.location_address || null,
        location_verified: profile?.location_verified || false,
      };
    }
  } catch (error) {
    console.warn('Profile fetch failed during auth hydration:', error);
  }

  const nextUser: User = {
    id: authUser.id,
    name: profile?.name || fallbackName,
    email: profile?.email || authUser.email || '',
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
    if (!isSupabaseConfigured()) return;

    let active = true;

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active || !data.session?.user) return;
      const hydrated = await mapSupabaseUser(data.session.user);
      if (active) login(hydrated);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        logout();
        return;
      }
      void mapSupabaseUser(session.user).then((hydrated) => {
        if (active) login(hydrated);
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [login, logout]);

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<{ needsEmailConfirmation: boolean }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw new Error(error.message);
        if (data.user) {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              name,
              contact: '',
              email,
              is_admin: false,
            },
            { onConflict: 'id' }
          );
          if (!data.session) {
            return { needsEmailConfirmation: true };
          }
          const hydrated = await mapSupabaseUser(data.user);
          login(hydrated);
          return { needsEmailConfirmation: false };
        }
        return { needsEmailConfirmation: true };
      }

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
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error('Wrong email or password.');
        if (data.user) {
          const hydrated = await mapSupabaseUser(data.user);
          login(hydrated);
        }
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
    if (!isSupabaseConfigured()) {
      throw new Error('Google login requires Supabase to be configured');
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured()) await supabase.auth.signOut();
    logout();
  }, [logout]);

  return { user, loading, signUp, signIn, signOut, signInWithGoogle };
}
