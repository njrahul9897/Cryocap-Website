import SolutionCard from "@/components/SolutionCard";

// Figma frame 9: the six feature cards ride up the right-hand side ("Frame 25" at x=856,
// with the stack itself at x=882 / 705 wide) while the can stays put on the left, and the
// giant ghost wordmark slides up from the bottom the same way the "problems" label does.
const solutions = [
  {
    icon: "/icons/water-drop.svg",
    title: "Live nitrogen level",
    badge: "Live Data",
    description: "Sensors track the LN₂ level 24×7, so you always know what’s left.",
  },
  {
    icon: "/icons/mobile.svg",
    title: "No need to open the can",
    badge: "Remote Check",
    description: "Check every can from your phone. The lid stays closed and the cold stays in.",
  },
  {
    icon: "/icons/ai.svg",
    title: "Refills planned, wherever the can is",
    badge: "AI + Location",
    description:
      "The AI learns each can’s evaporation rate and predicts the next refill. Live location tracks every can on the road.",
  },
  {
    icon: "/icons/temperature-snow.svg",
    title: "Temperature checked every 30 seconds",
    badge: "Temperature",
    description: "Any warming shows up in the app straight away.",
  },
  {
    icon: "/icons/bell.svg",
    title: "Alerts before it’s too late",
    badge: "Instant Alerts",
    description:
      "Instant alerts on your phone when nitrogen runs low or the temperature drifts.",
  },
  {
    icon: "/icons/temperature.svg",
    title: "Every straw protected, with proof",
    badge: "Cold Chain Proof",
    description:
      "Automatic temperature logs show the cold chain held, from semen station to village.",
  },
];

export default function Solutions() {
  return (
    <>
      <div
        data-solutions="cards"
        // opacity-0 matters: StageScroll only parks these once the intro reveal has finished, so
        // without it the stack sits at top-0 fully opaque through the reveal and early hero
        className="pointer-events-none absolute top-0 left-[45.94vw] z-30 flex w-[36.74vw] flex-col gap-[3.125vw] opacity-0 max-lg:left-[6vw] max-lg:w-[88vw] max-lg:gap-6"
      >
        {solutions.map((s) => (
          <SolutionCard key={s.title} {...s} />
        ))}
      </div>

      {/* Figma "solutions": 156px extrabold at 5% black, clipped so it can slide into place */}
      <div className="pointer-events-none absolute bottom-0 left-[26.09vw] z-10 hidden h-[7.39vw] overflow-hidden lg:block">
        <p
          data-solutions="word"
          className="translate-y-full text-[8.125vw] font-extrabold uppercase leading-[0.909] whitespace-nowrap text-black/5"
        >
          solutions
        </p>
      </div>
    </>
  );
}
