"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Radio, Search } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { Drawer } from "@/components/etat/Drawer";
import { EtatRegistryHeader } from "@/components/etat/EtatRegistryHeader";
import {
  Mission,
  MissionForm,
  SignalForm,
  SituationDetail,
  arbitrageFillColor,
  glyphBorderColor,
  pipelineStages,
  priorityLabels,
  priorityToTag
} from "@/components/etat/shared";
import type { FieldVisit } from "@/domain/ministry/field-visit";
import type { Situation } from "@/domain/types";
import { TrustIndicator } from "@/components/foundations";

// Registre complet "Situations à arbitrer" — extrait de /app/etat (mandat
// "Brief national", navigation par page, 2026-08-26). Contenu et logique
// de filtrage IDENTIQUES au chapitre "arbitrage-detail" qui vivait sur
// /app/etat jusqu'ici — extraction propre, aucune reconstruction. Seule
// différence réelle : le Périmètre (territoire) est désormais un état
// LOCAL à cette page plutôt que partagé avec l'Atlas de /app/etat (les
// deux pages ne partagent plus de React tree) — même mécanisme de
// sélection, juste plus de synchronisation inter-pages sans un vrai state
// partagé (URL/serveur), non demandé par ce lot.
export default function ArbitragesPage() {
  const { state } = useProduct();
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [urgenceFilter, setUrgenceFilter] = useState<"all" | "critique" | "haute">("all");
  const [arbitrageSearch, setArbitrageSearch] = useState("");
  const [situationDrawer, setSituationDrawer] = useState<Situation | null>(null);
  const [missionDrawer, setMissionDrawer] = useState<Mission | null>(null);
  const [signalDrawerOpen, setSignalDrawerOpen] = useState(false);

  const reload = async () => {
    const response = await fetch("/api/ministry/field-visits");
    if (response.ok) setVisits((await response.json()).visits ?? []);
  };
  useEffect(() => {
    void reload();
  }, []);

  if (!state) return null;

  const focusTerritory = selectedTerritoryId ? state.territories.find((item) => item.id === selectedTerritoryId) : undefined;
  const arbitrageSearchNormalized = arbitrageSearch.trim().toLowerCase();
  const situationsAArbitrer = state.situations
    .filter((item) =>
      item.status !== "reglee" &&
      (urgenceFilter === "all" ? (item.priority === "critique" || item.priority === "haute") : item.priority === urgenceFilter) &&
      (!selectedTerritoryId || item.territoryId === selectedTerritoryId) &&
      (arbitrageSearchNormalized === "" || [
        item.title,
        item.nextStep,
        state.territories.find((territory) => territory.id === item.territoryId)?.name ?? ""
      ].some((field) => field.toLowerCase().includes(arbitrageSearchNormalized)))
    )
    .sort((a, b) => (({ critique: 3, haute: 2, moyenne: 1, faible: 0 } as const)[b.priority] - ({ critique: 3, haute: 2, moyenne: 1, faible: 0 } as const)[a.priority]));
  const criticalCount = situationsAArbitrer.filter((item) => item.priority === "critique").length;
  const highCount = situationsAArbitrer.filter((item) => item.priority === "haute").length;
  const openCount = state.situations.filter((item) => item.status !== "reglee" && (!selectedTerritoryId || item.territoryId === selectedTerritoryId)).length;
  const plannedVisitCount = visits.filter((item) => item.status === "planifiee" && (!selectedTerritoryId || item.territoryId === selectedTerritoryId)).length;

  return (
    <div className="etat-scope min-h-screen bg-[var(--etat-offwhite)] p-5 pb-16 lg:p-8">
      <EtatRegistryHeader
        eyebrow="Situations à arbitrer — registre complet"
        title="Décider sur les situations qui ne peuvent plus attendre."
        description={<>{situationsAArbitrer.length} situation(s) {urgenceFilter === "all" ? "de risque élevé ou critique" : urgenceFilter === "critique" ? "critiques" : "de risque élevé"} attendent une décision, sur {openCount} dossier(s) ouverts{selectedTerritoryId ? ` · ${focusTerritory?.name ?? selectedTerritoryId}` : ""}.</>}
        metrics={[
          { label: "À arbitrer", value: situationsAArbitrer.length, detail: "Selon les filtres actifs", tone: situationsAArbitrer.length > 0 ? "attention" : "positive" },
          { label: "Critiques", value: criticalCount, detail: "Attention immédiate", tone: criticalCount > 0 ? "critical" : "positive" },
          { label: "Risque élevé", value: highCount, tone: highCount > 0 ? "attention" : "positive" },
          { label: "Visites planifiées", value: plannedVisitCount, detail: "Vérification terrain", tone: plannedVisitCount > 0 ? "positive" : "neutral" }
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
          <label className="block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Recherche</p>
            <div className="relative mt-1">
              <Search size={14} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--etat-stone-400)]" />
              <input
                type="search"
                value={arbitrageSearch}
                onChange={(event) => setArbitrageSearch(event.target.value)}
                placeholder="Titre, étape, territoire…"
                className="w-44 rounded-md border border-[var(--etat-line)] bg-white py-1 pl-7 pr-2 text-sm font-semibold text-[var(--etat-navy-950)] outline-none focus:border-[var(--etat-navy-600)]"
              />
            </div>
          </label>
          <label className="block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Urgence</p>
            <select
              value={urgenceFilter}
              onChange={(event) => setUrgenceFilter(event.target.value as "all" | "critique" | "haute")}
              className="mt-1 rounded-md border border-[var(--etat-line)] bg-white py-1 pl-0 pr-6 text-sm font-semibold text-[var(--etat-navy-950)] outline-none focus:border-[var(--etat-navy-600)]"
            >
              <option value="all">Critique + élevé</option>
              <option value="critique">Critique seulement</option>
              <option value="haute">Élevé seulement</option>
            </select>
          </label>
          <button className="etat-btn etat-btn-outline" onClick={() => setSignalDrawerOpen(true)}><Radio size={15} /> Signaler une situation</button>
      </EtatRegistryHeader>

      <div className="etat-panel mt-5 p-6 lg:p-7">
      {situationsAArbitrer.length === 0 ? (
        <p className="text-sm text-[var(--etat-stone-600)]">{arbitrageSearchNormalized ? `Aucune situation ne correspond à « ${arbitrageSearch} » avec ces filtres.` : "Aucune situation de risque élevé ou critique en attente d’arbitrage pour le moment."}</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--etat-line)] text-[10px] font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">
                  <th className="px-4 py-3 font-bold">Situation</th>
                  <th className="px-4 py-3 font-bold">Territoire</th>
                  <th className="px-4 py-3 font-bold">Urgence</th>
                  <th className="px-4 py-3 font-bold">Connaissance</th>
                  <th className="px-4 py-3 font-bold">Étape</th>
                  <th className="px-4 py-3 font-bold">Échéance</th>
                  <th className="px-4 py-3 font-bold">Responsable</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {situationsAArbitrer.map((situation) => {
                  const territory = state.territories.find((item) => item.id === situation.territoryId);
                  const tag = priorityToTag[situation.priority];
                  const stageLabel = pipelineStages.find((stage) => stage.status === situation.status)?.label ?? situation.status;
                  const responsable = situation.responsibleId ? state.actors.find((item) => item.id === situation.responsibleId) : undefined;
                  return (
                    <tr key={situation.id} className="border-b border-[var(--etat-line)] last:border-b-0" style={{ borderLeftWidth: 3, borderLeftColor: glyphBorderColor[tag] }}>
                      <td className="px-4 py-3"><p className="font-semibold text-[var(--etat-navy-950)]">{situation.title}</p><p className="mt-0.5 text-xs text-[var(--etat-stone-600)]">{situation.nextStep}</p></td>
                      <td className="px-4 py-3 text-[var(--etat-stone-600)]">{territory?.name ?? situation.territoryId}</td>
                      <td className="px-4 py-3"><span className={`etat-tag ${tag === "critique" ? "etat-tag--critique" : "etat-tag--vigilance"}`}>{priorityLabels[situation.priority]}</span></td>
                      <td className="px-4 py-3"><TrustIndicator trust={situation.trust} /></td>
                      <td className="px-4 py-3 text-[var(--etat-stone-600)]">{stageLabel}</td>
                      <td className="px-4 py-3 text-[var(--etat-stone-600)]">{situation.dueAt ? new Date(situation.dueAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—"}</td>
                      <td className="px-4 py-3 text-[var(--etat-stone-600)]">{responsable?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button className="etat-btn etat-btn-outline" style={{ minHeight: 32, padding: "5px 10px", fontSize: 12 }} onClick={() => setMissionDrawer({ key: `situation-${situation.id}`, territoryId: situation.territoryId, territoryLabel: territory?.name ?? situation.territoryId, raison: situation.title, action: situation.nextStep, glyphStatus: tag, suggestedObjective: "verification_vigilance" })}>Visite</button>
                          <button className="etat-btn etat-btn-primary" style={{ minHeight: 32, padding: "5px 10px", fontSize: 12 }} onClick={() => setSituationDrawer(situation)}>Arbitrer <ArrowRight size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 space-y-3 md:hidden">
            {situationsAArbitrer.map((situation) => {
              const territory = state.territories.find((item) => item.id === situation.territoryId);
              const tag = priorityToTag[situation.priority];
              const stageLabel = pipelineStages.find((stage) => stage.status === situation.status)?.label ?? situation.status;
              return (
                <article key={situation.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--etat-line)] p-4" style={{ borderLeftWidth: 4, borderLeftColor: glyphBorderColor[tag], backgroundColor: arbitrageFillColor[tag] }}>
                  <div className="flex items-center gap-3">
                    <TensionGlyph status={tag} size={30} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-[var(--etat-navy-950)]">{territory?.name ?? situation.territoryId} · {situation.title}</p><span className={`etat-tag ${tag === "critique" ? "etat-tag--critique" : "etat-tag--vigilance"}`}>{priorityLabels[situation.priority]}</span></div>
                      <p className="mt-1 text-xs text-[var(--etat-stone-600)]">{situation.nextStep}</p>
                      <div className="mt-1.5"><TrustIndicator trust={situation.trust} /></div>
                      <p className="mt-1 text-[11px] text-[var(--etat-stone-400)]">Étape {stageLabel.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button className="etat-btn etat-btn-outline" style={{ minHeight: 36, padding: "6px 14px" }} onClick={() => setMissionDrawer({ key: `situation-${situation.id}`, territoryId: situation.territoryId, territoryLabel: territory?.name ?? situation.territoryId, raison: situation.title, action: situation.nextStep, glyphStatus: tag, suggestedObjective: "verification_vigilance" })}>Planifier une visite</button>
                    <button className="etat-btn etat-btn-primary" style={{ minHeight: 36, padding: "6px 14px" }} onClick={() => setSituationDrawer(situation)}>Arbitrer <ArrowRight size={15} /></button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
      </div>
      {visits.filter((item) => item.status === "planifiee").length > 0 && <p className="mt-4 text-xs text-[var(--etat-stone-600)]">{visits.filter((item) => item.status === "planifiee").length} visite(s) terrain déjà planifiée(s) par le ministère.</p>}

      <Drawer open={!!situationDrawer} onClose={() => setSituationDrawer(null)} eyebrow="Situation" title={situationDrawer?.title ?? ""} size="lg">
        {situationDrawer && <SituationDetail situation={situationDrawer} state={state} onPlanVisit={() => { const territory = state.territories.find((item) => item.id === situationDrawer.territoryId); setSituationDrawer(null); setMissionDrawer({ key: `situation-${situationDrawer.id}`, territoryId: situationDrawer.territoryId, territoryLabel: territory?.name ?? situationDrawer.territoryId, raison: situationDrawer.title, action: situationDrawer.nextStep, glyphStatus: priorityToTag[situationDrawer.priority], suggestedObjective: "verification_vigilance" }); }} />}
      </Drawer>
      <Drawer open={signalDrawerOpen} onClose={() => setSignalDrawerOpen(false)} eyebrow="Vigilance" title="Signaler une situation">
        <SignalForm territories={state.territories} onDone={() => { setSignalDrawerOpen(false); void reload(); }} />
      </Drawer>
      <Drawer open={!!missionDrawer} onClose={() => setMissionDrawer(null)} eyebrow="Terrain" title="Planifier la mission">
        {missionDrawer && <MissionForm mission={missionDrawer} onDone={() => { setMissionDrawer(null); void reload(); }} />}
      </Drawer>
    </div>
  );
}
