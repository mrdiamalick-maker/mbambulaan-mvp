"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Boxes,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Factory,
  Fish,
  Gauge,
  Layers3,
  Leaf,
  MapPin,
  Radio,
  Route,
  Scale,
  Search,
  ShipWheel,
  Sparkles,
  Store,
  UsersRound
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TrustBadge } from "@/components/shared/StatusBadges";
import { Button } from "@/components/ui/button";
import type { ProductState, SituationStatus, TrustLevel } from "@/domain/types";
import { buildTerritoryIntelligence, currentTerritoryView, hasSufficientKnowledge } from "@/domain/territory-intelligence";
import { TerritoryDossierSections } from "@/components/territories/TerritoryDossierSections";

// Lot 5 (mandat "Atlas & Territoire") §21 — la lens "Situation" devient
// "Aujourd'hui" : elle continue de lire les Situations mais intègre
// désormais Besoins collectifs, Connaissances manquantes, Missions
// terrain et Opportunités de programme dans la même lecture ("ce qui
// compte maintenant"), plutôt qu'une lens supplémentaire par type d'objet
// (mandat explicite : "ne pas ajouter 8 lenses"). Les 4 autres lenses
// restent inchangées.
type Lens = "aujourdhui" | "operations" | "capacites" | "marches" | "durabilite";

const lenses: Array<{ id: Lens; label: string; icon: typeof Activity }> = [
  { id: "aujourdhui", label: "Aujourd’hui", icon: Activity },
  { id: "operations", label: "Opérations", icon: ShipWheel },
  { id: "capacites", label: "Capacités", icon: Factory },
  { id: "marches", label: "Marchés", icon: Store },
  { id: "durabilite", label: "Durabilité", icon: Leaf }
];

// Positions littorales — corrigées (post-Lot 4, resserrage visuel) :
// cet objet ne définissait que 6 des 18 territoires réels
// (demo-state.ts, territoryRows). Les 12 manquants retombaient tous
// sur le même repli [50, 50] et s'empilaient au même point, un bug
// plus sérieux qu'une simple imprécision de calibrage. Reprend les 18
// positions déjà vérifiées de TerritoryMap.tsx (src/components/
// territories/TerritoryMap.tsx) — pourcentages gauche/haut, ordre
// nord-sud cohérent avec les latitudes réelles (territoryRows),
// dégagement large et vérifié par rapport au tracé côtier
// (.ops-landmass, clip-path) de cette vue : aucune position ne
// s'approche de la terre. Choisi plutôt qu'un recalibrage indépendant
// pour garder les deux cartes illustratives du produit cohérentes
// entre elles.
const positions: Record<string, [number, number]> = {
  "saint-louis": [43, 9],
  lompoul: [34, 15],
  "fass-boye": [49, 21],
  kayar: [36, 27],
  yoff: [47, 33],
  ouakam: [34, 38],
  soumbedioune: [48, 41],
  hann: [59, 43],
  rufisque: [49, 48],
  popenguine: [35, 52],
  mbour: [49, 57],
  joal: [37, 63],
  foundiougne: [51, 68],
  djiffer: [37, 73],
  missirah: [50, 78],
  kafountine: [34, 84],
  elinkine: [48, 89],
  "cap-skirring": [36, 95]
};

// Le dossier territorial reste sur son traitement actuel jusqu'au Livrable 2.
const activityStyle = {
  critique: { dot: "bg-[#ff755e]", ring: "ring-[#ff755e]/30", label: "Action requise" },
  vigilance: { dot: "bg-[#f3b84f]", ring: "ring-[#f3b84f]/30", label: "Sous vigilance" },
  stable: { dot: "bg-[#57dbc8]", ring: "ring-[#57dbc8]/30", label: "Stable" }
} as const;

// Palette D9 dédiée à la carte : aucune incidence sur le moteur spatial.
const mapActivityStyle = {
  critique: { dot: "bg-[#b6522f]", ring: "ring-[#b6522f]/28" },
  vigilance: { dot: "bg-[#c68a2c]", ring: "ring-[#c68a2c]/26" },
  stable: { dot: "bg-[#1d4468]", ring: "ring-[#1d4468]/24" }
} as const;

type WorkbenchItem = {
  id: string;
  category: string;
  title: string;
  metric: string;
  detail: string;
  source: string;
  trust: TrustLevel;
  href?: string;
  urgency?: "normal" | "attention" | "critique";
};

