import type { ReactNode } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

type InsightPanelProps = {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  description?: string;
  className?: string;
};

export function InsightPanel({ children, className = "", description, eyebrow, title }: InsightPanelProps) {
  return (
    <section className={`rounded-3xl bg-white p-5 shadow-[0_18px_45px_rgba(15,45,74,0.06)] ring-1 ring-[#E2E8F0] sm:p-6 ${className}`}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-5">{children}</div>
    </section>
  );
}
