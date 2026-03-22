export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#dadce0] bg-[#fafafa]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 min-h-[240px] lg:min-h-0 flex flex-col justify-center py-10 sm:py-10">
        <div className="flex flex-col gap-4 text-left max-w-full">
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
            {" "}
            - A product designer in Vancouver, Canada
          </p>
          <p className="font-sans text-[12px] sm:text-sm text-[#5f6368] leading-relaxed text-pretty break-words">
            <span className="font-semibold text-[#202124]">Disclaimer:</span>{" "}
            This site is satire. I am a very professional and respectful employee
            with a clean HR history. Please hire me 😊
          </p>
        </div>
      </div>
    </footer>
  );
}
