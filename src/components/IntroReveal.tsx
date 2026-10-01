"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
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
  // The frost slides up into its resting place. That rest position is a responsive CSS
  // class, so this animates a TRANSFORM offset down from it rather than tweening `top`:
  // `top` is a layout property, and this element carries a stack of backdrop-filter
  // layers, so moving it that way re-rasterised every blur band on every frame — which is
  // a large part of why the intro stuttered on a phone. Offsets are how far below its
  // rest position it starts (Figma has it entering from 85.3dvh).
  settle: { at: 11.6, fadeFromDesktop: 0.853 - 0.371, fadeFromMobile: 0.853 - 0.36, fadeDur: 0.6, gridDur: 0.9 },
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
      const html = document.documentElement;
      // The scroll lock ships in the server-rendered markup (RootLayout's data-intro-pending,
      // and the rule it drives in globals.css) instead of being applied here, so all this has
      // to do is let go of it. A lock applied from an effect does not exist until hydration,
      // which is seconds away on a mid-range phone — long enough to scroll the whole page out
      // from under the intro. Every exit path runs through done(), so unlocking here covers
      // the reduced-motion skip as well as the finished timeline.
      const unlock = () => html.removeAttribute("data-intro-pending");
      const done = () => {
        unlock();
        html.dataset.introDone = "1";
        window.dispatchEvent(new Event(INTRO_DONE_EVENT));
        // The document is clamped to one viewport while the intro runs, so every trigger built
        // during it — HowItWorks, WhereUsed, Footer all build on mount, not on this event —
        // measured against a page with no scrollable height. Re-measure once the real height is
        // back and the listeners above have built whatever they build off this event.
        requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      // Selector strings would be scoped to `root`; these live in the page outside it.
      const pick = (kind: string) => Array.from(document.querySelectorAll<HTMLElement>(`[data-intro='${kind}']`));
      const fade = pick("fade");
      const chrome = pick("chrome");
      const rise = pick("rise");
      const grid = document.querySelector<HTMLElement>("[data-hero='grid']");

      // Everything this reveals now rests HIDDEN in its own markup, so that none of it can paint
      // in place for the moment before this effect runs. That makes an explicit settled state
      // necessary for the path where there is no intro to reveal it — a client-side return to
      // the page, or prefers-reduced-motion. The xPercent matters as much as the opacity here:
      // the can is centred by GSAP rather than by a `-translate-x-1/2` class, so skipping the
      // intro used to leave it sitting half its own width right of centre.
      const settle = () => {
        gsap.set([...fade, ...chrome], { autoAlpha: 1, y: 0 });
        gsap.set(rise, { xPercent: -50, yPercent: 0, x: 0, rotation: 0, autoAlpha: 1 });
        if (grid) gsap.set(grid, { yPercent: 0, autoAlpha: 1 });
      };

      if (shouldSkip()) {
        el.style.display = "none";
        settle();
        done();
        return;
      }

      window.scrollTo(0, 0);
      // Re-assert the lock rather than assuming the markup's copy survived. The cleanup below
      // releases it, and React remounts this effect on every StrictMode pass — without this the
      // first cleanup drops the lock for good and the intro plays over a scrollable page.
      html.setAttribute("data-intro-pending", "");

      gsap.set(chrome, { autoAlpha: 0 });
      gsap.set(fade, { autoAlpha: 0, y: T.heroFade.fromY * window.innerHeight });
      // xPercent, NOT a `-translate-x-1/2` class. Tailwind v4 emits that as the standalone
      // `translate` property, and the moment GSAP takes over this element's transform it sets
      // `translate: none` — so the -50% was being thrown away and the can came to rest half its
      // own width RIGHT of where `left-[50.42%]` is meant to centre it. The product is now
      // absolutely centred at every breakpoint, so this applies unconditionally.
      gsap.set(rise, {
        xPercent: -50,
        yPercent: 115,
        x: T.productRise.fromX * window.innerWidth,
        rotation: T.productRise.fromRotation,
        autoAlpha: 0,
      });

      const whiteFade = document.querySelector<HTMLElement>("[data-hero='white-fade']");
      // The frost rests at a different height on each breakpoint, because the wordmark it fades
      // does. Leaving `top` to the responsive class and animating only the offset keeps that
      // difference in CSS where it belongs.
      const fadeFrom = window.innerWidth >= 1024 ? T.settle.fadeFromDesktop : T.settle.fadeFromMobile;
      if (whiteFade) gsap.set(whiteFade, { y: fadeFrom * window.innerHeight });
      if (grid) gsap.set(grid, { yPercent: 100, autoAlpha: 1 });

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

      if (whiteFade) tl.to(whiteFade, { y: 0, duration: T.settle.fadeDur, ease: "power2.inOut" }, T.settle.at);
      if (grid) tl.to(grid, { yPercent: 0, duration: T.settle.gridDur, ease: "power2.out" }, T.settle.at);

      return () => {
        unlock();
        getLenis()?.start();
      };
    },
    { scope: root },
  );

  const word =
    "absolute inset-0 flex items-center justify-center text-[clamp(2rem,min(8.5dvh,11vw),5.75rem)] font-semibold leading-none whitespace-nowrap";

  return (
    <>
      {/* touch-none, and NOT pointer-events-none, is what actually holds a real phone still.
          Chrome on Android decides whether a swipe scrolls on the compositor thread, so a
          main-thread touchmove handler can lose the race while GSAP has the main thread busy
          animating this very overlay — which is why the lock held under emulation (where
          touches go through the main thread) but not on a real device. touch-action is
          resolved from the element the finger actually hits, so letting this full-screen
          overlay be that element blocks the pan before the compositor ever starts one. It is
          display:none'd the moment the intro finishes, so nothing below it stays blocked. */}
      <div ref={root} id="intro" className="fixed inset-0 z-[100] touch-none" aria-hidden="true">
        <div data-window className="absolute inset-x-0 top-1/2 h-[20.4dvh] -translate-y-1/2 overflow-hidden">
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
