import { useEffect, useMemo, useRef, useState } from 'react';
import { useUI, useAuthStore, useSettingsStore } from './lib/store';
import PhoneFrame from './components/PhoneFrame';
import BottomTabBar from './components/BottomTabBar';
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import OrdersScreen from './screens/OrdersScreen';
import ProfileScreen from './screens/ProfileScreen';
import ProductScreen from './screens/ProductScreen';
import CustomizeScreen from './screens/CustomizeScreen';
import CartScreen from './screens/CartScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import SuccessScreen from './screens/SuccessScreen';
import { AuthSheet } from './components/AuthSheet';
import { AdminPanel } from './components/AdminPanel';
import { WishlistScreen } from './components/WishlistScreen';

export default function App() {
  const { view, tab, chatOpen } = useUI();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();

  const [authOpen, setAuthOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [pendingAdminUnlock, setPendingAdminUnlock] = useState(false);
  const tapCount = useRef(0);
  const logoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizeEmail = (email?: string) => email?.trim().toLowerCase() ?? '';

  const isAdminUser = useMemo(() => {
    const userEmail = normalizeEmail(user?.email);

    // settings.adminEmail localStorage-এ পুরোনো থাকলেও এই email admin হিসেবে কাজ করবে
    const allowedAdminEmails = [
      settings.adminEmail,
      'umuhammadiswa@gmail.com',
    ];

    return !!userEmail && allowedAdminEmails.some((email) => normalizeEmail(email) === userEmail);
  }, [user?.email, settings.adminEmail]);

  useEffect(() => {
    if (!pendingAdminUnlock || !user) return;

    setPendingAdminUnlock(false);
    if (isAdminUser) {
      setAuthOpen(false);
      setAdminOpen(true);
    } else {
      console.log('Not admin email');
    }
  }, [pendingAdminUnlock, user, isAdminUser]);

  // 5-tap logo → admin. Before login it opens auth; after admin email login it unlocks.
  const handleLogoTap = () => {
    tapCount.current += 1;
    if (logoTimer.current) clearTimeout(logoTimer.current);

    if (tapCount.current >= 5) {
      tapCount.current = 0;

      if (isAdminUser) {
        setAdminOpen(true);
      } else if (!user) {
        setPendingAdminUnlock(true);
        setAuthOpen(true);
      } else {
        console.log('Not admin email');
      }
    } else {
      logoTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 3000);
    }
  };

  const activeTab = view.name === 'tabs' ? view.tab : tab;

  const screenKey = [
    view.name,
    view.name === 'tabs' ? activeTab : '',
    view.name === 'product' ? view.productId : '',
    view.name === 'customize' ? (view.productId ?? 'custom') : '',
  ].join('-');

  const showTabBar = view.name === 'tabs' && !chatOpen && !authOpen && !adminOpen;

  return (
    <PhoneFrame onLogoTap={handleLogoTap}>
      <div className="relative h-full w-full">
        <div key={screenKey} className="anim-fade h-full">
          {view.name === 'splash' && <SplashScreen />}

          {view.name === 'tabs' && activeTab === 'home' && (
            <HomeScreen onLogoTap={handleLogoTap} />
          )}

          {view.name === 'tabs' && activeTab === 'categories' && <CategoriesScreen />}

          {view.name === 'tabs' && activeTab === 'orders' && (
            user ? (
              <OrdersScreen />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="text-5xl">📋</div>
                <p className="text-lg font-bold text-ink">Sign in to view orders</p>
                <button
                  onClick={() => setAuthOpen(true)}
                  className="rounded-2xl bg-coral px-6 py-3 text-sm font-bold text-white"
                >
                  Sign In
                </button>
              </div>
            )
          )}

          {view.name === 'tabs' && activeTab === 'profile' && (
            <ProfileScreen onAuthOpen={() => setAuthOpen(true)} />
          )}

          {view.name === 'product' && <ProductScreen />}
          {view.name === 'customize' && <CustomizeScreen />}

          {view.name === 'cart' && (
            user ? (
              <CartScreen />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="text-5xl">🛒</div>
                <p className="text-lg font-bold text-ink">Sign in to view cart</p>
                <button
                  onClick={() => setAuthOpen(true)}
                  className="rounded-2xl bg-coral px-6 py-3 text-sm font-bold text-white"
                >
                  Sign In
                </button>
              </div>
            )
          )}

          {view.name === 'checkout' && (user ? <CheckoutScreen /> : null)}
          {view.name === 'success' && <SuccessScreen />}
          {view.name === 'wishlist' && <WishlistScreen />}
        </div>

        {showTabBar && <BottomTabBar />}
      </div>

      <AuthSheet
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => setPendingAdminUnlock(true)}
      />

      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </PhoneFrame>
  );
}
