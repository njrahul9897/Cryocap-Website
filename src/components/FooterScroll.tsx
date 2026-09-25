"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

// Two separate behaviours, because Figma frames 18 -> 19 are two different moments:
//
//   1. the footer ARRIVING. Frames 18/19 just scroll it up, so this is scrubbed against the
//      section's own approach rather than buying a pin — the where-it-is-used pin ends the
//      instant its last photo is centred and the footer takes over from there. Hero order:
//      wordmark and copy settle, the product rises into them.
//   2. the SIGN-OFF. In frame 19 "made in india / for the world" is still parked below its clip
//      windows with everything else already in place. This one is NOT scrubbed: it fires once,
//      on its own, when the bottom of the page is reached, and plays out on its own clock.

// How far the can travels up from below the fold, as a fraction of viewport height.
const CAN_RISE_VH = 1;

export default function FooterScroll() {
  useGSAP(() => {
    const section = document.querySelector<HTMLElement>("[data-footer]");
    if (!section) return;
    const mark = section.querySelector<HTMLElement>("[data-footer-mark]");
    const can = section.querySelector<HTMLElement>("[data-footer-can]");
    const copy = Array.from(section.querySelectorAll<HTMLElement>("[data-footer-copy]"));
    const lockup = section.querySelector<HTMLElement>("[data-footer-lockup]");
    const windows = Array.from(section.querySelectorAll<HTMLElement>("[data-footer-lockup-window]"));
    const lines = Array.from(section.querySelectorAll<HTMLElement>("[data-footer-lockup-line]"));
    if (!can) return;

    const vh = window.innerHeight;

    gsap.set(can, { y: CAN_RISE_VH * vh });
    gsap.set(copy, { y: 24, autoAlpha: 0 });
    if (mark) gsap.set(mark, { autoAlpha: 0 });

    // 1 — arrival, scrubbed across the section's approach so everything lands exactly as the
    // footer finishes moving into place.
    const arrive = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "top top",
        scrub: 1,
        // the three pinned sections above claim 1 / 0 / -1, so this refreshes last of all
        refreshPriority: -2,
      },
    });

    if (mark) arrive.to(mark, { autoAlpha: 1, duration: 0.5 }, 0);
    arrive.to(copy, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.08 }, 0.05);
    arrive.to(can, { y: 0, duration: 0.9 }, 0.1);

    // The global bottom bar's right-hand cluster is "Scroll Down" plus a patented badge. Both
    // are wrong on the last screen — there is nothing below to scroll to, and the footer shows
    // its own badge up top — so fade that cluster out as the footer arrives. Nothing else about
    // the shared chrome changes, and it fades back in on the way out.
    const barEnd = document.querySelector<HTMLElement>("[data-bottombar-end]");
    if (barEnd) arrive.to(barEnd, { autoAlpha: 0, duration: 0.3 }, 0.2);

    // 2 — the sign-off. The block starts one line-height LOWER than it rests, so its first line
    // occupies the bottom slot: "made in india" reveals there, then the block rides up by that
    // same line while "for the world" reveals into the slot it vacated.
    if (lockup && lines.length === 2 && windows.length === 2) {
      const lineH = windows[0].offsetHeight;
      gsap.set(lockup, { y: lineH });

      const signoff = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .to(lines[0], { yPercent: -100, duration: 0.7 })
        .to(lockup, { y: 0, duration: 0.8 }, "+=0.2")
        .to(lines[1], { yPercent: -100, duration: 0.7 }, "<");

      // Fires on its own once the page bottom is reached, rather than being scrubbed: the user
      // has stopped scrolling by then, so the reveal has to run on its own clock.
      //
      // The `+=60` matters. This section is the last one and exactly one viewport tall, so a
      // plain "bottom bottom" resolves to the very last scrollable pixel — scrolling can settle
      // a hair short of it (Lenis eases into the end) and the enter never registers at all.
      // Starting 60px earlier is still "the end of the page" to the eye but always fires.
      ScrollTrigger.create({
        trigger: section,
        start: "bottom bottom+=60",
        once: true,
        onEnter: () => signoff.play(),
        refreshPriority: -3,
      });
    }

    ScrollTrigger.refresh();
  }, []);

  return null;
}
