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

// Zoho CRM Web-to-Lead, wired straight into this form (no Zoho markup or styling on the page).
// The values below are copied verbatim from the web form Zoho generated for "Cryocap Website".
// They are public form identifiers that ship in Zoho's own embed code, not API keys or secrets.
const ZOHO = {
  action: "https://crm.zoho.in/crm/WebToLeadForm",
  // the hidden iframe the form posts into, so the visitor stays on the page
  target: "zoho-web-to-lead",
  hidden: {
    xnQsjsdp: "935571d313e3816b0a1671c7b6278cef652a92aefa133429686c30aaab5c831d",
    zc_gad: "",
    xmIwtLD: "6de8a45e95e8a54b02029ccbf6d2403efb66022598aa89a049f437da38c20f4599f7df8a4ae8364db255d99677f2eea8",
    actionType: "TGVhZHM=",
    returnURL: "null",
  },
  // Zoho's spam honeypot: a text field hidden from people, so only a bot fills it in
  honeypot: "aG9uZXlwb3Q",
};
// Zoho requires Company, but Organisation is optional here.
const COMPANY_FALLBACK = "Not provided";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// 10 digits, optionally prefixed +91. Spaces and dashes people type are ignored.
const PHONE_RE = /^(\+91)?\d{10}$/;

