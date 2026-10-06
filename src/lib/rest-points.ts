import type { ScrollTrigger } from "@/lib/gsap";

/**
 * Resting points for the phone's swipe stepping (see swipe-steps.ts): the scroll positions where
 * a section's content is fully revealed and nothing is mid-animation. Each section registers its
 * scrubbed timeline and the TIMELINE times it rests at, because that is the unit its
 * choreography is written in.
 *
 * Every stop also carries how long the glide INTO it takes (from the stop before it, which may
 * belong to the previous section). That is set per step, by eye, from what the step shows — no
 * formula held up: timeline beats overcount a card scroll and undercount the photo pan, and
 * pixels say nothing about how much is animating. Going back up a step takes the same time.
 *
 * Positions are resolved only when asked for, through the trigger's live start/end, so a
 * ScrollTrigger refresh (resize, late image, the intro unlocking the page) never leaves a stale
 * position behind.
 */
export type Stop = { t: number; seconds: number };
type Section = { st: ScrollTrigger; duration: number; stops: Stop[] };
export type RestPoint = { y: number; seconds: number };

const sections = new Set<Section>();

export function addRestSection(section: Section): () => void {
  sections.add(section);
  return () => {
    sections.delete(section);
  };
}

/** Every registered point, ascending, with near-duplicates (within a few px) merged. */
export function restPoints(): RestPoint[] {
  const all = [...sections]
    .flatMap(({ st, duration, stops }) =>
      stops.map(({ t, seconds }) => ({
        y: st.start + Math.min(Math.max(t / duration, 0), 1) * (st.end - st.start),
        seconds,
      })),
    )
    .sort((a, b) => a.y - b.y);
  return all.filter((p, i) => i === 0 || p.y - all[i - 1].y > 4);
}

/**
 * Glide time between two scroll positions: each step it crosses contributes its own duration,
 * in proportion to how much of that step is left to cover — so a release half way through a
 * step, after a long drag, only plays the remaining half.
 */
export function glideSeconds(points: RestPoint[], from: number, to: number): number {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  let seconds = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1].y;
    const b = points[i].y;
    const overlap = Math.min(hi, b) - Math.max(lo, a);
    if (overlap > 0) seconds += (overlap / (b - a)) * points[i].seconds;
  }
  return seconds;
}
