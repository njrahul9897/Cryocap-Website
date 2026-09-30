import Image from "next/image";
import WhereUsedScroll from "@/components/WhereUsedScroll";

// Figma frames 16 -> 17. Frame 16 reveals "Where is it used?" as three big stacked lines with
// the AOne mascot rising through the middle of them; frame 17 collapses those same four words
// into one small line near the top and scrolls a strip of five location photos in from the
// right. Headline is 320px on the 1920 frame (16.67vw).
//
// Unlike the how-it-works headline — two rows that shrink as one block — these four words
// RE-FLOW from three lines to one, so each word gets its own absolutely positioned centre and
// is flown to its small-line position independently. Each also keeps its own clip window, so
// the four still reveal one after another the way "How / does / It / works" does.
// 16.67vw is Figma's 320px on the 1920 frame. That same ratio on a phone is only ~7.7% of
// the viewport HEIGHT (against 26.7% on desktop), which is what left the three rows
// marooned in white space — so mobile gets a much larger share of the width.
const word =
  "text-[24vw] lg:text-[16.67vw] font-extrabold uppercase leading-[0.909] whitespace-nowrap";
// Clip-window height is font-size x leading, the same relationship the how-it-works rows use.
const window_ = "h-[21.8vw] lg:h-[15.15vw] overflow-hidden";

// Phase-1 centres, as fractions of the frame, straight off Figma frame 16 (glyph-box centre =
// node y + height/2). "Where" and "used?" sit dead centre horizontally; "is" and "it" straddle
// the mascot, which fills the gap between them.
type Word = {
  id: string;
  text: string;
  pos: string;
  tone: string;
  layer: string;
};

const words: Word[] = [
  // faded, and painted BEHIND the mascot — same role "How does" plays in the other section
  {
    id: "where",
    text: "Where",
    pos: "left-[49.97vw] top-[37dvh] lg:top-[21.99vh]",
    tone: "text-black/10",
    layer: "",
  },
  {
    id: "is",
    text: "is",
    pos: "left-[14vw] top-[50dvh] lg:left-[30.05vw] lg:top-[49.95vh]",
    tone: "text-black/10",
    layer: "",
  },
  {
    id: "it",
    text: "it",
    pos: "left-[86vw] top-[50dvh] lg:left-[70.13vw] lg:top-[49.95vh]",
    tone: "text-black/10",
    layer: "",
  },
  // solid black and in FRONT of the mascot, the way "It works" rises over the cap. No
  // `relative` here: these boxes are already absolutely positioned, so z-index applies as-is,
  // and adding `relative` would emit a second `position` that wins and drops the word back
  // into normal flow at full viewport width.
  {
    id: "used",
    text: "used?",
    pos: "left-[50vw] top-[63dvh] lg:top-[78.10vh]",
    tone: "text-ink",
    layer: "z-20",
  },
];

// Figma "Image Slide": five 960x536 photos, 10px white border, 26px radius, 50px apart, each
// with an uppercase caption 36px below it. Sizes are fractions of the 1920 frame like the rest
// of the project.
const slides = [
  { src: "/where-used/dairy-farms.webp", caption: "Dairy Farms" },
  {
    src: "/where-used/veterinary-hospitals.webp",
    caption: "Veterinary Hospitals",
  },
  {
    src: "/where-used/pharmaceutical-companies.webp",
    caption: "Pharmaceutical Companies",
  },
  {
    src: "/where-used/insemination-centers.webp",
    caption: "Artificial Insemination Centers",
  },
  {
    src: "/where-used/field-ai-technicians.webp",
    caption: "Field AI Technicians",
  },
];

