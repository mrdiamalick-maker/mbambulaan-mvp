import type { ReactNode } from "react";

type ModuleCardProps = {
  children: ReactNode;
  as?: "article" | "div";
  className?: string;
  interactive?: boolean;
};

export function ModuleCard({ as = "article", children, className = "", interactive = false }: ModuleCardProps) {
  const Component = as;

  return (
    <Component className={`rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0] transition sm:p-5 ${interactive ? "hover:-translate-y-0.5 hover:bg-white hover:shadow-sm" : ""} ${className}`}>
      {children}
    </Component>
  );
}
