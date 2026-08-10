"use client";

import { HandCoins } from "lucide-react";
import { MinistryHero } from "@/components/ministry/MinistryHero";
import { incomeLevers, incomeLeverMaturityLabels, type IncomeLeverMaturity } from "@/data/ministry-income-levers";
import { useProduct } from "@/components/providers/ProductProvider";

const maturityStyle: Record<IncomeLeverMaturity, string> = {
  piste: "op-badge--neutral",
  en_cadrage: "op-badge--warning",
  actif: "op-badge--success"
};

export default function MinistryIncomePage() {
  const { state } = useProduct();
  const territoryName = (id: string) => state?.territories.find((item) => item.id === id)?.name ?? id;

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <MinistryHero
        eyebrow="Revenus alternatifs"
        title="Donner aux ménages de pêcheurs d'autres sources de revenus."
        description="Un catalogue de leviers à qualifier et prioriser avec les communautés, pas une liste de programmes déjà engagés. Chaque piste indique son degré de maturité et ce qu'il faut mobiliser pour la faire avancer."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {incomeLevers.map((lever) => (
          <article key={lever.id} className="op-card p-6">
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--op-signal-100)] text-[var(--op-signal-600)]"><HandCoins size={18} /></span>
              <span className={`op-badge ${maturityStyle[lever.maturity]}`}>{incomeLeverMaturityLabels[lever.maturity]}</span>
            </div>
            <h2 className="mt-4 text-lg font-bold tracking-[-.02em] text-[var(--op-ink-900)]">{lever.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--op-ink-500)]">{lever.pitch}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[.06em] text-[var(--op-ink-400)]">Public visé</p>
            <p className="mt-1 text-sm text-[var(--op-ink-700)]">{lever.targetProfile}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[.06em] text-[var(--op-ink-400)]">À mobiliser</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {lever.requiredSupport.map((item) => <span key={item} className="op-badge op-badge--neutral">{item}</span>)}
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[.06em] text-[var(--op-ink-400)]">Territoires pilotes envisagés</p>
            <p className="mt-1 text-sm text-[var(--op-ink-700)]">{lever.territoryIds.map(territoryName).join(", ")}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
