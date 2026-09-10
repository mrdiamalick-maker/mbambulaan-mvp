"use client";

// /app/initiatives (+ /app/initiatives/[id], LOT V3.5) — LOT 2 (mandat
// "Vertical Slice Kayar") a établi l'ordre amont-aval (émergence → examen
// → conception/action), inchangé ici. LOT V3.5 ("Programme Portfolio &
// Cockpit") remplace uniquement la section 3 — l'ancien portefeuille à
// plat (une InitiativeCard entièrement dépliée par programme) — par
// ProgrammesExplorer (vue d'ensemble + scatter + registre + cockpit
// progressif). Extrait de page.tsx (LOT V3.5) pour être partagé avec la
// nouvelle route /app/initiatives/[id] — même discipline que
// SituationsExplorer (V3.2), partagée par /app/situations et
// /app/situations/[id].
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass, Layers, Target, UsersRound } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { ExportActions } from "@/components/reporting/ExportActions";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CollectiveNeedDossier } from "@/components/coordination/CollectiveNeedDossier";
import { ProgramOpportunityDossier } from "@/components/coordination/ProgramOpportunityDossier";
import { ProgrammesExplorer } from "@/components/programmes/ProgrammesExplorer";
import type { CollectiveNeed, ProductState, ProgramOpportunity } from "@/domain/types";
import { collectiveNeedStatusLabels, programOpportunityMaturityLabels, programOpportunityStatusLabels } from "@/domain/types";

const money = new Intl.NumberFormat("fr-FR", { notation: "compact", style: "currency", currency: "XOF", maximumFractionDigits: 0 });

