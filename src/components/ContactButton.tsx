"use client";

import Button from "@/components/ui/Button";
import { useContactModal } from "@/components/ContactModal";

// Footer.tsx is a server component — it has nothing else that needs client JS — so the one
// control that does (opening the modal) is pulled out into its own tiny client component
// rather than converting the whole section. Header.tsx is already a client component and
// calls useContactModal() directly instead of going through this.
export default function ContactButton({ className = "" }: { className?: string }) {
  const { openContactModal } = useContactModal();
  return (
    <Button variant="outline" icon="/icons/phone.svg" className={className} onClick={openContactModal}>
      Contact us
    </Button>
  );
}
