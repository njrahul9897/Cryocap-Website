import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "solid" | "outline";

type ButtonProps = {
  variant?: Variant;
  icon?: string;
  iconLabel?: string;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & Omit<ComponentProps<"button">, "children" | "className">;

const base =
  "inline-flex items-center justify-center gap-[clamp(7px,0.52vw,10px)] rounded-full px-[clamp(12px,0.833vw,16px)] py-[clamp(9px,0.625vw,12px)] text-[clamp(13px,0.833vw,16px)] font-medium leading-none transition-colors whitespace-nowrap";

const variants: Record<Variant, string> = {
  solid: "bg-ink text-white hover:bg-black",
  outline: "border border-ink bg-white text-ink hover:bg-surface",
};

export default function Button({
  variant = "solid",
  icon,
  iconLabel = "",
  href,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;
  const content = (
    <>
      {icon && (
        <span className="relative size-[clamp(20px,1.354vw,26px)] shrink-0 overflow-clip">
          <Image src={icon} alt={iconLabel} fill sizes="26px" />
        </span>
      )}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}
