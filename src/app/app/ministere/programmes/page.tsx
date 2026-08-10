"use client";

import { Banknote, Target } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { MinistryHero } from "@/components/ministry/MinistryHero";

const statusLabels: Record<string, string> = {
  cadrage: "En cadrage",
  financee: "Financée",
  execution: "En exécution",
  terminee: "Terminée"
};

const fundingStatusLabels: Record<string, string> = {
  a_mobiliser: "À mobiliser",
  en_instruction: "En instruction",
  confirme: "Confirmé"
};

function formatFcfa(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`;
}

export default function MinistryProgramsPage() {
  const { state } = useProduct();
  if (!state) return null;
  const territoryName = (id: string) => state.territories.find((item) => item.id === id)?.name ?? id;

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <MinistryHero
        eyebrow="Programmes & bailleurs"
        title="Des dossiers prêts à être présentés aux partenaires financiers."
        description="Chaque programme montre son objectif, son financement et un indicateur clé — de quoi capter l'intérêt d'un bailleur en une lecture, sans dérouler un tableau de gestion interne."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {state.initiatives.map((initiative) => {
          const confirmed = initiative.funding.filter((item) => item.status === "confirme").reduce((sum, item) => sum + item.amountFcfa, 0);
          const mobilized = Math.round((confirmed / initiative.budgetFcfa) * 100);
          const headlineIndicator = initiative.indicators[0];
          return (
            <article key={initiative.id} className="op-card p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--op-signal-100)] text-[var(--op-signal-600)]"><Banknote size={18} /></span>
                <span className="op-badge op-badge--signal">{statusLabels[initiative.status] ?? initiative.status}</span>
              </div>
              <h2 className="mt-4 text-lg font-bold tracking-[-.02em] text-[var(--op-ink-900)]">{initiative.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--op-ink-500)]">{initiative.objective}</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <p className="op-stat-label">Budget</p>
                  <p className="op-stat-value mt-1 text-xl">{formatFcfa(initiative.budgetFcfa)}</p>
                </div>
                <div>
                  <p className="op-stat-label">Financement confirmé</p>
                  <p className="op-stat-value mt-1 text-xl">{Number.isFinite(mobilized) ? `${mobilized}%` : "—"}</p>
                </div>
              </div>

              {headlineIndicator && (
                <div className="mt-5 flex items-center gap-3 rounded-[var(--op-radius-sm)] bg-[var(--op-canvas)] p-3">
                  <Target size={16} className="shrink-0 text-[var(--op-signal-500)]" />
                  <p className="text-xs leading-5 text-[var(--op-ink-700)]">
                    <strong>{headlineIndicator.label}</strong> — {headlineIndicator.current}/{headlineIndicator.target} {headlineIndicator.unit}
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-1.5">
                {initiative.funding.map((fund) => (
                  <span key={fund.id} className="op-badge op-badge--neutral">{fundingStatusLabels[fund.status] ?? fund.status} · {formatFcfa(fund.amountFcfa)}</span>
                ))}
              </div>
              <p className="mt-4 text-xs text-[var(--op-ink-400)]">{initiative.territoryIds.map(territoryName).join(", ")}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
