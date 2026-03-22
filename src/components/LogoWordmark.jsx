/** Per-letter colors aligned with the reference wordmark */
const CORPORATE_COLORS = [
  "#4285F4",
  "#EA4335",
  "#FBBC05",
  "#4285F4",
  "#34A853",
  "#EA4335",
  "#FBBC05",
  "#4285F4",
  "#34A853",
];

const CORPORATE = "Corporate";

export function LogoWordmark({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 sm:gap-2.5 min-w-0 ${className}`}>
      <span className="inline-flex shrink-0 font-sans" aria-hidden="true">
        {Array.from(CORPORATE).map((ch, i) => (
          <span
            key={`${ch}-${i}`}
            style={{ color: CORPORATE_COLORS[i] ?? "#4285F4" }}
            className="font-medium text-[19px] sm:text-[22px] tracking-tight leading-none"
          >
            {ch}
          </span>
        ))}
      </span>
      <span
        className="text-[#5f6368] shrink-0 select-none font-sans font-semibold whitespace-nowrap text-[19px] sm:text-[22px] tracking-tight lowercase leading-none"
        aria-hidden="true"
      >
        translate
      </span>
    </span>
  );
}
