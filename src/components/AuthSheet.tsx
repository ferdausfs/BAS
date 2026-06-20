import { useState, useRef, useEffect } from 'react';
import { X, Phone, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/utils';

type Step = 'input' | 'otp' | 'profile';
type Method = 'phone' | 'email';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthSheet({ open, onClose, onSuccess }: Props) {
  const { user, sending, verifying, sendOTP, verifyOTP, signOut, signInWithGoogle } = useAuth();
  const [step, setStep] = useState<Step>('input');
  const [method, setMethod] = useState<Method>('phone');
  const [contact, setContact] = useState('');
  const [name, setName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fallbackName = () => {
    if (name.trim()) return name.trim();
    if (method === 'email') return contact.trim().split('@')[0] || 'User';
    return 'Bake Art User';
  };

  const reset = () => {
    setStep('input'); setContact(''); setName(''); setOtpDigits(['', '', '', '', '', '']);
  };

  useEffect(() => { if (!open) reset(); }, [open]);

  if (!open) return null;

  // Logged-in view
  if (user) {
    return (
      <>
        <div className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" onClick={onClose} />
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-[61] bg-[var(--color-cream)] rounded-t-3xl p-6 shadow-2xl">
          <div className="w-10 h-1 bg-[var(--color-ink)]/10 rounded-full mx-auto mb-5" />
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[var(--color-coral)]/10 flex items-center justify-center text-3xl mx-auto mb-3">
              {user.avatar || '👤'}
            </div>
            <p className="font-bold text-[var(--color-ink)] text-lg">{user.name}</p>
            {user.email && <p className="text-sm text-[var(--color-ink)]/50">{user.email}</p>}
          </div>
          <button onClick={() => { signOut(); onClose(); }}
            className="w-full py-3 rounded-2xl bg-red-50 text-red-600 font-bold text-sm mb-2">
            Sign Out
          </button>
          <button onClick={onClose}
            className="w-full py-2.5 text-[var(--color-ink)]/50 text-sm font-medium">
            Close
          </button>
        </div>
      </>
    );
  }

  const handleSend = async () => {
    if (!contact.trim()) { showToast('Please enter your contact', 'err'); return; }
    try {
      await sendOTP(contact.trim(), method);
      setStep('otp');
      if (!isSupabaseConfigured()) showToast(`Demo mode — OTP: 123456`, 'ok');
      else showToast('OTP sent!', 'ok');
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Something went wrong', 'err');
    }
  };

  const handleDigit = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits]; next[i] = d; setOtpDigits(next);
    if (d && i < 5) setTimeout(() => otpRefs.current[i + 1]?.focus(), 0);
  };

  const handleDigitKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
      const next = [...otpDigits]; next[i - 1] = ''; setOtpDigits(next);
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) { showToast('Enter 6-digit OTP', 'err'); return; }
    try {
      await verifyOTP(contact.trim(), code, method, fallbackName());
      showToast('Signed in successfully!', 'ok');
      onSuccess?.();
      onClose();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Wrong OTP', 'err');
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
  };

  const handleProfile = async () => {
    if (!name.trim()) { showToast('Please enter your name', 'err'); return; }
    try {
      await verifyOTP(contact.trim(), otpDigits.join(''), method, name.trim());
      showToast(`Welcome, ${name.trim()}! 🎂`, 'ok');
      onSuccess?.();
      onClose();
    } catch {
      onSuccess?.();
      onClose();
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Google login failed', 'err');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-[61] bg-[var(--color-cream)] rounded-t-3xl shadow-2xl">
        {/* Handle */}
        <div className="w-10 h-1 bg-[var(--color-ink)]/10 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="px-6 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[var(--color-ink)] text-lg">
              {step === 'input' && 'Sign In'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'profile' && 'Your Name'}
            </h2>
            <p className="text-xs text-[var(--color-ink)]/50 mt-0.5">
              {step === 'input' && 'Login or create account'}
              {step === 'otp' && `Code sent to ${contact}`}
              {step === 'profile' && 'OTP verified! Set your name'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--color-ink)]/5 flex items-center justify-center">
            <X className="w-4 h-4 text-[var(--color-ink)]/60" />
          </button>
        </div>

        <div className="px-6 pb-8 space-y-4">
          {/* Toast */}
          {toast && (
            <div className={`px-4 py-2.5 rounded-xl text-sm font-medium ${toast.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {toast.msg}
            </div>
          )}

          {step === 'input' && (
            <>
              {/* Google */}
              <button onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-[var(--color-ink)]/10 bg-white font-bold text-sm text-[var(--color-ink)]">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[var(--color-ink)]/8" />
                <span className="text-xs text-[var(--color-ink)]/40">or</span>
                <div className="flex-1 h-px bg-[var(--color-ink)]/8" />
              </div>

              {/* Method toggle */}
              <div className="flex gap-1 p-1 bg-[var(--color-ink)]/5 rounded-xl">
                {(['phone', 'email'] as Method[]).map((m) => (
                  <button key={m} onClick={() => { setMethod(m); setContact(''); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${method === m ? 'bg-white text-[var(--color-coral)] shadow-sm' : 'text-[var(--color-ink)]/50'}`}>
                    {m === 'phone' ? <Phone className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                    {m === 'phone' ? 'Phone' : 'Email'}
                  </button>
                ))}
              </div>

              <input
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-ink)]/10 bg-white text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]/30"
                type={method === 'phone' ? 'tel' : 'email'}
                placeholder={method === 'phone' ? '01XXXXXXXXX' : 'your@email.com'}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                autoFocus
              />

              <input
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-ink)]/10 bg-white text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]/30"
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />

              <button onClick={handleSend} disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[var(--color-coral)] text-white font-bold text-sm disabled:opacity-60">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {sending ? 'Sending...' : 'Send OTP'}
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="flex justify-center gap-2">
                {otpDigits.map((d, i) => (
                  <input key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1}
                    value={d}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKey(i, e)}
                    className={`w-11 h-12 text-center text-xl font-black rounded-xl border-2 bg-white text-[var(--color-ink)] outline-none transition-all ${d ? 'border-[var(--color-coral)]' : 'border-[var(--color-ink)]/10'} focus:border-[var(--color-coral)]`}
                  />
                ))}
              </div>
              <button onClick={handleVerify} disabled={verifying || otpDigits.join('').length < 6}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[var(--color-coral)] text-white font-bold text-sm disabled:opacity-60">
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {verifying ? 'Verifying...' : 'Verify OTP ✓'}
              </button>
              <div className="flex items-center justify-between text-xs">
                <button onClick={() => { setStep('input'); setOtpDigits(['', '', '', '', '', '']); }}
                  className="text-[var(--color-ink)]/50">← Back</button>
                <button onClick={handleSend} disabled={sending}
                  className="text-[var(--color-coral)] font-medium disabled:opacity-50">
                  Resend OTP
                </button>
              </div>
            </>
          )}

          {step === 'profile' && (
            <>
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl mx-auto mb-2">✅</div>
                <p className="text-sm font-bold text-[var(--color-ink)]">OTP Verified!</p>
              </div>
              <input
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-ink)]/10 bg-white text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]/30"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleProfile()}
                autoFocus
              />
              <button onClick={handleProfile}
                className="w-full py-3.5 rounded-2xl bg-[var(--color-coral)] text-white font-bold text-sm">
                🎂 Let's Go!
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
