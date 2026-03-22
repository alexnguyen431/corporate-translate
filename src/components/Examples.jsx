import {
  CORPORATE_SPEAK_SUGGESTIONS,
  STRAIGHT_TALK_SUGGESTIONS,
} from "../constants.js";
import { useTranslation } from "../context/TranslationContext.jsx";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Leading emoji — width follows glyph so label stays close. */
function HeadingIconSlot({ children, className = "" }) {
  return (
    <span
      className={`inline-flex h-[1.25em] shrink-0 items-center leading-none ${className}`}
      aria-hidden
    >
      {children}
    </span>
  );
}

export default function Examples() {
  const { translate, DIR } = useTranslation();

  return (
    <section
      className="mt-[60px] pt-10 border-t border-[#dadce0] text-left"
      aria-labelledby="suggestions-heading"
    >
      <h2
        id="suggestions-heading"
        className="text-base sm:text-xl font-semibold text-[#202124] mb-8 text-left"
      >
        Try a suggestion
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        <div className="text-left">
          <h3 className="text-[15px] font-semibold text-[#202124] mb-4 flex w-full items-center justify-start gap-1.5 text-left">
            <HeadingIconSlot className="text-[17px] sm:text-lg">
              🗣️
            </HeadingIconSlot>
            Corporate Speak
          </h3>
          <ul className="space-y-0 divide-y divide-[#eceff1] rounded-xl border border-[#dadce0] bg-white overflow-hidden shadow-[0_1px_2px_rgba(60,64,67,.08)]">
            {CORPORATE_SPEAK_SUGGESTIONS.map((line) => (
              <li key={line}>
                <button
                  type="button"
                  onClick={() => {
                    scrollToTop();
                    translate({
                      text: line,
                      direction: DIR.CTS,
                      fromSuggestion: true,
                    });
                  }}
                  className="w-full text-left px-4 py-3 text-[15px] text-[#202124] hover:bg-[#f8f9fa] transition-colors leading-snug"
                >
                  {line}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-left">
          <h3 className="text-[15px] font-semibold text-[#202124] mb-4 flex w-full items-center justify-start gap-1.5 text-left">
            <HeadingIconSlot className="text-[17px] sm:text-lg">
              💀
            </HeadingIconSlot>
            Straight Talk
          </h3>
          <ul className="space-y-0 divide-y divide-[#eceff1] rounded-xl border border-[#dadce0] bg-white overflow-hidden shadow-[0_1px_2px_rgba(60,64,67,.08)]">
            {STRAIGHT_TALK_SUGGESTIONS.map((line) => (
              <li key={line}>
                <button
                  type="button"
                  onClick={() => {
                    scrollToTop();
                    translate({
                      text: line,
                      direction: DIR.STC,
                      fromSuggestion: true,
                    });
                  }}
                  className="w-full text-left px-4 py-3 text-[15px] text-[#202124] hover:bg-[#f8f9fa] transition-colors leading-snug"
                >
                  {line}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
