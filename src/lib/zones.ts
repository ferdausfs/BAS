// Bangladesh delivery zones — seller can edit these from admin settings.
export const BD_DISTRICTS = [
  'Comilla', 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi',
  'Khulna', 'Mymensingh', 'Barishal', 'Rangpur',
];

export const DEFAULT_ZONES: string[] = [
  'Dhaka',
  'Gulshan',
  'Banani',
  'Dhanmondi',
  'Mirpur',
  'Uttara',
  'Bashundhara',
  'Mohammadpur',
  'Chattogram',
  'Sylhet',
  'Cumilla',
  'Comilla',
  'Narayanganj',
  'Gazipur',
];

/**
 * Lightweight delivery-zone match — case-insensitive, removes punctuation,
 * checks whether any allowed zone substring matches the geocoded address.
 */
export function matchZone(address: string, allowedZones: string[]): string | null {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const addr = normalize(address);

  for (const zone of allowedZones) {
    const z = normalize(zone);
    if (z && (addr.includes(z) || z.includes(addr))) return zone;
  }

  return null;
}
