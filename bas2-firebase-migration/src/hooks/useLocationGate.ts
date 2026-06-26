import { useState } from 'react';
import { useLocation, useSettingsStore } from '../lib/store';
import { matchZone } from '../lib/zones';

type Status = 'idle' | 'requesting' | 'allowed' | 'blocked' | 'error';

export function useLocationGate() {
  const { setLocation, clearLocation, district, verified } = useLocation();
  const { settings } = useSettingsStore();
  const [status, setStatus] = useState<Status>(verified ? 'allowed' : 'idle');
  const [error, setError] = useState('');

  async function detect() {
    setStatus('requesting');
    setError('');

    if (!('geolocation' in navigator)) {
      setStatus('error');
      setError('Geolocation not supported');
      return;
    }

    try {
      const pos: GeolocationPosition = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
        });
      });

      const { latitude, longitude } = pos.coords;
      const address = await reverseGeocode(latitude, longitude);
      const matched = matchZone(address, settings.allowedZones ?? []);

      if (matched) {
        setLocation(matched, latitude, longitude);
        setStatus('allowed');
      } else {
        setStatus('blocked');
      }
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Could not detect location');
    }
  }

  return {
    status,
    detect,
    clear: clearLocation,
    district,
    zone: district,
    verified,
    error,
  };
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const json = await res.json();
    return json.display_name || '';
  } catch {
    return '';
  }
}
