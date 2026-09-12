"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Drawer } from "@/components/etat/Drawer";
import { DetailSurface } from "@/components/private/DetailSurface";
import { AtlasMap, type MapActivity } from "@/components/etat/AtlasMap";
import { KpiSparkline } from "@/components/etat/EtatDataVisualizations";
import {
  Mission,
  MissionForm,
  SituationDetail,
  TerritoryDetail,
  glyphBorderColor,
  infraStatusColor,
  infraStatusLabel,
  initiativeStatusLabel,
  priorityToTag,
  statusTagLabel
} from "@/components/etat/shared";
import { TrustGlyphLabel, trustGlyphFromLevel } from "@/components/etat/TrustGlyph";
import type { Initiative, ProductState, Situation, Territory } from "@/domain/types";
import type { VigilanceCase } from "@/domain/ministry/vigilance";
import {
  LANDING_TREND_SIMULATED_NOTICE,
  MARITIME_ZONE_LABEL,
  MARITIME_ZONE_ORDER,
  resolveMaritimeZone,
  territoryLandingTrend,
  type MaritimeZone
} from "@/domain/atlas-overview";
import { deriveDatasetReferenceAt } from "@/domain/signal-crossing";
import { programmeHealth, type ProgrammeHealthState } from "@/domain/programme-intelligence";
import { trustLabels } from "@/lib/status-tokens";

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

// siteDailyLandingCounts (LOT V3.28, "Atlas — bloc par bloc") — même
// principe que domain/atlas-overview.ts#territoryLandingTrend (agrégation
// directe de Landing par jour, jamais un jour vide interpolé), mais à la
// granularité du SITE plutôt que du territoire, pour la bande littorale
// qui affiche un site par colonne. Local à cette page plutôt qu'ajouté à
// atlas-overview.ts : c'est l'unique appelant de cette forme précise, et
// dupliquer 6 lignes reste plus lisible qu'un paramètre de granularité
// supplémentaire sur territoryLandingTrend pour un seul consommateur.
function siteDailyLandingCounts(state: ProductState, siteId: string, maxDays = 10): number[] {
  const byDay = new Map<string, number>();
  for (const landing of state.landings) {
    if (landing.siteId !== siteId) continue;
    const at = landing.weighedAt ?? landing.arrivedAt;
    if (!at) continue;
    const key = at.slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-maxDays).map(([, count]) => count);
}

// Correspondance état de santé programme → sévérité carte (LOT V3.28) —
// ProgrammeHealthState (domain/programme-intelligence.ts, réel) vers
// MapActivity (AtlasMap) : "aligné" est l'équivalent cartographique de
// "stable", "attention à prévoir" de "vigilance", "attention requise" de
// "critique". Jamais une nouvelle échelle de sévérité, seulement une
// réexpression de l'échelle déjà réelle sur le vocabulaire de la carte.
const healthToMapActivity: Record<ProgrammeHealthState, MapActivity> = { aligne: "stable", attention: "vigilance", critique: "critique" };

const COLD_CHAIN_INFRA_TYPES = new Set(["chambre_froide", "fabrique_glace"]);
const PERIOD_MS = 30 * 86_400_000;

