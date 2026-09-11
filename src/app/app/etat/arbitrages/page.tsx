"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Radio, Search } from "lucide-react";
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
import { deriveDatasetReferenceAt } from "@/domain/signal-crossing";

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
// P2.DESIGN-1B.2 (mandat §3, "crédibilité temporelle du Demo World") :
// référencé contre l'horloge MÉTIER du jeu de données
// (deriveDatasetReferenceAt, déjà utilisée par signal-crossing.ts pour la
// fraîcheur des capacités), jamais contre Date.now() — le Demo World a ses
// propres dates fixes (mandat "jamais figées arbitrairement", cf.
// demo-state.ts) et l'horloge réelle s'en éloigne inévitablement avec le
// temps. Comparer contre le dernier évènement réellement observé dans le
// jeu lui-même donne un âge stable et honnête, qui ne dérive jamais vers
// des "il y a 38 jours" au fil des sessions.
function situationAge(situation: Situation, referenceAtMs: number): string | null {
  const first = situation.history[0]?.at;
  if (!first) return null;
  const days = Math.floor((referenceAtMs - new Date(first).getTime()) / 86_400_000);
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

  // Horloge métier du jeu de données (mandat §3) — repli sur Date.now()
  // uniquement dans le cas dégénéré où le Demo World ne contiendrait
  // aucune activité observée (jamais le cas en pratique).
  const datasetReferenceAt = deriveDatasetReferenceAt(state);
  const referenceAtMs = datasetReferenceAt ? new Date(datasetReferenceAt).getTime() : Date.now();

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
      .map((at) => Math.floor((referenceAtMs - new Date(at).getTime()) / 86_400_000))
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
    <div className="px-4 pb-16 pt-6 sm:px-[30px] sm:pt-6">
      {/* En-tête — reprise littérale de la maquette (eyebrow 10px sans
          puce, h1 32px Newsreader, bandeau de doctrine à droite bordé
          terracotta) ; les filtres réels (périmètre/recherche/urgence/
          signaler) n'ont pas d'équivalent dans la maquette — capacités
          réelles conservées, resserrées sous le titre plutôt que
          supprimées pour "coller" à l'écran source (même discipline que
          le shell, LOT V3.8 : jamais retirer une capacité réelle pour
          gagner en fidélité visuelle). */}
      {/* flex-col/sm:flex-row plutôt que flex-wrap seul : un enfant
          flex-1/min-w-0 partage sa ligne avec le bandeau shrink-0 au lieu
          de passer entièrement à la ligne suivante, ce qui casse le h1
          mot par mot sous 640px (trouvé en QA réelle à 390px — même piège
          déjà documenté au LOT V3.6). */}
      <div className="flex flex-col items-start gap-[18px] sm:flex-row sm:items-end sm:gap-[26px]">
        <div className="min-w-0 flex-1">
          <p className="etat-eyebrow">Arbitrages</p>
          <h1 className="mt-[9px] max-w-[32ch] font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 32, lineHeight: 1.15, color: "var(--etat-navy)" }}>
            Qu’est-ce qui demande une décision maintenant ?
          </h1>
        </div>
        <p className="max-w-[290px] shrink-0 border-l-2 pl-3.5 text-[12.5px] leading-[1.55]" style={{ borderColor: "var(--etat-terracotta)", color: "rgba(11,26,42,.65)" }}>Une décision n’efface pas l’incertitude. Mbàmbulaan l’enregistre avec elle, pour que la relecture soit honnête.</p>
      </div>
      <p className="mt-3.5 max-w-[600px] text-[14.5px] leading-[1.62]" style={{ color: "rgba(11,26,42,.72)" }}>{situationsAArbitrer.length} situation{situationsAArbitrer.length > 1 ? "s" : ""} de risque élevé ou critique attend{situationsAArbitrer.length > 1 ? "ent" : ""} une orientation.</p>

      <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="flex flex-none flex-wrap gap-7">
          <div><p className="etat-filter-label">Critiques</p><p className="etat-display text-[26px] not-italic" style={{ color: "var(--etat-critique)" }}>{criticalCount}</p></div>
          <div><p className="etat-filter-label">Élevées</p><p className="etat-display text-[26px] not-italic" style={{ color: "var(--etat-ocre)" }}>{highCount}</p></div>
          <div><p className="etat-filter-label">Délai médian</p><p className="etat-display text-[26px] not-italic">{medianDelayDays === null ? "—" : `${medianDelayDays} j`}</p></div>
        </div>
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
        <div className="etat-subtabs order-first w-full flex-none !border-b-0">
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

      {situationsAArbitrer.length === 0 ? (
        <p className="py-10 text-sm text-[var(--etat-stone-600)]">{arbitrageSearchNormalized ? `Aucune situation ne correspond à « ${arbitrageSearch} » avec ces filtres.` : "Aucune situation de risque élevé ou critique en attente d’arbitrage pour le moment."}</p>
      ) : (
        // Grille 334px/1fr — valeur exacte de la maquette (grid-template-
        // columns: 334px 1fr), un seul contour au lieu de deux bordures
        // séparées.
        <div className="mt-8 border lg:grid lg:grid-cols-[334px_1fr]" style={{ borderColor: "rgba(11,26,42,.12)" }}>
          {/* File d'arbitrage — priorité décroissante (mandat §11) */}
          <div className="border-b bg-white lg:border-b-0 lg:border-r" style={{ borderColor: "rgba(11,26,42,.12)" }}>
            <p className="border-b px-[17px] py-3.5 text-[9.5px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ borderColor: "rgba(11,26,42,.12)", fontFamily: "var(--etat-font-body)" }}>File d’arbitrage · priorité décroissante</p>
            {situationsAArbitrer.map((situation) => {
              const tag = priorityToTag[situation.priority];
              const stageLabel = pipelineStages.find((stage) => stage.status === situation.status)?.label ?? situation.status;
              const territory = state.territories.find((item) => item.id === situation.territoryId);
              const isSelected = selected?.id === situation.id;
              return (
                <button
                  key={situation.id}
                  onClick={() => setSelectedSituationId(situation.id)}
                  className="block w-full border-b px-[17px] py-[15px] text-left transition hover:bg-[var(--etat-offwhite-dim)]"
                  style={{ borderColor: "rgba(11,26,42,.07)", boxShadow: isSelected ? `inset 3px 0 0 ${glyphBorderColor[tag]}` : "none", backgroundColor: isSelected ? "rgba(182,82,47,.07)" : undefined }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-semibold uppercase tracking-[.12em]" style={{ color: glyphBorderColor[tag] }}>{priorityLabels[situation.priority]}</span>
                    <span className="text-[11px] text-[var(--etat-stone-400)]">{territory?.name ?? situation.territoryId}</span>
                    <span className="ml-auto text-[11px] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-mono)" }}>{situationAge(situation, referenceAtMs)}</span>
                  </div>
                  <p className="mt-2 text-[13.5px] font-medium leading-[1.4] text-[var(--etat-navy)]">{situation.title}</p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <span className="flex gap-1">{stageProgressDots(situation.status).map((done, i) => <span key={i} className="h-[3px] w-5" style={{ background: done ? "var(--etat-terracotta)" : "var(--etat-line)" }} />)}</span>
                    <span className="text-[11px] text-[var(--etat-stone-400)]">{stageLabel}</span>
                    <span className="ml-auto"><TrustGlyphLabel level={trustGlyphFromLevel(situation.trust)} className="text-[11px] text-[var(--etat-stone-600)]" /></span>
                  </div>
                </button>
              );
            })}
            <div className="p-[17px] text-[11.5px] leading-[1.55]" style={{ color: "rgba(11,26,42,.55)", background: "rgba(11,26,42,.03)" }}>Les arbitrages déjà rendus restent consultables avec l’état de connaissance du jour de la décision.</div>
          </div>

          {/* Dossier de la situation sélectionnée (mandat §11) */}
          {selected && (
            <div className="min-w-0 bg-white">
              <div className="border-b px-6 pb-[18px] pt-5 lg:px-6 lg:pt-5" style={{ borderColor: "rgba(11,26,42,.1)" }}>
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full" style={{ background: glyphBorderColor[selTag] }} />
                  <span className="text-[10px] font-semibold uppercase tracking-[.14em]" style={{ color: glyphBorderColor[selTag] }}>{priorityLabels[selected.priority]}</span>
                  <span className="text-[12px] text-[var(--etat-stone-600)]">{selTerritory?.name ?? selected.territoryId} · {situationAge(selected, referenceAtMs)}</span>
                </div>
                <h2 className="mt-[11px] max-w-[36ch] font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 26, lineHeight: 1.2, color: "var(--etat-navy)" }}>{selected.title}</h2>
                {/* Certaines situations du jeu de démonstration n'ont jamais
                    reçu de narratif distinct (description === title, cf.
                    factory `situation()` de demo-state.ts) — l'afficher
                    quand même dupliquerait le titre juste au-dessus.
                    Repli honnête sur nextStep plutôt qu'un texte inventé. */}
                <p className="mt-2.5 max-w-[80ch] text-[13.5px] leading-[1.6]" style={{ color: "rgba(11,26,42,.78)" }}>{selected.description !== selected.title ? selected.description : selected.nextStep}</p>
              </div>

              <div className="flex flex-wrap border-b" style={{ borderColor: "rgba(11,26,42,.1)" }}>
                <div className="flex-1 border-r px-5 py-4" style={{ borderColor: "rgba(11,26,42,.1)" }}><p className="etat-filter-label">Étape de la décision</p><p className="text-[13.5px] font-semibold text-[var(--etat-navy)]">{pipelineStages.find((s) => s.status === selected.status)?.label ?? selected.status}</p></div>
                <div className="flex-1 border-r px-5 py-4" style={{ borderColor: "rgba(11,26,42,.1)" }}><p className="etat-filter-label">Connaissance</p><TrustGlyphLabel level={trustGlyphFromLevel(selected.trust)} className="text-[13.5px] font-semibold text-[var(--etat-navy)]" /></div>
                <div className="flex-1 px-5 py-4"><p className="etat-filter-label">Territoire</p><p className="text-[13.5px] font-semibold text-[var(--etat-navy)]">{selTerritory?.name ?? selected.territoryId}</p></div>
              </div>

              {/* 3 colonnes — grid-template-columns 1fr 1fr 1fr, gap 1px sur
                  fond rgba(11,26,42,.1) pour le liseré fin de la maquette. */}
              <div className="grid grid-cols-1 gap-px border-b sm:grid-cols-3" style={{ background: "rgba(11,26,42,.1)", borderColor: "rgba(11,26,42,.1)" }}>
                <div className="bg-white p-5">
                  <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[.12em]" style={{ color: "#4E7B5A" }}>Ce qui est établi</p>
                  {selKnown.length === 0 ? (
                    <p className="text-[12.5px] text-[var(--etat-stone-400)]">Aucun fait consigné pour le moment.</p>
                  ) : selKnown.map((fact, i) => (
                    <div key={i} className="mb-2.5 border-l-2 pl-2.5 text-[12.5px] leading-[1.5] text-[rgba(11,26,42,.82)] last:mb-0" style={{ borderColor: "rgba(78,123,90,.32)" }}>{fact}</div>
                  ))}
                </div>
                <div className="bg-white p-5">
                  <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[.12em]" style={{ color: "var(--etat-terracotta)" }}>Ce qui reste inconnu</p>
                  {selected.waitingReason ? (
                    <div className="border-l-2 pl-2.5 text-[12.5px] leading-[1.5] text-[rgba(11,26,42,.82)]" style={{ borderColor: "rgba(182,82,47,.32)" }}>{selected.waitingReason}</div>
                  ) : (
                    <p className="text-[12.5px] text-[var(--etat-stone-400)]">Aucune incertitude documentée pour le moment.</p>
                  )}
                </div>
                {/* 3e colonne du prototype ("Si rien n'est décidé") — le
                    prototype y met une conséquence narrative propre à sa
                    fixture (perte non quantifiable, site rendu
                    vulnérable...), qu'aucun champ réel ne permet
                    d'établir pour une situation quelconque du Demo World.
                    Plutôt que d'inventer une conséquence, ce panneau
                    reste honnête : ce qui persiste réellement si rien ne
                    change, c'est l'état actuel de la situation — dérivé
                    des mêmes champs réels que le reste de la page
                    (priorité, étape, ancienneté), jamais un scénario
                    fabriqué. */}
                <div className="p-5" style={{ background: "var(--etat-cream)" }}>
                  <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[.12em]" style={{ color: "rgba(11,26,42,.5)" }}>Si rien n’est décidé</p>
                  <p className="text-[13px] leading-[1.55] text-[rgba(11,26,42,.82)]">Le dossier reste marqué « {priorityLabels[selected.priority]} », à l’étape « {pipelineStages.find((s) => s.status === selected.status)?.label ?? selected.status} », {situationAge(selected, referenceAtMs) ? `sans changement depuis ${situationAge(selected, referenceAtMs)}` : "sans changement documenté"}.</p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-body)" }}>Qui est concerné</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selResponsable && <span className="etat-tag-outline px-2.5 py-1 text-[11.5px]" style={{ color: "var(--etat-navy)" }}>{selResponsable.name} · {selResponsable.role.replaceAll("_", " ")}</span>}
                  <span className="etat-tag-outline px-2.5 py-1 text-[11.5px]" style={{ color: "var(--etat-navy)" }}>{selTerritory?.name ?? selected.territoryId}</span>
                  {selCoordination && <span className="etat-tag-outline px-2.5 py-1 text-[11.5px]" style={{ color: "var(--etat-navy)" }}>{selCoordination.title}</span>}
                </div>

                <div className="mt-6 p-5" style={{ background: "var(--etat-navy)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-[.12em]" style={{ color: "var(--etat-terracotta-clair)", fontFamily: "var(--etat-font-body)" }}>Décision attendue</p>
                  <p className="mt-2.5 text-[16px] font-semibold leading-[1.45]" style={{ color: "var(--etat-cream)" }}>{selected.nextStep}</p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <button onClick={() => setMissionDrawer({ key: `situation-${selected.id}`, territoryId: selected.territoryId, territoryLabel: selTerritory?.name ?? selected.territoryId, raison: selected.title, action: selected.nextStep, glyphStatus: selTag, suggestedObjective: "verification_vigilance" })} className="rounded-[3px] border px-4 py-2.5 text-[12.5px] font-medium" style={{ borderColor: "rgba(247,243,233,.30)", color: "var(--etat-cream)" }}>Planifier une visite terrain</button>
                    <button onClick={() => setSituationDrawer(selected)} className="etat-btn etat-btn-primary">Arbitrer cette situation <ArrowRight size={15} /></button>
                  </div>
                  <p className="mt-3.5 text-[11px] leading-[1.6]" style={{ color: "rgba(247,243,233,.68)" }}>Mbàmbulaan n’arbitre pas : la décision est enregistrée au nom de la personne qui la prend, avec sa justification.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {plannedVisitCount > 0 && <p className="pt-4 text-xs text-[var(--etat-stone-600)]">{plannedVisitCount} visite(s) terrain déjà planifiée(s) par le ministère.</p>}

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
