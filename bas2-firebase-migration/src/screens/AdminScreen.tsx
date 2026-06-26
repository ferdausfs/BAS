import { AdminPanel } from '../components/AdminPanel';
import { useUI } from '../lib/store';

// Compatibility screen for the older markdown export route: view.name === 'admin'.
// The app still uses the newer AdminPanel modal from the 5-tap logo trigger,
// but this screen makes the admin route available too.
export default function AdminScreen() {
  const { setTab } = useUI();
  return <AdminPanel onClose={() => setTab('home')} />;
}
