"use client";

import type { ProductState, Role, Situation } from "@/domain/types";
import { situationTerritoryReach } from "@/domain/situation-overview";
import { priorityToTag, situationStatusLabels, situationStatusVariant } from "@/lib/status-tokens";
import { SituationHero } from "@/components/situations/SituationHero";
import { SituationTimeline } from "@/components/situations/SituationTimeline";
import { SituationSynthesisTab } from "@/components/situations/SituationSynthesisTab";
import { SituationChronologyTab } from "@/components/situations/SituationChronologyTab";
import { SituationSourcesTab } from "@/components/situations/SituationSourcesTab";
import { SituationActionsTab } from "@/components/situations/SituationActionsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// LOT V3.2 (mandat §4, "Detail Surface") — panneau de détail progressif :
// hero (identité, réutilisé sans modification — partagé avec le drawer
// État) puis 4 tuiles de portée réelles puis 4 onglets (Synthèse/
// Chronologie/Sources/Action, libellés Claude Design V3 tels quels). Pas
// de DetailSurface (Sheet latéral, LOT V3.1) ici : V3 spécifie
// explicitement une autre interaction pour cet écran — un panneau
// maître-détail EN LIGNE, pas une superposition (mandat §4, "unless V3
// clearly specifies another equivalent interaction").
export function SituationDetailPanel({ state, situation, role }: { state: ProductState; situation: Situation; role: Role }) {
  const territory = state.territories.find((item) => item.id === situation.territoryId);
  const responsible = state.actors.find((item) => item.id === situation.responsibleId);
  const tag = priorityToTag[situation.priority];
  const lastEvolution = situation.history[situation.history.length - 1];
  const reach = situationTerritoryReach(state, situation);
  const coordination = state.coordinationSpaces.find((item) => item.id === situation.coordinationId);
  const commitments = coordination?.commitments ?? [];

  const reachTiles: Array<{ label: string; value: number }> = [
    { label: "Signaux à l’origine", value: reach.signals },
    { label: "Acteurs actifs sur le territoire", value: reach.actors },
    { label: "Programmes concernés", value: reach.programmes },
    { label: "Preuves enregistrées", value: reach.evidences }
  ];

  return (
    <div className="space-y-6">
      <SituationHero
        situation={situation}
        territory={territory}
        responsible={responsible}
        tag={tag}
        statusLabel={situationStatusLabels[situation.status]}
        statusVariant={situationStatusVariant[situation.status]}
        lastEvolution={lastEvolution}
      />

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
        {reachTiles.map((tile) => (
          <div key={tile.label} className="bg-background p-3.5">
            <p className="font-mono text-xl leading-none">{tile.value}</p>
            <p className="mt-1.5 text-[10.5px] leading-tight text-muted-foreground">{tile.label}</p>
          </div>
        ))}
      </div>

      <SituationTimeline status={situation.status} />

      <Tabs defaultValue="know" className="gap-4">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="know">Synthèse</TabsTrigger>
          <TabsTrigger value="time">Chronologie</TabsTrigger>
          <TabsTrigger value="src">Sources</TabsTrigger>
          <TabsTrigger value="act">Action</TabsTrigger>
        </TabsList>
        <TabsContent value="know"><SituationSynthesisTab state={state} situation={situation} /></TabsContent>
        <TabsContent value="time"><SituationChronologyTab situation={situation} /></TabsContent>
        <TabsContent value="src"><SituationSourcesTab state={state} situation={situation} commitments={commitments} /></TabsContent>
        <TabsContent value="act"><SituationActionsTab state={state} situation={situation} role={role} /></TabsContent>
      </Tabs>
    </div>
  );
}
