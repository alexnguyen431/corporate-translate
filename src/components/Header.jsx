import { IconAccount, IconApps, IconMenu, IconSettings } from "./icons.jsx";
import { LogoWordmark } from "./LogoWordmark.jsx";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#dadce0]">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-5 min-h-14 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            className="tap-target rounded-full text-[#5f6368] hover:bg-black/[0.06] -ml-1 shrink-0"
            aria-label="Open menu"
          >
            <IconMenu className="w-6 h-6" />
          </button>
          <h1 className="min-w-0 flex items-center">
            <span className="sr-only">Corporate Translate</span>
            <LogoWordmark className="translate-y-px" />
          </h1>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            className="tap-target rounded-full text-[#5f6368] hover:bg-black/[0.06]"
            aria-label="Settings"
          >
            <IconSettings className="w-6 h-6" />
          </button>
          <button
            type="button"
            className="tap-target rounded-full text-[#5f6368] hover:bg-black/[0.06] hidden sm:inline-flex"
            aria-label="More apps"
          >
            <IconApps className="w-6 h-6" />
          </button>
          <button
            type="button"
            className="tap-target rounded-full text-[#5f6368] hover:bg-black/[0.06]"
            aria-label="Account"
          >
            <IconAccount className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
