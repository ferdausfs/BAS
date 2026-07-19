import { useMemo, useState } from 'react';
import { ArrowLeft, Ticket } from 'lucide-react';
import { useUI, useSettingsStore } from '../lib/store';

function isExpired(expiresAt: string) {
  if (!expiresAt) return false;
  const exp = new Date(expiresAt);
  if (Number.isNaN(exp.getTime())) return false;
  // Treat expiry date as end-of-day.
  exp.setHours(23, 59, 59, 999);
  return exp.getTime() < Date.now();
}

function daysLeft(expiresAt: string): number | null {
  if (!expiresAt) return null;
  const exp = new Date(expiresAt);
  if (Number.isNaN(exp.getTime())) return null;
  const diff = exp.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function CouponsScreen() {
  const { back } = useUI();
  const { settings } = useSettingsStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const coupons = useMemo(
    () =>
      (settings.coupons ?? [])
        .filter((c) => c.active && !isExpired(c.expiresAt) && (c.maxUses === 0 || c.usedCount < c.maxUses))
        .sort((a, b) => b.discount - a.discount),
    [settings.coupons]
  );

  const handleCopy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* clipboard may be unavailable — code is still visible on the card */
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
  };

  return (
    <div className="flex h-full flex-col bg-bg">
      <header className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="relative flex h-14 items-center justify-center">
          <button
            onClick={back}
            className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-ink-200 shadow-card transition active:scale-90"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[20px] font-semibold tracking-tight text-ink">Coupon</h1>
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-10">
        <h2 className="mb-5 text-[22px] font-medium tracking-[-0.02em] text-ink-300">Best offers for you</h2>
        {coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-coral shadow-card">
              <Ticket size={28} strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-[14px] font-medium text-ink-300">No coupons available right now</p>
            <p className="mt-1 text-[12px] text-ink-200">Check back soon for new offers</p>
          </div>
        ) : (
          <div className="space-y-4">
            {coupons.map((c) => {
              const left = daysLeft(c.expiresAt);
              return (
                <div key={c.id} className="relative overflow-hidden rounded-[18px] border border-border bg-surface shadow-card">
                  <div className="flex min-h-[132px]">
                    <div className="relative flex w-[70px] shrink-0 items-center justify-center bg-coral text-white">
                      <span className="-rotate-90 whitespace-nowrap text-[18px] font-semibold tracking-wide">{c.discount}% OFF</span>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <span key={index} className="absolute -left-2 h-4 w-4 rounded-full bg-bg" style={{ top: `${30 + index * 23}px` }} />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-[18px] font-semibold tracking-wide text-ink">{c.code}</h3>
                          <p className="mt-1 text-[13px] font-medium text-ink-300">Enjoy {c.discount}% OFF on cake orders</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(c.id, c.code)}
                          className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold text-coral transition active:scale-95"
                        >
                          {copiedId === c.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="my-3 border-t border-dashed border-border" />
                      <p className="text-[13px] font-medium text-ink-300">Add items to unlock this sweet offer</p>
                      <p className="mt-2 text-[12px] font-medium text-ink-200">
                        {left === null ? 'No expiry' : left === 0 ? 'Ends today' : `Ends in ${left} day${left > 1 ? 's' : ''}`} • T&Cs Apply
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
