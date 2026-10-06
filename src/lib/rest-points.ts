import type { ScrollTrigger } from "@/lib/gsap";

/**
 * Resting points for the phone's swipe stepping (see SwipeSteps): the scroll positions where a
 * section's content is fully revealed and nothing is mid-animation. Each section registers its
 * own, as TIMELINE times, because that is the unit its choreography is written in.
 *
 * They are resolved to scroll pixels only when asked for, through the trigger's live start/end,
 * so a ScrollTrigger refresh (resize, late image, the intro unlocking the page) never leaves a
 * stale position behind.
 */
type Source = () => number[];

const sources = new Set<Source>();

export function addRestPoints(source: Source): () => void {
  sources.add(source);
  return () => {
    sources.delete(source);
  };
}

/** Timeline times -> scroll positions, for a timeline scrubbed linearly across `st`. */
export function timesToScroll(st: ScrollTrigger, duration: number, times: number[]): number[] {
  return times.map((t) => st.start + (Math.min(Math.max(t / duration, 0), 1)) * (st.end - st.start));
}

/** Every registered point, ascending, with near-duplicates (within a few px) merged. */
export function restPoints(): number[] {
  const all = [...sources].flatMap((s) => s()).sort((a, b) => a - b);
  return all.filter((p, i) => i === 0 || p - all[i - 1] > 4);
}