// Descriptions génériques par rôle (LOT V3.28) — littéral de la maquette
// pour les rôles qui s'y prêtent ("Organisations enregistrées sur le
// site", "Groupements déclarés"...), complété pour les rôles réels du
// domaine qui n'apparaissent pas dans la fixture de la maquette. Décrit
// ce que le rôle REPRÉSENTE dans le modèle, jamais une donnée propre à
// un territoire précis — la même phrase s'applique honnêtement à tous.
const ROLE_DESCRIPTION: Partial<Record<string, string>> = {
  mareyeur: "Organisations enregistrées sur le site",
  transformateur: "Groupements déclarés",
  capitaine: "Rattachés à une organisation connue",
  gestionnaire_organisation: "Froid, pesée, regroupement",
  operateur: "Agents opérationnels du système",
  coordinateur: "Coordination territoriale",
  prestataire: "Prestataires de services rattachés",
  institution: "Institution rattachée au territoire",
  partenaire: "Partenaire actif sur le territoire",
  administrateur: "Administration du système"
};

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
  const [layerMode, setLayerMode] = useState<"situations" | "capacites" | "debarquements" | "programmes">("situations");
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
  // tendance", jamais une valeur fabriquée par site. Sparkline (LOT
  // V3.28) : série réelle par jour (siteDailyLandingCounts), plus la même
  // courbe illustrative recolorée pour les 54 sites — un site sans
  // aucun débarquement documenté affiche honnêtement une ligne plate à
  // zéro (data=[]), jamais la série illustrative de repli.
  const coastalStrip = state.sites.map((site) => {
    const territory = state.territories.find((item) => item.id === site.territoryId);
    const count = state.landings.filter((item) => item.siteId === site.id).length;
    return { site, territory, count, trend: siteDailyLandingCounts(state, site.id) };
  });

  // Horloge métier du jeu de données (même discipline que partout ailleurs
  // dans ce produit, mandat §3) — jamais Date.now() pour "sur la période".
  const referenceAtMs = (() => {
    const at = deriveDatasetReferenceAt(state);
    return at ? new Date(at).getTime() : Date.now();
  })();

  // --- Onglet "Activité" (LOT V3.28, "Atlas — bloc par bloc") ------------
  //
  // La maquette montre un histogramme hebdomadaire (S25...S36, 12
  // semaines) — ce Demo World ne couvre réellement que ~10 jours de
  // débarquements (vérifié par lecture directe, cf. commentaire de
  // domain/atlas-overview.ts sur la même limite) : un histogramme
  // hebdomadaire sur 12 semaines réelles serait presque entièrement vide.
  // territoryLandingTrend (déjà réel, déjà disclosé) agrège donc par JOUR
  // plutôt que par semaine — même esprit visuel (barres, dernière barre
  // mise en avant), donnée honnête plutôt qu'un calendrier fabriqué.
  const landingTrend = selectedTerritory ? territoryLandingTrend(state, selectedTerritory.id, 12) : [];
  const hasSimulatedLandingPoint = landingTrend.some((point) => point.simulated);
  const maxLandedKg = Math.max(1, ...landingTrend.map((point) => point.landedKg));

  const selLandingsPeriod = selLandings.filter((item) => {
    const at = item.weighedAt ?? item.arrivedAt;
    return at != null && referenceAtMs - new Date(at).getTime() <= PERIOD_MS;
  });
  const selCatchesPeriod = selLandingsPeriod.flatMap((item) => item.catches);
  // "Espèces distinctes débarquées sur la période" (LOT V3.28) — répond
  // directement à l'absence signalée de lecture "espèces" sur cet écran :
  // Species/CatchLine (domain/types.ts) sont des entités réelles du Core,
  // jamais exploitées jusqu'ici dans l'Atlas. Agrégation directe de
  // CatchLine.quantityKg par speciesId, jamais un tonnage fabriqué.
  const speciesTotals = new Map<string, number>();
  for (const catchLine of selCatchesPeriod) {
    speciesTotals.set(catchLine.speciesId, (speciesTotals.get(catchLine.speciesId) ?? 0) + catchLine.quantityKg);
  }
  const speciesBreakdown = [...speciesTotals.entries()]
    .map(([speciesId, kg]) => ({ species: state.species.find((item) => item.id === speciesId), kg }))
    .filter((row): row is { species: NonNullable<typeof row.species>; kg: number } => row.species != null)
    .sort((a, b) => b.kg - a.kg);
  const totalCatchKg = speciesBreakdown.reduce((sum, row) => sum + row.kg, 0);

  const selVesselIds = new Set(state.vessels.filter((vessel) => selSiteIds.has(vessel.homeSiteId)).map((vessel) => vessel.id));
  // "Retours de pirogue documentés sur la période" — FishingTrip.arrivedAt
  // réel (retour confirmé), jamais un décompte de sorties encore en mer.
  const selTripsReturnedPeriod = state.trips.filter((trip) => selVesselIds.has(trip.vesselId) && trip.arrivedAt != null && referenceAtMs - new Date(trip.arrivedAt).getTime() <= PERIOD_MS);
  const selSignalsPeriod = state.signals.filter((signal) => signal.territoryId === selectedTerritory?.id && referenceAtMs - new Date(signal.createdAt).getTime() <= PERIOD_MS);
  const selSignalsQualifiedPeriod = selSignalsPeriod.filter((signal) => signal.disposition !== "nouveau");

  // "Capacités froides OK" (bandeau du haut, littéral) — restreint aux 2
  // types réels d'infrastructure de la chaîne du froid (chambre_froide,
  // fabrique_glace) : les autres infrastructures réelles du territoire
  // (quai, marché, balance, transport, transformation) ne relèvent pas de
  // cette lecture, jamais mélangées dans le même ratio.
  const selColdChainInfra = selInfra.filter((item) => COLD_CHAIN_INFRA_TYPES.has(item.type));
  const selColdChainOK = selColdChainInfra.filter((item) => item.status === "operationnelle").length;
  const selColdChainFragile = selColdChainInfra.length - selColdChainOK;

  // --- Couches de la carte (4 réelles, LOT V3.28) ------------------------
  //
  // La maquette porte 4 puces ("Situations"/"Chaîne du froid"/
  // "Débarquements"/"Programmes"), jamais 2 ("Situations ouvertes"/
  // "Capacités fragiles") — chaque puce recolore la carte selon une
  // lecture réelle DIFFÉRENTE du territoire, jamais un simple sous-titre
  // de la même sévérité.
  const territoryLandingCounts = new Map(filteredTerritories.map((territory) => {
    const siteIds = new Set(state.sites.filter((site) => site.territoryId === territory.id).map((site) => site.id));
    return [territory.id, state.landings.filter((item) => siteIds.has(item.siteId)).length] as const;
  }));
  const landingCountValues = [...territoryLandingCounts.values()].sort((a, b) => a - b);
  const medianLandingCount = landingCountValues.length > 0 ? landingCountValues[Math.floor(landingCountValues.length / 2)] : 0;

  const territoryActivityForLayer = (territory: Territory, layer: "situations" | "capacites" | "debarquements" | "programmes"): MapActivity => {
    if (layer === "situations") return territory.activity;
    if (layer === "capacites") {
      const infra = state.infrastructures.filter((item) => item.territoryId === territory.id && COLD_CHAIN_INFRA_TYPES.has(item.type));
      if (infra.length === 0) return "stable";
      const fragileRatio = infra.filter((item) => item.status !== "operationnelle").length / infra.length;
      return fragileRatio >= 1 ? "critique" : fragileRatio > 0 ? "vigilance" : "stable";
    }
    if (layer === "debarquements") {
      const count = territoryLandingCounts.get(territory.id) ?? 0;
      // Aucun débarquement documenté sur la période = un vrai angle mort,
      // pas une lecture "stable" — jamais confondre absence de donnée et
      // absence de risque (doctrine du produit, réaffirmée ici).
      if (count === 0) return "critique";
      return count < medianLandingCount ? "vigilance" : "stable";
    }
    const programmes = state.initiatives.filter((item) => item.territoryIds.includes(territory.id));
    if (programmes.length === 0) return "stable";
    const worst = programmes.map((programme) => programmeHealth(state, programme).state).sort((a, b) => (a === "critique" ? -1 : b === "critique" ? 1 : a === "attention" ? -1 : b === "attention" ? 1 : 0))[0];
    return healthToMapActivity[worst];
  };

  const layeredTerritories = filteredTerritories.map((territory) => ({ ...territory, activity: territoryActivityForLayer(territory, layerMode) }));

  // h1 littéral de la maquette ("{N} sites de débarquement, un seul objet
  // vivant par territoire") — "sites de débarquement" correspond au
  // réel Site.type === "quai" (LOT V3.7, domain/data-sources.ts : "quai"
  // est déjà le type retenu pour les sites de débarquement/relais de
  // quai). "Un seul objet vivant par territoire" reste vrai de
  // l'implémentation (AtlasMap rend une forme distincte par territoire,
  // jamais plusieurs objets superposés) — affirmation structurelle, pas
  // un chiffre, jamais fabriquée.
  const landingSiteCount = state.sites.filter((site) => site.type === "quai").length;

  return (
    <div className="mb-rise pb-16">
      <div className="flex flex-col gap-4 px-4 pb-4 pt-7 sm:flex-row sm:items-end sm:justify-between sm:px-[30px]">
        <div className="min-w-0 flex-1">
          <p className="etat-eyebrow">Atlas territorial</p>
          <h1 className="mt-2.5 font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 32, lineHeight: 1.15, color: "var(--etat-navy)" }}>
            {landingSiteCount} site{landingSiteCount > 1 ? "s" : ""} de débarquement, un seul objet vivant par territoire
          </h1>
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
            {/* 4 couches littérales (LOT V3.28) — chacune recolore
                réellement la carte (territoryActivityForLayer ci-dessus),
                jamais un sous-titre de la même sévérité "Situations". */}
            {([
              { key: "situations", label: "Situations", dot: "#E05A3C" },
              { key: "capacites", label: "Chaîne du froid", dot: "#E0A455" },
              { key: "debarquements", label: "Débarquements", dot: "#7FB08A" },
              { key: "programmes", label: "Programmes", dot: "#9FB9CE" }
            ] as const).map((layer) => (
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
              territories={layeredTerritories}
              selectedId={selectedTerritory?.id}
              onSelect={(id) => setSelectedTerritoryId(id)}
              tooltipLines={(t) => {
                if (layerMode === "capacites") {
                  const fragile = state.infrastructures.filter((item) => item.territoryId === t.id && COLD_CHAIN_INFRA_TYPES.has(item.type) && item.status !== "operationnelle").length;
                  return [t.name, `${fragile} capacité(s) froide(s) fragile(s)`];
                }
                if (layerMode === "debarquements") {
                  const count = territoryLandingCounts.get(t.id) ?? 0;
                  return [t.name, `${count} débarquement(s) documenté(s)`];
                }
                if (layerMode === "programmes") {
                  const programmes = state.initiatives.filter((item) => item.territoryIds.includes(t.id));
                  return [t.name, `${programmes.length} programme(s)`];
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
              {coastalStrip.map(({ site, territory, count, trend }) => {
                const active = territory?.id === selectedTerritory?.id;
                return (
                  <button
                    key={site.id}
                    onClick={() => territory && setSelectedTerritoryId(territory.id)}
                    className="min-w-[64px] flex-1 border-t-2 px-1.5 pb-2 pt-2.5 text-left"
                    style={{ borderColor: active ? "#DE9C74" : "transparent", background: active ? "rgba(247,243,233,.06)" : "transparent" }}
                  >
                    <p className="truncate text-[10px]" style={{ color: active ? "#F7F3E9" : "rgba(247,243,233,.6)", fontWeight: active ? 600 : 400 }}>{site.name}</p>
                    <div className="mt-1.5 h-[22px]"><KpiSparkline color={active ? "#DE9C74" : "rgba(247,243,233,.4)"} data={trend} /></div>
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

              {/* Bandeau littéral de la maquette (LOT V3.28) — "Débarquements
                  30j / Acteurs actifs / Capacités froides OK / Situations
                  ouvertes", au lieu du bandeau reformulé ("Capacités
                  fragiles"/"Programmes") qui remplaçait à tort 2 de ces 4
                  lectures réelles. */}
              <div className="grid grid-cols-4 gap-px border-b" style={{ background: "rgba(11,26,42,.1)", borderColor: "rgba(11,26,42,.09)" }}>
                {[
                  { v: selLandingsPeriod.length, k: "Débarquements 30 j" },
                  { v: selActors.length, k: "Acteurs actifs" },
                  { v: selColdChainInfra.length > 0 ? `${selColdChainOK}/${selColdChainInfra.length}` : "—", k: "Capacités froides OK", sub: selColdChainFragile > 0 ? `${selColdChainFragile} fragile${selColdChainFragile > 1 ? "s" : ""}` : undefined },
                  { v: selSituations.length, k: "Situations ouvertes", sub: "suivies" }
                ].map((tile) => (
                  <div key={tile.k} className="bg-white px-3 py-[13px]">
                    <p style={{ fontFamily: "var(--etat-font-mono)", fontSize: 21, lineHeight: 1 }}>{tile.v}</p>
                    <p className="mt-[5px] text-[9.5px] uppercase leading-[1.3] tracking-[.08em]" style={{ color: "rgba(11,26,42,.5)" }}>{tile.k}</p>
                    {"sub" in tile && tile.sub && <p className="mt-0.5 text-[9.5px]" style={{ color: "rgba(11,26,42,.4)" }}>{tile.sub}</p>}
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
                  <div className="space-y-5">
                    {/* Débarquements documentés — histogramme réel par jour
                        (territoryLandingTrend, domain/atlas-overview.ts),
                        jamais une agrégation "par site" qui masquait la
                        tendance temporelle réclamée. Dernier point mis en
                        avant, comme dans la maquette. */}
                    <div>
                      <div className="mb-2 flex items-baseline justify-between gap-2">
                        <p className="text-[10px] uppercase tracking-[.12em]" style={{ color: "rgba(11,26,42,.5)" }}>Débarquements documentés</p>
                        {landingTrend.length > 0 && <p className="text-[11px]" style={{ color: "rgba(11,26,42,.5)" }}>{landingTrend[landingTrend.length - 1].label} · {landingTrend[landingTrend.length - 1].landedKg} kg</p>}
                      </div>
                      {landingTrend.length === 0 ? (
                        <p className="text-[12.5px]" style={{ color: "var(--etat-stone-400)" }}>Aucun débarquement documenté sur ce territoire pour le moment.</p>
                      ) : (
                        <div className="flex h-[90px] items-end gap-1">
                          {landingTrend.map((point, index) => (
                            <div key={point.date} className="flex h-full flex-1 flex-col justify-end">
                              <div className="w-full" style={{ height: `${Math.max(4, (point.landedKg / maxLandedKg) * 100)}%`, background: index === landingTrend.length - 1 ? "var(--etat-terracotta)" : "rgba(11,26,42,.18)" }} />
                              <p className="mt-1 truncate text-center text-[9px]" style={{ color: "rgba(11,26,42,.45)" }}>{point.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {hasSimulatedLandingPoint && <p className="mt-2 text-[10.5px] leading-[1.5]" style={{ color: "rgba(11,26,42,.45)" }}>{LANDING_TREND_SIMULATED_NOTICE}</p>}
                    </div>

                    {/* 4 tuiles réelles (LOT V3.28) — "espèces distinctes"
                        remplace la lecture "relais de quai mandaté" de la
                        maquette : aucun champ du domaine ne distingue un
                        relais "mandaté" d'un autre (vérifié, cf.
                        domain/data-sources.ts) — jamais un compteur
                        systématiquement à zéro faute de champ, une lecture
                        réellement disponible à la place (et qui répond
                        directement au manque signalé : les espèces). */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { v: selTripsReturnedPeriod.length, k: "Retours de pirogue documentés sur la période" },
                        { v: selSignalsPeriod.length, k: "Signaux reçus sur la période" },
                        { v: selSignalsQualifiedPeriod.length, k: "Signaux qualifiés sur la période" },
                        { v: speciesBreakdown.length, k: "Espèces distinctes débarquées sur la période" }
                      ].map((tile) => (
                        <div key={tile.k} className="border p-3" style={{ borderColor: "rgba(11,26,42,.1)" }}>
                          <p style={{ fontFamily: "var(--etat-font-mono)", fontSize: 20, lineHeight: 1 }}>{tile.v}</p>
                          <p className="mt-1.5 text-[10.5px] leading-[1.35]" style={{ color: "rgba(11,26,42,.55)" }}>{tile.k}</p>
                        </div>
                      ))}
                    </div>

                    {/* "Répartition par espèce" (LOT V3.28) — répond
                        directement au manque signalé : Species/CatchLine
                        sont des entités réelles du Core (domain/types.ts),
                        jamais exploitées jusqu'ici dans l'Atlas. */}
                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-[.12em]" style={{ color: "rgba(11,26,42,.5)" }}>Répartition par espèce{selCatchesPeriod.length > 0 ? ` · ${totalCatchKg.toLocaleString("fr-FR")} kg` : ""}</p>
                      {speciesBreakdown.length === 0 ? (
                        <p className="text-[12.5px]" style={{ color: "var(--etat-stone-400)" }}>Aucune capture documentée sur la période pour ce territoire.</p>
                      ) : speciesBreakdown.slice(0, 6).map(({ species, kg }) => (
                        <div key={species.id} className="mb-2.5 flex items-center gap-2.5">
                          <span className="w-[120px] shrink-0 truncate text-[12px]" style={{ color: "var(--etat-navy)" }}>{species.name}</span>
                          <span className="h-[10px] flex-1" style={{ background: "rgba(11,26,42,.08)" }}><span className="block h-full" style={{ width: `${(kg / totalCatchKg) * 100}%`, background: "var(--etat-terracotta)" }} /></span>
                          <span className="w-16 shrink-0 text-right text-[12px]" style={{ fontFamily: "var(--etat-font-mono)" }}>{kg.toLocaleString("fr-FR")} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "capacites" && (
                  selInfra.length === 0 ? (
                    <p className="text-[12.5px]" style={{ color: "var(--etat-stone-400)" }}>Aucune infrastructure recensée.</p>
                  ) : (
                    <div>
                      {selInfra.map((infra) => (
                        <div key={infra.id} className="mb-2.5 border p-3.5" style={{ borderColor: "rgba(11,26,42,.1)" }}>
                          <div className="flex items-baseline gap-2.5">
                            <span className="flex-1 text-[13.5px] font-medium capitalize">{infra.type.replaceAll("_", " ")}</span>
                            <span className="text-[11.5px] font-medium" style={{ color: infraStatusColor[infra.status] }}>{infraStatusLabel[infra.status]}</span>
                          </div>
                          <div className="relative my-2.5 h-1" style={{ background: "rgba(11,26,42,.1)" }}>
                            <span className="absolute inset-y-0 left-0" style={{ width: infra.status === "operationnelle" ? "100%" : infra.status === "fragile" ? "55%" : "15%", background: infraStatusColor[infra.status] }} />
                          </div>
                          {/* Provenance réelle (LOT V3.28) — Infrastructure.trust
                              + updatedAt, jamais un texte narratif inventé. */}
                          <p className="text-[11px]" style={{ color: "rgba(11,26,42,.5)" }}>{trustLabels[infra.trust]} · {new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(infra.updatedAt))}</p>
                        </div>
                      ))}
                      <p className="mt-3 border-t pt-3 text-[11px] leading-[1.55]" style={{ borderColor: "rgba(11,26,42,.1)", color: "rgba(11,26,42,.55)" }}>Une capacité déclarée fragile n’est pas une capacité hors service. Mbàmbulaan conserve la distinction : la fragilité est déclarée par le gestionnaire, l’indisponibilité est confirmée au quai.</p>
                    </div>
                  )
                )}
                {activeTab === "acteurs" && (
                  selActors.length === 0 ? (
                    <p className="text-[12.5px]" style={{ color: "var(--etat-stone-400)" }}>Aucun acteur rattaché à ce territoire.</p>
                  ) : Object.entries(selActorsByRole).map(([role, count]) => (
                    <div key={role} className="flex items-center gap-3 border-b py-2.5" style={{ borderColor: "rgba(11,26,42,.07)" }}>
                      <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full text-[12px]" style={{ background: "rgba(11,26,42,.06)", color: "rgba(11,26,42,.65)", fontFamily: "var(--etat-font-mono)" }}>{count}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium capitalize">{role.replaceAll("_", " ")}</p>
                        {ROLE_DESCRIPTION[role] && <p className="truncate text-[11px]" style={{ color: "rgba(11,26,42,.5)" }}>{ROLE_DESCRIPTION[role]}</p>}
                      </div>
                    </div>
                  ))
                )}
                {activeTab === "situations" && (
                  selSituations.length === 0 ? (
                    <p className="p-4 text-[12px] leading-[1.55]" style={{ background: "var(--etat-cream)", color: "rgba(11,26,42,.65)" }}>Aucune situation ouverte sur ce territoire.</p>
                  ) : selSituations.map((situation) => {
                    const firstHistoryAt = situation.history[0]?.at;
                    const ageDays = firstHistoryAt != null ? Math.max(0, Math.floor((referenceAtMs - new Date(firstHistoryAt).getTime()) / 86_400_000)) : null;
                    return (
                      <button key={situation.id} onClick={() => setSituationDrawer(situation)} className="mb-3.5 block w-full border-l-[3px] py-0.5 pl-3.5 text-left" style={{ borderColor: glyphBorderColor[priorityToTag[situation.priority]] }}>
                        <p className="text-[13px] font-medium leading-[1.4]">{situation.title}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <TrustGlyphLabel level={trustGlyphFromLevel(situation.trust)} className="text-[11px] text-[rgba(11,26,42,.55)]" />
                          <span className="text-[11px]" style={{ color: "rgba(11,26,42,.4)" }}>· {ageDays === null ? "ancienneté inconnue" : ageDays <= 0 ? "aujourd’hui" : `il y a ${ageDays} j`}</span>
                        </div>
                      </button>
                    );
                  })
                )}
                {activeTab === "programmes" && (
                  selProgrammes.length === 0 ? (
                    <p className="p-4 text-[12px] leading-[1.55]" style={{ background: "var(--etat-cream)", color: "rgba(11,26,42,.65)" }}>Aucun programme n’intervient sur ce territoire.</p>
                  ) : selProgrammes.map((programme) => {
                    const pct = programmeProgressPct(programme);
                    const owner = state.actors.find((item) => item.id === programme.ownerId);
                    return (
                      <div key={programme.id} className="mb-2.5 border p-3.5" style={{ borderColor: "rgba(11,26,42,.1)" }}>
                        <div className="flex items-baseline gap-2.5">
                          <span className="flex-1 text-[13px] font-medium">{programme.title}</span>
                          <span style={{ fontFamily: "var(--etat-font-mono)", fontSize: 12 }}>{pct !== null ? `${pct}%` : "—"}</span>
                        </div>
                        <div className="relative my-2 h-1" style={{ background: "rgba(11,26,42,.1)" }}>
                          <span className="absolute inset-y-0 left-0" style={{ width: `${pct ?? 0}%`, background: "var(--etat-navy)" }} />
                        </div>
                        <p className="text-[11px]" style={{ color: "rgba(11,26,42,.5)" }}>{initiativeStatusLabel[programme.status]}{owner ? ` · ${owner.name}` : ""}</p>
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
