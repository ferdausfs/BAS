import { useMemo, useState } from 'react';
import { ArrowLeft, Ticket } from 'lucide-react';
import { useUI, useSettingsStore } from '../lib/store';
import { copyText, hapticTap } from '../lib/utils';
import { liveCoupons } from '../lib/coupons';
import type { Coupon } from '../types';

function daysLeft(expiresAt: string): number | null {
  if (!expiresAt) return null;
  const exp = new Date(expiresAt);
  if (Number.isNaN(exp.getTime())) return null;
  const diff = exp.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function CouponsScreen() {
  const { back, go, applyPromo } = useUI();
  const { settings } = useSettingsStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const coupons = useMemo(() => {
    const live = liveCoupons(settings.coupons);
    if (settings.promoEnabled && settings.promoCode.trim()) {
      const code = settings.promoCode.trim().toUpperCase();
      if (!live.some((coupon) => coupon.code.trim().toUpperCase() === code)) {
        const legacy: Coupon = {
          id: 'legacy-promo',
          code,
          discount: settings.promoPercent,
          maxUses: 0,
          usedCount: 0,
          expiresAt: '',
          active: true,
        };
        live.unshift(legacy);
      }
    }
    return live;
  }, [settings.coupons, settings.promoEnabled, settings.promoCode, settings.promoPercent]);

  const handleCopy = async (id: string, code: string) => {
    await copyText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="relative flex h-14 items-center justify-center">
          <button
            onClick={back}
            className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-ink-200 shadow-card transition active:scale-90"
            aria-label="ফিরে যান"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[20px] font-semibold tracking-tight text-ink">কুপন</h1>
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-10">
        <h2 className="mb-5 text-[22px] font-medium tracking-[-0.02em] text-ink-300">আপনার জন্য সেরা ছাড়</h2>
        {coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-coral shadow-card">
              <Ticket size={28} strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-[14px] font-medium text-ink-300">এখন কোনো কুপন নেই</p>
            <p className="mt-1 text-[12px] text-ink-200">নতুন ছাড় এলে এখানে দেখাবে</p>
          </div>
        ) : (
          <div className="space-y-4">
            {coupons.map((c) => {
              const left = daysLeft(c.expiresAt);
              return (
                <div key={c.id} className="relative overflow-hidden rounded-[18px] border border-border bg-surface shadow-card">
                  <div className="flex min-h-[132px]">
                    <div className="relative flex w-[70px] shrink-0 items-center justify-center bg-coral text-white">
                      <span className="-rotate-90 whitespace-nowrap text-[18px] font-semibold tracking-wide">{c.discount}% ছাড়</span>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <span key={index} className="absolute -left-2 h-4 w-4 rounded-full bg-bg" style={{ top: `${30 + index * 23}px` }} />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1 px-4 py-4">
                      <div>
                        <h3 className="text-[18px] font-semibold tracking-wide text-ink">{c.code}</h3>
                        <p className="mt-1 text-[13px] font-medium text-ink-300">অর্ডারে {c.discount}% ছাড়</p>
                      </div>
                      <div className="my-3 border-t border-dashed border-border" />
                      <p className="text-[12px] font-medium text-ink-200">
                        {left === null ? 'মেয়াদ নেই' : left === 0 ? 'আজ শেষ' : `${left} দিন বাকি`} · শর্ত প্রযোজ্য
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            applyPromo(c.discount, c.code);
                            hapticTap();
                            go({ name: 'checkout' });
                          }}
                          className="flex-1 rounded-full bg-coral px-3 py-2 text-[12px] font-bold text-white transition active:scale-95"
                        >
                          এখনই ব্যবহার
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleCopy(c.id, c.code)}
                          className="rounded-full bg-secondary px-3 py-2 text-[12px] font-bold text-coral transition active:scale-95"
                        >
                          {copiedId === c.id ? 'কপি হয়েছে' : 'কপি'}
                        </button>
                      </div>
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
