import { useState, useEffect, useRef } from 'react';
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
import { ChatBot } from './components/ChatBot';
import { AdminPanel } from './components/AdminPanel';
import { LocationGate } from './components/LocationGate';
import { WishlistScreen } from './components/WishlistScreen';

export default function App() {
  const { view, tab } = useUI();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();

  const [authOpen, setAuthOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const tapCount = useRef(0);
  const logoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Location gate after first login
  useEffect(() => {
    if (user && user.email !== settings.adminEmail) {
      const shown = localStorage.getItem('bakeart-location-shown');
      if (!shown) {
        setLocationOpen(true);
        localStorage.setItem('bakeart-location-shown', '1');
      }
    }
  }, [user, settings.adminEmail]);

  const handleLogoTap = () => {
    tapCount.current += 1;
    if (logoTimer.current) clearTimeout(logoTimer.current);
    if (tapCount.current >= 5) {
      setAdminOpen(true);
      tapCount.current = 0;
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
  const showChat = view.name !== 'splash';

  return (
    <PhoneFrame onLogoTap={handleLogoTap}>
      <div className="relative h-full w-full">
        <div key={screenKey} className="anim-fade h-full">
          {view.name === 'splash'                             && <SplashScreen />}
          {view.name === 'tabs' && activeTab === 'home'       && <HomeScreen />}
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
        {showChat   && <ChatBot />}
      </div>

      <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} />
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
      {locationOpen && <LocationGate onDismiss={() => setLocationOpen(false)} />}
    </PhoneFrame>
  );
}
