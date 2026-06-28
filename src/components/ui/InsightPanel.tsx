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
    <section className={`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8 ${className}`}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-6">{children}</div>
    </section>
  );
}
