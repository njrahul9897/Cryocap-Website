"use client";

import Button from "@/components/ui/Button";
import { useContactModal } from "@/components/ContactModal";

// Hero.tsx and Footer.tsx are server components — they have nothing else that needs client JS
// — so the controls that do (opening the modal) are pulled out into this tiny client component
// rather than converting whole sections. Header.tsx is already a client component and calls
// useContactModal() directly instead of going through this. Defaults to the "Contact us"
// outline button; "Book a demo" reuses it with its own label, icon and variant, since there is
// no separate demo flow yet and the contact form is where those requests go.
export default function ContactButton({
  className = "",
  variant = "outline",
  icon = "/icons/phone.svg",
  children = "Contact us",
}: {
  className?: string;
  variant?: "solid" | "outline";
  icon?: string;
  children?: React.ReactNode;
}) {
  const { openContactModal } = useContactModal();
  return (
    <Button variant={variant} icon={icon} className={className} onClick={openContactModal}>
      {children}
    </Button>
  );
}
