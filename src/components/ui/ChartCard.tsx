import type { ReactNode } from "react";

type BarItem = {
  label: string;
  value: string;
  percent: number;
  meta?: string;
};

export function ChartCard({ children, eyebrow, items, title }: { children?: ReactNode; eyebrow?: string; items?: BarItem[]; title: string }) {
  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_14px_34px_rgba(15,45,74,0.05)]">
      {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">{eyebrow}</p> : null}
      <h3 className="mt-2 text-lg font-black text-[#0F2D4A]">{title}</h3>
      {items ? (
        <div className="mt-5 grid gap-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <p className="font-black text-[#0F2D4A]">{item.label}</p>
                <p className="font-bold text-[#334155]">{item.value}</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[#F1F5F9]">
                <div className="h-2 rounded-full bg-[#1F6F8B]" style={{ width: `${Math.max(8, Math.min(100, item.percent))}%` }} />
              </div>
              {item.meta ? <p className="mt-1 text-xs font-semibold text-[#64748B]">{item.meta}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
