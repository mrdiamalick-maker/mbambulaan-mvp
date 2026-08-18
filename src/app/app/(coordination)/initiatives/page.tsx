"use client";

import { Banknote, CircleDollarSign, Flag, Target, UsersRound } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { ExportActions } from "@/components/reporting/ExportActions";
import { CollectiveNeedsPanel } from "@/components/coordination/CollectiveNeedsPanel";
import { Badge } from "@/components/ui/badge";
import type { Funding, Initiative } from "@/domain/types";

const money = new Intl.NumberFormat("fr-FR", { notation: "compact", style: "currency", currency: "XOF", maximumFractionDigits: 0 });

const initiativeStatusLabel: Record<Initiative["status"], string> = {
  cadrage: "Cadrage",
  financee: "Financée",
  execution: "Exécution",
  terminee: "Terminée"
};
const initiativeStatusVariant: Record<Initiative["status"], "marine" | "amber" | "success"> = {
  cadrage: "marine",
  financee: "amber",
  execution: "amber",
  terminee: "success"
};
const fundingStatusLabel: Record<Funding["status"], string> = {
  a_mobiliser: "À mobiliser",
  en_instruction: "En instruction",
  confirme: "Confirmé"
};
const fundingStatusVariant: Record<Funding["status"], "marine" | "amber" | "success"> = {
  a_mobiliser: "marine",
  en_instruction: "amber",
  confirme: "success"
};
const budgetStatusCaption: Record<Initiative["budgetStatus"], string> = {
  a_estimer: "budget non encore chiffré",
  estime: "budget estimé, à confirmer",
  valide: "budget simulé à titre indicatif"
};

