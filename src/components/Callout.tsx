import Image from "next/image";

type Props = {
  side: "left" | "right";
  pair: "a" | "b";
  icon: string;
  title: string;
  description: string;
};

// Figma "Left/Right Aligned" callout: 706 x 229 box; leader line at 26.2%, icon 46px at the
// outer corner, title and description in clipped boxes so they can slide into view.
export default function Callout({ side, pair, icon, title, description }: Props) {
  const right = side === "right";
  return (
    <div
      data-callout={pair}
      data-side={side}
      className={`absolute z-20 aspect-[706/229] w-[min(90vw,36.77vw)] max-lg:w-[88vw] ${
        right ? "lg:top-[63.8svh] lg:left-[58.54vw] max-lg:top-[69svh] max-lg:right-[6vw]" : "lg:top-[15.46svh] lg:left-[4.69vw] max-lg:top-[13svh] max-lg:left-[6vw]"
      }`}
    >
      <div
        data-callout-line
        className={`absolute top-[26.2%] h-[5.24%] w-full scale-x-0 ${right ? "origin-left" : "origin-right"}`}
      >
        <div className={`absolute inset-0 bg-[length:100%_100%] bg-no-repeat ${right ? "bg-[url(/icons/callout-line-right.svg)]" : "bg-[url(/icons/callout-line-left.svg)]"}`} />
      </div>

      {/* `size-[6.5%]` resolved width against the callout's own width but height against its
          height — and this box is a wide, short (706x229) rectangle, so that gave a squashed
          ~36x12px box instead of a square, capping every icon's visible height at 12px
          regardless of this fixed max. A fixed square (scaling down only on narrow viewports)
          avoids that mismatch; 34px is the longer edge every icon should max out at. */}
      <div className={`absolute top-0 size-[clamp(20px,1.77vw,34px)] overflow-hidden ${right ? "right-0" : "left-0"}`}>
        <div data-callout-icon className="relative size-full opacity-0">
          {/* object-contain: several of these icons (water-drop, bell, caution) aren't square —
              `fill` alone stretches them to fill this square box, squeezing their proportions */}
          <Image src={icon} alt="" fill sizes="34px" className="object-contain" />
        </div>
      </div>

      <div className={`absolute top-[37.55%] h-[27.5%] w-full overflow-hidden ${right ? "text-right" : ""}`}>
        <h3 data-callout-title className="opacity-0 text-[clamp(20px,2.6vw,50px)] font-extrabold leading-[1.26] whitespace-nowrap">
          {title}
        </h3>
      </div>

      <div className={`absolute top-[65.07%] -bottom-[60%] w-full overflow-hidden ${right ? "text-right" : ""}`}>
        <p
          data-callout-desc
          className={`mt-[2.83%] opacity-0 text-[clamp(12px,1.25vw,24px)] leading-[1.26] text-muted ${right ? "ml-auto" : ""} w-[90.65%]`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
