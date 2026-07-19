import { useState, useEffect } from 'react';
import { Check, Home, Receipt, Clock, Copy } from 'lucide-react';
import { useUI, useOrders, useSettingsStore } from '../lib/store';
import { safeArray } from '../lib/utils';

export default function SuccessScreen() {
  const { view, setTab, go } = useUI();
  const orderId = view.name === 'success' ? view.orderId : '';
  const { settings } = useSettingsStore();
  const { orders } = useOrders();
  const order = orders.find(o => o.id === orderId);
  const itemCount = safeArray(order?.items).reduce((s: number, i: any) => s + (i.quantity ?? 1), 0);

  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(t);
  }, []);

  const copyOrderId = () => {
    const id = orderId ?? order?.id ?? '';
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative flex h-full flex-col items-center justify-between overflow-hidden bg-bg px-6 pt-12 pb-10">
      {/* Confetti — soft-pink + amber palette */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="absolute block h-2 w-2 rounded-sm anim-confetti"
              style={{
                left: `${5 + (i * 5.5) % 90}%`,
                top: '-10px',
                background: ['#F65F8F','#E84E80','#FFD6E4','#FFE8F0','#E8A33C','#FBE9C8','#F65F8F'][i % 7],
                animationDelay: `${(i * 0.12)}s`,
                animationDuration: `${1.8 + (i % 4) * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Decorative soft-pink blob */}
      <svg
        className="absolute -top-16 -left-16 h-80 w-80 text-blush-200"
        viewBox="0 0 200 200"
        fill="currentColor"
      >
        <path d="M40,-60C50,-50,55,-35,60,-20C65,-5,70,10,65,25C60,40,45,55,28,62C11,69,-8,68,-25,60C-42,52,-57,37,-65,18C-73,-1,-74,-24,-65,-42C-56,-60,-37,-73,-18,-72C1,-71,18,-56,30,-46Z" transform="translate(100 100)" />
      </svg>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        {/* Checkmark badge */}
        <div className="relative mb-5">
          <span className="absolute inset-0 rounded-full bg-coral/30 blur-2xl anim-heartbeat" />
          <span className="absolute inset-0 rounded-full anim-ring" />
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-coral text-white anim-pop"
            style={{ boxShadow: '0 14px 30px -10px rgba(246,95,143,.35)' }}
          >
            <Check className="h-8 w-8" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-[20px] font-bold leading-tight tracking-tight text-ink anim-rise delay-1">
          অর্ডার সফল হয়েছে
        </h1>
        <p className="mt-1.5 max-w-[260px] text-[12px] leading-relaxed text-text-secondary anim-rise delay-2">
          আপনার কেক ভালোবাসা দিয়ে তৈরি হচ্ছে
        </p>

        {/* Order ID card */}
        <div
          className="mt-5 w-full max-w-[300px] rounded-2xl bg-surface border border-border shadow-card anim-rise delay-3"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-left">
              <div className="text-[9.5px] font-bold tracking-wider text-text-tertiary uppercase">Order ID</div>
              <div className="font-mono text-[13px] font-bold text-ink">#{orderId ?? order?.id}</div>
            </div>
            <button
              onClick={copyOrderId}
              className="flex items-center gap-1 rounded-lg bg-ink-50 px-2 py-1 text-[11px] font-medium text-text-secondary transition active:scale-95"
              aria-label="Copy order ID"
            >
              {copied
                ? <><Check className="h-3 w-3 text-success" /> Copied!</>
                : <><Copy className="h-3 w-3" /> Copy</>}
            </button>
          </div>
          <div className="h-px bg-border mx-4" />
          <div className="flex items-center gap-2.5 px-4 py-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Clock className="h-4 w-4 text-coral" strokeWidth={2} />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-medium text-text-tertiary">আনুমানিক ডেলিভারি</p>
              <p className="text-[12.5px] font-bold text-ink">{settings?.deliveryEstimate ?? '45-60 মিনিট'}</p>
            </div>
          </div>
        </div>

        {/* Item summary card */}
        {order && (
          <div className="mt-2.5 w-full max-w-[300px] rounded-2xl bg-surface border border-border px-4 py-3 shadow-card anim-rise delay-4 text-left">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-text-secondary">{itemCount}টি আইটেম</span>
              <span className="font-bold text-ink">৳{order.total?.toLocaleString()}</span>
            </div>
            <p className="mt-1 text-[10.5px] text-text-tertiary truncate">
              {safeArray(order.items).slice(0, 2).map((i: any) => i.name).join(', ')}
              {safeArray(order.items).length > 2 ? ` +${safeArray(order.items).length - 2} আরও` : ''}
            </p>
          </div>
        )}
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-2 anim-up delay-5">
        <button
          onClick={() => go({ name: 'tracking', orderId })}
          className="btn-primary flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[13px] font-bold tracking-tight"
        >
          <Receipt className="h-[16px] w-[16px]" />
          অর্ডার ট্র্যাক করুন
        </button>
        <button
          onClick={() => setTab('home')}
          className="btn-secondary flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[13px] font-bold tracking-tight"
        >
          <Home className="h-[16px] w-[16px]" />
          হোমে ফিরে যান
        </button>
      </div>
    </div>
  );
}
