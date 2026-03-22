import { IconAccount, IconApps, IconMenu, IconSettings } from "./icons.jsx";
import { LogoWordmark } from "./LogoWordmark.jsx";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#dadce0]">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-5 min-h-14 flex items-center justify-between gap-3 py-2">
        <div className="flex min-h-11 items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            className="tap-target shrink-0 flex items-center justify-center rounded-full text-[#5f6368] hover:bg-black/[0.06] leading-none"
            aria-label="Open menu"
          >
            <IconMenu className="h-6 w-6" />
          </button>
          <h1 className="m-0 min-w-0 flex min-h-11 items-center leading-none">
            <span className="sr-only">Corporate Translate</span>
            <LogoWordmark />
          </h1>
        </div>
        <div className="flex min-h-11 items-center gap-0.5 shrink-0">
          <button
            type="button"
            className="tap-target rounded-full text-[#5f6368] hover:bg-black/[0.06] flex items-center justify-center"
            aria-label="Settings"
          >
            <IconSettings className="w-6 h-6" />
          </button>
          <button
            type="button"
            className="tap-target rounded-full text-[#5f6368] hover:bg-black/[0.06] hidden sm:inline-flex items-center justify-center"
            aria-label="More apps"
          >
            <IconApps className="w-6 h-6" />
          </button>
          <button
            type="button"
            className="tap-target rounded-full text-[#5f6368] hover:bg-black/[0.06] flex items-center justify-center"
            aria-label="Account"
          >
            <IconAccount className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
