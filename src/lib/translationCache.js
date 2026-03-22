const STORAGE_KEY = "ct-translate-cache-v2";
/** Bump when server/API prompts change so old cached lines are not reused. */
export const TRANSLATION_CACHE_REVISION = "p5";

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
    sessionStorage.removeItem(STORAGE_KEY);
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

export function loadTranslationCache() {
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const obj = JSON.parse(raw);
    if (obj && typeof obj === "object") {
      return new Map(Object.entries(obj));
    }
  } catch {
    /* ignore */
  }
  return new Map();
}

export function saveTranslationCache(map) {
  try {
    const trimmed = trimMap(map);
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Object.fromEntries(trimmed)),
    );
    return trimmed;
  } catch {
    /* quota or private mode */
    return map;
  }
}
