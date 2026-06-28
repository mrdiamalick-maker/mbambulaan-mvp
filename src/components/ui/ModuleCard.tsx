import type { ReactNode } from "react";

type ModuleCardProps = {
  children: ReactNode;
  as?: "article" | "div";
  className?: string;
};

export function ModuleCard({ as = "article", children, className = "" }: ModuleCardProps) {
  const Component = as;

  return (
    <Component className={`rounded-2xl bg-[#f7f4ec] p-5 ring-1 ring-[#14312d]/5 transition ${className}`}>
      {children}
    </Component>
  );
}
