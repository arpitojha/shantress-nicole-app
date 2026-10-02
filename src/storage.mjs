/**
 * Favorites persistence.
 *
 * Unlike an operational team tool, a shopper's saved pieces are personal —
 * there's no case for syncing them across devices, so plain localStorage is
 * the right amount of engineering here, not a placeholder for something
 * bigger. Falls back to an in-memory array if storage is unavailable
 * (private browsing, etc.) so the app still works for that session.
 */

const KEY = 'shantress-nicole/favorites/v1';

function hasLocalStorage() {
  try {
    const probe = '__sn_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const memory = { favorites: [] };
const persistent = hasLocalStorage();

export function loadFavorites() {
  if (!persistent) return [...memory.favorites];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites) {
  memory.favorites = favorites;
  if (!persistent) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(favorites));
  } catch {
    // Storage full or blocked mid-session — favorites still work for now,
    // just won't survive a refresh. Not worth surfacing as an error.
  }
}

export const isPersistent = persistent;
