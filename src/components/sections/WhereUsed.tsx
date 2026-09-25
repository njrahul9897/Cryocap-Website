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
const word = "text-[16.67vw] font-extrabold uppercase leading-[0.909] whitespace-nowrap";
// Clip-window height is font-size x leading, the same relationship the how-it-works rows use.
const window_ = "h-[15.15vw] overflow-hidden";

// Phase-1 centres, as fractions of the frame, straight off Figma frame 16 (glyph-box centre =
// node y + height/2). "Where" and "used?" sit dead centre horizontally; "is" and "it" straddle
// the mascot, which fills the gap between them.
type Word = { id: string; text: string; pos: string; tone: string; layer: string };

const words: Word[] = [
  // faded, and painted BEHIND the mascot — same role "How does" plays in the other section
  { id: "where", text: "Where", pos: "left-[49.97vw] top-[21.99vh]", tone: "text-black/10", layer: "" },
  { id: "is", text: "is", pos: "left-[30.05vw] top-[49.95vh]", tone: "text-black/10", layer: "" },
  { id: "it", text: "it", pos: "left-[70.13vw] top-[49.95vh]", tone: "text-black/10", layer: "" },
  // solid black and in FRONT of the mascot, the way "It works" rises over the cap. No
  // `relative` here: these boxes are already absolutely positioned, so z-index applies as-is,
  // and adding `relative` would emit a second `position` that wins and drops the word back
  // into normal flow at full viewport width.
  { id: "used", text: "used?", pos: "left-[50vw] top-[78.10vh]", tone: "text-ink", layer: "z-20" },
];

// Figma "Image Slide": five 960x536 photos, 10px white border, 26px radius, 50px apart, each
// with an uppercase caption 36px below it. Sizes are fractions of the 1920 frame like the rest
// of the project.
const slides = [
  { src: "/where-used/dairy-farms.webp", caption: "Dairy Farms" },
  { src: "/where-used/veterinary-hospitals.webp", caption: "Veterinary Hospitals" },
  { src: "/where-used/pharmaceutical-companies.webp", caption: "Pharmaceutical Companies" },
  { src: "/where-used/insemination-centers.webp", caption: "Artificial Insemination Centers" },
  { src: "/where-used/field-ai-technicians.webp", caption: "Field AI Technicians" },
];

export default function WhereUsed() {
  return (
    <section data-whereused className="relative h-svh overflow-hidden">
      {words.map((w) => (
        <div
          key={w.id}
          data-whereused-word={w.id}
          // xPercent/yPercent centering is applied by WhereUsedScroll rather than by a
          // `-translate-1/2` class: GSAP owns this element's transform outright, so letting it
          // own the centering too avoids the standalone `translate` property fighting it.
          className={`pointer-events-none absolute ${w.pos} ${window_} ${w.layer}`}
        >
          <p data-whereused-glyph className={`${word} translate-y-full ${w.tone}`}>
            {w.text}
          </p>
        </div>
      ))}

      {/* The AOne mascot, sized and placed off Figma frame 16 (444x771 at x=738, y=179). Middle
          layer of the stack: in front of the faded words, behind the solid "used?" above. It
          rises from below the fold, then retreats back down the same path once the headline
          collapses — it never fades, matching the cap in the how-it-works section. */}
      <div data-whereused-figure className="pointer-events-none absolute top-[52.27vh] left-1/2 z-10 h-[71.39svh]">
        <div className="relative h-full aspect-[444/771]">
          <Image
            src="/where-used/bottle.webp"
            alt="An AOne field technician holding a Cryocap-fitted container"
            fill
            sizes="(min-width: 1024px) 24vw, 60vw"
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
            className="absolute left-[27.4%] top-[96%] h-[3.2%] w-[18.9%]"
          />
          <Image
            src="/where-used/accent-right.svg"
            alt=""
            width={83}
            height={25}
            unoptimized
            className="absolute left-[63.1%] top-[96.1%] h-[3.2%] w-[18.6%]"
          />
        </div>
      </div>

      {/* Five location photos in one row, parked off-screen right (Figma parks the group at
          x=2000 on a 1920 frame) and scrolled left by WhereUsedScroll until the last one is
          centred. Slide pitch is 960 + 50 = 1010px => 52.604vw. */}
      <div
        data-whereused-strip
        className="pointer-events-none absolute top-[26.57vh] left-[104.17vw] z-30 flex items-start gap-[2.604vw]"
      >
        {slides.map((s) => (
          <figure key={s.src} className="flex w-[50vw] shrink-0 flex-col items-center gap-[1.875vw]">
            <span className="relative block w-full aspect-[960/536] overflow-hidden rounded-[1.354vw] border-[0.52vw] border-white bg-white shadow-[0_-0.3125vw_5.2vw_rgba(0,0,0,0.1)]">
              <Image src={s.src} alt={s.caption} fill sizes="52vw" className="rounded-[0.83vw] object-cover" />
            </span>
            <figcaption className="text-center text-[1.5625vw] font-medium uppercase text-ink">
              {s.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      <WhereUsedScroll />
    </section>
  );
}
