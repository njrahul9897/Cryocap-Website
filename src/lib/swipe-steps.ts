import type Lenis from "lenis";
import type { VirtualScrollData } from "lenis";
import { beatsBetween, restPoints } from "@/lib/rest-points";

// Phone swipe stepping. While the finger is down nothing changes: Lenis drags the page 1:1, so
// you can hold, scrub slowly, back up. What changes is the RELEASE. Lenis would throw the page
// on its own momentum and leave it wherever that runs out — half way through a reveal, or in
// the blank viewport between two pinned sections. Instead, on touchend this picks a resting
// point (see rest-points.ts) and glides there.
//
// The target is chosen by DIRECTION, never "nearest": landing on the closest point would often
// pull the page back against the swipe, and that visible correction is exactly what read as
// strain. Going forward the way the finger went makes the glide read as the swipe's own
// momentum that happens to stop in the right place.

// Phones only: the desktop pacing is the approved one, and a trackpad
// sends a long tail of wheel events per swipe that would need its own handling.
const MOBILE_MAX = 1024;
// A drag shorter than this is a fumble, not a swipe: settle on the nearest point (normally
// the one it started from) instead of advancing.
const FUMBLE_PX = 30;
// On a long, slow drag you watch the content and let go once something is fully revealed — a
// hair PAST its resting point. Within this much of a point just passed, settle on it rather
// than carrying on to the next; the short step back is far smaller than skipping content.
const SETTLE_BACK_VH = 0.12;

// Glide timing follows how much ANIMATION the step covers (timeline beats, see rest-points.ts),
// not how far it scrolls: the sections spend anywhere from ~260px to ~950px of scroll on a beat,
// so a pixel-based duration rushed the dense steps (the cap coming off) and dawdled through
// sparse ones. The pace is the green-cap step's, which read as right: about a second a beat.
// Clamped so a tiny step still reads as a glide and a section crossing never drags.
const SECONDS_PER_BEAT = 0.9;
const glideDuration = (beats: number) => Math.min(2, Math.max(0.7, beats * SECONDS_PER_BEAT));
// Even, symmetric ease. A fast-out ease crammed whatever sits at the START of a step into its
// first instant (the orange cap shot off) while content near the end got the soft landing;
// this keeps the pace steady wherever in the step the content lies. The scrub's own smoothing
// absorbs the gentle start, so it still flows on from the finger.
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

function enabled() {
  return window.innerWidth < MOBILE_MAX && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Lenis runs this hook BEFORE its own `data-lenis-prevent` check, so a drag inside the contact
// modal's scroll area would otherwise be stepped too.
function insidePrevented(event: Event) {
  return event
    .composedPath()
    .some((n) => n instanceof HTMLElement && (n.hasAttribute("data-lenis-prevent") || n.hasAttribute("data-lenis-prevent-touch")));
}

function pickTarget(start: number, now: number, points: number[], vh: number): number | null {
  if (!points.length) return null;
  const moved = now - start;

  if (Math.abs(moved) < FUMBLE_PX) {
    return points.reduce((best, p) => (Math.abs(p - now) < Math.abs(best - now) ? p : best));
  }

  const dir = Math.sign(moved);
  const back = SETTLE_BACK_VH * vh;
  // Strictly beyond where the drag began (so a short swipe from a resting point always
  // advances), and ahead of the release apart from the small settle-back allowance.
  const ahead = (dir > 0 ? points : [...points].reverse()).find(
    (p) => dir * (p - start) > 0 && dir * (p - now) > -back,
  );
  // Nothing further that way: the top or bottom of the page, so stay at the last point.
  return ahead ?? (dir > 0 ? points[points.length - 1] : points[0]);
}

export function swipeSteps(getLenis: () => Lenis | null) {
  let start = 0;
  let dragged = false;

  return ({ event }: VirtualScrollData): boolean => {
    if (!event.type.startsWith("touch") || !enabled()) return true;
    const lenis = getLenis();
    if (!lenis || lenis.isStopped || lenis.isLocked || insidePrevented(event)) return true;

    if (event.type === "touchstart") {
      // `actualScroll` rather than the target: a touch that interrupts a glide in flight
      // starts from where the page really is, which is also where Lenis freezes it.
      start = lenis.actualScroll;
      dragged = false;
      return true;
    }
    if (event.type === "touchmove") {
      dragged = true;
      return true;
    }

    // touchend. A tap (no movement) is a click on something, not a scroll gesture.
    if (!dragged) return true;
    dragged = false;

    const vh = window.innerHeight;
    const target = pickTarget(start, lenis.targetScroll, restPoints(), vh);
    if (target === null) return true;

    // Returning false skips Lenis's touchend handling entirely, including the line that would
    // clear this flag.
    lenis.isTouching = false;
    lenis.scrollTo(target, {
      duration: glideDuration(beatsBetween(lenis.targetScroll, target, vh)),
      easing: easeInOutSine,
    });
    return false;
  };
}
