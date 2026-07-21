import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, MapPin, Clock, Wallet, Check, Copy, Shield, Loader2, Banknote, ShoppingCart, Gift, Users, Image as ImageIcon, X, Calendar, Tag } from 'lucide-react';
import {
  useCart, useOrders, useUI, formatINR,
  cartSubtotal, standardDeliveryFee,
  useLocation,
  useSettingsStore,
  useAuthStore,
  useWallet,
  getReferralCode,
  WALLET_REFERRAL_BONUS,
  WALLET_MAX_REDEEM,
  WALLET_MIN_ORDER_TO_REDEEM,
  applyReferralCode,
} from '../lib/store';
import { doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured, uploadToCloudinary } from '../lib/firebase';
import { safeArray, isValidPhone, copyText, ls } from '../lib/utils';
import { LocationGate } from '../components/LocationGate';
import PaymentAppPopup from '../components/PaymentAppPopup';
import { BD_DISTRICTS } from '../lib/zones';
import type { CartItem, Order, SavedAddress } from '../types';

const PAYMENT_METHODS = [
  { id: 'bkash', name: 'bKash', desc: 'Send money / Payment', color: '#E2136E', bg: '#FCE8F1' },
  { id: 'nagad', name: 'Nagad', desc: 'Send money / Payment', color: '#EC6608', bg: '#FEF0E6' },
  { id: 'cash', name: 'Cash on Delivery', desc: 'Pay when you receive', color: '#1c1110', bg: '#F4F2EE' },
] as const;

// Advance (preparation) payment must always be online — cake production starts
// only after this is received, so Cash on Delivery is not offered here.
const ADVANCE_METHODS = PAYMENT_METHODS.filter((m) => m.id !== 'cash');

// Customer pays for cake production in 2 parts: 1/3 upfront (online only, to
// start baking) and the rest however they like (cash or online) at delivery.
const ADVANCE_FRACTION = 1 / 3;

const SLOTS = [
  { v: '10am - 12pm', hot: false },
  { v: '12pm - 2pm', hot: false },
  { v: '4pm - 6pm', hot: true },
  { v: '6pm - 8pm', hot: false },
];

const getMinDeliveryDate = () => {
  const now = new Date();
  const cutoffHour = 16; // 4pm
  const daysToAdd = now.getHours() < cutoffHour ? 1 : 2;
  const minDate = new Date(now);
  minDate.setDate(now.getDate() + daysToAdd);
  return minDate.toISOString().split('T')[0];
};

interface Props {
  onBack?: () => void;
}

