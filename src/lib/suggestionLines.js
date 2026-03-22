import {
  CORPORATE_SPEAK_SUGGESTIONS,
  STRAIGHT_TALK_SUGGESTIONS,
} from "../constants.js";

/** Match server `api/lib/suggestionBundle.js` normalization. */
export function normalizeSuggestionText(s) {
  return s
    .replace(/\u2019|\u2018/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .trim();
}

/** Lines that have authoritative copies in `api/data/suggestionTranslations.json`. */
export function isBundledSuggestionLine(direction, trimmed) {
  const t = normalizeSuggestionText(trimmed);
  if (direction === "corporate-to-straight") {
    return CORPORATE_SPEAK_SUGGESTIONS.some(
      (line) => normalizeSuggestionText(line) === t,
    );
  }
  if (direction === "straight-to-corporate") {
    return STRAIGHT_TALK_SUGGESTIONS.some(
      (line) => normalizeSuggestionText(line) === t,
    );
  }
  return false;
}
