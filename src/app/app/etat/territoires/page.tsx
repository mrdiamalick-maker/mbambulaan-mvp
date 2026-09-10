"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Drawer } from "@/components/etat/Drawer";
import { DetailSurface } from "@/components/private/DetailSurface";
import { AtlasMap, atlasMapBackground } from "@/components/etat/AtlasMap";
import {
  Mission,
  MissionForm,
  SituationDetail,
  TerritoryDetail,
  glyphBorderColor,
  infraStatusColor,
  infraStatusLabel,
  priorityToTag,
  situationPriorityRank,
  statusTagLabel
} from "@/components/etat/shared";
import type { Situation, Territory } from "@/domain/types";
import type { VigilanceCase } from "@/domain/ministry/vigilance";
import { AttentionItem, EditorialSection } from "@/components/foundations";

// P2.DESIGN-1B (mandat CEO "Claude Design V2 → Real Product
// Implementation", §9, "Atlas territorial") — reconstruction complète de
// cette page sur la composition à 3 colonnes du prototype fourni :
// GAUCHE registre/recherche/filtres, CENTRE carte dominante, DROITE
// dossier du territoire sélectionné (rail persistant, jamais un tiroir
// qui recouvre la carte) — "it should feel like a territorial
// intelligence workspace", pas "une carte insérée dans une page".
//
// Texte de lecture par niveau d'activité (READING) : verbatim du
// prototype Claude Design V2 — doctrine éditoriale générique paramétrée
// par le SEUL niveau réel (Territory.activity), jamais une donnée
// fabriquée par territoire.
const READING: Record<Territory["activity"], string> = {
  critique: "Territoire en activité critique. Plusieurs situations ouvertes se recoupent et une capacité essentielle est indisponible : la coordination y est prioritaire cette semaine.",
  vigilance: "Territoire sous vigilance. Les capacités connues fonctionnent, mais au moins une est déclarée fragile après des débarquements successifs.",
  stable: "Territoire stable à ce jour. Les signaux reçus restent isolés et les capacités connues sont opérationnelles."
};

function dms(value: number, positive: string, negative: string) {
  const abs = Math.abs(value);
  const minutes = Math.round((abs % 1) * 60).toString().padStart(2, "0");
  return `${Math.floor(abs)}°${minutes}′${value >= 0 ? positive : negative}`;
}

