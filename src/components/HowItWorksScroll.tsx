"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

// Scroll distance the whole section stays pinned for, across three beats:
//   1. the headline reveals word by word and the cap rises into it
//   2. the headline shrinks/rises to its small position while the cap retracts back out
//   3. the four steps appear one after another
// Held at ~945px per timeline unit, the pacing that phase 1 was tuned to on its own.
const PIN_PX = 3100;

// Figma 11 -> 12 -> 13: the cap starts small, unrotated and fully below the fold, rises to the
// frame centre at full size and a -30deg tilt, then goes back out exactly the way it came in
// (frame 13 parks it at the identical x/y/size as frame 11). Both ends share the same centre x,
// so the whole move is a rise plus a scale and a rotation about its own centre.
const CAP_LANDED = { scale: 1, rotation: -30 };
const CAP_PARKED = { scale: 0.714, rotation: 0 };
// Clearance below the viewport edge at the parked end, so no sliver of the cap ever peeks in.
const CAP_PARK_CLEARANCE_VH = 0.02;

// Row clip-window height in phase 1 is the literal `h-[13.46vw]` class on each row.
const BIG_ROW_VW = 0.1346;
// Figma's small "How does"/"it works" images are both 11.2% of the frame's height — this ratio
// is kept for how much the headline shrinks by; the ROW/GRID gaps below replace Figma's literal
// (near-top, bottom-anchored-grid) placement with the whole block centred on the viewport, per
// explicit direction: Figma's own layout read as bottom-heavy and its row spacing as too loose.
const SMALL_ROW_VH = 0.112;
// Gap between the two shrunk headline rows' visual edges, and between "It works" and the grid
// below it — both as a fraction of viewport height, so they scale with the viewport like
// everything else in this section.
const ROW_GAP_VH = 0.02;
const GRID_GAP_VH = 0.009;

// Beat boundaries on the timeline. Phase 1 finishes at 1.38 (cap rise starts at 0.08, runs 1.3);
// phase 2 opens on a deliberate short gap after it, and phase 3 starts the instant phase 2's
// moves land, so the steps take over without a dead zone in between.
const PHASE_2 = 1.5;
const PHASE_2_DUR = 0.8;
const PHASE_3 = PHASE_2 + PHASE_2_DUR;