function TerritoryTags({ territoryIds, state }: { territoryIds: string[]; state: ProductState }) {
  const territories = territoryIds.map((id) => state.territories.find((item) => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  if (territories.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5">
      {territories.map((territory, index) => (
        <span key={territory.id}>
          <Link href={`/app/atlas?territoire=${territory.id}`} className="font-semibold text-[#1d4468] hover:underline">{territory.name}</Link>
          {index < territories.length - 1 ? " ·" : ""}
        </span>
      ))}
    </span>
  );
}

const needStatusVariant: Record<CollectiveNeed["status"], "marine" | "amber" | "success" | "outline"> = {
  emerging: "outline",
  qualifying: "marine",
  qualified: "amber",
  not_confirmed: "outline",
  converted: "success",
  monitored: "outline"
};

const opportunityStatusVariant: Record<ProgramOpportunity["status"], "marine" | "amber" | "success" | "outline"> = {
  detected: "marine",
  qualifying: "marine",
  qualified: "amber",
  designing: "amber",
  converted_to_program: "success",
  rejected: "outline",
  paused: "outline"
};

export function InitiativesWorkspace({ programmeId, initialNeedId, initialOpportunityId }: { programmeId?: string; initialNeedId?: string | null; initialOpportunityId?: string | null }) {
  const { state, role, run } = useProduct();
  const router = useRouter();
  const [needDrawerId, setNeedDrawerId] = useState<string | null>(initialNeedId ?? null);
  const [opportunityDrawerId, setOpportunityDrawerId] = useState<string | null>(initialOpportunityId ?? null);
  if (!state) return null;
  const needDrawer = needDrawerId ? state.collectiveNeeds.find((item) => item.id === needDrawerId) ?? null : null;
  const opportunityDrawer = opportunityDrawerId ? state.programOpportunities.find((item) => item.id === opportunityDrawerId) ?? null : null;

  // 1 — Ce qui émerge du terrain : tous les besoins collectifs qui n'ont
  // pas encore donné lieu à une opportunité (mandat §16 — un besoin
  // "converti" a graduué vers la section 2, il ne se lit plus deux fois).
  const emergingNeeds = state.collectiveNeeds.filter((item) => item.status !== "converted");
  // 2 — Opportunités de développement à examiner.
  const opportunities = state.programOpportunities;

  const portfolioRows = state.initiatives.flatMap((initiative) => initiative.funding.map((fund) => ({
    Initiative: initiative.title,
    Territoires: initiative.territoryIds.map((id) => state.territories.find((item) => item.id === id)?.name ?? id).join(", "),
    "Budget FCFA": initiative.budgetFcfa ?? "À estimer",
    "Financement FCFA": fund.amountFcfa,
    Statut: fund.status.replaceAll("_", " "),
    Partenaire: state.actors.find((item) => item.id === fund.partnerId)?.name ?? fund.partnerId,
    Condition: fund.condition
  })));
  const chiffredInitiatives = state.initiatives.filter((item) => item.budgetFcfa !== undefined);
  const totalBudget = chiffredInitiatives.reduce((sum, item) => sum + (item.budgetFcfa ?? 0), 0);
  const toEstimateCount = state.initiatives.length - chiffredInitiatives.length;

  return (
    <div className="shadcn-scope space-y-10 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Programmes &amp; développement</p>
        <h1 className="mb-page-title mt-2">Des besoins collectifs aux interventions structurées</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Mbàmbulaan transforme les besoins collectifs documentés en interventions structurées, sans confondre problème identifié et solution décidée.</p>
      </div>

      {/* 1 — CE QUI ÉMERGE DU TERRAIN */}
      <section>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1d4468]">
          <Layers size={14} /> 1 — Ce qui émerge du terrain
        </div>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">Des remontées dispersées — signaux, demandes — que Mbàmbulaan a rapprochées en un besoin potentiellement partagé, avant toute conception d’intervention.</p>
        {emergingNeeds.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Aucun besoin collectif émergent identifié pour le moment.</p>
        ) : (
          <div className="mt-4 divide-y border-y">
            {emergingNeeds.map((need) => (
              <div key={need.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={needStatusVariant[need.status]}>{collectiveNeedStatusLabels[need.status]}</Badge>
                    <p className="truncate text-sm font-semibold">{need.title}</p>
                  </div>
                  <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"><UsersRound size={13} /> <TerritoryTags territoryIds={need.territoryIds} state={state} /></p>
                </div>
                <button onClick={() => setNeedDrawerId(need.id)} className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#1d4468] hover:text-[#1d4468]/70">Ouvrir le dossier <ArrowRight size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2 — À EXAMINER COMME OPPORTUNITÉS DE DÉVELOPPEMENT */}
      <section>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#b6522f]">
          <Compass size={14} /> 2 — À examiner comme opportunités de développement
        </div>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">Un besoin collectif qualifié, examiné explicitement — pas encore un programme, ni une solution déjà choisie.</p>
        {opportunities.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Aucune opportunité de développement examinée pour le moment.</p>
        ) : (
          <div className="mt-4 divide-y border-y">
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={opportunityStatusVariant[opportunity.status]}>{programOpportunityStatusLabels[opportunity.status]}</Badge>
                    <Badge variant="outline">Maturité {programOpportunityMaturityLabels[opportunity.maturity].toLowerCase()}</Badge>
                    <p className="truncate text-sm font-semibold">{opportunity.problem}</p>
                  </div>
                  <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"><UsersRound size={13} /> <TerritoryTags territoryIds={opportunity.territoryIds} state={state} /></p>
                </div>
                <button onClick={() => setOpportunityDrawerId(opportunity.id)} className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#b6522f] hover:text-[#b6522f]/70">Ouvrir le dossier <ArrowRight size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3 — PORTEFEUILLE — LOT V3.5 : vue d'ensemble + scatter + registre
          + cockpit progressif (ProgrammesExplorer), remplace l'ancienne
          pile d'InitiativeCard entièrement dépliées. */}
      <section className="space-y-6 border-t pt-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Target size={14} /> 3 — Portefeuille de programmes
        </div>

        <section className="flex flex-col gap-4 border-y py-5 md:flex-row md:items-center md:justify-between print:hidden">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Portefeuille présenté en mode démonstration</p>
            <p className="mt-1 text-sm text-muted-foreground">{state.initiatives.length} programme(s) · {money.format(totalBudget)} chiffrés{toEstimateCount > 0 ? `, hors ${toEstimateCount} programme(s) au budget encore à estimer` : ""}. Besoins, conditions et statuts restent distincts des engagements fermes.</p>
          </div>
          <ExportActions filename="mbambulaan-programmes-financements" rows={portfolioRows} compact />
        </section>

        <ProgrammesExplorer
          state={state}
          role={role}
          run={run}
          selectedId={programmeId}
          onSelect={(id) => router.push(id ? `/app/initiatives/${id}` : "/app/initiatives")}
          onOpenOpportunity={setOpportunityDrawerId}
        />
      </section>

      {/* 4 — CE QUE NOUS APPRENONS — placeholder volontairement léger. */}
      <section className="flex gap-3 border-t border-l-2 border-[#1d4468]/30 pt-8 pl-4">
        <Target className="mt-0.5 shrink-0 text-[#1d4468]" size={20} />
        <div>
          <h2 className="font-semibold">4 — Ce que nous apprenons</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Cette étape s’enrichira quand des programmes auront produit des résultats mesurés — chaque financement reste relié aux situations qui l’ont justifié et aux indicateurs qui permettront de mesurer le changement.</p>
        </div>
      </section>

      <Sheet open={needDrawer !== null} onOpenChange={(open) => !open && setNeedDrawerId(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Besoin collectif</SheetTitle>
            <SheetDescription>Ce que Mbàmbulaan a rapproché, ce qui reste à comprendre, et ce que cela permet d’examiner.</SheetDescription>
          </SheetHeader>
          {needDrawer && <CollectiveNeedDossier need={needDrawer} state={state} onDone={() => setNeedDrawerId(null)} />}
        </SheetContent>
      </Sheet>

      <Sheet open={opportunityDrawer !== null} onOpenChange={(open) => !open && setOpportunityDrawerId(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Opportunité de développement</SheetTitle>
            <SheetDescription>Un problème documenté et plusieurs pistes à étudier — pas encore un programme financé.</SheetDescription>
          </SheetHeader>
          {opportunityDrawer && <ProgramOpportunityDossier opportunity={opportunityDrawer} state={state} onDone={() => setOpportunityDrawerId(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
