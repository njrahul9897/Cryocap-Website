import Image from "next/image";
import Button from "@/components/ui/Button";
import FooterScroll from "@/components/FooterScroll";

// Figma frames 18 -> 19, the closing panel. It deliberately echoes the hero: the same giant
// "Cryocap" wordmark under the same progressive blur-and-fade, the product rising from the
// bottom, and the same Watch Video / Buy Now pair — except the copy is the sign-off rather
// than the pitch. Frame 19 settles there; "made in india / for the world" is still parked
// below its clip windows at that point and reveals on one last beat of scroll.
// Geometry is fractions of the 1920x1080 frame, like every other section.
const BLUR_MAX_VW = 34 / 19.2;
// Same split the hero uses: eight bands of backdrop-filter is a real cost on a phone, and at
// this size three are indistinguishable.
const BLUR_STEPS_DESKTOP = 8;
const BLUR_STEPS_MOBILE = 3;

function BlurRamp({ steps }: { steps: number }) {
  return Array.from({ length: steps }).map((_, i) => {
    const band = 100 / steps;
    const blur = (BLUR_MAX_VW * (i + 1)) / steps;
    const mask = `linear-gradient(to bottom, transparent ${i * band}%, black ${(i + 1) * band}%, black ${(i + 2) * band}%, transparent ${(i + 3) * band}%)`;
    return (
      <div
        key={i}
        className="absolute inset-0"
        style={{ backdropFilter: `blur(${blur}vw)`, WebkitBackdropFilter: `blur(${blur}vw)`, maskImage: mask, WebkitMaskImage: mask }}
      />
    );
  });
}

