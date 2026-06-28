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
  primary: "bg-[#1F6F8B] text-white shadow-sm shadow-[#1F6F8B]/20 hover:bg-[#0F2D4A]",
  secondary: "bg-white text-[#0F2D4A] ring-1 ring-[#E2E8F0] hover:bg-[#F8FAFC]",
  ghost: "bg-transparent text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F2D4A]"
};

export function Button({ children, className = "", href, type = "button", variant = "primary", ...props }: ButtonProps) {
  const classes = `inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-black transition ${variantStyles[variant]} ${className}`;

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
