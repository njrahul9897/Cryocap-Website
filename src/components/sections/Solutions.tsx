import SolutionCard from "@/components/SolutionCard";

// Figma frame 9: the six feature cards ride up the right-hand side ("Frame 25" at x=856,
// with the stack itself at x=882 / 705 wide) while the can stays put on the left, and the
// giant ghost wordmark slides up from the bottom the same way the "problems" label does.
const solutions = [
  {
    icon: "/icons/temperature-snow.svg",
    title: "Real-time Monitoring",
    badge: "Live Data",
    description:
      "Continuously tracks nitrogen level and temperature inside the container, giving instant visibility instead of periodic manual checks. This ensures any deviation from safe storage conditions is caught the moment it happens.",
  },
  {
    icon: "/icons/water-drop.svg",
    title: "Leakage Detection",
    badge: "Avoid Risk",
    description:
      "Identifies abnormal drops in nitrogen level that indicate a leak, distinguishing it from normal boil-off patterns. Early detection prevents unnoticed wastage and protects stored samples from temperature risk.",
  },
  {
    icon: "/icons/location.svg",
    title: "Location Tracking",
    badge: "Live Location",
    description:
      "Enables real-time tracking of the container’s location, useful for containers in transit or deployed across multiple field sites. This ensures accountability and quick retrieval in case of misplacement or theft.",
  },
  {
    icon: "/icons/mobile.svg",
    title: "Mobile App Connectivity",
    badge: "Seamless Connection",
    description:
      "Delivers live nitrogen levels, temperature data, and alerts directly to a smartphone, allowing users to monitor containers remotely from anywhere. This eliminates the need for constant physical supervision.",
  },
  {
    icon: "/icons/ai.svg",
    title: "AI Based Insights",
    badge: "Artificial Intelligence",
    description:
      "Analyzes usage patterns and historical data to predict nitrogen depletion trends and recommend optimal refill schedules. This helps prevent unexpected shortages and optimizes nitrogen consumption over time.",
  },
  {
    icon: "/icons/water-drop.svg",
    title: "Low Nitrogen Alerts",
    badge: "Notification",
    description:
      "Sends instant notifications when nitrogen levels fall below a safe threshold, prompting timely refilling before quality is compromised. This proactive alerting removes the guesswork and risk of running out unnoticed.",
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
