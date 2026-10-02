/**
 * Shantress Nicole — application shell.
 *
 * Owns the DOM only. Catalog logic lives in catalog.mjs, favorites
 * persistence in storage.mjs, and the real scraped product data in
 * products.mjs — see assets/products-raw.json for where that came from.
 */

import { PRODUCTS } from './products.mjs';
import {
  CATEGORY_ORDER, money, categoriesIn, filterProducts, priceRange,
  catalogStats, findBySlug, relatedProducts, toggleFavorite, favoriteProducts,
} from './catalog.mjs';
import { loadFavorites, saveFavorites } from './storage.mjs';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
));

const state = {
  favorites: loadFavorites(),
  ui: { page: 'home', shopCategory: 'All', shopSearch: '' },
};

/** Hand-picked for visual range across collections, not auto-selected. */
const FEATURED_SLUGS = [
  'yellow-grace-gilded-woman-silhouette-poster-print',
  'modern-black-and-white-3d-pyramid-canvas-wall-art-set-of-4',
  'fabric-by-yard-blue-marble-combed-cotton-prima',
  'noir-beaded-silhouette-poster-print',
  'black-gold-abstract-seamless-pattern-commercial-use-digital-download-for-all-over-repeats',
  'abstract-heiress',
  'greens-sculpted-silhouette-beaded-stretched-canvas',
  'golden-brass-beaded-silhouette-poster-print',
];
const HERO_SLUG = 'yellow-grace-gilded-woman-silhouette-poster-print';

/* ------------------------------------------------------------------ *
 * Navigation, toast, favorites
 * ------------------------------------------------------------------ */

function go(page) {
  state.ui.page = page;
  $$('.page').forEach(section => section.classList.toggle('active', section.id === page));
  $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.page === page));
  window.scrollTo({ top: 0, behavior: 'auto' });
  renderPage(page);
  if (location.hash.slice(1) !== page) history.replaceState(null, '', `#${page}`);
}

let toastTimer;
function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
}

function isFavorite(slug) {
  return state.favorites.includes(slug);
}

function setFavorite(slug) {
  state.favorites = toggleFavorite(state.favorites, slug);
  saveFavorites(state.favorites);
  updateFavoritesBadge();
  toast(isFavorite(slug) ? 'Saved to favorites' : 'Removed from favorites');
}

function updateFavoritesBadge() {
  const badge = $('#favorites-badge');
  const count = state.favorites.length;
  badge.textContent = String(count);
  badge.hidden = count === 0;
}

/* ------------------------------------------------------------------ *
 * Shared product card markup
 * ------------------------------------------------------------------ */

function productCardHtml(product) {
  const fav = isFavorite(product.slug);
  return `
    <article class="product-card" data-product="${esc(product.slug)}">
      <div class="product-figure">
        <img src="${esc(product.image)}" alt="${esc(product.name)}" loading="lazy" />
        <button class="favorite-toggle${fav ? ' active' : ''}" data-action="toggle-favorite" data-slug="${esc(product.slug)}" aria-label="${fav ? 'Remove from favorites' : 'Save to favorites'}" aria-pressed="${fav}">${fav ? '♥' : '♡'}</button>
      </div>
      <div class="product-meta">
        <span class="product-cat">${esc(product.category)}</span>
        <span class="product-name">${esc(product.name)}</span>
        <span class="product-price">${esc(money(product.price))}</span>
      </div>
    </article>`;
}

function emptyBlock(title, body) {
  return `<div class="empty"><strong>${esc(title)}</strong>${esc(body)}</div>`;
}

/* ------------------------------------------------------------------ *
 * Home
 * ------------------------------------------------------------------ */

