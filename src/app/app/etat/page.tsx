"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Drawer } from "@/components/etat/Drawer";
import { AtlasMap } from "@/components/etat/AtlasMap";
import { KpiSparkline, SignalTrendChart } from "@/components/etat/EtatDataVisualizations";
import { NumberTicker } from "@/components/magicui/number-ticker";
import {
  Mission,
  MissionForm,
  SignalForm,
  SituationDetail,
  glyphBorderColor,
  initiativeStatusLabel,
  priorityLabels,
  priorityToTag,
  situationPriorityRank
} from "@/components/etat/shared";
import type { Initiative, Situation } from "@/domain/types";
import { findFocusSituation } from "@/domain/situation-narrative";
import { vigilanceCategoryLabels, type VigilanceCase, type VigilanceSeverity } from "@/domain/ministry/vigilance";
import { TrustGlyphLabel, trustGlyphFromLevel } from "@/components/etat/TrustGlyph";
import { deriveDatasetReferenceAt } from "@/domain/signal-crossing";
import { dataSourceRegistry } from "@/domain/data-sources";
import { useEtatPreview } from "@/components/providers/EtatPreviewProvider";
import { portfolioAvgProgressPct, portfolioRows } from "@/domain/programme-intelligence";
import { fluxStats, projectFluxContext } from "@/domain/incoming-message";

// LOT V3.16 ("Brief national — copie conforme du rendu maquette") —
// reconstruction du Brief national sur le plan EXACT de l'écran `isBrief`
// de la maquette Claude Design (lu directement dans le fichier .dc.html
// source, puis vérifié par rendu réel du bundle standalone.html exécuté
// dans Chromium headless) : bandeau plat (pas de photo — la maquette n'en
// a aucune sur cet écran), 5 tuiles KPI à mini-tendance, graphique
// d'évolution des signaux + panneau "Foyers d'attention" (mini-carte),
// liste "Requiert votre attention" dépliable, 2 blocs latéraux (Décisions
// attendues / Programmes à surveiller), bandeau "Ce que le système ne
// sait pas encore", clôture éditoriale "Géej tasul yaakaar".
//
// Mandat explicite (utilisateur, verbatim) : "je veux exactement le
// rendu graphique du html avec les animations, les blocs, tout copie
// conforme [...] oublie tout l'existant". Remplace donc entièrement la
// composition précédente de cette page (hero photo, "Le pouls de la
// filière", "De la capture à la décision", chapitre Atlas + panneau
// territoire complet avec sélection carte) — ces blocs étaient du
// contenu réel construit lot après lot, mais absents de la maquette ;
// leurs capacités réelles restent pleinement disponibles ailleurs dans
// le produit (Atlas territorial, Situations & signaux, Arbitrages) —
// rien n'est supprimé du produit, seulement de CETTE page.
//
// Discipline inchangée malgré la reconstruction structurelle : chaque
// bloc de la maquette est rempli avec une donnée réellement dérivable de
// ProductState, jamais avec le texte/chiffre d'exemple de la fixture
// (`ARB`, `briefDots`, `briefHot`... du prototype). Quand aucune donnée
// réelle ne permet de remplir un bloc à l'identique (ex. tendance
// hebdomadaire par KPI, inexistante — comptages ponctuels, pas un
// historique stocké), la même série illustrative déjà divulguée
// ailleurs dans le produit (signalTrendDemo/ETAT_DEMO_SERIES_NOTICE) est
// réutilisée plutôt qu'une série fabriquée pour l'occasion — jamais 5
// tendances inventées différentes.
// LOT V3.31 ("Brief national — dynamisme du rôle connecté") — retour
// explicite de l'utilisateur : "as-tu pris en compte le dynamisme du rôle
// connecté ?" Le sélecteur "Rôle connecté" de la maquette ne réordonne
// pas seulement le menu (LOT V3.29) — il change le contenu narratif réel
// affiché (H1, "Lecture en 20 secondes", légende du bandeau démo,
// vérifié par comparaison directe des 3 captures role-Ministre.png/role-
// Directiondeprogramme.png/role-Coordinationterritoriale.png). Chaque H1/
// TLDR par rôle ci-dessous dérive d'une lecture RÉELLE et DISTINCTE de la
// même ProductState (jamais un second jeu de données, jamais un
// pourcentage inventé) :
//  - "ministre" reprend le calcul `dominant` déjà réel (Brief national
//    LOT V3.16), inchangé ;
//  - "direction_programme" dérive de portfolioRows/programmeHealth (déjà
//    réel, domain/programme-intelligence.ts — même lecture que /app/etat/
//    programmes, LOT V3.30) : combien de programmes sont en état
//    "critique" (un écart déjà confirmé entre le terrain et le déclaré) ;
//  - "coordination_territoriale" dérive de fluxStats/projectFluxContext
//    (déjà réels, domain/incoming-message.ts, LOT V3.3) : combien
//    d'éléments reçus restent à qualifier, et combien sont immédiatement
//    qualifiables vs. nécessitent un recoupement terrain.
// "Relais de quai mandaté" (maquette, TLDR Coordination) n'a aucun champ
// réel équivalent (déjà établi à l'Atlas territorial, LOT V3.28) : la
// clause finale du TLDR Coordination utilise à la place une lecture
// honnête déjà réelle (Situation.trust, TrustLevel) — les situations
// ouvertes jamais encore vérifiées sur site — plutôt que d'inventer un
// "relais mandaté".
const FRENCH_COUNT_WORDS = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"];
function frenchCountWord(n: number): string {
  return n >= 0 && n <= 10 ? FRENCH_COUNT_WORDS[n] : String(n);
}
function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const severityToTag: Record<VigilanceSeverity, "stable" | "vigilance" | "critique"> = { faible: "stable", moyenne: "vigilance", haute: "vigilance", critique: "critique" };

