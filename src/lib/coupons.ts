import type { Coupon } from '../types';

export function isCouponLive(coupon: Coupon, now = Date.now()): boolean {
  if (!coupon.active) return false;
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return false;
  if (coupon.expiresAt) {
    const exp = new Date(coupon.expiresAt);
    if (!Number.isNaN(exp.getTime())) {
      exp.setHours(23, 59, 59, 999);
      if (exp.getTime() < now) return false;
    }
  }
  return true;
}

export function liveCoupons(list: Coupon[] | undefined): Coupon[] {
  return (list ?? [])
    .filter((coupon) => isCouponLive(coupon))
    .sort((a, b) => b.discount - a.discount);
}

export function matchDiscountCode(
  entered: string,
  coupons: Coupon[] | undefined,
  legacy?: { enabled: boolean; code: string; percent: number },
): { code: string; percent: number } | null {
  const code = entered.trim().toUpperCase();
  if (!code) return null;

  const found = (coupons ?? []).find((coupon) => coupon.code.trim().toUpperCase() === code && isCouponLive(coupon));
  if (found) return { code: found.code.trim().toUpperCase(), percent: found.discount };

  if (legacy?.enabled && legacy.code.trim().toUpperCase() === code) {
    return { code: legacy.code.trim().toUpperCase(), percent: legacy.percent };
  }
  return null;
}

export function discountOfferChips(
  coupons: Coupon[] | undefined,
  legacy?: { enabled: boolean; code: string; percent: number },
): { code: string; percent: number }[] {
  const chips = liveCoupons(coupons).map((coupon) => ({
    code: coupon.code.trim().toUpperCase(),
    percent: coupon.discount,
  }));
  if (legacy?.enabled && legacy.code.trim()) {
    const code = legacy.code.trim().toUpperCase();
    if (!chips.some((chip) => chip.code === code)) {
      chips.unshift({ code, percent: legacy.percent });
    }
  }
  return chips.slice(0, 5);
}

export function discountLineLabel(code: string | undefined, minusAmount: string): string {
  const trimmed = (code ?? '').trim().toUpperCase();
  return trimmed ? `${trimmed} · ${minusAmount}` : `ছাড় · ${minusAmount}`;
}
