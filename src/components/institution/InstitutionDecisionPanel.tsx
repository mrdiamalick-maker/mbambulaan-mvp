"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import type { ProductState } from "@/domain/types";
import { generateInstitutionInsights } from "@/domain/institution/decision-engine";

export function InstitutionDecisionPanel({ state }: { state: ProductState }) {
  const insights = generateInstitutionInsights(state);

  return (
    <section className="rounded-2xl border-l-4 border-l-[#b6522f] bg-muted/25 p-5 lg:p-6">
      <div className="flex items-center gap-2 text-[#b6522f]"><AlertTriangle size={18} /><p className="text-xs font-bold uppercase tracking-widest">Priorités décisionnelles</p></div>
      <h2 className="mt-3 text-xl font-semibold">Où agir maintenant ?</h2>
      <div className="mt-5 divide-y border-y">
        {insights.slice(0, 5).map((item) => (
          <article key={item.territoryId + item.title} className="grid gap-4 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1d4468]">{item.territoryName}</p>
              <h3 className="mt-1.5 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.explanation}</p>
              <p className="mt-2 text-sm font-semibold">Action : {item.action}</p>
            </div>
            <ArrowRight size={17} className="text-[#b6522f]" />
          </article>
        ))}
      </div>
    </section>
  );
}
