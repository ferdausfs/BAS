import { useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { ls, isSupabaseConfigured } from '../lib/utils';

const DEMO_OTP = '123456';

interface PendingOTP { contact: string; otp: string; expires: number; }

const setPendingOTP = (contact: string) => {
  const record: PendingOTP = { contact, otp: DEMO_OTP, expires: Date.now() + 5 * 60 * 1000 };
  ls.set('bakeart-pending-otp', record);
  return DEMO_OTP;
};

const verifyPendingOTP = (contact: string, otp: string): boolean => {
  const record = ls.get<PendingOTP | null>('bakeart-pending-otp', null);
  if (!record) return false;
  if (record.contact !== contact) return false;
  if (Date.now() > record.expires) return false;
  if (record.otp !== otp) return false;
  ls.set('bakeart-pending-otp', null);
  return true;
};

export function useAuth() {
  const { user, login, logout } = useAuthStore();
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        const name = u.user_metadata?.full_name || u.email?.split('@')[0] || 'User';
        const avatar = u.user_metadata?.avatar_url || '👤';
        login({ id: u.id, name, email: u.email || '', avatar });
      }
    });
    return () => subscription.unsubscribe();
  }, [login]);

  const sendOTP = useCallback(async (contact: string, method: 'phone' | 'email'): Promise<void> => {
    setSending(true);
    try {
      if (isSupabaseConfigured()) {
        if (method === 'phone') {
          const phone = contact.startsWith('+') ? contact : `+91${contact.replace(/^0/, '')}`;
          const { error } = await supabase.auth.signInWithOtp({ phone });
          if (error) throw new Error(error.message);
        } else {
          const { error } = await supabase.auth.signInWithOtp({
            email: contact,
            options: { shouldCreateUser: true },
          });
          if (error) throw new Error(error.message);
        }
      } else {
        setPendingOTP(contact);
        // Demo mode — caller should show "OTP: 123456" toast
      }
    } finally {
      setSending(false);
    }
  }, []);

  const verifyOTP = useCallback(async (
    contact: string,
    otp: string,
    method: 'phone' | 'email',
    name: string
  ): Promise<void> => {
    setVerifying(true);
    try {
      if (isSupabaseConfigured()) {
        let userId: string;
        let userEmail = '';
        if (method === 'phone') {
          const phone = contact.startsWith('+') ? contact : `+91${contact.replace(/^0/, '')}`;
          const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
          if (error) throw new Error('Wrong OTP! Please try again.');
          userId = data.user!.id;
        } else {
          const { data, error } = await supabase.auth.verifyOtp({ email: contact, token: otp, type: 'email' });
          if (error) throw new Error('Wrong OTP! Please try again.');
          userId = data.user!.id;
          userEmail = contact;
        }
        if (name) {
          await supabase.from('profiles').upsert({ id: userId, name, contact }, { onConflict: 'id' });
        }
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', userId).single();
        const finalName = profile?.name || name || contact.split('@')[0];
        login({ id: userId, name: finalName, email: userEmail, avatar: '👤' });
      } else {
        if (!verifyPendingOTP(contact, otp)) throw new Error(`Wrong OTP! In demo mode, use ${DEMO_OTP}`);
        if (!name.trim()) throw new Error('Please enter your name');
        const users = ls.get<Array<{ id: string; name: string; contact: string }>>('bakeart-local-users', []);
        const existing = users.find((u) => u.contact === contact);
        const userId = existing?.id || `local-${Date.now()}`;
        const finalName = name || existing?.name || contact;
        if (!existing) {
          ls.set('bakeart-local-users', [...users, { id: userId, name: finalName, contact }]);
        }
        login({ id: userId, name: finalName, email: contact.includes('@') ? contact : '', avatar: '👤' });
      }
    } finally {
      setVerifying(false);
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

  return { user, sending, verifying, sendOTP, verifyOTP, signOut, signInWithGoogle };
}
