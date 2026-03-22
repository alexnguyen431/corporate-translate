/**
 * Cheap-path detection: no LLM call. Tuned to catch random/mash strings like "testssete"
 * while avoiding common real words (high unique-letter ratio, normal vowel use).
 */

const PROMPT_INJECTION = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /system\s*prompt/i,
  /\[?\s*INST\s*\]?/i,
  /<\|assistant\|>/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /\bDAN\b.*\bmode\b/i,
];

/** Canned replies — never call Anthropic for these. */
export const FALLBACK_REPLY = {
  "corporate-to-straight":
    "This looks like random keys or a stress test, not a real slide-deck sentence. Paste actual corporate speak and we’ll decode it.",
  "straight-to-corporate":
    "That doesn’t read like something you’d say in a real meeting—try a clear line about what you mean, and we’ll dress it up.",
};

export function isPromptInjectionAttempt(text) {
  const t = typeof text === "string" ? text : "";
  return PROMPT_INJECTION.some((re) => re.test(t));
}

/**
 * Heuristic “not natural language” — conservative on multi-word input.
 */
export function isLikelyGibberish(text) {
  const t = text.trim();
  if (t.length < 6 || t.length > 400) return false;

  if (/\s/.test(t)) {
    const words = t.split(/\s+/).filter(Boolean);
    if (words.length >= 3) return false;
  }

  const lettersOnly = t.replace(/[^a-zA-Z]/g, "");
  if (lettersOnly.length < 6) return false;

  const lower = lettersOnly.toLowerCase();
  const n = lower.length;
  const uniq = new Set(lower).size;
  const uniqRatio = uniq / n;

  const vowels = lower.replace(/[^aeiouy]/g, "").length;
  const vowelRatio = vowels / n;

  let score = 0;

  if (uniqRatio <= 0.34 && n >= 7 && n <= 28 && !/\s/.test(t)) score += 3;

  if (n >= 8 && vowelRatio < 0.12) score += 2;
  if (n >= 10 && vowelRatio < 0.18 && uniqRatio < 0.45) score += 2;

  const counts = {};
  for (const c of lower) counts[c] = (counts[c] || 0) + 1;
  const maxFreq = Math.max(...Object.values(counts));
  if (maxFreq >= Math.ceil(n * 0.42) && n >= 6) score += 2;

  if (/[bcdfghjklmnpqrstvwxz]{6,}/i.test(lower)) score += 2;

  if (/^(test|asdf|qwert|zxcv|hjkl|vbnm|sdfg|ffff|kkkk|xxxx|zzzz)/i.test(t)) score += 2;

  return score >= 3;
}