export default function HowItWorksScroll() {
  useGSAP(() => {
    const section = document.querySelector<HTMLElement>("[data-howitworks]");
    if (!section) return;
    // DOM order is How, does, It, works — the stagger below reveals them in that order
    const words = Array.from(section.querySelectorAll<HTMLElement>("[data-howitworks-word]"));
    const cap = section.querySelector<HTMLElement>("[data-howitworks-cap]");
    const howDoesRow = section.querySelector<HTMLElement>("[data-row='how-does']");
    const itWorksRow = section.querySelector<HTMLElement>("[data-row='it-works']");
    const grid = section.querySelector<HTMLElement>("[data-howitworks-grid]");
    const gridItems = Array.from(section.querySelectorAll<HTMLElement>("[data-howitworks-item]"));
    if (!cap || !howDoesRow || !itWorksRow || !grid) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // The cap is centered in the section by CSS, so a GSAP `y` of Y puts its visual centre at
    // `vh/2 + Y` (the -50% centering translate and the scale both resolve about its own centre).
    // Parking it far enough down that its scaled top edge clears the viewport therefore needs
    // half a viewport PLUS half the cap's scaled height — measured off the element so this stays
    // correct if the artwork or its `h-[…]` class changes. Figma's own 11 -> 12 travel (0.614vh)
    // is short of that here: the design lands the cap at 0.634vh, this build centers it at 0.5vh
    // per the centered composition, and reusing the design's travel against a different landing
    // point left ~92px of the cap permanently visible at the bottom edge before it set off.
    const capParkY = vh / 2 + (cap.offsetHeight * CAP_PARKED.scale) / 2 + CAP_PARK_CLEARANCE_VH * vh;

    gsap.set(cap, { y: capParkY, scale: CAP_PARKED.scale, rotation: CAP_PARKED.rotation });
    gsap.set(gridItems, { y: 30, autoAlpha: 0 });

    // Both rows currently sit stacked and centered as one block, so each row's own vertical
    // centre (before any transform) is exactly half a row-height off the section's centre.
    // The target height is vh-based (Figma) against a vw-based source size, so on a tall/narrow
    // (portrait) viewport that ratio flips past 1 — an "enlarge" instead of the intended shrink.
    // This is meant to only ever shrink the headline, so clamp at 1.
    const bigRowPx = BIG_ROW_VW * vw;
    const textScale = Math.min(1, (SMALL_ROW_VH * vh) / bigRowPx);
    const smallRowPx = bigRowPx * textScale;

    // Treat the shrunk headline (both rows) plus the four-step grid as ONE block and centre that
    // block on the viewport, rather than pinning the headline near the top (Figma) and the grid
    // to the bottom (Figma) independently. `grid.offsetHeight` is measured off the CSS
    // aspect-ratio boxes, so it's accurate before any GIF has actually loaded.
    const gridH = grid.offsetHeight;
    const totalH = smallRowPx * 2 + ROW_GAP_VH * vh + GRID_GAP_VH * vh + gridH;
    const blockTop = vh / 2 - totalH / 2;
    const howDoesCenterY = blockTop + smallRowPx / 2;
    const itWorksCenterY = howDoesCenterY + smallRowPx + ROW_GAP_VH * vh;
    const gridTopY = itWorksCenterY + smallRowPx / 2 + GRID_GAP_VH * vh;

    const howDoesShift = howDoesCenterY - (vh / 2 - bigRowPx / 2);
    const itWorksShift = itWorksCenterY - (vh / 2 + bigRowPx / 2);
    // The grid has no transform-based "natural" position to offset from (unlike the rows, it
    // isn't scaled) — it's plain absolutely positioned, so it's simplest to just place it with
    // `top` directly, once, before the scroll timeline ever runs.
    gsap.set(grid, { top: gridTopY });

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: `+=${PIN_PX}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        refreshPriority: 0,
      },
    });

    // Phase 1 — the headline and the cap, and nothing else.
    // each word climbs into its clip window on its own beat: How, then does, then It, then works
    tl.to(words, { yPercent: -100, duration: 0.5, stagger: 0.15 }, 0);
    // the cap trails the words by a few frames rather than launching in perfect lockstep with
    // them at t=0 — any layout hitch from the section freshly pinning lands in that small gap,
    // before the cap is expected to move, instead of reading as a stutter in the cap itself
    tl.to(cap, { y: 0, scale: CAP_LANDED.scale, rotation: CAP_LANDED.rotation, duration: 1.3 }, 0.08);

    // Phase 2 — one scroll later, the headline shrinks into its small position while, at the same
    // time, the cap retreats back down its entry path. `power2.in` mirrors the `power2.out` it
    // arrived on, so it accelerates away rather than easing to a halt off-screen. It keeps full
    // opacity throughout and simply leaves the frame, as in Figma frame 13 — it is never faded.
    tl.to(
      cap,
      { y: capParkY, scale: CAP_PARKED.scale, rotation: CAP_PARKED.rotation, duration: PHASE_2_DUR, ease: "power2.in" },
      PHASE_2,
    );
    // both rows shrink and slide to their new centred position in one continuous move
    tl.to(howDoesRow, { y: howDoesShift, scale: textScale, duration: PHASE_2_DUR }, PHASE_2);
    tl.to(itWorksRow, { y: itWorksShift, scale: textScale, duration: PHASE_2_DUR }, PHASE_2);

    // Phase 3 — only once the cap is gone and the headline has settled do the four steps arrive,
    // one after another.
    tl.to(gridItems, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.16 }, PHASE_3);

    ScrollTrigger.refresh();
  }, []);

  return null;
}
