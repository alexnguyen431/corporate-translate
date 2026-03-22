function LangChip({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center shrink-0 px-1.5 py-1 rounded-sm text-[15px] sm:text-base transition-colors",
        active
          ? "text-[#1a73e8] font-medium border-b-[3px] border-[#1a73e8] pb-1 -mb-[1px]"
          : "text-[#5f6368] font-normal hover:text-[#202124]",
      ].join(" ")}
    >
      {children}
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

  return (
    <div className="flex items-stretch bg-white border-b border-[#dadce0] min-h-[56px]">
      <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 overflow-x-auto no-scrollbar min-w-0">
        <LangChip active={sourceIsCorporate} onClick={ensureCTS}>
          Corporate Speak
        </LangChip>
        <LangChip active={!sourceIsCorporate} onClick={ensureSTC}>
          Straight Talk
        </LangChip>
      </div>

      <div className="flex items-center justify-center px-1 sm:px-2 shrink-0 border-x border-[#eceff1] bg-[#fafafa]">
        <button
          type="button"
          onClick={swapDirection}
          className="tap-target w-11 h-11 rounded-full text-[#5f6368] hover:bg-[#f1f3f4] text-[22px] leading-none"
          title="Swap languages"
          aria-label="Swap languages"
        >
          ⇄
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 overflow-x-auto no-scrollbar min-w-0">
        <LangChip active={targetIsStraight} onClick={ensureCTS}>
          Straight Talk
        </LangChip>
        <LangChip active={!targetIsStraight} onClick={ensureSTC}>
          Corporate Speak
        </LangChip>
      </div>
    </div>
  );
}
