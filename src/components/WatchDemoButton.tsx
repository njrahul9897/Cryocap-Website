"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import { getLenis } from "@/lib/lenis-store";

// The demo video plays in a lightbox over the site rather than sending people to YouTube.
// youtube-nocookie is YouTube's privacy-enhanced embed host; rel=0 keeps the end screen to this
// channel's own videos, and playsinline stops iOS from forcing its fullscreen player.
const VIDEO_ID = "a6AYuWJ21nE";
const EMBED_URL = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&playsinline=1`;

// `document.body` only exists in the browser: true on the client, false while server-rendering.
const noopSubscribe = () => () => {};

export default function WatchDemoButton({ className = "" }: { className?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // The iframe only exists while the lightbox is open: mounting it on open is what starts the
  // video (the click counts as the gesture autoplay needs), and unmounting it on close is the
  // simplest way to stop playback without the YouTube player API.
  const [open, setOpen] = useState(false);
  // Portalled to <body>: the hero's CTA row is transformed and faded by the scroll and intro
  // timelines, and a dialog inside it would inherit its `visibility` from the intro's hidden
  // start state.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const show = () => {
    setOpen(true);
    dialogRef.current?.showModal();
    // Same lock ContactModal uses: a native <dialog> does not stop Lenis scrolling the page.
    document.documentElement.style.overflow = "hidden";
    getLenis()?.stop();
  };
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // fires for the × button, Escape and a backdrop click alike
    const onClose = () => {
      setOpen(false);
      document.documentElement.style.overflow = "";
      getLenis()?.start();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [mounted]);

  return (
    <>
      <Button variant="outline" icon="/icons/play.svg" className={className} onClick={show}>
        Watch Video
      </Button>

      {mounted &&
        createPortal(
          <dialog
            ref={dialogRef}
            aria-label="Cryocap demo video"
            // a click on the ::backdrop lands on the dialog itself, never on the player
            onClick={(e) => e.target === dialogRef.current && close()}
            className="m-auto w-[min(92vw,1200px,calc(85dvh*16/9))] overflow-visible bg-transparent p-0 backdrop:bg-ink/80"
          >
            <button
              type="button"
              aria-label="Close video"
              onClick={close}
              className="absolute -top-[clamp(36px,2.6vw,48px)] right-0 text-[clamp(28px,2vw,36px)] leading-none text-white/80 transition-colors hover:text-white"
            >
              ×
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-[clamp(12px,1.04vw,20px)] bg-ink">
              {open && (
                <iframe
                  src={EMBED_URL}
                  title="Meet Cryocap – World’s First Patented Smart Cap"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="size-full"
                />
              )}
            </div>
          </dialog>,
          document.body,
        )}
    </>
  );
}
