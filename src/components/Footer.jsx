export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#dadce0] bg-[#fafafa]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="shrink-0">
            <p className="font-sans text-[12px] sm:text-sm text-[#5f6368] leading-snug">
              Made by{" "}
              <a
                href="https://www.alexnguyen.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#202124] hover:underline underline-offset-2"
              >
                Alex Nguyen
              </a>
            </p>
          </div>
          <div className="min-w-0 flex-1 lg:flex lg:justify-end">
            <p className="font-sans text-[12px] sm:text-sm text-[#5f6368] leading-snug whitespace-nowrap overflow-x-auto [scrollbar-width:thin] lg:text-right lg:overflow-visible pb-0.5">
              <span className="font-semibold text-[#202124]">Disclaimer:</span>{" "}
              I am a very professional and respectful employee with a clean HR
              history. Please hire me 😊
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
