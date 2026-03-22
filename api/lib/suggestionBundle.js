import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE_PATH = join(__dirname, "../data/suggestionTranslations.json");

let cached = null;

function loadBundle() {
  if (cached) return cached;
  if (!existsSync(BUNDLE_PATH)) {
    cached = { entries: {} };
    return cached;
  }
  try {
    const raw = readFileSync(BUNDLE_PATH, "utf8");
    cached = JSON.parse(raw);
  } catch {
    cached = { entries: {} };
  }
  return cached;
}

/** Returns bundled translation or null if this (direction, text) is not in the file. */
export function getBundledTranslation(direction, text) {
  const bundle = loadBundle();
  const branch = bundle.entries?.[direction];
  if (!branch || typeof branch !== "object") return null;
  const out = branch[text];
  return typeof out === "string" && out.length > 0 ? out : null;
}
