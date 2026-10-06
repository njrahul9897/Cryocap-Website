import type { ScrollTrigger } from "@/lib/gsap";

/**
 * Resting points for the phone's swipe stepping (see swipe-steps.ts): the scroll positions where
 * a section's content is fully revealed and nothing is mid-animation. Each section registers its
 * scrubbed timeline and the TIMELINE times it rests at, because that is the unit its
 * choreography is written in.
 *
 * They are resolved to scroll pixels only when asked for, through the trigger's live start/end,
 * so a ScrollTrigger refresh (resize, late image, the intro unlocking the page) never leaves a
 * stale position behind.
 *
 * The timeline also tells the stepper how much is HAPPENING between two points, which is what
 * the glide is timed by: pixels are no measure of that, since the sections map a beat of
 * animation onto anything from ~260px to ~950px of scroll.
 */
type Section = { st: ScrollTrigger; duration: number; times: number[] };

const sections = new Set<Section>();

export function addRestSection(section: Section): () => void {
  sections.add(section);
  return () => {
    sections.delete(section);
  };
}

const toScroll = ({ st }: Section, t: number, duration: number) =>
  st.start + Math.min(Math.max(t / duration, 0), 1) * (st.end - st.start);

/** Every registered point, ascending, with near-duplicates (within a few px) merged. */
export function restPoints(): number[] {
  const all = [...sections].flatMap((s) => s.times.map((t) => toScroll(s, t, s.duration))).sort((a, b) => a - b);
  return all.filter((p, i) => i === 0 || p - all[i - 1] > 4);
}

/**
 * Beats of animation between two scroll positions. Inside a section that is its own timeline's
 * time; scroll no section covers (a full-screen section sliding up into place before it pins)
 * counts as one beat per viewport, since the whole screen is in motion there.
 */
export function beatsBetween(a: number, b: number, vh: number): number {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  let beats = 0;
  let covered = 0;
  for (const { st, duration } of sections) {
    const overlap = Math.min(hi, st.end) - Math.max(lo, st.start);
    if (overlap <= 0 || st.end <= st.start) continue;
    beats += (overlap / (st.end - st.start)) * duration;
    covered += overlap;
  }
  return beats + Math.max(0, hi - lo - covered) / vh;
}
