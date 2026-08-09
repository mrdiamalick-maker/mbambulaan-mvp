import type { ReactNode } from "react";

export function PublicSectionHero({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="border-b border-white/10 bg-[#031a22] px-5 pb-14 pt-12 text-white md:px-10 md:pb-18 md:pt-16">
      <div className="mx-auto max-w-[1500px]">
        <p className="text-[11px] font-black uppercase tracking-[.16em] text-[#74e1d6]">{eyebrow}</p>
        <h1 className="mt-4 max-w-5xl text-4xl font-[760] leading-[1.02] tracking-[-.055em] md:text-6xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-white/68 md:text-lg md:leading-8">{description}</p>
        {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
