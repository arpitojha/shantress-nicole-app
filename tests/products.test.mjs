import test from 'node:test';
import assert from 'node:assert/strict';

import { PRODUCTS } from '../src/products.mjs';
import { categoriesIn, priceRange } from '../src/catalog.mjs';

test('the scraped catalog has the expected number of real products', () => {
  assert.equal(PRODUCTS.length, 41);
});

test('every product has the fields the app depends on', () => {
  for (const p of PRODUCTS) {
    assert.ok(p.slug, 'slug');
    assert.ok(p.name, `${p.slug} has a name`);
    assert.ok(p.url?.startsWith('https://shantressnicole.shop/'), `${p.slug} links back to the real store`);
    assert.ok(Number.isFinite(p.price) && p.price > 0, `${p.slug} has a positive price`);
    assert.ok(p.image, `${p.slug} has an image`);
    assert.ok(p.category, `${p.slug} has a category`);
  }
});

test('product slugs are unique', () => {
  const slugs = PRODUCTS.map(p => p.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('every product falls into a known curated category', () => {
  assert.equal(categoriesIn(PRODUCTS).length, 5);
});

test('the real price range matches the live site ($5.99 fine-art prints to $450 the canvas set)', () => {
  assert.deepEqual(priceRange(PRODUCTS), { min: 5.99, max: 450 });
});