// Progression d'un programme (mandat, "blocs Programmes à surveiller") —
// dérivée des VRAIS indicateurs (baseline/target/current, Initiative.
// indicators), moyenne des ratios d'avancement individuels bornés à
// [0,1] — jamais un pourcentage inventé quand aucun indicateur n'existe
// (retourne null, affiché honnêtement comme "non chiffré").
function programmeProgressPct(programme: Initiative): number | null {
  if (programme.indicators.length === 0) return null;
  const ratios = programme.indicators.map((indicator) => {
    const span = indicator.target - indicator.baseline;
    if (span === 0) return indicator.current >= indicator.target ? 1 : 0;
    return Math.min(1, Math.max(0, (indicator.current - indicator.baseline) / span));
  });
  return Math.round((ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length) * 100);
}

function situationAge(situation: Situation, referenceAtMs: number): string | null {
  const first = situation.history[0]?.at;
  if (!first) return null;
  const days = Math.floor((referenceAtMs - new Date(first).getTime()) / 86_400_000);
  if (days <= 0) return "aujourd’hui";
  return `il y a ${days} jour${days > 1 ? "s" : ""}`;
}

export default function EtatPage() {
  const { state } = useProduct();
  const preview = useEtatPreview();
  const previewRole = preview?.previewRole ?? "ministre";
  const [cases, setCases] = useState<VigilanceCase[]>([]);
  const [openAttentionId, setOpenAttentionId] = useState<string | null>(null);
  const [situationDrawer, setSituationDrawer] = useState<Situation | null>(null);
  const [missionDrawer, setMissionDrawer] = useState<Mission | null>(null);
  const [signalDrawerOpen, setSignalDrawerOpen] = useState(false);

  const reload = async () => {
    const response = await fetch("/api/ministry/vigilance");
    if (response.ok) setCases((await response.json()).cases ?? []);
  };
  useEffect(() => {
    void reload();
  }, []);

  const openCases = useMemo(() => cases.filter((item) => item.status !== "clos"), [cases]);

  const dominant = useMemo(() => {
    if (!state) return { kind: "calme" as const, glyphStatus: "stable" as const };
    if (openCases.length > 0) {
      const top = [...openCases].sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0];
      return { kind: "signal" as const, glyphStatus: severityToTag[top.severity], case: top };
    }
    const critiqueTerritory = state.territories.find((item) => item.activity === "critique");
    if (critiqueTerritory) return { kind: "territoire" as const, glyphStatus: "critique" as const, territory: critiqueTerritory };
    return { kind: "calme" as const, glyphStatus: "stable" as const };
  }, [openCases, state]);

  if (!state) return null;

  const datasetReferenceAt = deriveDatasetReferenceAt(state);
  const referenceAtMs = datasetReferenceAt ? new Date(datasetReferenceAt).getTime() : Date.now();
  const todayLabel = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  // Titre + synthèse (h1 court / phrase de lecture) — même calcul
  // `dominant` que le reste de la page, aucun `if joal` : s'écrirait
  // identiquement pour n'importe quel territoire dominant.
  const nationalFocusSituation = dominant.kind === "territoire" ? findFocusSituation(state, dominant.territory.id) : undefined;
  const briefHeadline = dominant.kind === "territoire"
    ? `${dominant.territory.name} concentre l’attention du réseau.`
    : dominant.kind === "signal"
      ? `${dominant.case.territoryLabel} concentre l’attention du réseau.`
      : "Aucune tension prioritaire ne nécessite une attention immédiate.";
  const briefSynthesis = dominant.kind === "territoire" && nationalFocusSituation
    ? nationalFocusSituation.title
    : dominant.kind === "signal"
      ? vigilanceCategoryLabels[dominant.case.category]
      : "Le réseau reste sous surveillance continue ; les territoires actifs restent consultables sur l’Atlas.";

  // Synthèse nationale — 5 agrégats réels (mandat "Refonte Premium XXL",
  // repris à l'identique depuis la version précédente de cette page).
  const situationsOuvertesTotal = state.situations.filter((item) => item.status !== "reglee").length;
  const situationsCritiquesHautesTotal = state.situations.filter((item) => item.status !== "reglee" && (item.priority === "critique" || item.priority === "haute")).length;
  const territoiresActifs = state.territories.length;
  const capacitesFragilesTotal = state.infrastructures.filter((item) => item.status !== "operationnelle").length;
  const programmesActifsTotal = state.initiatives.filter((item) => item.status !== "terminee").length;
  const kpis = [
    { key: "situations", label: "Situations ouvertes", value: situationsOuvertesTotal, note: `${situationsCritiquesHautesTotal} critique(s) ou élevée(s)` },
    { key: "critiques", label: "Critiques ou élevées", value: situationsCritiquesHautesTotal, note: "sur situations ouvertes" },
    { key: "territoires", label: "Territoires couverts", value: territoiresActifs, note: "réseau national" },
    { key: "capacites", label: "Capacités fragiles", value: capacitesFragilesTotal, note: "hors service ou dégradées" },
    { key: "programmes", label: "Programmes actifs", value: programmesActifsTotal, note: "hors programmes clôturés" }
  ];

  // Lecture en 20 secondes — 3 faits réels, mêmes chiffres que la
  // bande KPI juste en dessous, jamais un second calcul.
  const situationsAArbitrer = state.situations
    .filter((item) => item.status !== "reglee" && (item.priority === "critique" || item.priority === "haute"))
    .sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority]);
  const briefTldr = `${situationsCritiquesHautesTotal} situation(s) critique(s) ou élevée(s), ${capacitesFragilesTotal} capacité(s) fragile(s), ${situationsAArbitrer.length} décision(s) attendue(s) cette semaine.`;

  // H1 + TLDR par rôle connecté (LOT V3.31, cf. commentaire d'en-tête) —
  // 3 lectures réelles et distinctes de la même ProductState.
  const programmeRows = portfolioRows(state);
  const dpCriticalCount = programmeRows.filter((row) => row.health.state === "critique").length;
  const dpAttentionCount = programmeRows.filter((row) => row.health.state === "attention").length;
  const dpAvgProgressPct = portfolioAvgProgressPct(programmeRows) ?? 0;

  const flux = fluxStats(state);
  const openMessages = state.incomingMessages.filter((item) => item.status === "nouveau");
  const qualifiableNowCount = openMessages.filter((item) => projectFluxContext(state, item).missing.length === 0).length;
  const needsFieldCrossCheckCount = openMessages.length - qualifiableNowCount;
  const unverifiedOpenSituations = state.situations.filter((item) => item.status !== "reglee" && item.trust !== "verifiee").length;

  const roleHeadline = {
    ministre: briefHeadline,
    direction_programme: dpCriticalCount > 0
      ? `${capitalize(frenchCountWord(dpCriticalCount))} programme${dpCriticalCount > 1 ? "s" : ""} sur ${frenchCountWord(state.initiatives.length)} demande${dpCriticalCount > 1 ? "nt" : ""} une décision d’exécution.`
      : "Aucun programme ne demande de décision d’exécution immédiate.",
    coordination_territoriale: flux.nouveau > 0
      ? `${capitalize(frenchCountWord(flux.nouveau))} élément${flux.nouveau > 1 ? "s" : ""} reçu${flux.nouveau > 1 ? "s" : ""} attend${flux.nouveau > 1 ? "ent" : ""} une qualification.`
      : "Aucun élément reçu n’attend de qualification."
  }[previewRole];

  const roleTldr = {
    ministre: `${briefTldr}${dpAttentionCount > 0 ? ` ${dpAttentionCount} programme(s) affiche(nt) un écart entre avancement déclaré et signaux reçus.` : ""}`,
    direction_programme: `Le portefeuille avance à ${dpAvgProgressPct}% en moyenne. ${dpCriticalCount} programme(s) en écart critique entre le terrain et le déclaré, ${dpAttentionCount} en attention.`,
    coordination_territoriale: `${qualifiableNowCount} élément(s) qualifiable(s) immédiatement, ${needsFieldCrossCheckCount} nécessite(nt) un recoupement terrain. ${unverifiedOpenSituations} situation(s) ouverte(s) n’ont pas encore été vérifiée(s) sur site.`
  }[previewRole];

  // Foyers d'attention — territoires réellement classés vigilance/
  // critique, triés par sévérité puis par situations ouvertes ; jamais un
  // classement fabriqué (même discipline que l'Atlas territorial).
  const territoriesToWatch = state.territories
    .map((territory) => ({ territory, openSituations: state.situations.filter((item) => item.territoryId === territory.id && item.status !== "reglee").length }))
    .filter((item) => item.territory.activity !== "stable")
    .sort((a, b) => (attentionRank[b.territory.activity] - attentionRank[a.territory.activity]) || b.openSituations - a.openSituations)
    .slice(0, 3);

  // Requiert votre attention — mêmes situations que "Décisions
  // attendues" (situationsAArbitrer), présentées en fiche dépliable
  // connu/inconnu plutôt qu'en ligne compacte.
  const attentionSituations = situationsAArbitrer.slice(0, 4).map((situation) => {
    const territory = state.territories.find((item) => item.id === situation.territoryId);
    const tag = priorityToTag[situation.priority];
    const known = situation.history.slice(0, 2).map((entry) => entry.detail || entry.label);
    const unknown = situation.waitingReason ? [situation.waitingReason] : [];
    const whyNow = situation.dueAt
      ? `Échéance le ${new Date(situation.dueAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}`
      : situationAge(situation, referenceAtMs)
        ? `Sans décision ${situationAge(situation, referenceAtMs)}`
        : "Situation ouverte";
    return { situation, territory, tag, known, unknown, whyNow };
  });

  // Décisions attendues — mêmes situations, échéance réelle (Situation.
  // dueAt) quand elle existe, jamais une date fabriquée.
  const decisionsAttendues = situationsAArbitrer.slice(0, 3).map((situation) => {
    const dueDays = situation.dueAt ? Math.ceil((new Date(situation.dueAt).getTime() - referenceAtMs) / 86_400_000) : null;
    return { situation, dueDays };
  });

  // Programmes à surveiller — trié par échéance réelle la plus proche
  // parmi les situations rattachées (même dérivation que l'ancien
  // teaser), jamais un ordre arbitraire.
  const programmesASurveiller = [...state.initiatives]
    .map((programme) => {
      const nextDeadline = programme.situationIds
        .map((id) => state.situations.find((item) => item.id === id)?.dueAt)
        .filter((value): value is string => Boolean(value))
        .sort()[0];
      const alertSituations = programme.situationIds
        .map((id) => state.situations.find((item) => item.id === id))
        .filter((item): item is Situation => item != null && item.status !== "reglee" && (item.priority === "critique" || item.priority === "haute"));
      return { programme, nextDeadline, alertSituations };
    })
    .sort((a, b) => {
      if (!a.nextDeadline && !b.nextDeadline) return 0;
      if (!a.nextDeadline) return 1;
      if (!b.nextDeadline) return -1;
      return a.nextDeadline.localeCompare(b.nextDeadline);
    })
    .slice(0, 3);

  // Ce que le système ne sait pas encore — mêmes sources non connectées/
  // absentes que /app/etat/sources (LOT V3.7), jamais un second registre
  // d'angles morts inventé pour cette page.
  const blindSpots = dataSourceRegistry(state).filter((item) => item.connectionState === "non_connectee" || item.connectionState === "absente");

  return (
    <div className="mb-rise pb-16">
      <div className="px-4 pb-6 pt-7 sm:px-[30px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-9">
          <div className="min-w-0 flex-1">
            <p className="etat-eyebrow">Brief national · {todayLabel}</p>
            <h1 className="mt-2.5 max-w-[22ch] font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 41, lineHeight: 1.1, color: "var(--etat-navy)" }}>{roleHeadline}</h1>
            <p className="mt-3.5 max-w-[60ch]" style={{ fontFamily: "var(--etat-font-display)", fontSize: 17.5, lineHeight: 1.55, color: "rgba(11,26,42,.78)" }}>{briefSynthesis}</p>
          </div>
          <div className="w-full shrink-0 border-l-2 py-0.5 pl-4 lg:w-[236px]" style={{ borderColor: "var(--etat-terracotta)" }}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.14em]" style={{ color: "rgba(11,26,42,.45)" }}>Lecture en 20 secondes</p>
            <p className="text-[12.5px] leading-[1.5]" style={{ color: "rgba(11,26,42,.8)" }}>{roleTldr}</p>
          </div>
        </div>

        {/* 5 tuiles KPI — grille à liseré 1px, même géométrie que la
            maquette (rgba(11,26,42,.12) entre les cellules). */}
        {/* grid-cols-1 sous sm (pas grid-cols-2) : 5 tuiles sur une grille
            à fond coloré dans les interstices (gap-px + background) laisse
            une cellule orpheline visible (bloc gris plein) dès que le
            nombre de tuiles ne divise pas exactement le nombre de
            colonnes — trouvé en QA réelle à 390px avec 2 colonnes (5=2×2+1
            orpheline). 1 colonne l'évite entièrement ; sm/lg gardent 3/5
            colonnes, où le compte (5) se divise proprement. */}
        <div className="mt-6 grid grid-cols-1 gap-px border sm:grid-cols-3 lg:grid-cols-5" style={{ background: "rgba(11,26,42,.12)", borderColor: "rgba(11,26,42,.12)" }}>
          {kpis.map((kpi) => (
            <div key={kpi.key} className="flex flex-col gap-2.5 bg-white px-[17px] pb-[13px] pt-4">
              <p className="min-h-[26px] text-[10.5px] uppercase tracking-[.1em]" style={{ color: "rgba(11,26,42,.5)" }}>{kpi.label}</p>
              <p className="leading-none" style={{ fontFamily: "var(--etat-font-mono)", fontSize: 32, letterSpacing: "-.02em", color: "var(--etat-navy)" }}><NumberTicker value={kpi.value} /></p>
              <KpiSparkline color="var(--etat-navy)" />
              <p className="min-h-[30px] text-[11px] leading-[1.35]" style={{ color: "rgba(11,26,42,.52)" }}>{kpi.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10.5px] leading-4" style={{ color: "var(--etat-stone-600)" }}>Tendance illustrative (mode démonstration) — aucun historique hebdomadaire n’est encore stocké pour ces 5 indicateurs.</p>

        {/* Évolution des signaux + Foyers d'attention. */}
        <div className="mt-7 grid grid-cols-1 gap-[22px] lg:grid-cols-[1.45fr_1fr]">
          <div className="border p-5" style={{ borderColor: "rgba(11,26,42,.12)" }}>
            <SignalTrendChart />
          </div>
          <div className="flex flex-col text-[#F7F3E9]" style={{ background: "var(--etat-navy)" }}>
            <div className="px-5 pb-3 pt-[17px]">
              <p className="font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 20 }}>Foyers d’attention</p>
              <p className="mt-1 text-[11.5px]" style={{ color: "rgba(247,243,233,.55)" }}>Concentration géographique actuelle</p>
            </div>
            <div className="relative h-[190px] px-3">
              <AtlasMap territories={state.territories} showLegend={false} showScale={false} showAttribution={false} />
            </div>
            <div className="mt-2 border-t px-5 pb-4 pt-3" style={{ borderColor: "rgba(247,243,233,.1)" }}>
              <p className="pb-2 text-[10px] uppercase tracking-[.14em]" style={{ color: "rgba(247,243,233,.5)" }}>Foyers dominants</p>
              {territoriesToWatch.length === 0 ? (
                <p className="text-[12px] leading-[1.5]" style={{ color: "rgba(247,243,233,.7)" }}>Aucun territoire en vigilance ou critique actuellement.</p>
              ) : territoriesToWatch.map(({ territory, openSituations }) => (
                <div key={territory.id} className="flex items-center gap-[11px] rounded-[4px] px-2.5 py-2.5">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: glyphBorderColor[territory.activity] }} />
                  <span className="flex-1 text-[12.5px] font-medium">{territory.name}</span>
                  <span className="text-[12px]" style={{ color: "rgba(247,243,233,.75)", fontFamily: "var(--etat-font-mono)" }}>{openSituations} situation(s)</span>
                </div>
              ))}
              <div className="mt-3 border-t pt-3 text-[12px] leading-[1.5]" style={{ borderColor: "rgba(247,243,233,.1)", color: "rgba(247,243,233,.7)" }}>{territoriesToWatch.length} territoire(s) sur {territoiresActifs} classé(s) en vigilance ou critique aujourd’hui.</div>
            </div>
          </div>
        </div>

        {/* Requiert votre attention + sidebar (Décisions attendues /
            Programmes à surveiller). */}
        <div className="mt-[22px] grid grid-cols-1 gap-[22px] lg:grid-cols-[1.45fr_1fr]">
          <div className="border" style={{ borderColor: "rgba(11,26,42,.12)" }}>
            <div className="flex flex-wrap items-baseline gap-3 border-b px-5 py-[13px]" style={{ borderColor: "rgba(11,26,42,.09)" }}>
              <p className="flex-1 font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 20, color: "var(--etat-navy)" }}>Requiert votre attention</p>
              <p className="text-[11px]" style={{ color: "rgba(11,26,42,.5)" }}>Cliquez pour déplier</p>
            </div>
            {attentionSituations.length === 0 ? (
              <p className="p-5 text-sm" style={{ color: "var(--etat-stone-600)" }}>Aucune situation critique ou de risque élevé en attente d’arbitrage.</p>
            ) : attentionSituations.map(({ situation, territory, tag, known, unknown, whyNow }, index) => {
              const open = openAttentionId === situation.id;
              return (
                <div key={situation.id} className="border-b" style={{ borderColor: "rgba(11,26,42,.07)" }}>
                  <button onClick={() => setOpenAttentionId(open ? null : situation.id)} className="flex w-full items-start gap-3.5 px-5 py-[15px] text-left">
                    <span className="w-3.5 shrink-0 pt-0.5 text-[11px]" style={{ color: "rgba(11,26,42,.35)", fontFamily: "var(--etat-font-mono)" }}>{index + 1}</span>
                    <span className="w-[3px] shrink-0 self-stretch rounded-[2px]" style={{ background: glyphBorderColor[tag] }} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-semibold leading-[1.35]" style={{ color: "var(--etat-navy)" }}>{situation.title}</span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[11.5px]" style={{ color: "rgba(11,26,42,.55)" }}>
                        <TrustGlyphLabel level={trustGlyphFromLevel(situation.trust)} />
                        <span className="h-2.5 w-px" style={{ background: "rgba(11,26,42,.18)" }} />
                        <span>{territory?.name ?? situation.territoryId}</span>
                        <span className="h-2.5 w-px" style={{ background: "rgba(11,26,42,.18)" }} />
                        <span style={{ color: glyphBorderColor[tag], fontWeight: 500 }}>{priorityLabels[situation.priority]}</span>
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-right sm:block" style={{ maxWidth: 180 }}>
                      <span className="block text-[10px] uppercase tracking-[.1em]" style={{ color: "rgba(11,26,42,.4)" }}>Pourquoi maintenant</span>
                      <span className="mt-1 block text-[11.5px]" style={{ color: "rgba(11,26,42,.7)" }}>{whyNow}</span>
                    </span>
                    <span className="shrink-0 text-[15px]" style={{ color: "rgba(11,26,42,.35)" }}>{open ? "▾" : "▸"}</span>
                  </button>
                  {open && (
                    <div className="px-5 pb-[18px] pl-[51px]">
                      <div className="grid grid-cols-1 gap-[18px] p-4 sm:grid-cols-2" style={{ background: "var(--etat-cream)", border: "1px solid rgba(11,26,42,.09)" }}>
                        <div>
                          <p className="mb-2 text-[10px] uppercase tracking-[.12em]" style={{ color: "#4E7B5A" }}>Ce que nous savons</p>
                          {known.length === 0 ? <p className="text-[12.5px] text-[var(--etat-stone-400)]">Aucun fait consigné pour le moment.</p> : known.map((fact, i) => (
                            <div key={i} className="mb-1.5 border-l-2 pl-2.5 text-[12.5px] leading-[1.5]" style={{ borderColor: "rgba(78,123,90,.35)", color: "rgba(11,26,42,.82)" }}>{fact}</div>
                          ))}
                        </div>
                        <div>
                          <p className="mb-2 text-[10px] uppercase tracking-[.12em]" style={{ color: "var(--etat-terracotta)" }}>Ce qui reste incertain</p>
                          {unknown.length === 0 ? <p className="text-[12.5px] text-[var(--etat-stone-400)]">Aucune incertitude documentée.</p> : unknown.map((fact, i) => (
                            <div key={i} className="mb-1.5 border-l-2 pl-2.5 text-[12.5px] leading-[1.5]" style={{ borderColor: "rgba(182,82,47,.35)", color: "rgba(11,26,42,.82)" }}>{fact}</div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button onClick={() => setSituationDrawer(situation)} className="rounded-[4px] px-[15px] py-2 text-[12px] font-medium" style={{ background: "var(--etat-navy)", color: "#F7F3E9" }}>Ouvrir la situation</button>
                        <p className="text-[11.5px]" style={{ color: "rgba(11,26,42,.55)" }}>{situation.nextStep}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-[22px]">
            <div className="border" style={{ borderColor: "rgba(11,26,42,.12)" }}>
              <div className="flex items-baseline gap-2.5 border-b px-[18px] pb-3 pt-4" style={{ borderColor: "rgba(11,26,42,.09)" }}>
                <p className="flex-1 font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 19, color: "var(--etat-navy)" }}>Décisions attendues</p>
                <p className="text-[12px]" style={{ color: "var(--etat-terracotta)", fontFamily: "var(--etat-font-mono)" }}>{decisionsAttendues.length}</p>
              </div>
              {decisionsAttendues.length === 0 ? (
                <p className="p-[18px] text-sm" style={{ color: "var(--etat-stone-600)" }}>Aucune décision attendue pour le moment.</p>
              ) : decisionsAttendues.map(({ situation, dueDays }) => {
                const territory = state.territories.find((item) => item.id === situation.territoryId);
                return (
                  <Link key={situation.id} href="/app/etat/arbitrages" className="flex items-center gap-3 border-b px-[18px] py-3 hover:bg-[rgba(182,82,47,.06)]" style={{ borderColor: "rgba(11,26,42,.07)" }}>
                    <span className="w-[42px] shrink-0 text-center">
                      <span className="block leading-none" style={{ fontFamily: "var(--etat-font-mono)", fontSize: 17, color: dueDays !== null && dueDays <= 2 ? "var(--etat-critique)" : "var(--etat-ocre)" }}>{dueDays !== null ? Math.max(0, dueDays) : "—"}</span>
                      <span className="mt-0.5 block text-[9.5px] uppercase tracking-[.08em]" style={{ color: "rgba(11,26,42,.45)" }}>{dueDays !== null ? "jour(s)" : "non daté"}</span>
                    </span>
                    <span className="h-9 w-px shrink-0" style={{ background: "rgba(11,26,42,.1)" }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium leading-[1.35]" style={{ color: "var(--etat-navy)" }}>{situation.title}</span>
                      <span className="mt-1 block text-[11px]" style={{ color: "rgba(11,26,42,.55)" }}>{territory?.name ?? situation.territoryId}</span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="border" style={{ borderColor: "rgba(11,26,42,.12)" }}>
              <div className="border-b px-[18px] pb-3 pt-4" style={{ borderColor: "rgba(11,26,42,.09)" }}>
                <p className="font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 19, color: "var(--etat-navy)" }}>Programmes à surveiller</p>
                <p className="mt-1 text-[11.5px]" style={{ color: "rgba(11,26,42,.52)" }}>Écart entre trajectoire administrative et signaux de terrain</p>
              </div>
              {programmesASurveiller.length === 0 ? (
                <p className="p-[18px] text-sm" style={{ color: "var(--etat-stone-600)" }}>Aucun programme actif pour le moment.</p>
              ) : programmesASurveiller.map(({ programme, alertSituations }) => {
                const pct = programmeProgressPct(programme);
                const alertColor = alertSituations.length > 0 ? "var(--etat-critique)" : "#4E7B5A";
                return (
                  <Link key={programme.id} href="/app/etat/programmes" className="block border-b px-[18px] py-[13px] hover:bg-[rgba(182,82,47,.06)]" style={{ borderColor: "rgba(11,26,42,.07)" }}>
                    <div className="flex items-baseline gap-2.5">
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium" style={{ color: "var(--etat-navy)" }}>{programme.title}</span>
                      <span style={{ fontFamily: "var(--etat-font-mono)", fontSize: 12.5, color: "var(--etat-navy)" }}>{pct !== null ? `${pct}%` : "—"}</span>
                    </div>
                    <div className="relative my-[9px] h-1 overflow-hidden" style={{ background: "rgba(11,26,42,.1)" }}>
                      <div className="absolute inset-y-0 left-0" style={{ width: `${pct ?? 0}%`, background: "var(--etat-navy)" }} />
                    </div>
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: alertColor }}>
                      <span className="size-1.5 shrink-0 rounded-full" style={{ background: alertColor }} />
                      {alertSituations.length > 0 ? `${alertSituations.length} situation(s) ouverte(s) à surveiller` : `Statut : ${initiativeStatusLabel[programme.status]}, aucun signal d’alerte`}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ce que le système ne sait pas encore — mêmes sources non
            connectées/absentes que /app/etat/sources (LOT V3.7). */}
        <div className="mt-[22px] border p-[22px]" style={{ borderColor: "rgba(11,26,42,.12)" }}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <p className="mb-1.5 font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 20, color: "var(--etat-navy)" }}>Ce que le système ne sait pas encore</p>
              <p className="text-[12.5px] leading-[1.6]" style={{ color: "rgba(11,26,42,.65)" }}>Mbàmbulaan affiche ses angles morts au même niveau que ses constats. Une absence de signal n’est pas une absence de problème.</p>
            </div>
            <div className="grid grid-cols-1 gap-x-[26px] gap-y-3.5 sm:grid-cols-2">
              {blindSpots.map((spot, index) => (
                <div key={spot.key} className="flex items-start gap-[11px]">
                  <span className="shrink-0 pt-px" style={{ fontFamily: "var(--etat-font-mono)", fontSize: 13, color: "var(--etat-terracotta)" }}>{index + 1}</span>
                  <p className="text-[12.5px] leading-[1.5]" style={{ color: "rgba(11,26,42,.8)" }}><strong className="font-semibold">{spot.name}</strong> — {spot.effect}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clôture éditoriale — inchangée, verbatim de la maquette (LOT
          "Brief national" précédent), déjà réelle et déjà exacte. */}
      <div className="etat-canvas-dark px-6 py-14 text-center lg:px-[60px]">
        <p className="etat-eyebrow etat-eyebrow--on-dark justify-center">Géej tasul yaakaar</p>
        <p className="etat-h2 mx-auto mt-4 max-w-[560px] text-2xl" style={{ color: "var(--etat-cream)" }}>La mer ne manque jamais d’espoir.</p>
        <p className="mx-auto mt-3 max-w-[480px] text-[13px] leading-[1.6]" style={{ color: "rgba(247,243,233,.62)", fontFamily: "var(--etat-font-body)" }}>Proverbe wolof — le même esprit qui porte chaque pêcheur, chaque territoire, chaque décision documentée sur cette page.</p>
      </div>

      <div className="px-4 pt-6 sm:px-[30px]">
        <button className="etat-btn etat-btn-outline" onClick={() => setSignalDrawerOpen(true)}>Signaler une situation</button>
      </div>

      <Drawer open={!!situationDrawer} onClose={() => setSituationDrawer(null)} eyebrow="Situation" title={situationDrawer?.title ?? ""} size="lg">
        {situationDrawer && <SituationDetail situation={situationDrawer} state={state} onPlanVisit={() => { const territory = state.territories.find((item) => item.id === situationDrawer.territoryId); setSituationDrawer(null); setMissionDrawer({ key: `situation-${situationDrawer.id}`, territoryId: situationDrawer.territoryId, territoryLabel: territory?.name ?? situationDrawer.territoryId, raison: situationDrawer.title, action: situationDrawer.nextStep, glyphStatus: priorityToTag[situationDrawer.priority], suggestedObjective: "verification_vigilance" }); }} />}
      </Drawer>
      <Drawer open={signalDrawerOpen} onClose={() => setSignalDrawerOpen(false)} eyebrow="Vigilance" title="Signaler une situation">
        <SignalForm territories={state.territories} onDone={() => setSignalDrawerOpen(false)} />
      </Drawer>
      <Drawer open={!!missionDrawer} onClose={() => setMissionDrawer(null)} eyebrow="Terrain" title="Planifier la mission">
        {missionDrawer && <MissionForm mission={missionDrawer} onDone={() => setMissionDrawer(null)} />}
      </Drawer>
    </div>
  );
}

const attentionRank: Record<"stable" | "vigilance" | "critique", number> = { critique: 2, vigilance: 1, stable: 0 };

// severityRank reste local : n'utilisé que par le calcul `dominant`.
function severityRank(severity: VigilanceSeverity) {
  return { faible: 0, moyenne: 1, haute: 2, critique: 3 }[severity];
}