export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  // Whatever had focus when the modal opened (the CTA that triggered it), so closing returns
  // focus there instead of dropping it back to the top of the page.
  const triggerRef = useRef<HTMLElement | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  // Set from the first valid submit until the popup closes: disables Submit so a double click
  // cannot create two leads, and tells the iframe's load event that it is Zoho's response
  // rather than the frame's own initial about:blank load.
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const openContactModal = () => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setPhase("form");
    dialogRef.current?.showModal();
    // Focusing the first field is a keyboard convenience, so it is for pointers that have a
    // keyboard beside them. On a phone it throws up the on-screen keyboard over the form, and
    // on iOS it also zooms the page in on the field before the form has even been read.
    // Named, not "the first input": Zoho's hidden fields now come first in the form.
    if (window.matchMedia("(pointer: fine)").matches) {
      formRef.current?.querySelector<HTMLInputElement>('input[name="Last Name"]')?.focus();
    }
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
      submittingRef.current = false;
      setSubmitting(false);
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

  // Runs after the browser's own `required` check has passed. Adds the format checks that
  // `required` cannot express, reported through the same native validation bubble, then lets
  // the form post natively into the hidden iframe.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    if (submittingRef.current) {
      e.preventDefault();
      return;
    }
    const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
    const email = field("Email");
    const phone = field("Phone");
    email.setCustomValidity(EMAIL_RE.test(email.value.trim()) ? "" : "Please enter a valid email address.");
    phone.setCustomValidity(
      PHONE_RE.test(phone.value.replace(/[\s-]/g, "")) ? "" : "Please enter a 10-digit phone number, optionally starting with +91.",
    );
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
      return;
    }

    // Written into the field during the submit event, so it is what gets posted; the form is
    // swapped for the thank-you message before anyone could see it.
    const company = field("Company");
    if (!company.value.trim()) company.value = COMPANY_FALLBACK;

    submittingRef.current = true;
    setSubmitting(true);
    // No preventDefault: the native POST goes to Zoho through the iframe. The thank-you waits
    // for that frame to load (onZohoResponse) — swapping it in now would unmount the form in
    // the middle of its own submission, and the browser drops a submission whose form has left
    // the page.
  };

  // A custom validity message sticks until it is cleared, so clear it as soon as the visitor
  // edits the field; the next submit re-checks it.
  const clearValidity = (e: React.FormEvent<HTMLInputElement>) => e.currentTarget.setCustomValidity("");

  const onZohoResponse = () => {
    if (!submittingRef.current) return;
    setPhase("success");
  };

  return (
    <ContactModalContext.Provider value={{ openContactModal }}>
      {children}

      <dialog
        ref={dialogRef}
        onClick={onDialogClick}
        aria-labelledby="contact-modal-heading"
        // data-lenis-prevent, or this does not scroll on a phone at all: opening the modal
        // stops Lenis, and a stopped Lenis cancels every touchmove it sees — including the
        // ones meant for this panel. The attribute makes it skip them (lenis.mjs:609).
        data-lenis-prevent
        className="m-auto max-h-[90dvh] w-[min(92vw,480px)] overflow-y-auto overscroll-contain rounded-[clamp(18px,1.458vw,28px)] bg-white p-0 backdrop:bg-ink/40"
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

              <form
                ref={formRef}
                onSubmit={onSubmit}
                action={ZOHO.action}
                method="POST"
                acceptCharset="UTF-8"
                target={ZOHO.target}
                className="mt-[clamp(18px,1.875vw,32px)] flex flex-col gap-[clamp(14px,1.25vw,20px)]"
              >
                {/* type="hidden" and display:none both generate no box, so none of these take a
                    slot in the flex column or its gap. */}
                {Object.entries(ZOHO.hidden).map(([name, value]) => (
                  <input key={name} type="hidden" name={name} defaultValue={value} />
                ))}
                <input
                  type="text"
                  name={ZOHO.honeypot}
                  defaultValue=""
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ display: "none" }}
                />

                {/* Zoho field names: Name is the lead's "Last Name" (its one mandatory field) */}
                <Field label="Name" name="Last Name" autoComplete="name" maxLength={80} required />
                <Field label="Email ID" name="Email" type="email" autoComplete="email" maxLength={100} required onInput={clearValidity} />
                <Field label="Phone Number" name="Phone" type="tel" autoComplete="tel" maxLength={30} required onInput={clearValidity} />
                <Field label="Organisation" name="Company" autoComplete="organization" maxLength={200} />
                {/* Button's own py/leading-none make it noticeably shorter than the fields above it
                    (measured 40px against the fields' 52px at this viewport) — an explicit height
                    sidesteps that mismatch directly rather than fighting Button's base padding/
                    line-height classes for precedence. Calibrated off the field's OWN measured
                    height at its floor (40px) and at the 1920 reference width this project sizes
                    everything against (52px), matching both ends exactly. */}
                <Button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="mt-[clamp(4px,0.625vw,12px)] h-[clamp(40px,2.708vw,52px)] w-full justify-center"
                >
                  Submit
                </Button>
              </form>

              {/* Not everyone wants to fill in a form, so the two routes the team actually
                  monitors are offered directly. The rule above them matters: without it these
                  read as two more fields hanging off the bottom of the form rather than an
                  alternative to it. */}
              <div className="mt-[clamp(20px,1.77vw,32px)] border-t border-ink/10 pt-[clamp(16px,1.35vw,24px)]">
                <h3 className="text-[clamp(11px,0.73vw,13px)] font-semibold uppercase tracking-[0.08em] text-muted">
                  Other ways to reach us
                </h3>
                <div className="mt-[clamp(10px,0.9vw,16px)] flex flex-col gap-[clamp(8px,0.73vw,12px)]">
                  <ReachLink href="mailto:cryocap@atsuyatech.com" text="cryocap@atsuyatech.com">
                    <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
                    <path d="m3.6 6.9 8.4 6 8.4-6" />
                  </ReachLink>
                  <ReachLink href="tel:+916385731933" text="+91 6385731933">
                    <path d="M7.2 4h3l1.5 3.8-2 1.3a11 11 0 0 0 5.2 5.2l1.3-2 3.8 1.5v3a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 5.7 5.6 1.5 1.5 0 0 1 7.2 4Z" />
                  </ReachLink>
                </div>
              </div>
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
                {/* text-balance: this sentence is longer than the one the size was tuned for, and
                    can wrap on narrow panels; balancing keeps it from orphaning a single word. */}
                <h2 id="contact-modal-heading" className="text-[clamp(16px,1.2vw,22px)] font-extrabold leading-snug text-balance text-ink">
                  Thank you for your interest in Cryocap.
                </h2>
                <p className="text-[clamp(12px,0.9vw,15px)] font-normal text-muted">
                  Our team will reach out to you shortly.
                </p>
              </div>
              <Button onClick={close} variant="outline" className="mt-[clamp(4px,0.52vw,8px)]">
                Close
              </Button>
            </div>
          )}
        </div>

        {/* Receives Zoho's response so the page itself never navigates. Never shown: a
            display:none iframe still loads, and its load event is what flips to the thank-you. */}
        <iframe name={ZOHO.target} title="Zoho form submission" onLoad={onZohoResponse} hidden tabIndex={-1} aria-hidden="true" />
      </dialog>
    </ContactModalContext.Provider>
  );
}

// Email and phone are drawn inline rather than pulled from /public/icons: that set has no
// envelope, and pairing its filled phone with an inline outline envelope would put two
// different stroke weights side by side in the same list.
function ReachLink({ href, text, children }: { href: string; text: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex items-center gap-[clamp(10px,0.833vw,14px)] text-[clamp(13px,0.9vw,16px)] text-ink transition-colors hover:text-accent"
    >
      <span className="flex size-[clamp(30px,2.08vw,38px)] shrink-0 items-center justify-center rounded-full bg-surface text-accent">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[52%]"
          aria-hidden="true"
        >
          {children}
        </svg>
      </span>
      <span className="truncate">{text}</span>
    </a>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  onInput?: React.FormEventHandler<HTMLInputElement>;
};

function Field({ label, name, type = "text", required, autoComplete, maxLength, onInput }: FieldProps) {
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
        autoComplete={autoComplete}
        maxLength={maxLength}
        onInput={onInput}
        className="rounded-[clamp(10px,0.833vw,14px)] border border-ink/15 bg-white px-[clamp(12px,1.04vw,18px)] py-[clamp(9px,0.78vw,13px)] text-[16px] text-ink outline-none transition-colors focus:border-ink"
      />
    </label>
  );
}
