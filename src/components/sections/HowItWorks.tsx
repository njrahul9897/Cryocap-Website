import Image from "next/image";
import HowItWorksScroll from "@/components/HowItWorksScroll";

// Centered variant of Figma frames 11 -> 12 (the source design left-aligns the headline; this
// section centers both the text and the probe on the page instead). Each word sits in its own
// clip window and slides up on its own beat, so "How" / "does" / "It" / "works" reveal one
// after another rather than each line arriving as a single unit.
const word = "text-[14.8vw] font-extrabold uppercase leading-[0.909] whitespace-nowrap";
// `gap-[0.28em]` resolves against the row's OWN font-size, not the 14.8vw text inside it — so
// the row needs that same size set on it too, or the em unit collapses to the inherited body
// size and the words end up touching.
const row = "flex gap-[0.28em] text-[14.8vw]";
// "It works" needs `relative` for z-index to apply at all (z-index is a no-op on static
// elements) — once positioned, it paints above the cap's z-10 in the shared section-level
// stacking context (the flex-col wrapper around both rows has no z-index of its own, so it
// never isolates them into their own context; "How does" stays unpositioned/z-auto and so
// still paints behind the cap, same as before).
const foregroundRow = `${row} relative z-20`;

// Figma's "How does it work - animation" panel (frames 14/15): the same "How does" / "It
// works" pair reappears, shrunk and moved up, with four device-flow animations lined up below
// it. In the Figma prototype this is a hard cut to a new frame; here it is a continuation of
// the SAME text elements above (scaled + translated by HowItWorksScroll), never unmounted, so
// there is nothing to disappear and reappear.
type Step = { src: string; alt: string; ratio: string; imgWidth: string; caption: React.ReactNode };

const steps: Step[] = [
  {
    src: "/how-it-works/install-cap.gif",
    alt: "The Cryocap smart cap lowering onto the container's neck",
    ratio: "116/487",
    imgWidth: "w-[6vw]",
    caption: (
      <>
        Install the Cryocap<sup className="text-[0.6em]">TM</sup> on the container
      </>
    ),
  },
  {
    src: "/how-it-works/connect-device.gif",
    alt: "Enabling Bluetooth to pair the cap with the Aone app",
    ratio: "180/238",
    imgWidth: "w-[9.4vw]",
    caption: "Connects to your Aone system",
  },
  {
    src: "/how-it-works/monitor-dashboard.gif",
    alt: "Aone dashboard showing live temperature and nitrogen level",
    ratio: "180/238",
    imgWidth: "w-[9.4vw]",
    caption: "Monitors temperature, nitrogen & location",
  },
  {
    src: "/how-it-works/notification-alert.gif",
    alt: "Temperature drop alert notification over the dashboard",
    ratio: "180/238",
    imgWidth: "w-[9.4vw]",
    caption: "Sends instant alerts if something is wrong",
  },
];

export default function HowItWorks() {
  return (
    <section data-howitworks className="relative h-svh overflow-hidden">
      {/* Both rows share the same clip-window height, so centering this block vertically also
          centers the gap between the rows on the section — which is where the cap sits. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div data-row="how-does" className={row}>
          <div className="h-[13.46vw] overflow-hidden">
            <p data-howitworks-word className={`${word} translate-y-full text-black/10`}>How</p>
          </div>
          <div className="h-[13.46vw] overflow-hidden">
            <p data-howitworks-word className={`${word} translate-y-full text-black/10`}>does</p>
          </div>
        </div>

        <div data-row="it-works" className={foregroundRow}>
          <div className="h-[13.46vw] overflow-hidden">
            <p data-howitworks-word className={`${word} translate-y-full text-ink`}>It</p>
          </div>
          <div className="h-[13.46vw] overflow-hidden">
            <p data-howitworks-word className={`${word} translate-y-full text-ink`}>works</p>
          </div>
        </div>
      </div>

      {/* Dead center of the section, so it lands in the gap between the two rows above. It is
          the middle layer of the stack: in front of "How does", but "It works" (z-20 above)
          rises over it as the cap settles (Figma: unrotated at the start, -30deg once it lands
          — the orange top leans left, probe to the right). It then retreats back down the way it
          came, leaving the frame before the steps below arrive; it never fades. */}
      <div
        data-howitworks-cap
        className="pointer-events-none absolute top-1/2 left-1/2 z-10 h-[62.05svh] -translate-x-1/2 -translate-y-1/2 rotate-[-30deg]"
      >
        <div className="relative h-full aspect-[478/1100]">
          <Image src="/product/cap-probe.png" alt="Cryocap smart cap and its probe" fill sizes="(min-width: 1024px) 16vw, 40vw" className="object-contain" />
        </div>
      </div>

      {/* Four-step device flow, bottom-aligned (step 1's tall can illustration sets the row's
          height; the other three simply align to its baseline). This has to be a bottom, not a
          top, alignment: install-cap.gif's own canvas reserves headroom above the bottle for the
          cap to animate through, so for most of its loop the visible bottle only fills the
          BOTTOM half of that image — but its base is pinned to the bottom of the canvas in every
          frame. Bottom-aligning the row anchors on that always-stable edge; top-aligning it would
          expose the animation's dead space above the bottle as a jumping, inconsistent gap.
          Vertical position is computed in HowItWorksScroll, which centers this grid together with
          the headline as one block rather than pinning it to the bottom of the viewport. Hidden
          until the headline has shrunk away and the cap has left the frame, then revealed one
          item at a time. */}
      <div
        data-howitworks-grid
        // no `top`/`bottom` here — HowItWorksScroll sets `top` once it has measured this
        // grid's own height, so the headline + grid read as one centered block
        className="pointer-events-none absolute inset-x-0 z-30 flex justify-center items-end gap-[3.5vw] px-gutter max-lg:flex-wrap max-lg:gap-y-10"
      >
        {steps.map((step, i) => (
          <div
            key={step.caption?.toString() ?? i}
            data-howitworks-item
            // opacity-0 until the timeline reveals it, so the steps never flash in
            // on first paint before HowItWorksScroll has parked them
            className="flex w-[15vw] flex-col items-center gap-[1.875vw] opacity-0 max-lg:w-[40vw]"
          >
            <span className={`relative ${step.imgWidth} max-lg:w-[24vw]`} style={{ aspectRatio: step.ratio }}>
              <Image src={step.src} alt={step.alt} fill unoptimized className="object-contain" />
            </span>
            <p className="text-center text-[clamp(12px,1.1vw,20px)] leading-snug text-muted">
              <span className="mr-[0.4em] font-semibold text-ink">{i + 1}.</span>
              {step.caption}
            </p>
          </div>
        ))}
      </div>

      <HowItWorksScroll />
    </section>
  );
}
