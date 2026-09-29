import Button from "@/components/ui/Button";
import Product from "@/components/Product";
import Callout from "@/components/Callout";
import StageScroll from "@/components/StageScroll";
import Solutions from "@/components/sections/Solutions";

// Progressive backdrop blur, 0 at the overlay's top edge to 34px (on the 1920 frame) at its
// bottom. Each band is a full-screen backdrop-filter layer, and the hero is pinned — so the
// content behind them moves and every band re-rasterises on every frame. Eight of those is
// fine on a desktop GPU and is a major source of stutter on a phone, so mobile gets a coarser
// ramp. The bands are rendered as two sets rather than one responsive count because this is a
// server component with no viewport to branch on.
const BLUR_MAX_VW = 34 / 19.2;
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

const sweep =
  "pointer-events-none absolute top-1/2 left-full z-20 -translate-y-1/2 text-[17.1vw] font-extrabold leading-none whitespace-nowrap will-change-transform";

const ghost = "font-extrabold uppercase leading-[0.909] whitespace-nowrap text-black/5";

export default function Hero() {
  return (
    <section data-stage className="relative h-dvh overflow-hidden">
      <div className="relative mx-auto h-dvh px-gutter">
        <div data-stage="copy" className="contents">
          <p data-intro="fade" className="absolute left-1/2 top-[13dvh] -translate-x-1/2 whitespace-nowrap text-center text-[clamp(1.125rem,1.875vw,2.25rem)] font-light lg:top-[9.3dvh]">
            World’s First Smart
          </p>

          <h1
            data-intro="fade"
            // the wordmark size lives on the h1, not the span, so the TM can be expressed
            // as a fraction of it (see below)
            className="absolute left-1/2 top-[30dvh] z-0 -translate-x-1/2 text-[max(3.5rem,min(19vw,37.96dvh))] lg:top-[15.6dvh] lg:text-[min(21.35vw,37.96dvh)]"
          >
            <span className="block bg-linear-to-b from-ink from-52% to-[#666] to-80% bg-clip-text text-[1em] font-extrabold leading-[1.26] whitespace-nowrap text-transparent">
              Cryocap
            </span>
            {/* Percentages of the h1 box, NOT `em`: `top`/`right` in em resolve against this
                span's OWN font-size, which bottoms out at its rem floor on a phone while the
                wordmark keeps shrinking — so the TM slid from a superscript down into the middle
                of the letters. Figma puts it 96/517 down the box and 14/1751 past its right
                edge; as percentages those hold at every size. */}
            <span className="absolute top-[18.57%] -right-[0.8%] text-[max(0.625rem,0.11em)] font-semibold leading-none">
              TM
            </span>
          </h1>

          {/* Frame-3 blur/fade overlay: progressive backdrop blur, 0 at its top edge to 34px (1920 frame) at its bottom. */}
          <div data-hero="white-fade" className="pointer-events-none absolute inset-x-0 top-[36dvh] z-10 h-[30dvh] lg:top-[37.1dvh] lg:h-[44.3dvh]">
            <div className="contents lg:hidden">
              <BlurRamp steps={BLUR_STEPS_MOBILE} />
            </div>
            <div className="hidden lg:contents">
              <BlurRamp steps={BLUR_STEPS_DESKTOP} />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0.6)_20%,rgba(255,255,255,0.88)_40%,#fff_68%)]" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[49dvh] z-10 h-[45dvh] bg-linear-to-b from-white/0 to-surface to-68% lg:top-[55.7dvh] lg:h-[44.3dvh]" />

        <div data-hero="grid" className="pointer-events-none absolute inset-0 z-10">
          <div className="grid-lines absolute inset-0" />
          <div className="absolute inset-x-0 top-[91dvh] h-[0.677vw] bg-[url(/textures/grid-marker.svg)] bg-[length:5.208vw_0.677vw] bg-[position:2.76vw_0] bg-repeat-x" />
        </div>

        {/* giant words that sweep right-to-left behind the can */}
        <div data-stage="sweep-problems" className={sweep}>
          PROBLEMS
        </div>
        <div data-stage="sweep-solutions" className={sweep}>
          SOLUTIONS
        </div>

        {/* ghost labels */}
        <div className="pointer-events-none absolute top-[68dvh] left-[6vw] z-10 h-[5.47vw] overflow-hidden lg:top-[75.3dvh] lg:left-[4.69vw]">
          <p data-stage="label-problems" className={`${ghost} text-[6.04vw] translate-y-full`}>
            problems
          </p>
        </div>
        <div className="pointer-events-none absolute top-[27.5dvh] right-[6vw] z-10 text-right lg:top-[15.46dvh] lg:right-[4.69vw]">
          <div className="h-[5.99vw] overflow-hidden">
            <p data-stage="label-generic" className={`${ghost} text-[6.56vw] translate-y-full`}>
              generic
            </p>
          </div>
          <div className="h-[5.99vw] overflow-hidden">
            <p data-stage="label-generic" className={`${ghost} text-[6.56vw] translate-y-full`}>
              cap
            </p>
          </div>
        </div>

        <Callout side="left" pair="a" icon="/icons/water-drop.svg" title="Nitrogen Loss Happens" description="Even well-sealed containers typically lose a small but measurable amount daily." />
        <Callout side="right" pair="a" icon="/icons/temperature.svg" title="Temperature Fluctuates" description="Nitrogen stored in a container is lost gradually as temperature fluctuations cause pressure changes and boil-off" />
        <Callout side="left" pair="b" icon="/icons/bell.svg" title="You Don’t Realize In-time" description="By the time the drop is significant enough to catch attention, a considerable amount has already escaped" />
        <Callout side="right" pair="b" icon="/icons/caution.svg" title="Semen Quality Get Affected" description="This can damage sperm membrane integrity, reduce motility, and lower overall fertility potential" />

        <Product data-intro="rise" className="absolute left-1/2 top-[24dvh] z-30 h-[40dvh] lg:top-[17.47dvh] lg:left-[50.42%] lg:h-[min(60.27dvh,33.9vw)]" />

        <div data-intro="chrome" data-stage="copy-bottom" className="absolute left-1/2 top-[70dvh] z-20 flex w-[88vw] -translate-x-1/2 flex-col items-center gap-6 lg:top-[82.7dvh] lg:w-auto lg:gap-9">
          <p className="text-center text-base text-muted lg:whitespace-nowrap lg:text-[clamp(1rem,1.04vw,1.25rem)]">
            Smart Monitoring for Safer &amp; Better Livestock Breeding
          </p>
          <div className="flex w-full justify-center gap-3 sm:w-auto sm:gap-4">
            <Button variant="outline" icon="/icons/play.svg" className="w-[calc(50%-0.375rem)] max-w-[168px] sm:w-[clamp(130px,8.75vw,168px)]">
              Watch Video
            </Button>
            <Button href="/buy" icon="/icons/cart.svg" className="w-[calc(50%-0.375rem)] max-w-[168px] sm:w-[clamp(130px,8.75vw,168px)]">
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      <Solutions />

      <StageScroll />
    </section>
  );
}
