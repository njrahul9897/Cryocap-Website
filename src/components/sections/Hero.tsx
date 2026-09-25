import Button from "@/components/ui/Button";
import Product from "@/components/Product";
import Callout from "@/components/Callout";
import StageScroll from "@/components/StageScroll";
import Solutions from "@/components/sections/Solutions";

const BLUR_STEPS = 8;
const BLUR_MAX_VW = 34 / 19.2;

const sweep =
  "pointer-events-none absolute top-1/2 left-full z-20 -translate-y-1/2 text-[17.1vw] font-extrabold leading-none whitespace-nowrap will-change-transform";

const ghost = "font-extrabold uppercase leading-[0.909] whitespace-nowrap text-black/5";

export default function Hero() {
  return (
    <section data-stage className="relative h-svh overflow-hidden">
      <div className="relative mx-auto flex h-svh flex-col items-center px-gutter pt-28 pb-24 lg:block lg:pt-0 lg:pb-0">
        <div data-stage="copy" className="contents">
          <p data-intro="fade" className="text-center text-[clamp(1.125rem,1.875vw,2.25rem)] font-light lg:absolute lg:left-1/2 lg:top-[9.3svh] lg:-translate-x-1/2 lg:whitespace-nowrap">
            World’s First Smart
          </p>

          <h1 data-intro="fade" className="relative z-0 mt-2 lg:absolute lg:left-1/2 lg:top-[15.6svh] lg:mt-0 lg:-translate-x-1/2">
            <span className="block bg-linear-to-b from-ink from-52% to-[#666] to-80% bg-clip-text text-[max(3.5rem,min(19vw,37.96svh))] font-extrabold lg:text-[min(21.35vw,37.96svh)] leading-[1.26] whitespace-nowrap text-transparent">
              Cryocap
            </span>
            <span className="absolute top-[2.3em] -right-[0.3em] text-[max(0.875rem,min(2.35vw,4.18svh))] font-semibold leading-none">
              TM
            </span>
          </h1>

          {/* Frame-3 blur/fade overlay: progressive backdrop blur, 0 at its top edge to 34px (1920 frame) at its bottom. */}
          <div data-hero="white-fade" className="pointer-events-none absolute inset-x-0 top-[37.1svh] z-10 hidden h-[44.3svh] lg:block">
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
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[55.7svh] z-10 hidden h-[44.3svh] bg-linear-to-b from-white/0 to-surface to-68% lg:block" />

        <div data-hero="grid" className="pointer-events-none absolute inset-0 z-10">
          <div className="grid-lines absolute inset-0" />
          <div className="absolute inset-x-0 top-[91svh] h-[0.677vw] bg-[url(/textures/grid-marker.svg)] bg-[length:5.208vw_0.677vw] bg-[position:2.76vw_0] bg-repeat-x" />
        </div>

        {/* giant words that sweep right-to-left behind the can */}
        <div data-stage="sweep-problems" className={sweep}>
          PROBLEMS
        </div>
        <div data-stage="sweep-solutions" className={sweep}>
          SOLUTIONS
        </div>

        {/* ghost labels */}
        <div className="pointer-events-none absolute top-[75.3svh] left-[4.69vw] z-10 h-[5.47vw] overflow-hidden">
          <p data-stage="label-problems" className={`${ghost} text-[6.04vw] translate-y-full`}>
            problems
          </p>
        </div>
        <div className="pointer-events-none absolute top-[15.46svh] right-[4.69vw] z-10 text-right">
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

        <Product data-intro="rise" className="z-30 mt-3 h-[40svh] lg:absolute lg:top-[17.47svh] lg:left-[50.42%] lg:mt-0 lg:h-[min(60.27svh,52vw)] lg:-translate-x-1/2" />

        <div data-intro="chrome" data-stage="copy-bottom" className="relative z-20 mt-6 flex flex-col items-center gap-6 lg:absolute lg:left-1/2 lg:top-[82.7svh] lg:mt-0 lg:-translate-x-1/2 lg:gap-9">
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
