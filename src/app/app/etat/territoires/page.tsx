"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Drawer } from "@/components/etat/Drawer";
import { DetailSurface } from "@/components/private/DetailSurface";
import { AtlasMap } from "@/components/etat/AtlasMap";
import { KpiSparkline } from "@/components/etat/EtatDataVisualizations";
import {
  Mission,
  MissionForm,
  SituationDetail,
  TerritoryDetail,
  glyphBorderColor,
  infraStatusColor,
  infraStatusLabel,
  priorityToTag,
  statusTagLabel
} from "@/components/etat/shared";
import type { Initiative, Situation, Territory } from "@/domain/types";
import type { VigilanceCase } from "@/domain/ministry/vigilance";
import { MARITIME_ZONE_LABEL, MARITIME_ZONE_ORDER, resolveMaritimeZone, type MaritimeZone } from "@/domain/atlas-overview";

// LOT V3.17 ("Atlas territorial — copie conforme du rendu maquette") —
// reconstruction complète sur le plan exact de l'écran `isAtlas` de la
// maquette (2 colonnes : carte marine plein cadre à gauche, dossier du
// territoire sélectionné à droite avec 5 onglets — jamais la composition
// à 3 colonnes registre/carte/dossier de la version précédente, absente
// de CE fichier maquette). Mandat explicite de l'utilisateur : "j'oublie
// tout l'existant [...] je veux exactement le rendu graphique, les
// blocs, tout copie conforme". Le registre/recherche/filtres région et
// activité de la version précédente disparaissent de cette page (la
// sélection se fait désormais par la carte et par la bande littorale,
// comme la maquette) ; la façade maritime réelle (LOT V3.4,
// domain/atlas-overview.ts) devient des puces cliquables plutôt qu'un
// menu déroulant, seul filtre que la maquette porte réellement sur cet
// écran.
const READING: Record<Territory["activity"], string> = {
  critique: "Territoire en activité critique. Plusieurs situations ouvertes se recoupent et une capacité essentielle est indisponible : la coordination y est prioritaire cette semaine.",
  vigilance: "Territoire sous vigilance. Les capacités connues fonctionnent, mais au moins une est déclarée fragile après des débarquements successifs.",
  stable: "Territoire stable à ce jour. Les signaux reçus restent isolés et les capacités connues sont opérationnelles."
};

const TABS = [
  { key: "activite", label: "Activité" },
  { key: "capacites", label: "Capacités" },
  { key: "acteurs", label: "Acteurs" },
  { key: "situations", label: "Situations" },
  { key: "programmes", label: "Programmes" }
] as const;
type TabKey = (typeof TABS)[number]["key"];

function dms(value: number, positive: string, negative: string) {
  const abs = Math.abs(value);
  const minutes = Math.round((abs % 1) * 60).toString().padStart(2, "0");
  return `${Math.floor(abs)}°${minutes}′${value >= 0 ? positive : negative}`;
}

// Même dérivation qu'au Brief national (LOT V3.16) — répétée ici plutôt
// que partagée : les deux pages sont les deux seules à en avoir besoin
// pour l'instant, mutualiser un fichier d'1 fonction aurait ajouté un
// module pour rien (même discipline que severityRank/attentionRank,
// déjà locaux page par page dans ce produit).
function programmeProgressPct(programme: Initiative): number | null {
  if (programme.indicators.length === 0) return null;
  const ratios = programme.indicators.map((indicator) => {
    const span = indicator.target - indicator.baseline;
    if (span === 0) return indicator.current >= indicator.target ? 1 : 0;
    return Math.min(1, Math.max(0, (indicator.current - indicator.baseline) / span));
  });
  return Math.round((ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length) * 100);
}

