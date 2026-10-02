import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CATEGORY_ORDER, money, categoriesIn, filterProducts, priceRange,
  catalogStats, findBySlug, relatedProducts, toggleFavorite, favoriteProducts,
} from '../src/catalog.mjs';

const products = () => [
  { slug: 'a', name: 'Blue Marble Fabric', category: 'Fabric by the Yard', price: 75 },
  { slug: 'b', name: 'Golden Dragon Fabric', category: 'Fabric by the Yard', price: 75 },
  { slug: 'c', name: 'Noir Silhouette Poster', category: 'Poster Prints', price: 35 },
  { slug: 'd', name: 'Pyramid Canvas Set', category: 'Stretched Canvas', price: 450 },
  { slug: 'e', name: 'Abstract Heiress Print', category: 'Art Prints — Digital Download', price: 5.99 },
];

test('money formats as US currency with two decimals', () => {
  assert.equal(money(5.99), '$5.99');
  assert.equal(money(450), '$450.00');
  assert.equal(money(0), '$0.00');
  assert.equal(money(undefined), '$0.00');
});

test('categoriesIn returns only categories present, in curated order', () => {
  const cats = categoriesIn(products());
  assert.deepEqual(cats, ['Fabric by the Yard', 'Poster Prints', 'Stretched Canvas', 'Art Prints — Digital Download']);
  // curated order is a superset — confirms we didn't just alphabetize
  assert.notDeepEqual(CATEGORY_ORDER, [...CATEGORY_ORDER].sort());
});

test('categoriesIn on an empty catalog returns nothing', () => {
  assert.deepEqual(categoriesIn([]), []);
});

test('filterProducts with "All" and no query returns everything', () => {
  assert.equal(filterProducts(products()).length, 5);
  assert.equal(filterProducts(products(), { category: 'All', query: '' }).length, 5);
});

test('filterProducts narrows by category', () => {
  const result = filterProducts(products(), { category: 'Fabric by the Yard' });
  assert.equal(result.length, 2);
  assert.ok(result.every(p => p.category === 'Fabric by the Yard'));
});

test('filterProducts searches name and category, case-insensitively', () => {
  assert.equal(filterProducts(products(), { query: 'dragon' }).length, 1);
  assert.equal(filterProducts(products(), { query: 'FABRIC' }).length, 2);
  assert.equal(filterProducts(products(), { query: 'nonexistent' }).length, 0);
});

test('filterProducts combines category and query', () => {
  const result = filterProducts(products(), { category: 'Fabric by the Yard', query: 'golden' });
  assert.deepEqual(result.map(p => p.slug), ['b']);
});

test('priceRange finds the min and max', () => {
  assert.deepEqual(priceRange(products()), { min: 5.99, max: 450 });
});

test('priceRange on an empty list is zero, not NaN or a crash', () => {
  assert.deepEqual(priceRange([]), { min: 0, max: 0 });
});

test('catalogStats summarizes count, categories, and price range together', () => {
  const stats = catalogStats(products());
  assert.equal(stats.count, 5);
  assert.equal(stats.categories, 4);
  assert.equal(stats.min, 5.99);
  assert.equal(stats.max, 450);
});

test('findBySlug finds the right product or returns null', () => {
  assert.equal(findBySlug(products(), 'c').name, 'Noir Silhouette Poster');
  assert.equal(findBySlug(products(), 'nope'), null);
});

test('relatedProducts stays within the same category and excludes itself', () => {
  const fabricA = findBySlug(products(), 'a');
  const related = relatedProducts(products(), fabricA);
  assert.deepEqual(related.map(p => p.slug), ['b']);
});

test('relatedProducts respects the limit', () => {
  const many = [
    ...products(),
    { slug: 'f', name: 'Third Fabric', category: 'Fabric by the Yard', price: 75 },
    { slug: 'g', name: 'Fourth Fabric', category: 'Fabric by the Yard', price: 75 },
  ];
  const related = relatedProducts(many, findBySlug(many, 'a'), 2);
  assert.equal(related.length, 2);
});

test('relatedProducts on a missing product returns nothing', () => {
  assert.deepEqual(relatedProducts(products(), null), []);
});

test('toggleFavorite adds an absent slug and removes a present one', () => {
  assert.deepEqual(toggleFavorite([], 'a'), ['a']);
  assert.deepEqual(toggleFavorite(['a'], 'a'), []);
  assert.deepEqual(toggleFavorite(['a'], 'b').sort(), ['a', 'b']);
});

test('toggleFavorite never mutates the array it was given', () => {
  const before = ['a'];
  toggleFavorite(before, 'b');
  assert.deepEqual(before, ['a']);
});

test('favoriteProducts resolves saved slugs back to full product objects', () => {
  const saved = favoriteProducts(products(), ['c', 'e', 'missing-slug']);
  assert.deepEqual(saved.map(p => p.slug), ['c', 'e']);
});

test('favoriteProducts with no favorites is empty', () => {
  assert.deepEqual(favoriteProducts(products(), []), []);
});
