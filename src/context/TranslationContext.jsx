import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { COOLDOWN_MS, MAX_CHARS } from "../constants.js";
import {
  loadTranslationCache,
  makeCacheKey,
  saveTranslationCache,
} from "../lib/translationCache.js";
import { stripOuterQuotationMarks } from "../lib/stripOuterQuotes.js";

const DIR = {
  CTS: "corporate-to-straight",
  STC: "straight-to-corporate",
};

/** Minimum time the “Translating…” state shows when using suggestion chips (feels like a real round-trip). */
const MIN_SUGGESTION_LOAD_MS = 720;

const TranslationContext = createContext(null);

export function TranslationProvider({ children }) {
  const [direction, setDirection] = useState(DIR.CTS);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const lastRequestRef = useRef(0);
  const cooldownTimerRef = useRef(null);
  /** Last successful translate: restore output only when input + direction match again. */
  const translationPairRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  /** Restore output from the last pair or from local translation cache (no API). */
  useEffect(() => {
    if (loading) return;
    const t = input.trim();
    if (!t.length) {
      translationPairRef.current = null;
      setOutput("");
      return;
    }
    const snap = translationPairRef.current;
    if (snap && direction === snap.direction && t === snap.text) {
      setOutput(snap.output);
      return;
    }
    const cache = loadTranslationCache();
    const hit = cache.get(makeCacheKey(direction, t));
    if (hit !== undefined) {
      const out = stripOuterQuotationMarks(hit);
      translationPairRef.current = { direction, text: t, output: out };
      setOutput(out);
      return;
    }
    translationPairRef.current = null;
    setOutput("");
  }, [input, direction, loading]);

  const startCooldown = useCallback(() => {
    lastRequestRef.current = Date.now();
    setCooldownLeft(COOLDOWN_MS);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    const start = Date.now();
    cooldownTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const leftMs = Math.max(0, COOLDOWN_MS - elapsed);
      setCooldownLeft(leftMs);
      if (leftMs <= 0 && cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    }, 100);
  }, []);

  const translate = useCallback(
    async (overrides) => {
      const dir = overrides?.direction ?? direction;
      const textSource = overrides?.text !== undefined ? overrides.text : input;
      const trimmed =
        typeof textSource === "string" ? textSource.trim() : String(textSource).trim();
      if (!trimmed.length) {
        setError("Paste something first.");
        return;
      }
      if (trimmed.length > MAX_CHARS) {
        setError(`Keep it under ${MAX_CHARS} characters.`);
        return;
      }

      const cacheKey = makeCacheKey(dir, trimmed);
      const cache = loadTranslationCache();
      const cached = cache.get(cacheKey);
      const fromSuggestion = overrides?.fromSuggestion === true;

      if (cached !== undefined) {
        if (overrides?.direction != null) setDirection(overrides.direction);
        if (overrides?.text !== undefined) setInput(overrides.text);
        setError("");
        const out = stripOuterQuotationMarks(cached);
        if (fromSuggestion) {
          translationPairRef.current = null;
          setLoading(true);
          setOutput("");
          await new Promise((r) => setTimeout(r, MIN_SUGGESTION_LOAD_MS));
          translationPairRef.current = {
            direction: dir,
            text: trimmed,
            output: out,
          };
          setOutput(out);
          setLoading(false);
          return;
        }
        translationPairRef.current = {
          direction: dir,
          text: trimmed,
          output: out,
        };
        setOutput(out);
        return;
      }

      const now = Date.now();
      if (now - lastRequestRef.current < COOLDOWN_MS) {
        return;
      }

      if (overrides?.direction != null) setDirection(overrides.direction);
      if (overrides?.text !== undefined) setInput(overrides.text);

      setError("");
      translationPairRef.current = null;
      setLoading(true);
      setOutput("");

      const requestStarted = Date.now();
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            direction: dir,
            text: trimmed,
            _hp: honeypot,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Something went wrong");
          return;
        }
        let text = stripOuterQuotationMarks(data.translation || "");
        if (fromSuggestion) {
          const elapsed = Date.now() - requestStarted;
          const pad = Math.max(0, MIN_SUGGESTION_LOAD_MS - elapsed);
          if (pad) await new Promise((r) => setTimeout(r, pad));
        }
        translationPairRef.current = {
          direction: dir,
          text: trimmed,
          output: text,
        };
        setOutput(text);
        const next = loadTranslationCache();
        next.set(cacheKey, text);
        saveTranslationCache(next);
        startCooldown();
      } catch {
        setError("Network error. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [direction, input, honeypot, startCooldown],
  );

  const swapDirection = useCallback(() => {
    const nextDir = direction === DIR.CTS ? DIR.STC : DIR.CTS;
    const nextIn = output;
    const nextOut = input;
    const trimmedLeft =
      typeof nextIn === "string" ? nextIn.trim() : String(nextIn).trim();
    translationPairRef.current = {
      direction: nextDir,
      text: trimmedLeft,
      output: nextOut,
    };
    setDirection(nextDir);
    setInput(nextIn);
    setOutput(nextOut);
    setError("");
  }, [direction, input, output]);

  const clearInput = useCallback(() => {
    translationPairRef.current = null;
    setInput("");
    setOutput("");
    setError("");
  }, []);

  const copyOutput = useCallback(async () => {
    if (!output) return false;
    const text = output;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* fall through to legacy copy */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }, [output]);

  const value = useMemo(
    () => ({
      direction,
      setDirection,
      input,
      setInput,
      output,
      setOutput,
      loading,
      error,
      honeypot,
      setHoneypot,
      cooldownLeft,
      translate,
      swapDirection,
      clearInput,
      copyOutput,
      DIR,
    }),
    [
      direction,
      input,
      output,
      loading,
      error,
      honeypot,
      cooldownLeft,
      translate,
      swapDirection,
      clearInput,
      copyOutput,
    ],
  );

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useTranslation must be used within TranslationProvider");
  return ctx;
}
