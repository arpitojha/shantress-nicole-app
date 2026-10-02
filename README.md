# Shantress Nicole — Art Prints (companion app)

A mobile-first, installable companion app for [shantressnicole.shop](https://shantressnicole.shop) — the full real catalog (41 pieces: fabric by the yard, seamless patterns, poster prints, stretched canvas, and digital art downloads), browsable and saveable from your phone like a native app.

This is an **independent, unofficial browsing app**, not a replacement storefront: it has no payment processing. Every "Shop this piece" button links out to the real product page on shantressnicole.shop to complete an actual purchase.

## What it does

- **Home** — brand hero, collection stats, a browse-by-collection rail, and hand-picked featured pieces.
- **Shop** — the entire real catalog: search, filter by collection, real names/prices/photos for all 41 products.
- **Favorites** — tap the heart on any piece to save it for later, kept on your device.
- **About** — the shop's real tagline and feature copy, a collection breakdown with live price ranges, and real links to their Instagram, TikTok, Facebook, and YouTube.
- **Product detail** — full description, price, a "Shop this piece" link to the real product page, and related pieces from the same collection.
- **Installable PWA** — add it to your home screen on iPhone or Android; works offline after first load.

## Where the content comes from

Every product name, price, description, category, and photo is scraped directly from the live store's public sitemap and product pages (`assets/products-raw.json` is the raw scrape; `src/products.mjs` is the cleaned version the app actually uses). Product photos are downloaded and served locally rather than hotlinked, so the app works fully offline and isn't dependent on the original site staying up.

A few products on the live site don't have a custom description or SEO title set by the shop — the app is honest about that rather than inventing marketing copy: those cards simply show the name, price, and category with no fabricated description. Likewise, the real site's "About" page is still placeholder text at the time of scraping, so this app's About page uses only verified real copy (the homepage's own tagline/feature blurb, the real collection breakdown, and real social links) — no invented founder bio.

## Running it locally

```bash
npm start
```

Opens on `http://localhost:4177` (prints a LAN URL too, for testing on a phone on the same Wi-Fi). No build step, no dependencies — plain ES modules and CSS.

## Installing on a phone

**Installing to a home screen requires `https://`** — browsers only offer a real "Add to Home Screen" / install prompt on a secure origin. Deploy the static files to any HTTPS host (GitHub Pages, Netlify, Vercel…) to get a real installable link.

- **iPhone (Safari):** open the link → Share → **Add to Home Screen**.
- **Android (Chrome):** open the link → Chrome may prompt automatically, or tap **⋮** → **Add to Home screen**.

## Project structure

```
index.html             Markup for all four views + the product detail modal
styles.css              Design system — black/crimson/gold, grounded in the real logo
src/app.js              UI controller — the only file that touches the DOM
src/catalog.mjs         Pure catalog logic (search/filter/stats/favorites) — unit tested
src/products.mjs        The real, cleaned catalog data
src/storage.mjs         Favorites persistence (localStorage, per-device — no sync needed)
assets/products/        41 real product photos, downloaded for offline use
assets/products-raw.json  The raw scrape, before name-cleaning/categorization
manifest.webmanifest   PWA manifest
sw.js                   Offline service worker (network-first, cache as fallback)
server.mjs              Zero-dependency static dev server
tests/                  Unit tests for catalog logic and the real product data
```

## Tests

```bash
npm test
```

Runs `node --test` over `tests/*.test.mjs` — covers the pure catalog logic (filtering, search, price ranges, favorites toggling) and sanity-checks the real scraped data itself (every product has the fields the app needs, prices match the live site's real $5.99–$450 range, no duplicate slugs).

**Latest run: 23/23 tests passing.**

## Design

Built directly from the real brand mark (not a generic template): matte black, a bold crimson, and warm brass gold, with an editorial serif (Playfair Display) for headings and a single cursive flourish (reserved for the brand signature, echoing the shop's own hand-lettered logo) — paired with a clean sans (Inter) for everything that needs to stay highly legible. The dark, gallery-like ground is a deliberate choice for an art shop: it's how framed pieces get lit in a real gallery, and it makes the artwork itself the only color on the page.
