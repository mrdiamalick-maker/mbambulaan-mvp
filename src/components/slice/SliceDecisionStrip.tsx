import Link from "next/link";
import type { MvpSliceSummary, SliceStepKey } from "@/lib/mvpSlice";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

const stepLabels: Record<SliceStepKey, string> = {
  signal: "Signal terrain",
  qualification: "Qualification",
  tension: "Tension",
  opportunity: "Opportunité",
  action: "Action",
  proof: "Preuve",
  report: "Rapport"
};

export function SliceDecisionStrip({ active, slice }: { active: SliceStepKey; slice: MvpSliceSummary }) {
  const current = slice.steps.find((step) => step.key === active) ?? slice.steps[0];

  return (
    <section className="bg-[#F8FAFC] px-5 py-5 text-[#0F2D4A] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <ProductCard tone="active" className="p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="dark">Slice MVP</StatusBadge>
                <StatusBadge tone="info">{stepLabels[active]}</StatusBadge>
              </div>
              <h2 className="mt-3 text-2xl font-black text-[#0F2D4A]">{current.title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#334155]">{current.decision}</p>
            </div>
            <Link href="/demo" className="rounded-xl bg-[#0F2D4A] px-4 py-3 text-center text-xs font-black text-white transition hover:bg-[#1F6F8B]">
              Voir le flux complet
            </Link>
          </div>
          <div className="mt-5 grid gap-2 md:grid-cols-7">
            {slice.steps.map((step) => (
              <Link key={step.key} href={step.href} className={`rounded-xl px-3 py-3 text-xs font-black ring-1 transition ${step.key === active ? "bg-[#0F2D4A] text-white ring-[#0F2D4A]" : "bg-[#F8FAFC] text-[#334155] ring-[#E2E8F0] hover:bg-white"}`}>
                {stepLabels[step.key]}
              </Link>
            ))}
          </div>
        </ProductCard>
      </div>
    </section>
  );
}
