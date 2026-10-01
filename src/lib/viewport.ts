/**
 * The viewport height with the mobile browser's chrome RETRACTED — CSS `100lvh`.
 *
 * `window.innerHeight` is whatever the viewport is at this instant, and on a phone that grows by
 * the height of the URL bar the moment you start scrolling. Anything parked "just below the
 * fold" off a measurement taken before that happens ends up short: the section is `h-dvh`, so it
 * grows with the viewport while the parked offset stays where it was, and a sliver of the
 * element appears at the bottom edge — measured at 17-23px for the how-it-works cap on common
 * phone sizes, arriving exactly when scrolling starts, which is what made it look random.
 *
 * `lvh` is the largest the viewport can become and never changes, so parking against it clears
 * in both states. On desktop `lvh` and `dvh` are the same, so this changes nothing there.
 */
export function largeViewportHeight(): number {
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);
  const height = probe.offsetHeight;
  probe.remove();
  // 0 if the browser does not know `lvh`; then the current height is the best available guess
  return height || window.innerHeight;
}
