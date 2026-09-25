import Image from "next/image";

type Props = {
  icon: string;
  title: string;
  badge: string;
  description: string;
};

// Figma "Frame 22": a 14px gradient ring around a white 16px-radius card (705 x ~178 in the
// 1920 frame). Header row is a 36px icon + title on the left and a status pill on the right,
// with the description underneath. Sizes are vw-scaled off the 1920 frame like the rest of
// the project, so the card holds its proportions down to tablet widths.

// All these icons share a 36x36 viewBox except water-drop.svg, which is both non-square AND
// drawn with far less internal padding than the rest (its ink nearly fills the full height).
// Fitting it into the same box with `object-contain` fixes the stretch but not this: it still
// reads visibly bigger than the others, since they only fill ~75% of their box. Scaling it down
// to match brings its rendered size in line with its neighbours.
const ICON_SCALE: Record<string, string> = {
  "/icons/water-drop.svg": "scale-75",
};

export default function SolutionCard({ icon, title, badge, description }: Props) {
  return (
    <div
      data-solution-card
      // mild, well-spread shadow so the card lifts off the page background rather than sitting
      // flat against it — a soft close layer plus a larger, more diffuse one underneath
      className="rounded-[clamp(18px,1.458vw,28px)] bg-linear-to-r from-[rgba(230,230,230,0.36)] to-[rgba(0,0,0,0.06)] p-[clamp(8px,0.729vw,14px)] shadow-[0_4px_16px_rgba(0,0,0,0.04),0_24px_48px_-12px_rgba(0,0,0,0.12)]"
    >
      <div className="flex flex-col gap-[clamp(9px,0.781vw,15px)] rounded-[clamp(10px,0.833vw,16px)] bg-white px-[clamp(16px,1.354vw,26px)] py-[clamp(13px,1.042vw,20px)]">
        <div className="flex items-center justify-between gap-[clamp(10px,0.833vw,16px)]">
          <div className="flex min-w-0 items-center gap-[clamp(9px,0.781vw,15px)]">
            <span className={`relative size-[clamp(24px,1.875vw,36px)] shrink-0 ${ICON_SCALE[icon] ?? ""}`}>
              {/* object-contain: water-drop.svg isn't square like the other icons — `fill` alone
                  stretched it to fill this square box, making it look oversized and squeezed */}
              <Image src={icon} alt="" fill sizes="36px" className="object-contain" />
            </span>
            <h3 className="truncate text-[clamp(16px,1.25vw,24px)] font-semibold leading-tight">{title}</h3>
          </div>

          <span className="inline-flex shrink-0 items-center gap-[clamp(6px,0.52vw,10px)] rounded-full bg-surface px-[clamp(10px,0.833vw,16px)] py-[clamp(8px,0.625vw,12px)] text-[clamp(11px,0.78vw,15px)] leading-none">
            <span className="size-[clamp(5px,0.365vw,7px)] shrink-0 rounded-full bg-ink" />
            {badge}
          </span>
        </div>

        <p className="text-[clamp(12px,0.833vw,16px)] leading-[1.5] text-muted">{description}</p>
      </div>
    </div>
  );
}
