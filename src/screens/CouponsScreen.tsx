import { useMemo, useState } from 'react';
import { ArrowLeft, Tag, Copy, Check, Ticket } from 'lucide-react';
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
      {/* Header */}
      <header className="flex flex-shrink-0 items-center gap-3 px-6 pt-14 pb-3">
        <button
          onClick={back}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-card transition active:scale-90"
          aria-label="Back"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <div>
          <div className="section-eyebrow text-coral-700 uppercase tracking-wider text-[11px] font-bold">Rewards</div>
          <h1 className="font-sans text-[20px] font-bold tracking-tight text-ink">My Coupons</h1>
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-10">
        {coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-coral shadow-card">
              <Ticket size={28} strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-[14px] font-medium text-ink-300">No coupons available right now</p>
            <p className="mt-1 text-[12px] text-ink-200">Check back soon for new offers</p>
          </div>
        ) : (
          <div className="mt-2 space-y-3">
            {coupons.map((c) => {
              const left = daysLeft(c.expiresAt);
              return (
                <div
                  key={c.id}
                  className="relative overflow-hidden rounded-2xl bg-surface border border-border shadow-card"
                >
                  <div className="flex">
                    {/* Discount badge strip */}
                    <div
                      className="flex w-[62px] flex-shrink-0 flex-col items-center justify-center gap-0.5 py-4 text-white"
                      style={{ background: 'linear-gradient(160deg, #F65F8F 0%, #E84E80 100%)' }}
                    >
                      <span className="font-sans text-[20px] font-bold leading-none">{c.discount}%</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">off</span>
                    </div>

                    {/* Dashed divider (ticket look) */}
                    <div className="relative w-0 border-l-2 border-dashed border-border" />

                    <div className="flex-1 px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-coral" />
                        <span className="font-sans text-[14px] font-bold tracking-wide text-ink">{c.code}</span>
                      </div>
                      <p className="mt-1 text-[11.5px] text-ink-300">
                        Enjoy {c.discount}% off your order — apply at checkout
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10.5px] font-semibold text-ink-200">
                          {left === null ? 'No expiry' : left === 0 ? 'Expires today' : `Expires in ${left} day${left > 1 ? 's' : ''}`}
                        </span>
                        <button
                          onClick={() => handleCopy(c.id, c.code)}
                          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[10.5px] font-bold transition active:scale-95 ${
                            copiedId === c.id ? 'bg-emerald-50 text-emerald-600' : 'bg-coral-100 text-coral'
                          }`}
                        >
                          {copiedId === c.id ? (
                            <>
                              <Check className="h-3 w-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy code
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ticket notch circles — sit at the strip/body boundary */}
                  <span className="absolute left-[62px] top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg border-r border-border" />
                  <span className="absolute left-[62px] bottom-0 h-3.5 w-3.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-bg border-r border-border" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
