import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);

// Near-linear travel with a soft landing, matching the prototype's reveal motion.
CustomEase.create("reveal", "M0,0 C0.35,0.35 0.6,0.95 1,1");

export { gsap, ScrollTrigger, CustomEase, useGSAP };
