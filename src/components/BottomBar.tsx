import Image from "next/image";

// The bar's own bottom inset.
// The spaces around `+` are load-bearing: calc() requires whitespace around + and -, and unlike
// a Tailwind arbitrary value (which normalises that) an inline style is passed through as-is —
// without them the whole declaration is dropped and both items sit flush to the screen edge.
const BOTTOM_INSET = "calc(clamp(1rem, 1.6vw, 1.875rem) + env(safe-area-inset-bottom, 0px))";

export default function BottomBar() {
  return (
    <div
      data-intro="chrome"
      className="invisible pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-between px-gutter text-[clamp(12px,0.833vw,16px)] leading-none opacity-0"
      style={{ paddingBottom: BOTTOM_INSET }}
    >
      {/* Stacked on a phone — side by side there crowded the wordmark's left edge. */}
      <div className="pointer-events-auto flex flex-col items-start gap-[0.4em] sm:flex-row sm:items-end sm:gap-[clamp(10px,0.83vw,16px)]">
        <span>Powered By</span>
        <span className="relative block h-[clamp(22px,1.51vw,29px)] w-[clamp(75px,5.16vw,99px)] sm:-mb-[0.2em]">
          <Image src="/brand/atsuya-logo.svg" alt="Atsuya Technologies" fill sizes="99px" />
        </span>
      </div>

      <div data-bottombar-end className="pointer-events-auto flex items-end">
        <span className="relative block size-[clamp(56px,5.2vw,100px)]">
          <Image src="/brand/patented-badge.png" alt="Patented — Intellectual Property" fill sizes="100px" />
        </span>
      </div>
    </div>
  );
}
