"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

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
// they scale to 101/403 and fly to these centres — fractions of the frame, x measured against
// its width and y against its height, keyed by the same ids the markup uses.
const SMALL_SCALE = 101 / 403;
const SMALL_CENTERS: Record<string, { cx: number; cy: number }> = {
  where: { cx: 0.3737, cy: 0.1579 },
  is: { cx: 0.482, cy: 0.1579 },
  it: { cx: 0.5328, cy: 0.1579 },
  used: { cx: 0.6331, cy: 0.1579 },
};

// Slide pitch is 960 + 50 = 1010px on the 1920 frame; the strip is parked with its first slide
// centred at 104.17vw + 25vw, so this is how far left it travels to centre the last of five.
const SLIDE_PITCH_VW = 1010 / 1920;
const STRIP_START_CENTER_VW = 104.17 / 100 + 0.25;

// Beat boundaries. Phase 1 ends at 1.38 (mascot rise starts at 0.08, runs 1.3); phase 2 opens a
// deliberate beat later; phase 3 starts the instant phase 2 lands, so the strip takes over with
// no dead zone. The strip gets the lion's share — it is five full-width photos.
const PHASE_2 = 1.5;
const PHASE_2_DUR = 0.8;
const PHASE_3 = PHASE_2 + PHASE_2_DUR;
const STRIP_DUR = 4.5;

export default function WhereUsedScroll() {
  useGSAP(() => {
    const section = document.querySelector<HTMLElement>("[data-whereused]");
    if (!section) return;
    const wordBoxes = Array.from(section.querySelectorAll<HTMLElement>("[data-whereused-word]"));
    const glyphs = Array.from(section.querySelectorAll<HTMLElement>("[data-whereused-glyph]"));
    const figure = section.querySelector<HTMLElement>("[data-whereused-figure]");
    const strip = section.querySelector<HTMLElement>("[data-whereused-strip]");
    if (!figure || !strip || wordBoxes.length === 0) return;

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
    const figureTravel =
      vh * (1 + FIGURE_PARK_CLEARANCE_VH) -
      centerOf(figure).cy +
      (figure.offsetHeight * FIGURE_PARKED_SCALE) / 2;

    gsap.set(figure, { y: figureTravel, scale: FIGURE_PARKED_SCALE });

    // Each word flies from wherever the markup put it to its own small-line centre.
    const wordTargets = wordBoxes.map((el) => {
      const target = SMALL_CENTERS[el.dataset.whereusedWord ?? ""];
      const from = centerOf(el);
      return target
        ? { el, x: target.cx * vw - from.cx, y: target.cy * vh - from.cy }
        : { el, x: 0, y: 0 };
    });

    // How far left the strip must go to bring the LAST slide's centre onto the viewport centre.
    const lastSlideCenterVw = STRIP_START_CENTER_VW + (strip.children.length - 1) * SLIDE_PITCH_VW;
    const stripTravel = (lastSlideCenterVw - 0.5) * vw;

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: `+=${PIN_PX}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
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

    // Phase 3 — the photo strip scrolls in from the right and stops with the last one centred,
    // which is where the footer takes over. Linear: a scrubbed horizontal pan reads as a direct
    // response to the wheel, and any easing here would feel like drag.
    tl.to(strip, { x: -stripTravel, duration: STRIP_DUR, ease: "none" }, PHASE_3);

    ScrollTrigger.refresh();
  }, []);

  return null;
}
