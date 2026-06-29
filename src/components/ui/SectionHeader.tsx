import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  level?: "page" | "section";
};

export function SectionHeader({ action, description, eyebrow, level = "section", title }: SectionHeaderProps) {
  const Title = level === "page" ? "h1" : "h2";
  const titleClass = level === "page" ? "text-3xl font-black leading-tight sm:text-4xl" : "text-xl font-black leading-tight sm:text-2xl";

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">{eyebrow}</p> : null}
        <Title className={`${eyebrow ? "mt-2" : ""} ${titleClass} text-[#0F2D4A]`}>{title}</Title>
        {description ? <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#334155]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
