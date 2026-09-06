import type { ReactNode } from "react";

type ListItemCardProps = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
};

export function ListItemCard({ children, className = "", interactive = true }: ListItemCardProps) {
  return (
    <article
      className={`rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-4 shadow-[var(--shadow-sm)] transition-[background-color,box-shadow,transform] duration-200 md:p-5 ${
        interactive ? "hover:-translate-y-px hover:bg-[var(--canvas)] hover:shadow-[var(--shadow-md)]" : ""
      } ${className}`}
    >
      {children}
    </article>
  );
}
