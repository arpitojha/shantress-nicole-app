/**
 * Offline shell for the Shantress Nicole app.
 *
 * Same strategy as a prior project taught the hard way: race the network
 * against a short timeout, cache as the tiebreaker. A normal connection
 * gets the freshest deployed code; a slow one falls back to whatever's
 * cached instead of stalling. Only the app shell is precached on install —
 * product photos cache opportunistically as they're actually viewed, so
 * install stays fast and storage isn't spent on pieces nobody's looked at.
 */

const VERSION = 'sn-v1';
const NETWORK_TIMEOUT_MS = 1800;
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './src/app.js',
  './src/catalog.mjs',
  './src/products.mjs',
  './src/storage.mjs',
  './icons/icon.svg',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.all(SHELL.map(url => cache.add(url).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== VERSION).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);

    const network = fetch(request).then(response => {
      if (response && response.ok) {
        caches.open(VERSION).then(cache => cache.put(request, response.clone()));
      }
      return response;
    }).catch(() => null);

    if (!cached) {
      const response = await network;
      if (response) return response;
      if (request.mode === 'navigate') {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
      return Response.error();
    }

    const timeout = new Promise(resolve => setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS));
    const fast = await Promise.race([network, timeout]);
    return fast || cached;
  })());
});