export default function InitiativesPage() {
  const { state } = useProduct();
  if (!state) return null;
  const portfolioRows = state.initiatives.flatMap((initiative) => initiative.funding.map((fund) => ({
    Initiative: initiative.title,
    Territoires: initiative.territoryIds.map((id) => state.territories.find((item) => item.id === id)?.name ?? id).join(", "),
    "Budget FCFA": initiative.budgetFcfa ?? "À estimer",
    "Financement FCFA": fund.amountFcfa,
    Statut: fund.status.replaceAll("_", " "),
    Partenaire: state.actors.find((item) => item.id === fund.partnerId)?.name ?? fund.partnerId,
    Condition: fund.condition
  })));
  // Un programme "à estimer" (budgetFcfa absent) n'entre pas dans le total
  // chiffré : l'additionner comme 0 laisserait croire que son besoin est
  // nul plutôt que non encore évalué.
  const chiffredInitiatives = state.initiatives.filter((item) => item.budgetFcfa !== undefined);
  const totalBudget = chiffredInitiatives.reduce((sum, item) => sum + (item.budgetFcfa ?? 0), 0);
  const toEstimateCount = state.initiatives.length - chiffredInitiatives.length;

  return (
    <div className="shadcn-scope space-y-8 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Transformation territoriale</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Programmes &amp; financements</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Les difficultés récurrentes deviennent des initiatives structurées, reliées aux territoires, aux décisions, aux financements et aux résultats attendus.</p>
      </div>

      <CollectiveNeedsPanel state={state} />

      <section className="flex flex-col gap-4 border-y py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Portefeuille présenté en mode démonstration</p>
          <h2 className="mt-2 text-xl font-bold">{state.initiatives.length} programmes · {money.format(totalBudget)}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Besoins, conditions et statuts restent distincts des engagements fermes.{toEstimateCount > 0 ? ` Total chiffré hors ${toEstimateCount} programme(s) au budget encore à estimer.` : ""}</p>
        </div>
        <ExportActions filename="mbambulaan-programmes-financements" rows={portfolioRows} compact />
      </section>

      <div className="space-y-10">
        {state.initiatives.map((initiative) => {
          const secured = initiative.funding.filter((item) => item.status === "confirme").reduce((sum, item) => sum + item.amountFcfa, 0);
          const instructed = initiative.funding.filter((item) => item.status === "en_instruction").reduce((sum, item) => sum + item.amountFcfa, 0);
          const owner = state.actors.find((item) => item.id === initiative.ownerId);
          return (
            <section key={initiative.id} className="overflow-hidden rounded-2xl border">
              <div className="bg-sidebar p-6 text-sidebar-foreground">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/60">Programme · {initiative.territoryIds.length} territoire(s)</p>
                    <h2 className="mt-2 max-w-3xl text-xl font-semibold tracking-tight">{initiative.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-sidebar-foreground/70">{initiative.objective}</p>
                  </div>
                  <Badge variant={initiativeStatusVariant[initiative.status]} className="w-fit">{initiativeStatusLabel[initiative.status]}</Badge>
                </div>
              </div>

              <div className="grid border-b sm:grid-cols-2 xl:grid-cols-4">
                <div className="p-5"><Banknote size={19} className="text-[#1d4468]" /><p className="mt-3 text-2xl font-bold">{initiative.budgetFcfa !== undefined ? money.format(initiative.budgetFcfa) : "À estimer"}</p><p className="text-xs text-muted-foreground">{budgetStatusCaption[initiative.budgetStatus]}</p></div>
                <div className="p-5 sm:border-l"><CircleDollarSign size={19} className="text-[#1d4468]" /><p className="mt-3 text-2xl font-bold">{money.format(secured + instructed)}</p><p className="text-xs text-muted-foreground">confirmé ou en instruction</p></div>
                <div className="p-5 xl:border-l"><Flag size={19} className="text-[#1d4468]" /><p className="mt-3 text-2xl font-bold">{initiative.territoryIds.length}</p><p className="text-xs text-muted-foreground">territoires reliés</p></div>
                <div className="p-5 sm:border-l"><UsersRound size={19} className="text-[#1d4468]" /><p className="mt-3 font-bold">{owner?.name}</p><p className="text-xs text-muted-foreground">responsable de l’initiative</p></div>
              </div>

              <div className="grid gap-8 p-5 lg:grid-cols-2 lg:p-6">
                <section>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Progression vers les résultats</p>
                  <div className="mt-4 space-y-5">
                    {initiative.indicators.map((indicator) => {
                      const progress = Math.min(100, Math.round((indicator.current / indicator.target) * 100));
                      return (
                        <div key={indicator.label}>
                          <div className="flex justify-between gap-4 text-sm"><span className="font-semibold">{indicator.label}</span><strong>{indicator.current}{indicator.unit} / {indicator.target}{indicator.unit}</strong></div>
                          <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-[#1d4468]" style={{ width: `${progress}%` }} /></div>
                          <p className="mt-1 text-xs text-muted-foreground">Référence initiale : {indicator.baseline}{indicator.unit}</p>
                        </div>
                      );
                    })}
                    {initiative.indicators.length === 0 && <p className="text-sm text-muted-foreground">Aucun indicateur défini pour le moment — programme en cadrage.</p>}
                  </div>
                </section>

                <section>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Instruction financière</p>
                  <div className="mt-4 divide-y border-y">
                    {initiative.funding.map((fund) => {
                      const partner = state.actors.find((item) => item.id === fund.partnerId);
                      return (
                        <div key={fund.id} className="py-4">
                          <div className="flex items-center justify-between gap-4">
                            <strong className="text-sm">{partner?.name}</strong>
                            <Badge variant={fundingStatusVariant[fund.status]}>{fundingStatusLabel[fund.status]}</Badge>
                          </div>
                          <p className="mt-2 text-lg font-bold">{money.format(fund.amountFcfa)}</p>
                          <p className="mt-2 text-sm leading-5 text-muted-foreground">{fund.condition}</p>
                        </div>
                      );
                    })}
                    {initiative.funding.length === 0 && <p className="py-4 text-sm text-muted-foreground">Aucun financement engagé pour le moment.</p>}
                  </div>
                </section>
              </div>
            </section>
          );
        })}
      </div>

      <section className="flex gap-3 border-l-2 border-[#1d4468]/30 pl-4">
        <Target className="mt-0.5 shrink-0 text-[#1d4468]" size={20} />
        <div>
          <h2 className="font-semibold">Ce portefeuille reste relié au terrain</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Chaque financement renvoie aux situations qui l’ont justifié, aux engagements pris et aux indicateurs qui permettront de mesurer le changement.</p>
        </div>
      </section>
    </div>
  );
}
