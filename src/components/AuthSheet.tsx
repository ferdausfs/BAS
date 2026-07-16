import { useState, useEffect } from 'react';
import type { ConfirmationResult } from 'firebase/auth';
import { X, Eye, EyeOff, Loader2, User, Mail, Phone as PhoneIcon, KeyRound, Link2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useModalDepth } from '../hooks/useModalDepth';
import { useSheetTransition } from '../hooks/useSheetTransition';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Flip to true once the Facebook App has passed Business Verification and is
// Published/Live — until then, opening the real Facebook OAuth popup just
// shows the user Facebook's own "Sorry, something went wrong" error page.
const FACEBOOK_LOGIN_LIVE = false;

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Bangladesh mobile numbers: 01XXXXXXXXX (11 digits) → +8801XXXXXXXXX for Firebase.
const toE164Bangladesh = (raw: string): string | null => {
  const digits = raw.replace(/\D/g, '').replace(/^880/, '').replace(/^0/, '');
  if (!/^1[3-9]\d{8}$/.test(digits)) return null;
  return `+880${digits}`;
};

export function AuthSheet({ open, onClose, onSuccess }: Props) {
  const {
    user, loading, signUp, signIn, signOut, signInWithGoogle, signInWithFacebook,
    sendPhoneOtp, confirmPhoneOtp, sendMagicLink,
  } = useAuth();

  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [emailLoginMode, setEmailLoginMode] = useState<'password' | 'magiclink'>('password');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState<'enter' | 'verify'>('enter');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [phoneBusy, setPhoneBusy] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const { mounted, closing } = useSheetTransition(open);
  useModalDepth(mounted);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const reset = () => {
    setMethod('email');
    setEmailLoginMode('password');
    setMagicLinkSent(false);
    setMode('signin');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setShowPassword(false);
    setNeedsConfirmation(false);
    setPhone('');
    setOtp('');
    setPhoneStep('enter');
    setConfirmation(null);
    setPhoneBusy(false);
    setToast(null);
  };

  useEffect(() => { if (!open) reset(); }, [open]);

  if (!mounted) return null;

  // Logged-in view
  if (user) {
    return (
      <>
        <div className={`fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm ${closing ? 'anim-fade-out' : 'anim-fade'}`} onClick={onClose} />
        <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-[61] glass-strong rounded-t-3xl p-6 shadow-2xl ${closing ? 'anim-down' : 'anim-up'}`}>
          <div className="w-10 h-1 bg-[var(--color-ink)]/10 rounded-full mx-auto mb-5" />
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[var(--color-coral)]/10 flex items-center justify-center mx-auto mb-3">
              {user.avatar && user.avatar.length > 2 ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <User className="w-8 h-8 text-[var(--color-coral)]" strokeWidth={1.75} />
              )}
            </div>
            <p className="font-display font-bold text-[var(--color-ink)] text-lg">{user.name}</p>
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

  const handleSignIn = async () => {
    if (!email.trim() || !validateEmail(email)) {
      showToast('Please enter a valid email.', 'err');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'err');
      return;
    }
    try {
      await signIn(email.trim(), password);
      showToast('Signed in successfully!', 'ok');
      onSuccess?.();
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Wrong email or password.', 'err');
    }
  };

  const handleSignUp = async () => {
    if (!name.trim()) {
      showToast('Please enter your name.', 'err');
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      showToast('Please enter a valid email.', 'err');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'err');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'err');
      return;
    }
    try {
      const res = await signUp(email.trim(), password, name.trim());
      if (res.needsEmailConfirmation) {
        setNeedsConfirmation(true);
      } else {
        showToast('Account created successfully!', 'ok');
        onSuccess?.();
        onClose();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to create account.', 'err');
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Google login failed', 'err');
    }
  };

  const handleFacebook = async () => {
    try {
      await signInWithFacebook();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Facebook login failed', 'err');
    }
  };

  const handleSendMagicLink = async () => {
    if (!email.trim() || !validateEmail(email)) {
      showToast('সঠিক email দিন।', 'err');
      return;
    }
    try {
      await sendMagicLink(email.trim());
      setMagicLinkSent(true);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Link পাঠাতে ব্যর্থ হয়েছে।', 'err');
    }
  };

  const handleSendOtp = async () => {
    const e164 = toE164Bangladesh(phone);
    if (!e164) {
      showToast('সঠিক ফোন নম্বর দিন, যেমন 01XXXXXXXXX', 'err');
      return;
    }
    setPhoneBusy(true);
    try {
      const result = await sendPhoneOtp(e164, 'auth-recaptcha-container');
      setConfirmation(result);
      setPhoneStep('verify');
      showToast(`OTP পাঠানো হয়েছে ${e164} নম্বরে`, 'ok');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'OTP পাঠাতে ব্যর্থ হয়েছে।', 'err');
    } finally {
      setPhoneBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmation) return;
    if (otp.trim().length !== 6) {
      showToast('৬ ডিজিটের কোড দিন।', 'err');
      return;
    }
    setPhoneBusy(true);
    try {
      await confirmPhoneOtp(confirmation, otp.trim());
      showToast('Login সফল হয়েছে!', 'ok');
      onSuccess?.();
      onClose();
    } catch (e: unknown) {
      showToast('ভুল কোড, আবার চেষ্টা করুন।', 'err');
    } finally {
      setPhoneBusy(false);
    }
  };

  const showSocialButtons = !magicLinkSent && phoneStep === 'enter';

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm ${closing ? 'anim-fade-out' : 'anim-fade'}`} onClick={onClose} />
      <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-[61] glass-strong rounded-t-3xl shadow-2xl ${closing ? 'anim-down' : 'anim-up'}`}>
        {/* Handle */}
        <div className="w-10 h-1 bg-[var(--color-ink)]/10 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="px-6 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-[var(--color-ink)] text-xl tracking-tight">
              {needsConfirmation ? 'Check Your Email' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-xs text-[var(--color-ink)]/50 mt-0.5">
              {needsConfirmation
                ? `Verification link sent to ${email}`
                : mode === 'signin'
                ? 'Sign in to access your orders and settings'
                : 'Create an account to start ordering delicious cakes'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--color-ink)]/5 flex items-center justify-center">
            <X className="w-4 h-4 text-[var(--color-ink)]/60" />
          </button>
        </div>

        <div className="px-6 pb-8 space-y-4">
          {/* Toast */}
          {toast && (
            <div className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${toast.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {toast.msg}
            </div>
          )}

          {needsConfirmation ? (
            <div className="text-center py-4 space-y-4">
              <div className="flex justify-center text-[var(--color-coral)]">
                <Mail size={48} strokeWidth={1.5} />
              </div>
              <p className="text-sm text-[var(--color-ink)]/70 font-medium">
                We have sent a verification link to <span className="font-bold text-[var(--color-ink)]">{email}</span>. Please click the link to confirm your account before signing in.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-[var(--color-coral)] text-white font-bold text-sm"
              >
                Got it
              </button>
            </div>
          ) : (
            <>
              {/* Method switcher — Email / Phone */}
              <div className="flex gap-1 p-1 bg-[var(--color-ink)]/5 rounded-xl">
                {([
                  { id: 'email' as const, label: 'Email', Icon: Mail },
                  { id: 'phone' as const, label: 'Phone', Icon: PhoneIcon },
                ]).map(({ id, label, Icon }) => (
                  <button key={id} onClick={() => { setMethod(id); setToast(null); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${method === id ? 'bg-white text-[var(--color-coral)] shadow-sm' : 'text-[var(--color-ink)]/50'}`}>
                    <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                    {label}
                  </button>
                ))}
              </div>

              {/* ---------------- EMAIL ---------------- */}
              {method === 'email' && emailLoginMode === 'password' && (
                <div className="space-y-4">
                  {/* Sign in / Create account toggle */}
                  <div className="flex gap-1 p-1 bg-[var(--color-ink)]/5 rounded-xl">
                    {([
                      { id: 'signin', label: 'Sign In' },
                      { id: 'signup', label: 'Create Account' }
                    ] as const).map((m) => (
                      <button key={m.id} onClick={() => { setMode(m.id); setToast(null); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${mode === m.id ? 'bg-white text-[var(--color-coral)] shadow-sm' : 'text-[var(--color-ink)]/50'}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {mode === 'signup' && (
                    <input
                      className="w-full px-4 py-3 rounded-2xl border border-[var(--color-ink)]/10 bg-white text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]/30 transition-shadow"
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                    />
                  )}

                  <input
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--color-ink)]/10 bg-white text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]/30 transition-shadow"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (mode === 'signin' ? handleSignIn() : handleSignUp())}
                  />

                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 pr-10 rounded-2xl border border-[var(--color-ink)]/10 bg-white text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]/30 transition-shadow"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password (min 6 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (mode === 'signin' ? handleSignIn() : handleSignUp())}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink)]/40 hover:text-[var(--color-ink)]/60"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {mode === 'signup' && (
                    <input
                      className="w-full px-4 py-3 rounded-2xl border border-[var(--color-ink)]/10 bg-white text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]/30 transition-shadow"
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                    />
                  )}

                  <button onClick={mode === 'signin' ? handleSignIn : handleSignUp} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[var(--color-coral)] text-white font-bold text-sm shadow-[0_8px_20px_-8px_rgba(168,103,46,0.55)] active:scale-[0.98] transition-transform disabled:opacity-60">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? (mode === 'signin' ? 'Signing In...' : 'Creating Account...') : (mode === 'signin' ? 'Sign In' : 'Create Account')}
                  </button>

                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setEmailLoginMode('magiclink'); setToast(null); }}
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--color-coral)]"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      Password ছাড়া, email-এ login link পাঠান
                    </button>
                  )}
                </div>
              )}

              {method === 'email' && emailLoginMode === 'magiclink' && (
                <div className="space-y-4">
                  {!magicLinkSent ? (
                    <>
                      <div className="rounded-2xl bg-[var(--color-coral)]/8 px-4 py-3 flex items-start gap-2.5">
                        <KeyRound className="w-4 h-4 text-[var(--color-coral)] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-[var(--color-ink)]/70 leading-relaxed">
                          Email দিন, আমরা একটা login link পাঠাবো। Link-এ ক্লিক করলেই login হয়ে যাবে — password লাগবে না।
                        </p>
                      </div>
                      <input
                        className="w-full px-4 py-3 rounded-2xl border border-[var(--color-ink)]/10 bg-white text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]/30 transition-shadow"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMagicLink()}
                      />
                      <button onClick={handleSendMagicLink}
                        className="w-full py-3.5 rounded-2xl bg-[var(--color-coral)] text-white font-bold text-sm shadow-[0_8px_20px_-8px_rgba(168,103,46,0.55)] active:scale-[0.98] transition-transform">
                        Login Link পাঠান
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-2 space-y-3">
                      <div className="flex justify-center text-[var(--color-coral)]">
                        <Mail size={40} strokeWidth={1.5} />
                      </div>
                      <p className="text-sm text-[var(--color-ink)]/70 font-medium">
                        <span className="font-bold text-[var(--color-ink)]">{email}</span>-এ login link পাঠানো হয়েছে। Email খুলে link-এ ক্লিক করুন।
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setEmailLoginMode('password'); setMagicLinkSent(false); setToast(null); }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--color-ink)]/50"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Password দিয়ে login করুন
                  </button>
                </div>
              )}

              {/* ---------------- PHONE ---------------- */}
              {method === 'phone' && phoneStep === 'enter' && (
                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--color-ink)]/50">+880</span>
                    <input
                      className="w-full pl-16 pr-4 py-3 rounded-2xl border border-[var(--color-ink)]/10 bg-white text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]/30 transition-shadow"
                      type="tel"
                      inputMode="numeric"
                      placeholder="1XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    />
                  </div>
                  <button onClick={handleSendOtp} disabled={phoneBusy}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[var(--color-coral)] text-white font-bold text-sm shadow-[0_8px_20px_-8px_rgba(168,103,46,0.55)] active:scale-[0.98] transition-transform disabled:opacity-60">
                    {phoneBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {phoneBusy ? 'পাঠানো হচ্ছে...' : 'OTP পাঠান'}
                  </button>
                </div>
              )}

              {method === 'phone' && phoneStep === 'verify' && (
                <div className="space-y-4">
                  <p className="text-xs text-[var(--color-ink)]/60 text-center">
                    <span className="font-bold text-[var(--color-ink)]">+880{phone.replace(/\D/g, '').replace(/^880/, '').replace(/^0/, '')}</span>-এ পাঠানো ৬ ডিজিটের কোড দিন
                  </p>
                  <input
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--color-ink)]/10 bg-white text-[var(--color-ink)] text-center text-xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]/30 transition-shadow"
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="······"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                  />
                  <button onClick={handleVerifyOtp} disabled={phoneBusy}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[var(--color-coral)] text-white font-bold text-sm shadow-[0_8px_20px_-8px_rgba(168,103,46,0.55)] active:scale-[0.98] transition-transform disabled:opacity-60">
                    {phoneBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {phoneBusy ? 'যাচাই হচ্ছে...' : 'Verify & Continue'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPhoneStep('enter'); setOtp(''); setConfirmation(null); setToast(null); }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--color-ink)]/50"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    নম্বর বদলান
                  </button>
                </div>
              )}

              {/* Invisible reCAPTCHA mount point for Phone OTP — must stay in the DOM */}
              <div id="auth-recaptcha-container" />

              {showSocialButtons && (
                <>
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-[var(--color-ink)]/8" />
                    <span className="text-xs text-[var(--color-ink)]/40">or</span>
                    <div className="flex-1 h-px bg-[var(--color-ink)]/8" />
                  </div>

                  {/* Google */}
                  <button onClick={handleGoogle}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-[var(--color-ink)]/10 bg-white font-bold text-sm text-[var(--color-ink)] active:scale-[0.98] transition-transform">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  {/* Facebook — gated behind FACEBOOK_LOGIN_LIVE until the app is Published */}
                  {FACEBOOK_LOGIN_LIVE ? (
                    <button onClick={handleFacebook}
                      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-[var(--color-ink)]/10 bg-white font-bold text-sm text-[var(--color-ink)] active:scale-[0.98] transition-transform">
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.09 24 12.07z"/>
                      </svg>
                      Continue with Facebook
                    </button>
                  ) : (
                    <div
                      title="Facebook App এখনো Meta-র Business Verification/Publish প্রক্রিয়ায় আছে"
                      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-dashed border-[var(--color-ink)]/15 bg-[var(--color-ink)]/[0.02] font-bold text-sm text-[var(--color-ink)]/35 cursor-not-allowed select-none"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" opacity="0.5">
                        <path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.09 24 12.07z"/>
                      </svg>
                      Facebook — শীঘ্রই আসছে
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
