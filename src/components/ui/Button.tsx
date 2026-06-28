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
  primary: "bg-white text-[#0F2D4A] ring-1 ring-[#0F2D4A]/14 hover:bg-[#F8FAFC]",
  secondary: "bg-transparent text-[#0F2D4A] ring-1 ring-[#1F6F8B]/18 hover:bg-[#F8FAFC]",
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