export default function WhereUsed() {
  return (
    <section data-whereused className="relative h-dvh overflow-hidden">
      {words.map((w) => (
        <div
          key={w.id}
          data-whereused-word={w.id}
          // xPercent/yPercent centering is applied by WhereUsedScroll rather than by a
          // `-translate-1/2` class: GSAP owns this element's transform outright, so letting it
          // own the centering too avoids the standalone `translate` property fighting it.
          className={`pointer-events-none absolute ${w.pos} ${window_} ${w.layer}`}
        >
          <p
            data-whereused-glyph
            className={`${word} translate-y-full ${w.tone}`}
          >
            {w.text}
          </p>
        </div>
      ))}

      {/* The AOne mascot, sized and placed off Figma frame 16 (444x771 at x=738, y=179). Middle
          layer of the stack: in front of the faded words, behind the solid "used?" above. It
          rises from below the fold, then retreats back down the same path once the headline
          collapses — it never fades, matching the cap in the how-it-works section. */}
      <div
        data-whereused-figure
        className="pointer-events-none absolute top-[50dvh] left-1/2 z-10 h-[52dvh] lg:top-[52.27vh] lg:h-[min(71.39dvh,40.2vw)]"
      >
        <div className="relative h-full aspect-[444/771]">
          <Image
            src="/where-used/bottle.webp"
            alt="An AOne field technician holding a Cryocap-fitted container"
            fill
            sizes="(min-width: 1024px) 24vw, 60vw"
            // fetched up front, at low priority: left lazy, this only starts downloading as the
            // section scrolls in, i.e. in the middle of a scrub
            loading="eager"
            fetchPriority="low"
            className="object-contain"
          />
          {/* Figma's two blurred contact shadows, one under each foot. They live inside this
              wrapper rather than beside it so they ride the same rise/retreat transform; their
              inset percentages are their frame-16 positions expressed against the 444x771 box. */}
          <Image
            src="/where-used/accent-left.svg"
            alt=""
            width={84}
            height={25}
            unoptimized
            loading="eager"
            className="absolute left-[27.4%] top-[96%] h-[3.2%] w-[18.9%]"
          />
          <Image
            src="/where-used/accent-right.svg"
            alt=""
            width={83}
            height={25}
            unoptimized
            loading="eager"
            className="absolute left-[63.1%] top-[96.1%] h-[3.2%] w-[18.6%]"
          />
        </div>
      </div>

      {/* The five location photos. On desktop they sit in one row parked off-screen right
          (Figma parks the group at x=2000 on a 1920 frame) and WhereUsedScroll slides the row
          left until the last photo is centred.

          On a phone the same strip is turned on its side: a single column parked below the fold
          that rides UP through the centre. A sideways pan fights the direction of the gesture on
          touch, and it forced the photos down to 50vw to fit several on screen at once; stacked,
          each one can take the full 88vw content column the solution cards use (same 6vw left
          edge), so the photos read at roughly three times the area.

          Everything inside the slide is a fraction of the SLIDE's width rather than a fixed vw,
          so the border, corner radius and caption keep their proportions at both widths — e.g.
          Figma's 10px border on a 960px photo is 1.042% of it, which is 0.52vw at 50vw wide and
          0.92vw at 88vw. */}
      {/* Clip window, phone only. Travelling UP means the column passes THROUGH the small
          headline on its way to the centre, which the sideways desktop pan never does (there the
          strip sits wholly below it). This bounds the photos to the area under the headline.
          `lg:contents` makes the wrapper generate no box at all on desktop, so the strip goes on
          resolving its `left`/`top` against the section exactly as before. */}
      <div className="lg:contents max-lg:absolute max-lg:inset-x-0 max-lg:top-[20dvh] max-lg:bottom-0 max-lg:overflow-hidden">
        <div
          data-whereused-strip
          // max-lg:top-full parks the first photo exactly on the bottom edge of that window, which
          // is the bottom of the viewport — no dead scroll before the first one appears.
          className="pointer-events-none absolute z-30 flex lg:top-[26.57vh] lg:left-[104.17vw] lg:items-start lg:gap-[2.604vw] max-lg:top-full max-lg:left-[6vw] max-lg:w-[88vw] max-lg:flex-col max-lg:gap-[7vw]"
        >
          {slides.map((s) => (
            <figure
              key={s.src}
              className="flex shrink-0 flex-col items-center lg:w-[50vw] lg:gap-[1.875vw] max-lg:w-full max-lg:gap-[3.3vw]"
            >
              <span
                data-whereused-slide
                className="relative block w-full aspect-[960/536] overflow-hidden border-white bg-white lg:rounded-[1.354vw] lg:border-[0.52vw] lg:shadow-[0_-0.3125vw_5.2vw_rgba(0,0,0,0.1)] max-lg:rounded-[2.38vw] max-lg:border-[0.92vw] max-lg:shadow-[0_-0.55vw_9.15vw_rgba(0,0,0,0.1)]"
              >
                <Image
                  src={s.src}
                  alt={s.caption}
                  fill
                  sizes="(min-width: 1024px) 52vw, 88vw"
                  // eager, low priority: these are the only things moving during phase 3, so a
                  // lazy fetch lands exactly inside the scrub that reveals them — measured at a
                  // 594ms frame on a throttled phone profile
                  loading="eager"
                  fetchPriority="low"
                  className="object-cover lg:rounded-[0.83vw] max-lg:rounded-[1.47vw]"
                />
              </span>
              <figcaption className="text-center font-medium uppercase text-ink lg:text-[1.5625vw] max-lg:text-[clamp(12px,2.75vw,18px)]">
                {s.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <WhereUsedScroll />
    </section>
  );
}
