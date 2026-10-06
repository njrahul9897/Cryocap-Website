"use client";

import { useEffect, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useViewportKey } from "@/lib/use-viewport-key";
import { addRestPoints, timesToScroll } from "@/lib/rest-points";

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
// How long a problem pair holds before it is dismissed. Desktop keeps the long read; on a
// phone the three pairs have to turn over about one swipe apart, which is what the shorter
// hold buys — a pair's pitch (hold + 0.4 dismiss + 0.1 gap) then lands near 500px of scroll
// instead of the ~960px that took two or three flicks to get through.
const PAIR_HOLD_DESKTOP = 3.2;
const PAIR_HOLD_MOBILE = 1.4;
const PAIR_GAP = 0.1;
const FIRST_PAIR_AT = 4.8;
// Total beats, derived rather than written down: three pair holds, then the solutions beat and
// the cards' own travel, plus a short tail. Hard-coding it meant a shorter hold would leave the
// difference as dead scroll at the end of the pin.
const stageBeats = (hold: number) =>
  FIRST_PAIR_AT + 3 * hold + 2 * (0.4 + PAIR_GAP) + 4.5 + CARD_SCROLL + 0.2;

export default function StageScroll() {
  const [ready, setReady] = useState(false);
  const viewport = useViewportKey();

  useEffect(() => {
    const go = () => setReady(true);
    window.addEventListener(INTRO_DONE_EVENT, go, { once: true });
    if (document.documentElement.dataset.introDone) go();
    return () => window.removeEventListener(INTRO_DONE_EVENT, go);
  }, []);

  useGSAP(
    () => {
      // No `built` latch any more: this has to be free to run again, because `revertOnUpdate`
      // tears the whole timeline down and rebuilds it whenever the viewport changes size.
      if (!ready) return;

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
      const c = pair("c");

      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const desktop = vw >= 1024;
      const PAIR_HOLD = desktop ? PAIR_HOLD_DESKTOP : PAIR_HOLD_MOBILE;
      const TOTAL = stageBeats(PAIR_HOLD);

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

      gsap.set(
        [...a.icons, ...a.titles, ...a.descs, ...b.icons, ...b.titles, ...b.descs, ...c.icons, ...c.titles, ...c.descs],
        { yPercent: -130, autoAlpha: 0, filter: "blur(0px)" },
      );
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
          // Keep anticipatePin: without it the pin lands a frame late on a fast scroll and the
          // next section flashes through underneath. Removing it did smooth the rushed entry,
          // but that trade was not worth a visible overlap.
          anticipatePin: 1,
          // this pin is built late (it waits for the intro reveal) but sits first on the page,
          // so it has to refresh before the sections below or their start/end land wrong
          refreshPriority: 1,
        },
        // On the TIMELINE, not the ScrollTrigger. The trigger's onUpdate only fires when the
        // scroll position changes, but `scrub: 1` keeps the cards gliding for up to a second
        // after that stops — so the zoom froze mid-glide (measured: cards still travelling
        // ~95px with the scale stuck) and then snapped on the next swipe, which on a phone is
        // the stutter that made the cards hard to read. The timeline updates on every frame
        // the cards actually move.
        //
        // Desktop only. Each card scales about its own centre by a different amount, so while
        // the stack travels the gaps between cards stretch and squeeze — on a phone, where the
        // cards are nearly full-width, that reads as a rolling-shutter wobble and strains the
        // eye. There the stack moves as one rigid block (composited, see Solutions.tsx).
        onUpdate: desktop ? cardZoom : undefined,
      });

      // On mobile the hero parks the can above centre, to tighten the space under the tagline.
      // From the moment the cap leaves onward it should sit centred instead. Measure how far
      // above centre it actually rests rather than repeating the hero's offset here, where it
      // would silently drift the next time that value is tuned. `offsetTop` is used, not a
      // viewport rect, so this is independent of where the page happens to be scrolled.
      // Desktop deliberately does NOT centre it — that composition comes straight from Figma.
      const productCentre = product.offsetTop + product.offsetHeight / 2;
      const heroLift = desktop ? 0 : vh / 2 - productCentre;

      // 1. hero copy scrolls away, cap lifts out along the can axis (collar branding goes with it), then the can straightens.
      // The can is tilted 15deg, so the cap pulls out along that same axis — up AND to the right — not straight up.
      // (Figma frames 2 -> 4 move the cap by +286x / -1020y, i.e. ~15deg off vertical.)
      tl.to(copy, { y: -copyTravel, duration: 1.0 }, 0);
      tl.to(cap, { x: capLift * axisX, y: -capLift, duration: 1.0 }, 0.1);
      tl.to(canPlain, { autoAlpha: 1, duration: 0.4 }, 0.3);
      tl.to(product, { rotation: -15, scale: desktop ? 1 : 0.95, y: heroLift, duration: 0.8 }, 1.0);

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

      // 5. callout pairs A, B, C in turn, each held long enough to read its (now two-sentence)
      // description before the next one replaces it.
      const reveal = (p: ReturnType<typeof pair>, at: number) => {
        tl.to(p.icons, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out" }, at);
        tl.to(p.titles, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out" }, at + 0.05);
        tl.to(p.descs, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out" }, at + 0.15);
      };
      const dismiss = (p: ReturnType<typeof pair>, at: number) => {
        tl.to([...p.icons, ...p.titles, ...p.descs], { yPercent: -130, autoAlpha: 0, filter: "blur(6px)", duration: 0.4, ease: "power2.in" }, at);
      };
      // Three equal holds with a 0.1s beat between a dismiss landing and the next pair's
      // reveal starting, same gap the original two-pair timeline used.
      const aAt = FIRST_PAIR_AT;
      const bAt = aAt + PAIR_HOLD + 0.4 + PAIR_GAP;
      const cAt = bAt + PAIR_HOLD + 0.4 + PAIR_GAP;
      const dismissCAt = cAt + PAIR_HOLD;
      reveal(a, aAt);
      dismiss(a, aAt + PAIR_HOLD);
      reveal(b, bAt);
      dismiss(b, bAt + PAIR_HOLD);
      reveal(c, cAt);
      dismiss(c, dismissCAt);
      tl.to([labelProblems, ...labelGeneric], { yPercent: -200, duration: 0.5 }, dismissCAt);
      tl.to(lines, { scaleX: 0, duration: 0.4, ease: "power2.in" }, dismissCAt + 0.2);

      // 6. generic cap lifts away; can stands up and moves to the solutions position.
      // The wrapper is back at 0 here (can tilted), so this reads as the 15deg diagonal lift
      // the design shows in frames 6 -> 7 (+169x / -607y).
      tl.to(generic, { ...genParked, duration: 0.6, ease: "power2.in" }, dismissCAt + 0.2);
      tl.to(genericShadow, { autoAlpha: 0, duration: 0.3 }, dismissCAt + 0.2);
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
          // Desktop slides it down a touch into the Figma solutions position. Mobile keeps it
          // dead centre — where it has been since the cap came out — rather than riding up as
          // the generic cap leaves; the cards scroll over it from there.
          y: heroLift + (desktop ? 0.0307 * vh : 0),
          duration: 1.0,
        },
        dismissCAt + 0.8,
      );

      // 7. Cryocap cap returns (branding with it), then SOLUTIONS sweeps across.
      // The wrapper sits at -15deg here, so unwinding the tilted lift reads as a straight drop on screen.
      tl.to(cap, { x: 0, y: 0, duration: 0.6, ease: "power2.in" }, dismissCAt + 2.2);
      tl.to(canPlain, { autoAlpha: 0, duration: 0.3 }, dismissCAt + 2.6);
      tl.to(sweepSolutions, { x: -(vw + sweepSolutions.offsetWidth), duration: 1.6, ease: "none" }, dismissCAt + 3.2);

      // 8. Solutions: the ghost wordmark slides up out of its clip window, then the six cards
      // ride up the right-hand side past the parked can. The travel is measured off the real
      // stack height so every card clears the top whatever the viewport.
      tl.to(solutionsWord, { yPercent: -100, duration: 0.6 }, dismissCAt + 4.0);
      // Parked a clear margin below the stage (not flush with the fold, which left the top
      // card's ring showing) and held hidden until the solutions beat actually starts.
      gsap.set(solutionsCards, { y: stage.offsetHeight * 1.1, autoAlpha: 0 });
      tl.set(solutionsCards, { autoAlpha: 1 }, dismissCAt + 4.2);
      tl.to(solutionsCards, { y: -solutionsCards.offsetHeight, duration: CARD_SCROLL, ease: "none" }, dismissCAt + 4.5);
      if (desktop) cardZoom();

      tl.to({}, { duration: 0.2 }, TOTAL - 0.2);

      // Resting points for phone swipe stepping (swipe-steps.ts): the hero, each problem pair
      // in the middle of its hold, the Cryocap cap back on the can, then the cards a screenful
      // at a time.
      const cardsFrom = stage.offsetHeight * 1.1;
      const cardsTo = -solutionsCards.offsetHeight;
      const cardsAt = dismissCAt + 4.5;
      // Column translate -> timeline time, inverting the linear card tween above.
      const cardTime = (y: number) => cardsAt + (CARD_SCROLL * (y - cardsFrom)) / (cardsTo - cardsFrom);
      // Clear of the header above and the bottom bar below.
      const bandTop = 0.1 * vh;
      const bandBottom = 0.9 * vh;
      const pageTimes: number[] = [];
      for (let i = 0; i < solutionCards.length; ) {
        const top = solutionCards[i].offsetTop;
        let j = i;
        while (
          j + 1 < solutionCards.length &&
          solutionCards[j + 1].offsetTop + solutionCards[j + 1].offsetHeight - top <= bandBottom - bandTop
        ) {
          j++;
        }
        const bottom = solutionCards[j].offsetTop + solutionCards[j].offsetHeight;
        // centre the page of cards in the band
        pageTimes.push(cardTime((bandTop + bandBottom) / 2 - (top + bottom) / 2));
        i = j + 1;
      }
      // a pair is fully in 0.6 after its reveal starts; rest midway between that and its dismiss
      const pairRest = (at: number) => at + (0.6 + PAIR_HOLD) / 2;
      const restTimes = [0, pairRest(aAt), pairRest(bAt), pairRest(cAt), dismissCAt + 3.0, ...pageTimes];
      const st = tl.scrollTrigger!;
      const removeRest = addRestPoints(() => timesToScroll(st, tl.duration(), restTimes));

      ScrollTrigger.refresh();
      return removeRest;
    },
    { dependencies: [ready, viewport], revertOnUpdate: true },
  );

  return null;
}