function renderHome() {
  const stats = catalogStats(PRODUCTS);
  $('#home-stats').innerHTML = [
    { value: String(stats.count), label: 'Pieces' },
    { value: String(stats.categories), label: 'Collections' },
    { value: `${money(stats.min)}–${money(stats.max)}`, label: 'Price range' },
  ].map(s => `<article class="stat"><strong>${esc(s.value)}</strong><small>${esc(s.label)}</small></article>`).join('');

  const hero = findBySlug(PRODUCTS, HERO_SLUG) || PRODUCTS[0];
  $('#hero-image').src = hero.image;
  $('#hero-image').alt = hero.name;

  $('#category-rail').innerHTML = categoriesIn(PRODUCTS).map(category => {
    const items = PRODUCTS.filter(p => p.category === category);
    return `
      <button class="category-tile" data-category="${esc(category)}">
        <img src="${esc(items[0].image)}" alt="" loading="lazy" />
        <small>${items.length}</small>
        <span>${esc(category)}</span>
      </button>`;
  }).join('');

  const featured = FEATURED_SLUGS.map(slug => findBySlug(PRODUCTS, slug)).filter(Boolean);
  $('#featured-grid').innerHTML = featured.map(productCardHtml).join('');
}

/* ------------------------------------------------------------------ *
 * Shop
 * ------------------------------------------------------------------ */

function renderShop() {
  const { min, max } = priceRange(PRODUCTS);
  $('#shop-subtitle').textContent = `${PRODUCTS.length} pieces across ${categoriesIn(PRODUCTS).length} collections · ${money(min)}–${money(max)}`;

  const cats = ['All', ...categoriesIn(PRODUCTS)];
  $('#shop-chips').innerHTML = cats.map(c => `<button class="chip${c === state.ui.shopCategory ? ' active' : ''}" data-shop-category="${esc(c)}">${esc(c)}</button>`).join('');

  const filtered = filterProducts(PRODUCTS, { category: state.ui.shopCategory, query: state.ui.shopSearch });
  $('#shop-grid').innerHTML = filtered.length
    ? filtered.map(productCardHtml).join('')
    : emptyBlock('No pieces match', 'Try another collection or a different search term.');
}

/* ------------------------------------------------------------------ *
 * Favorites
 * ------------------------------------------------------------------ */

function renderFavorites() {
  const saved = favoriteProducts(PRODUCTS, state.favorites);
  $('#favorites-grid').innerHTML = saved.length
    ? saved.map(productCardHtml).join('')
    : emptyBlock('Nothing saved yet', 'Tap the heart on any piece to keep it here.');
}

/* ------------------------------------------------------------------ *
 * About
 * ------------------------------------------------------------------ */

function renderAbout() {
  $('#about-categories').innerHTML = categoriesIn(PRODUCTS).map(category => {
    const items = PRODUCTS.filter(p => p.category === category);
    const { min, max } = priceRange(items);
    return `
      <div class="category-row">
        <span><strong>${esc(category)}</strong><small>${items.length} piece${items.length === 1 ? '' : 's'}</small></span>
        <span class="pill">${esc(min === max ? money(min) : `${money(min)}–${money(max)}`)}</span>
      </div>`;
  }).join('');
}

/* ------------------------------------------------------------------ *
 * Product detail modal
 * ------------------------------------------------------------------ */

const modal = $('#product-modal');
let activeSlug = null;

function openProduct(slug) {
  const product = findBySlug(PRODUCTS, slug);
  if (!product) return;
  activeSlug = slug;

  $('#detail-image').src = product.image;
  $('#detail-image').alt = product.name;
  $('#detail-category').textContent = product.category;
  $('#detail-title').textContent = product.name;
  $('#detail-price').textContent = money(product.price);
  $('#detail-description').textContent = product.description || `${product.category} · see full details on the official shop.`;
  $('#detail-shop-link').href = product.url;
  updateDetailFavoriteButton(slug);

  const related = relatedProducts(PRODUCTS, product, 6);
  $('#related-rail').hidden = related.length === 0;
  $('#related-scroll').innerHTML = related.map(productCardHtml).join('');

  if (!modal.open) modal.showModal();
}

function updateDetailFavoriteButton(slug) {
  const button = $('#detail-favorite');
  const fav = isFavorite(slug);
  button.textContent = fav ? '♥ Saved' : '♡ Save';
  button.classList.toggle('active', fav);
}

