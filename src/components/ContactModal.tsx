"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { getLenis } from "@/lib/lenis-store";

// Single modal, mounted once at the root (see RootLayout) and opened from wherever a "Contact
// us" control lives — the header's own link and the footer's CTA both point here instead of
// each carrying its own copy of the form. Context rather than prop-drilling, since the two
// triggers sit in otherwise-unrelated branches of the tree (global chrome vs. a page section).
type ContactModalContextValue = { openContactModal: () => void };
const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) throw new Error("useContactModal must be called inside <ContactModalProvider>");
  return ctx;
}

type Phase = "form" | "success";

export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  // Whatever had focus when the modal opened (the CTA that triggered it), so closing returns
  // focus there instead of dropping it back to the top of the page.
  const triggerRef = useRef<HTMLElement | null>(null);
  const [phase, setPhase] = useState<Phase>("form");

  const openContactModal = () => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setPhase("form");
    dialogRef.current?.showModal();
    // showModal() does NOT stop the page scrolling on its own — this site's wheel events are
    // driven by Lenis, which has no idea a native <dialog> just grabbed focus and keeps
    // smooth-scrolling the document underneath it. Same stop/start pair IntroReveal uses.
    document.documentElement.style.overflow = "hidden";
    getLenis()?.stop();
  };
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // `close` fires for every exit path alike — the × button, the Escape key (native to
    // <dialog>, no listener needed for that one), and a backdrop click — so resetting here
    // covers all three in one place rather than at each call site.
    const onClose = () => {
      document.documentElement.style.overflow = "";
      getLenis()?.start();
      triggerRef.current?.focus?.();
      formRef.current?.reset();
      setPhase("form");
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  // A click anywhere in the ::backdrop lands on the <dialog> element itself — never on the
  // panel nested inside it — so comparing the event target against the dialog is enough to
  // tell a backdrop click from a click inside the form, with no separate overlay element.
  const onDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) close();
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // This is a static export with no backend yet, so there is nowhere to actually send this —
    // the browser's own `required`/`type` validation is the only check that runs before the
    // confirmation shows. Wire a real destination (an API route, a mailto, a CRM webhook) here
    // once one exists.
    setPhase("success");
  };

  return (
    <ContactModalContext.Provider value={{ openContactModal }}>
      {children}

      <dialog
        ref={dialogRef}
        onClick={onDialogClick}
        aria-labelledby="contact-modal-heading"
        className="m-auto max-h-[90dvh] w-[min(92vw,480px)] overflow-y-auto rounded-[clamp(18px,1.458vw,28px)] bg-white p-0 backdrop:bg-ink/40"
      >
        <div className="relative p-[clamp(24px,2.6vw,48px)]">
          {/* Only the form phase gets the × — the success phase has its own "Close" button
              below the message, so a second, redundant way to dismiss it right above would be
              pure clutter there. */}
          {phase === "form" && (
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute right-[clamp(14px,1.56vw,30px)] top-[clamp(14px,1.56vw,30px)] text-[1.5rem] leading-none text-muted transition-colors hover:text-ink"
            >
              ×
            </button>
          )}

          {phase === "form" ? (
            <>
              <h2 id="contact-modal-heading" className="pr-8 text-[clamp(22px,1.875vw,32px)] font-extrabold leading-tight text-ink">
                Contact us
              </h2>
              <p className="mt-[clamp(6px,0.625vw,12px)] text-[clamp(13px,0.9vw,16px)] text-muted">
                Tell us a bit about you and we’ll be in touch.
              </p>

              <form ref={formRef} onSubmit={onSubmit} className="mt-[clamp(18px,1.875vw,32px)] flex flex-col gap-[clamp(14px,1.25vw,20px)]">
                <Field label="Name" name="name" autoComplete="name" autoFocus required />
                <Field label="Email ID" name="email" type="email" autoComplete="email" required />
                <Field label="Phone Number" name="phone" type="tel" autoComplete="tel" required />
                <Field label="Organisation" name="organisation" autoComplete="organization" />
                {/* Button's own py/leading-none make it noticeably shorter than the fields above it
                    (measured 40px against the fields' 52px at this viewport) — an explicit height
                    sidesteps that mismatch directly rather than fighting Button's base padding/
                    line-height classes for precedence. Calibrated off the field's OWN measured
                    height at its floor (40px) and at the 1920 reference width this project sizes
                    everything against (52px), matching both ends exactly. */}
                <Button
                  type="submit"
                  className="mt-[clamp(4px,0.625vw,12px)] h-[clamp(40px,2.708vw,52px)] w-full justify-center"
                >
                  Submit
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center gap-[clamp(14px,1.25vw,20px)] py-[clamp(10px,1.04vw,16px)] text-center">
              {/* Pops in, then the check draws itself along its own path — keyframes in
                  globals.css, since Tailwind has no utility for animating stroke-dashoffset. */}
              <span className="flex size-[clamp(48px,4.17vw,64px)] items-center justify-center rounded-full bg-surface text-accent [animation:contact-success-pop_0.45s_ease-out]">
                <svg viewBox="0 0 24 24" fill="none" className="size-[55%]" aria-hidden="true">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ strokeDasharray: 20, strokeDashoffset: 20 }}
                    className="[animation:contact-success-check_0.4s_0.3s_ease-out_forwards]"
                  />
                </svg>
              </span>
              <div className="flex flex-col gap-[clamp(4px,0.417vw,8px)]">
                {/* Sized to hold this exact sentence on one line inside the panel (measured via
                    canvas text metrics against the panel's actual inner width) — the original
                    heading size wrapped it as "...reaching out to / us.", orphaning two words. */}
                <h2 id="contact-modal-heading" className="text-[clamp(16px,1.2vw,22px)] font-extrabold leading-snug text-ink">
                  Thank you for reaching out to us.
                </h2>
                <p className="text-[clamp(12px,0.9vw,15px)] font-normal text-muted">
                  Our team will get back to you shortly.
                </p>
              </div>
              <Button onClick={close} variant="outline" className="mt-[clamp(4px,0.52vw,8px)]">
                Close
              </Button>
            </div>
          )}
        </div>
      </dialog>
    </ContactModalContext.Provider>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
};

function Field({ label, name, type = "text", required, autoFocus, autoComplete }: FieldProps) {
  return (
    <label className="flex flex-col gap-[clamp(4px,0.417vw,8px)] text-left">
      <span className="text-[clamp(12px,0.833vw,14px)] font-medium text-ink">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        className="rounded-[clamp(10px,0.833vw,14px)] border border-ink/15 bg-white px-[clamp(12px,1.04vw,18px)] py-[clamp(9px,0.78vw,13px)] text-[clamp(13px,0.9vw,16px)] text-ink outline-none transition-colors focus:border-ink"
      />
    </label>
  );
}
