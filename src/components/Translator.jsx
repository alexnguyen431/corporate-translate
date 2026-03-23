import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "../context/TranslationContext.jsx";
import {
  CORPORATE_SPEAK_SUGGESTIONS,
  MAX_CHARS,
  STRAIGHT_TALK_SUGGESTIONS,
} from "../constants.js";
import LanguageBar from "./LanguageBar.jsx";
import {
  IconCopy,
  IconKeyboard,
  IconLightbulb,
  IconMic,
  IconRate,
  IconShare,
  IconSpeaker,
} from "./icons.jsx";

function placeholderFor(direction, DIR) {
  if (direction === DIR.CTS) return "Paste or type the corporate speak...";
  return "Say what you mean, straight up...";
}

export default function Translator() {
  const {
    direction,
    input,
    setInput,
    output,
    loading,
    error,
    honeypot,
    setHoneypot,
    cooldownLeft,
    translate,
    swapDirection,
    clearInput,
    copyOutput,
    setDirection,
    DIR,
  } = useTranslation();

  const [copied, setCopied] = useState(false);
  const sourceTextareaRef = useRef(null);

  const placeholder = placeholderFor(direction, DIR);

  const adjustSourceTextareaHeight = useCallback(() => {
    const el = sourceTextareaRef.current;
    if (!el) return;
    const maxPx =
      typeof window !== "undefined"
        ? Math.min(Math.round(window.innerHeight * 0.5), 360)
        : 360;
    const minPxBase =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
        ? 240
        : 200;

    /**
     * Measure at the default height — do not collapse to 0 first (that inflates
     * scrollHeight in some engines so the box grows on the first keystroke).
     */
    el.style.overflowY = "hidden";
    el.style.height = `${minPxBase}px`;
    const needed = el.scrollHeight;
    const next = Math.min(maxPx, Math.max(minPxBase, needed));
    el.style.height = `${next}px`;
    el.style.overflowY = needed > maxPx ? "auto" : "hidden";
  }, [input]);

  useLayoutEffect(() => {
    adjustSourceTextareaHeight();
  }, [adjustSourceTextareaHeight]);

  useLayoutEffect(() => {
    function onResize() {
      adjustSourceTextareaHeight();
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [adjustSourceTextareaHeight]);

  const disabledTranslate =
    loading ||
    !input.trim() ||
    input.trim().length > MAX_CHARS ||
    cooldownLeft > 0;

  const randomPromptPool = [
    ...CORPORATE_SPEAK_SUGGESTIONS.map((text) => ({
      text,
      direction: DIR.CTS,
    })),
    ...STRAIGHT_TALK_SUGGESTIONS.map((text) => ({
      text,
      direction: DIR.STC,
    })),
  ];

  function pickRandomPrompt() {
    const i = Math.floor(Math.random() * randomPromptPool.length);
    const pick = randomPromptPool[i];
    setDirection(pick.direction);
    setInput(pick.text);
  }

  function handleInputKeyDown(e) {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    if (disabledTranslate) return;
    void translate();
  }

  return (
    <section id="translator-section" aria-label="Translation" className="space-y-4">
      {/* Main card — matches translate product: one shell, split panels */}
      <div className="rounded-2xl border-[3px] border-[#dadce0] bg-white overflow-hidden shadow-card max-w-full transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-card-hover focus-within:border-[#1a73e8] focus-within:shadow-card-hover">
        <LanguageBar
          direction={direction}
          DIR={DIR}
          swapDirection={swapDirection}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Source — white */}
          <div className="relative flex min-h-[220px] flex-col bg-white border-b border-[#dadce0] lg:min-h-[280px] lg:border-b-0 lg:border-r">
            <div className="flex min-h-0 flex-1 flex-col">
              <label className="sr-only" htmlFor="ct-input">
                Source text
              </label>
              <div className="relative px-4 pt-4">
                <textarea
                  ref={sourceTextareaRef}
                  id="ct-input"
                  rows={1}
                  className="w-full resize-none bg-transparent pb-2 text-[22px] sm:text-[24px] leading-[1.35] text-[#202124] placeholder:text-[#70757a] focus:outline-none"
                  placeholder={placeholder}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value.slice(0, MAX_CHARS));
                  }}
                  onKeyDown={handleInputKeyDown}
                  spellCheck
                  maxLength={MAX_CHARS}
                />
                {input.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={clearInput}
                    className="absolute bottom-3 left-3 z-[1] inline-flex min-h-10 items-center rounded-full bg-[#f1f3f4] px-5 py-2.5 text-sm font-medium text-[#1a73e8] hover:bg-[#e8eaed] hover:text-[#1557b0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/35"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="min-h-px flex-1" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute opacity-0 w-px h-px overflow-hidden"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-t border-[#f1f3f4] text-[#5f6368]">
              <div className="flex items-center gap-0.5">
                <span
                  className="tap-target w-10 h-10 rounded-full flex items-center justify-center opacity-50 cursor-not-allowed"
                  aria-hidden
                >
                  <IconMic className="w-[22px] h-[22px]" />
                </span>
                <span
                  className="tap-target w-10 h-10 rounded-full flex items-center justify-center opacity-50 cursor-not-allowed"
                  aria-hidden
                >
                  <IconSpeaker className="w-[22px] h-[22px]" />
                </span>
                <button
                  type="button"
                  onClick={pickRandomPrompt}
                  className="tap-target w-10 h-10 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4]"
                  title="Random example line"
                  aria-label="Insert a random example line"
                >
                  <IconLightbulb className="w-[22px] h-[22px]" />
                </button>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs text-[#70757a]">
                <span className="tabular-nums hidden sm:inline">
                  {input.length} / {MAX_CHARS}
                </span>
                <button
                  type="button"
                  className="tap-target w-10 h-10 rounded-full opacity-50 cursor-not-allowed hidden sm:inline-flex"
                  aria-hidden
                  disabled
                >
                  <IconKeyboard className="w-[22px] h-[22px]" />
                </button>
                <span className="tabular-nums sm:hidden">{input.length}</span>
              </div>
            </div>
          </div>

          {/* Target — light blue-gray (screenshot output panel) */}
          <div className="relative flex flex-col min-h-[220px] lg:min-h-[280px] bg-[#f0f4f9]">
            <div
              className="flex-1 px-4 pt-4 pb-3 pr-14 text-[22px] sm:text-[24px] leading-[1.35] text-[#202124] whitespace-pre-wrap font-normal"
              aria-live="polite"
            >
              {loading ? (
                <span className="text-[#70757a] font-normal font-sans animate-pulse">
                  Translating…
                </span>
              ) : output ? (
                output
              ) : (
                <span className="text-[#70757a] font-normal font-sans">
                  Translation
                </span>
              )}
            </div>
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-t border-[#e2e8f0]">
              <span
                className="tap-target w-10 h-10 rounded-full flex items-center justify-center text-[#5f6368] opacity-50 cursor-not-allowed"
                aria-hidden
              >
                <IconSpeaker className="w-[22px] h-[22px]" />
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyOutput();
                    if (ok) {
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  disabled={!output}
                  className="tap-target w-10 h-10 rounded-full text-[#5f6368] hover:bg-black/[0.06] disabled:opacity-35"
                  title={copied ? "Copied" : "Copy"}
                  aria-label="Copy translation"
                >
                  <IconCopy className="w-[20px] h-[20px]" />
                </button>
                <span className="sr-only" aria-live="polite">
                  {copied ? "Copied to clipboard" : ""}
                </span>
                <button
                  type="button"
                  className="tap-target w-10 h-10 rounded-full text-[#5f6368] opacity-40 cursor-not-allowed hidden sm:inline-flex"
                  aria-hidden
                  disabled
                >
                  <IconRate className="w-[20px] h-[20px]" />
                </button>
                <button
                  type="button"
                  className="tap-target w-10 h-10 rounded-full text-[#5f6368] opacity-40 cursor-not-allowed hidden sm:inline-flex"
                  aria-hidden
                  disabled
                >
                  <IconShare className="w-[20px] h-[20px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-center text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-center !mt-6">
        <button
          type="button"
          onClick={() => translate()}
          disabled={disabledTranslate}
          className="min-h-11 px-10 rounded-[100px] bg-[#1a73e8] text-white text-sm font-medium shadow-sm hover:bg-[#1557b0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Translating…" : "Translate"}
        </button>
      </div>
    </section>
  );
}
