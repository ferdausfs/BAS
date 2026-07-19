import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Heart, MapPin, CreditCard, Bell, HelpCircle, Settings, LogOut,
  ChevronRight, Star, Sparkles, LogIn, X, Save, Check, User, AlertTriangle,
  Cake, Gift, Wallet as WalletIcon,
  Copy, Share2, Navigation, Loader2, Tag
} from 'lucide-react';
import { useUI, useUser, useOrders, useCart, useAuthStore, useWallet, getReferralCode, claimReferralRewards, WALLET_REFERRAL_BONUS } from '../lib/store';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { ls } from '../lib/utils';
import BrandLogo from '../components/BrandLogo';
import WalletHistoryModal from '../components/WalletHistoryModal';
import { ChatBot } from '../components/ChatBot';
import { AdminPanel } from '../components/AdminPanel';
import { BD_DISTRICTS } from '../lib/zones';
import type { SavedAddress, SpecialDate } from '../types';
import { useModalDepth } from '../hooks/useModalDepth';

const loadAddresses = (userId?: string): SavedAddress[] => {
  if (!userId) return [];
  return ls.get<SavedAddress[]>(`bakeart-addresses-${userId}`, []);
};
const saveAddresses = (userId: string, addresses: SavedAddress[]) => {
  ls.set(`bakeart-addresses-${userId}`, addresses);
};

const loadSpecialDates = (userId?: string): SpecialDate[] =>
  userId ? ls.get<SpecialDate[]>(`bakeart-dates-${userId}`, []) : [];
const saveSpecialDates = (userId: string, dates: SpecialDate[]) =>
  ls.set(`bakeart-dates-${userId}`, dates);

interface Props {
  onAuthOpen?: () => void;
  isAdmin?: boolean;
}

type SavedPayment = 'bkash' | 'nagad' | 'cash';

type CustomerProfile = {
  name: string;
  phone: string;
  address: string;
  district: string;
  payment: SavedPayment;
};

const CUSTOMER_PROFILE_KEY = 'bakeart-customer-profile';

const PAYMENTS: { id: SavedPayment; label: string; sub: string }[] = [
  { id: 'bkash', label: 'bKash', sub: 'Mobile payment' },
  { id: 'nagad', label: 'Nagad', sub: 'Mobile payment' },
  { id: 'cash', label: 'Cash on Delivery', sub: 'Pay when delivered' },
];

const emptyCustomerProfile = (name = ''): CustomerProfile => ({
  name,
  phone: '',
  address: '',
  district: 'Comilla',
  payment: 'cash',
});

function loadCustomerProfile(userId: string | undefined, defaultName = ''): CustomerProfile {
  try {
    const key = userId ? `${CUSTOMER_PROFILE_KEY}-${userId}` : CUSTOMER_PROFILE_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) return emptyCustomerProfile(defaultName);
    return { ...emptyCustomerProfile(defaultName), ...JSON.parse(raw) };
  } catch {
    return emptyCustomerProfile(defaultName);
  }
}

function saveCustomerProfile(userId: string | undefined, profile: CustomerProfile) {
  const key = userId ? `${CUSTOMER_PROFILE_KEY}-${userId}` : CUSTOMER_PROFILE_KEY;
  localStorage.setItem(key, JSON.stringify(profile));
}

class AdminErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; errorMessage: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMessage: error?.message || String(error) };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("AdminPanel render error caught by Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-[#969696]/20 bg-[#969696]/5 rounded-3xl p-5 mt-4 text-center">
          <div className="flex justify-center text-[#969696] mb-2">
            <AlertTriangle size={32} strokeWidth={1.75} />
          </div>
          <h2 className="text-sm font-bold text-[#969696] mb-1">Admin Dashboard Error</h2>
          <p className="text-xs text-[#969696] mb-2">{this.state.errorMessage}</p>
          <p className="text-xs text-[#b5b5b5]">Refresh the page to retry.</p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            className="mt-3 px-4 py-2 rounded-xl bg-[#969696] text-white text-xs font-bold"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ProfileScreen({ onAuthOpen, isAdmin = false }: Props) {
  const { go, setChatOpen } = useUI();
  const { wishlist } = useUser();
  const { orders } = useOrders();
  const { items } = useCart();
  const { user } = useAuthStore();
  const effectiveIsAdmin = isAdmin || !!user?.isAdmin;
  const { signOut } = useAuth();
  const { products } = useProducts();
  const { balance, totalEarned } = useWallet();
  const referralCode = getReferralCode(user);
  const [walletHistoryOpen, setWalletHistoryOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const APP_URL = 'https://bas.umuhammadiswa.workers.dev';
  const referralLink = referralCode ? `${APP_URL}?ref=${referralCode}` : APP_URL;

  const [contactOpen, setContactOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [, setLogoTapCount] = useState(0);

  const [savedProfile, setSavedProfile] = useState(() =>
    loadCustomerProfile(user?.id, user?.name ?? '')
  );
  const [draftProfile, setDraftProfile] = useState(() =>
    loadCustomerProfile(user?.id, user?.name ?? '')
  );

  const [addresses, setAddresses] = useState(() => loadAddresses(user?.id));
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [addrForm, setAddrForm] = useState({ name: '', address: '', district: '', phone: '' });
  const [addrLocating, setAddrLocating] = useState(false);
  const [addrLocateError, setAddrLocateError] = useState('');
  const [profileLocating, setProfileLocating] = useState(false);
  const [profileLocateError, setProfileLocateError] = useState('');

  const [specialDates, setSpecialDates] = useState(() => loadSpecialDates(user?.id));
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [dateForm, setDateForm] = useState({ type: 'birthday' as SpecialDate['type'], name: '', date: '' });

  useModalDepth(showAddressModal);
  useModalDepth(showDatesModal);
  useModalDepth(inviteOpen);
  useModalDepth(walletHistoryOpen);
  useModalDepth(contactOpen);
  useModalDepth(customerOpen);

  const wishlistItems = (products ?? []).filter((p) => p && wishlist.includes(p.id));

  const paymentLabel = useMemo(
    () => PAYMENTS.find((p) => p.id === savedProfile.payment)?.label ?? 'Cash on Delivery',
    [savedProfile.payment]
  );

  useEffect(() => {
    const next = loadCustomerProfile(user?.id, user?.name ?? '');
    const merged = {
      ...next,
      name: next.name || user?.name || '',
      phone: next.phone || user?.contact || '',
      address: next.address || user?.locationAddress || '',
      district: next.district || user?.district || 'Comilla',
    };
    setSavedProfile(merged);
    setDraftProfile(merged);
  }, [user?.id, user?.name, user?.contact, user?.district, user?.locationAddress]);

  useEffect(() => {
    setChatOpen(contactOpen || customerOpen);
    return () => setChatOpen(false);
  }, [contactOpen, customerOpen, setChatOpen]);

  useEffect(() => {
    if (!referralCode) return;
    let active = true;
    void (async () => {
      const count = await claimReferralRewards(referralCode);
      if (active && count > 0) {
        useUI.getState().addNotification(
          '🎉 Referral reward!',
          `৳${count * WALLET_REFERRAL_BONUS} added for ${count} referral${count > 1 ? 's' : ''}!`
        );
      }
    })();
    return () => { active = false; };
  }, [referralCode]);

  useEffect(() => {
    if (user?.id) saveAddresses(user.id, addresses);
  }, [addresses, user?.id]);

  useEffect(() => {
    if (user?.id) saveSpecialDates(user.id, specialDates);
  }, [specialDates, user?.id]);

  useEffect(() => {
    if (!user?.id || specialDates.length === 0) return;
    const today = new Date();
    const currentYear = today.getFullYear();
    const updated = [...specialDates];
    let changed = false;
    updated.forEach((d, i) => {
      const [month, day] = d.date.split('-').map(Number);
      const eventDate = new Date(currentYear, month - 1, day);
      const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 7 && d.notifiedYear !== currentYear) {
        useUI.getState().addNotification(
          `${d.name} in ${diffDays === 0 ? 'today!' : `${diffDays} day${diffDays > 1 ? 's' : ''}!`}`,
          `Order a special cake now to celebrate!`
        );
        updated[i] = { ...d, notifiedYear: currentYear };
        changed = true;
      }
    });
    if (changed) setSpecialDates(updated);
  }, [user?.id]);

  const openCustomerEditor = () => {
    const latest = loadCustomerProfile(user?.id, user?.name ?? '');
    setDraftProfile(latest);
    setCustomerOpen(true);
  };

  const handleSaveCustomer = useCallback(async () => {
    const next: CustomerProfile = {
      name: draftProfile.name.trim(),
      phone: draftProfile.phone.trim(),
      address: draftProfile.address.trim(),
      district: draftProfile.district.trim() || 'Comilla',
      payment: draftProfile.payment,
    };

    saveCustomerProfile(user?.id, next);
    setSavedProfile(next);

    if (user) {
      useAuthStore.getState().login({
        ...user,
        name: next.name || user.name,
        contact: next.phone,
        district: next.district,
        locationAddress: next.address,
      });
    }

    if (isFirebaseConfigured() && user?.id) {
      try {
        await setDoc(doc(db, 'profiles', user.id), {
          id: user.id,
          name: next.name,
          contact: next.phone,
          email: user.email,
          district: next.district,
          location_address: next.address,
          updated_at: new Date().toISOString(),
        }, { merge: true });
      } catch (error) {
        console.warn('Profile save failed:', error);
      }
    }

    setCustomerOpen(false);
  }, [draftProfile, user]);

  const handleLocateProfile = async () => {
    setProfileLocating(true);
    setProfileLocateError('');
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

      setDraftProfile((prev) => {
        const next = { ...prev, address: addressText };
        const detectedCity = (city || addressText).toLowerCase();
        const matchedDistrict = BD_DISTRICTS.find(
          (d) => detectedCity.includes(d.toLowerCase()) || addressText.toLowerCase().includes(d.toLowerCase())
        );
        if (matchedDistrict) {
          next.district = matchedDistrict;
        }
        return next;
      });
    } catch (e: unknown) {
      console.warn('Geolocation failed:', e);
      setProfileLocateError('লোকেশন শনাক্ত করা যায়নি, অনুগ্রহ করে ম্যানুয়ালি লিখুন।');
    } finally {
      setProfileLocating(false);
    }
  };

  const handleLocateAddress = async () => {
    setAddrLocating(true);
    setAddrLocateError('');
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

      setAddrForm((prev) => {
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
    } catch (e: unknown) {
      console.warn('Geolocation failed:', e);
      setAddrLocateError('লোকেশন শনাক্ত করা যায়নি, অনুগ্রহ করে ম্যানুয়ালি লিখুন।');
    } finally {
      setAddrLocating(false);
    }
  };

  const handleLogoTap = () => {
    setLogoTapCount((count) => {
      const next = count + 1;
      if (next >= 5) {
        setShowAdmin(true);
        useUI.getState().addNotification(
          effectiveIsAdmin ? 'Admin shortcut unlocked' : 'Admin access required',
          effectiveIsAdmin ? 'Admin dashboard is now visible below.' : 'This account is not marked as admin.'
        );
        return 0;
      }
      return next;
    });
  };

  const menu = [
    {
      Icon: Heart,
      label: 'Wishlist',
      sub: `${(wishlist ?? []).length} saved items`,
      action: () => go({ name: 'wishlist' }),
    },
    {
      Icon: MapPin,
      label: 'Delivery address',
      sub: savedProfile.address ? `${savedProfile.district} · default` : 'Set your delivery address',
      action: openCustomerEditor,
    },
    {
      Icon: CreditCard,
      label: 'Payment methods',
      sub: paymentLabel,
      action: openCustomerEditor,
    },
    {
      Icon: Bell,
      label: 'Notifications',
      sub: 'Order & promo updates',
      action: () => {},
    },
    {
      Icon: HelpCircle,
      label: 'Contact & Support',
      sub: 'কোনো সমস্যা? আমাদের জানান',
      action: () => setContactOpen(true),
    },
    {
      Icon: Settings,
      label: 'Settings',
      sub: 'Customer info & preferences',
      action: openCustomerEditor,
    },
  ];

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#ffffff] px-6">
        <div className="w-full max-w-sm rounded-[16px] bg-[#f8f8f8] p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-[130px] w-[130px] items-center justify-center rounded-full bg-[#d9d9d9]">
            <User size={48} className="text-[#999999]" strokeWidth={1.5} />
          </div>
          <h2 className="mb-2 text-[18px] font-semibold text-[#999999]">Sign In</h2>
          <p className="mb-6 text-[12px] text-[#bbbbbb]">
            Sign in to save your delivery info, orders, wishlist, and profile.
          </p>
          <button
            onClick={onAuthOpen}
            className="w-full rounded-[12px] bg-[#969696] py-3 text-[14px] font-medium text-white transition active:scale-[.98]"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-[#ffffff]">
      {/* Header label */}
      <div className="px-[20px] py-[8px]">
        <div className="h-[14px] w-[60px] rounded-[4px] bg-[#989898]" />
      </div>

      {/* Avatar — 130px circle, bg #d9d9d9 */}
      <div className="flex justify-center mt-[12px]">
        <div className="relative">
          {user.avatar && user.avatar.length > 2 ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-[130px] w-[130px] rounded-full object-cover border-[3px] border-[#f0f0f0]"
            />
          ) : (
            <div className="flex h-[130px] w-[130px] items-center justify-center rounded-full bg-[#d9d9d9] text-[36px] font-bold text-[#ffffff]">
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Name — 120px bar, bg #999999 */}
      <div className="flex justify-center mt-[16px]">
        <div className="h-[16px] w-[120px] rounded-[4px] bg-[#999999]" />
      </div>

      {/* Subtitle (email) — 180px bar, bg #bbbbbb */}
      {user.email && (
        <div className="flex justify-center mt-[8px]">
          <div className="h-[12px] w-[180px] rounded-[4px] bg-[#bbbbbb]" />
        </div>
      )}

      {/* Member badge */}
      <div className="flex justify-center mt-[8px] mb-[30px]">
        <div className="h-[10px] w-[80px] rounded-[3px] bg-[#c8c8c8]" />
      </div>

      {/* Menu sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Section 1: Quick Actions */}
        <div className="px-[24px] mb-[16px]">
          <div className="h-[10px] w-[80px] rounded-[3px] bg-[#aaaaaa] mb-[12px]" />

          {/* Wallet Card */}
          {user && (
            <div className="mb-[12px] rounded-[12px] bg-[#969696] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium text-white">My Wallet</span>
                <WalletIcon size={18} className="text-white" />
              </div>
              <div className="text-[24px] font-bold text-white mb-2">৳{balance.toLocaleString()}</div>
              <button
                onClick={() => setWalletHistoryOpen(true)}
                className="w-full rounded-[8px] bg-white/15 px-3 py-2 text-[11px] font-medium text-white transition active:scale-[.98]"
              >
                ৳{totalEarned.toLocaleString()} earned · {referralCode ?? '—'} | History →
              </button>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <button
              onClick={() => go({ name: 'tabs', tab: 'orders' })}
              className="flex flex-col items-center rounded-[12px] bg-[#f8f8f8] p-3 transition active:scale-[.98]"
            >
              <div className="text-[18px] font-bold text-[#999999]">{orders.length}</div>
              <div className="text-[10px] text-[#b5b5b5]">Orders</div>
            </button>
            <button
              onClick={() => go({ name: 'wishlist' })}
              className="flex flex-col items-center rounded-[12px] bg-[#f8f8f8] p-3 transition active:scale-[.98]"
            >
              <div className="text-[18px] font-bold text-[#999999]">{wishlist.length}</div>
              <div className="text-[10px] text-[#b5b5b5]">Wishlist</div>
            </button>
            <button
              onClick={() => go({ name: 'cart' })}
              className="flex flex-col items-center rounded-[12px] bg-[#f8f8f8] p-3 transition active:scale-[.98]"
            >
              <div className="text-[18px] font-bold text-[#999999]">{items.length}</div>
              <div className="text-[10px] text-[#b5b5b5]">Cart</div>
            </button>
          </div>
        </div>

        {/* Section 2: Account */}
        <div className="px-[24px] mb-[16px]">
          <div className="h-[10px] w-[80px] rounded-[3px] bg-[#aaaaaa] mb-[12px]" />

          {/* Address book */}
          {user && (
            <button
              onClick={() => setShowAddressModal(true)}
              className="w-full flex items-center gap-[12px] py-[14px] border-b border-[#f0f0f0] text-left transition active:scale-[.98]"
            >
              <div className="flex h-[20px] w-[20px] items-center justify-center rounded-[4px] bg-[#d5d5d5]">
                <MapPin size={14} className="text-[#999999]" />
              </div>
              <div className="flex-1">
                <div className="text-[12px] text-[#b5b5b5]">Address book</div>
                <div className="text-[10px] text-[#d0d0d0]">
                  {addresses.length === 0 ? 'Save multiple addresses' : `${addresses.length} address${addresses.length > 1 ? 'es' : ''} saved`}
                </div>
              </div>
              <ChevronRight size={16} className="text-[#cccccc]" />
            </button>
          )}

          {/* Special Dates */}
          {user && (
            <button
              onClick={() => setShowDatesModal(true)}
              className="w-full flex items-center gap-[12px] py-[14px] border-b border-[#f0f0f0] text-left transition active:scale-[.98]"
            >
              <div className="flex h-[20px] w-[20px] items-center justify-center rounded-[4px] bg-[#d5d5d5]">
                <Cake size={14} className="text-[#999999]" />
              </div>
              <div className="flex-1">
                <div className="text-[12px] text-[#b5b5b5]">Special Dates</div>
                <div className="text-[10px] text-[#d0d0d0]">
                  {specialDates.length === 0 ? 'Birthdays, anniversaries' : `${specialDates.length} date${specialDates.length > 1 ? 's' : ''} saved`}
                </div>
              </div>
              <ChevronRight size={16} className="text-[#cccccc]" />
            </button>
          )}

          {/* My Coupons */}
          <button
            onClick={() => go({ name: 'coupons' })}
            className="w-full flex items-center gap-[12px] py-[14px] border-b border-[#f0f0f0] text-left transition active:scale-[.98]"
          >
            <div className="flex h-[20px] w-[20px] items-center justify-center rounded-[4px] bg-[#d5d5d5]">
              <Tag size={14} className="text-[#999999]" />
            </div>
            <div className="flex-1">
              <div className="text-[12px] text-[#b5b5b5]">My Coupons</div>
              <div className="text-[10px] text-[#d0d0d0]">Offers you can use at checkout</div>
            </div>
            <ChevronRight size={16} className="text-[#cccccc]" />
          </button>
        </div>

        {/* Wishlist Preview */}
        {wishlistItems.length > 0 && (
          <div className="px-[24px] mb-[16px]">
            <div className="flex items-center justify-between mb-[12px]">
              <div className="h-[10px] w-[80px] rounded-[3px] bg-[#aaaaaa]" />
              <button
                onClick={() => go({ name: 'wishlist' })}
                className="text-[11px] font-medium text-[#b5b5b5] underline-offset-4 hover:underline"
              >
                See all
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {wishlistItems.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => go({ name: 'product', productId: p.id })}
                  className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-[12px] border border-[#eeeeee] transition active:scale-95"
                >
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Menu Items */}
        <div className="px-[24px] mb-[16px]">
          <div className="h-[10px] w-[80px] rounded-[3px] bg-[#aaaaaa] mb-[12px]" />

          {menu.map((m, i) => (
            <button
              key={i}
              onClick={m.action}
              className="w-full flex items-center gap-[12px] py-[14px] border-b border-[#f0f0f0] text-left transition active:scale-[.98]"
            >
              <div className="flex h-[20px] w-[20px] items-center justify-center rounded-[4px] bg-[#d5d5d5]">
                <m.Icon size={14} className="text-[#999999]" />
              </div>
              <div className="flex-1">
                <div className="text-[12px] text-[#b5b5b5]">{m.label}</div>
                <div className="text-[10px] text-[#d0d0d0]">{m.sub}</div>
              </div>
              <ChevronRight size={16} className="text-[#cccccc]" />
            </button>
          ))}
        </div>

        {/* Invite Friends */}
        <div className="px-[24px] mb-[16px]">
          <div className="rounded-[12px] bg-[#f8f8f8] p-4">
            <div className="text-[12px] font-medium text-[#999999] mb-1">Invite friends, earn ৳100</div>
            <div className="text-[10px] text-[#b5b5b5] mb-3">Share your referral link</div>
            <button
              onClick={() => setInviteOpen(true)}
              className="rounded-full bg-[#969696] px-3 py-1.5 text-[11px] font-bold text-white transition active:scale-95"
            >
              Invite
            </button>
          </div>
        </div>

        {/* Sign out */}
        <div className="px-[24px] mb-[24px]">
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 rounded-[12px] border border-[#eeeeee] py-3 text-[12px] font-medium text-[#999999] transition active:scale-[.98]"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>

        {/* Admin Dashboard */}
        {showAdmin && effectiveIsAdmin && user && (
          <div className="px-[24px] mb-[24px]">
            <AdminErrorBoundary>
              <AdminPanel />
            </AdminErrorBoundary>
          </div>
        )}

        {/* Footer */}
        <div className="px-[24px] pb-[40px] text-center">
          <div onClick={handleLogoTap} className="inline-block cursor-pointer">
            <BrandLogo size={24} />
          </div>
          <div className="mt-2 text-[10px] text-[#d0d0d0]">Bake Art Style · v2.0</div>
        </div>
      </div>

      {/* Modals */}
      {customerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setCustomerOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-[24px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-[#999999]">Checkout Profile</h2>
              <button
                onClick={() => setCustomerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f8f8f8] flex items-center justify-center"
              >
                <X size={18} className="text-[#999999]" />
              </button>
            </div>
            <p className="text-[12px] text-[#b5b5b5] mb-4">একবার save করলে checkout-এ auto-fill হবে</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#aaaaaa] mb-1">নাম</label>
                <input
                  value={draftProfile.name}
                  onChange={(e) => setDraftProfile({ ...draftProfile, name: e.target.value })}
                  placeholder="আপনার নাম"
                  className="w-full rounded-[8px] border border-[#e8e8e8] bg-[#f8f8f8] px-3 py-2 text-[14px] text-[#999999] outline-none focus:border-[#969696]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#aaaaaa] mb-1">ফোন</label>
                <input
                  value={draftProfile.phone}
                  onChange={(e) => setDraftProfile({ ...draftProfile, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  inputMode="tel"
                  className="w-full rounded-[8px] border border-[#e8e8e8] bg-[#f8f8f8] px-3 py-2 text-[14px] text-[#999999] outline-none focus:border-[#969696]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#aaaaaa] mb-1">সম্পূর্ণ ঠিকানা</label>
                <textarea
                  value={draftProfile.address}
                  onChange={(e) => setDraftProfile({ ...draftProfile, address: e.target.value })}
                  placeholder="বাসা, রোড, এলাকা"
                  rows={3}
                  className="w-full rounded-[8px] border border-[#e8e8e8] bg-[#f8f8f8] px-3 py-2 text-[14px] text-[#999999] outline-none focus:border-[#969696]"
                />
                <button
                  onClick={handleLocateProfile}
                  disabled={profileLocating}
                  className="mt-2 flex items-center gap-2 text-[11px] font-medium text-[#969696]"
                >
                  {profileLocating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Navigation size={14} />
                  )}
                  {profileLocating ? 'লোকেশন খোঁজা হচ্ছে...' : 'বর্তমান অবস্থান ব্যবহার করুন'}
                </button>
                {profileLocateError && (
                  <p className="mt-1 text-[11px] text-[#999999]">{profileLocateError}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#aaaaaa] mb-1">জেলা</label>
                <select
                  value={draftProfile.district}
                  onChange={(e) => setDraftProfile({ ...draftProfile, district: e.target.value })}
                  className="w-full rounded-[8px] border border-[#e8e8e8] bg-[#f8f8f8] px-3 py-2 text-[14px] text-[#999999] outline-none focus:border-[#969696]"
                >
                  {BD_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#aaaaaa] mb-2">পেমেন্ট মেথড</label>
                <div className="space-y-2">
                  {PAYMENTS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setDraftProfile({ ...draftProfile, payment: p.id })}
                      className={`w-full flex items-center justify-between rounded-[8px] border px-3 py-2 text-left transition ${
                        draftProfile.payment === p.id
                          ? 'border-[#969696] bg-[#f8f8f8]'
                          : 'border-[#e8e8e8] bg-white'
                      }`}
                    >
                      <div>
                        <div className="text-[13px] font-medium text-[#999999]">{p.label}</div>
                        <div className="text-[11px] text-[#b5b5b5]">{p.sub}</div>
                      </div>
                      {draftProfile.payment === p.id && (
                        <Check size={16} className="text-[#969696]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveCustomer}
              className="mt-6 w-full rounded-[12px] bg-[#969696] py-3 text-[14px] font-medium text-white transition active:scale-[.98]"
            >
              Save Profile
            </button>
          </div>
        </>
      )}

      {/* Other modals (address, dates, invite, wallet history, contact) would go here */}
      {/* Keeping them minimal for now - they follow the same pattern */}

      {walletHistoryOpen && (
        <WalletHistoryModal onClose={() => setWalletHistoryOpen(false)} />
      )}

      {contactOpen && <ChatBot onClose={() => setContactOpen(false)} />}
    </div>
  );
}