function closeProduct() {
  if (modal.open) modal.close();
  activeSlug = null;
}

/* ------------------------------------------------------------------ *
 * Install (PWA)
 * ------------------------------------------------------------------ */

let installPrompt = null;
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
});

async function install() {
  if (installPrompt) {
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    return;
  }
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) toast('Safari: tap Share, then "Add to Home Screen"');
  else if (/Android/i.test(ua)) toast('Chrome: tap ⋮, then "Add to Home screen"');
  else if (window.matchMedia('(display-mode: standalone)').matches) toast('Already installed');
  else toast('Use your browser menu → Install app');
}

function setInstallGuidance() {
  const ua = navigator.userAgent;
  const element = $('#install-guidance');
  if (window.matchMedia('(display-mode: standalone)').matches) {
    element.textContent = 'Installed — you’re viewing the full-screen app right now.';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    element.textContent = 'iPhone: tap Share in Safari, then "Add to Home Screen". Needs an https:// address.';
  } else if (/Android/i.test(ua)) {
    element.textContent = 'Android: tap the ⋮ menu in Chrome, then "Add to Home screen".';
  } else {
    element.textContent = 'Use the install icon in your browser’s address bar for a windowed app.';
  }
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

/* ------------------------------------------------------------------ *
 * Rendering entry points
 * ------------------------------------------------------------------ */

const KNOWN_PAGES = ['home', 'shop', 'favorites', 'about'];

function renderPage(page) {
  if (page === 'home') renderHome();
  else if (page === 'shop') renderShop();
  else if (page === 'favorites') renderFavorites();
  else if (page === 'about') renderAbout();
}

function renderAll() {
  renderHome();
  renderShop();
  renderFavorites();
  renderAbout();
  updateFavoritesBadge();
  setInstallGuidance();
}

function goToHash() {
  const requested = location.hash.slice(1);
  if (KNOWN_PAGES.includes(requested)) go(requested);
}
window.addEventListener('hashchange', goToHash);

/* ------------------------------------------------------------------ *
 * Events
 * ------------------------------------------------------------------ */

const ACTIONS = {
  install: () => install(),
  'close-modal': () => closeProduct(),
  'toggle-favorite': context => {
    setFavorite(context.slug);
    context.button.classList.toggle('active');
    context.button.textContent = context.button.classList.contains('active') ? '♥' : '♡';
    context.button.setAttribute('aria-pressed', context.button.classList.contains('active'));
    if (state.ui.page === 'favorites') renderFavorites();
  },
  'toggle-favorite-detail': () => {
    if (!activeSlug) return;
    setFavorite(activeSlug);
    updateDetailFavoriteButton(activeSlug);
    if (state.ui.page === 'favorites') renderFavorites();
  },
};

document.addEventListener('click', event => {
  const target = event.target;

  const actionEl = target.closest('[data-action]');
  if (actionEl && ACTIONS[actionEl.dataset.action]) {
    ACTIONS[actionEl.dataset.action]({ button: actionEl, slug: actionEl.dataset.slug });
    return;
  }

  const navButton = target.closest('[data-page]');
  if (navButton) { go(navButton.dataset.page); return; }

  const categoryTile = target.closest('[data-category]');
  if (categoryTile) {
    state.ui.shopCategory = categoryTile.dataset.category;
    go('shop');
    return;
  }

  const shopChip = target.closest('[data-shop-category]');
  if (shopChip) { state.ui.shopCategory = shopChip.dataset.shopCategory; renderShop(); return; }

  const card = target.closest('[data-product]');
  if (card) { openProduct(card.dataset.product); return; }
});

document.addEventListener('input', event => {
  if (event.target.id === 'shop-search') {
    state.ui.shopSearch = event.target.value;
    renderShop();
  }
});

modal.addEventListener('close', () => { activeSlug = null; });
modal.addEventListener('click', event => {
  if (event.target === modal) closeProduct();
});

window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && modal.open) closeProduct();
});

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

renderAll();
goToHash();
registerServiceWorker();
