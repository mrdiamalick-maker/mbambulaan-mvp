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
  primary: "bg-[#0F2D4A] text-white hover:bg-[#1F6F8B]",
  secondary: "border border-[#0F2D4A]/20 bg-white text-[#0F2D4A] hover:border-[#1F6F8B]/60 hover:bg-[#F7F2E8]",
  ghost: "bg-[#F7F2E8] text-[#0F2D4A] ring-1 ring-[#0F2D4A]/8 hover:bg-white"
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
