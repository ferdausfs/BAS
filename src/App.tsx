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

  const isAdminUser = !!user && user.email === settings.adminEmail;

  // 5-tap logo → admin (only works if logged in AND email matches adminEmail)
  const handleLogoTap = () => {
    tapCount.current += 1;
    if (logoTimer.current) clearTimeout(logoTimer.current);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      if (isAdminUser) {
        setAdminOpen(true);
      } else if (!user) {
        setAuthOpen(true);
      }
      // wrong email + logged in → silently ignore
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

  // App requires login before browsing (matches original app behaviour)
  if (view.name !== 'splash' && !user) {
    return (
      <PhoneFrame onLogoTap={handleLogoTap}>
        <div className="relative h-full w-full flex flex-col items-center justify-center bg-cream px-8 text-center gap-4">
          <div className="text-5xl">🎂</div>
          <h1 className="font-display text-2xl font-bold text-ink">Bake Art Style</h1>
          <p className="text-sm text-ink/50">চালিয়ে যেতে লগইন করুন</p>
          <button
            onClick={() => setAuthOpen(true)}
            className="px-8 py-3.5 rounded-2xl bg-coral text-white font-bold text-sm"
          >
            Sign In
          </button>
        </div>
        <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} />
      </PhoneFrame>
    );
  }

  const showTabBar = view.name === 'tabs';

  return (
    <PhoneFrame onLogoTap={handleLogoTap}>
      <div className="relative h-full w-full overflow-hidden">
        <div key={screenKey} className="anim-fade h-full">
          {view.name === 'splash'                             && <SplashScreen />}
          {view.name === 'tabs' && activeTab === 'home'       && (
            <HomeScreen onLogoTap={handleLogoTap} />
          )}
          {view.name === 'tabs' && activeTab === 'categories' && <CategoriesScreen />}
          {view.name === 'tabs' && activeTab === 'orders'     && <OrdersScreen />}
          {view.name === 'tabs' && activeTab === 'profile'    && (
            <ProfileScreen onAuthOpen={() => setAuthOpen(true)} />
          )}
          {view.name === 'product'   && <ProductScreen />}
          {view.name === 'customize' && <CustomizeScreen />}
          {view.name === 'cart'      && <CartScreen />}
          {view.name === 'checkout'  && <CheckoutScreen />}
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