export default function CheckoutScreen({ onBack }: Props) {
  const { items, clear } = useCart();
  const { placeOrder, orders } = useOrders();
  const {
    back, go, promoDiscount, pendingLoyaltyRedeem,
    setPendingLoyaltyRedeem, clearLoyalty, applyPromo, clearPromo,
  } = useUI();
  const { verified: locationVerified, district: detectedDistrict, lat: locationLat, lng: locationLng } = useLocation();
  const user = useAuthStore((s) => s.user);
  const walletBalance = useWallet((s) => s.balance);

  // Referral
  const [referralInput, setReferralInput] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [referralLoading, setReferralLoading] = useState(false);
  const userReferralCode = getReferralCode(user);

  // Auto-fill referral code from URL ?ref= param (e.g. from shared link) or a
  // pending deep-link stored by App.tsx. Runs once on mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let code = params.get('ref')?.trim().toUpperCase() || '';
    if (!code) {
      try {
        const stored = localStorage.getItem('bas-pending-ref');
        if (stored) {
          code = stored.trim().toUpperCase();
          localStorage.removeItem('bas-pending-ref');
        }
      } catch { /* ignore */ }
    }
    if (code && /^[A-Z0-9]{8}$/i.test(code) && code !== userReferralCode) {
      setReferralInput(code);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyReferralCodeHandler = async (codeOverride?: string) => {
    if (!user) {
      setReferralError('Login করুন');
      return;
    }

    const code = (codeOverride ?? referralInput).trim().toUpperCase();

    if (!/^[A-Z0-9]{8}$/.test(code)) {
      setReferralError('Invalid code format');
      return;
    }

    const myCode = getReferralCode(user);
    if (myCode && myCode.toUpperCase() === code) {
      setReferralError('নিজের code ব্যবহার করা যাবে না');
      return;
    }

    // Buyer max 3 uses is enforced when the order is submitted with an order ID.
    // Show the existing loading state while marking this code for checkout.
    setReferralLoading(true);
    try {
      setReferralApplied(true);
      setReferralError('');
    } finally {
      setReferralLoading(false);
    }
  };

  // Auto-apply once we have both a pre-filled code (from the link, above) and a
  // logged-in user — don't make them tap "Apply" for a link they already followed.
  // Manual entry (typed in by hand) still requires the Apply button as before.
  useEffect(() => {
    if (referralInput && user && !referralApplied) {
      void applyReferralCodeHandler(referralInput);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralInput, user]);


  const [showLocationGate, setShowLocationGate] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState<File | null>(null);
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState('');
  const [giftMode, setGiftMode] = useState(false);
  const [gift, setGift] = useState({ message: '', hidePrice: false, wrap: false, recipientName: '', recipientPhone: '' });
  const [checkoutItemsExpanded, setCheckoutItemsExpanded] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState<CartItem | null>(null);

  // Advance (preparation) payment method — always online, so no 'cash' option.
  // `paymentScreenshotFile`/`paymentScreenshotPreview` (declared above) hold the
  // proof-of-payment image for this advance amount.
  const [advancePayment, setAdvancePayment] = useState<typeof ADVANCE_METHODS[number]['id']>('bkash');
  const [numberCopied, setNumberCopied] = useState(false);
  const [appPopupOpen, setAppPopupOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    district: detectedDistrict || 'Comilla',
    date: getMinDeliveryDate(),
    time: '4pm - 6pm',
    // Remaining-amount payment method, settled at delivery — cash allowed here.
    payment: 'cash' as typeof PAYMENT_METHODS[number]['id'],
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);


  const savedAddresses = useMemo(() => {
    if (!user?.id) return [] as SavedAddress[];
    return ls.get<SavedAddress[]>(`bakeart-addresses-${user.id}`, []);
  }, [user?.id]);

  const checkoutAddressCards = useMemo(() => {
    const saved = savedAddresses.map((addr) => ({
      id: addr.id,
      label: addr.name || 'Address',
      sub: `${addr.address}${addr.district ? `, ${addr.district}` : ''}`,
      address: addr.address,
      district: addr.district || detectedDistrict || 'Comilla',
      phone: addr.phone,
      isDefault: addr.isDefault,
    }));

    if (saved.length > 0) return saved;
    if (form.address) {
      return [{
        id: 'current',
        label: 'Current',
        sub: `${form.address}${form.district ? `, ${form.district}` : ''}`,
        address: form.address,
        district: form.district,
        phone: form.phone,
        isDefault: true,
      }];
    }
    return [];
  }, [savedAddresses, detectedDistrict, form.address, form.district, form.phone]);

  useEffect(() => {
    if (selectedAddressId || checkoutAddressCards.length === 0) return;
    const preferred = checkoutAddressCards.find((addr) => addr.isDefault) ?? checkoutAddressCards[0];
    setSelectedAddressId(preferred.id);
    setForm((prev) => ({
      ...prev,
      address: preferred.address,
      district: preferred.district,
      phone: prev.phone || preferred.phone,
    }));
  }, [checkoutAddressCards, selectedAddressId]);

  const selectedCheckoutAddress = checkoutAddressCards.find((addr) => addr.id === selectedAddressId);

  const applyCheckoutAddress = (addr: typeof checkoutAddressCards[number]) => {
    setSelectedAddressId(addr.id);
    setForm((prev) => ({
      ...prev,
      address: addr.address,
      district: addr.district,
      phone: addr.phone || prev.phone,
    }));
    setAddressPickerOpen(false);
  };

  const dateOptions = useMemo(() => {
    const start = new Date(getMinDeliveryDate());
    return Array.from({ length: 14 }).map((_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const value = date.toISOString().split('T')[0];
      const label = index === 0 ? 'Tomorrow' : date.toLocaleDateString('en-BD', { weekday: 'short' });
      const day = date.toLocaleDateString('en-BD', { day: '2-digit' });
      const month = date.toLocaleDateString('en-BD', { month: 'short' });
      const full = date.toLocaleDateString('en-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      return { value, label, day, month, full };
    });
  }, []);

  const selectedDateOption = dateOptions.find((option) => option.value === form.date) ?? dateOptions[0];

  // Autofill name, phone and address for logged in users
  useEffect(() => {
    if (user) {
      setForm((prev) => {
        const next = { ...prev };
        if (!next.name && user.name) {
          next.name = user.name;
        }
        if (!next.phone && user.contact) {
          next.phone = user.contact;
        }
        if (!next.address && user.locationAddress) {
          next.address = user.locationAddress;
        }
        if (user.district) {
          next.district = user.district;
        }

        const recentOrder = safeArray<Order>(orders).find(
          (o) =>
            o.userId === user.id ||
            (user.email && o.customer?.email?.toLowerCase() === user.email.toLowerCase())
        );

        if (recentOrder) {
          if (!next.phone && recentOrder.customer?.phone) {
            next.phone = recentOrder.customer.phone;
          }
          if (!next.address && recentOrder.customer?.address) {
            next.address = recentOrder.customer.address;
          }
          if (recentOrder.customer?.city) {
            const matchedDistrict = BD_DISTRICTS.find(
              (d) => d.toLowerCase() === recentOrder.customer.city.toLowerCase()
            );
            if (matchedDistrict) {
              next.district = matchedDistrict;
            }
          }
        }
        return next;
      });
    }
  }, [user, orders]);

  const { settings } = useSettingsStore();
  const currentDeliveryFee = settings.deliveryFee !== undefined ? settings.deliveryFee : standardDeliveryFee;
  const currentFreeThreshold = settings.freeDeliveryThreshold !== undefined ? settings.freeDeliveryThreshold : 999;
  const requiresLocationGate = !!user && !user.isAdmin && settings.deliveryZonesEnabled !== false && !locationVerified && !user.locationVerified;

  useEffect(() => {
    setShowLocationGate(requiresLocationGate);
  }, [requiresLocationGate]);

  const { subtotal, delivery, promoDiscountAmount, walletDiscount, discountAmount, total } = useMemo(() => {
    const sub = cartSubtotal(items);
    const freeDlv = sub >= currentFreeThreshold;
    const dlv = items.length === 0 ? 0 : (freeDlv ? 0 : currentDeliveryFee);
    const promoDisc = promoDiscount > 0 ? (sub * promoDiscount) / 100 : 0;
    const walletDisc = pendingLoyaltyRedeem; // pendingLoyaltyRedeem now stores ৳ directly
    const disc = promoDisc + walletDisc;
    const giftWrapFee = giftMode && gift.wrap ? 50 : 0;
    return { subtotal: sub, delivery: dlv, promoDiscountAmount: promoDisc, walletDiscount: walletDisc, discountAmount: disc, total: Math.max(0, sub + dlv - disc + giftWrapFee) };
  }, [items, currentDeliveryFee, currentFreeThreshold, promoDiscount, pendingLoyaltyRedeem, giftMode, gift.wrap]);

  // 1/3 of the total is due now (online) so the baker can start production;
  // rounded up to the nearest ৳1 so the advance is never short-changed.
  const advanceAmount = items.length === 0 ? 0 : Math.ceil(total * ADVANCE_FRACTION);
  const remainingAmount = Math.max(0, total - advanceAmount);

  // Wallet redeem + promo code — moved here from CartScreen (same store state/actions,
  // so Cart and Checkout always stay in sync with whatever was applied).
  const maxRedeemable = Math.min(walletBalance, WALLET_MAX_REDEEM, subtotal);
  const canRedeem = walletBalance > 0 && subtotal >= WALLET_MIN_ORDER_TO_REDEEM && promoDiscount === 0;
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  // Extras (wallet redeem / promo code / referral code) collapsed by default —
  // keeps the payment step focused on the main task first. Auto-opens if the
  // user already applied one of these, so they don't lose track of it.
  const [showExtras, setShowExtras] = useState(false);
  const extrasAlreadyApplied = pendingLoyaltyRedeem > 0 || promoDiscount > 0 || referralApplied;
  const extrasOpen = showExtras || extrasAlreadyApplied;

  const handleLocate = async () => {
    setLocating(true);
    setLocateError('');
    try {
      if (!navigator.geolocation) {
        throw new Error('জিপিএস সমর্থিত নয়');
      }
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      const { latitude: lat, longitude: lng } = pos.coords;
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      if (!r.ok) {
        throw new Error('সার্ভার থেকে এড্রেস পাওয়া যায়নি');
      }
      const data = await r.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.district ||
        data.address?.county ||
        data.address?.state_district ||
        '';
      const addressText = data.display_name || city || '';

      setForm((prev) => {
        const next = { ...prev };
        next.address = addressText;
        const detectedCity = (city || addressText).toLowerCase();
        const matchedDistrict = BD_DISTRICTS.find(
          (d) => detectedCity.includes(d.toLowerCase()) || addressText.toLowerCase().includes(d.toLowerCase())
        );
        if (matchedDistrict) {
          next.district = matchedDistrict;
        }
        return next;
      });
    } catch (e: any) {
      console.warn('Geolocation failed:', e);
      setLocateError('লোকেশন শনাক্ত করা যায়নি, অনুগ্রহ করে ম্যানুয়ালি লিখুন।');
    } finally {
      setLocating(false);
    }
  };

  const uploadPaymentScreenshot = async (): Promise<string | undefined> => {
    if (!paymentScreenshotFile) return undefined;
    return uploadToCloudinary(paymentScreenshotFile, 'bake-art-style/payment-screenshots');
  };

  const checkoutPhone = selectedCheckoutAddress?.phone || form.phone;
  const checkoutAddress = selectedCheckoutAddress?.address || form.address;
  const checkoutDistrict = selectedCheckoutAddress?.district || form.district;

  const handleSubmit = async () => {
    if (items.length === 0) return;
    if (!form.name || !checkoutPhone || !checkoutAddress) {
      setSubmitError('নাম, ফোন এবং ঠিকানা পূরণ করুন।');
      scrollToTop();
      return;
    }
    if (!isValidPhone(checkoutPhone)) {
      setSubmitError('সঠিক মোবাইল নম্বর দিন (যেমন 01XXXXXXXXX)');
      scrollToTop();
      return;
    }
    if (requiresLocationGate && !locationVerified) {
      setSubmitError('Checkout করার আগে location verify করুন।');
      setShowLocationGate(true);
      return;
    }
    if (!paymentScreenshotFile) {
      setSubmitError('অগ্রিম পেমেন্টের screenshot আপলোড করুন।');
      scrollToTop();
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const { settings } = useSettingsStore.getState();
      const paymentScreenshot = await uploadPaymentScreenshot();

      const o = placeOrder({
        items,
        customer: {
          name: form.name,
          phone: checkoutPhone,
          email: user?.email || '',
          address: checkoutAddress,
          city: checkoutDistrict,
          pin: '',
        },
        delivery: { date: form.date, time: form.time },
        payment: form.payment,
        advancePayment,
        advanceAmount,
        remainingAmount,
        subtotal,
        deliveryFee: delivery,
        total,
        discount: Math.round(discountAmount),
        promoCode: promoDiscount > 0 ? settings.promoCode : undefined,
        loyaltyPointsRedeemed: pendingLoyaltyRedeem > 0 ? pendingLoyaltyRedeem : undefined,
        paymentScreenshot,
        gpsLat: locationLat,
        gpsLng: locationLng,
        locationAddress: checkoutAddress,
        locationVerified: locationVerified,
        gift: giftMode ? gift : undefined,
      });

      if (isFirebaseConfigured() && user?.id) {
        await setDoc(doc(db, 'profiles', user.id), {
          id: user.id,
          name: form.name,
          contact: checkoutPhone,
          email: user.email,
          district: checkoutDistrict,
          location_address: checkoutAddress,
          updated_at: new Date().toISOString(),
        }, { merge: true });
      }

      // BUG 3 FIX: Apply referral code using new applyReferralCode function
      // This handles:
      // - Max 3 uses per buyer check
      // - Same order duplicate check
      // - Buyer gets ৳100 immediately
      // - Referrer gets ৳100 (pending claim)
      if (referralApplied && referralInput.trim() && user?.id) {
        const code = referralInput.trim().toUpperCase();
        
        // Use the new applyReferralCode function with orderId
        const result = await applyReferralCode(code, user.id, user.email || '', o.id);
        
        if (!result.success) {
          // Referral failed but order succeeded - show warning
          setReferralError(result.message);
          setReferralApplied(false);
        }
        // Success message will be shown in the UI via the apply state
      }
      
      clear();
      go({ name: 'success', orderId: o.id });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'অর্ডার সাবমিট করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = onBack ?? back;

  // ===== 3-step wizard state =====
  // Was previously a decorative stepper (always showed step 1 active while the
  // whole form scrolled as one page). Now step actually gates what's rendered.
  const [step, setStep] = useState<0 | 1 | 2>(0);

  // Scrollable content ref — when a validation error appears, the user might be
  // scrolled down (e.g. filled address but not date/time) and never see the
  // small error text near the sticky button. Scroll them to the top so the
  // error banner is always visible.
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateAddressStep = () => {
    if (!form.name || !checkoutPhone || !checkoutAddress) {
      setSubmitError('নাম, ফোন এবং ঠিকানা পূরণ করুন।');
      scrollToTop();
      return false;
    }
    if (!isValidPhone(checkoutPhone)) {
      setSubmitError('সঠিক মোবাইল নম্বর দিন (যেমন 01XXXXXXXXX)');
      scrollToTop();
      return false;
    }
    setSubmitError('');
    return true;
  };

  const validatePaymentStep = () => {
    if (!paymentScreenshotFile) {
      setSubmitError(`অগ্রিম ৳${advanceAmount} পেমেন্টের screenshot আপলোড করুন।`);
      scrollToTop();
      return false;
    }
    setSubmitError('');
    return true;
  };

  const goToStep = (i: 0 | 1 | 2) => {
    // Only allow jumping to a step that's already been reached — same guard
    // the Header's clickable-stepper uses (i <= step).
    if (i <= step) {
      setSubmitError('');
      setStep(i);
    }
  };

  const goNext = () => {
    if (step === 0) {
      if (!validateAddressStep()) return;
      setStep(1);
    } else if (step === 1) {
      // Step 1 is now the confirm/review step — nothing to validate here,
      // the payment method + screenshot are chosen next, on step 2.
      setSubmitError('');
      setStep(2);
    } else {
      if (!validatePaymentStep()) return;
      void handleSubmit();
    }
  };

  const goPrevStep = () => {
    if (step > 0) {
      setSubmitError('');
      setStep((s) => (s - 1) as 0 | 1 | 2);
    } else {
      handleBack();
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <Header title="চেকআউট" onBack={handleBack} />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="flex justify-center text-ink-200 opacity-60">
            <ShoppingCart size={48} strokeWidth={1.5} />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-ink">কার্ট খালি</h2>
          <p className="mt-1 text-[12px] text-ink-200">আগে একটা কেক যোগ করুন।</p>
          <button onClick={handleBack} className="btn-primary mt-5 h-12 rounded-2xl px-6 text-[13px] font-bold">
            কেক দেখুন
          </button>
        </div>
      </div>
    );
  }

  // Location gate before checkout (payment step) — must verify zone first
  if (showLocationGate) {
    return (
      <LocationGate
        onDismiss={() => setShowLocationGate(false)}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="চেকআউট" onBack={goPrevStep} step={step} onStepClick={goToStep} />

      <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto px-6 pb-32 pt-1">
        {submitError && (
          <div className="mb-3 flex items-start gap-2 rounded-2xl bg-red-50 px-3.5 py-3 text-[12.5px] font-semibold text-red-600">
            <Shield className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {submitError}
          </div>
        )}
        {step === 0 && (
        <>
        {/* Items */}
        <Section icon={ShoppingCart} title="অর্ডারের আইটেম">
          <div className="space-y-2.5">
            {(checkoutItemsExpanded ? safeArray<CartItem>(items) : safeArray<CartItem>(items).slice(0, 3)).map((it, i) => (
              <button key={i} type="button" onClick={() => setSelectedCartItem(it)} className="flex w-full items-center gap-3 rounded-xl text-left transition active:scale-[.99]">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-cream">
                  <img src={it.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-[13px] font-bold text-ink">{it.name}</div>
                  <div className="text-[11.5px] text-ink-200">{it.size} · ×{it.quantity}</div>
                </div>
                <div className="text-[13px] font-bold tabular text-ink">
                  {formatINR(it.price * it.quantity)}
                </div>
              </button>
            ))}
            {items.length > 3 && (
              <button
                type="button"
                onClick={() => setCheckoutItemsExpanded((value) => !value)}
                className="flex w-full items-center justify-center rounded-full bg-secondary/60 py-2 text-[11.5px] font-bold text-coral transition active:scale-95"
              >
                {checkoutItemsExpanded ? 'কম দেখান' : `+${items.length - 3} আরও আইটেম`}
              </button>
            )}
          </div>
        </Section>

        {/* Delivery address — app-styled picker, single selected address only */}
        <Section icon={MapPin} title="ডেলিভারি ঠিকানা">
          <button
            type="button"
            onClick={() => setAddressPickerOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-3.5 text-left shadow-sm transition active:scale-[.99]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-coral">
              <MapPin className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="line-clamp-1 text-[14px] font-bold text-ink">
                  {selectedCheckoutAddress?.label ?? (form.address ? 'Current address' : 'Choose delivery address')}
                </span>
                {selectedCheckoutAddress?.isDefault && (
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold text-coral">Default</span>
                )}
              </span>
              <span className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink-300">
                {selectedCheckoutAddress?.sub ?? form.address ?? 'Tap to select saved address'}
              </span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-coral">Change</span>
          </button>

          {checkoutAddressCards.length === 0 && (
            <div className="mt-3 rounded-2xl bg-secondary/40 px-3.5 py-3 text-[12px] font-medium text-ink-300">
              No saved address yet. Add one from Profile → Manage Address, or type below.
            </div>
          )}

          {/* Minimal form fields for editing / fallback entry */}
          <div className="mt-4 space-y-2.5">
            <input
              placeholder="আপনার নাম"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-11 w-full rounded-xl border border-ink-50 bg-white px-3 text-[13px] font-medium text-ink outline-none focus:border-coral"
            />
            <input
              type="tel"
              placeholder="মোবাইল নম্বর"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="h-11 w-full rounded-xl border border-ink-50 bg-white px-3 text-[13px] font-medium text-ink outline-none focus:border-coral"
            />
            <textarea
              placeholder="সম্পূর্ণ ঠিকানা"
              rows={2}
              value={form.address}
              onChange={(e) => { setSelectedAddressId(null); setForm({ ...form, address: e.target.value }); }}
              className="w-full resize-none rounded-xl border border-ink-50 bg-white px-3 py-2.5 text-[13px] font-medium text-ink outline-none focus:border-coral"
            />
          </div>
        </Section>

        {/* Date & time */}
        <Section icon={Clock} title="ডেলিভারি সময়">
          <div className="space-y-1.5">
            <label htmlFor="checkout-date" className="text-[12px] font-bold tracking-wider text-ink-200 uppercase">
              ডেলিভারি তারিখ
            </label>
            <button
              id="checkout-date"
              type="button"
              onClick={() => setDatePickerOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface py-3.5 pl-3.5 pr-4 text-left shadow-sm transition active:scale-[.99]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral/10 text-coral">
                <Calendar className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-ink">{selectedDateOption?.full ?? form.date}</span>
                <span className="mt-0.5 block text-[11.5px] font-medium text-ink-200">Tap to choose delivery date & time</span>
              </span>
            </button>
            <p className="mt-1.5 text-[11.5px] text-ink-200">
              আজ বিকেল ৪টার আগে অর্ডার করলে আগামীকাল পাবেন
            </p>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {SLOTS.map((s) => (
              <button
                key={s.v}
                onClick={() => setForm({ ...form, time: s.v })}
                className={`relative h-11 rounded-xl border-2 text-[12px] font-semibold transition active:scale-95 ${
                  form.time === s.v
                    ? 'border-coral bg-coral text-white shadow-[0_6px_16px_-8px_rgba(168,103,46,.45)]'
                    : 'border-ink-50 bg-white text-ink'
                }`}
              >
                {s.v}
                {s.hot && form.time !== s.v && (
                  <span className="absolute -top-1.5 -right-1.5 rounded-full bg-ink px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">
                    Popular
                  </span>
                )}
              </button>
            ))}
          </div>
        </Section>
        </>
        )}

        {step === 1 && (
        <>
        {/* Gift Mode — collapsed toggle, optional */}
        <section className="mt-3 space-y-3">
          <div
            className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-card cursor-pointer hover:border-coral-200 transition"
            onClick={() => setGiftMode(!giftMode)}
          >
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-ink" strokeWidth={1.75} />
              <div>
                <div className="text-[13.5px] font-bold text-ink">This is a gift order</div>
                <div className="text-[12px] text-ink-300 font-medium">Add message, gift wrap & recipient details</div>
              </div>
            </div>
            <div className={`h-6 w-11 rounded-full transition-colors ${giftMode ? 'bg-coral' : 'bg-ink/15'} relative flex-shrink-0`}>
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${giftMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </div>

          {giftMode && (
            <div className="space-y-3 rounded-2xl border border-border bg-surface px-4 py-4 shadow-card">
              <div className="space-y-1.5">
                <label htmlFor="gift-message" className="text-[12px] font-bold tracking-wider text-ink-200 uppercase">
                  গিফট মেসেজ (ঐচ্ছিক)
                </label>
                <textarea
                  id="gift-message"
                  maxLength={200}
                  placeholder="Write a heartfelt message..."
                  className="w-full resize-none rounded-xl border border-ink/10 bg-cream px-3 py-2.5 text-[13px] text-ink placeholder:text-ink/30 focus:border-coral focus:outline-none"
                  rows={3}
                  value={gift.message}
                  onChange={(e) => setGift(g => ({ ...g, message: e.target.value }))}
                />
              </div>
              <div className="text-right text-[11px] text-ink/30">{gift.message.length}/200</div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={gift.wrap} onChange={(e) => setGift(g => ({ ...g, wrap: e.target.checked }))}
                  className="h-4 w-4 rounded accent-brand-500" />
                <span className="text-[13px] text-ink">Gift wrap <span className="text-coral font-bold">+৳50</span></span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={gift.hidePrice} onChange={(e) => setGift(g => ({ ...g, hidePrice: e.target.checked }))}
                  className="h-4 w-4 rounded accent-brand-500" />
                <span className="text-[13px] text-ink">Hide price from recipient</span>
              </label>
              <div className="space-y-1.5">
                <label htmlFor="gift-recipient-name" className="text-[12px] font-bold tracking-wider text-ink-200 uppercase">
                  প্রাপকের নাম
                </label>
                <input
                  id="gift-recipient-name"
                  placeholder="Recipient name (optional)"
                  className="w-full rounded-xl border border-ink/10 bg-cream px-3 py-2.5 text-[13px] text-ink placeholder:text-ink/30 focus:border-coral focus:outline-none"
                  value={gift.recipientName}
                  onChange={(e) => setGift(g => ({ ...g, recipientName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="gift-recipient-phone" className="text-[12px] font-bold tracking-wider text-ink-200 uppercase">
                  প্রাপকের নম্বর
                </label>
                <input
                  id="gift-recipient-phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Recipient phone (optional)"
                  className="w-full rounded-xl border border-ink/10 bg-cream px-3 py-2.5 text-[13px] text-ink placeholder:text-ink/30 focus:border-coral focus:outline-none"
                  value={gift.recipientPhone}
                  onChange={(e) => setGift(g => ({ ...g, recipientPhone: e.target.value }))}
                />
              </div>
            </div>
          )}
        </section>

        {/* Extras — wallet redeem / promo code / referral code, collapsed by
            default so the payment step doesn't overwhelm on first view.
            Auto-expands if one of these was already applied earlier. */}
        <section className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <button
            type="button"
            onClick={() => setShowExtras((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3.5"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-50 text-ink-200">
                <Tag className="h-4 w-4" strokeWidth={2} />
              </div>
              <span className=" text-[14px] font-bold tracking-tight text-ink">
                ডিসকাউন্ট / রেফারেল (ঐচ্ছিক)
              </span>
              {extrasAlreadyApplied && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-600">
                  Applied
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-ink-200">
              {extrasOpen ? 'Hide' : 'Show'}
            </span>
          </button>

          {extrasOpen && (
            <div className="border-t border-ink-50 px-4 py-3.5">
              {user && walletBalance > 0 && (
                <div
                  className="mb-3 rounded-2xl overflow-hidden border border-coral/20 bg-coral-50"
                  style={{ boxShadow: '0 1px 2px rgba(26,19,17,.02), 0 8px 24px -16px rgba(26,19,17,.16)' }}
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-[18px] w-[18px] text-coral" strokeWidth={2} />
                      <div>
                        <div className="text-[12.5px] font-bold text-coral-800">
                          ৳{walletBalance.toLocaleString()} wallet balance
                        </div>
                        <div className="text-[11px] text-coral-600">
                          Max ৳{WALLET_MAX_REDEEM} off per order
                        </div>
                      </div>
                    </div>
                    {pendingLoyaltyRedeem === 0 ? (
                      <button
                        onClick={() => {
                          if (promoDiscount > 0) {
                            setPromoError('Promo code is active — remove it first to use wallet');
                            return;
                          }
                          if (maxRedeemable <= 0) return;
                          setPendingLoyaltyRedeem(maxRedeemable);
                          setPromoError('');
                        }}
                        disabled={!canRedeem}
                        className="rounded-xl bg-coral px-3 py-1.5 text-[11.5px] font-bold text-white active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Use ৳{maxRedeemable}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[11.5px] font-bold text-emerald-700">
                          −৳{walletDiscount} applied
                        </span>
                        <button onClick={() => clearLoyalty()} className="text-[11px] text-ink/40 underline">
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  {!canRedeem && walletBalance > 0 && subtotal < WALLET_MIN_ORDER_TO_REDEEM && (
                    <div className="px-4 pb-2 text-[11px] text-ink/40">
                      Add ৳{WALLET_MIN_ORDER_TO_REDEEM - subtotal} more to use wallet
                    </div>
                  )}
                  {promoDiscount > 0 && pendingLoyaltyRedeem === 0 && (
                    <div className="px-4 pb-2.5 text-[11px] text-coral-700">
                      Remove the promo code to use wallet balance.
                    </div>
                  )}
                </div>
              )}

              {/* Promo code — ported from CartScreen unchanged */}
              <div className="mb-3">
                <div className="flex items-center gap-2.5 rounded-2xl border border-dashed border-coral-200 bg-coral-50/40 px-3.5 py-3">
                  <Tag className="h-4 w-4 text-ink-200" />
                  <input
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      setPromoError('');
                    }}
                    placeholder="Promo code"
                    className="flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:text-ink-200"
                    disabled={pendingLoyaltyRedeem > 0}
                  />
                  <button
                    onClick={() => {
                      if (pendingLoyaltyRedeem > 0) {
                        setPromoError('Wallet balance is active — remove it first');
                        return;
                      }
                      const enteredCode = promoInput.trim().toUpperCase();

                      // Check the multi-coupon list first (My Coupons screen), then
                      // fall back to the legacy single admin promo code.
                      const matchedCoupon = (settings.coupons ?? []).find((c) => {
                        if (c.code.trim().toUpperCase() !== enteredCode) return false;
                        if (!c.active) return false;
                        if (c.maxUses > 0 && c.usedCount >= c.maxUses) return false;
                        if (c.expiresAt) {
                          const exp = new Date(c.expiresAt);
                          exp.setHours(23, 59, 59, 999);
                          if (!Number.isNaN(exp.getTime()) && exp.getTime() < Date.now()) return false;
                        }
                        return true;
                      });

                      if (matchedCoupon) {
                        applyPromo(matchedCoupon.discount);
                        setPromoError('');
                        return;
                      }

                      if (!settings.promoEnabled) {
                        setPromoError('No active promo right now');
                        clearPromo();
                        return;
                      }
                      if (enteredCode === settings.promoCode.trim().toUpperCase()) {
                        applyPromo(settings.promoPercent);
                        setPromoError('');
                      } else {
                        setPromoError('Invalid promo code');
                        clearPromo();
                      }
                    }}
                    disabled={pendingLoyaltyRedeem > 0}
                    className="text-[12px] font-bold uppercase tracking-wider text-ink hover:text-coral disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="mt-1.5 px-3.5 text-red-500 text-[11.5px] font-semibold">{promoError}</p>
                )}
                {promoDiscount > 0 && !promoError && (
                  <p className="mt-1.5 px-3.5 text-emerald-600 text-[11.5px] font-semibold">
                    Promo code "{promoInput.trim().toUpperCase()}" applied! ({promoDiscount}% discount)
                  </p>
                )}
                {pendingLoyaltyRedeem > 0 && (
                  <p className="mt-1.5 px-3.5 text-emerald-600 text-[11.5px] font-semibold">
                    ৳{walletDiscount} wallet balance redeemed
                  </p>
                )}
              </div>

              {/* Referral Code - BUG 3 FIX */}
              <div className="pt-3 border-t border-ink/5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-ink-200" />
                    <label htmlFor="referral-code" className="text-[12px] font-bold tracking-wider text-ink-200 uppercase">
                      রেফারেল কোড (ঐচ্ছিক)
                    </label>
                    <span className="text-[11px] text-ink/40">(সর্বোচ্চ ৩ বার ব্যবহার করা যাবে)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="referral-code"
                      value={referralInput}
                      onChange={(e) => { setReferralInput(e.target.value); setReferralError(''); }}
                      placeholder="কারো রেফারেল কোড আছে?"
                      disabled={referralApplied}
                      className="flex-1 h-10 rounded-xl border border-ink-50 bg-white px-3 text-[13px] font-medium text-ink outline-none focus:border-coral focus:ring-2 focus:ring-coral/15 disabled:opacity-50"
                    />
                    <button
                      onClick={() => void applyReferralCodeHandler()}
                      disabled={referralApplied || !referralInput || referralLoading}
                      className="rounded-xl bg-coral px-3.5 py-2 text-[12px] font-bold text-white active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {referralLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                </div>
                {referralApplied && (
                  <div className="mt-2 text-[11.5px] text-emerald-600 font-semibold">
                    Referral code applied! ৳{WALLET_REFERRAL_BONUS} wallet credit — পরের অর্ডারে ব্যবহার করুন
                  </div>
                )}
                {referralError && (
                  <div className="mt-2 text-[11.5px] text-red-500 font-semibold">{referralError}</div>
                )}
                {userReferralCode && (
                  <div className="mt-2 text-[11px] text-ink/40">
                    Your code: <span className="font-mono font-bold">{userReferralCode}</span> — share it to earn ৳{WALLET_REFERRAL_BONUS} per referral
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Review summary — read-only recap of what was entered on step 1.
            No payment-method row here — that's picked next, on step 2. */}
        <Section icon={Check} title="অর্ডার সামারি">
          <div className="space-y-2.5 text-[13px]">
            <div className="flex items-start justify-between gap-3">
              <span className="text-ink-200">ডেলিভারি ঠিকানা</span>
              <div className="flex items-start gap-2.5">
                <div className="text-right">
                  <p className="font-bold text-ink">{form.name}</p>
                  <p className="text-ink-200">{checkoutPhone}</p>
                  <p className="max-w-[200px] text-ink-200">{checkoutAddress}, {checkoutDistrict}</p>
                </div>
                <EditButton onClick={() => setAddressPickerOpen(true)} />
              </div>
            </div>
            <div className="h-px bg-ink-50" />
            <div className="flex items-center justify-between">
              <span className="text-ink-200">ডেলিভারি সময়</span>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-ink">{form.date} · {form.time}</span>
                <EditButton onClick={() => setDatePickerOpen(true)} />
              </div>
            </div>
            {giftMode && (
              <>
                <div className="h-px bg-ink-50" />
                <div className="flex items-center justify-between">
                  <span className="text-ink-200">গিফট অর্ডার</span>
                  <span className="font-bold text-ink">{gift.wrap ? 'হ্যাঁ, wrap সহ' : 'হ্যাঁ'}</span>
                </div>
              </>
            )}
          </div>
        </Section>

        {/* Bill — now also breaks the total into what's due now (advance) vs
            what's settled at delivery (remaining), so there are no surprises
            before the payment step. */}
        <Section title="বিল বিবরণ" className="!p-0">
          <div className="space-y-2 px-4 py-4 text-[13px]">
            <Row label={`সাবটোটাল (${items.length} আইটেম)`} value={formatINR(subtotal)} />
            <Row
              label="ডেলিভারি চার্জ"
              value={delivery === 0 ? 'ফ্রি' : formatINR(delivery)}
              positive={delivery === 0}
            />
            {promoDiscountAmount > 0 && (
              <Row
                label="প্রোমো ডিসকাউন্ট"
                value={'-' + formatINR(Math.round(promoDiscountAmount))}
                positive
              />
            )}
            {walletDiscount > 0 && (
              <Row
                label="Wallet discount"
                value={'-৳' + walletDiscount}
                positive
              />
            )}
            {giftMode && gift.wrap && <Row label="Gift wrap" value={formatINR(50)} />}
            <div className="h-px bg-ink-50" />
            <div className="flex items-center justify-between pt-1">
              <span className=" text-[15px] font-bold tracking-tight text-ink">মোট</span>
              <span className=" text-[20px] font-bold tabular text-ink">{formatINR(total)}</span>
            </div>
            <div className="h-px bg-ink-50" />
            <Row label="অগ্রিম (এখনই, প্রস্তুতির জন্য)" value={formatINR(advanceAmount)} positive />
            <Row label="বাকি (ডেলিভারির সময়)" value={formatINR(remainingAmount)} />
          </div>
        </Section>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3 text-[11px] text-ink-300 font-semibold shadow-sm">
          <Shield className="h-3.5 w-3.5 text-coral/80" />
          নিরাপদ ও বিশ্বস্ত অর্ডার প্রসেসিং
        </div>
        </>
        )}

        {step === 2 && (
        <>
        {/* Advance payment — always online (bKash/Nagad), required before the
            baker starts production. */}
        <Section icon={Wallet} title="অগ্রিম পেমেন্ট">
          <div className="mb-3 flex items-center justify-between rounded-2xl bg-coral-50 px-3.5 py-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-coral-700">এখনই দিতে হবে</div>
              <div className="text-[11.5px] text-ink/50">কেক প্রস্তুতি শুরু হবে এই পেমেন্ট পাওয়ার পর</div>
            </div>
            <div className=" text-[20px] font-bold tabular text-coral-700">{formatINR(advanceAmount)}</div>
          </div>
          <div className="space-y-2">
            {ADVANCE_METHODS.map((method) => {
              const isSelected = advancePayment === method.id;
              const methodNumber = method.id === 'bkash' ? settings.bkashNumber : settings.nagadNumber;
              return (
                <div
                  key={method.id}
                  className={`overflow-hidden rounded-2xl border-2 transition ${
                    isSelected ? 'border-coral bg-coral/[0.08] shadow-card scale-[1.01] transition-all duration-200' : 'border-border bg-surface transition-all duration-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => { setAdvancePayment(method.id); setNumberCopied(false); }}
                    className="flex w-full items-center gap-4 p-3.5"
                  >
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-[13px] font-bold text-white"
                      style={{ background: method.color }}
                    >
                      {method.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[13.5px] font-bold text-ink">{method.name}</p>
                      <p className="text-[12px] text-ink-200">{method.desc}</p>
                    </div>
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected ? 'border-coral' : 'border-ink-100'
                      }`}
                    >
                      {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-coral" />}
                    </div>
                  </button>

                  {isSelected && (
                    <div className="border-t border-coral/20 px-3.5 pb-3.5 pt-3 anim-fade">
                      <p className="mb-1.5 text-[11px] text-ink-200">এই নাম্বারে Send Money করুন</p>
                      <div className="flex items-center gap-2 rounded-xl border border-coral/20 bg-white px-3 py-2.5">
                        <span className="flex-1 text-[15px] font-bold tabular tracking-wide text-ink">
                          {methodNumber}
                        </span>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const ok = await copyText(methodNumber);
                            if (ok) {
                              setNumberCopied(true);
                              setAppPopupOpen(true);
                            }
                          }}
                          className="flex h-9 items-center gap-1 rounded-full bg-coral px-3.5 text-[11.5px] font-bold text-white shadow-btn active:scale-95"
                        >
                          {numberCopied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                        </button>
                      </div>
                      <p className="mt-1.5 text-[10.5px] text-ink/40">Personal number · Send Money অপশন ব্যবহার করুন</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <PaymentAppPopup
            open={appPopupOpen}
            onClose={() => setAppPopupOpen(false)}
            method={advancePayment}
            number={advancePayment === 'bkash' ? settings.bkashNumber : settings.nagadNumber}
          />

          <div className="mt-4 rounded-2xl border border-border bg-coral-50/10 p-4 shadow-sm">
            <div className="mb-2 text-[12.5px] font-bold text-ink">Payment screenshot</div>
            <div className="text-[11.5px] text-ink-300 font-medium">অগ্রিম ৳{advanceAmount} পাঠানোর পর screenshot upload করুন, admin verify করবে।</div>
            {paymentScreenshotPreview ? (
              <div className="mt-3 relative inline-block">
                <img src={paymentScreenshotPreview} alt="payment screenshot" className="h-24 w-24 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => { setPaymentScreenshotFile(null); setPaymentScreenshotPreview(''); }}
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="mt-3 flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-coral-200 bg-white hover:border-coral transition shadow-sm">
                <ImageIcon className="h-6 w-6 text-coral" strokeWidth={1.5} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPaymentScreenshotFile(file);
                    setPaymentScreenshotPreview(URL.createObjectURL(file));
                    setSubmitError('');
                  }}
                />
              </label>
            )}
          </div>
        </Section>

        {/* Remaining amount — settled at delivery, customer's choice of method */}
        <Section icon={Banknote} title="বাকি টাকা পরিশোধ">
          <div className="mb-3 flex items-center justify-between rounded-2xl bg-ink-50 px-3.5 py-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-ink-200">ডেলিভারির সময় দিবেন</div>
              <div className="text-[11.5px] text-ink/50">Cash অথবা bKash/Nagad — যেভাবে সুবিধা</div>
            </div>
            <div className=" text-[20px] font-bold tabular text-ink">{formatINR(remainingAmount)}</div>
          </div>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = form.payment === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setForm({ ...form, payment: method.id })}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-3.5 transition ${
                    isSelected ? 'border-coral bg-coral/[0.08] shadow-card scale-[1.01] transition-all duration-200' : 'border-border bg-surface transition-all duration-200'
                  }`}
                >
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-[13px] font-bold text-white"
                    style={{ background: method.color }}
                  >
                    {method.name.slice(0, 2)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[13.5px] font-bold text-ink">{method.name}</p>
                    <p className="text-[12px] text-ink-200">{method.desc}</p>
                  </div>
                  <div
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected ? 'border-coral' : 'border-ink-100'
                    }`}
                  >
                    {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-coral" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3 text-[11px] text-ink-300 font-semibold shadow-sm">
          <Shield className="h-3.5 w-3.5 text-coral/80" />
          নিরাপদ ও বিশ্বস্ত অর্ডার প্রসেসিং
        </div>
        </>
        )}
      </div>

      {selectedCartItem && (
        <div className="fixed inset-0 z-[130] flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-ink/35 anim-fade"
            onClick={() => setSelectedCartItem(null)}
            aria-label="Close item details"
          />
          <section className="relative rounded-t-[28px] border-t border-border bg-surface px-6 pb-8 pt-4 shadow-float anim-up">
            <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-ink-100" />
            <div className="mb-4 flex items-start gap-4 border-b border-border pb-4">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-secondary shadow-card">
                <img src={selectedCartItem.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-200">PRODUCT DETAILS</p>
                <h2 className="line-clamp-2 text-[18px] font-bold text-ink">{selectedCartItem.name}</h2>
                <p className="mt-1 text-[13px] font-medium text-ink-300">Cart item details</p>
              </div>
              <button type="button" onClick={() => setSelectedCartItem(null)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <DetailRow label="Size" value={selectedCartItem.size || '—'} />
              <DetailRow label="Flavor" value={selectedCartItem.flavor || '—'} />
              {selectedCartItem.topping && <DetailRow label="Add-ons / topping" value={selectedCartItem.topping} />}
              {selectedCartItem.message && <DetailRow label="Message" value={selectedCartItem.message} />}
              <DetailRow label="Unit price" value={formatINR(selectedCartItem.price)} />
              <DetailRow label="Quantity" value={`×${selectedCartItem.quantity}`} />
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between text-[15px]">
                <span className="font-bold text-ink">Item total</span>
                <span className="font-bold tabular text-coral">{formatINR(selectedCartItem.price * selectedCartItem.quantity)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCartItem(null)}
              className="mt-6 h-14 w-full rounded-2xl bg-coral text-[15px] font-bold text-white shadow-btn"
            >
              Close details
            </button>
          </section>
        </div>
      )}

      {addressPickerOpen && (
        <div className="fixed inset-0 z-[130] flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-ink/35 anim-fade"
            onClick={() => setAddressPickerOpen(false)}
            aria-label="Close address picker"
          />
          <section className="relative rounded-t-[28px] border-t border-border bg-surface px-6 pb-8 pt-4 shadow-float anim-up">
            <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-ink-100" />
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="text-[20px] font-semibold tracking-tight text-ink">Delivery Address</h2>
                <p className="mt-1 text-[12px] font-medium text-ink-300">Choose one saved address for this order</p>
              </div>
              <button
                type="button"
                onClick={() => { setAddressPickerOpen(false); go({ name: 'tabs', tab: 'profile' }); }}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-coral"
              >
                Add New
              </button>
            </div>

            {checkoutAddressCards.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-border bg-bg px-5 py-8 text-center">
                <MapPin className="mx-auto h-8 w-8 text-coral" strokeWidth={1.8} />
                <p className="mt-3 text-[14px] font-bold text-ink">No saved address</p>
                <p className="mt-1 text-[12px] text-ink-300">Add an address from Profile → Manage Address.</p>
                <button
                  type="button"
                  onClick={() => { setAddressPickerOpen(false); go({ name: 'tabs', tab: 'profile' }); }}
                  className="mt-4 rounded-full bg-coral px-5 py-2.5 text-[12px] font-bold text-white shadow-btn"
                >
                  Add address
                </button>
              </div>
            ) : (
              <div className="no-scrollbar max-h-[48vh] space-y-3 overflow-y-auto pr-1">
                {checkoutAddressCards.map((addr) => {
                  const selected = selectedAddressId === addr.id;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => applyCheckoutAddress(addr)}
                      className={`flex w-full items-start gap-4 rounded-[18px] border px-4 py-4 text-left transition active:scale-[.99] ${
                        selected ? 'border-coral bg-coral-50/50 shadow-card' : 'border-border bg-bg'
                      }`}
                    >
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${selected ? 'bg-coral text-white' : 'bg-secondary text-coral'}`}>
                        {selected ? <Check className="h-5 w-5" strokeWidth={2.5} /> : <MapPin className="h-5 w-5" strokeWidth={1.8} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="line-clamp-1 text-[15px] font-bold text-ink">{addr.label}</span>
                          {addr.isDefault && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-coral">Default</span>}
                        </span>
                        <span className="mt-1 block text-[13px] leading-snug text-ink-300">{addr.sub}</span>
                        {addr.phone && <span className="mt-1 block text-[12px] text-ink-200">{addr.phone}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {datePickerOpen && (
        <div className="fixed inset-0 z-[130] flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-ink/35 anim-fade"
            onClick={() => setDatePickerOpen(false)}
            aria-label="Close date picker"
          />
          <section className="relative rounded-t-[28px] border-t border-border bg-surface px-6 pb-8 pt-4 shadow-float anim-up">
            <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-ink-100" />
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="text-[20px] font-semibold tracking-tight text-ink">Delivery Time</h2>
                <p className="mt-1 text-[12px] font-medium text-ink-300">Choose your delivery date and preferred slot</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, date: getMinDeliveryDate(), time: '4pm - 6pm' }));
                }}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-coral"
              >
                Reset
              </button>
            </div>

            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
              {dateOptions.map((option) => {
                const active = form.date === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, date: option.value }))}
                    className={`flex min-w-[74px] flex-col items-center rounded-[18px] border px-3 py-3 transition active:scale-95 ${
                      active ? 'border-coral bg-coral text-white shadow-btn' : 'border-border bg-bg text-ink'
                    }`}
                  >
                    <span className={`text-[11px] font-bold uppercase ${active ? 'text-white/80' : 'text-ink-200'}`}>{option.label}</span>
                    <span className="mt-1 text-[22px] font-bold leading-none tabular">{option.day}</span>
                    <span className={`mt-1 text-[11px] font-semibold ${active ? 'text-white/80' : 'text-ink-300'}`}>{option.month}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-ink">Pickup / Delivery Slot</h3>
                <span className="text-[12px] font-medium text-ink-300">{selectedDateOption?.full}</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {SLOTS.map((slot) => {
                  const active = form.time === slot.v;
                  return (
                    <button
                      key={slot.v}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, time: slot.v }))}
                      className={`relative h-12 rounded-2xl border text-[13px] font-bold transition active:scale-95 ${
                        active ? 'border-coral bg-coral text-white shadow-btn' : 'border-border bg-bg text-ink'
                      }`}
                    >
                      {slot.v}
                      {slot.hot && !active && (
                        <span className="absolute -right-1.5 -top-1.5 rounded-full bg-ink px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">Popular</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDatePickerOpen(false)}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-coral text-[14px] font-bold text-white shadow-btn transition active:scale-[.98]"
            >
              Confirm
            </button>
          </section>
        </div>
      )}

      {/* Sticky CTA */}
      <div className="absolute right-0 bottom-0 left-0 z-30 bg-white/95 px-6 pt-4 pb-6 shadow-float rounded-t-[22px]">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-ink-300 uppercase">
              {step === 2 ? 'অগ্রিম দিন' : 'মোট'}
            </div>
            <div className="font-sans text-[20px] font-bold tabular text-ink">
              {formatINR(step === 2 ? advanceAmount : total)}
            </div>
          </div>
          <button
            onClick={goNext}
            disabled={step === 2 ? (!form.name || !checkoutPhone || !checkoutAddress || !paymentScreenshotFile || submitting) : false}
            className="ml-auto flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-coral hover:bg-coral-600 text-white text-[14px] font-bold tracking-tight shadow-btn active:scale-[0.985] disabled:opacity-50 transition"
          >
            {step < 2 ? 'পরবর্তী' : submitting ? 'Submitting...' : 'Continue to Payment'}
            {step < 2 ? null : submitting ? <Loader2 className="h-[18px] w-[18px] animate-spin" strokeWidth={2.5} /> : <Check className="h-[18px] w-[18px]" strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function Header({
  title, onBack, step = 0, onStepClick,
}: {
  title: string;
  onBack: () => void;
  step?: number;
  onStepClick?: (i: 0 | 1 | 2) => void;
}) {
  const steps = ['ঠিকানা', 'নিশ্চিত', 'পেমেন্ট'];
  return (
    <header className="flex-shrink-0 border-b border-ink-50/80 px-6 pt-3 pb-3">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink transition active:scale-90"
          style={{ boxShadow: '0 1px 2px rgba(26,19,17,.03), 0 6px 16px -10px rgba(26,19,17,.2)' }}
        >
          <ArrowLeft className="h-[20px] w-[20px]" strokeWidth={2} />
        </button>
        <h1 className=" text-[16px] font-bold tracking-tight text-ink">{title}</h1>
        <div className="w-10" />
      </div>
      {/* Step indicator — reflects real step state; tapping a reached step jumps back to it */}
      <div className="flex items-center gap-1.5">
        {steps.map((s, i) => {
          const reached = i <= step;
          const clickable = Boolean(onStepClick) && i <= step;
          return (
            <div
              key={s}
              className={`flex flex-1 items-center gap-1.5 ${clickable ? 'cursor-pointer' : ''}`}
              onClick={() => clickable && onStepClick?.(i as 0 | 1 | 2)}
            >
              <div className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="h-1 w-full rounded-full transition-all"
                  style={{ background: reached ? 'var(--color-coral)' : 'rgba(28,17,18,0.10)' }}
                />
                <span
                  className={`origin-bottom font-bold tracking-wide transition-all duration-300 ease-out ${i === step ? 'scale-110 text-[11px] anim-pop' : reached ? 'scale-100 text-[9.5px]' : 'scale-100 text-[9px]'}`}
                  style={{ color: reached ? 'var(--color-coral)' : 'var(--color-ink-200)' }}
                >
                  {s}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </header>
  );
}

function Section({
  icon: Icon, title, badge, children, className = '',
}: {
  icon?: any;
  title: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`mt-3 overflow-hidden rounded-2xl border border-border bg-surface shadow-card ${className}`}
    >
      <div className="flex items-center gap-2.5 border-b border-divider px-4 py-3">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-coral">
            <Icon className="h-4 w-4" strokeWidth={2} />
          </div>
        )}
        <h3 className="font-sans text-[14px] font-bold tracking-tight text-ink">{title}</h3>
        {badge && (
          <span className="ml-auto rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-coral">
            {badge}
          </span>
        )}
      </div>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 rounded-2xl bg-bg px-4 py-3.5">
      <span className="min-w-0 font-medium text-ink-300">{label}</span>
      <span className="line-clamp-1 max-w-[60%] flex-shrink-0 text-right font-bold text-ink">{value}</span>
    </div>
  );
}

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-300 font-medium">{label}</span>
      <span className={`tabular font-bold ${positive ? 'text-emerald-600' : 'text-ink'}`}>
        {value}
      </span>
    </div>
  );
}

// Explicit "Edit" affordance on each review row — the small step-indicator at
// the top is clickable too, but that's not discoverable on its own. A visible
// button here makes it obvious a mistake can be fixed with one tap.
function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 rounded-full bg-secondary hover:bg-coral-100 px-3 py-1 text-[11px] font-bold text-coral active:scale-95 transition shadow-sm border border-coral-100"
    >
      Edit
    </button>
  );
}