function formatDate(value?: string) {
  if (!value) return "Non horodaté";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function buildWorkbench(state: ProductState, territoryId: string, lens: Lens, speciesId: string): WorkbenchItem[] {
  const quayId = `quai-${territoryId}`;
  if (lens === "aujourdhui") {
    const intelligence = buildTerritoryIntelligence(state, territoryId);
    if (!intelligence) return [];
    // Micro-correctif final LOT 5 — "Aujourd'hui" est une surface CURRENT :
    // elle ne doit jamais présenter comme actif un objet réglé, réalisé,
    // rejeté/remplacé ou converti. currentTerritoryView() ne retire rien
    // du dossier complet (intelligence elle-même), elle en dérive
    // seulement une lecture "maintenant" pour cette lens.
    const current = currentTerritoryView(intelligence);
    const situationItems: WorkbenchItem[] = current.situations.map((item) => ({
      id: item.id,
      category: item.status.replaceAll("_", " "),
      title: item.title,
      metric: item.priority === "critique" ? "Aujourd’hui" : item.priority === "haute" ? "À coordonner" : "Suivi",
      detail: item.nextStep,
      source: state.signals.find((signal) => item.signalIds.includes(signal.id))?.source ?? "Signal territorial",
      trust: item.trust,
      href: `/app/situations/${item.id}`,
      urgency: item.priority === "critique" ? "critique" : item.priority === "haute" ? "attention" : "normal"
    }));
    // Mandat §21 — la lens intègre désormais ce qui émerge, ce qui manque
    // et ce qui est en cours, pas seulement les Situations qualifiées.
    const needItems: WorkbenchItem[] = current.collectiveNeeds.map((need) => ({
      id: need.id,
      category: "Besoin collectif",
      title: need.title,
      metric: "Ce qui émerge",
      detail: need.affectedPopulation,
      source: "Besoins rapprochés",
      trust: "declaree",
      href: `/app/initiatives?need=${need.id}`,
      urgency: "normal"
    }));
    const gapItems: WorkbenchItem[] = current.knowledgeGaps.map((gap) => ({
      id: gap.id,
      category: "Connaissance manquante",
      title: gap.title,
      metric: "Ce que nous ne savons pas",
      detail: gap.explanation,
      source: "Finding",
      trust: gap.trust,
      urgency: "attention"
    }));
    const missionItems: WorkbenchItem[] = current.fieldMissions.map((mission) => ({
      id: mission.id,
      category: "Mission terrain",
      title: mission.title,
      metric: "Ce que le terrain vérifie",
      detail: mission.objective,
      source: "Terrain",
      trust: "declaree",
      href: "/app/terrain",
      urgency: mission.status === "en_cours" ? "attention" : "normal"
    }));
    const opportunityItems: WorkbenchItem[] = current.programOpportunities.map((opportunity) => ({
      id: opportunity.id,
      category: "Opportunité de programme",
      title: opportunity.problem,
      metric: "Ce qui est en cours",
      detail: opportunity.justification,
      source: "Développement",
      trust: "declaree",
      href: `/app/initiatives?opportunity=${opportunity.id}`,
      urgency: "normal"
    }));
    return [...situationItems, ...needItems, ...gapItems, ...missionItems, ...opportunityItems];
  }

  if (lens === "operations") {
    return state.vessels.filter((vessel) => vessel.homeSiteId === quayId).map((vessel) => {
      const trip = state.trips.find((candidate) => candidate.vesselId === vessel.id);
      const landing = trip ? state.landings.find((candidate) => candidate.tripId === trip.id) : undefined;
      return {
        id: vessel.id,
        category: "Pirogue artisanale",
        title: `${vessel.name} · ${vessel.registration}`,
        metric: trip?.status.replaceAll("_", " ") ?? "À quai",
        detail: landing ? `${(landing.totalWeightKg / 1000).toFixed(2)} t · ${landing.status.replaceAll("_", " ")}` : `${trip?.crewCount ?? 0} membres d’équipage · ${trip?.zone ?? "zone non renseignée"}`,
        source: trip?.source ?? "Référentiel des actifs",
        trust: vessel.trust,
        href: "/app/operations",
        urgency: trip?.status === "en_mer" ? "attention" : "normal"
      };
    });
  }

  if (lens === "capacites") {
    return state.infrastructures.filter((item) => item.territoryId === territoryId).map((item) => ({
      id: item.id,
      category: item.type.replaceAll("_", " "),
      title: item.name,
      metric: `${item.availableCapacity}/${item.theoreticalCapacity} ${item.unit}`,
      detail: item.status === "operationnelle" ? "Capacité mobilisable sur le périmètre" : item.status === "fragile" ? "Continuité à sécuriser" : "Alternative requise",
      source: `Dernière déclaration · ${formatDate(item.updatedAt)}`,
      trust: item.trust,
      href: "/app/coordination",
      urgency: item.status === "indisponible" ? "critique" : item.status === "fragile" ? "attention" : "normal"
    }));
  }

  if (lens === "marches") {
    return state.priceObservations
      .filter((item) => item.territoryId === territoryId && (speciesId === "all" || item.speciesId === speciesId))
      .map((item) => ({
        id: item.id,
        category: item.marketName,
        title: state.species.find((species) => species.id === item.speciesId)?.name ?? item.speciesId,
        metric: `${item.priceFcfaKg.toLocaleString("fr-FR")} FCFA/kg`,
        detail: `Tendance ${item.trend}${item.flagged ? " · observation à vérifier" : " · aucune anomalie déclarée"}`,
        source: item.source,
        trust: item.trust,
        href: "/app/marches",
        urgency: item.flagged ? "attention" : "normal"
      }));
  }

  return state.sustainability
    .filter((assessment) => {
      const lot = state.lots.find((candidate) => candidate.id === assessment.lotId);
      return lot?.siteId === quayId && (speciesId === "all" || lot.speciesId === speciesId);
    })
    .map((assessment) => {
      const lot = state.lots.find((candidate) => candidate.id === assessment.lotId);
      const species = state.species.find((candidate) => candidate.id === lot?.speciesId);
      return {
        id: assessment.id,
        category: `Lot ${assessment.lotId}`,
        title: species?.name ?? "Lot suivi",
        metric: assessment.status,
        detail: assessment.recommendation,
        source: `${assessment.practice} · ${assessment.zone}`,
        trust: assessment.trust,
        href: "/app/durabilite",
        urgency: assessment.status === "incomplet" ? "critique" : assessment.status === "vigilance" ? "attention" : "normal"
      };
    });
}

export function ProfessionalAtlasWorkspace() {
  const { state } = useProduct();
  const [selectedId, setSelectedId] = useState("joal");
  const [lens, setLens] = useState<Lens>("aujourdhui");
  const [period, setPeriod] = useState("today");
  const [speciesId, setSpeciesId] = useState("all");
  const [search, setSearch] = useState("");
  const [assistantEnabled, setAssistantEnabled] = useState(false);
  if (!state) return null;

  const territory = state.territories.find((item) => item.id === selectedId) ?? state.territories[0];
  const quayId = `quai-${territory.id}`;
  const site = state.sites.find((item) => item.id === quayId);
  const situations = state.situations.filter((item) => item.territoryId === territory.id && item.status !== "reglee");
  const primarySituation = [...situations].sort((a, b) => (a.priority === "critique" ? -1 : b.priority === "critique" ? 1 : 0))[0];
  const vessels = state.vessels.filter((item) => item.homeSiteId === quayId);

  // Lot Atlas-B (propagation DA v2, mandat CEO 2026-08-20) : filtre
  // Période réellement fonctionnel. Ancré sur la donnée réelle la plus
  // récente du jeu de démonstration (dernier landing/départ), pas sur
  // l'horloge murale — vérifié par script sur createDemoState() : les
  // dates réelles s'arrêtent au 8 août 2026, "aujourd'hui"/"7 jours"
  // calculés sur la date système seraient systématiquement vides pour
  // les 18 territoires. Même principe que les filtres Période déjà posés
  // sur /app/etat et /app/etat/rapport : ancré sur la donnée réelle
  // disponible. Si aucune date réelle n'existe du tout, le filtre se
  // désactive honnêtement (withinPeriod retombe à true) plutôt que de
  // masquer des objets sans repère temporel fiable.
  const allActivityDates = [
    ...state.landings.map((item) => item.weighedAt ?? item.arrivedAt),
    ...state.trips.map((item) => item.departureAt)
  ].filter((value): value is string => Boolean(value)).sort();
  const latestActivityAt = allActivityDates[allActivityDates.length - 1];
  const periodWindowDays: Record<string, number> = { today: 0, "7d": 6, "30d": 29 };
  const windowStartAt = latestActivityAt ? new Date(new Date(latestActivityAt).getTime() - periodWindowDays[period] * 86400000) : undefined;
  const withinPeriod = (iso?: string) => {
    if (!iso || !latestActivityAt || !windowStartAt) return true;
    const at = new Date(iso).getTime();
    return at >= windowStartAt.getTime() && at <= new Date(latestActivityAt).getTime();
  };

  const trips = state.trips.filter((item) => vessels.some((vessel) => vessel.id === item.vesselId) && withinPeriod(item.departureAt));
  const landings = state.landings.filter((item) => item.siteId === quayId && withinPeriod(item.weighedAt ?? item.arrivedAt));
  const landedKg = landings.reduce((sum, item) => sum + item.totalWeightKg, 0);
  const infrastructures = state.infrastructures.filter((item) => item.territoryId === territory.id);
  const availableCapacity = infrastructures.reduce((sum, item) => sum + item.availableCapacity, 0);
  const totalCapacity = infrastructures.reduce((sum, item) => sum + item.theoreticalCapacity, 0);
  const capacityRate = totalCapacity ? Math.round((availableCapacity / totalCapacity) * 100) : 0;
  const catchLines = landings.flatMap((item) => item.catches).filter((item) => speciesId === "all" || item.speciesId === speciesId);
  const speciesCount = new Set(catchLines.map((item) => item.speciesId)).size;
  const activeActors = state.actors.filter((actor) => actor.territoryIds.includes(territory.id) && actor.verified).length;
  // A14 — seul accent fort du dossier : terracotta si la situation
  // prioritaire est critique, ambre sinon (vigilance ou aucune urgence).
  const actionRequired = primarySituation?.priority === "critique";
  // A15 — étape active dérivée du statut déjà porté par la situation
  // prioritaire (aucune nouvelle logique métier) : recue → Signal,
  // qualification → Qualification, les 4 statuts d'instruction →
  // Décision, resultat/reglee → Résultat. Sans situation prioritaire,
  // aucune étape n'est mise en avant artificiellement.
  const stageForStatus: Record<SituationStatus, number> = {
    recue: 0,
    qualification: 1,
    priorisee: 2,
    coordination: 2,
    intervention: 2,
    attente: 2,
    resultat: 3,
    reglee: 3
  };
  const activeStage = primarySituation ? stageForStatus[primarySituation.status] : undefined;

  const workbench = buildWorkbench(state, territory.id, lens, speciesId)
    .filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(search.toLowerCase()));
  const selectedLens = lenses.find((item) => item.id === lens) ?? lenses[0];
  const LensIcon = selectedLens.icon;

  // Lot 5 (mandat "Atlas & Territoire") §5/§6 — le dossier territorial
  // complet, calculé à la demande à partir du Core (aucune donnée
  // stockée séparément) et réutilisé tel quel par le résumé "Aujourd'hui"
  // ci-dessous, la bulle de survol de la carte (§20) et le dossier
  // narratif (TerritoryDossierSections, §5/§10-§14). territory venant
  // toujours de state.territories, buildTerritoryIntelligence ne peut
  // pas renvoyer undefined ici.
  const intelligence = buildTerritoryIntelligence(state, territory.id)!;
  const territoryKnowledgeSufficient = hasSufficientKnowledge(intelligence);

  // Résumé dérivé par territoire pour la carte (mandat §20 : "jamais un
  // texte figé" — recalculé à partir des mêmes objets que le dossier,
  // affiché seulement au survol/sélection, pas une 12e étiquette
  // permanente par marqueur). Micro-correctif final LOT 5 : ce résumé
  // consomme la lecture "current" — une Mission réalisée ou une Situation
  // réglée ne doit jamais grossir "action(s) en cours".
  function mapSummary(territoryId: string): string {
    const local = buildTerritoryIntelligence(state as ProductState, territoryId);
    if (!local) return "";
    const current = currentTerritoryView(local);
    const criticalCount = current.situations.filter((item) => item.priority === "critique").length;
    const inProgress = local.coordinations.length + current.programOpportunities.length + current.fieldMissions.filter((item) => item.status === "en_cours").length;
    const fragileCapacity = local.identity.infrastructures.find((item) => item.status !== "operationnelle");
    const parts: string[] = [];
    if (criticalCount > 0) parts.push(`${criticalCount} situation(s) prioritaire(s)`);
    if (inProgress > 0) parts.push(`${inProgress} action(s) en cours`);
    if (fragileCapacity) parts.push(`${fragileCapacity.name.toLowerCase()} sous tension`);
    if (parts.length === 0) return hasSufficientKnowledge(local) ? "Aucun enjeu prioritaire" : "Peu de connaissance disponible";
    return parts.join(" · ");
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-[#0b1a2a] text-white">
        <div className="border-b border-white/10 px-4 py-4 lg:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/58">Atlas professionnel</p>
              <p className="mt-1 truncate text-sm font-semibold text-white/84">Lecture opérationnelle du littoral sénégalais</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/58">
                <span className="size-1.5 rounded-full bg-white/45" /> Mode démonstration
              </span>
              <button
                onClick={() => setAssistantEnabled((value) => !value)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition ${assistantEnabled ? "border-[#b6522f]/50 bg-[#b6522f]/14 text-white" : "border-white/10 bg-white/[0.04] text-white/58 hover:text-white"}`}
                aria-pressed={assistantEnabled}
              >
                <Sparkles size={13} /> Assistance {assistantEnabled ? "activée" : "désactivée"}
              </button>
            </div>
          </div>
        </div>

        {/* Lot 5 (mandat §28, "la carte peut être secondaire sur mobile") —
            le dossier (aside) passe avant la carte sur mobile via order,
            la carte reprend sa place à gauche à partir de xl ; sa hauteur
            se réduit aussi en dessous de xl pour ne jamais imposer une
            grande carte peu utilisable sur téléphone. */}
        <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,1fr)_minmax(330px,.36fr)]">
          <div className="relative order-2 min-h-[320px] overflow-hidden bg-[#0b1a2a] xl:order-1 xl:min-h-[650px]">
            <div className="absolute inset-x-0 top-0 z-30 border-b border-white/10 bg-[#0b1a2a]/90 p-3 backdrop-blur-xl">
              <div className="grid gap-2 md:grid-cols-[minmax(210px,1.25fr)_minmax(150px,.7fr)_minmax(180px,.8fr)]">
                <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-white/58">
                  <MapPin size={15} /><span className="sr-only">Territoire</span>
                  <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} aria-label="Sélectionner un quai" className="h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none">
                    {state.territories.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.region}</option>)}
                  </select><ChevronDown size={14} />
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-white/58">
                  <CalendarDays size={15} /><span className="sr-only">Période</span>
                  <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Sélectionner une période" className="h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none">
                    <option value="today">Aujourd’hui</option><option value="7d">7 jours</option><option value="30d">30 jours</option>
                  </select><ChevronDown size={14} />
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-white/58">
                  <Fish size={15} /><span className="sr-only">Espèce</span>
                  <select value={speciesId} onChange={(event) => setSpeciesId(event.target.value)} aria-label="Filtrer par espèce" className="h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none">
                    <option value="all">Toutes les espèces</option>{state.species.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select><ChevronDown size={14} />
                </label>
              </div>
            </div>

            <div className="ops-map-canvas absolute inset-0 pt-20">
              <div className="ops-landmass" />
              <div className="absolute bottom-5 left-5 z-20 text-[10px] font-bold uppercase tracking-[.2em] text-white/22">Océan Atlantique</div>
              <div className="absolute left-5 top-24 z-20 rounded-lg border border-white/10 bg-[#0b1a2a]/78 px-3 py-2 text-[10px] font-semibold text-white/46 backdrop-blur">Quais uniquement · les objets métier s’ouvrent dans le poste de travail</div>
              {state.territories.map((item) => {
                const [left, top] = positions[item.id] ?? [50, 50];
                const active = item.id === territory.id;
                const openCount = state.situations.filter((candidate) => candidate.territoryId === item.id && candidate.status !== "reglee").length;
                const tone = mapActivityStyle[item.activity];
                return (
                  <button key={item.id} onClick={() => setSelectedId(item.id)} style={{ left: `${left}%`, top: `${top}%` }} className={`group absolute z-20 -translate-x-1/2 -translate-y-1/2 text-left ${active ? "scale-110" : "hover:scale-105"}`} aria-label={`Ouvrir le quai de ${item.name}`}>
                    <span className={`absolute left-1/2 top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full ${active ? `ring-4 ${tone.ring}` : openCount > 0 ? `ring-2 ${tone.ring}` : ""}`} />
                    <span className={`relative block size-3.5 rounded-full border-2 border-white ${tone.dot} shadow-[0_0_0_2px_rgba(255,255,255,.08)]`} />
                    <span className={`absolute left-5 top-1/2 w-max max-w-[220px] -translate-y-1/2 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold backdrop-blur ${active ? "border-white/20 bg-[#17283a] text-white shadow-sm" : "border-white/10 bg-[#0b1a2a]/82 text-white/68"}`}>
                      <span className="flex items-center gap-2">{item.name}{openCount > 0 && <span className="text-[#c68a2c]">{openCount}</span>}</span>
                      {/* Mandat §20 — résumé dérivé, jamais figé, visible
                          au survol ou pour le territoire sélectionné :
                          pas une 12e étiquette permanente par marqueur. */}
                      <span className={`mt-1 block text-[10px] font-normal normal-case text-white/55 ${active ? "block" : "hidden group-hover:block"}`}>{mapSummary(item.id)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="order-1 bg-[#0b1a2a] p-5 text-white xl:order-2 lg:p-6">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/45">Dossier territorial</p><h2 className="mt-2 text-2xl font-black tracking-[-.035em]">Quai de {territory.name}</h2><p className="mt-1 text-xs text-white/45">{site?.source ?? "Référentiel territorial"} · {territory.region}</p></div>
              <span className={`mt-1 size-2.5 rounded-full ${activityStyle[territory.activity].dot}`} />
            </div>

            {/* Mandat §30 — l'absence de signal ne doit jamais se lire
                comme une stabilité : le dit explicitement plutôt que de
                laisser le point d'activité seul porter cette lecture. */}
            {!territoryKnowledgeSufficient && (
              <p className="mt-3 text-xs text-white/45">Connaissance insuffisante sur ce territoire — peu d’éléments récents disponibles.</p>
            )}

            {/* A12 — grille typographique (valeur, label, séparateurs
                fins) : plus de mini-widgets à fond plein. */}
            <div className="mt-6 grid grid-cols-2 divide-x divide-y divide-white/10 border-y border-white/10">
              {[
                ["Volume", `${(landedKg / 1000).toFixed(2)} t`],
                ["Pirogues", String(vessels.length)],
                ["Espèces", String(speciesCount)],
                ["Capacité", `${capacityRate}%`]
              ].map(([label, value]) => <div key={label} className="p-4"><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-white/40">{label}</p><p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p></div>)}
            </div>

            {/* A13 — dé-cardifiée : icône → métrique → détail, aucune
                surface interne forte. */}
            <div className="mt-6">
              <div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-white/38">Activité opérationnelle</p><span className="text-[10px] font-semibold text-white/45">{period === "today" ? "Aujourd’hui" : period === "7d" ? "7 jours" : "30 jours"}</span></div>
              <div className="mt-3 space-y-3.5">
                <div className="flex items-start gap-3"><Route size={16} className="mt-0.5 shrink-0 text-white/40" /><div><p className="text-sm font-semibold">{trips.filter((item) => item.status !== "debarquee").length} sortie(s) active(s)</p><p className="mt-0.5 text-xs text-white/45">{trips.length} cycle(s) relié(s) au quai</p></div></div>
                <div className="flex items-start gap-3"><Scale size={16} className="mt-0.5 shrink-0 text-white/40" /><div><p className="text-sm font-semibold">{landings.length} débarquement(s)</p><p className="mt-0.5 text-xs text-white/45">Pesée et lots reliés aux opérations</p></div></div>
                <div className="flex items-start gap-3"><UsersRound size={16} className="mt-0.5 shrink-0 text-white/40" /><div><p className="text-sm font-semibold">{activeActors} acteur(s) habilité(s)</p><p className="mt-0.5 text-xs text-white/45">Sur le périmètre de démonstration</p></div></div>
              </div>
              {/* Repli honnête : si la fenêtre choisie ne contient aucun
                  débarquement ni aucune sortie réels pour ce quai, le
                  dire plutôt que laisser deux zéros sans explication. */}
              {trips.length === 0 && landings.length === 0 && (
                <p className="mt-3 text-xs text-white/45">Aucune activité documentée sur cette fenêtre pour ce quai.</p>
              )}
            </div>

            {/* A14 — seul contraste fort du dossier : terracotta si
                action requise (situation critique), ambre en vigilance
                ou en l'absence de situation prioritaire. */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className={`flex items-center gap-2 ${actionRequired ? "text-[#d97350]" : "text-[#c68a2c]"}`}><CircleAlert size={16} /><p className="text-[10px] font-bold uppercase tracking-[.12em]">Prochain geste</p></div>
              <p className="mt-3 text-sm font-bold leading-6">{primarySituation?.nextStep ?? "Maintenir la veille et la qualité des données du quai."}</p>
              <p className="mt-2 text-xs leading-5 text-white/45">{primarySituation ? `${primarySituation.reference} · ${primarySituation.title}` : "Aucune situation prioritaire ouverte"}</p>
              {primarySituation ? (
                <Button asChild className={`mt-4 w-full text-white ${actionRequired ? "bg-[#b6522f] hover:bg-[#b6522f]/90" : "bg-[#c68a2c] hover:bg-[#c68a2c]/90"}`}>
                  <Link href={`/app/situations/${primarySituation.id}`}>Ouvrir la situation <ArrowRight size={15} /></Link>
                </Button>
              ) : (
                <Button variant="outline" asChild className="mt-4 w-full border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white">
                  <Link href="/app/operations">Voir les opérations <ArrowRight size={15} /></Link>
                </Button>
              )}
            </div>
          </aside>
        </div>

        {/* A15 — bande de progression/lecture calmée : marine, texte,
            valeur, séparateurs fins ; plus de cellules à fond plein ni
            de turquoise. Accent sur l'étape active seulement quand elle
            se déduit du statut déjà porté par la situation prioritaire
            (activeStage), jamais une étape active inventée. */}
        <div className="grid divide-y divide-white/10 border-t border-white/10 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {[
            [Radio, "Signal", `${situations.length} ouvert(s)`, "Sources et confiance", 0],
            [Boxes, "Qualification", primarySituation?.status.replaceAll("_", " ") ?? "Veille", "Responsabilité connue", 1],
            [Gauge, "Décision", primarySituation ? "Action attendue" : "Aucune urgence", "Prochain geste explicite", 2],
            [CheckCircle2, "Résultat", String(state.situations.filter((item) => item.territoryId === territory.id && item.status === "reglee").length), "Boucles clôturées", 3]
          ].map(([Icon, label, value, detail, stage]) => {
            const StepIcon = Icon as typeof Radio;
            const isActive = activeStage === stage;
            return (
              <div key={String(label)} className="p-4 text-white">
                <div className={`flex items-center gap-2 ${isActive ? "text-[#c68a2c]" : "text-white/40"}`}><StepIcon size={15} /><p className="text-[9px] font-semibold uppercase tracking-[.13em]">{String(label)}</p></div>
                <p className={`mt-2 text-sm font-bold capitalize ${isActive ? "text-white" : "text-white/75"}`}>{String(value)}</p>
                <p className="mt-1 text-[10px] text-white/35">{String(detail)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lot 5 (mandat "Atlas & Territoire") §5/§8-§14 — le dossier
          territorial complet : ce qui se passe, ce qui émerge, ce que
          nous ne savons pas, ce que le terrain vérifie, ce qui est en
          cours, ce qui a été réalisé, ce qui change, ce que nous
          apprenons. Une seule source (buildTerritoryIntelligence), le
          même composant que l'Espace État (TerritoryDetail) — mandat
          §26 : une seule réalité, différentes expériences. Répond en
          moins de 30 secondes à "que se passe-t-il, qu'est-ce qui compte
          maintenant, que savons-nous, que ne savons-nous pas, que
          faisons-nous, est-ce que quelque chose change" (mandat §8). */}
      <section className="border-t pt-7">
        <div className="flex items-center gap-2 text-[#1d4468]"><Sparkles size={17} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Le territoire dans son ensemble</p></div>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">{territory.name} au-delà des chiffres</h2>
        <div className="mt-5">
          <TerritoryDossierSections intelligence={intelligence} tone="atlas" />
        </div>
      </section>

      {/* A16 — plus de Card englobante : section à même bg-background,
          même principe que les chapitres déjà migrés (Coordination). */}
      <section className="space-y-5 border-t pt-7">
        {/* A17 — les 5 lenses en navigation de lecture discrète, même
            grammaire que les tabs déjà migrées de CoordinationWorkspace
            (texte + indicateur actif, défilement horizontal mobile).
            Grille avec colonne minmax(0,1fr) — pas flex — pour la même
            raison qu'en coordination : un item flex avec overflow-x-auto
            refuse de rétrécir sous la largeur de son contenu même avec
            min-w-0, la largeur remonte via l'ancêtre partagé <main>. */}
        <div className="grid w-full min-w-0 gap-4 xl:grid-cols-[auto_minmax(0,1fr)] xl:items-end">
          <div>
            <div className="flex items-center gap-2 text-[#1d4468]"><LensIcon size={17} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Poste de travail · {selectedLens.label}</p></div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Objets reliés au quai de {territory.name}</h2>
          </div>
          <nav className="-mx-1 flex min-w-0 gap-1 overflow-x-auto px-1 pb-1" aria-label="Changer de lecture professionnelle">
            {lenses.map(({ id, label, icon: Icon }) => {
              const active = lens === id;
              return (
                <button key={id} onClick={() => setLens(id)} className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition ${active ? "border-[#0b1a2a] text-[#0b1a2a]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  <Icon size={15} className={active ? "" : "opacity-70"} /> {label}
                </button>
              );
            })}
          </nav>
        </div>

        <label className="relative block max-w-md">
          <Search size={15} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filtrer les objets de cette lecture…" className="h-10 w-full rounded-md border bg-card pl-9 pr-3 text-sm font-semibold outline-none focus:border-primary" />
        </label>

        {/* A18 — ajustements mineurs seulement : "stable" repasse en
            marine (plus de vert), survol plus discret, typographie
            alignée sur /app/travail et /app/coordination
            (text-xs font-semibold plutôt que les micro-capitales
            text-[10px] tracking-widest). Structure inchangée. */}
        {workbench.length > 0 ? <div className="divide-y rounded-xl border">{workbench.map((item) => (
          <article key={item.id} className="group grid gap-4 p-4 transition hover:bg-muted/25 md:grid-cols-[minmax(0,1.1fr)_minmax(140px,.45fr)_minmax(0,1fr)_auto] md:items-center md:px-5">
            <div className="min-w-0"><div className="flex items-center gap-2"><span className={`size-1.5 shrink-0 rounded-full ${item.urgency === "critique" ? "bg-[#b6522f]" : item.urgency === "attention" ? "bg-[#c68a2c]" : "bg-[#1d4468]"}`} /><p className="truncate text-xs font-semibold text-muted-foreground">{item.category}</p></div><h3 className="mt-1.5 truncate font-semibold">{item.title}</h3><div className="mt-2"><TrustBadge trust={item.trust} /></div></div>
            <div><p className="text-xs font-semibold text-muted-foreground">Lecture</p><p className="mt-1 text-sm font-semibold capitalize text-[#1d4468]">{item.metric}</p></div>
            <div className="min-w-0"><p className="text-sm leading-5 text-muted-foreground">{item.detail}</p><p className="mt-1 truncate text-xs text-muted-foreground">Source : {item.source}</p></div>
            {item.href ? <Button size="sm" variant="outline" className="whitespace-nowrap" asChild><Link href={item.href}>Ouvrir <ArrowRight size={14} /></Link></Button> : null}
          </article>
        ))}</div> : <div className="grid min-h-48 place-items-center rounded-xl border border-dashed p-8 text-center"><div><Layers3 className="mx-auto text-muted-foreground" /><h3 className="mt-3 font-semibold">Aucun objet pour cette combinaison</h3><p className="mt-2 text-sm text-muted-foreground">Modifiez le quai, l’espèce ou la lecture. La lacune reste visible.</p></div></div>}
      </section>

      {/* A19/A20 — section plate, plus de Card englobante des deux
          côtés. Séparateur discret (bordure) plutôt que deux blocs
          concurrents. */}
      <section className="grid gap-8 border-t pt-7 xl:grid-cols-[1.2fr_.8fr] xl:divide-x xl:divide-border xl:gap-0">
        <div className="xl:pr-8">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Capacités et continuité</p><h2 className="mt-1 text-lg font-semibold">Disponibilité opérationnelle du quai</h2></div><Building2 size={21} className="text-[#1d4468]" /></div>
            {/* A19 — les barres de taux restent (donnée quantitative
                légitime), même palette que le reste : critique
                terracotta, vigilance ambre, disponible marine/neutre
                (plus de vert). */}
            <div className="mt-5 space-y-4">{infrastructures.length ? infrastructures.map((item) => {
              const rate = item.theoreticalCapacity ? Math.round(item.availableCapacity / item.theoreticalCapacity * 100) : 0;
              return <div key={item.id}><div className="flex items-center justify-between gap-3 text-sm"><div><p className="font-semibold">{item.name}</p><p className="mt-0.5 text-xs capitalize text-muted-foreground">{item.type.replaceAll("_", " ")} · {item.status}</p></div><strong>{rate}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${rate < 25 ? "bg-[#b6522f]" : rate < 60 ? "bg-[#c68a2c]" : "bg-[#1d4468]"}`} style={{ width: `${rate}%` }} /></div></div>;
            }) : <p className="text-sm text-muted-foreground">Aucune capacité documentée pour ce quai.</p>}</div>
          <Button variant="link" className="mt-5 px-0" asChild><Link href="/app/coordination">Mobiliser une capacité <ArrowRight size={14} /></Link></Button>
        </div>

        {/* A20 — fonction secondaire allégée : texte + bouton, surface
            légère qui ne change plus de couleur à l'activation. Texte
            honnête conservé mot pour mot. */}
        <div className="xl:pl-8">
          <div className="flex items-center gap-2 text-muted-foreground"><Sparkles size={16} /><p className="text-xs font-bold uppercase tracking-widest">Assistance optionnelle</p></div>
          <h2 className="mt-3 text-lg font-semibold">{assistantEnabled ? "Synthèse prête à vérifier" : "Contrôle humain par défaut"}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{assistantEnabled ? `La continuité du quai de ${territory.name} dépend d’abord de ${infrastructures.find((item) => item.status !== "operationnelle")?.name ?? "la disponibilité déclarée des capacités"}. La suggestion reste explicable et doit être validée.` : "L’organisation peut activer l’assistance pour résumer les signaux et préparer une note. Aucune donnée n’est transmise à un service d’IA dans cette démonstration."}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setAssistantEnabled((value) => !value)}>{assistantEnabled ? "Désactiver l’assistance" : "Activer pour cette session"}</Button>
        </div>
      </section>
    </div>
  );
}
