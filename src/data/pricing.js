/*
 * Device valuation data. Edit freely: prices are in ₹.
 *
 *   payout = brand base × age factor × condition factor
 *
 * `base` is what a less-than-a-year-old device in superb condition earns.
 * The result never drops below the category's `floor` (its material value)
 * and is rounded to the nearest ₹50.
 */

export const CATEGORIES = [
  {
    id: 'phone',
    name: 'Smartphone',
    blurb: 'Android phones, iPhones and more',
    floor: 300,
    brands: [
      { id: 'apple', name: 'Apple', base: 32000 },
      { id: 'samsung', name: 'Samsung', base: 22000 },
      { id: 'google', name: 'Google', base: 20000 },
      { id: 'oneplus', name: 'OnePlus', base: 18000 },
      { id: 'xiaomi', name: 'Xiaomi', base: 9000 },
      { id: 'vivo', name: 'Vivo', base: 9000 },
      { id: 'oppo', name: 'Oppo', base: 9000 },
      { id: 'motorola', name: 'Motorola', base: 8000 },
      { id: 'realme', name: 'Realme', base: 7500 },
      { id: 'other', name: 'Other', base: 5000 },
    ],
  },
  {
    id: 'laptop',
    name: 'Laptop',
    blurb: 'Windows laptops, MacBooks and Chromebooks',
    floor: 1000,
    brands: [
      { id: 'apple', name: 'Apple', base: 55000 },
      { id: 'microsoft', name: 'Microsoft', base: 35000 },
      { id: 'msi', name: 'MSI', base: 32000 },
      { id: 'dell', name: 'Dell', base: 30000 },
      { id: 'hp', name: 'HP', base: 28000 },
      { id: 'lenovo', name: 'Lenovo', base: 28000 },
      { id: 'asus', name: 'Asus', base: 27000 },
      { id: 'acer', name: 'Acer', base: 22000 },
      { id: 'other', name: 'Other', base: 15000 },
    ],
  },
]

export const AGES = [
  { id: 'lt1', label: 'Less than 1 year', badge: '<1', unit: 'YEAR', level: 1, factor: 1 },
  { id: '1-2', label: '1 – 2 years', badge: '1–2', unit: 'YEARS', level: 2, factor: 0.72 },
  { id: '2-3', label: '2 – 3 years', badge: '2–3', unit: 'YEARS', level: 3, factor: 0.52 },
  { id: '3-5', label: '3 – 5 years', badge: '3–5', unit: 'YEARS', level: 4, factor: 0.34 },
  { id: '5+', label: 'More than 5 years', badge: '5+', unit: 'YEARS', level: 5, factor: 0.2 },
]

export const CONDITIONS = [
  { id: 'superb', name: 'Superb', text: 'Looks like new. No scratches, everything works.', factor: 1 },
  { id: 'good', name: 'Good', text: 'Minor scratches or signs of use, fully working.', factor: 0.8 },
  { id: 'cracked', name: 'Cracked display', text: 'Screen is cracked or has lines, but it turns on.', factor: 0.45 },
  { id: 'dead', name: 'Non-functional', text: 'Doesn’t turn on or has major faults.', factor: 0.12 },
]

// `baseOverride` is an exact-model price from the device catalogue, when known.
export function estimate(categoryId, brandId, ageId, conditionId, baseOverride) {
  const cat = CATEGORIES.find((c) => c.id === categoryId)
  const brand = cat?.brands.find((b) => b.id === brandId)
  const age = AGES.find((a) => a.id === ageId)
  const cond = CONDITIONS.find((c) => c.id === conditionId)
  if (!cat || !brand || !age || !cond) return 0
  const raw = (baseOverride || brand.base) * age.factor * cond.factor
  return Math.max(cat.floor, Math.round(raw / 50) * 50)
}
