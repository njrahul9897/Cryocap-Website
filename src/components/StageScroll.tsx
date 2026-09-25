"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export const INTRO_DONE_EVENT = "cryocap:intro-done";

// Scroll-scrubbed choreography for the hero -> problems -> solutions handoff.
// Times are seconds in the prototype video (offset so 0 = the moment scrolling starts, ~15.5s);
// SECONDS_TO_PX converts them into pinned scroll distance.
const SECONDS_TO_PX = 260;
// The solutions cards need roughly a stack-height plus a viewport of travel; 10 beats of
// scroll gives them a readable pace without the pin dragging on.
const CARD_SCROLL = 10;
// how much a card swells as it crosses the middle of the screen
const CARD_ZOOM = 0.08;
const TOTAL = 26;

export default function StageScroll() {
  const [ready, setReady] = useState(false);
  const built = useRef(false);

  useEffect(() => {
    const go = () => setReady(true);
    window.addEventListener(INTRO_DONE_EVENT, go, { once: true });
    if (document.documentElement.dataset.introDone) go();
    return () => window.removeEventListener(INTRO_DONE_EVENT, go);
  }, []);

  useGSAP(
    () => {
      if (!ready || built.current) return;
      built.current = true;

      const stage = document.querySelector<HTMLElement>("[data-stage]")!;
      const q = (sel: string) => Array.from(stage.querySelectorAll<HTMLElement>(sel));
      const one = (sel: string) => stage.querySelector<HTMLElement>(sel)!;

      const copy = q("[data-stage='copy'] > *, [data-stage='copy-bottom']");
      const product = one("[data-product]");
      const cap = q("[data-product-cap], [data-product-cap-top]");
      const canPlain = one("[data-product-can-plain]");
      const generic = q("[data-product-generic-foam], [data-product-generic-top]");
      const genericShadow = one("[data-product-generic-shadow]");
      const sweepProblems = one("[data-stage='sweep-problems']");
      const sweepSolutions = one("[data-stage='sweep-solutions']");
      const solutionsCards = one("[data-solutions='cards']");
      const solutionsWord = one("[data-solutions='word']");
      const solutionCards = q("[data-solution-card]");
      const labelProblems = one("[data-stage='label-problems']");
      const labelGeneric = q("[data-stage='label-generic']");
      const lines = q("[data-callout-line]");
      const pair = (id: string) => ({
        icons: q(`[data-callout='${id}'] [data-callout-icon]`),
        titles: q(`[data-callout='${id}'] [data-callout-title]`),
        descs: q(`[data-callout='${id}'] [data-callout-desc]`),
      });
      const a = pair("a");
      const b = pair("b");

      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const desktop = vw >= 1024;

      // Both caps travel along the can's own 15deg axis. Whether that reads as a straight drop
      // or a diagonal lift on screen depends on how far the wrapper is counter-rotated at that
      // moment, which is what makes the motion look physical either way.
      const axisX = Math.tan(Math.PI / 12);
      const capLift = 1.1 * vh;
      // One shared distance for both generic layers: yPercent is a % of each element's OWN
      // height, so the cap and its foam stem used to travel 566u vs 105u and visibly separate.
      const genLift = 0.87 * product.offsetHeight;
      const genParked = { x: genLift * axisX, y: -genLift, autoAlpha: 0 };

      // The hero copy has to clear the top of the viewport outright. The CTA row sits lowest
      // and its height barely scales with the viewport, so the design's flat -1020/1080 of
      // frame height (which clears by only ~13px at 1080) leaves the buttons peeking on any
      // shorter screen. Measure the row's layout bottom instead and keep that clearance.
      const copyBottomEl = one("[data-stage='copy-bottom']");
      let copyBottomY = copyBottomEl.offsetHeight;
      for (let el: HTMLElement | null = copyBottomEl; el && el !== stage; el = el.offsetParent as HTMLElement | null) {
        copyBottomY += el.offsetTop;
      }
      // A hairline clearance is not enough: at every viewport the design's own margin works
      // out to ~10px, which browser chrome, fractional scaling or a scrollbar can eat. Push
      // the row a comfortable distance past the top — it is off-screen either way.
      const copyTravel = Math.max(0.944 * vh, copyBottomY + Math.max(0.06 * vh, 48));

      gsap.set([...a.icons, ...a.titles, ...a.descs, ...b.icons, ...b.titles, ...b.descs], { yPercent: -130, autoAlpha: 0, filter: "blur(0px)" });
      gsap.set(generic, genParked);
      // the contact shadow stays put on the can — it is cast onto the shoulder, so it fades in
      // as the cap makes contact rather than travelling with it
      gsap.set(genericShadow, { autoAlpha: 0 });

      // Each card swells as it passes the middle of the screen and settles back to its normal
      // size on the way out. Measured off the column's own rect plus each card's layout offset
      // rather than its bounding box, so the scale we write never feeds back into the input.
      // Offsets are layout constants, so read them once here: the per-tick loop then does a
      // single rect read and pure maths, instead of interleaving reads with the scale writes.
      const cardOffsets = solutionCards.map((el) => el.offsetTop + el.offsetHeight / 2);
      const cardZoom = () => {
        const mid = window.innerHeight / 2;
        const top = solutionsCards.getBoundingClientRect().top;
        solutionCards.forEach((el, i) => {
          const d = Math.min(1, Math.abs(top + cardOffsets[i] - mid) / mid);
          gsap.set(el, { scale: 1 + CARD_ZOOM * Math.cos((Math.PI / 2) * d) });
        });
      };

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: `+=${TOTAL * SECONDS_TO_PX}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          // this pin is built late (it waits for the intro reveal) but sits first on the page,
          // so it has to refresh before the sections below or their start/end land wrong
          refreshPriority: 1,
          onUpdate: cardZoom,
        },
      });

      // 1. hero copy scrolls away, cap lifts out along the can axis (collar branding goes with it), then the can straightens.
      // The can is tilted 15deg, so the cap pulls out along that same axis — up AND to the right — not straight up.
      // (Figma frames 2 -> 4 move the cap by +286x / -1020y, i.e. ~15deg off vertical.)
      tl.to(copy, { y: -copyTravel, duration: 1.0 }, 0);
      tl.to(cap, { x: capLift * axisX, y: -capLift, duration: 1.0 }, 0.1);
      tl.to(canPlain, { autoAlpha: 1, duration: 0.4 }, 0.3);
      tl.to(product, { rotation: -15, scale: desktop ? 1 : 0.95, duration: 0.8 }, 1.0);

      // 2. generic cap drops in. The wrapper is counter-rotated to -15deg here (can upright),
      // so unwinding the tilted offset reads as a straight drop onto the neck.
      tl.to(generic, { x: 0, y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.in" }, 2.0);
      // shadow lands with the cap: it is only there once the cap touches down at 2.5
      tl.to(genericShadow, { autoAlpha: 1, duration: 0.25 }, 2.3);

      // 3. can tilts back and grows while PROBLEMS sweeps across behind it
      tl.to(product, { rotation: 0, scale: desktop ? 1.236 : 1.05, duration: 0.6 }, 2.5);
      tl.to(sweepProblems, { x: -(vw + sweepProblems.offsetWidth), duration: 1.6, ease: "none" }, 2.5);

      // 4. ghost labels + leader lines
      tl.to(labelProblems, { yPercent: -100, duration: 0.5 }, 4.0);
      tl.to(labelGeneric, { yPercent: -100, duration: 0.5, stagger: 0.1 }, 4.0);
      tl.to(lines, { scaleX: 1, duration: 0.5, ease: "power2.out" }, 4.2);

      // 5. callout pair A in, out; pair B in, out
      const reveal = (p: ReturnType<typeof pair>, at: number) => {
        tl.to(p.icons, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out" }, at);
        tl.to(p.titles, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out" }, at + 0.05);
        tl.to(p.descs, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out" }, at + 0.15);
      };
      const dismiss = (p: ReturnType<typeof pair>, at: number) => {
        tl.to([...p.icons, ...p.titles, ...p.descs], { yPercent: -130, autoAlpha: 0, filter: "blur(6px)", duration: 0.4, ease: "power2.in" }, at);
      };
      reveal(a, 4.8);
      dismiss(a, 7.0);
      reveal(b, 7.5);
      dismiss(b, 11.0);
      tl.to([labelProblems, ...labelGeneric], { yPercent: -200, duration: 0.5 }, 11.0);
      tl.to(lines, { scaleX: 0, duration: 0.4, ease: "power2.in" }, 11.2);

      // 6. generic cap lifts away; can stands up and moves to the solutions position.
      // The wrapper is back at 0 here (can tilted), so this reads as the 15deg diagonal lift
      // the design shows in frames 6 -> 7 (+169x / -607y).
      tl.to(generic, { ...genParked, duration: 0.6, ease: "power2.in" }, 11.2);
      tl.to(genericShadow, { autoAlpha: 0, duration: 0.3 }, 11.2);
      // Figma frame 8/9 puts the upright can at x=306.31 y=209.01, 342.77 x 685.54 in the
      // 1920x1080 frame. Against the hero can (293.29 wide, centre 968.03/518.14) that is a
      // 1.1687 scale and a centre move of -491.6 / +33.1 — solved through the wrapper's own
      // centre, since the can does not sit at the centre of the product box.
      tl.to(
        product,
        {
          rotation: -15,
          scale: desktop ? 1.1687 : 0.9,
          x: desktop ? -0.256 * vw : 0,
          y: desktop ? 0.0307 * vh : -0.08 * vh,
          duration: 1.0,
        },
        11.8,
      );

      // 7. Cryocap cap returns (branding with it), then SOLUTIONS sweeps across.
      // The wrapper sits at -15deg here, so unwinding the tilted lift reads as a straight drop on screen.
      tl.to(cap, { x: 0, y: 0, duration: 0.6, ease: "power2.in" }, 13.2);
      tl.to(canPlain, { autoAlpha: 0, duration: 0.3 }, 13.6);
      tl.to(sweepSolutions, { x: -(vw + sweepSolutions.offsetWidth), duration: 1.6, ease: "none" }, 14.2);

      // 8. Solutions: the ghost wordmark slides up out of its clip window, then the six cards
      // ride up the right-hand side past the parked can. The travel is measured off the real
      // stack height so every card clears the top whatever the viewport.
      tl.to(solutionsWord, { yPercent: -100, duration: 0.6 }, 15.0);
      // Parked a clear margin below the stage (not flush with the fold, which left the top
      // card's ring showing) and held hidden until the solutions beat actually starts.
      gsap.set(solutionsCards, { y: stage.offsetHeight * 1.1, autoAlpha: 0 });
      tl.set(solutionsCards, { autoAlpha: 1 }, 15.2);
      tl.to(solutionsCards, { y: -solutionsCards.offsetHeight, duration: CARD_SCROLL, ease: "none" }, 15.5);
      cardZoom();

      tl.to({}, { duration: 0.2 }, TOTAL - 0.2);

      ScrollTrigger.refresh();
    },
    { dependencies: [ready] },
  );

  return null;
}
