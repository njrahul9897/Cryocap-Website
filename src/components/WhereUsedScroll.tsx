"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { addRestSection } from "@/lib/rest-points";
import { useViewportKey } from "@/lib/use-viewport-key";
import { largeViewportHeight } from "@/lib/viewport";

// Scroll distance the section stays pinned for, across three beats:
//   1. the four words reveal one by one and the mascot rises through them
//   2. the headline collapses into one small line at the top while the mascot retreats
//   3. the five location photos scroll through the centre, left to right
// ~945px per timeline unit, the pacing the how-it-works section was tuned to.
const PIN_PX = 6400;

// Figma frame 16: the mascot sits at 444x771 with its centre at (960, 564.5) on the 1920x1080
// frame. Like the cap in the other section it starts small and below the fold, then rises.
const FIGURE_PARKED_SCALE = 0.714;
// Clearance below the viewport edge at the parked end, so no sliver of it ever peeks in.
const FIGURE_PARK_CLEARANCE_VH = 0.02;

// Figma frame 17: all four words end up on ONE line at y=120, height 101 (down from 403), so
// they scale to 101/403 and fly to that line.
const SMALL_SCALE = 101 / 403;
// Where that line sits, as a fraction of viewport height.
const SMALL_LINE_CY = 0.1579;
// Word spacing on it, in multiples of the SMALL font size. Figma's four words there are just
// laid out left to right and centred on the frame: its three gaps are 25.7 / 26.4 / 26.2px
// against an 80.2px small font, i.e. a constant 0.326em, and the resulting line is centred to
// within half a pixel. So the line is BUILT that way here instead of flying each word to a
// hardcoded x-centre off the 1920 frame. Those fractions only ever described desktop: a phone
// sets the headline at 24vw rather than 16.67vw, so the same centres with 1.44x wider words
// overlapped them by up to 11px — "is" began before "Where" had finished.
const SMALL_WORD_GAP_EM = 0.326;

// Beat boundaries. Phase 1 ends at 1.38 (mascot rise starts at 0.08, runs 1.3); phase 2 opens a
// deliberate beat later; phase 3 starts the instant phase 2 lands, so the strip takes over with
// no dead zone. The strip gets the lion's share — it is five full-width photos.
const PHASE_2 = 1.5;
const PHASE_2_DUR = 0.8;
const PHASE_3 = PHASE_2 + PHASE_2_DUR;
const STRIP_DUR = 4.5;

