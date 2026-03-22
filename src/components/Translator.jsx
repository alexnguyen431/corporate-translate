import { useState } from "react";
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
  if (direction === DIR.CTS) return "Paste the corporate speak…";
  return "Say what you mean, straight up";
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

  const placeholder = placeholderFor(direction, DIR);

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
          <div className="relative flex flex-col min-h-[220px] lg:min-h-[280px] bg-white border-b lg:border-b-0 lg:border-r border-[#dadce0]">
            {input.trim().length > 0 && (
              <button
                type="button"
                onClick={clearInput}
                className="absolute top-3 right-3 z-[1] tap-target w-9 h-9 rounded-full text-[#5f6368] hover:bg-[#f1f3f4] text-xl leading-none"
                aria-label="Clear"
              >
                ×
              </button>
            )}
            <label className="sr-only" htmlFor="ct-input">
              Source text
            </label>
            <textarea
              id="ct-input"
              className="flex-1 w-full resize-none bg-transparent px-4 pt-4 pb-2 pr-12 text-[22px] sm:text-[24px] leading-[1.35] text-[#202124] placeholder:text-[#70757a] focus:outline-none min-h-[200px] lg:min-h-[240px]"
              placeholder={placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleInputKeyDown}
              spellCheck
              maxLength={MAX_CHARS}
            />
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

      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={() => translate()}
          disabled={disabledTranslate}
          className="min-h-11 px-10 rounded-md bg-[#1a73e8] text-white text-sm font-medium shadow-sm hover:bg-[#1557b0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Translating…" : "Translate"}
        </button>
      </div>
    </section>
  );
}
