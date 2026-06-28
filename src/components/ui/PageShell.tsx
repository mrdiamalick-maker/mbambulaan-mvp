import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className = "" }: PageShellProps) {
  return <main className={`min-h-screen bg-[#f6f8f7] px-4 py-5 text-[#14312d] sm:px-6 lg:px-8 ${className}`}>{children}</main>;
}
