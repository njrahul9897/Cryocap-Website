import Image from "next/image";

// The bar's own bottom inset. Shared with the mobile scroll cue below, which is absolutely
// positioned to sit dead centre and so can't inherit the bar's padding.
// The spaces around `+` are load-bearing: calc() requires whitespace around + and -, and unlike
// a Tailwind arbitrary value (which normalises that) an inline style is passed through as-is —
// without them the whole declaration is dropped and both items sit flush to the screen edge.
const BOTTOM_INSET = "calc(clamp(1rem, 1.6vw, 1.875rem) + env(safe-area-inset-bottom, 0px))";

// Two tiles tall, each holding the full arrow asset, so one tile of travel loops back onto an
// identical frame.
function Chevron({ className = "" }: { className?: string }) {
  return (
    <span className={`chevron-window relative ${className}`}>
      <span className="chevron-flow absolute inset-x-0 top-0 h-[200%] bg-[url(/icons/arrow-down.svg)] bg-[length:100%_50%] bg-repeat-y" />
    </span>
  );
}

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

      {/* Phone-only scroll cue: the arrow on its own, centred. The label is dropped — at this
          width it crowds everything — and this is absolutely positioned rather than a third flex
          child because `justify-between` would only centre it if the two outer groups happened
          to be the same width. */}
      <a
        href="#problems"
        aria-label="Scroll down"
        data-bottombar-end
        className="pointer-events-auto absolute left-1/2 -translate-x-1/2 sm:hidden"
        style={{ bottom: BOTTOM_INSET }}
      >
        <Chevron className="block size-[20px]" />
      </a>

      <div data-bottombar-end className="pointer-events-auto flex items-end gap-[clamp(12px,1.3vw,25px)]">
        <a href="#problems" className="hidden items-center gap-2 transition-opacity hover:opacity-60 sm:inline-flex">
          <span>Scroll Down</span>
          <Chevron className="size-[clamp(14px,0.9375vw,18px)]" />
        </a>
        <span className="relative block size-[clamp(56px,5.2vw,100px)]">
          <Image src="/brand/patented-badge.png" alt="Patented — Intellectual Property" fill sizes="100px" />
        </span>
      </div>
    </div>
  );
}
