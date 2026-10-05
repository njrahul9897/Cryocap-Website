"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis-store";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      // Touch has to be lerped here, not left native. Almost every section on this page is a
      // scrubbed pin, and native momentum delivers scroll in big irregular jumps — which the
      // scrubs then chase, giving the jerky, over-fast feel on a phone. Letting Lenis drive
      // touch means the scrub gets a smooth, evenly-paced position to follow.
      syncTouch: true,
      // A short, BOUNDED glide after the finger lifts. Lenis throws
      // `|velocity| ** touchInertiaExponent` on touchend (lenis.mjs:630) where velocity is
      // pixels per FRAME (lenis.mjs:664) — so this exponent is applied to a number in the tens
      // for any real flick, and every step up multiplies the throw rather than damping it. An
      // earlier comment here had it backwards as "higher exponent = quicker decay", true only
      // below 1px/frame, which is all synthetic touch events produce; that is why emulation
      // never showed the problem.
      //
      // What the number buys, at 17 / 35 / 67 px-per-frame (gentle / normal / hard):
      //   1.5  ->   70 /  207 /  548px     <- here: a glide you can feel, that always stops
      //   1.7  ->  124 /  422 / 1272px     <- Lenis default
      //   2.1  ->  384 / 1748 / 6835px     <- what this was, and read as "much too fast"
      // 0 removes the glide entirely, which was calm but made the page hard work to get down.
      touchInertiaExponent: 1.5,
      // 1:1 with the finger, and that is deliberate rather than a tuning guess. During a drag
      // Lenis applies this multiplier with `lerp: 1` (lenis.mjs:634), i.e. instantly — so
      // anything below 1 means the page travels less than the thumb that is dragging it, which
      // is precisely the "sticky" feeling. At 1 the content holds to the finger exactly.
      touchMultiplier: 1,
      syncTouchLerp: 0.09,
      anchors: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);

    return () => {
      setLenis(null);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);

  return <>{children}</>;
}
