import Image from "next/image";

export default function BottomBar() {
  return (
    <div
      data-intro="chrome"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-between px-gutter pb-[calc(clamp(1rem,1.6vw,1.875rem)+env(safe-area-inset-bottom,0px))] text-[clamp(12px,0.833vw,16px)] leading-none"
    >
      <div className="pointer-events-auto flex items-end gap-[clamp(10px,0.83vw,16px)]">
        <span>Powered By</span>
        <span className="relative block h-[clamp(22px,1.51vw,29px)] w-[clamp(75px,5.16vw,99px)] -mb-[0.2em]">
          <Image src="/brand/atsuya-logo.svg" alt="Atsuya Technologies" fill sizes="99px" />
        </span>
      </div>

      {/* data-bottombar-end: FooterScroll fades this cluster out over the footer, where
          "Scroll Down" has nothing left to point at and the badge is shown again up top. */}
      <div data-bottombar-end className="pointer-events-auto flex items-end gap-[clamp(12px,1.3vw,25px)]">
        <a href="#problems" className="hidden items-center gap-2 transition-opacity hover:opacity-60 sm:inline-flex">
          <span>Scroll Down</span>
          {/* strip is two tiles tall, each tile holding the full arrow asset, so one tile of
              travel loops back onto an identical frame */}
          <span className="chevron-window relative size-[clamp(14px,0.9375vw,18px)]">
            <span className="chevron-flow absolute inset-x-0 top-0 h-[200%] bg-[url(/icons/arrow-down.svg)] bg-[length:100%_50%] bg-repeat-y" />
          </span>
        </a>
        <span className="relative block size-[clamp(56px,5.2vw,100px)]">
          <Image src="/brand/patented-badge.png" alt="Patented — Intellectual Property" fill sizes="100px" />
        </span>
      </div>
    </div>
  );
}
