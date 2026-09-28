import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);

// Mobile browsers collapse their address bar on the first scroll, which grows the viewport and
// fires a resize. Left alone, ScrollTrigger refreshes on that and recomputes every pin's start
// and end mid-gesture — a visible lurch right as you begin scrolling. This tells it to ignore
// that particular resize. The layout itself is in `dvh`, so the CSS still tracks the viewport
// as the bar comes and goes (the can stays centred, the grid stays on the bottom edge); only
// the scroll math is held steady. On desktop `dvh` and `svh` are identical, so none of this
// changes anything there.
ScrollTrigger.config({ ignoreMobileResize: true });

// Near-linear travel with a soft landing, matching the prototype's reveal motion.
CustomEase.create("reveal", "M0,0 C0.35,0.35 0.6,0.95 1,1");

export { gsap, ScrollTrigger, CustomEase, useGSAP };
