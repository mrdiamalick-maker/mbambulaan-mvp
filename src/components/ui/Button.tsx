import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[#0f2f2b] text-white hover:bg-[#17453f]",
  secondary: "border border-[#14312d]/20 bg-white text-[#14312d] hover:border-[#14312d]/45 hover:bg-[#f7f9f8]",
  ghost: "bg-[#f7f9f8] text-[#14312d] ring-1 ring-[#14312d]/8 hover:bg-white"
};

export function Button({ children, className = "", href, type = "button", variant = "primary", ...props }: ButtonProps) {
  const classes = `inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-black shadow-sm transition ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
