"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLenis } from "@/lib/lenis-store";

const dots = Array.from({ length: 9 });

export default function Header() {
  const pathname = usePathname();

  // On the home page the logo should just take you back to the hero (scroll to
  // top) rather than re-triggering navigation — the intro reveal only ever
  // plays again on an actual full page reload, not on this "soft reset".
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      getLenis()?.scrollTo(0, { duration: 1.5 });
    }
  };

  return (
    <header data-intro="chrome" className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-gutter pt-[clamp(1.25rem,2.5vw,2.5rem)]">
      <Link
        href="/"
        aria-label="Cryocap home"
        onClick={handleLogoClick}
        className="relative block h-[clamp(25px,1.77vw,34px)] w-[clamp(110px,7.8vw,150px)]"
      >
        <Image src="/brand/cryocap-logo.svg" alt="Cryocap" fill priority sizes="150px" />
      </Link>

      <div className="flex items-center gap-4 md:gap-[clamp(20px,1.875vw,36px)]">
        <Link
          href="/contact"
          className="inline-flex items-center gap-[clamp(7px,0.52vw,10px)] rounded-full border border-ink bg-white px-[clamp(10px,1.04vw,20px)] py-[clamp(9px,0.625vw,12px)] text-[clamp(13px,0.833vw,16px)] font-medium leading-none text-ink transition-colors hover:bg-surface"
        >
          <span className="relative size-[clamp(20px,1.354vw,26px)] shrink-0">
            <Image src="/icons/phone.svg" alt="" fill sizes="26px" />
          </span>
          <span className="hidden sm:inline">Contact Us</span>
        </Link>

        <button
          type="button"
          aria-label="Open menu"
          className="grid grid-cols-3 gap-[clamp(3px,0.208vw,4px)] p-1 transition-opacity hover:opacity-60"
        >
          {dots.map((_, i) => (
            <span key={i} className="size-[clamp(4px,0.3125vw,6px)] rounded-full bg-ink" />
          ))}
        </button>
      </div>
    </header>
  );
}
