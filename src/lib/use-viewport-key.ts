"use client";

import { useEffect, useState } from "react";

// Every scroll timeline on this page computes its targets in PIXELS, off the viewport, once —
// where a cap parks so it clears the bottom edge, how far the photo strip travels to centre its
// last slide, where the centred how-it-works block starts. None of that recomputes on a resize:
// ScrollTrigger.refresh() moves each trigger's start/end and re-renders the timeline, but the
// tween VALUES stay baked at the size they were built for. So after a window resize a cap can be
// parked half a screen short of off-screen and simply sit there in the middle of a section, and
// a headline can fly to coordinates that no longer exist — which is exactly the "elements from
// another section appear in random places" symptom. The fix is to rebuild on a real size change;
// used as a `useGSAP` dependency with `revertOnUpdate`, so the stale inline styles are cleared
// before the new ones are written.
//
// "Real" has to exclude the resize phones fire constantly: collapsing the URL bar changes only
// the height, and tearing down every pin mid-scroll for that would be far worse than the
// staleness. It is the same event `ScrollTrigger.config({ ignoreMobileResize: true })` already
// ignores, so on a coarse pointer this keys off width alone — an orientation change still moves
// the width, so rotating does rebuild.
function readKey() {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return coarse ? `${window.innerWidth}` : `${window.innerWidth}x${window.innerHeight}`;
}

// Dragging a window edge fires resize continuously and each rebuild reverts and re-measures the
// whole page, so wait for it to settle first.
const SETTLE_MS = 250;

export function useViewportKey() {
  const [key, setKey] = useState(() => (typeof window === "undefined" ? "" : readKey()));

  useEffect(() => {
    // No sync read here: the timelines measure the window themselves when they build, so this
    // value only has to be a stable BASELINE to compare later resizes against, not an exact
    // reading of the current size.
    let timer = 0;
    const onResize = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => setKey(readKey()), SETTLE_MS);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return key;
}
