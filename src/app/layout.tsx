import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import { ContactModalProvider } from "@/components/ContactModal";
import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "800"],
});

export const metadata: Metadata = {
  title: "Cryocap — World's First Smart Cryocan Cap",
  description:
    "Smart monitoring for safer & better livestock breeding. Patented smart cap by Atsuya Technologies.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs while the HTML is still parsing — before any bundle, and before the browser restores a
// scroll position. Both matter here. This page is a chain of pinned, scroll-scrubbed sections
// whose triggers are rebuilt from nothing on every load, so a restored offset drops the document
// at a position that belongs to a layout which does not exist yet: parts of other sections paint
// behind the intro, and the moment the intro releases `overflow` the browser applies the pending
// restore and the page jumps to wherever it was left. It has to be done HERE and not in an
// effect: `scrollRestoration` belongs to the document, resets to "auto" on every navigation, and
// is consulted before React has run at all, so setting it from the previous document does
// nothing for the reload.
const SCROLL_SETUP = "try{history.scrollRestoration='manual'}catch(e){}";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-intro-pending holds the page still until IntroReveal takes it off. It ships in the
    // markup so the lock exists from the first paint rather than from hydration — see the rule
    // it drives in globals.css.
    <html lang="en" data-intro-pending="" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: SCROLL_SETUP }} />
        {/* With JS off there is no intro, and nothing ever runs to release the lock, so it has
            to let go on its own rather than leaving the page unscrollable. */}
        <noscript>
          <style>{`html[data-intro-pending],html[data-intro-pending] body{overflow:visible;touch-action:auto}`}</style>
        </noscript>
        <ContactModalProvider>
          <SmoothScroll>
            <Header />
            {children}
            <BottomBar />
          </SmoothScroll>
        </ContactModalProvider>
      </body>
    </html>
  );
}
