import { ExternalLink } from 'lucide-react';
import { useModalDepth } from '../hooks/useModalDepth';
import { useSheetTransition } from '../hooks/useSheetTransition';
import { openPaymentApp } from '../lib/utils';

type Props = {
  open: boolean;
  onClose: () => void;
  method: 'bkash' | 'nagad';
  number: string;
};

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
    <div className={`fixed inset-0 z-[85] flex items-center justify-center p-5 ${closing ? 'anim-fade-out' : 'anim-fade'}`}>
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-[320px] overflow-hidden rounded-3xl glass-strong p-5 text-center ${closing ? 'anim-fade-out' : 'anim-scale'}`}
        style={{ boxShadow: '0 20px 60px -20px rgba(26,19,17,.35)' }}
      >
        <div
          className="mx-auto mb-3 flex h-13 w-13 items-center justify-center rounded-2xl text-[15px] font-bold text-white"
          style={{ background: meta.color, width: 52, height: 52 }}
        >
          {meta.label.slice(0, 2)}
        </div>

        <p className="text-[13px] text-ink-200">নাম্বার কপি হয়েছে</p>
        <p className="mt-0.5 font-display text-[19px] font-bold tabular text-ink">{number}</p>
        <p className="mt-3 text-[12.5px] text-ink-200">{meta.label} অ্যাপ খুলে Send Money করুন</p>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              openPaymentApp(method);
              onClose();
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 text-[13.5px] font-bold text-white active:scale-[0.98]"
            style={{ background: meta.color }}
          >
            <ExternalLink className="h-4 w-4" />
            {meta.label} অ্যাপ খুলুন
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-ink-50 bg-white py-3 text-[13.5px] font-bold text-ink-200 active:scale-[0.98]"
          >
            এখানেই থাকুন
          </button>
        </div>
      </div>
    </div>
  );
}
