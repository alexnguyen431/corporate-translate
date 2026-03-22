/**
 * Regenerates api/data/suggestionTranslations.json using the current prompts in api/lib/prompts.js.
 *
 * Run when you change SYSTEM_PROMPTS or suggestion strings in src/constants.js:
 *   npm run generate:suggestions
 *
 * Requires ANTHROPIC_API_KEY (e.g. in .env at project root).
 */
import "dotenv/config";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { MODEL, SYSTEM_PROMPTS } from "../api/lib/prompts.js";
import {
  CORPORATE_SPEAK_SUGGESTIONS,
  STRAIGHT_TALK_SUGGESTIONS,
} from "../src/constants.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../api/data/suggestionTranslations.json");

/** Bump when api/lib/prompts.js changes so you know which bundle matches which prompt era. */
const PROMPT_REVISION = 1;

const GAP_MS = 1600;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function stripOuterQuotationMarks(s) {
  let t = typeof s === "string" ? s.trim() : "";
  if (t.length < 2) return t;
  const pairs = [
    ['"', '"'],
    ["\u201c", "\u201d"],
    ["\u2018", "\u2019"],
    ["\u00ab", "\u00bb"],
    ["'", "'"],
  ];
  for (let depth = 0; depth < 3; depth++) {
    let changed = false;
    for (const [open, close] of pairs) {
      if (
        t.length >= open.length + close.length &&
        t.startsWith(open) &&
        t.endsWith(close)
      ) {
        t = t.slice(open.length, t.length - close.length).trim();
        changed = true;
        break;
      }
    }
    if (!changed) break;
  }
  return t;
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY. Add it to .env and try again.");
    process.exit(1);
  }

  mkdirSync(dirname(OUT), { recursive: true });

  const anthropic = new Anthropic({ apiKey });
  const entries = {
    "corporate-to-straight": {},
    "straight-to-corporate": {},
  };

  const jobs = [];
  for (const line of CORPORATE_SPEAK_SUGGESTIONS) {
    jobs.push({ direction: "corporate-to-straight", text: line });
  }
  for (const line of STRAIGHT_TALK_SUGGESTIONS) {
    jobs.push({ direction: "straight-to-corporate", text: line });
  }

  let lastApi = 0;
  for (const job of jobs) {
    const wait = Math.max(0, GAP_MS - (Date.now() - lastApi));
    if (wait) await delay(wait);

    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPTS[job.direction],
      messages: [{ role: "user", content: job.text }],
    });
    lastApi = Date.now();

    const rawOut =
      msg.content?.map((b) => (b.type === "text" ? b.text : "")).join("") ?? "";
    entries[job.direction][job.text] = stripOuterQuotationMarks(rawOut);
    console.log("OK", job.direction, job.text.slice(0, 48));
  }

  const payload = {
    promptRevision: PROMPT_REVISION,
    generatedAt: new Date().toISOString(),
    entries,
  };
  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log("Wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
