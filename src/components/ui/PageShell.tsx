import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className = "" }: PageShellProps) {
  return <main className={`min-h-screen bg-white px-4 py-5 text-[#0F2D4A] sm:px-6 lg:px-8 ${className}`}>{children}</main>;
}
