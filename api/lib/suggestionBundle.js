import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const bundleData = require("../data/suggestionTranslations.json");

/** Normalize typographic quotes so UI / JSON keys still match. */
function normalizeSuggestionText(s) {
  return s
    .replace(/\u2019|\u2018/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .trim();
}

/** Returns bundled translation or null if this (direction, text) is not in the file. */
export function getBundledTranslation(direction, text) {
  const branch = bundleData.entries?.[direction];
  if (!branch || typeof branch !== "object") return null;
  const norm = normalizeSuggestionText(text);
  let out = branch[norm];
  if (typeof out === "string" && out.length > 0) return out;
  if (norm !== text) {
    out = branch[text];
    if (typeof out === "string" && out.length > 0) return out;
  }
  for (const [k, v] of Object.entries(branch)) {
    if (normalizeSuggestionText(k) === norm && typeof v === "string" && v.length > 0) {
      return v;
    }
  }
  return null;
}
