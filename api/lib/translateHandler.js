import crypto from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { MODEL, SYSTEM_PROMPTS } from "./prompts.js";
import {
  FALLBACK_REPLY,
  isLikelyGibberish,
  isPromptInjectionAttempt,
} from "./gibberish.js";
import { getBundledTranslation } from "./suggestionBundle.js";
import {
  getSharedTranslation,
  setSharedTranslation,
} from "./translationMemoryCache.js";

/** Keep in sync with `src/constants.js` TESTING_NO_LIMITS */
const TESTING_NO_LIMITS = false;
const MAX_CHARS = TESTING_NO_LIMITS ? 50000 : 500;

/** Anthropic-backed translations only (bundled suggestions skip this). */
const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 3600,
});

/** Cheap bundled responses: prevents scripted abuse of /api/translate without touching Anthropic. */
const bundledRateLimiter = new RateLimiterMemory({
  points: 60,
  duration: 60,
});

const BOT_UA = /curl\/|wget\/|python-requests|scrapy|aiohttp|Go-http|java\/|httpclient/i;

function hashIp(ip, salt) {
  return crypto
    .createHash("sha256")
    .update(`${salt || "corporate-translate"}:${ip}`)
    .digest("hex")
    .slice(0, 16);
}

function getClientIp(headers) {
  const xf = headers["x-forwarded-for"] || headers["X-Forwarded-For"];
  if (typeof xf === "string" && xf.length) {
    return xf.split(",")[0].trim();
  }
  return headers["x-real-ip"] || headers["X-Real-IP"] || "0.0.0.0";
}

function validateAndSanitize(raw) {
  if (typeof raw !== "string") return { error: "invalid_input" };
  let s = raw.replace(/\u0000/g, "");
  s = s.replace(/<\|[^|]+\|>/g, "");
  s = s.replace(/\n{5,}/g, "\n\n\n\n");
  const text = s.trim();
  if (!text.length) return { error: "empty" };
  if (text.length > MAX_CHARS) return { error: "too_long" };
  return { text };
}

function isSuspiciousUserAgent(ua) {
  if (!ua || typeof ua !== "string") return false;
  return BOT_UA.test(ua);
}

function logRequest({ ipHash, charCount, event = "translate" }) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      ipHash,
      charCount,
      event,
    }),
  );
}

/** Remove wrapping quotes models often add around the whole reply. */
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

export async function handleTranslate({
  method,
  body,
  headers = {},
  ip,
}) {
  if (method !== "POST") {
    const err = new Error("Method not allowed");
    err.status = 405;
    throw err;
  }

  const ua = headers["user-agent"] || headers["User-Agent"] || "";
  if (isSuspiciousUserAgent(ua)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  const honeypot =
    body?._hp ??
    body?.website ??
    body?.company_website ??
    "";
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { translation: "", silent: true };
  }

  const direction = body?.direction;
  if (direction !== "corporate-to-straight" && direction !== "straight-to-corporate") {
    const err = new Error("Invalid or missing direction");
    err.status = 400;
    throw err;
  }

  const rawInput = body?.text ?? body?.input ?? "";
  const raw = typeof rawInput === "string" ? rawInput : String(rawInput);
  const parsed = validateAndSanitize(raw);
  if (parsed.error === "empty") {
    const err = new Error("Input cannot be empty");
    err.status = 400;
    throw err;
  }
  if (parsed.error === "too_long") {
    const err = new Error(`Input must be ${MAX_CHARS} characters or fewer`);
    err.status = 400;
    throw err;
  }
  if (parsed.error) {
    const err = new Error("Invalid input");
    err.status = 400;
    throw err;
  }

  const { text } = parsed;
  const clientIp = ip || getClientIp(headers);

  if (isPromptInjectionAttempt(text) || isLikelyGibberish(text)) {
    if (!TESTING_NO_LIMITS) {
      try {
        await bundledRateLimiter.consume(clientIp);
      } catch {
        const err = new Error("Too many requests. Try again in a minute.");
        err.status = 429;
        throw err;
      }
    }
    const salt = process.env.IP_HASH_SALT || "";
    logRequest({
      ipHash: hashIp(clientIp, salt),
      charCount: text.length,
      event: isPromptInjectionAttempt(text)
        ? "translate-blocked"
        : "translate-gibberish",
    });
    return { translation: FALLBACK_REPLY[direction] };
  }

  const bundled = getBundledTranslation(direction, text);
  if (bundled !== null) {
    if (!TESTING_NO_LIMITS) {
      try {
        await bundledRateLimiter.consume(clientIp);
      } catch {
        const err = new Error("Too many requests. Try again in a minute.");
        err.status = 429;
        throw err;
      }
    }
    const salt = process.env.IP_HASH_SALT || "";
    logRequest({
      ipHash: hashIp(clientIp, salt),
      charCount: text.length,
      event: "translate-bundled",
    });
    return { translation: stripOuterQuotationMarks(bundled) };
  }

  const sharedHit = getSharedTranslation(direction, text);
  if (sharedHit !== null) {
    const salt = process.env.IP_HASH_SALT || "";
    logRequest({
      ipHash: hashIp(clientIp, salt),
      charCount: text.length,
      event: "translate-shared-cache",
    });
    return { translation: sharedHit };
  }

  if (!TESTING_NO_LIMITS) {
    try {
      await rateLimiter.consume(clientIp);
    } catch {
      const err = new Error("You've hit the limit. Come back in an hour.");
      err.status = 429;
      throw err;
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[translate] Missing ANTHROPIC_API_KEY");
    const err = new Error("Something went wrong");
    err.status = 500;
    throw err;
  }

  const salt = process.env.IP_HASH_SALT || "";
  logRequest({
    ipHash: hashIp(clientIp, salt),
    charCount: text.length,
  });

  const anthropic = new Anthropic({ apiKey });
  const system = SYSTEM_PROMPTS[direction];

  let msg;
  try {
    msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: text }],
    });
  } catch (e) {
    console.error("[translate] upstream", e?.status, e?.name);
    if (e?.status === 429) {
      const err = new Error("Too many requests. Try again later.");
      err.status = 429;
      throw err;
    }
    const err = new Error("Something went wrong");
    err.status = 500;
    throw err;
  }

  const rawOut =
    msg.content?.map((b) => (b.type === "text" ? b.text : "")).join("") ?? "";

  const cleaned = stripOuterQuotationMarks(rawOut);
  setSharedTranslation(direction, text, cleaned);
  return { translation: cleaned };
}
