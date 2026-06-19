import { useState } from 'react';
import { MapPin, CheckCircle2, AlertCircle, Loader2, Navigation, MessageCircle, X } from 'lucide-react';
import { useLocation, useSettingsStore } from '../lib/store';
import { waLink } from '../lib/utils';

type Status = 'idle' | 'requesting' | 'detecting' | 'allowed' | 'out_of_zone' | 'error';

interface Props {
  onDismiss: () => void;
}

export function LocationGate({ onDismiss }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [district, setDistrict] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { settings } = useSettingsStore();
  const { setLocation } = useLocation();

  const requestLocation = async () => {
    setStatus('requesting');
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
      );
      setStatus('detecting');
      const { latitude: lat, longitude: lng } = pos.coords;

      // Nominatim reverse-geocode
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await r.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.district ||
        data.address?.county ||
        '';

      const zones = settings.allowedZones ?? [];
      const isAllowed = zones.some((z) => city.toLowerCase().includes(z.toLowerCase()) || z.toLowerCase().includes(city.toLowerCase()));

      setDistrict(city || 'your area');
      if (isAllowed) {
        setLocation(city, lat, lng);
        setStatus('allowed');
        setTimeout(onDismiss, 1500);
      } else {
        setStatus('out_of_zone');
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Could not detect location');
      setStatus('error');
    }
  };

  const openWhatsApp = () => {
    const msg = `Hi! I'd like to order a cake from ${district || 'my area'}.`;
    window.open(waLink(settings.whatsappNumber, msg), '_blank');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #fff0f3 0%, #ffe4ec 50%, #ffd6e7 100%)' }}>
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative">
        <button onClick={onDismiss} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
          <X className="w-4 h-4 text-black/40" />
        </button>

        <div className="text-4xl mb-2">🎂</div>
        <h1 className="text-xl font-black text-[var(--color-coral)] mb-1">Bake Art Style</h1>
        <p className="text-xs text-black/40 mb-6">Made with love, served with joy</p>

        {status === 'idle' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-coral)]/10 flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8 text-[var(--color-coral)]" />
            </div>
            <h2 className="font-bold text-[var(--color-ink)]">Check Delivery Zone</h2>
            <p className="text-sm text-[var(--color-ink)]/60">We deliver to select cities. Let us check if we deliver to you!</p>
            <button onClick={requestLocation}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[var(--color-coral)] text-white font-bold">
              <Navigation className="w-4 h-4" /> Detect My Location
            </button>
            <button onClick={onDismiss} className="text-xs text-[var(--color-ink)]/40">Skip for now</button>
          </div>
        )}

        {(status === 'requesting' || status === 'detecting') && (
          <div className="space-y-3">
            <Loader2 className="w-12 h-12 text-[var(--color-coral)] animate-spin mx-auto" />
            <h2 className="font-bold text-[var(--color-ink)]">
              {status === 'requesting' ? 'Getting your location...' : 'Detecting area...'}
            </h2>
            <p className="text-sm text-[var(--color-ink)]/60">Please allow location access in your browser</p>
          </div>
        )}

        {status === 'allowed' && (
          <div className="space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <h2 className="font-bold text-[var(--color-ink)]">We deliver to {district}! 🎉</h2>
            <p className="text-sm text-[var(--color-ink)]/60">Redirecting you to the shop...</p>
          </div>
        )}

        {status === 'out_of_zone' && (
          <div className="space-y-4">
            <AlertCircle className="w-12 h-12 text-orange-400 mx-auto" />
            <h2 className="font-bold text-[var(--color-ink)]">Sorry!</h2>
            <p className="text-sm text-[var(--color-ink)]/60">
              We don't deliver to <strong>{district}</strong> yet. Contact us on WhatsApp and we'll try to help!
            </p>
            <button onClick={openWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-500 text-white font-bold text-sm">
              <MessageCircle className="w-4 h-4" /> Order via WhatsApp
            </button>
            <div className="text-left">
              <p className="text-[10px] text-[var(--color-ink)]/40 mb-2">We currently deliver to:</p>
              <div className="flex flex-wrap gap-1.5">
                {(settings.allowedZones ?? []).map((z) => (
                  <span key={z} className="px-2 py-0.5 rounded-full bg-[var(--color-coral)]/10 text-[var(--color-coral)] text-[10px] font-bold">{z}</span>
                ))}
              </div>
            </div>
            <button onClick={onDismiss} className="text-xs text-[var(--color-ink)]/40">Browse anyway</button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="font-bold text-[var(--color-ink)]">Location not found</h2>
            <p className="text-sm text-[var(--color-ink)]/60">{errorMsg}</p>
            <button onClick={requestLocation}
              className="w-full py-3 rounded-2xl bg-[var(--color-coral)] text-white font-bold text-sm">
              Try Again
            </button>
            <button onClick={onDismiss} className="text-xs text-[var(--color-ink)]/40">Skip</button>
          </div>
        )}
      </div>
    </div>
  );
}
