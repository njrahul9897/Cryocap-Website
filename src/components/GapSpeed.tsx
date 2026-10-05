"use client";

import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis-store";
import { useViewportKey } from "@/lib/use-viewport-key";

// Between one pinned section releasing and the next one pinning there is a viewport of scroll
// with nothing in it: the outgoing section has finished its timeline and is only scrolling off,
// and the incoming one has not started. That distance is structural — it is exactly the height
// of the full-screen section leaving — so it cannot be shortened without either overlapping the
// two sections or starting the next one's animation before it is on screen. Both were tried and
// both were worse.
//
// What it can do is go past quicker. While the viewport is inside that band a swipe carries
// further, so the empty stretch takes roughly half the effort to cross while every section's
// own scroll — where the animations live — keeps its original pace.
const BOOST = 2.2;

// Phones only. The gap is the same on desktop but a wheel or trackpad crosses it without
// complaint, and the pacing there is the approved one.
const MOBILE_MAX = 1024;

// Lenis reads these off its VirtualScroll on every wheel and touch event, so changing them takes
// effect on the next gesture with no re-init. It is an internal, hence the optional chaining:
// if a Lenis upgrade moves it, the boost quietly does nothing instead of throwing.
type Multipliers = { touchMultiplier: number; wheelMultiplier: number };
const multipliers = (): Multipliers | undefined =>
  (getLenis() as unknown as { virtualScroll?: { options?: Multipliers } } | null)?.virtualScroll?.options;

export default function GapSpeed() {
  const viewport = useViewportKey();

  useGSAP(
    () => {
      if (window.innerWidth >= MOBILE_MAX) return;

      const sections = ["[data-howitworks]", "[data-whereused]", "[data-footer]"]
        .map((sel) => document.querySelector<HTMLElement>(sel))
        .filter((el): el is HTMLElement => el !== null);
      if (!sections.length) return;

      // Captured on first use rather than from the Lenis options at build time, so this stays
      // correct if those are ever retuned.
      let base: Multipliers | null = null;
      const setBoost = (on: boolean) => {
        const opts = multipliers();
        if (!opts) return;
        base ??= { touchMultiplier: opts.touchMultiplier, wheelMultiplier: opts.wheelMultiplier };
        opts.touchMultiplier = on ? base.touchMultiplier * BOOST : base.touchMultiplier;
        opts.wheelMultiplier = on ? base.wheelMultiplier * BOOST : base.wheelMultiplier;
      };

      sections.forEach((section) =>
        ScrollTrigger.create({
          trigger: section,
          // Exactly the empty band. A section's top entering the bottom of the viewport is the
          // same moment the previous section's pin releases, and its top reaching the top is
          // the moment it pins — between those two there is nothing to look at.
          start: "top bottom",
          end: "top top",
          onToggle: (self) => setBoost(self.isActive),
          // the pins above have to settle before these can read the right positions
          refreshPriority: -2,
        }),
      );

      // Leaving the boost applied would speed up the whole page.
      return () => setBoost(false);
    },
    { dependencies: [viewport], revertOnUpdate: true },
  );

  return null;
}
