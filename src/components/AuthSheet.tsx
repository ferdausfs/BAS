import { useEffect, useState } from 'react';
import type { ConfirmationResult } from 'firebase/auth';
import { ArrowLeft, Eye, EyeOff, Loader2, User, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { firebaseAuthMessage } from '../lib/firebase';
import { useModalDepth } from '../hooks/useModalDepth';
import { useSheetTransition } from '../hooks/useSheetTransition';
import { hapticTap } from '../lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const toE164Bangladesh = (raw: string): string | null => {
  const digits = raw.replace(/\D/g, '').replace(/^880/, '').replace(/^0/, '');
  if (!/^1[3-9]\d{8}$/.test(digits)) return null;
  return `+880${digits}`;
};

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

type Step = 'home' | 'otp' | 'email';

export function AuthSheet({ open, onClose, onSuccess }: Props) {
  const {
    user, loading, signUp, signIn, signOut, signInWithGoogle,
    sendPhoneOtp, confirmPhoneOtp, sendMagicLink, resetPassword,
  } = useAuth();

  const [step, setStep] = useState<Step>('home');
  const [emailNew, setEmailNew] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const { mounted, closing } = useSheetTransition(open);
  useModalDepth(mounted);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 4000);
  };

  const finish = () => {
    hapticTap();
    onSuccess?.();
    onClose();
  };

  const reset = () => {
    setStep('home');
    setEmailNew(false);
    setEmail('');
    setPassword('');
    setName('');
    setShowPassword(false);
    setMagicSent(false);
    setIdentifier('');
    setOtp('');
    setConfirmation(null);
    setBusy(false);
    setToast(null);
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  if (!mounted) return null;

  const handleGoogle = () => {
    // Must start Firebase in this click tick — setState first blocks the popup.
    void signInWithGoogle()
      .then((kind) => {
        if (kind === 'redirect') return;
        finish();
      })
      .catch((e: unknown) => {
        showToast(firebaseAuthMessage(e), 'err');
      });
  };

  const handleSendOtp = async () => {
    const e164 = toE164Bangladesh(identifier);
    if (!e164) {
      showToast('সঠিক মোবাইল নম্বর বা ইমেইল দিন', 'err');
      return;
    }
    setBusy(true);
    try {
      const result = await sendPhoneOtp(e164, 'auth-recaptcha-container');
      setConfirmation(result);
      setOtp('');
      setStep('otp');
      showToast('কোড পাঠানো হয়েছে', 'ok');
    } catch (e: unknown) {
      showToast(firebaseAuthMessage(e), 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleContinue = () => {
    const raw = identifier.trim();
    if (validateEmail(raw)) {
      setEmail(raw);
      setToast(null);
      setStep('email');
      return;
    }
    void handleSendOtp();
  };

  const handleVerifyOtp = async () => {
    if (!confirmation) return;
    if (otp.trim().length !== 6) {
      showToast('৬ ডিজিটের কোড দিন', 'err');
      return;
    }
    setBusy(true);
    try {
      await confirmPhoneOtp(confirmation, otp.trim());
      finish();
    } catch {
      showToast('ভুল কোড, আবার চেষ্টা করুন', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleEmailContinue = async () => {
    if (!email.trim() || !validateEmail(email)) {
      showToast('সঠিক ইমেইল দিন', 'err');
      return;
    }
    if (password.length < 6) {
      showToast('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর', 'err');
      return;
    }
    if (emailNew) {
      if (!name.trim()) {
        showToast('আপনার নাম লিখুন', 'err');
        return;
      }
      try {
        await signUp(email.trim(), password, name.trim());
        finish();
      } catch (e: unknown) {
        showToast(firebaseAuthMessage(e), 'err');
      }
      return;
    }
    try {
      await signIn(email.trim(), password);
      finish();
    } catch (e: unknown) {
      showToast(firebaseAuthMessage(e), 'err');
    }
  };

  const handleMagic = async () => {
    if (!email.trim() || !validateEmail(email)) {
      showToast('লিংক পাঠাতে সঠিক ইমেইল দিন', 'err');
      return;
    }
    try {
      await sendMagicLink(email.trim());
      setMagicSent(true);
    } catch (e: unknown) {
      showToast(firebaseAuthMessage(e), 'err');
    }
  };

  const handleReset = async () => {
    if (!email.trim() || !validateEmail(email)) {
      showToast('রিসেট পাঠাতে সঠিক ইমেইল দিন', 'err');
      return;
    }
    try {
      await resetPassword(email.trim());
      showToast('ইমেইলে রিসেট লিংক পাঠানো হয়েছে', 'ok');
    } catch (e: unknown) {
      showToast(firebaseAuthMessage(e), 'err');
    }
  };

  const title =
    step === 'otp' ? 'কোড দিন'
      : step === 'email' ? (emailNew ? 'নতুন অ্যাকাউন্ট' : 'ইমেইল দিয়ে')
        : 'লগইন করুন';
  const subtitle =
    step === 'otp' ? `${toE164Bangladesh(identifier) ?? identifier} নম্বরে ৬ ডিজিটের কোড গেছে`
      : step === 'email' ? (emailNew ? 'নাম, ইমেইল আর একটি পাসওয়ার্ড দিলেই হবে' : 'আগের অ্যাকাউন্ট থাকলে ইমেইল ও পাসওয়ার্ড দিন')
        : 'নম্বর, ইমেইল বা Google — নতুন হলে নিজেই অ্যাকাউন্ট হবে';

  return (
    <>
      <div className={`fixed inset-0 z-[130] bg-ink/45 ${closing ? 'anim-fade-out' : 'anim-fade'}`} onClick={onClose} />
      <div className={`fixed bottom-0 left-1/2 z-[131] max-h-[90dvh] w-full max-w-[420px] -translate-x-1/2 overflow-y-auto rounded-t-[28px] border border-border bg-surface shadow-float ${closing ? 'anim-down' : 'anim-up'}`}>
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-divider" />

        <div className="flex items-start justify-between gap-3 px-6 pb-2 pt-4">
          <div className="min-w-0">
            {step !== 'home' && (
              <button
                type="button"
                onClick={() => {
                  setToast(null);
                  if (step === 'otp') {
                    setStep('home');
                    setOtp('');
                    setConfirmation(null);
                    return;
                  }
                  setStep('home');
                  setEmailNew(false);
                  setMagicSent(false);
                }}
                className="mb-2 flex items-center gap-1 text-[12px] font-bold text-coral"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> পেছনে
              </button>
            )}
            <h2 className="text-[22px] font-bold tracking-tight text-ink">{title}</h2>
            <p className="mt-1 text-[13px] leading-snug text-ink-300">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-secondary text-ink-300 transition active:scale-90"
            aria-label="বন্ধ"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-6 pb-8 pt-2">
          {toast && (
            <div className={`rounded-[14px] px-4 py-2.5 text-[13px] font-medium ${toast.type === 'ok' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
              {toast.msg}
            </div>
          )}

          {user ? (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-secondary">
                {user.avatar && user.avatar.length > 2 ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-coral" strokeWidth={1.75} />
                )}
              </div>
              <p className="text-[16px] font-bold text-ink">{user.name}</p>
              {user.email && <p className="mt-0.5 text-[13px] text-ink-300">{user.email}</p>}
              <button
                type="button"
                onClick={() => { void signOut(); onClose(); }}
                className="mt-5 h-12 w-full rounded-2xl bg-error/10 text-[14px] font-bold text-error transition active:scale-[0.98]"
              >
                সাইন আউট
              </button>
            </div>
          ) : step === 'home' ? (
            <>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-bold text-ink-300">নম্বর বা ইমেইল</span>
                <input
                  className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[16px] font-medium text-ink shadow-card outline-none placeholder:text-ink-200 focus:border-coral focus:ring-2 focus:ring-coral/15"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="01XXXXXXXXX বা ইমেইল"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value.slice(0, 80))}
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                />
              </label>
              <button
                type="button"
                onClick={handleContinue}
                disabled={busy}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-coral text-[15px] font-bold text-white shadow-btn transition active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {busy ? 'অপেক্ষা করুন...' : validateEmail(identifier.trim()) ? 'চালিয়ে যান' : 'কোড পাঠান'}
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-divider" />
                <span className="text-[11px] font-medium text-ink-200">অথবা</span>
                <div className="h-px flex-1 bg-divider" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-border bg-surface text-[14px] font-bold text-ink shadow-card transition active:scale-[0.98]"
              >
                <GoogleMark />
                Google দিয়ে চালিয়ে যান
              </button>
            </>
          ) : step === 'otp' ? (
            <>
              <input
                className="h-14 w-full rounded-2xl border border-border bg-surface px-4 text-center text-[22px] font-bold tabular tracking-[0.45em] text-ink outline-none focus:border-coral focus:ring-2 focus:ring-coral/15"
                type="tel"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && void handleVerifyOtp()}
              />
              <button
                type="button"
                onClick={() => void handleVerifyOtp()}
                disabled={busy}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-coral text-[15px] font-bold text-white shadow-btn transition active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {busy ? 'যাচাই হচ্ছে...' : 'নিশ্চিত করুন'}
              </button>
              <button
                type="button"
                onClick={() => void handleSendOtp()}
                disabled={busy}
                className="w-full text-center text-[12px] font-bold text-ink-300"
              >
                কোড আসেনি? আবার পাঠান
              </button>
            </>
          ) : (
            <>
              {emailNew && (
                <input
                  className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] font-medium text-ink shadow-card outline-none placeholder:text-ink-200 focus:border-coral focus:ring-2 focus:ring-coral/15"
                  type="text"
                  autoComplete="name"
                  placeholder="আপনার নাম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <input
                className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] font-medium text-ink shadow-card outline-none placeholder:text-ink-200 focus:border-coral focus:ring-2 focus:ring-coral/15"
                type="email"
                autoComplete="email"
                placeholder="আপনার ইমেইল"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <input
                  className="h-12 w-full rounded-2xl border border-border bg-surface px-4 pr-12 text-[15px] font-medium text-ink shadow-card outline-none placeholder:text-ink-200 focus:border-coral focus:ring-2 focus:ring-coral/15"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={emailNew ? 'new-password' : 'current-password'}
                  placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void handleEmailContinue()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-200"
                  aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => void handleEmailContinue()}
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-coral text-[15px] font-bold text-white shadow-btn transition active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {emailNew ? 'অ্যাকাউন্ট খুলুন' : 'লগইন'}
              </button>
              <button
                type="button"
                onClick={() => { setEmailNew((v) => !v); setToast(null); }}
                className="w-full text-center text-[13px] font-bold text-coral"
              >
                {emailNew ? 'আগে অ্যাকাউন্ট আছে? লগইন করুন' : 'নতুন? অ্যাকাউন্ট খুলুন'}
              </button>
              {!emailNew && (
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => void handleReset()} className="text-[12px] font-bold text-ink-300">
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                  {magicSent ? (
                    <p className="text-center text-[12px] font-medium text-ink-300">
                      {email}-এ লগইন লিংক গেছে। ইমেইল খুলে ট্যাপ করুন।
                    </p>
                  ) : (
                    <button type="button" onClick={() => void handleMagic()} className="text-[12px] font-bold text-ink-300">
                      পাসওয়ার্ড ছাড়া ইমেইল লিংক পাঠান
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          <div id="auth-recaptcha-container" />
        </div>
      </div>
    </>
  );
}
