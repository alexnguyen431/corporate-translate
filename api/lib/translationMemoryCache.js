import crypto from "node:crypto";

/**
 * Ephemeral shared cache for Anthropic-backed translations (middle ground vs per-browser only).
 * Keys are SHA-256 hashes; values expire. Clears on cold start (e.g. new serverless instance).
 * Bump CACHE_REVISION when MODEL or SYSTEM_PROMPTS change.
 */
const CACHE_REVISION = "m4";
const TTL_MS = 6 * 60 * 60 * 1000;
const MAX_ENTRIES = 400;

/** @type {Map<string, { value: string, expiresAt: number }>} */
const store = new Map();

function makeKey(direction, text) {
  return crypto
    .createHash("sha256")
    .update(`${CACHE_REVISION}\0${direction}\0${text}`)
    .digest("hex");
}

/**
 * @param {string} direction
 * @param {string} text trimmed user text
 * @returns {string | null}
 */
export function getSharedTranslation(direction, text) {
  const key = makeKey(direction, text);
  const row = store.get(key);
  if (!row) return null;
  if (Date.now() > row.expiresAt) {
    store.delete(key);
    return null;
  }
  store.delete(key);
  store.set(key, row);
  return row.value;
}

/**
 * @param {string} direction
 * @param {string} text trimmed user text
 * @param {string} translation stripped model output
 */
export function setSharedTranslation(direction, text, translation) {
  if (typeof translation !== "string" || !translation.length) return;
  const key = makeKey(direction, text);
  const existed = store.has(key);
  store.delete(key);
  if (!existed && store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
  store.set(key, {
    value: translation,
    expiresAt: Date.now() + TTL_MS,
  });
}
