import React, { useEffect, useState, useCallback } from 'react';
import {
  Heart, MapPin, CreditCard, Bell, HelpCircle, Settings, LogOut,
  ChevronRight, ArrowLeft, KeyRound, Trash2, Sun, Headphones, MessageCircle, Globe2,
  LogIn, X, Save, Check, User, AlertTriangle, Cake, Gift, Wallet as WalletIcon,
  Copy, Share2, Navigation, Loader2, Tag, ClipboardList, Camera, Mail, Phone, Banknote, Search
} from 'lucide-react';
import { useUI, useAuthStore, getReferralCode, claimReferralRewards, WALLET_REFERRAL_BONUS } from '../lib/store';
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
        <div className="border border-error/20 bg-error/5 rounded-3xl p-5 mt-4 text-center">
          <div className="flex justify-center text-error mb-2">
            <AlertTriangle size={32} strokeWidth={1.75} />
          </div>
          <h2 className="text-sm font-bold text-error mb-1">Admin Dashboard Error</h2>
          <p className="text-xs text-error mb-2">{this.state.errorMessage}</p>
          <p className="text-xs text-ink-200">Refresh the page to retry.</p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            className="mt-3 px-4 py-2 rounded-xl bg-coral text-white text-xs font-bold shadow-btn"
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
  const { go } = useUI();
  const { user } = useAuthStore();
  const effectiveIsAdmin = isAdmin || !!user?.isAdmin;
  const { signOut } = useAuth();
  const referralCode = getReferralCode(user);
  const [walletHistoryOpen, setWalletHistoryOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const APP_URL = 'https://bas.umuhammadiswa.workers.dev';
  const referralLink = referralCode ? `${APP_URL}?ref=${referralCode}` : APP_URL;

  const [contactOpen, setContactOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [profileView, setProfileView] = useState<'main' | 'edit' | 'address' | 'payment' | 'settings' | 'help' | 'chat'>('main');
  const [showAdmin, setShowAdmin] = useState(false);
  const [, setLogoTapCount] = useState(0);

  const [, setSavedProfile] = useState<CustomerProfile>(() =>
    loadCustomerProfile(user?.id, user?.name ?? '')
  );
  const [draftProfile, setDraftProfile] = useState<CustomerProfile>(() =>
    loadCustomerProfile(user?.id, user?.name ?? '')
  );

  const [addresses, setAddresses] = useState<SavedAddress[]>(() => loadAddresses(user?.id));
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [addrForm, setAddrForm] = useState({ name: '', address: '', district: '', phone: '' });
  const [addrLocating, setAddrLocating] = useState(false);
  const [addrLocateError, setAddrLocateError] = useState('');
  const [profileLocating, setProfileLocating] = useState(false);
  const [profileLocateError, setProfileLocateError] = useState('');

  const [specialDates, setSpecialDates] = useState<SpecialDate[]>(() => loadSpecialDates(user?.id));
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [dateForm, setDateForm] = useState({ type: 'birthday' as SpecialDate['type'], name: '', date: '' });

  useModalDepth(showAddressModal);
  useModalDepth(showDatesModal);
  useModalDepth(inviteOpen);
  useModalDepth(walletHistoryOpen);
  useModalDepth(contactOpen);
  useModalDepth(customerOpen);


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

  // Claim any pending cross-device referral rewards tied to this user's code.
  // When someone on another device places an order using this code, the reward
  // is picked up here and credited to the wallet (+৳100 each).
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
  }, [user?.id]); // eslint-disable-line


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

  const profileRows = [
    {
      Icon: User,
      label: 'Your profile',
      action: () => setProfileView('edit'),
    },
    {
      Icon: MapPin,
      label: 'Manage Address',
      action: () => setProfileView('address'),
    },
    {
      Icon: CreditCard,
      label: 'Payment Methods',
      action: () => setProfileView('payment'),
    },
    {
      Icon: ClipboardList,
      label: 'My Orders',
      action: () => go({ name: 'tabs', tab: 'orders' }),
    },
    {
      Icon: Tag,
      label: 'My Coupons',
      action: () => go({ name: 'coupons' }),
    },
    {
      Icon: WalletIcon,
      label: 'My Wallet',
      action: () => setWalletHistoryOpen(true),
    },
    {
      Icon: HelpCircle,
      label: 'Help Center',
      action: () => setProfileView('help'),
    },
    {
      Icon: Settings,
      label: 'Settings',
      action: () => setProfileView('settings'),
    },
  ];

  const settingsRows = [
    {
      Icon: Bell,
      label: 'Notification Settings',
      action: () => useUI.getState().addNotification('Notifications', 'Notification preferences will be available soon.'),
    },
    {
      Icon: KeyRound,
      label: 'Password Manager',
      action: () => useUI.getState().addNotification('Password Manager', 'Account security settings will be available soon.'),
    },
    {
      Icon: Sun,
      label: 'Theme',
      action: () => useUI.getState().addNotification('Theme', 'Bake Art Style theme is already active.'),
    },
    {
      Icon: Trash2,
      label: 'Delete Account',
      action: () => useUI.getState().addNotification('Delete Account', 'Please contact support to delete your account securely.'),
    },
  ];


  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-coral shadow-card">
          <User size={36} strokeWidth={1.75} />
        </div>
        <h2 className="text-2xl font-bold text-ink mb-2">Sign In</h2>
        <p className="text-sm text-ink-300 mb-6">
          Sign in to save your delivery info, orders, wishlist, and profile.
        </p>
        <button
          onClick={onAuthOpen}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-coral text-white font-bold text-sm shadow-btn transition active:scale-95"
        >
          <LogIn className="w-4 h-4" /> Sign In
        </button>
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
    <div className="flex h-full flex-col bg-bg">
      <header className="flex-shrink-0 px-6 pt-6 pb-2">
        <div className="relative flex h-14 items-center justify-center">
          <button
            type="button"
            onClick={() => profileView === 'main' ? go({ name: 'tabs', tab: 'home' }) : setProfileView('main')}
            className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-ink-200 shadow-card transition active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.9} />
          </button>
          <h1 className="text-[20px] font-semibold tracking-tight text-ink">
            {profileView === 'settings' ? 'Settings' : profileView === 'help' ? 'Help Center' : profileView === 'chat' ? 'Customer Service' : profileView === 'edit' ? 'Your Profile' : profileView === 'address' ? 'Manage Address' : profileView === 'payment' ? 'Payment Methods' : 'Profile'}
          </h1>
        </div>
      </header>

      {profileView === 'main' && (
        <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-32 pt-6 anim-up">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-secondary text-[28px] font-semibold text-coral shadow-card">
              {user.avatar && user.avatar.length > 2 ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : initials}
            </div>
            <div className="mt-4 text-[20px] font-semibold leading-none tracking-tight text-ink">
              {user.name}
            </div>
          </div>

          <div className="mt-8">
            {profileRows.map((row, i) => (
              <ProfileReferenceRow
                key={row.label}
                Icon={row.Icon}
                label={row.label}
                onClick={row.action}
                bordered={i !== profileRows.length - 1}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleLogoTap}
            className="mt-8 flex w-full items-center justify-center gap-2 text-ink-200 active:scale-[.99]"
          >
            <BrandLogo size={18} />
            <span className="text-[11px] font-medium tracking-wider uppercase">
              Bake Art Style · v2.0
            </span>
          </button>

          {showAdmin && effectiveIsAdmin && user && (
            <div className="mt-5 anim-up">
              <div className="mb-3 flex items-center gap-2">
                <Settings className="h-5 w-5 text-coral" strokeWidth={2} />
                <h2 className="text-[17px] font-bold text-ink">Admin Dashboard</h2>
                <span className="ml-auto rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">Admin</span>
              </div>
              <AdminErrorBoundary>
                <AdminPanel embedded />
              </AdminErrorBoundary>
            </div>
          )}
        </div>
      )}

      {profileView === 'settings' && (
        <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-32 pt-6 anim-up">
          <div className="mt-2">
            {settingsRows.map((row, i) => (
              <ProfileReferenceRow
                key={row.label}
                Icon={row.Icon}
                label={row.label}
                onClick={row.action}
                bordered={i !== settingsRows.length - 1}
              />
            ))}
          </div>


          <button
            type="button"
            onClick={signOut}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-[18px] border border-border bg-surface py-4 text-[15px] font-bold text-error shadow-card transition active:scale-[.98]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}

      {profileView === 'help' && (
        <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-32 pt-6 anim-up">
          <div className="mt-2">
            <HelpProfileRow
              Icon={Headphones}
              label="Customer Service"
              detail="Chat with Bake Art Style support"
              onClick={() => setProfileView('chat')}
              bordered
            />
            <HelpProfileRow
              Icon={MessageCircle}
              label="WhatsApp"
              detail="Order help and quick support"
              onClick={() => useUI.getState().addNotification('WhatsApp', 'WhatsApp support will open from product/contact cards.')}
              bordered
            />
            <HelpProfileRow
              Icon={Globe2}
              label="Website"
              detail="bas.umuhammadiswa.workers.dev"
              onClick={() => useUI.getState().addNotification('Website', 'You are already browsing the Bake Art Style website.')}
              bordered
            />
            <HelpProfileRow
              Icon={HelpCircle}
              label="FAQ"
              detail="Delivery, payment, reorder and promo questions"
              onClick={() => useUI.getState().addNotification('FAQ', 'FAQ page will be available soon.')}
              bordered
            />
            <HelpProfileRow
              Icon={User}
              label="Facebook"
              detail="Bake Art Style"
              onClick={() => useUI.getState().addNotification('Facebook', 'Facebook link will be available soon.')}
              bordered
            />
            <HelpProfileRow
              Icon={User}
              label="Instagram"
              detail="@bakeartstyle"
              onClick={() => useUI.getState().addNotification('Instagram', 'Instagram link will be available soon.')}
            />
          </div>
        </div>
      )}

      {profileView === 'chat' && (
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2 anim-up">
          <ChatBot embedded fullPage />
        </div>
      )}

      {profileView === 'edit' && (
        <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-32 pt-6 anim-up">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-secondary text-[30px] font-semibold text-coral shadow-card">
                {user.avatar && user.avatar.length > 2 ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : initials}
              </div>
              <span className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-coral text-white shadow-btn ring-4 ring-bg">
                <Camera className="h-4 w-4" strokeWidth={1.8} />
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <ProfileInput label="Name" icon={User} value={draftProfile.name} onChange={(value) => setDraftProfile({ ...draftProfile, name: value })} placeholder="Your name" />
            <ProfileInput label="Email" icon={Mail} value={user.email ?? ''} readOnly action="Change" />
            <ProfileInput label="Phone Number" icon={Phone} value={draftProfile.phone} onChange={(value) => setDraftProfile({ ...draftProfile, phone: value })} placeholder="01XXXXXXXXX" inputMode="tel" />
            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-ink-300">Delivery Address</span>
              <textarea
                value={draftProfile.address}
                onChange={(event) => setDraftProfile({ ...draftProfile, address: event.target.value })}
                placeholder="বাসা/রোড/এলাকা"
                rows={3}
                className="w-full resize-none rounded-[18px] border border-border bg-surface px-4 py-3 text-[14px] font-medium text-ink outline-none focus:border-coral focus:ring-2 focus:ring-coral/15"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-ink-300">District / Area</span>
              <select
                value={draftProfile.district}
                onChange={(event) => setDraftProfile({ ...draftProfile, district: event.target.value })}
                className="h-12 w-full rounded-[18px] border border-border bg-surface px-4 text-[14px] font-medium text-ink outline-none focus:border-coral focus:ring-2 focus:ring-coral/15"
              >
                {BD_DISTRICTS.map((districtName) => <option key={districtName} value={districtName}>{districtName}</option>)}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={() => void handleSaveCustomer().then(() => setProfileView('main'))}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-coral text-[14px] font-bold text-white shadow-btn transition active:scale-[.98]"
          >
            Update
          </button>
        </div>
      )}

      {profileView === 'address' && (
        <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-32 pt-6 anim-up">
          <div className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-card">
            {addresses.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <MapPin className="mx-auto h-8 w-8 text-coral" strokeWidth={1.8} />
                <p className="mt-3 text-[14px] font-semibold text-ink">No saved address</p>
                <p className="mt-1 text-[12px] text-ink-300">Add your delivery places for faster checkout.</p>
              </div>
            ) : addresses.map((addr, index) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => { setAddrForm({ name: addr.name, address: addr.address, district: addr.district, phone: addr.phone }); setAddrLocateError(''); setEditingAddress(addr); setShowAddressModal(true); }}
                className={`flex w-full items-start gap-4 px-4 py-4 text-left transition active:bg-bg ${index !== addresses.length - 1 ? 'border-b border-border' : ''}`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-coral">
                  <MapPin className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-ink">{addr.name || 'Address'}</span>
                  <span className="mt-1 block text-[13px] leading-snug text-ink-300">{addr.address}, {addr.district}</span>
                  {addr.isDefault && <span className="mt-2 inline-flex rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-coral">Default</span>}
                </span>
                <ChevronRight className="mt-3 h-5 w-5 text-ink-200" strokeWidth={1.8} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => { setAddrForm({ name: '', address: '', district: '', phone: '' }); setAddrLocateError(''); setEditingAddress({ id: `addr-${Date.now()}`, name: '', address: '', district: '', phone: '', isDefault: addresses.length === 0 }); setShowAddressModal(true); }}
            className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-border bg-surface text-[14px] font-semibold text-ink-300 shadow-card transition active:scale-[.98]"
          >
            <span className="text-[22px] leading-none">+</span>
            Add New Shipping Address
          </button>
        </div>
      )}

      {profileView === 'payment' && (
        <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-32 pt-6 anim-up">
          <PaymentSection title="Cash">
            <PaymentOption icon={Banknote} label="Cash" active={draftProfile.payment === 'cash'} onClick={() => setDraftProfile({ ...draftProfile, payment: 'cash' })} />
          </PaymentSection>
          <PaymentSection title="Mobile Payment">
            <PaymentOption icon={WalletIcon} label="bKash" active={draftProfile.payment === 'bkash'} onClick={() => setDraftProfile({ ...draftProfile, payment: 'bkash' })} />
            <PaymentOption icon={WalletIcon} label="Nagad" active={draftProfile.payment === 'nagad'} onClick={() => setDraftProfile({ ...draftProfile, payment: 'nagad' })} />
          </PaymentSection>
          <PaymentSection title="Credit & Debit Card">
            <button type="button" className="flex h-14 w-full items-center gap-4 rounded-[18px] border border-border bg-surface px-4 text-left shadow-card active:scale-[.98]">
              <CreditCard className="h-5 w-5 text-coral" strokeWidth={1.8} />
              <span className="flex-1 text-[15px] font-semibold text-ink">Add Card</span>
              <ChevronRight className="h-5 w-5 text-ink-200" />
            </button>
          </PaymentSection>
          <button
            type="button"
            onClick={() => void handleSaveCustomer().then(() => setProfileView('main'))}
            className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-coral text-[14px] font-bold text-white shadow-btn transition active:scale-[.98]"
          >
            Confirm Payment
          </button>
        </div>
      )}

      {customerOpen && (
        <>
          <div
            className="fixed inset-0 bg-ink/45 z-[60]"
            onClick={() => setCustomerOpen(false)}
          />
          <div className="fixed bottom-0 left-1/2 z-[61] max-h-[88vh] w-full max-w-[420px] -translate-x-1/2 overflow-hidden rounded-t-[22px] border-t border-border bg-surface shadow-float">
            <div className="w-10 h-1 bg-ink-100 rounded-full mx-auto mt-3" />

            <div className="px-6 pt-4 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">Checkout Profile</h2>
                <p className="text-[11px] text-ink-200">
                  একবার save করলে checkout-এ auto-fill হবে
                </p>
              </div>
              <button
                onClick={() => setCustomerOpen(false)}
                className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-ink-300" />
              </button>
            </div>

            <div className="no-scrollbar max-h-[72vh] overflow-y-auto px-6 pb-6 pt-2 space-y-3">
              <Field
                label="আপনার নাম"
                value={draftProfile.name}
                onChange={(v) => setDraftProfile({ ...draftProfile, name: v })}
                placeholder="আপনার নাম"
              />

              <Field
                label="মোবাইল নম্বর"
                value={draftProfile.phone}
                onChange={(v) => setDraftProfile({ ...draftProfile, phone: v })}
                placeholder="01XXXXXXXXX"
                inputMode="tel"
              />

              <label className="block">
                <span className="mb-1 block text-[10.5px] font-bold tracking-wider text-ink-200 uppercase">
                  সম্পূর্ণ ঠিকানা
                </span>
                <div className="mb-1.5 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={handleLocateProfile}
                    disabled={profileLocating}
                    className="flex items-center justify-center gap-1.5 self-start rounded-full bg-secondary px-3.5 py-1.5 text-[11px] font-bold text-coral transition active:scale-95 disabled:opacity-50"
                  >
                    {profileLocating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Navigation className="h-3 w-3" />
                    )}
                    {profileLocating ? 'লোকেশন খোঁজা হচ্ছে...' : 'বর্তমান অবস্থান ব্যবহার করুন'}
                  </button>
                  {profileLocateError && (
                    <span className="text-[11px] text-error font-semibold px-1">{profileLocateError}</span>
                  )}
                </div>
                <textarea
                  value={draftProfile.address}
                  onChange={(e) => setDraftProfile({ ...draftProfile, address: e.target.value })}
                  placeholder="বাসা/রোড/এলাকা"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px] font-medium text-ink outline-none focus:border-coral focus:ring-2 focus:ring-coral/15"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[10.5px] font-bold tracking-wider text-ink-200 uppercase">
                  জেলা / এলাকা
                </span>
                <select
                  value={draftProfile.district}
                  onChange={(e) => setDraftProfile({ ...draftProfile, district: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[13px] font-medium text-ink outline-none focus:border-coral focus:ring-2 focus:ring-coral/15"
                >
                  {BD_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>

              <div>
                <div className="mb-1 text-[10.5px] font-bold tracking-wider text-ink-200 uppercase">
                  Default payment
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {PAYMENTS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setDraftProfile({ ...draftProfile, payment: p.id })}
                      className={`flex items-center justify-between rounded-xl border-2 p-3 text-left ${
                        draftProfile.payment === p.id
                          ? 'border-coral bg-coral-50/50'
                          : 'border-border bg-surface'
                      }`}
                    >
                      <div>
                        <div className="text-[13px] font-bold text-ink">{p.label}</div>
                        <div className="text-[10.5px] text-ink-200">{p.sub}</div>
                      </div>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        draftProfile.payment === p.id
                          ? 'bg-coral text-white'
                          : 'border border-border bg-surface'
                      }`}>
                        {draftProfile.payment === p.id && <Check className="h-3 w-3" strokeWidth={3} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => void handleSaveCustomer()}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-coral text-[13px] font-bold text-white shadow-btn transition active:scale-[.98]"
              >
                <Save className="h-4 w-4" />
                Save for Checkout
              </button>
            </div>
          </div>
        </>
      )}

      {contactOpen && (
        <>
          <div
            className="fixed inset-0 bg-ink/45 z-[60]"
            onClick={() => setContactOpen(false)}
          />
          <div className="fixed bottom-0 left-1/2 z-[61] w-full max-w-[420px] -translate-x-1/2 rounded-t-[22px] border-t border-border bg-surface shadow-float">
            <div className="w-10 h-1 bg-ink-100 rounded-full mx-auto mt-3" />
            <div className="px-6 pt-4 pb-2 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">যোগাযোগ ও সহায়তা</h2>
              <button
                onClick={() => setContactOpen(false)}
                className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-ink-300" />
              </button>
            </div>
            <div className="px-6 pb-8">
              <ChatBot embedded />
            </div>
          </div>
        </>
      )}

      {/* Address Manager Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-bg anim-right" onClick={() => !editingAddress && setShowAddressModal(false)}>
          <header className="flex-shrink-0 px-6 pt-6 pb-4" onClick={(event) => event.stopPropagation()}>
            <div className="relative flex h-14 items-center justify-center">
              <button
                type="button"
                onClick={() => { setAddrLocateError(''); setEditingAddress(null); setShowAddressModal(false); }}
                className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-ink-200 shadow-card transition active:scale-95"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={1.9} />
              </button>
              <h2 className="text-[20px] font-semibold tracking-tight text-ink">
                {editingAddress ? 'Enter Your Location' : 'Manage Address'}
              </h2>
            </div>
          </header>

          <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-8" onClick={(event) => event.stopPropagation()}>
            {!editingAddress ? (
              <>
                <div className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-card">
                  {addresses.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-coral">
                        <MapPin className="h-9 w-9" strokeWidth={1.7} />
                      </span>
                      <p className="mt-4 text-[16px] font-semibold text-ink">No saved address</p>
                      <p className="mt-1 text-[13px] text-ink-300">Add your delivery places for faster checkout.</p>
                    </div>
                  ) : addresses.map((addr, index) => (
                    <div key={addr.id} className={`flex items-start gap-4 px-4 py-4 ${index !== addresses.length - 1 ? 'border-b border-border' : ''}`}>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-coral">
                        <MapPin className="h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-semibold text-ink">{addr.name || 'Address'}</span>
                          {addr.isDefault && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-coral">Default</span>}
                        </div>
                        <p className="mt-1 text-[13px] leading-snug text-ink-300">{addr.address}, {addr.district}</p>
                        <p className="mt-1 text-[12px] text-ink-200">{addr.phone}</p>
                        <div className="mt-3 flex gap-2">
                          {!addr.isDefault && (
                            <button onClick={() => setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addr.id })))} className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold text-coral">Use as default</button>
                          )}
                          <button onClick={() => { setAddrForm({ name: addr.name, address: addr.address, district: addr.district, phone: addr.phone }); setAddrLocateError(''); setEditingAddress(addr); }} className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold text-coral">Edit</button>
                          <button onClick={() => setAddresses(prev => { const next = prev.filter(a => a.id !== addr.id); return addr.isDefault && next.length > 0 ? next.map((a, i) => ({ ...a, isDefault: i === 0 })) : next; })} className="rounded-full bg-error/10 px-3 py-1.5 text-[11px] font-bold text-error">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {addresses.length < 5 && (
                  <button
                    onClick={() => { setAddrForm({ name: '', address: '', district: '', phone: '' }); setAddrLocateError(''); setEditingAddress({ id: `addr-${Date.now()}`, name: '', address: '', district: '', phone: '', isDefault: addresses.length === 0 }); }}
                    className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-border bg-surface text-[14px] font-semibold text-ink-300 shadow-card transition active:scale-[.98]"
                  >
                    <span className="text-[22px] leading-none">+</span>
                    Add New Shipping Address
                  </button>
                )}
              </>
            ) : (
              <div className="space-y-5">
                <div className="flex h-12 items-center gap-3 rounded-[18px] bg-secondary px-4 text-ink-300">
                  <Search className="h-5 w-5" strokeWidth={1.8} />
                  <input
                    value={addrForm.address}
                    onChange={(event) => setAddrForm(prev => ({ ...prev, address: event.target.value }))}
                    placeholder="Enter your address"
                    className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-ink outline-none placeholder:text-ink-200"
                  />
                  {addrForm.address && (
                    <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, address: '' }))} className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink-300">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLocateAddress}
                  disabled={addrLocating}
                  className="flex w-full items-center gap-4 border-b border-border pb-4 text-left text-[16px] font-semibold text-ink-300 disabled:opacity-50"
                >
                  {addrLocating ? <Loader2 className="h-6 w-6 animate-spin text-coral" /> : <Navigation className="h-6 w-6 text-coral" strokeWidth={1.9} />}
                  {addrLocating ? 'লোকেশন খোঁজা হচ্ছে...' : 'Use my current location'}
                </button>
                {addrLocateError && <p className="text-[12px] font-semibold text-error">{addrLocateError}</p>}

                <div>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-200">Address Details</p>
                  <div className="space-y-3">
                    <Field label="লেবেল (যেমন: বাসা, অফিস)" value={addrForm.name} onChange={(value) => setAddrForm(prev => ({ ...prev, name: value }))} placeholder="বাসা" />
                    <label className="block">
                      <span className="mb-1 block text-[10.5px] font-bold tracking-wider text-ink-200 uppercase">সম্পূর্ণ ঠিকানা</span>
                      <textarea
                        value={addrForm.address}
                        onChange={(event) => setAddrForm(prev => ({ ...prev, address: event.target.value }))}
                        placeholder="বাসা ৫, রোড ৩, কুমিল্লা"
                        rows={3}
                        className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px] font-medium text-ink outline-none focus:border-coral focus:ring-2 focus:ring-coral/15"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10.5px] font-bold tracking-wider text-ink-200 uppercase">জেলা</span>
                      <select
                        value={addrForm.district}
                        onChange={(event) => setAddrForm(prev => ({ ...prev, district: event.target.value }))}
                        className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[13px] font-medium text-ink outline-none focus:border-coral focus:ring-2 focus:ring-coral/15"
                      >
                        <option value="">জেলা বাছাই করুন</option>
                        {BD_DISTRICTS.map((districtName) => <option key={districtName} value={districtName}>{districtName}</option>)}
                      </select>
                    </label>
                    <Field label="মোবাইল নম্বর" value={addrForm.phone} onChange={(value) => setAddrForm(prev => ({ ...prev, phone: value }))} placeholder="01700000000" inputMode="tel" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (!addrForm.name || !addrForm.address) return;
                      const updated = { ...editingAddress, ...addrForm };
                      setAddresses(prev => {
                        const exists = prev.find(a => a.id === updated.id);
                        return exists ? prev.map(a => a.id === updated.id ? updated : a) : [...prev, updated];
                      });
                      setEditingAddress(null);
                      setShowAddressModal(false);
                    }}
                    className="flex h-12 flex-1 items-center justify-center rounded-full bg-coral text-[14px] font-bold text-white shadow-btn transition active:scale-[.98]"
                  >
                    সেভ করুন
                  </button>
                  <button
                    onClick={() => { setAddrLocateError(''); setEditingAddress(null); }}
                    className="flex h-12 flex-1 items-center justify-center rounded-full bg-ink-50 text-[14px] font-bold text-ink-300 transition active:scale-[.98]"
                  >
                    বাতিল
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Special Dates Modal */}
      {showDatesModal && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-ink/45" onClick={() => setShowDatesModal(false)}>
          <div className="mt-auto w-full rounded-t-[22px] border-t border-border bg-surface p-5 pb-8 shadow-float" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-ink">Special Dates</h2>
              <button onClick={() => setShowDatesModal(false)} className="h-8 w-8 rounded-full bg-ink-50 flex items-center justify-center text-ink-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-[11px] text-ink-300">We'll remind you 7 days before to order a cake</p>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
              {specialDates.map((d) => (
                <div key={d.id} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-3 shadow-card">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-coral">
                    {d.type === 'birthday' ? <Cake className="h-4 w-4" /> : d.type === 'anniversary' ? <Heart className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                  </span>
                  <div className="flex-1">
                    <div className="text-[12px] font-bold text-ink">{d.name}</div>
                    <div className="text-[11px] text-ink-300">{d.type} · {d.date}</div>
                  </div>
                  <button onClick={() => setSpecialDates(prev => prev.filter(x => x.id !== d.id))}
                    className="text-[11px] text-error font-bold">Remove</button>
                </div>
              ))}
              {specialDates.length === 0 && <div className="rounded-2xl border border-border bg-ink-50 py-4 text-center text-[12px] text-ink-200">No dates saved yet</div>}
            </div>
            {specialDates.length < 5 && (
              <div className="space-y-2 border-t border-border pt-3">
                <div className="flex gap-2">
                  <select value={dateForm.type} onChange={(e) => setDateForm(f => ({ ...f, type: e.target.value as SpecialDate['type'] }))}
                    className="rounded-xl border border-border bg-surface px-2 py-2 text-[12px] text-ink">
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="other">Other</option>
                  </select>
                  <input value={dateForm.name} onChange={(e) => setDateForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Mom's Birthday"
                    className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-[12px] text-ink focus:border-coral focus:outline-none" />
                </div>
                <div className="flex gap-2">
                  <input type="date" value={dateForm.date ? `2000-${dateForm.date}` : ''}
                    onChange={(e) => {
                      const parts = e.target.value.split('-');
                      if (parts.length >= 3) setDateForm(f => ({ ...f, date: `${parts[1]}-${parts[2]}` }));
                    }}
                    className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-[12px] text-ink focus:border-coral focus:outline-none" />
                  <button
                    onClick={() => {
                      if (!dateForm.name || !dateForm.date) return;
                      setSpecialDates(prev => [...prev, { id: `sd-${Date.now()}`, ...dateForm }]);
                      setDateForm({ type: 'birthday', name: '', date: '' });
                    }}
                    className="rounded-xl bg-coral px-4 py-2 text-[12px] font-bold text-white shadow-btn transition active:scale-[.98]"
                  >Add</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <WalletHistoryModal open={walletHistoryOpen} onClose={() => setWalletHistoryOpen(false)} />

      {/* ── Invite Sheet ── */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop — opaque scrim, no blur */}
          <div
            className="absolute inset-0 bg-ink/45"
            onClick={() => setInviteOpen(false)}
          />

          {/* Sheet */}
          <div className="relative rounded-t-[22px] border-t border-border bg-surface px-6 pt-5 pb-10 shadow-float">

            {/* Drag handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-100" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[18px] font-bold tracking-tight text-ink">
                  Invite & Earn
                </h2>
                <p className="text-[12px] text-ink-200 mt-0.5">
                  বন্ধুকে invite করো, দুজনেই পাও ৳100
                </p>
              </div>
              <button
                onClick={() => setInviteOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-50 text-ink-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* How it works */}
            <div className="mb-5 rounded-2xl bg-secondary px-4 py-3.5 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink-200 mb-1">
                কীভাবে কাজ করে
              </div>
              <Step n="1" text="নিচের লিংক বা কোড বন্ধুকে পাঠাও" />
              <Step n="2" text="বন্ধু প্রথম অর্ডারে এই কোড ব্যবহার করলে সে পাবে ৳100 wallet bonus" />
              <Step n="3" text="তুমিও পাবে ৳100 wallet bonus — সরাসরি তোমার wallet এ" />
            </div>

            {/* Referral code display */}
            {referralCode && (
              <div className="mb-3 rounded-2xl border border-coral/20 bg-coral-50/40 px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-coral/70 mb-1">
                  তোমার রেফারেল কোড
                </div>
                <div className="font-mono text-[22px] font-bold tracking-[0.15em] text-coral">
                  {referralCode}
                </div>
              </div>
            )}

            {/* Link display */}
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-2.5 shadow-card">
              <span className="flex-1 truncate text-[11.5px] text-ink-200 font-medium">
                {referralLink}
              </span>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(referralLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch {
                    // fallback: select text
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-[11px] font-bold text-coral active:scale-95 transition"
              >
                {copied
                  ? <><Check className="h-3 w-3 text-success" /> Copied!</>
                  : <><Copy className="h-3 w-3" /> Copy</>
                }
              </button>
            </div>

            {/* Share button */}
            <button
              onClick={async () => {
                const shareText = `বেক আর্ট স্টাইল থেকে কেক অর্ডার করো! আমার রেফারেল কোড ${referralCode} দিয়ে অর্ডার করলে তুমি পাবে ৳100 ছাড়।`;
                if (navigator.share) {
                  try {
                    await navigator.share({ title: 'বেক আর্ট স্টাইল', text: shareText, url: referralLink });
                  } catch { /* user cancelled */ }
                } else {
                  await navigator.clipboard.writeText(shareText + '\n' + referralLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="btn-primary flex w-full h-13 items-center justify-center gap-2 rounded-2xl text-[14px] font-bold"
            >
              <Share2 className="h-4 w-4" />
              Share করো
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'tel';
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10.5px] font-bold tracking-wider text-ink-200 uppercase">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[13px] font-medium text-ink outline-none focus:border-coral focus:ring-2 focus:ring-coral/15"
      />
    </label>
  );
}

function ProfileReferenceRow({
  Icon,
  label,
  onClick,
  bordered,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  onClick: () => void;
  bordered?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 px-0 py-4 text-left transition active:bg-secondary/40 ${
        bordered ? 'border-b border-border' : ''
      }`}
    >
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-coral">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="flex-1 text-[15.5px] font-semibold leading-none tracking-tight text-ink">
        {label}
      </span>
      <ChevronRight className="h-5 w-5 text-ink-200" strokeWidth={1.8} />
    </button>
  );
}

function HelpProfileRow({
  Icon,
  label,
  detail,
  onClick,
  bordered,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  detail: string;
  onClick: () => void;
  bordered?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 px-0 py-4 text-left transition active:bg-secondary/40 ${bordered ? 'border-b border-border' : ''}`}
    >
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-coral">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15.5px] font-semibold leading-none tracking-tight text-ink">{label}</span>
        <span className="mt-1.5 block line-clamp-1 text-[12px] font-medium text-ink-300">{detail}</span>
      </span>
      <ChevronRight className="h-5 w-5 text-ink-200" strokeWidth={1.8} />
    </button>
  );
}


function ProfileInput({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  inputMode,
  readOnly,
  action,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'tel';
  readOnly?: boolean;
  action?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-ink-300">{label}</span>
      <span className="flex h-12 items-center gap-3 rounded-[18px] border border-border bg-surface px-4 shadow-card">
        <Icon className="h-4 w-4 shrink-0 text-coral" strokeWidth={1.8} />
        <input
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          readOnly={readOnly}
          className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-ink outline-none placeholder:text-ink-200"
        />
        {action && <span className="text-[12px] font-semibold text-coral">{action}</span>}
      </span>
    </label>
  );
}

function PaymentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="mb-3 text-[20px] font-medium tracking-[-0.02em] text-ink-300">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function PaymentOption({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 w-full items-center gap-4 rounded-[18px] border border-border bg-surface px-4 text-left shadow-card transition active:scale-[.98]"
    >
      <Icon className="h-5 w-5 text-coral" strokeWidth={1.8} />
      <span className="flex-1 text-[15px] font-semibold text-ink">{label}</span>
      <span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${active ? 'border-coral' : 'border-border'}`}>
        {active && <span className="h-4 w-4 rounded-full bg-coral" />}
      </span>
    </button>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-coral text-white text-[10px] font-bold">
        {n}
      </div>
      <p className="text-[12px] text-ink leading-snug">{text}</p>
    </div>
  );
}
