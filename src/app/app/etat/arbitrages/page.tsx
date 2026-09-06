"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Radio, Search } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Drawer } from "@/components/etat/Drawer";
import {
  Mission,
  MissionForm,
  SignalForm,
  SituationDetail,
  glyphBorderColor,
  pipelineStages,
  priorityLabels,
  priorityToTag,
  situationPriorityRank
} from "@/components/etat/shared";
import type { Situation } from "@/domain/types";
import { TrustGlyphLabel, trustGlyphFromLevel } from "@/components/etat/TrustGlyph";

// P2.DESIGN-1B (mandat CEO "Claude Design V2 → Real Product
// Implementation", §11, "Arbitrages") — remplace la table générique
// (registre + Drawer latéral) par la composition à 2 volets du prototype
// fourni : GAUCHE file d'arbitrage triée par priorité décroissante,
// DROITE dossier complet de la situation sélectionnée — "replace the
// generic administrative table feeling with the V2 decision
// architecture."
//
// CRITIQUE (mandat §11, non négociable) : Mbàmbulaan ne décide pas seul.
// Le panneau "Décision attendue" ci-dessous n'expose QUE 2 actions
// réelles — celles que le référentiel supporte déjà (planifier une visite
// terrain, ouvrir le dossier de décision réel dans SituationDetail) —
// jamais les 3-4 boutons d'options du prototype (texte libre par
// situation, propre à sa fixture, qui ne correspond à aucune commande
// générique du domaine). La phrase de provenance humaine (verbatim du
// prototype, texte de doctrine) reste affichée telle quelle.
function situationAge(situation: Situation): string | null {
  const first = situation.history[0]?.at;
  if (!first) return null;
  const days = Math.floor((Date.now() - new Date(first).getTime()) / 86_400_000);
  if (days <= 0) return "aujourd’hui";
  return `il y a ${days} jour${days > 1 ? "s" : ""}`;
}

// 4 points de progression (langage visuel du prototype) — dérivés du
// VRAI pipelineStages (8 étapes réelles, jamais raccourci arbitrairement
// à 4 dans le modèle) : chaque point représente 2 étapes réelles, jamais
// une progression inventée indépendamment de Situation.status.
function stageProgressDots(status: Situation["status"]): boolean[] {
  const index = pipelineStages.findIndex((stage) => stage.status === status);
  const ratio = index < 0 ? 0 : (index + 1) / pipelineStages.length;
  const filled = Math.max(1, Math.round(ratio * 4));
  return [0, 1, 2, 3].map((i) => i < filled);
}

