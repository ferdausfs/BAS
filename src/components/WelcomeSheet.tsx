import { User } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { useT } from '../lib/i18n';
import { useModalDepth } from '../hooks/useModalDepth';
import { useSheetTransition } from '../hooks/useSheetTransition';
import BrandLogo from './BrandLogo';

export default function WelcomeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuthStore();
  const t = useT();
  const { mounted, closing } = useSheetTransition(open);
  useModalDepth(mounted);

  if (!mounted || !user) return null;

  const firstName = user.name.trim().split(/\s+/)[0] || t('welcome.friend');

  return (
    <>
      <div
        className={`fixed inset-0 z-[140] bg-ink/45 ${closing ? 'anim-fade-out' : 'anim-fade'}`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-x-5 top-1/2 z-[141] mx-auto w-full max-w-[360px] -translate-y-1/2 overflow-hidden rounded-[28px] border border-border bg-surface shadow-float ${closing ? 'anim-fade-out' : 'anim-scale'}`}
        role="dialog"
        aria-labelledby="welcome-title"
      >
        <div className="bg-secondary px-6 pb-8 pt-8 text-center">
          <div className="mx-auto mb-4">
            <BrandLogo size={44} />
          </div>
          <div className="mx-auto flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full bg-surface shadow-card ring-4 ring-coral/20">
            {user.avatar && user.avatar.length > 2 ? (
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-9 w-9 text-coral" strokeWidth={1.7} />
            )}
          </div>
          <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.18em] text-coral">
            {t('welcome.kicker')}
          </p>
          <h2 id="welcome-title" className="mt-1.5 text-[26px] font-bold tracking-tight text-ink">
            {t('welcome.title', { name: firstName })}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-300">
            {t('welcome.body')}
          </p>
        </div>
        <div className="px-6 pb-6 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-coral text-[15px] font-bold text-white shadow-btn transition active:scale-[0.98]"
          >
            {t('welcome.cta')}
          </button>
        </div>
      </div>
    </>
  );
}
