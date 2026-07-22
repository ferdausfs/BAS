import { useEffect, useMemo, useState } from 'react';
import { useUI, useAuthStore, useSettingsStore, pushBrowserRouteState } from './lib/store';
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
import NotificationsSheet from './components/NotificationsSheet';
import WishlistScreen from './screens/WishlistScreen';
import TrackingScreen from './screens/TrackingScreen';
import AdminScreen from './screens/AdminScreen';
import ReviewsListScreen from './screens/ReviewsListScreen';
import WriteReviewScreen from './screens/WriteReviewScreen';
import CouponsScreen from './screens/CouponsScreen';
import AppErrorBoundary from './components/AppErrorBoundary';
import { ChatBot } from './components/ChatBot';
import OccasionZoomOverlay from './components/OccasionZoomOverlay';

export default function App() {
  const { view, tab, chatOpen, modalDepth } = useUI();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();

  const [authOpen, setAuthOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref && /^[A-Z0-9]{8}$/i.test(ref.trim())) {
        localStorage.setItem('bas-pending-ref', ref.trim().toUpperCase());
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    useSettingsStore.getState().loadRemoteSettings().finally(() => setSettingsLoading(false));
  }, []);

  useEffect(() => {
    pushBrowserRouteState();
    const handlePopState = () => {
      const { history: uiHistory, back: uiBack } = useUI.getState();
      if (uiHistory.length > 0) {
        uiBack();
        pushBrowserRouteState();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const normalizeEmail = (email?: string) => email?.trim().toLowerCase() ?? '';
  const isAdminUser = useMemo(() => {
    // Server-side is_admin flag on the profile is the source of truth.
    if (user?.isAdmin) return true;
    if (settingsLoading) return false;
    // Bootstrap fallback: email allow-list (so the very first admin can reach
    // the panel before their profile.is_admin is flipped in Firestore).
    const userEmail = normalizeEmail(user?.email);
    const allowed = [settings.adminEmail, 'umuhammadiswa@gmail.com'];
    return !!userEmail && allowed.some((e) => normalizeEmail(e) === userEmail);
  }, [user?.isAdmin, user?.email, settings.adminEmail, settingsLoading]);

  const activeTab = view.name === 'tabs' ? view.tab : tab;

  useEffect(() => {
    (window as any).__BAKEART_TAB__ = activeTab;
    try {
      localStorage.setItem('bas-last-tab', activeTab);
    } catch { /* ignore */ }
  }, [activeTab]);

  const screenKey = [
    view.name,
    view.name === 'tabs' ? activeTab : '',
    view.name === 'product' ? view.productId : '',
    view.name === 'customize' ? (view.productId ?? 'custom') : '',
    view.name === 'success' ? view.orderId : '',
    view.name === 'tracking' ? (view.orderId ?? '') : '',
    view.name === 'admin' ? (view.tab ?? 'dashboard') : '',
  ].join('-');

  const showTabBar = view.name === 'tabs' && !chatOpen && !authOpen && !notificationsOpen && modalDepth === 0;

  return (
    <AppErrorBoundary>
      <div className="h-[100dvh] w-full flex flex-col overflow-hidden relative">
        <div className="lux-canvas" aria-hidden="true">
          <span className="lux-orb a" />
          <span className="lux-orb b" />
          <span className="lux-orb c" />
        </div>
        <main className="flex-1 min-h-0 relative z-[1] overflow-hidden">
          {view.name === 'splash'
            ? <SplashScreen />
            : (
              <div key={screenKey} className="h-full w-full anim-fade">
                {view.name === 'tabs' && activeTab === 'home' && (
                  <HomeScreen
                    onAuthOpen={() => setAuthOpen(true)}
                    onNotificationsOpen={() => setNotificationsOpen(true)}
                  />
                )}
                {view.name === 'tabs' && activeTab === 'categories' && <CategoriesScreen />}
                {view.name === 'tabs' && activeTab === 'orders' && (
                  user ? <OrdersScreen /> : (
                    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                      <div className="text-5xl mb-4">📋</div>
                      <h2 className="font-bold text-lg mb-2">Sign in to view orders</h2>
                      <button onClick={() => setAuthOpen(true)} className="px-6 py-3 rounded-2xl bg-coral text-white font-bold text-sm">
                        Sign In
                      </button>
                    </div>
                  )
                )}
                {view.name === 'tabs' && activeTab === 'profile' && (
                  <ProfileScreen onAuthOpen={() => setAuthOpen(true)} isAdmin={isAdminUser} />
                )}
                {view.name === 'product' && <ProductScreen />}
                {view.name === 'customize' && <CustomizeScreen />}
                {view.name === 'cart' && <CartScreen />}
                {view.name === 'checkout' && <CheckoutScreen />}
                {view.name === 'success' && <SuccessScreen />}
                {view.name === 'wishlist' && <WishlistScreen onAuthOpen={() => setAuthOpen(true)} />}
                {view.name === 'tracking' && <TrackingScreen />}
                {view.name === 'admin' && <AdminScreen />}
                {view.name === 'reviews' && <ReviewsListScreen />}
                {view.name === 'write-review' && <WriteReviewScreen />}
                {view.name === 'coupons' && <CouponsScreen />}
              </div>
            )
          }
        </main>

        {showTabBar && <BottomTabBar />}

        <NotificationsSheet open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} />
        <ChatBot />
        <OccasionZoomOverlay />
      </div>
    </AppErrorBoundary>
  );
}
