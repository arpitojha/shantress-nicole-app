/**
 * Shantress Nicole — pure catalog logic.
 *
 * No DOM, no storage — just plain data in, plain data out, so it's trivial
 * to unit test and impossible for a rendering bug to hide inside it.
 */

/** Display order for category chips/sections — not alphabetical, curated. */
export const CATEGORY_ORDER = [
  'Fabric by the Yard',
  'Seamless Patterns & Sewing Sets',
  'Poster Prints',
  'Stretched Canvas',
  'Art Prints — Digital Download',
];

export function money(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
}

/** Categories actually present in `products`, in curated display order. */
export function categoriesIn(products = []) {
  const present = new Set(products.map(p => p.category));
  return CATEGORY_ORDER.filter(c => present.has(c));
}

export function filterProducts(products = [], { category = 'All', query = '' } = {}) {
  const q = query.trim().toLowerCase();
  return products.filter(p => {
    if (category !== 'All' && p.category !== category) return false;
    if (q && !`${p.name} ${p.category}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function priceRange(products = []) {
  if (!products.length) return { min: 0, max: 0 };
  const prices = products.map(p => Number(p.price) || 0);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function catalogStats(products = []) {
  const { min, max } = priceRange(products);
  return { count: products.length, categories: categoriesIn(products).length, min, max };
}

export function findBySlug(products = [], slug) {
  return products.find(p => p.slug === slug) || null;
}

/** Other pieces from the same collection — for a "You may also love" rail. */
export function relatedProducts(products = [], product, limit = 4) {
  if (!product) return [];
  return products.filter(p => p.category === product.category && p.slug !== product.slug).slice(0, limit);
}

/** Pure toggle — returns a new array, never mutates `favorites`. */
export function toggleFavorite(favorites = [], slug) {
  const set = new Set(favorites);
  if (set.has(slug)) set.delete(slug); else set.add(slug);
  return [...set];
}

export function favoriteProducts(products = [], favorites = []) {
  const set = new Set(favorites);
  return products.filter(p => set.has(p.slug));
}
