"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis-store";
import { INTRO_DONE_EVENT } from "@/components/StageScroll";

// Module-level so it resets on a full page load but persists across client-side navigations.
let played = false;

// Timings (seconds) measured frame-by-frame from the Figma prototype recording.
// The bars open in one continuous sweep; the phrases play inside it through a masked window.
const T = {
  bars: { from: 0.002, dur: 9.4, ease: "sine.inOut" },
  phrases: [
    { enter: 1.1, exit: 2.65 },
    { enter: 3.65, exit: 5.4 },
    { enter: 6.35, exit: 8.1 },
  ],
  // per-letter stagger: last letter leads on the way in, first letter leads on the way out
  letterDur: 0.75,
  stagger: 0.045,
  // wordmark + tagline slide down into place while fading in
  heroFade: { at: 10.05, dur: 1.6, fromY: -0.127 },
  chromeFade: { at: 10.15, dur: 0.6 },
  // can rises from below, drifting right and settling into its 15deg tilt
  productRise: { at: 10.3, dur: 1.5, fromX: -0.044, fromRotation: -10 },
  // once the can lands: the blurring white fade rises over the wordmark's lower half, grid slides up
  settle: { at: 11.6, fadeFromTop: "85.3svh", fadeToTop: "37.1svh", fadeDur: 0.6, gridDur: 0.9 },
};

function shouldSkip() {
  return played || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Letters({ text }: { text: string }) {
  return text.split("").map((ch, i) => (
    <span key={i} data-letter className="inline-block">
      {ch === " " ? "\u00A0" : ch}
    </span>
  ));
}

export default function IntroReveal() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const done = () => {
        document.documentElement.dataset.introDone = "1";
        window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      };
      if (shouldSkip()) {
        el.style.display = "none";
        done();
        return;
      }

      const html = document.documentElement;
      html.style.overflow = "hidden";
      window.scrollTo(0, 0);

      // Selector strings would be scoped to `root`; these live in the page outside it.
      const pick = (kind: string) => Array.from(document.querySelectorAll<HTMLElement>(`[data-intro='${kind}']`));
      const fade = pick("fade");
      const chrome = pick("chrome");
      const rise = pick("rise");
      gsap.set(chrome, { autoAlpha: 0 });
      gsap.set(fade, { autoAlpha: 0, y: T.heroFade.fromY * window.innerHeight });
      gsap.set(rise, {
        yPercent: 115,
        x: T.productRise.fromX * window.innerWidth,
        rotation: T.productRise.fromRotation,
        autoAlpha: 0,
      });

      const whiteFade = document.querySelector<HTMLElement>("[data-hero='white-fade']");
      const grid = document.querySelector<HTMLElement>("[data-hero='grid']");
      if (whiteFade) gsap.set(whiteFade, { top: T.settle.fadeFromTop });
      if (grid) gsap.set(grid, { yPercent: 100 });

      const phrases = Array.from(el.querySelectorAll<HTMLElement>("[data-phrase]"));
      const letters = phrases.map((ph) => Array.from(ph.querySelectorAll<HTMLElement>("[data-letter]")));
      // travel the full mask-window height so every glyph (including the small TM) clears it
      const travel = el.querySelector<HTMLElement>("[data-window]")!.clientHeight;
      gsap.set(letters.flat(), { y: travel });
      gsap.set("[data-bar='top']", { yPercent: -100 * T.bars.from });
      gsap.set("[data-bar='bottom']", { yPercent: 100 * T.bars.from });

      const tl = gsap.timeline({
        onComplete: () => {
          el.style.display = "none";
          html.style.overflow = "";
          getLenis()?.start();
          played = true;
          done();
        },
      });

      tl.call(() => getLenis()?.stop(), [], 0.05);
      tl.to("[data-bar='top']", { yPercent: -100, duration: T.bars.dur, ease: T.bars.ease }, 0);
      tl.to("[data-bar='bottom']", { yPercent: 100, duration: T.bars.dur, ease: T.bars.ease }, 0);

      T.phrases.forEach((p, i) => {
        tl.to(
          letters[i],
          { y: 0, duration: T.letterDur, ease: "power2.out", stagger: { each: T.stagger, from: "end" } },
          p.enter,
        );
        tl.to(
          letters[i],
          { y: -travel, duration: T.letterDur, ease: "power2.in", stagger: { each: T.stagger, from: "start" } },
          p.exit,
        );
      });

      tl.to(fade, { autoAlpha: 1, y: 0, duration: T.heroFade.dur, ease: "reveal" }, T.heroFade.at);
      tl.to(chrome, { autoAlpha: 1, duration: T.chromeFade.dur, ease: "power1.out" }, T.chromeFade.at);
      tl.to(rise, { yPercent: 0, x: 0, rotation: 0, duration: T.productRise.dur, ease: "sine.out" }, T.productRise.at);
      tl.to(rise, { autoAlpha: 1, duration: 0.3, ease: "none" }, T.productRise.at);

      if (whiteFade) tl.to(whiteFade, { top: T.settle.fadeToTop, duration: T.settle.fadeDur, ease: "power2.inOut" }, T.settle.at);
      if (grid) tl.to(grid, { yPercent: 0, duration: T.settle.gridDur, ease: "power2.out" }, T.settle.at);

      return () => {
        html.style.overflow = "";
        getLenis()?.start();
      };
    },
    { scope: root },
  );

  const word =
    "absolute inset-0 flex items-center justify-center text-[clamp(2rem,min(8.5svh,11vw),5.75rem)] font-semibold leading-none whitespace-nowrap";

  return (
    <>
      <div ref={root} id="intro" className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
        <div data-window className="absolute inset-x-0 top-1/2 h-[20.4svh] -translate-y-1/2 overflow-hidden">
          <div data-phrase className={word}>
            <Letters text="World’s First" />
          </div>
          <div data-phrase className={word}>
            <Letters text="Smart" />
          </div>
          <div data-phrase className={word}>
            <Letters text="Cryocap" />
            <span data-letter className="relative -top-[0.62em] ml-[0.08em] inline-block text-[0.24em] tracking-tight">
              TM
            </span>
          </div>
        </div>

        <div data-bar="top" className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
        <div data-bar="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      </div>
    </>
  );
}