export default function ArbitragesPage() {
  const { state } = useProduct();
  const [visits, setVisits] = useState<import("@/domain/ministry/field-visit").FieldVisit[]>([]);
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [urgenceFilter, setUrgenceFilter] = useState<"all" | "critique" | "haute">("all");
  const [arbitrageSearch, setArbitrageSearch] = useState("");
  const [selectedSituationId, setSelectedSituationId] = useState<string | null>(null);
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
    .sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority]);
  const criticalCount = situationsAArbitrer.filter((item) => item.priority === "critique").length;
  const highCount = situationsAArbitrer.filter((item) => item.priority === "haute").length;
  const plannedVisitCount = visits.filter((item) => item.status === "planifiee" && (!selectedTerritoryId || item.territoryId === selectedTerritoryId)).length;
  const medianDelayDays = (() => {
    const ages = situationsAArbitrer
      .map((item) => item.history[0]?.at)
      .filter((value): value is string => Boolean(value))
      .map((at) => Math.floor((Date.now() - new Date(at).getTime()) / 86_400_000))
      .sort((a, b) => a - b);
    if (ages.length === 0) return null;
    return ages[Math.floor(ages.length / 2)];
  })();

  const selected = (selectedSituationId && situationsAArbitrer.find((item) => item.id === selectedSituationId)) || situationsAArbitrer[0] || null;
  const selTerritory = selected ? state.territories.find((item) => item.id === selected.territoryId) : undefined;
  const selResponsable = selected?.responsibleId ? state.actors.find((item) => item.id === selected.responsibleId) : undefined;
  const selCoordination = selected?.coordinationId ? state.coordinationSpaces.find((item) => item.id === selected.coordinationId) : undefined;
  const selTag = selected ? priorityToTag[selected.priority] : "stable";
  const selKnown = selected ? selected.history.slice(0, 3).map((entry) => entry.detail || entry.label) : [];

  return (
    <div className="pb-16">
      <div className="border-b border-[var(--etat-line)] px-6 pt-9 pb-7 lg:px-[60px]" style={{ background: "var(--etat-warm-white)" }}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div><Link href="/app/etat" className="etat-back-link"><ArrowLeft size={15} /> Retour au Brief national</Link></div>
            <p className="etat-eyebrow mt-4"><span className="etat-eyebrow-dot" />Arbitrages · moment de décision</p>
            <h1 className="etat-display etat-h1 etat-h1--registry mt-3.5">Qu’est-ce qui demande<br />une décision maintenant ?</h1>
            <p className="mt-3.5 max-w-[600px] text-[14.5px] leading-[1.62]" style={{ color: "rgba(11,26,42,.72)" }}>{situationsAArbitrer.length} situation{situationsAArbitrer.length > 1 ? "s" : ""} de risque élevé ou critique attend{situationsAArbitrer.length > 1 ? "ent" : ""} une orientation. Chaque arbitrage indique ce que l’on sait, ce qui reste incertain, et qui est concerné.</p>
          </div>
          <div className="flex flex-none flex-wrap gap-7">
            <div><p className="etat-filter-label">Critiques</p><p className="etat-display text-[26px] not-italic" style={{ color: "var(--etat-critique)" }}>{criticalCount}</p></div>
            <div><p className="etat-filter-label">Élevées</p><p className="etat-display text-[26px] not-italic" style={{ color: "var(--etat-ocre)" }}>{highCount}</p></div>
            <div><p className="etat-filter-label">Délai médian</p><p className="etat-display text-[26px] not-italic">{medianDelayDays === null ? "—" : `${medianDelayDays} j`}</p></div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-end gap-6">
          <label className="block">
            <p className="etat-filter-label">Périmètre</p>
            <select value={selectedTerritoryId ?? ""} onChange={(event) => setSelectedTerritoryId(event.target.value || null)} className="etat-filter-select">
              <option value="">Sénégal entier</option>
              {[...state.territories].sort((a, b) => a.name.localeCompare(b.name)).map((territory) => (
                <option key={territory.id} value={territory.id}>{territory.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <p className="etat-filter-label">Recherche</p>
            <div className="etat-search-field w-52">
              <Search size={14} className="shrink-0 text-[var(--etat-stone-400)]" />
              <input type="search" value={arbitrageSearch} onChange={(event) => setArbitrageSearch(event.target.value)} placeholder="Titre, étape, territoire…" className="w-full bg-transparent text-sm font-medium text-[var(--etat-navy)] outline-none" style={{ fontFamily: "var(--etat-font-body)" }} />
            </div>
          </label>
          <div className="etat-subtabs !border-b-0 flex-1">
            {([
              { value: "all", label: "Critique + élevé" },
              { value: "critique", label: "Critique seulement" },
              { value: "haute", label: "Élevé seulement" }
            ] as const).map((tab) => (
              <button key={tab.value} onClick={() => setUrgenceFilter(tab.value)} className={`etat-subtab ${urgenceFilter === tab.value ? "etat-subtab--active" : ""}`}>{tab.label}</button>
            ))}
          </div>
          <button className="etat-btn etat-btn-outline shrink-0" onClick={() => setSignalDrawerOpen(true)}><Radio size={15} /> Signaler une situation</button>
        </div>
      </div>

      {situationsAArbitrer.length === 0 ? (
        <p className="px-6 py-10 text-sm text-[var(--etat-stone-600)] lg:px-[60px]">{arbitrageSearchNormalized ? `Aucune situation ne correspond à « ${arbitrageSearch} » avec ces filtres.` : "Aucune situation de risque élevé ou critique en attente d’arbitrage pour le moment."}</p>
      ) : (
        <div className="lg:flex lg:min-h-[720px] lg:items-stretch">
          {/* File d'arbitrage — priorité décroissante (mandat §11) */}
          <div className="border-b border-[var(--etat-line)] lg:w-[400px] lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r" style={{ background: "var(--etat-warm-white)" }}>
            <p className="border-b border-[var(--etat-line)] px-6 py-3.5 text-[9.5px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-body)" }}>File d’arbitrage · priorité décroissante</p>
            {situationsAArbitrer.map((situation) => {
              const tag = priorityToTag[situation.priority];
              const stageLabel = pipelineStages.find((stage) => stage.status === situation.status)?.label ?? situation.status;
              const territory = state.territories.find((item) => item.id === situation.territoryId);
              const isSelected = selected?.id === situation.id;
              return (
                <button
                  key={situation.id}
                  onClick={() => setSelectedSituationId(situation.id)}
                  className="block w-full border-b border-[var(--etat-line)] px-6 py-4 text-left transition hover:bg-[var(--etat-offwhite-dim)]"
                  style={{ borderLeftWidth: 3, borderLeftColor: glyphBorderColor[tag], backgroundColor: isSelected ? "rgba(182,82,47,.10)" : undefined }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-semibold uppercase tracking-[.12em]" style={{ color: glyphBorderColor[tag] }}>{priorityLabels[situation.priority]}</span>
                    <span className="text-[11px] text-[var(--etat-stone-400)]">{territory?.name ?? situation.territoryId}</span>
                    <span className="ml-auto text-[11px] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-mono)" }}>{situationAge(situation)}</span>
                  </div>
                  <p className="mt-2 text-[14px] font-semibold leading-[1.4] text-[var(--etat-navy)]">{situation.title}</p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <span className="flex gap-1">{stageProgressDots(situation.status).map((done, i) => <span key={i} className="h-[3px] w-5" style={{ background: done ? "var(--etat-terracotta)" : "var(--etat-line)" }} />)}</span>
                    <span className="text-[11px] text-[var(--etat-stone-400)]">{stageLabel}</span>
                    <span className="ml-auto"><TrustGlyphLabel level={trustGlyphFromLevel(situation.trust)} className="text-[11px] text-[var(--etat-stone-600)]" /></span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dossier de la situation sélectionnée (mandat §11) */}
          {selected && (
            <div className="min-w-0 flex-1 px-6 py-8 lg:px-[52px] lg:py-9">
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full" style={{ background: glyphBorderColor[selTag] }} />
                <span className="text-[10px] font-semibold uppercase tracking-[.14em]" style={{ color: glyphBorderColor[selTag] }}>{priorityLabels[selected.priority]}</span>
                <span className="text-[12px] text-[var(--etat-stone-600)]">{selTerritory?.name ?? selected.territoryId} · {situationAge(selected)}</span>
              </div>
              <h2 className="etat-h2 mt-3 max-w-[660px] text-[30px]">{selected.title}</h2>
              {/* Certaines situations du jeu de démonstration n'ont jamais
                  reçu de narratif distinct (description === title, cf.
                  factory `situation()` de demo-state.ts) — l'afficher
                  quand même dupliquerait le titre juste au-dessus.
                  Repli honnête sur nextStep plutôt qu'un texte inventé. */}
              <p className="mt-4 max-w-[640px] text-[14.5px] leading-[1.65] text-[var(--etat-stone-600)]">{selected.description !== selected.title ? selected.description : selected.nextStep}</p>

              <div className="mt-7 flex max-w-[900px] border-y border-[var(--etat-line)]">
                <div className="flex-1 border-r border-[var(--etat-line)] py-4 pr-5"><p className="etat-filter-label">Étape de la décision</p><p className="text-[13.5px] font-semibold text-[var(--etat-navy)]">{pipelineStages.find((s) => s.status === selected.status)?.label ?? selected.status}</p></div>
                <div className="flex-1 border-r border-[var(--etat-line)] px-5 py-4"><p className="etat-filter-label">Connaissance</p><TrustGlyphLabel level={trustGlyphFromLevel(selected.trust)} className="text-[13.5px] font-semibold text-[var(--etat-navy)]" /></div>
                <div className="flex-1 py-4 pl-5"><p className="etat-filter-label">Territoire</p><p className="text-[13.5px] font-semibold text-[var(--etat-navy)]">{selTerritory?.name ?? selected.territoryId}</p></div>
              </div>

              <div className="mt-8 grid max-w-[900px] gap-9 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[.14em]" style={{ color: "var(--etat-vert)", fontFamily: "var(--etat-font-body)" }}>Ce que l’on sait</p>
                  {selKnown.length === 0 ? (
                    <p className="mt-2.5 text-[13px] text-[var(--etat-stone-400)]">Aucun fait consigné pour le moment.</p>
                  ) : selKnown.map((fact, i) => (
                    <div key={i} className="flex gap-2.5 border-t border-[var(--etat-line)] py-2.5 text-[13px] leading-[1.55] text-[var(--etat-stone-600)] first:border-t-0 first:pt-0"><span className="shrink-0" style={{ color: "var(--etat-vert)" }}>●</span>{fact}</div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[.14em]" style={{ color: "var(--etat-terracotta)", fontFamily: "var(--etat-font-body)" }}>Ce qui reste incertain</p>
                  {selected.waitingReason ? (
                    <div className="flex gap-2.5 border-t border-[var(--etat-line)] py-2.5 text-[13px] leading-[1.55] text-[var(--etat-stone-600)] first:border-t-0 first:pt-0"><span className="shrink-0" style={{ color: "var(--etat-terracotta)" }}>○</span>{selected.waitingReason}</div>
                  ) : (
                    <p className="mt-2.5 text-[13px] text-[var(--etat-stone-400)]">Aucune incertitude documentée pour le moment.</p>
                  )}
                </div>
              </div>

              <div className="mt-8 max-w-[900px]">
                <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-body)" }}>Qui est concerné</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selResponsable && <span className="etat-tag-outline px-2.5 py-1 text-[11.5px]" style={{ color: "var(--etat-navy)" }}>{selResponsable.name} · {selResponsable.role.replaceAll("_", " ")}</span>}
                  <span className="etat-tag-outline px-2.5 py-1 text-[11.5px]" style={{ color: "var(--etat-navy)" }}>{selTerritory?.name ?? selected.territoryId}</span>
                  {selCoordination && <span className="etat-tag-outline px-2.5 py-1 text-[11.5px]" style={{ color: "var(--etat-navy)" }}>{selCoordination.title}</span>}
                </div>
              </div>

              <div className="mt-8 max-w-[900px] p-7" style={{ background: "var(--etat-navy)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-[.14em]" style={{ color: "var(--etat-terracotta-clair)", fontFamily: "var(--etat-font-body)" }}>Décision attendue</p>
                <p className="mt-3 text-[16px] font-semibold leading-[1.45]" style={{ color: "var(--etat-cream)" }}>{selected.nextStep}</p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <button onClick={() => setMissionDrawer({ key: `situation-${selected.id}`, territoryId: selected.territoryId, territoryLabel: selTerritory?.name ?? selected.territoryId, raison: selected.title, action: selected.nextStep, glyphStatus: selTag, suggestedObjective: "verification_vigilance" })} className="rounded-[3px] border px-4 py-2.5 text-[12.5px] font-medium" style={{ borderColor: "rgba(247,243,233,.30)", color: "var(--etat-cream)" }}>Planifier une visite terrain</button>
                  <button onClick={() => setSituationDrawer(selected)} className="etat-btn etat-btn-primary">Arbitrer cette situation <ArrowRight size={15} /></button>
                </div>
                <p className="mt-4 text-[11px] leading-[1.6]" style={{ color: "rgba(247,243,233,.68)" }}>Mbàmbulaan n’arbitre pas : la décision est enregistrée au nom de la personne qui la prend, avec sa justification.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {plannedVisitCount > 0 && <p className="px-6 py-4 text-xs text-[var(--etat-stone-600)] lg:px-[60px]">{plannedVisitCount} visite(s) terrain déjà planifiée(s) par le ministère.</p>}

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
