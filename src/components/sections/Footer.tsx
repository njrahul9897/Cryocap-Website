import Image from "next/image";
import Button from "@/components/ui/Button";
import FooterScroll from "@/components/FooterScroll";

// Figma frames 18 -> 19, the closing panel. It deliberately echoes the hero: the same giant
// "Cryocap" wordmark under the same progressive blur-and-fade, the product rising from the
// bottom, and the same Watch Video / Buy Now pair — except the copy is the sign-off rather
// than the pitch. Frame 19 settles there; "made in india / for the world" is still parked
// below its clip windows at that point and reveals on one last beat of scroll.
// Geometry is fractions of the 1920x1080 frame, like every other section.
const BLUR_STEPS = 8;
const BLUR_MAX_VW = 34 / 19.2;

// Figma splits both lines into three runs so the middle of each — the part that crosses the
// can behind it — can be white while the rest stays black at 50%. Keeping that split verbatim
// is more predictable than reproducing it with a blend mode, but it only lines up if the can
// and the text scale together, which is why the can below is sized in vw (like this text)
// rather than in svh.
const madeInIndia = [
  [
    { text: "ma", tone: "text-[#808080]" },
    { text: "de in in", tone: "text-white" },
    { text: "dia", tone: "text-[#808080]" },
  ],
  [
    { text: "for", tone: "text-[#808080]" },
    { text: "the wo", tone: "text-white" },
    { text: "rld", tone: "text-[#808080]" },
  ],
];

export default function Footer() {
  return (
    <footer data-footer className="relative h-svh overflow-hidden bg-white">
      {/* Giant ghost wordmark — same size and gradient as the hero's, parked lower (Figma puts
          its frame at y=277 on the 1080 frame). */}
      <div
        data-footer-mark
        className="pointer-events-none absolute inset-x-0 top-[25.65svh] z-0 hidden justify-center lg:flex"
      >
        <p className="relative bg-linear-to-b from-ink from-52% to-[#666] to-80% bg-clip-text text-[min(21.35vw,37.96svh)] font-extrabold leading-[1.26] whitespace-nowrap text-transparent">
          Cryocap
          <span className="absolute top-[2.3em] -right-[0.3em] text-[max(0.875rem,min(2.35vw,4.18svh))] font-semibold leading-none text-ink">
            TM
          </span>
        </p>
      </div>

      {/* The hero's progressive blur/fade, reused verbatim: backdrop blur ramping 0 -> 34px
          (1920 frame) down the wordmark's lower half, then a white gradient over the top.
          The hero starts this 21.5svh below its wordmark (37.1 - 15.6); this wordmark sits
          10svh lower, so these start 10svh lower too. Reusing the hero's own 37.1/55.7 offsets
          here instead bit into far more of the wordmark and washed it out almost completely. */}
      <div className="pointer-events-none absolute inset-x-0 top-[47.15svh] z-10 hidden h-[44.3svh] lg:block">
        {Array.from({ length: BLUR_STEPS }).map((_, i) => {
          const band = 100 / BLUR_STEPS;
          const blur = (BLUR_MAX_VW * (i + 1)) / BLUR_STEPS;
          const mask = `linear-gradient(to bottom, transparent ${i * band}%, black ${(i + 1) * band}%, black ${(i + 2) * band}%, transparent ${(i + 3) * band}%)`;
          return (
            <div
              key={i}
              className="absolute inset-0"
              style={{ backdropFilter: `blur(${blur}vw)`, WebkitBackdropFilter: `blur(${blur}vw)`, maskImage: mask, WebkitMaskImage: mask }}
            />
          );
        })}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0.6)_20%,rgba(255,255,255,0.88)_40%,#fff_68%)]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-[65.75svh] z-10 hidden h-[44.3svh] bg-linear-to-b from-white/0 to-surface to-68% lg:block" />

      {/* The can & cap. Width, not height, is the fixed dimension (Figma 409/1920 = 21.3vw): the
          "made in india" runs below are split at letter boundaries that only line up with the
          can's edges if the two scale off the same axis. */}
      <div
        data-footer-can
        className="pointer-events-none absolute top-[57.5svh] left-[49.45vw] z-20 w-[21.3vw] -translate-x-1/2"
      >
        <div className="relative w-full aspect-[409/844]">
          <Image
            src="/footer/can-cap.webp"
            alt="The Cryocap smart cap fitted on a cryogenic container"
            fill
            sizes="(min-width: 1024px) 22vw, 55vw"
            className="object-contain object-top"
          />
        </div>
      </div>

      {/* Sign-off and the same CTA pair the hero carries. */}
      <div
        data-footer-copy
        className="absolute inset-x-0 top-[12.59svh] z-30 flex flex-col items-center gap-[2.604vw] px-gutter"
      >
        <p className="w-[47.45vw] text-center text-[2.604vw] leading-normal text-ink max-lg:w-full max-lg:text-[5vw]">
          Smart <strong className="font-extrabold">Monitoring</strong>, Better{" "}
          <strong className="font-extrabold">Breeding</strong>, Stronger{" "}
          <strong className="font-extrabold">Future.</strong>
        </p>
        <div className="flex gap-4">
          <Button variant="outline" icon="/icons/play.svg" className="w-[clamp(130px,8.75vw,168px)]">
            Watch Video
          </Button>
          <Button href="/buy" icon="/icons/cart.svg" className="w-[clamp(130px,8.75vw,168px)]">
            Buy Now
          </Button>
        </div>

        {/* Patented badge. It lives inside this block, not beside it, so `top-1/2` centres it on
            the headline + CTA pair as a unit whatever the copy wraps to. The artwork carries its
            own transparent margin, so the size is matched to Figma's render, not the node box. */}
        <div className="pointer-events-none absolute top-1/2 right-[14vw] hidden size-[8vw] -translate-y-1/2 lg:block">
          <Image src="/brand/patented-badge.png" alt="Patented — Intellectual Property" fill sizes="160px" />
        </div>
      </div>

      {/* "made in india / for the world" — each line in its own clip window so it can slide up
          the way every other headline in this build reveals. Window height matches the line box
          exactly (leading 1.075 of the 5.208vw face) and both are in vw, so the glyphs never
          clip on a viewport whose aspect ratio differs from the 1920x1080 frame, and
          `translate-y-full` hides a line exactly.
          Anchored to the BOTTOM, which is where Figma puts it (lockup bottom = frame bottom):
          pinning it by a vh top instead would let the vw-sized lines overrun the fold on a wide,
          short viewport. FooterScroll starts the whole block one line LOWER so "made in india"
          arrives on the bottom edge first and is then carried up as "for the world" follows it
          in. Painted above the can. */}
      <div
        data-footer-lockup
        className="pointer-events-none absolute bottom-0 left-1/2 z-30 w-[42.76vw] -translate-x-1/2"
      >
        {madeInIndia.map((line, i) => (
          <div key={i} data-footer-lockup-window className="h-[5.6vw] overflow-hidden">
            <p
              data-footer-lockup-line
              className="flex translate-y-full justify-center text-[5.208vw] font-extrabold uppercase leading-[1.075] whitespace-nowrap"
            >
              {line.map((run) => (
                <span key={run.text} className={run.tone}>
                  {run.text}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>

      {/* Figma swaps the global bar's "Scroll Down" cluster for the copyright down here. */}
      <div
        data-footer-copy
        className="absolute right-gutter bottom-[2.96svh] z-40 text-[clamp(12px,0.833vw,16px)] leading-none text-ink"
      >
        © 2026 Cryocap
      </div>

      <FooterScroll />
    </footer>
  );
}