export default function TerritoiresPage() {
  const { state } = useProduct();
  const [cases, setCases] = useState<VigilanceCase[]>([]);
  const [zoneFilter, setZoneFilter] = useState<MaritimeZone | "all">("all");
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [layerMode, setLayerMode] = useState<"situations" | "capacites">("situations");
  const [activeTab, setActiveTab] = useState<TabKey>("activite");
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

  const filteredTerritories = state.territories.filter((item) => zoneFilter === "all" || resolveMaritimeZone(item.id) === zoneFilter);
  const selectedTerritory = (selectedTerritoryId && filteredTerritories.find((item) => item.id === selectedTerritoryId)) || filteredTerritories[0] || null;

  const selInfra = selectedTerritory ? state.infrastructures.filter((item) => item.territoryId === selectedTerritory.id) : [];
  const selFragileInfra = selInfra.filter((item) => item.status !== "operationnelle").length;
  const selSituations = selectedTerritory ? state.situations.filter((item) => item.territoryId === selectedTerritory.id && item.status !== "reglee") : [];
  const selActors = selectedTerritory ? state.actors.filter((item) => item.territoryIds.includes(selectedTerritory.id)) : [];
  const selActorsByRole = selActors.reduce<Record<string, number>>((acc, item) => { acc[item.role] = (acc[item.role] ?? 0) + 1; return acc; }, {});
  const selProgrammes = selectedTerritory ? state.initiatives.filter((item) => item.territoryIds.includes(selectedTerritory.id)) : [];
  const selSites = selectedTerritory ? state.sites.filter((item) => item.territoryId === selectedTerritory.id) : [];
  const selSiteIds = new Set(selSites.map((item) => item.id));
  const selLandings = state.landings.filter((item) => selSiteIds.has(item.siteId));

  // Bande littorale — TOUS les sites réels (national, sous la carte,
  // comme la maquette), pas seulement ceux du territoire sélectionné ;
  // le nombre de débarquements réels par site en fait la hauteur "de
  // tendance", jamais une valeur fabriquée par site.
  const coastalStrip = state.sites.map((site) => {
    const territory = state.territories.find((item) => item.id === site.territoryId);
    const count = state.landings.filter((item) => item.siteId === site.id).length;
    return { site, territory, count };
  });

  return (
    <div className="pb-16">
      <div className="flex flex-col gap-4 px-4 pb-4 pt-7 sm:flex-row sm:items-end sm:justify-between sm:px-[30px]">
        <div className="min-w-0 flex-1">
          <p className="etat-eyebrow">Atlas territorial</p>
          <h1 className="mt-2.5 font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 32, lineHeight: 1.15, color: "var(--etat-navy)" }}>Comprendre où agir, territoire par territoire.</h1>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <button onClick={() => setZoneFilter("all")} className="rounded-full border px-3 py-1.5 text-[11.5px] font-medium" style={zoneFilter === "all" ? { borderColor: "var(--etat-navy)", background: "var(--etat-navy)", color: "#F7F3E9" } : { borderColor: "rgba(11,26,42,.2)", color: "var(--etat-navy)" }}>Tout le littoral</button>
          {MARITIME_ZONE_ORDER.map((zone) => (
            <button key={zone} onClick={() => setZoneFilter(zone)} className="rounded-full border px-3 py-1.5 text-[11.5px] font-medium" style={zoneFilter === zone ? { borderColor: "var(--etat-navy)", background: "var(--etat-navy)", color: "#F7F3E9" } : { borderColor: "rgba(11,26,42,.2)", color: "var(--etat-navy)" }}>{MARITIME_ZONE_LABEL[zone]}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 border-t lg:grid-cols-[1fr_424px]" style={{ borderColor: "rgba(11,26,42,.12)" }}>
        {/* min-w-0 indispensable ici : une grille CSS donne par défaut à
            chaque enfant min-width:auto (basé sur son min-content), ce qui
            empêche la bande littorale ci-dessous (overflow-x-auto) de
            jamais se restreindre — elle pousse toute la colonne (donc
            toute la page) en largeur au lieu de défiler en interne (même
            piège déjà documenté au LOT V3.6, "CSS Grid children need
            explicit min-w-0"). Débordement massif (scrollWidth > 6000px à
            1440px) trouvé en QA réelle avant ce correctif. */}
        <div className="relative min-w-0" style={{ background: "var(--etat-navy)" }}>
          <div className="flex flex-wrap items-center gap-2 border-b px-[18px] py-[13px]" style={{ borderColor: "rgba(247,243,233,.1)" }}>
            <span className="mr-1 text-[10px] uppercase tracking-[.14em]" style={{ color: "rgba(247,243,233,.45)" }}>Couches</span>
            {([{ key: "situations", label: "Situations ouvertes", dot: "#E05A3C" }, { key: "capacites", label: "Capacités fragiles", dot: "#E0A455" }] as const).map((layer) => (
              <button
                key={layer.key}
                onClick={() => setLayerMode(layer.key)}
                className="flex items-center gap-[7px] rounded-[4px] border px-[11px] py-[5px] text-[11.5px]"
                style={layerMode === layer.key ? { borderColor: "rgba(247,243,233,.5)", background: "rgba(247,243,233,.1)", color: "#F7F3E9" } : { borderColor: "rgba(247,243,233,.2)", color: "rgba(247,243,233,.7)" }}
              >
                <span className="size-[7px] rounded-full" style={{ background: layer.dot }} />{layer.label}
              </button>
            ))}
          </div>
          {/* min-height explicite (560px, valeur exacte de la maquette,
              son <svg style="height:560px">) — indispensable : le <svg>
              interne d'AtlasMap est en height:100%, qui ne résout à rien
              de sensé sans hauteur définie sur cet ancêtre (la grille CSS
              parente n'en impose aucune) ; sans elle, preserveAspectRatio
              "slice" doit deviner une échelle avec une hauteur proche de
              0, ce qui fait exploser le texte SVG interne à une taille
              énorme — débordement horizontal massif trouvé en QA réelle
              (scrollWidth > 6000px à 1440px de large). */}
          <div className="relative" style={{ height: 560 }}>
            <AtlasMap
              territories={filteredTerritories}
              selectedId={selectedTerritory?.id}
              onSelect={(id) => setSelectedTerritoryId(id)}
              tooltipLines={(t) => {
                if (layerMode === "capacites") {
                  const fragile = state.infrastructures.filter((item) => item.territoryId === t.id && item.status !== "operationnelle").length;
                  return [t.name, `${fragile} capacité(s) fragile(s)`];
                }
                const open = state.situations.filter((item) => item.territoryId === t.id && item.status !== "reglee").length;
                return [t.name, `${open} situation(s) ouverte(s)`];
              }}
            />
          </div>
          <div className="border-t px-[18px] py-[14px]" style={{ borderColor: "rgba(247,243,233,.1)" }}>
            <div className="mb-2.5 flex items-baseline gap-2.5">
              <p className="text-[10px] uppercase tracking-[.14em]" style={{ color: "rgba(247,243,233,.45)" }}>Bande littorale · {coastalStrip.length} site(s)</p>
              <p className="text-[11px]" style={{ color: "rgba(247,243,233,.4)" }}>Débarquements documentés — cliquez pour ouvrir un site</p>
            </div>
            <div className="flex gap-px overflow-x-auto">
              {coastalStrip.map(({ site, territory, count }) => {
                const active = territory?.id === selectedTerritory?.id;
                return (
                  <button
                    key={site.id}
                    onClick={() => territory && setSelectedTerritoryId(territory.id)}
                    className="min-w-[64px] flex-1 border-t-2 px-1.5 pb-2 pt-2.5 text-left"
                    style={{ borderColor: active ? "#DE9C74" : "transparent", background: active ? "rgba(247,243,233,.06)" : "transparent" }}
                  >
                    <p className="truncate text-[10px]" style={{ color: active ? "#F7F3E9" : "rgba(247,243,233,.6)", fontWeight: active ? 600 : 400 }}>{site.name}</p>
                    <div className="mt-1.5 h-[22px]"><KpiSparkline color={active ? "#DE9C74" : "rgba(247,243,233,.4)"} /></div>
                    <p className="mt-0.5 text-[11px]" style={{ color: active ? "#F7F3E9" : "rgba(247,243,233,.6)", fontFamily: "var(--etat-font-mono)" }}>{count}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col border-l" style={{ background: "#FFFFFF", borderColor: "rgba(11,26,42,.12)" }}>
          {selectedTerritory ? (
            <>
              <div className="border-b px-5 pb-3.5 pt-[18px]" style={{ borderColor: "rgba(11,26,42,.09)" }}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-normal leading-[1.15]" style={{ fontFamily: "var(--etat-font-display)", fontSize: 26, color: "var(--etat-navy)" }}>{selectedTerritory.name}</p>
                    <p className="mt-1.5 text-[11.5px]" style={{ color: "rgba(11,26,42,.55)" }}>{selectedTerritory.region} · {dms(selectedTerritory.latitude, "N", "S")} {dms(selectedTerritory.longitude, "E", "O")}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-[7px] rounded-full border px-[11px] py-1" style={{ borderColor: glyphBorderColor[selectedTerritory.activity] }}>
                    <span className="size-[7px] rounded-full" style={{ background: glyphBorderColor[selectedTerritory.activity] }} />
                    <span className="text-[11.5px] font-medium" style={{ color: glyphBorderColor[selectedTerritory.activity] }}>{statusTagLabel[selectedTerritory.activity]}</span>
                  </span>
                </div>
                <p className="mt-3 text-[12.5px] leading-[1.55]" style={{ color: "rgba(11,26,42,.75)" }}>{READING[selectedTerritory.activity]}</p>
              </div>

              <div className="grid grid-cols-4 gap-px border-b" style={{ background: "rgba(11,26,42,.1)", borderColor: "rgba(11,26,42,.09)" }}>
                {[
                  { v: selSituations.length, k: "Situations ouvertes" },
                  { v: selFragileInfra, k: "Capacités fragiles" },
                  { v: selActors.length, k: "Acteurs" },
                  { v: selProgrammes.length, k: "Programmes" }
                ].map((tile) => (
                  <div key={tile.k} className="bg-white px-3 py-[13px]">
                    <p style={{ fontFamily: "var(--etat-font-mono)", fontSize: 21, lineHeight: 1 }}>{tile.v}</p>
                    <p className="mt-[5px] text-[9.5px] uppercase leading-[1.3] tracking-[.08em]" style={{ color: "rgba(11,26,42,.5)" }}>{tile.k}</p>
                  </div>
                ))}
              </div>

              {/* min-w-0 + overflow-x-auto : les 5 libellés ("Situations",
                  "Programmes"...) dépassent le contenu min-content
                  disponible dans les 424px fixes de la colonne dossier —
                  débordement horizontal constant (42px, indépendant de la
                  largeur de viewport) trouvé en QA réelle. Défile plutôt
                  que déborder, même piège min-width:auto que la bande
                  littorale ci-dessus. */}
              <div className="flex min-w-0 gap-0 overflow-x-auto border-b px-2" style={{ borderColor: "rgba(11,26,42,.12)" }}>
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="shrink-0 whitespace-nowrap px-[11px] pb-[9px] pt-[11px] text-[12px]"
                    style={{ fontWeight: activeTab === tab.key ? 600 : 400, color: activeTab === tab.key ? "var(--etat-navy)" : "rgba(11,26,42,.5)", boxShadow: activeTab === tab.key ? "inset 0 -2px 0 var(--etat-terracotta)" : "none" }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 px-5 py-4">
                {activeTab === "activite" && (
                  selSites.length === 0 ? (
                    <p className="text-[12.5px]" style={{ color: "var(--etat-stone-400)" }}>Aucun site recensé sur ce territoire.</p>
                  ) : (
                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-[.12em]" style={{ color: "rgba(11,26,42,.5)" }}>Débarquements documentés par site</p>
                      {selSites.map((site) => {
                        const count = selLandings.filter((item) => item.siteId === site.id).length;
                        const max = Math.max(1, ...selSites.map((s) => selLandings.filter((l) => l.siteId === s.id).length));
                        return (
                          <div key={site.id} className="mb-2.5 flex items-center gap-2.5">
                            <span className="w-[110px] shrink-0 truncate text-[12px]" style={{ color: "var(--etat-navy)" }}>{site.name}</span>
                            <span className="h-[10px] flex-1" style={{ background: "rgba(11,26,42,.08)" }}><span className="block h-full" style={{ width: `${(count / max) * 100}%`, background: "var(--etat-terracotta)" }} /></span>
                            <span className="w-6 shrink-0 text-right text-[12px]" style={{ fontFamily: "var(--etat-font-mono)" }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
                {activeTab === "capacites" && (
                  selInfra.length === 0 ? (
                    <p className="text-[12.5px]" style={{ color: "var(--etat-stone-400)" }}>Aucune infrastructure recensée.</p>
                  ) : selInfra.map((infra) => (
                    <div key={infra.id} className="mb-2.5 border p-3.5" style={{ borderColor: "rgba(11,26,42,.1)" }}>
                      <div className="flex items-baseline gap-2.5">
                        <span className="flex-1 text-[13.5px] font-medium capitalize">{infra.type.replaceAll("_", " ")}</span>
                        <span className="text-[11.5px] font-medium" style={{ color: infraStatusColor[infra.status] }}>{infraStatusLabel[infra.status]}</span>
                      </div>
                      <div className="relative my-2.5 h-1" style={{ background: "rgba(11,26,42,.1)" }}>
                        <span className="absolute inset-y-0 left-0" style={{ width: infra.status === "operationnelle" ? "100%" : infra.status === "fragile" ? "55%" : "15%", background: infraStatusColor[infra.status] }} />
                      </div>
                    </div>
                  ))
                )}
                {activeTab === "acteurs" && (
                  selActors.length === 0 ? (
                    <p className="text-[12.5px]" style={{ color: "var(--etat-stone-400)" }}>Aucun acteur rattaché à ce territoire.</p>
                  ) : Object.entries(selActorsByRole).map(([role, count]) => (
                    <div key={role} className="flex items-center gap-3 border-b py-2.5" style={{ borderColor: "rgba(11,26,42,.07)" }}>
                      <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full text-[12px]" style={{ background: "rgba(11,26,42,.06)", color: "rgba(11,26,42,.65)", fontFamily: "var(--etat-font-mono)" }}>{count}</span>
                      <span className="flex-1 text-[13px] font-medium capitalize">{role.replaceAll("_", " ")}</span>
                    </div>
                  ))
                )}
                {activeTab === "situations" && (
                  selSituations.length === 0 ? (
                    <p className="p-4 text-[12px] leading-[1.55]" style={{ background: "var(--etat-cream)", color: "rgba(11,26,42,.65)" }}>Aucune situation ouverte sur ce territoire.</p>
                  ) : selSituations.map((situation) => (
                    <button key={situation.id} onClick={() => setSituationDrawer(situation)} className="mb-3.5 block w-full border-l-[3px] py-0.5 pl-3.5 text-left" style={{ borderColor: glyphBorderColor[priorityToTag[situation.priority]] }}>
                      <p className="text-[13px] font-medium leading-[1.4]">{situation.title}</p>
                      <p className="mt-1.5 text-[11px]" style={{ color: glyphBorderColor[priorityToTag[situation.priority]] }}>{situation.priority}</p>
                    </button>
                  ))
                )}
                {activeTab === "programmes" && (
                  selProgrammes.length === 0 ? (
                    <p className="p-4 text-[12px] leading-[1.55]" style={{ background: "var(--etat-cream)", color: "rgba(11,26,42,.65)" }}>Aucun programme n’intervient sur ce territoire.</p>
                  ) : selProgrammes.map((programme) => {
                    const pct = programmeProgressPct(programme);
                    return (
                      <div key={programme.id} className="mb-2.5 border p-3.5" style={{ borderColor: "rgba(11,26,42,.1)" }}>
                        <div className="flex items-baseline gap-2.5">
                          <span className="flex-1 text-[13px] font-medium">{programme.title}</span>
                          <span style={{ fontFamily: "var(--etat-font-mono)", fontSize: 12 }}>{pct !== null ? `${pct}%` : "—"}</span>
                        </div>
                        <div className="relative my-2 h-1" style={{ background: "rgba(11,26,42,.1)" }}>
                          <span className="absolute inset-y-0 left-0" style={{ width: `${pct ?? 0}%`, background: "var(--etat-navy)" }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-auto border-t p-5" style={{ borderColor: "rgba(11,26,42,.09)", background: "var(--etat-cream)" }}>
                <button onClick={() => setTerritoryDossierOpen(true)} className="etat-btn etat-btn-primary w-full justify-center">Ouvrir le dossier territorial complet <ArrowRight size={15} /></button>
              </div>
            </>
          ) : (
            <p className="p-6 text-sm" style={{ color: "var(--etat-stone-600)" }}>Aucun territoire ne correspond à ce filtre.</p>
          )}
        </div>
      </div>

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
