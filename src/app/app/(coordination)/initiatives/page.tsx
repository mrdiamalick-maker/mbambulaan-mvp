"use client";

import { Banknote, CircleDollarSign, Flag, Target, UsersRound } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExportActions } from "@/components/reporting/ExportActions";
import { CollectiveNeedsPanel } from "@/components/coordination/CollectiveNeedsPanel";

const money = new Intl.NumberFormat("fr-FR", { notation: "compact", style: "currency", currency: "XOF", maximumFractionDigits: 0 });

export default function InitiativesPage() {
  const { state } = useProduct();
  if (!state) return null;
  const portfolioRows = state.initiatives.flatMap((initiative) => initiative.funding.map((fund) => ({
    Initiative: initiative.title,
    Territoires: initiative.territoryIds.map((id) => state.territories.find((item) => item.id === id)?.name ?? id).join(", "),
    "Budget FCFA": initiative.budgetFcfa,
    "Financement FCFA": fund.amountFcfa,
    Statut: fund.status.replaceAll("_", " "),
    Partenaire: state.actors.find((item) => item.id === fund.partnerId)?.name ?? fund.partnerId,
    Condition: fund.condition
  })));
  return (
    <>
      <PageHeader eyebrow="Transformation territoriale" title="Initiatives & financements" description="Les difficultés récurrentes deviennent des initiatives structurées, reliées aux territoires, aux décisions, aux financements et aux résultats attendus." />
      <div className="space-y-6 p-5 lg:p-8">
        <CollectiveNeedsPanel state={state} />
        <section className="surface flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div><p className="label">Portefeuille de démonstration</p><h2 className="mt-2 text-xl font-bold">{state.initiatives.length} programmes · {money.format(state.initiatives.reduce((sum, item) => sum + item.budgetFcfa, 0))}</h2><p className="mt-1 text-sm text-[#60737a]">Besoins, conditions et statuts restent distincts des engagements fermes.</p></div><ExportActions filename="mbambulaan-programmes-financements" rows={portfolioRows} compact /></section>
        {state.initiatives.map((initiative) => {
          const secured = initiative.funding.filter((item) => item.status === "confirme").reduce((sum, item) => sum + item.amountFcfa, 0);
          const instructed = initiative.funding.filter((item) => item.status === "en_instruction").reduce((sum, item) => sum + item.amountFcfa, 0);
          const owner = state.actors.find((item) => item.id === initiative.ownerId);
          return (
            <article className="surface overflow-hidden" key={initiative.id}>
              <div className="border-b border-[#d8e1e2] bg-[#fcfaf4] p-5 lg:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div><p className="label">Programme · {initiative.territoryIds.length} territoire(s)</p><h2 className="mt-2 max-w-3xl text-xl font-bold text-[#062d36]">{initiative.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#60737a]">{initiative.objective}</p></div>
                  <span className="w-fit rounded-full border border-[#b9dfe4] bg-white px-3 py-1.5 text-xs font-bold text-[#075466]">{initiative.status}</span>
                </div>
              </div>
              <div className="grid gap-px bg-[#d8e1e2] sm:grid-cols-2 xl:grid-cols-4">
                <div className="bg-white p-5"><Banknote size={19} className="text-[#087287]" /><p className="mt-3 text-2xl font-bold">{money.format(initiative.budgetFcfa)}</p><p className="text-xs text-[#60737a]">budget indicatif simulé</p></div>
                <div className="bg-white p-5"><CircleDollarSign size={19} className="text-[#18a394]" /><p className="mt-3 text-2xl font-bold">{money.format(secured + instructed)}</p><p className="text-xs text-[#60737a]">confirmé ou en instruction</p></div>
                <div className="bg-white p-5"><Flag size={19} className="text-[#d89614]" /><p className="mt-3 text-2xl font-bold">{initiative.territoryIds.length}</p><p className="text-xs text-[#60737a]">territoires reliés</p></div>
                <div className="bg-white p-5"><UsersRound size={19} className="text-[#087287]" /><p className="mt-3 font-bold">{owner?.name}</p><p className="text-xs text-[#60737a]">responsable de l’initiative</p></div>
              </div>
              <div className="grid gap-6 p-5 lg:grid-cols-2 lg:p-6">
                <section><p className="label">Progression vers les résultats</p><div className="mt-4 space-y-5">{initiative.indicators.map((indicator) => {
                  const progress = Math.min(100, Math.round((indicator.current / indicator.target) * 100));
                  return <div key={indicator.label}><div className="flex justify-between gap-4 text-sm"><span className="font-semibold">{indicator.label}</span><strong>{indicator.current}{indicator.unit} / {indicator.target}{indicator.unit}</strong></div><div className="mt-2 h-2 bg-[#e4ecec]"><div className="h-full bg-[#18a394]" style={{ width: `${progress}%` }} /></div><p className="mt-1 text-xs text-[#60737a]">Référence initiale : {indicator.baseline}{indicator.unit}</p></div>;
                })}</div></section>
                <section><p className="label">Instruction financière</p><div className="mt-4 space-y-3">{initiative.funding.map((fund) => {
                  const partner = state.actors.find((item) => item.id === fund.partnerId);
                  return <div key={fund.id} className="border border-[#d8e1e2] p-4"><div className="flex justify-between gap-4"><strong>{partner?.name}</strong><span className="text-xs font-bold text-[#075466]">{fund.status.replaceAll("_", " ")}</span></div><p className="mt-2 text-lg font-bold">{money.format(fund.amountFcfa)}</p><p className="mt-2 text-sm leading-5 text-[#60737a]">{fund.condition}</p></div>;
                })}</div></section>
              </div>
            </article>
          );
        })}
        <div className="border-l-4 border-[#087287] bg-[#eaf8fa] p-5"><Target className="text-[#087287]" /><h2 className="mt-3 font-bold">Ce portefeuille reste relié au terrain</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#52666d]">Chaque financement renvoie aux situations qui l’ont justifié, aux engagements pris et aux indicateurs qui permettront de mesurer le changement.</p></div>
      </div>
    </>
  );
}
