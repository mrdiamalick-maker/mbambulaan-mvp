"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Drawer } from "@/components/etat/Drawer";
import { EtatRegistryHeader } from "@/components/etat/EtatRegistryHeader";
import { DecisionIcon } from "@/components/etat/MotifIcons";
import { Mission, MissionForm, SituationDetail, priorityToTag } from "@/components/etat/shared";
import { decisionTypeLabels, type Situation } from "@/domain/types";

// Registre complet "Décisions exécutées & résultats observés" — extrait de
// /app/etat (mandat "Brief national", navigation par page, 2026-08-26).
// Contenu et logique IDENTIQUES au chapitre "redevabilite" qui vivait sur
// /app/etat jusqu'ici, à une différence assumée près : le plafond de 5
// décisions (recentDecisions.slice(0, 5), pertinent pour un aperçu sur la
// même page que le reste) est retiré ici — le but explicite d'une page
// dédiée "registre complet" est de montrer TOUT ce qui correspond au
// filtre, pas un extrait. Périmètre (territoire) : état local à cette
// page, même remarque que /app/etat/arbitrages et /app/etat/programmes.
export default function RedevabilitePage() {
  const { state } = useProduct();
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [situationDrawer, setSituationDrawer] = useState<Situation | null>(null);
  const [missionDrawer, setMissionDrawer] = useState<Mission | null>(null);

  if (!state) return null;

  const decisions = [...state.decisions]
    .filter((item) => {
      if (!selectedTerritoryId) return true;
      const linkedSituation = state.situations.find((situation) => situation.id === item.situationId);
      return linkedSituation?.territoryId === selectedTerritoryId;
    })
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime());
  const documentedResultCount = decisions.filter((decision) => {
    const coordination = decision.coordinationId ? state.coordinationSpaces.find((item) => item.id === decision.coordinationId) : undefined;
    return (coordination?.commitments ?? []).some((item) => item.status === "terminee" && item.result);
  }).length;
  const coveredTerritoriesCount = new Set(decisions.map((decision) => state.situations.find((item) => item.id === decision.situationId)?.territoryId).filter(Boolean)).size;
  const latestDecisionAt = decisions[0]?.decidedAt;

  return (
    <div className="etat-scope min-h-screen bg-[var(--etat-offwhite)] p-5 pb-16 lg:p-8">
      <EtatRegistryHeader
        eyebrow="Décisions exécutées & résultats observés — registre complet"
        title="Rendre chaque décision traçable jusqu’au résultat."
        description={<>{decisions.length} décision(s){selectedTerritoryId ? " sur ce territoire" : " enregistrée(s) au total"}. Ce registre relie arbitrage, acteur mobilisé et résultat documenté sans confondre décision prise et effet effectivement observé.</>}
        metrics={[
          { label: "Décisions enregistrées", value: decisions.length },
          { label: "Résultats documentés", value: documentedResultCount, detail: `${decisions.length - documentedResultCount} encore en cours`, tone: documentedResultCount > 0 ? "positive" : "neutral" },
          { label: "Territoires concernés", value: coveredTerritoriesCount },
          { label: "Dernière décision", value: latestDecisionAt ? new Date(latestDecisionAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—", detail: latestDecisionAt ? new Date(latestDecisionAt).toLocaleDateString("fr-FR", { year: "numeric" }) : "Aucune décision" }
        ]}
      >
        <label className="block">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Périmètre</p>
          <select
            value={selectedTerritoryId ?? ""}
            onChange={(event) => setSelectedTerritoryId(event.target.value || null)}
            className="mt-1 rounded-md border border-[var(--etat-line)] bg-white py-1 pl-0 pr-6 text-sm font-semibold text-[var(--etat-navy-950)] outline-none focus:border-[var(--etat-navy-600)]"
          >
            <option value="">Sénégal entier</option>
            {[...state.territories].sort((a, b) => a.name.localeCompare(b.name)).map((territory) => (
              <option key={territory.id} value={territory.id}>{territory.name}</option>
            ))}
          </select>
        </label>
      </EtatRegistryHeader>

      <div className="etat-panel mt-5 p-6 lg:p-7">
      {decisions.length === 0 ? (
        <p className="text-sm text-[var(--etat-stone-600)]">Aucune décision enregistrée pour le moment.</p>
      ) : (
        <div className="relative ml-5 border-l border-[var(--etat-line)] pl-7">
          {decisions.map((decision, index) => {
            const situation = state.situations.find((item) => item.id === decision.situationId);
            const territory = situation ? state.territories.find((item) => item.id === situation.territoryId) : undefined;
            const decider = state.actors.find((item) => item.id === decision.decidedByActorId);
            const coordination = decision.coordinationId ? state.coordinationSpaces.find((item) => item.id === decision.coordinationId) : undefined;
            const completedCommitments = (coordination?.commitments ?? []).filter((item) => item.status === "terminee" && item.result);
            return (
              <div key={decision.id} className={index === decisions.length - 1 ? "relative pb-1" : "relative border-b border-[var(--etat-line)] pb-6 mb-6"}>
                <span className="absolute -left-[47px] top-0 grid size-10 place-items-center rounded-full" style={{ backgroundColor: "var(--etat-navy-600)" }}><DecisionIcon size={20} color="var(--etat-offwhite)" /></span>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--etat-navy-950)]">{decisionTypeLabels[decision.type]}{situation ? ` · ${territory?.name ?? situation.territoryId}` : ""}</p>
                      <span className={`etat-tag ${completedCommitments.length > 0 ? "etat-tag--reel" : "etat-tag--stable"}`}>{completedCommitments.length > 0 ? "Résultat documenté" : "En cours"}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[var(--etat-stone-600)]">{decision.rationale}</p>
                    <p className="mt-1.5 text-[11px] text-[var(--etat-stone-400)]">{new Date(decision.decidedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}{decider ? ` · ${decider.name}` : ""}</p>
                    {completedCommitments.length > 0 && (
                      <div className="mt-2.5 space-y-1 border-t border-[var(--etat-line)] pt-2.5">
                        {completedCommitments.slice(0, 2).map((commitment) => {
                          const mobilizedActor = state.actors.find((item) => item.id === commitment.actorId);
                          return (
                            <p key={commitment.id} className="text-[11px] leading-4 text-[var(--etat-stone-600)]"><span className="font-bold text-[var(--etat-navy-950)]">Acteur mobilisé · </span>{mobilizedActor?.name ?? commitment.actorId} <span className="font-bold text-[var(--etat-navy-950)]">· Résultat · </span>{commitment.result}</p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {situation && <button className="etat-btn etat-btn-outline" style={{ minHeight: 32, padding: "5px 12px", fontSize: 12 }} onClick={() => setSituationDrawer(situation)}>Voir la situation <ArrowRight size={13} /></button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      <Drawer open={!!situationDrawer} onClose={() => setSituationDrawer(null)} eyebrow="Situation" title={situationDrawer?.title ?? ""}>
        {situationDrawer && <SituationDetail situation={situationDrawer} state={state} onPlanVisit={() => { const territory = state.territories.find((item) => item.id === situationDrawer.territoryId); setSituationDrawer(null); setMissionDrawer({ key: `situation-${situationDrawer.id}`, territoryId: situationDrawer.territoryId, territoryLabel: territory?.name ?? situationDrawer.territoryId, raison: situationDrawer.title, action: situationDrawer.nextStep, glyphStatus: priorityToTag[situationDrawer.priority], suggestedObjective: "verification_vigilance" }); }} />}
      </Drawer>
      <Drawer open={!!missionDrawer} onClose={() => setMissionDrawer(null)} eyebrow="Terrain" title="Planifier la mission">
        {missionDrawer && <MissionForm mission={missionDrawer} onDone={() => setMissionDrawer(null)} />}
      </Drawer>
    </div>
  );
}
