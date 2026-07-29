"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, CircleAlert, Handshake, Snowflake, UsersRound } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { CommandButton } from "@/components/ui/CommandButton";
import { PriorityBadge, TrustBadge } from "@/components/ui/Badges";

export default function CoordinationPage() {
  const { state } = useProduct();
  if (!state) return null;
  return (
    <>
      <PageHeader eyebrow="Besoin · capacité · engagement · résultat" title="Coordination" description="Mbàmbulaan qualifie les besoins et capacités avant toute mise en relation. La décision humaine, les responsabilités et le résultat restent visibles." />
      <div className="space-y-8 p-5 lg:p-8">
        <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
          <div className="surface overflow-hidden">
            <div className="border-b border-[#d8e1e2] bg-[#f8fbfb] p-4"><p className="label">Besoins ouverts</p><h2 className="mt-1 text-lg font-bold">Ce qui cherche une réponse</h2></div>
            <div className="divide-y divide-[#e1e8e8]">{state.needs.map((need) => {
              const species = state.species.find((item) => item.id === need.speciesId);
              const territory = state.territories.find((item) => item.id === need.territoryId);
              return <article key={need.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{species?.name} · {need.quantityKg} kg</h3><p className="mt-1 text-xs text-[#60737a]">{territory?.name} · {need.purpose}</p></div><PriorityBadge priority={need.priority} /></div><p className="mt-3 text-xs text-[#60737a]">Source : {need.source} · état : {need.status}</p></article>;
            })}</div>
          </div>
          <div className="surface overflow-hidden">
            <div className="border-b border-[#d8e1e2] bg-[#f4fbfc] p-4"><p className="label">Opportunités explicables</p><h2 className="mt-1 text-lg font-bold">Rapprochements à valider</h2></div>
            <div className="grid gap-px bg-[#d8e1e2] md:grid-cols-2">{state.opportunities.map((opportunity) => {
              const lot = state.lots.find((item) => item.id === opportunity.lotId);
              const need = state.needs.find((item) => item.id === opportunity.needId);
              const species = state.species.find((item) => item.id === lot?.speciesId);
              return <article key={opportunity.id} className="bg-white p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-[#087287]">{opportunity.status}</p><h3 className="mt-1 font-bold">{species?.name} · {need?.quantityKg} kg</h3></div><span className="text-2xl font-bold text-[#075466]">{opportunity.score}%</span></div><ul className="mt-4 space-y-1 text-xs text-[#60737a]">{opportunity.reasons.map((reason) => <li key={reason}>✓ {reason}</li>)}</ul><p className="mt-3 text-xs font-semibold text-[#76530d]">Validation humaine obligatoire</p><div className="mt-4 flex flex-wrap gap-2">{["detectee", "proposee"].includes(opportunity.status) && <CommandButton command={{ type: "accept_opportunity", opportunityId: opportunity.id }}>Valider l’engagement</CommandButton>}{opportunity.status === "engagee" && <CommandButton command={{ type: "complete_logistics", opportunityId: opportunity.id }}>Confirmer le résultat logistique</CommandButton>}{opportunity.status === "executee" && <span className="rounded-full bg-[#e9f7f1] px-3 py-2 text-xs font-bold text-[#126b58]">Résultat enregistré</span>}</div></article>;
            })}</div>
          </div>
        </section>

        <section>
          <div className="mb-4"><p className="label">Responsabilités partagées</p><h2 className="mt-1 text-xl font-bold text-[#062d36]">Espaces de coordination actifs</h2></div>
          <div className="space-y-5">
            {state.coordinationSpaces.map((space) => {
              const situation = state.situations.find((item) => item.id === space.situationId);
              return (
                <article key={space.id} className="surface overflow-hidden">
                  <div className="border-b border-[#d8e1e2] bg-[#f4fbfc] p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div><p className="label">Espace de coordination</p><h3 className="mt-2 text-xl font-bold text-[#062d36]">{space.title}</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-[#60737a]">{space.objective}</p></div>
                      <Link href={`/app/coordination/${space.id}`} className="inline-flex shrink-0 items-center gap-2 bg-[#075466] px-4 py-2.5 text-sm font-bold text-white">Suivre les engagements <ArrowRight size={16} /></Link>
                    </div>
                  </div>
                  <div className="grid gap-px bg-[#d8e1e2] sm:grid-cols-4">
                    <div className="bg-white p-4"><UsersRound size={18} className="text-[#087287]" /><p className="mt-2 text-2xl font-bold">{space.participantIds.length}</p><p className="text-xs text-[#60737a]">acteurs mobilisés</p></div>
                    <div className="bg-white p-4"><Handshake size={18} className="text-[#18a394]" /><p className="mt-2 text-2xl font-bold">{space.commitments.length}</p><p className="text-xs text-[#60737a]">engagements suivis</p></div>
                    <div className="bg-white p-4"><CircleAlert size={18} className="text-[#d89614]" /><p className="mt-2 text-2xl font-bold">{space.risks.length}</p><p className="text-xs text-[#60737a]">risques à surveiller</p></div>
                    <div className="bg-white p-4"><CalendarClock size={18} className="text-[#087287]" /><p className="mt-2 text-sm font-bold">Prochaine revue</p><p className="text-xs text-[#60737a]">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(space.nextReviewAt))}</p></div>
                  </div>
                  {situation && <div className="flex flex-wrap items-center gap-3 px-5 py-4 text-sm"><Snowflake size={16} className="text-[#087287]" /><span><strong>Situation reliée :</strong> <Link className="text-[#075466] underline" href={`/app/situations/${situation.id}`}>{situation.title}</Link></span><TrustBadge trust={situation.trust} /></div>}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