// Figma splits both lines into three runs so the middle of each — the part that crosses the
// can behind it — can be white while the rest stays black at 50%. Keeping that split verbatim
// is more predictable than reproducing it with a blend mode, but it only lines up if the can
// and the text scale together, which is why the can below is sized in vw (like this text)
// rather than in dvh.
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
    <footer data-footer className="relative h-dvh overflow-hidden bg-white">
      {/* Giant ghost wordmark — same size and gradient as the hero's, parked lower (Figma puts
          its frame at y=277 on the 1080 frame). The phone takes the hero's own mobile size, so
          phone size is the one in the mobile design (18.3vw renders "Cryocap" 280px wide on a
          360 frame, which is what that file shows) — a hair under the hero's own 19vw. The three
          blocks below it keep the hero's mobile spacing relative to it: +6dvh to the blur,
          +19dvh to the grey fade. */}
      <div
        data-footer-mark
        className="invisible pointer-events-none absolute inset-x-0 z-0 flex justify-center opacity-0 max-lg:top-[49.7dvh] lg:top-[25.65dvh]"
      >
        <p className="relative bg-linear-to-b from-ink from-52% to-[#666] to-80% bg-clip-text font-extrabold leading-[1.26] whitespace-nowrap text-transparent max-lg:text-[max(3.5rem,min(18.3vw,37.96dvh))] lg:text-[min(21.35vw,37.96dvh)]">
          Cryocap
          {/* Percentages of this <p>, not `em`, on a phone — exactly the fix the hero's TM
              needed. `top`/`right` in em resolve against the TM's OWN font-size, which bottoms
              out on its rem floor while the wordmark keeps shrinking, so the mark slides out of
              superscript and into the letters. The lg values are the em ones, left untouched. */}
          <span className="absolute font-semibold leading-none text-ink max-lg:top-[20.1%] max-lg:-right-[0.77%] max-lg:text-[max(0.625rem,0.11em)] lg:top-[2.3em] lg:-right-[0.3em] lg:text-[max(0.875rem,min(2.35vw,4.18dvh))]">
            TM
          </span>
        </p>
      </div>

      {/* The hero's progressive blur/fade, reused verbatim: backdrop blur ramping 0 -> 34px
          (1920 frame) down the wordmark's lower half, then a white gradient over the top.
          The hero starts this 21.5dvh below its wordmark (37.1 - 15.6); this wordmark sits
          10dvh lower, so these start 10dvh lower too. Reusing the hero's own 37.1/55.7 offsets
          here instead bit into far more of the wordmark and washed it out almost completely. */}
      <div className="pointer-events-none absolute inset-x-0 z-10 max-lg:top-[55dvh] max-lg:h-[30dvh] lg:top-[47.15dvh] lg:h-[44.3dvh]">
        <div className="contents lg:hidden">
          <BlurRamp steps={BLUR_STEPS_MOBILE} />
        </div>
        <div className="hidden lg:contents">
          <BlurRamp steps={BLUR_STEPS_DESKTOP} />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0.6)_20%,rgba(255,255,255,0.88)_40%,#fff_68%)]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 z-10 bg-linear-to-b from-white/0 to-surface to-68% max-lg:top-[68dvh] max-lg:h-[45dvh] lg:top-[65.75dvh] lg:h-[44.3dvh]" />

      {/* The can & cap. Width, not height, is the fixed dimension (Figma 409/1920 = 21.3vw): the
          "made in india" runs below are split at letter boundaries that only line up with the
          can's edges if the two scale off the same axis. */}
      <div
        data-footer-can
        className="invisible pointer-events-none absolute z-20 -translate-x-1/2 opacity-0 max-lg:top-[63dvh] max-lg:left-1/2 max-lg:w-[61.5vw] lg:top-[57.5dvh] lg:left-[49.45vw] lg:w-[21.3vw]"
      >
        <div className="relative w-full aspect-[409/844]">
          <Image
            src="/footer/can-cap.webp"
            alt="The Cryocap smart cap fitted on a cryogenic container"
            fill
            sizes="(min-width: 1024px) 22vw, 62vw"
            className="object-contain object-top"
          />
        </div>
      </div>

      {/* Sign-off and the same CTA pair the hero carries. */}
      <div
        data-footer-copy
        className="invisible absolute inset-x-0 top-[12.59dvh] z-30 flex flex-col items-center gap-[2.604vw] px-gutter opacity-0"
      >
        <p className="w-[47.45vw] text-center text-[2.604vw] leading-normal text-ink max-lg:w-full max-lg:text-[5vw]">
          Smart <strong className="font-extrabold">Monitoring</strong>, Better{" "}
          <strong className="font-extrabold">Breeding</strong>, Stronger{" "}
          <strong className="font-extrabold">Future.</strong>
        </p>
        <div className="flex gap-4">
          <Button variant="outline" icon="/icons/play.svg" className="w-[clamp(130px,8.75vw,168px)]">
            How it works
          </Button>
          <Button href="/buy" icon="/icons/cart.svg" className="w-[clamp(130px,8.75vw,168px)]">
            Book a demo
          </Button>
        </div>

        {/* Patented badge. It lives inside this block, not beside it, so `top-1/2` centres it on
            the headline + CTA pair as a unit whatever the copy wraps to. The artwork carries its
            own transparent margin, so the size is matched to Figma's render, not the node box. */}
        <div className="pointer-events-none absolute top-1/2 right-[14vw] hidden size-[8vw] -translate-y-1/2 lg:block">
          <Image src="/brand/patented-badge.png" alt="Patented — Intellectual Property" fill sizes="160px" />
        </div>
      </div>

      {/* On a phone there is no room beside the copy, so the badge drops below the CTA pair and
          centres on the page instead. Separate element rather than responsive classes on the one
          above: that one is positioned against the copy block, this one against the footer.
          Centred with `inset-x-0` + `mx-auto` rather than a translate, because it carries
          data-footer-copy and so gets a GSAP `y` on arrival. */}
      <div
        data-footer-copy
        className="invisible pointer-events-none absolute inset-x-0 top-[35.5dvh] z-30 mx-auto size-[28vw] opacity-0 lg:hidden"
      >
        <Image src="/brand/patented-badge.png" alt="Patented — Intellectual Property" fill sizes="110px" />
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
        className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 max-lg:bottom-[8.5dvh] max-lg:w-[92vw] lg:bottom-0 lg:w-[42.76vw]"
      >
        {madeInIndia.map((line, i) => (
          <div key={i} data-footer-lockup-window className="overflow-hidden max-lg:h-[13.89vw] lg:h-[5.6vw]">
            <p
              data-footer-lockup-line
              className="flex translate-y-full justify-center font-extrabold uppercase whitespace-nowrap max-lg:text-[11vw] max-lg:leading-[1.2626] lg:text-[5.208vw] lg:leading-[1.075]"
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
        className="invisible absolute right-gutter bottom-[2.96dvh] z-40 text-[clamp(12px,0.833vw,16px)] leading-none text-ink opacity-0"
      >
        © 2026 Cryocap
      </div>

      <FooterScroll />
    </footer>
  );
}
