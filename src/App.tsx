import { useState, useRef } from 'react';
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
  const { view, tab } = useUI();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();

  const [authOpen, setAuthOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const tapCount = useRef(0);
  const logoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 5-tap logo → admin (only if logged in as admin email)
  const handleLogoTap = () => {
    tapCount.current += 1;
    if (logoTimer.current) clearTimeout(logoTimer.current);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      // Admin email check
      if (user && user.email === settings.adminEmail) {
        setAdminOpen(true);
      } else if (!user) {
        // Not logged in — open auth first
        setAuthOpen(true);
      } else {
        // Wrong email — silent ignore
        console.log('Not admin email');
      }
    } else {
      logoTimer.current = setTimeout(() => { tapCount.current = 0; }, 3000);
    }
  };

  const activeTab = view.name === 'tabs' ? view.tab : tab;

  const screenKey = [
    view.name,
    view.name === 'tabs' ? activeTab : '',
    view.name === 'product' ? view.productId : '',
    view.name === 'customize' ? (view.productId ?? 'custom') : '',
  ].join('-');

  const showTabBar = view.name === 'tabs';

  return (
    <PhoneFrame onLogoTap={handleLogoTap}>
      <div className="relative h-full w-full">
        <div key={screenKey} className="anim-fade h-full">
          {view.name === 'splash'                             && <SplashScreen />}
          {view.name === 'tabs' && activeTab === 'home'       && (
            <HomeScreen onLogoTap={handleLogoTap} />
          )}
          {view.name === 'tabs' && activeTab === 'categories' && <CategoriesScreen />}
          {view.name === 'tabs' && activeTab === 'orders'     && (
            user ? <OrdersScreen /> : (
              <div className="flex flex-col h-full items-center justify-center gap-4 p-8 text-center">
                <div className="text-5xl">📋</div>
                <p className="font-bold text-ink text-lg">Sign in to view orders</p>
                <button onClick={() => setAuthOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-coral text-white font-bold text-sm">
                  Sign In
                </button>
              </div>
            )
          )}
          {view.name === 'tabs' && activeTab === 'profile'    && (
            <ProfileScreen onAuthOpen={() => setAuthOpen(true)} />
          )}
          {view.name === 'product'   && <ProductScreen />}
          {view.name === 'customize' && <CustomizeScreen />}
          {view.name === 'cart'      && (
            user ? <CartScreen /> : (
              <div className="flex flex-col h-full items-center justify-center gap-4 p-8 text-center">
                <div className="text-5xl">🛒</div>
                <p className="font-bold text-ink text-lg">Sign in to view cart</p>
                <button onClick={() => setAuthOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-coral text-white font-bold text-sm">
                  Sign In
                </button>
              </div>
            )
          )}
          {view.name === 'checkout'  && (
            user ? <CheckoutScreen /> : null
          )}
          {view.name === 'success'   && <SuccessScreen />}
          {view.name === 'wishlist'  && <WishlistScreen />}
        </div>

        {showTabBar && <BottomTabBar />}
      </div>

      <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} />
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </PhoneFrame>
  );
}