export default function TerritoiresPage() {
  const { state } = useProduct();
  // cases nécessaire uniquement pour peupler TerritoryDetail (son prop
  // `cases`, déjà utilisé ainsi sur /app/etat) — même source que les
  // autres pages qui ouvrent ce composant.
  const [cases, setCases] = useState<VigilanceCase[]>([]);
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<"all" | "stable" | "vigilance" | "critique">("all");
  const [searchText, setSearchText] = useState("");
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [territoryDossierOpen, setTerritoryDossierOpen] = useState(false);
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
  const searchNormalized = searchText.trim().toLowerCase();
  const filteredTerritories = state.territories
    .filter((item) =>
      (regionFilter === "all" || item.region === regionFilter) &&
      (activityFilter === "all" || item.activity === activityFilter) &&
      (searchNormalized === "" || item.name.toLowerCase().includes(searchNormalized) || item.region.toLowerCase().includes(searchNormalized))
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const filteredTerritoryIds = new Set(filteredTerritories.map((item) => item.id));
  const openSituationsCount = state.situations.filter((item) => filteredTerritoryIds.has(item.territoryId) && item.status !== "reglee").length;
  const criticalCount = filteredTerritories.filter((item) => item.activity === "critique").length;

  // Sélection : explicite si choisie et toujours présente dans le filtre
  // courant, sinon le premier territoire filtré — jamais "aucun territoire
  // sélectionné" tant que le filtre en propose au moins un (le rail droit
  // du prototype est TOUJOURS peuplé).
  const selectedTerritory =
    (selectedTerritoryId && filteredTerritories.find((item) => item.id === selectedTerritoryId)) ||
    filteredTerritories[0] ||
    null;

  const selInfra = selectedTerritory ? state.infrastructures.filter((item) => item.territoryId === selectedTerritory.id) : [];
  const selSituations = selectedTerritory
    ? state.situations
        .filter((item) => item.territoryId === selectedTerritory.id && item.status !== "reglee")
        .sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority])
    : [];
  const selActors = selectedTerritory ? state.actors.filter((item) => item.territoryIds.includes(selectedTerritory.id)) : [];
  const selActorsByRole = selActors.reduce<Record<string, number>>((acc, item) => { acc[item.role] = (acc[item.role] ?? 0) + 1; return acc; }, {});
  const selProgrammes = selectedTerritory ? state.initiatives.filter((item) => item.territoryIds.includes(selectedTerritory.id)) : [];

  // XXL-R2 (§8 du mandat) — "À surveiller" : jamais un score fabriqué,
  // seulement les territoires réellement classés vigilance/critique dans
  // ce filtre, triés par attention puis par situations ouvertes,
  // plafonnés à 5. Absent si aucun territoire ne le justifie — jamais
  // rempli pour "faire une section".
  const attentionRank: Record<Territory["activity"], number> = { critique: 2, vigilance: 1, stable: 0 };
  const territoriesToWatch = filteredTerritories
    .map((territory) => ({
      territory,
      openSituations: state.situations.filter((item) => item.territoryId === territory.id && item.status !== "reglee").length,
      fragileInfra: state.infrastructures.filter((item) => item.territoryId === territory.id && item.status !== "operationnelle").length
    }))
    .filter((item) => item.territory.activity !== "stable")
    .sort((a, b) => attentionRank[b.territory.activity] - attentionRank[a.territory.activity] || b.openSituations - a.openSituations)
    .slice(0, 5);

  return (
    <div className="pb-16">
      <header className="border-b border-[var(--etat-line)] bg-[var(--etat-warm-white)] px-6 pt-8 lg:px-[60px] lg:pt-10">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="etat-eyebrow"><span className="etat-eyebrow-dot" />Atlas territorial</p>
            <h1 className="etat-display etat-h1 etat-h1--registry mt-3.5">Comprendre où agir,<br />territoire par territoire.</h1>
            <p className="mt-3 max-w-[660px] text-[13.5px] leading-6 text-[var(--etat-stone-600)]">Registre national des territoires suivis, de leurs situations ouvertes et de leurs capacités connues — sans score composite artificiel.</p>
          </div>
          <dl className="flex gap-8 border-t border-[var(--etat-line)] pt-4 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
            <div><dt className="etat-filter-label">Territoires</dt><dd className="etat-display text-[28px] text-[var(--etat-navy)]">{filteredTerritories.length}</dd></div>
            <div><dt className="etat-filter-label">Situations ouvertes</dt><dd className="etat-display text-[28px] text-[var(--etat-navy)]">{openSituationsCount}</dd></div>
            <div><dt className="etat-filter-label">Critiques</dt><dd className="etat-display text-[28px] text-[var(--etat-critique)]">{criticalCount}</dd></div>
          </dl>
        </div>
        <div className="mt-7 flex flex-wrap items-end justify-between gap-5 border-t border-[var(--etat-line)] pt-4">
          <nav className="etat-subtabs !border-b-0" aria-label="Vues de l’Atlas">
            <span className="etat-subtab etat-subtab--active">Vue carte</span>
            <span className="etat-subtab">Registre</span>
            <span className="etat-subtab">Indicateurs clés</span>
            <span className="etat-subtab">Comparaison</span>
          </nav>
          <div className="flex flex-wrap items-end gap-4 pb-3">
            <label className="block">
              <p className="etat-filter-label">Région</p>
              <select
                value={regionFilter}
                onChange={(event) => setRegionFilter(event.target.value)}
                className="etat-filter-select"
              >
                <option value="all">Toutes les régions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <p className="etat-filter-label">Activité</p>
              <select
                value={activityFilter}
                onChange={(event) => setActivityFilter(event.target.value as "all" | "stable" | "vigilance" | "critique")}
                className="etat-filter-select"
              >
                <option value="all">Tous les niveaux</option>
                <option value="stable">Stable</option>
                <option value="vigilance">Vigilance</option>
                <option value="critique">Critique</option>
              </select>
            </label>
          </div>
        </div>
      </header>

      {/* Composition 3 colonnes (mandat P2.DESIGN-1B §9) : registre |
          carte | dossier. Hauteur fixe partagée par les 3 colonnes
          (lg:h-[640px]) — la carte reste le "moment visuel dominant", le
          rail droit défile en interne si son contenu dépasse plutôt que
          d'étirer la ligne. Sous xl, les 3 colonnes s'empilent
          verticalement (registre → carte → dossier), aucune ne disparaît. */}
      <div className="border-b border-[var(--etat-line)] xl:flex xl:h-[640px] xl:items-stretch">
        <div className="flex flex-col border-b border-[var(--etat-line)] xl:w-[300px] xl:shrink-0 xl:border-b-0 xl:border-r xl:overflow-y-auto" style={{ background: "var(--etat-warm-white)" }}>
          <div className="sticky top-0 z-10 p-4" style={{ background: "var(--etat-warm-white)" }}>
            <div className="etat-search-field">
              <Search size={14} className="shrink-0 text-[var(--etat-stone-400)]" />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Filtrer les territoires…"
                className="w-full bg-transparent text-sm font-medium text-[var(--etat-navy)] outline-none"
                style={{ fontFamily: "var(--etat-font-body)" }}
              />
            </div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-body)" }}>{filteredTerritories.length} territoire(s) affiché(s)</p>
          </div>
          <div className="max-h-[260px] divide-y divide-[var(--etat-line)] overflow-y-auto xl:max-h-none xl:flex-1">
            {filteredTerritories.length === 0 ? (
              <p className="px-4 pb-4 text-sm text-[var(--etat-stone-600)]">Aucun territoire ne correspond à ce filtre.</p>
            ) : filteredTerritories.map((territory) => {
              const openCount = state.situations.filter((item) => item.territoryId === territory.id && item.status !== "reglee").length;
              const isSelected = selectedTerritory?.id === territory.id;
              return (
                <button
                  key={territory.id}
                  onClick={() => setSelectedTerritoryId(territory.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[var(--etat-offwhite-dim)]"
                  aria-current={isSelected ? "true" : undefined}
                  style={isSelected ? { backgroundColor: "var(--etat-terracotta-dim)", boxShadow: "inset 3px 0 0 var(--etat-terracotta)" } : undefined}
                >
                  <span className="size-[7px] shrink-0 rounded-full" style={{ background: glyphBorderColor[territory.activity] }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[var(--etat-navy)]">{territory.name}</span>
                    <span className="block text-[10.5px] text-[var(--etat-stone-400)]">{territory.region} · {openCount} situation{openCount > 1 ? "s" : ""}</span>
                  </span>
                  <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[.10em] text-[var(--etat-stone-400)]">{statusTagLabel[territory.activity]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Carte — même AtlasMap que le Brief national (mandat §1 hérité,
            "une signature cartographique par périmètre"), plein cadre,
            sélection synchronisée avec la colonne de gauche et le rail
            de droite. */}
        <div className="relative min-h-[360px] flex-1 border-b border-[var(--etat-line)] xl:min-h-0 xl:border-b-0 xl:border-r" style={{ background: atlasMapBackground }}>
          <AtlasMap
            territories={filteredTerritories}
            selectedId={selectedTerritory?.id}
            onSelect={(id) => setSelectedTerritoryId(id)}
          />
        </div>

        {/* Dossier du territoire sélectionné — rail PERSISTANT (mandat
            §9, "RIGHT selected territory dossier"), jamais un tiroir qui
            recouvre la carte : même donnée réelle que TerritoryDetail
            (acteurs/infrastructures/situations/programmes), lecture
            compacte ici, dossier complet via le CTA plus bas (Drawer,
            même mécanisme que le reste de l'Espace État — pas de nouvelle
            route pour ce lot). */}
        <div className="flex flex-col xl:w-[376px] xl:shrink-0 xl:overflow-y-auto" style={{ background: "var(--etat-warm-white)" }}>
          {/* Photo de contexte (mandat P2.DESIGN-1B.1 §6) : la carte réelle
              reste l'élément cartographique dominant (aucune régression sur
              AtlasMap) — cette photo générique de territoire restaure
              seulement la richesse visuelle du rail, elle ne remplace ni ne
              qualifie aucune donnée de territoire. */}
          <div className="relative h-[186px] shrink-0 overflow-hidden border-b border-[var(--etat-line)]">
            <Image src="/images/etat-atlas-territory-context.webp" alt="" fill priority sizes="(min-width: 1280px) 376px, 100vw" className="object-cover" />
          </div>
          {selectedTerritory ? (
            <>
              <div className="border-b border-[var(--etat-line)] p-6">
                <p className="etat-eyebrow"><span className="etat-eyebrow-dot" />{selectedTerritory.region}</p>
                <div className="mt-3 flex items-end gap-3">
                  <h2 className="etat-h1 text-[34px]">{selectedTerritory.name}</h2>
                  <span className="mb-1.5 flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ background: glyphBorderColor[selectedTerritory.activity] }} />
                    <span className="text-[10px] font-semibold uppercase tracking-[.14em]" style={{ color: glyphBorderColor[selectedTerritory.activity] }}>{statusTagLabel[selectedTerritory.activity]}</span>
                  </span>
                </div>
                <p className="mt-3 text-[13px] leading-[1.62] text-[var(--etat-stone-600)]">{READING[selectedTerritory.activity]}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[10.5px] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-mono)" }}>
                  <span>{dms(selectedTerritory.latitude, "N", "S")} {dms(selectedTerritory.longitude, "E", "O")}</span><span>·</span><span>{selSituations.length} situation(s) ouverte(s)</span>
                </div>
              </div>

              <div className="border-b border-[var(--etat-line)] p-6">
                <p className="text-[9.5px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-body)" }}>Capacités connues</p>
                {selInfra.length === 0 ? (
                  <p className="mt-2 text-xs text-[var(--etat-stone-400)]">Aucune infrastructure recensée.</p>
                ) : selInfra.map((infra) => (
                  <div key={infra.id} className="flex items-center justify-between gap-2 border-t border-[var(--etat-line)] py-2.5 first:border-t-0 first:pt-0">
                    <span className="text-[12.5px] font-medium capitalize text-[var(--etat-navy)]">{infra.type.replaceAll("_", " ")}</span>
                    <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold" style={{ color: infraStatusColor[infra.status] }}><span className="size-1.5 rounded-full" style={{ background: infraStatusColor[infra.status] }} />{infraStatusLabel[infra.status]}</span>
                  </div>
                ))}
              </div>

              <div className="border-b border-[var(--etat-line)] p-6">
                <p className="text-[9.5px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-body)" }}>Situations ouvertes</p>
                {selSituations.length === 0 ? (
                  <p className="mt-2 text-xs text-[var(--etat-stone-400)]">Aucune situation ouverte sur ce territoire.</p>
                ) : selSituations.slice(0, 3).map((situation) => (
                  <button key={situation.id} onClick={() => setSituationDrawer(situation)} className="block w-full border-t border-[var(--etat-line)] py-2.5 text-left first:border-t-0 first:pt-0 hover:text-[var(--etat-terracotta)]">
                    <p className="text-[12.5px] font-medium leading-[1.4] text-[var(--etat-navy)]">{situation.title}</p>
                    <span className="mt-1.5 flex items-center gap-2 text-[10.5px] text-[var(--etat-stone-400)]"><span className={`etat-tag ${priorityToTag[situation.priority] === "critique" ? "etat-tag--critique" : "etat-tag--vigilance"}`}>{situation.priority}</span></span>
                  </button>
                ))}
              </div>

              <div className="p-6">
                <p className="text-[9.5px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-body)" }}>Acteurs et programmes</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Object.entries(selActorsByRole).map(([role, count]) => (
                    <span key={role} className="etat-tag etat-tag--stable capitalize">{role.replaceAll("_", " ")} · {count}</span>
                  ))}
                  {selProgrammes.map((programme) => (
                    <span key={programme.id} className="etat-tag etat-tag--stable">{programme.title}</span>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-2 border-t border-[var(--etat-line)] p-6" style={{ background: "var(--etat-cream)" }}>
                <button onClick={() => setTerritoryDossierOpen(true)} className="etat-btn etat-btn-primary justify-center">Ouvrir le dossier territorial complet <ArrowRight size={15} /></button>
                {selSituations[0] && <button onClick={() => setSituationDrawer(selSituations[0])} className="etat-btn etat-btn-outline justify-center">Voir les signaux du territoire <ArrowRight size={15} /></button>}
              </div>
            </>
          ) : (
            <p className="p-6 text-sm text-[var(--etat-stone-600)]">Aucun territoire ne correspond à ce filtre.</p>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-[60px]">
        {territoriesToWatch.length > 0 && (
          <div className="etat-panel mt-6 p-6 lg:p-7">
            <EditorialSection eyebrow="Où concentrer l’attention" title="À surveiller">
              <p>{territoriesToWatch.length} territoire(s) classé(s) en vigilance ou critique dans ce filtre — jamais un classement fabriqué, seulement l’activité réellement enregistrée.</p>
            </EditorialSection>
            <div className="mt-3 divide-y" style={{ borderColor: "var(--mb-hairline-soft)" }}>
              {territoriesToWatch.map(({ territory, openSituations, fragileInfra }) => (
                <AttentionItem
                  key={territory.id}
                  level={territory.activity}
                  levelLabel={statusTagLabel[territory.activity]}
                  territory={territory.region}
                  reason={territory.name}
                  nextStep={`${openSituations} situation(s) ouverte(s)${fragileInfra > 0 ? ` · ${fragileInfra} capacité(s) fragile(s)` : ""}`}
                  ctaLabel="Voir le territoire"
                  onAction={() => setSelectedTerritoryId(territory.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LOT V3.1 (Scope F) — dossier territorial migré vers DetailSurface
          (Radix Dialog réel : focus-trap, blocage de scroll, sémantique
          ARIA — contrairement à Drawer.tsx, fait main) : c'est le point de
          validation choisi pour la nouvelle primitive de surface de détail,
          exactement un seul écran comme demandé par le mandat ("valider la
          primitive, pas migrer chaque écran de détail") — les deux autres
          Drawer de cette même page (Situation, Planifier la mission)
          restent volontairement inchangés. */}
      <DetailSurface open={territoryDossierOpen} onOpenChange={setTerritoryDossierOpen} eyebrow="Dossier territorial" title={selectedTerritory?.name ?? ""} scope="etat">
        {selectedTerritory && <TerritoryDetail territory={selectedTerritory} cases={cases.filter((item) => item.territoryId === selectedTerritory.id)} onOpenSituation={(situation) => { setTerritoryDossierOpen(false); setSituationDrawer(situation); }} />}
      </DetailSurface>
      <Drawer open={!!situationDrawer} onClose={() => setSituationDrawer(null)} eyebrow="Situation" title={situationDrawer?.title ?? ""} size="lg">
        {situationDrawer && <SituationDetail situation={situationDrawer} state={state} onPlanVisit={() => { const territory = state.territories.find((item) => item.id === situationDrawer.territoryId); setSituationDrawer(null); setMissionDrawer({ key: `situation-${situationDrawer.id}`, territoryId: situationDrawer.territoryId, territoryLabel: territory?.name ?? situationDrawer.territoryId, raison: situationDrawer.title, action: situationDrawer.nextStep, glyphStatus: priorityToTag[situationDrawer.priority], suggestedObjective: "verification_vigilance" }); }} />}
      </Drawer>
      <Drawer open={!!missionDrawer} onClose={() => setMissionDrawer(null)} eyebrow="Terrain" title="Planifier la mission">
        {missionDrawer && <MissionForm mission={missionDrawer} onDone={() => setMissionDrawer(null)} />}
      </Drawer>
    </div>
  );
}
