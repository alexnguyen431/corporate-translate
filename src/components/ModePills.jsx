import {
  IconDocMode,
  IconImageMode,
  IconTextMode,
  IconWebMode,
} from "./icons.jsx";

const MODES = [
  { id: "text", label: "Text", Icon: IconTextMode, active: true },
  { id: "images", label: "Images", Icon: IconImageMode, active: false },
  { id: "documents", label: "Documents", Icon: IconDocMode, active: false },
  { id: "websites", label: "Websites", Icon: IconWebMode, active: false },
];

export default function ModePills() {
  return (
    <div
      className="mode-pills-desktop-only flex flex-wrap gap-2 sm:gap-2.5 mb-5 sm:mb-6"
      role="tablist"
      aria-label="Input mode"
    >
      {MODES.map((m) => {
        const Icon = m.Icon;
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={m.active}
            disabled={!m.active}
            className={[
              "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors border",
              m.active
                ? "bg-[#1a73e8] text-white border-[#1a73e8] shadow-sm"
                : "bg-[#f1f3f4] text-[#80868b] border-[#e8eaed] cursor-not-allowed opacity-80",
            ].join(" ")}
          >
            <Icon
              className={`w-[18px] h-[18px] shrink-0 ${m.active ? "text-white" : "text-[#9aa0a6]"}`}
            />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
