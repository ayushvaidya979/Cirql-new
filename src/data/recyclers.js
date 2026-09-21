/*
 * Recycling partners used to match a pickup.
 * PLACEHOLDER DATA: replace with your real CPCB-authorised partners.
 * lat/lon are the partner's pickup base; rating is out of 5.
 */
export const RECYCLERS = [
  { id: 'ecocycle', name: 'EcoCycle Recyclers', area: 'Andheri East, Mumbai', lat: 19.1136, lon: 72.8697, rating: 4.8 },
  { id: 'renew', name: 'ReNew Electronics', area: 'Thane West', lat: 19.2183, lon: 72.9781, rating: 4.6 },
  { id: 'circuitback', name: 'CircuitBack Recycling', area: 'Vashi, Navi Mumbai', lat: 19.0771, lon: 72.9986, rating: 4.7 },
  { id: 'cleanbyte', name: 'CleanByte Recyclers', area: 'Kalyan', lat: 19.2403, lon: 73.1305, rating: 4.5 },
  { id: 'greenloop', name: 'GreenLoop E-Waste', area: 'Hinjewadi, Pune', lat: 18.5913, lon: 73.7389, rating: 4.8 },
  { id: 'deccan', name: 'Deccan E-Waste Solutions', area: 'Hadapsar, Pune', lat: 18.5089, lon: 73.926, rating: 4.6 },
  { id: 'urbanmine', name: 'Urban Mine Recovery', area: 'Satpur, Nashik', lat: 20.0059, lon: 73.7503, rating: 4.5 },
  { id: 'safedispose', name: 'SafeDispose Tech', area: 'Waluj, Chh. Sambhajinagar', lat: 19.8441, lon: 75.2403, rating: 4.4 },
  { id: 'earthfirst', name: 'EarthFirst E-Recyclers', area: 'Butibori, Nagpur', lat: 20.9286, lon: 79.0006, rating: 4.7 },
  { id: 'sahyadri', name: 'Sahyadri Green Tech', area: 'Shiroli, Kolhapur', lat: 16.7431, lon: 74.2626, rating: 4.5 },
  { id: 'solapur', name: 'Siddheshwar Recyclers', area: 'MIDC, Solapur', lat: 17.6599, lon: 75.9064, rating: 4.3 },
]

// Used when the visitor doesn't share their location.
export const DEFAULT_ORIGIN = { lat: 19.076, lon: 72.8777, label: 'central Mumbai' }

export function distanceKm(a, b) {
  const R = 6371
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export const byDistanceFrom = (origin) =>
  RECYCLERS.map((r) => ({ ...r, km: distanceKm(origin, r) })).sort((a, b) => a.km - b.km)
