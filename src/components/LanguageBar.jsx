function LangChip({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="flex min-w-0 flex-1 items-center justify-center px-0.5 py-1 sm:px-1.5"
    >
      <span
        className={[
          "inline-block text-[13px] leading-snug transition-colors sm:text-base",
          active
            ? "font-semibold text-[#1a73e8]"
            : "font-normal text-[#5f6368] hover:text-[#202124]",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}

export default function LanguageBar({
  direction,
  DIR,
  swapDirection,
}) {
  const sourceIsCorporate = direction === DIR.CTS;
  const targetIsStraight = direction === DIR.CTS;

  function ensureCTS() {
    if (direction !== DIR.CTS) swapDirection();
  }

  function ensureSTC() {
    if (direction !== DIR.STC) swapDirection();
  }

  const sourceLabel = sourceIsCorporate ? "Corporate Speak" : "Straight Talk";
  const targetLabel = targetIsStraight ? "Straight Talk" : "Corporate Speak";

  return (
    <div className="flex items-stretch bg-white border-b border-[#dadce0] min-h-[52px] sm:min-h-[56px]">
      {/* Mobile: current source only — tap swaps direction (same outcome as desktop chip + swap) */}
      <div className="flex flex-1 items-center justify-center px-2 min-w-0 lg:hidden">
        <button
          type="button"
          onClick={swapDirection}
          className="max-w-full text-center text-[13px] font-semibold leading-snug text-[#1a73e8]"
          title={`Source: ${sourceLabel}. Tap to swap with target.`}
        >
          {sourceLabel}
        </button>
      </div>

      {/* Desktop: both source options */}
      <div className="hidden lg:flex flex-1 items-center justify-center gap-2 px-3 min-w-0">
        <LangChip
          active={sourceIsCorporate}
          onClick={ensureCTS}
          label="Corporate Speak"
        />
        <LangChip
          active={!sourceIsCorporate}
          onClick={ensureSTC}
          label="Straight Talk"
        />
      </div>

      <div className="flex items-center justify-center px-0.5 sm:px-2 shrink-0 border-x border-[#eceff1] bg-[#fafafa]">
        <button
          type="button"
          onClick={swapDirection}
          className="tap-target w-10 h-10 sm:w-11 sm:h-11 rounded-full text-[#5f6368] hover:bg-[#f1f3f4] text-xl sm:text-[22px] leading-none"
          title="Swap languages"
          aria-label="Swap languages"
        >
          ⇄
        </button>
      </div>

      {/* Mobile: current target only */}
      <div className="flex flex-1 items-center justify-center px-2 min-w-0 lg:hidden">
        <button
          type="button"
          onClick={swapDirection}
          className="max-w-full text-center text-[13px] font-semibold leading-snug text-[#1a73e8]"
          title={`Target: ${targetLabel}. Tap to swap with source.`}
        >
          {targetLabel}
        </button>
      </div>

      {/* Desktop: both target options */}
      <div className="hidden lg:flex flex-1 items-center justify-center gap-2 px-3 min-w-0">
        <LangChip
          active={targetIsStraight}
          onClick={ensureCTS}
          label="Straight Talk"
        />
        <LangChip
          active={!targetIsStraight}
          onClick={ensureSTC}
          label="Corporate Speak"
        />
      </div>
    </div>
  );
}
