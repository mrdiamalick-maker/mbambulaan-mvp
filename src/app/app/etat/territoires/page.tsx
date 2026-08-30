"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Drawer } from "@/components/etat/Drawer";
import { EtatRegistryHeader } from "@/components/etat/EtatRegistryHeader";
import {
  Mission,
  MissionForm,
  SituationDetail,
  StatusBadge,
  TerritoryDetail,
  priorityToTag,
  statusTagLabel
} from "@/components/etat/shared";
import type { Situation, Territory } from "@/domain/types";
import type { VigilanceCase } from "@/domain/ministry/vigilance";

// Registre complet "Territoires" — mandat CEO "2 changements décidés"
// (2026-08-28), même schéma d'extraction que /app/etat/arbitrages et
// /app/etat/programmes (mandat "Brief national", navigation par page,
// 2026-08-26) : TerritoryDetail est réutilisé tel quel depuis
// components/etat/shared.tsx (déjà exporté, déjà utilisé par
// /app/etat/page.tsx pour son propre tiroir territoire) — aucune
// reconstruction. Périmètre (Région) et Activité : états LOCAUX à cette
// page, même remarque que les registres précédents (pages sœurs sans
// arbre React partagé).
//
// Aucune donnée fabriquée (consigne explicite du mandat) : pas de score
// de santé territorial, pas de capacité nationale additionnée (unités
// hétérogènes entre infrastructures — kg, m³, places, etc. selon le
// type), pas de classement automatique meilleur→pire. Seuls des champs
// réels comptés (situations ouvertes, infrastructures fragiles ou
// indisponibles) ou affichés tels quels (nom, région, activité).
export default function TerritoiresPage() {
  const { state } = useProduct();
  // cases nécessaire uniquement pour peupler TerritoryDetail (son prop
  // `cases`, déjà utilisé ainsi sur /app/etat) — même source que les
  // autres pages qui ouvrent ce composant.
  const [cases, setCases] = useState<VigilanceCase[]>([]);
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<"all" | "stable" | "vigilance" | "critique">("all");
  const [territoryDrawer, setTerritoryDrawer] = useState<Territory | null>(null);
  const [situationDrawer, setSituationDrawer] = useState<Situation | null>(null);
  const [missionDrawer, setMissionDrawer] = useState<Mission | null>(null);

  const reload = async () => {
    const response = await fetch("/api/ministry/vigilance");
    if (response.ok) setCases((await response.json()).cases ?? []);
  };
  useEffect(() => {
    void reload();
  }, []);

  if (!state) return null;

  // Régions dérivées des territoires réels — pas une liste éditoriale
  // fixée à part, qui dériverait silencieusement si demo-state.ts change.
  const regions = [...new Set(state.territories.map((item) => item.region))].sort((a, b) => a.localeCompare(b));
  const filteredTerritories = state.territories
    .filter((item) => (regionFilter === "all" || item.region === regionFilter) && (activityFilter === "all" || item.activity === activityFilter))
    .sort((a, b) => a.name.localeCompare(b.name));
  const filteredTerritoryIds = new Set(filteredTerritories.map((item) => item.id));
  const openSituationsCount = state.situations.filter((item) => filteredTerritoryIds.has(item.territoryId) && item.status !== "reglee").length;
  const fragileInfrastructureCount = state.infrastructures.filter((item) => filteredTerritoryIds.has(item.territoryId) && item.status !== "operationnelle").length;
  const vigilanceCount = filteredTerritories.filter((item) => item.activity === "vigilance").length;
  const criticalCount = filteredTerritories.filter((item) => item.activity === "critique").length;

  return (
    <div className="etat-scope min-h-screen bg-[var(--etat-offwhite)] p-5 pb-16 lg:p-8">
      <EtatRegistryHeader
        eyebrow="Territoires suivis — registre complet"
        title="Comprendre où agir, territoire par territoire."
        description={<>{filteredTerritories.length} territoire(s){regionFilter !== "all" ? ` · ${regionFilter}` : ""}{activityFilter !== "all" ? ` · ${statusTagLabel[activityFilter]}` : ""} sur {state.territories.length} au total. La lecture associe niveau d’attention, situations ouvertes et capacités fragiles sans créer de score artificiel.</>}
        metrics={[
          { label: "Territoires affichés", value: filteredTerritories.length, detail: `${state.territories.length} suivis au total` },
          { label: "Situations ouvertes", value: openSituationsCount, tone: openSituationsCount > 0 ? "attention" : "positive" },
          { label: "En vigilance", value: vigilanceCount, detail: `${criticalCount} critique(s)`, tone: criticalCount > 0 ? "critical" : vigilanceCount > 0 ? "attention" : "positive" },
          { label: "Capacités fragiles", value: fragileInfrastructureCount, detail: "Fragiles ou indisponibles", tone: fragileInfrastructureCount > 0 ? "attention" : "positive" }
        ]}
      >
          <label className="block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Région</p>
            <select
              value={regionFilter}
              onChange={(event) => setRegionFilter(event.target.value)}
              className="mt-1 rounded-md border border-[var(--etat-line)] bg-white py-1 pl-0 pr-6 text-sm font-semibold text-[var(--etat-navy-950)] outline-none focus:border-[var(--etat-navy-600)]"
            >
              <option value="all">Toutes les régions</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Activité</p>
            <select
              value={activityFilter}
              onChange={(event) => setActivityFilter(event.target.value as "all" | "stable" | "vigilance" | "critique")}
              className="mt-1 rounded-md border border-[var(--etat-line)] bg-white py-1 pl-0 pr-6 text-sm font-semibold text-[var(--etat-navy-950)] outline-none focus:border-[var(--etat-navy-600)]"
            >
              <option value="all">Tous les niveaux</option>
              <option value="stable">Stable</option>
              <option value="vigilance">Vigilance</option>
              <option value="critique">Critique</option>
            </select>
          </label>
      </EtatRegistryHeader>

      <div className="etat-panel mt-5 p-6 lg:p-7">
      {filteredTerritories.length === 0 ? (
        <p className="text-sm text-[var(--etat-stone-600)]">Aucun territoire ne correspond à ce filtre pour le moment.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--etat-line)] text-[10px] font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">
                  <th className="px-4 py-3 font-bold">Territoire</th>
                  <th className="px-4 py-3 font-bold">Région</th>
                  <th className="px-4 py-3 font-bold">Activité</th>
                  <th className="px-4 py-3 font-bold">Situations ouvertes</th>
                  <th className="px-4 py-3 font-bold">Infrastructures fragiles/indisponibles</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredTerritories.map((territory) => {
                  const openSituations = state.situations.filter((item) => item.territoryId === territory.id && item.status !== "reglee").length;
                  const fragileInfra = state.infrastructures.filter((item) => item.territoryId === territory.id && item.status !== "operationnelle").length;
                  return (
                    <tr key={territory.id} className="border-b border-[var(--etat-line)] last:border-b-0">
                      <td className="px-4 py-3 font-semibold text-[var(--etat-navy-950)]">{territory.name}</td>
                      <td className="px-4 py-3 text-[var(--etat-stone-600)]">{territory.region}</td>
                      <td className="px-4 py-3"><StatusBadge status={territory.activity} /></td>
                      <td className="px-4 py-3 text-[var(--etat-stone-600)]">{openSituations}</td>
                      <td className="px-4 py-3 text-[var(--etat-stone-600)]">{fragileInfra}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button className="etat-btn etat-btn-outline" style={{ minHeight: 32, padding: "5px 10px", fontSize: 12 }} onClick={() => setTerritoryDrawer(territory)}>Voir le territoire <ArrowRight size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 space-y-3 md:hidden">
            {filteredTerritories.map((territory) => {
              const openSituations = state.situations.filter((item) => item.territoryId === territory.id && item.status !== "reglee").length;
              const fragileInfra = state.infrastructures.filter((item) => item.territoryId === territory.id && item.status !== "operationnelle").length;
              return (
                <article key={territory.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--etat-line)] p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-[var(--etat-navy-950)]">{territory.name}</p><StatusBadge status={territory.activity} /></div>
                    <p className="mt-1 text-xs text-[var(--etat-stone-600)]">{territory.region}</p>
                    <p className="mt-1 text-[11px] text-[var(--etat-stone-400)]">{openSituations} situation(s) ouverte(s) · {fragileInfra} infrastructure(s) fragile(s)/indisponible(s)</p>
                  </div>
                  <button className="etat-btn etat-btn-outline shrink-0" style={{ minHeight: 36, padding: "6px 14px" }} onClick={() => setTerritoryDrawer(territory)}>Voir le territoire <ArrowRight size={15} /></button>
                </article>
              );
            })}
          </div>
        </>
      )}
      </div>

      <Drawer open={!!territoryDrawer} onClose={() => setTerritoryDrawer(null)} eyebrow="Territoire" title={territoryDrawer?.name ?? ""}>
        {territoryDrawer && <TerritoryDetail territory={territoryDrawer} cases={cases.filter((item) => item.territoryId === territoryDrawer.id)} onOpenSituation={(situation) => { setTerritoryDrawer(null); setSituationDrawer(situation); }} />}
      </Drawer>
      <Drawer open={!!situationDrawer} onClose={() => setSituationDrawer(null)} eyebrow="Situation" title={situationDrawer?.title ?? ""}>
        {situationDrawer && <SituationDetail situation={situationDrawer} state={state} onPlanVisit={() => { const territory = state.territories.find((item) => item.id === situationDrawer.territoryId); setSituationDrawer(null); setMissionDrawer({ key: `situation-${situationDrawer.id}`, territoryId: situationDrawer.territoryId, territoryLabel: territory?.name ?? situationDrawer.territoryId, raison: situationDrawer.title, action: situationDrawer.nextStep, glyphStatus: priorityToTag[situationDrawer.priority], suggestedObjective: "verification_vigilance" }); }} />}
      </Drawer>
      <Drawer open={!!missionDrawer} onClose={() => setMissionDrawer(null)} eyebrow="Terrain" title="Planifier la mission">
        {missionDrawer && <MissionForm mission={missionDrawer} onDone={() => setMissionDrawer(null)} />}
      </Drawer>
    </div>
  );
}
