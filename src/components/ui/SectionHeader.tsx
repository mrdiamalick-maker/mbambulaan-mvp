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
  const titleClass = level === "page" ? "text-4xl font-black leading-tight sm:text-5xl" : "text-2xl font-black leading-tight sm:text-3xl";

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">{eyebrow}</p> : null}
        <Title className={`${eyebrow ? "mt-3" : ""} ${titleClass}`}>{title}</Title>
        {description ? <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#14312d]/65">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
