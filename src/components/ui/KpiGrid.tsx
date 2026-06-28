import type { ReactNode } from "react";

type KpiItem = {
  label: string;
  value: string;
  detail?: string;
  badge?: ReactNode;
};

export function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.label} className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_12px_28px_rgba(15,45,74,0.05)]">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#1F6F8B]">{item.label}</p>
            {item.badge ? <div className="shrink-0">{item.badge}</div> : null}
          </div>
          <p className="mt-2 text-2xl font-black leading-tight text-[#0F2D4A]">{item.value}</p>
          {item.detail ? <p className="mt-2 text-sm font-semibold leading-5 text-[#334155]">{item.detail}</p> : null}
        </article>
      ))}
    </div>
  );
}
