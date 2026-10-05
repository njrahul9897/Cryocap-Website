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
      // Momentum on top of that easily overshoots a whole section in one flick, so damp how
      // far a swipe throws and make it shed that momentum faster (higher exponent = quicker
      // decay). syncTouchLerp is the touch equivalent of `lerp` above.
      //
      // The multiplier governs how far a swipe carries WHILE the finger is down, and at 0.9 a
      // flick already tracks the finger almost 1:1 — that is not the part that overshoots. The
      // exponent governs what happens after the finger lifts, which is where a hard flick threw
      // past a whole section, so the damping goes there rather than into making the page feel
      // heavy under the thumb. All three are touch-only: `lerp`, `smoothWheel` and the untouched
      // wheelMultiplier are what desktop scrolls on, so none of this reaches a mouse or trackpad.
      touchMultiplier: 0.8,
      touchInertiaExponent: 2.8,
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
