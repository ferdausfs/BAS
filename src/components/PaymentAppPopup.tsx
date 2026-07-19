import { ExternalLink } from 'lucide-react';
import { useModalDepth } from '../hooks/useModalDepth';
import { useSheetTransition } from '../hooks/useSheetTransition';
import { openPaymentApp } from '../lib/utils';

type Props = { open: boolean; onClose: () => void; method: 'bkash' | 'nagad'; number: string; };
const METHOD_META = {
  bkash: { label: 'bKash', color: '#E2136E', bg: '#FCE8F1' },
  nagad: { label: 'Nagad', color: '#EC6608', bg: '#FEF0E6' },
} as const;

export default function PaymentAppPopup({ open, onClose, method, number }: Props) {
  const { mounted, closing } = useSheetTransition(open);
  useModalDepth(mounted);
  if (!mounted) return null;
  const meta = METHOD_META[method];

  return (
    <div className={`fixed inset-0 z-[140] flex items-center justify-center p-5 ${closing ? 'anim-fade-out' : 'anim-fade'}`} role="dialog" aria-modal="true" aria-label={`${meta.label} payment`}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-ink/45" onClick={onClose} />
      <div className={`relative w-full max-w-[336px] overflow-hidden rounded-[24px] border border-border bg-surface p-6 text-center shadow-float ${closing ? 'anim-fade-out' : 'anim-scale'}`}>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] text-[15px] font-bold shadow-card" style={{ background: meta.bg, color: meta.color }}>{meta.label.slice(0, 2)}</span>
        <p className="mt-4 text-[14px] text-text-secondary">নাম্বার কপি হয়েছে</p>
        <p className="mt-1 font-display text-[20px] font-semibold tabular text-text">{number}</p>
        <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">{meta.label} অ্যাপ খুলে Send Money করুন</p>
        <div className="mt-5 flex flex-col gap-2.5">
          <button type="button" onClick={() => { openPaymentApp(method); onClose(); }} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-primary px-4 text-[14px] font-semibold text-white shadow-btn transition hover:bg-primary-hover active:scale-[0.98]">
            <ExternalLink className="h-4 w-4" /> {meta.label} অ্যাপ খুলুন
          </button>
          <button type="button" onClick={onClose} className="min-h-12 w-full rounded-[16px] border border-border bg-surface px-4 text-[14px] font-semibold text-text-secondary transition hover:bg-bg active:scale-[0.98]">এখানেই থাকুন</button>
        </div>
      </div>
    </div>
  );
}