export default function WhereUsedScroll() {
  const viewport = useViewportKey();

  useGSAP(() => {
    const section = document.querySelector<HTMLElement>("[data-whereused]");
    if (!section) return;
    // DOM order is where / is / it / used, which is also their order on the small line
    const wordBoxes = Array.from(section.querySelectorAll<HTMLElement>("[data-whereused-word]"));
    const glyphs = Array.from(section.querySelectorAll<HTMLElement>("[data-whereused-glyph]"));
    const figure = section.querySelector<HTMLElement>("[data-whereused-figure]");
    const strip = section.querySelector<HTMLElement>("[data-whereused-strip]");
    // the photo itself, not the whole figure: the caption hangs below it, and it is the photo
    // that has to come to rest dead centre.
    // NOT `:last-of-type` — that is scoped to each photo's own parent, and every figure holds
    // exactly one span, so all five matched and querySelector handed back the FIRST slide.
    const slides = Array.from(strip?.querySelectorAll<HTMLElement>("[data-whereused-slide]") ?? []);
    const lastSlide = slides[slides.length - 1];
    if (!figure || !strip || !lastSlide || wordBoxes.length === 0 || glyphs.length === 0) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // GSAP owns these transforms outright, centering included, so the markup can position each
    // element by its top-left and leave the -50%/-50% to xPercent/yPercent here. That also
    // makes each element's visual centre exactly its own `offsetLeft`/`offsetTop`.
    gsap.set([...wordBoxes, figure], { xPercent: -50, yPercent: -50 });

    // offset*, NOT getBoundingClientRect: this effect runs at mount, with the section still
    // thousands of pixels below the fold, so a viewport-relative rect would bake that scroll
    // distance into every target. offsetTop/offsetLeft are measured against the section itself
    // and so are the same whether or not it happens to be on screen.
    const centerOf = (el: HTMLElement) => ({ cx: el.offsetLeft, cy: el.offsetTop });

    // Parking the mascot fully below the fold: its scaled top edge has to clear the viewport
    // bottom, which is a viewport plus half its own scaled height, less where it already sits.
    // Against the LARGE viewport for the same reason as the how-it-works cap: the mascot's own
    // `top` and height are in dvh, so a park measured while the phone's URL bar is still showing
    // is short by the time it retracts, and the top of its head appears at the bottom edge.
    // Expressed as a fraction of the viewport so it holds at either height; on desktop lvh ===
    // dvh and this works out to exactly the number it did before.
    const lvh = largeViewportHeight();
    const grow = Math.max(1, lvh / vh);
    const figureTopFraction = centerOf(figure).cy / vh;
    const figureTravel =
      lvh * (1 - figureTopFraction + FIGURE_PARK_CLEARANCE_VH) +
      (figure.offsetHeight * grow * FIGURE_PARKED_SCALE) / 2;

    // autoAlpha: the mascot is painted hidden in the markup so it cannot appear parked in the
    // middle of the section before this runs, or between a revert and a rebuild
    gsap.set(figure, { y: figureTravel, scale: FIGURE_PARKED_SCALE, autoAlpha: 1 });

    // The small line, measured rather than tabulated: take each word at its rendered width,
    // lay the four out left to right with one constant gap, and centre the run on the viewport.
    const smallFont = parseFloat(getComputedStyle(glyphs[0]).fontSize) * SMALL_SCALE;
    const wordGap = SMALL_WORD_GAP_EM * smallFont;
    const smallWidths = wordBoxes.map((el) => el.offsetWidth * SMALL_SCALE);
    const lineWidth = smallWidths.reduce((a, b) => a + b, 0) + wordGap * (wordBoxes.length - 1);

    let cursor = vw / 2 - lineWidth / 2;
    const wordTargets = wordBoxes.map((el, i) => {
      const from = centerOf(el);
      const cx = cursor + smallWidths[i] / 2;
      cursor += smallWidths[i] + wordGap;
      return { el, x: cx - from.cx, y: SMALL_LINE_CY * vh - from.cy };
    });

    // Distance from an element's own box back up to `root`, along the offsetParent chain —
    // here all the way to the section, so it transparently absorbs whatever sits in between.
    // That matters: on a phone the strip is nested in a clip window, which becomes its
    // containing block, so its own `top` is no longer measured from the section.
    const offsetWithin = (el: HTMLElement, root: HTMLElement, axis: "top" | "left") => {
      let total = 0;
      let node: HTMLElement | null = el;
      while (node && node !== root) {
        total += axis === "top" ? node.offsetTop : node.offsetLeft;
        node = node.offsetParent as HTMLElement | null;
      }
      return total;
    };

    // How far the strip must travel to bring the LAST photo's centre onto the viewport centre —
    // left on desktop, up on a phone, where the strip is a column parked below the fold. Both
    // are measured off the laid-out DOM rather than re-deriving Figma's slide pitch in vw, so
    // the two directions share one expression and neither can drift from the CSS.
    const stripVertical = vw < 1024;
    const stripTravel = stripVertical
      ? offsetWithin(lastSlide, section, "top") + lastSlide.offsetHeight / 2 - vh / 2
      : offsetWithin(lastSlide, section, "left") + lastSlide.offsetWidth / 2 - vw / 2;

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: `+=${PIN_PX}`,
        pin: true,
        scrub: 1,
        // No anticipatePin: it pins EARLY in proportion to scroll velocity, which is why
        // arriving here fast from the hero rushed the first phase while a slow approach, or
        // scrolling back up, felt right. It exists to hide the pin flicker on a raw, jumpy
        // native scroll; Lenis already smooths the scroll, so it buys nothing here and the
        // velocity-dependent head start is all that is left of it.
        refreshPriority: -1,
      },
    });

    // Phase 1 — the headline and the mascot, and nothing else.
    tl.to(glyphs, { yPercent: -100, duration: 0.5, stagger: 0.15 }, 0);
    // the mascot trails the words by a few frames, so any hitch from the section freshly pinning
    // lands in that gap rather than reading as a stutter in the mascot itself
    tl.to(figure, { y: 0, scale: 1, duration: 1.3 }, 0.08);

    // Phase 2 — the four words fly together into one small line at the top while the mascot
    // retreats back down its entry path at full opacity, the same exit the cap makes.
    wordTargets.forEach(({ el, x, y }) => {
      tl.to(el, { x, y, scale: SMALL_SCALE, duration: PHASE_2_DUR }, PHASE_2);
    });
    tl.to(
      figure,
      { y: figureTravel, scale: FIGURE_PARKED_SCALE, duration: PHASE_2_DUR, ease: "power2.in" },
      PHASE_2,
    );

    // Phase 3 — the photo strip scrolls in and stops with the last one centred, which is where
    // the footer takes over. Linear: a scrubbed pan reads as a direct response to the gesture,
    // and any easing here would feel like drag.
    tl.to(
      strip,
      { ...(stripVertical ? { y: -stripTravel } : { x: -stripTravel }), duration: STRIP_DUR, ease: "none" },
      PHASE_3,
    );

    // Phone swipe resting points: headline + mascot landed, then each photo centred in turn
    // (the strip pans linearly, so a photo's centre maps straight onto the pan's timeline).
    const photoTimes = slides
      .map((el) =>
        stripVertical
          ? offsetWithin(el, section, "top") + el.offsetHeight / 2 - vh / 2
          : offsetWithin(el, section, "left") + el.offsetWidth / 2 - vw / 2,
      )
      .filter((travel) => travel >= 0 && travel <= stripTravel + 1)
      .map((travel) => PHASE_3 + (STRIP_DUR * travel) / stripTravel);
    const removeRest = addRestSection({
      st: tl.scrollTrigger!,
      duration: tl.duration(),
      stops: [
        // this section slides up and pins, the headline and mascot land
        { t: PHASE_2 - 0.05, seconds: 2.0 },
        // headline flies to the top, mascot leaves, the strip pans the first photo in; after
        // that each step is a plain pan of one photo
        ...photoTimes.map((t, i) => ({ t, seconds: i === 0 ? 1.5 : 0.9 })),
      ],
    });

    ScrollTrigger.refresh();
    return removeRest;
  }, { dependencies: [viewport], revertOnUpdate: true });

  return null;
}
