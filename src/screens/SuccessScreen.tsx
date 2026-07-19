import { useState } from 'react';
import { Check, Home, Receipt, Copy } from 'lucide-react';
import { useUI, useOrders } from '../lib/store';
import { safeArray } from '../lib/utils';
import SuccessCheckTransition from '../components/SuccessCheckTransition';

export default function SuccessScreen() {
  const { view, setTab, go } = useUI();
  const orderId = view.name === 'success' ? view.orderId : '';
  const { orders } = useOrders();
  const order = orders.find((o) => o.id === orderId);
  const itemCount = safeArray(order?.items).reduce((sum: number, item: any) => sum + (item.quantity ?? 1), 0);
  const [copied, setCopied] = useState(false);

  const copyOrderId = () => {
    const id = orderId || order?.id || '';
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-bg px-6 pb-8 pt-6">
      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] bg-coral text-white shadow-btn">
          <SuccessCheckTransition>
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none" aria-hidden="true">
              <path
                d="M16 28.5L24 36.5L39 19.5"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </SuccessCheckTransition>
        </div>

        <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.03em] text-ink">
          Payment Successful!
        </h1>
        <p className="mt-3 text-[15px] font-medium text-text-secondary">
          Order placed successfully!
        </p>

        <section className="mt-8 w-full max-w-[320px] rounded-[18px] border border-border bg-surface px-4 py-4 text-left shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-tertiary">Order ID</p>
              <p className="mt-1 truncate font-mono text-[15px] font-semibold text-ink">#{orderId || order?.id}</p>
            </div>
            <button
              type="button"
              onClick={copyOrderId}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3 text-[12px] font-semibold text-coral transition active:scale-95"
              aria-label="Copy order ID"
            >
              {copied ? <Check className="h-3.5 w-3.5" strokeWidth={2.4} /> : <Copy className="h-3.5 w-3.5" strokeWidth={2} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </section>

        {order && (
          <section className="mt-4 w-full max-w-[320px] rounded-[18px] border border-border bg-surface px-4 py-4 text-left shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-text-secondary">{itemCount}টি আইটেম</p>
                <p className="mt-1 truncate text-[12px] font-medium text-text-tertiary">
                  {safeArray(order.items).slice(0, 2).map((item: any) => item.name).join(', ')}
                  {safeArray(order.items).length > 2 ? ` +${safeArray(order.items).length - 2} আরও` : ''}
                </p>
              </div>
              <p className="shrink-0 text-[16px] font-semibold tabular text-ink">৳{order.total?.toLocaleString()}</p>
            </div>
          </section>
        )}
      </main>

      <footer className="w-full space-y-3">
        <button
          onClick={() => go({ name: 'tracking', orderId })}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-coral text-[15px] font-bold text-white shadow-btn transition active:scale-[.98]"
        >
          <Receipt className="h-[17px] w-[17px]" strokeWidth={2} />
          View Order
        </button>
        <button
          onClick={() => setTab('home')}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-full border border-border bg-surface text-[15px] font-bold text-ink shadow-card transition active:scale-[.98]"
        >
          <Home className="h-[17px] w-[17px]" strokeWidth={2} />
Back Home
        </button>
      </footer>
    </div>
  );
}
