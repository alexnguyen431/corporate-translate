const STORAGE_KEY = "ct-translate-cache-v3";
const SESSION_LEGACY_KEY = "ct-translate-cache-v2";
/** Bump when server/API prompts change so old cached lines are not reused. */
export const TRANSLATION_CACHE_REVISION = "p8";

const LEGACY_STORAGE_KEYS = ["ct-translate-cache-v1"];

const MAX_ENTRIES = 200;

export function makeCacheKey(direction, text) {
  return `${TRANSLATION_CACHE_REVISION}::${direction}::${text}`;
}

/** Clears cached translations (e.g. after prompt updates). Safe to call from console: import { clearTranslationCache } from ... */
export function clearTranslationCache() {
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      sessionStorage.removeItem(key);
    }
    sessionStorage.removeItem(SESSION_LEGACY_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode / quota */
  }
}

function trimMap(map) {
  if (map.size <= MAX_ENTRIES) return map;
  const entries = [...map.entries()];
  const drop = entries.length - MAX_ENTRIES;
  return new Map(entries.slice(drop));
}

function parseMap(raw) {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === "object") {
      return new Map(Object.entries(obj));
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Migrate one-time from sessionStorage v2 into localStorage v3. */
function tryMigrateFromSession() {
  try {
    const legacy = sessionStorage.getItem(SESSION_LEGACY_KEY);
    if (!legacy) return null;
    const map = parseMap(legacy);
    if (!map || map.size === 0) {
      sessionStorage.removeItem(SESSION_LEGACY_KEY);
      return null;
    }
    sessionStorage.removeItem(SESSION_LEGACY_KEY);
    return map;
  } catch {
    return null;
  }
}

export function loadTranslationCache() {
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
  try {
    const fromLocal = parseMap(localStorage.getItem(STORAGE_KEY));
    if (fromLocal && fromLocal.size > 0) {
      return fromLocal;
    }
    const migrated = tryMigrateFromSession();
    if (migrated) {
      saveTranslationCache(migrated);
      return migrated;
    }
  } catch {
    /* ignore */
  }
  return new Map();
}

export function saveTranslationCache(map) {
  try {
    const trimmed = trimMap(map);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Object.fromEntries(trimmed)),
    );
    return trimmed;
  } catch {
    /* quota or private mode */
    return map;
  }
}
