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
      // No momentum throw at all. On touchend Lenis adds a delta of
      // `|velocity| ** touchInertiaExponent` (lenis.mjs:630), and velocity is pixels per FRAME
      // (lenis.mjs:664) — so for any real flick, which runs tens of pixels a frame, that
      // exponent is applied to a number far greater than 1 and makes the throw exponentially
      // BIGGER. At 60px/frame an exponent of 2.1 throws ~5,500px. An earlier comment here had
      // this backwards as "higher exponent = quicker decay", which is only true below 1px/frame
      // — the speed synthetic touch events happen to produce, so emulation never showed it.
      //
      // 0 makes that term |velocity|**0 === 1, i.e. a one-pixel delta: the page moves while the
      // finger is down and stops when it lifts, with nothing thrown afterwards.
      touchInertiaExponent: 0,
      // With no throw to compensate for, the finger-down tracking carries the whole feel, so it
      // comes back up from the 0.65 it was lowered to while fighting the momentum.
      touchMultiplier: 0.8,
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
