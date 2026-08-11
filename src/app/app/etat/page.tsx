"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  FileDown,
  Radio,
  Send,
  ShieldCheck
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { DecisionIcon, ResultatIcon, SignalIcon, SituationIcon } from "@/components/etat/MotifIcons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { BlurFade } from "@/components/magicui/blur-fade";
import { DottedMap } from "@/components/magicui/dotted-map";
import { Marquee } from "@/components/magicui/marquee";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { decisionTypeLabels, type Situation, type Territory } from "@/domain/types";
import {
  fieldVisitObjectiveLabels,
  type FieldVisit,
  type FieldVisitObjective
} from "@/domain/ministry/field-visit";
import {
  vigilanceCategoryLabels,
  vigilanceSeverityLabels,
  type VigilanceCase,
  type VigilanceCategory,
  type VigilanceSeverity
} from "@/domain/ministry/vigilance";

const severityToTag: Record<VigilanceSeverity, "stable" | "vigilance" | "critique"> = { faible: "stable", moyenne: "vigilance", haute: "vigilance", critique: "critique" };
// Niveaux de risque des situations à arbitrer — mêmes libellés que la
// légende carte du référentiel D9 (Élevé / Moyen / Faible).
const priorityLabels: Record<Situation["priority"], string> = { critique: "Critique", haute: "Élevé", moyenne: "Moyen", faible: "Faible" };
const priorityToTag: Record<Situation["priority"], "stable" | "vigilance" | "critique"> = { critique: "critique", haute: "vigilance", moyenne: "stable", faible: "stable" };
const glyphBorderColor: Record<"stable" | "vigilance" | "critique", string> = { stable: "#1d4468", vigilance: "#c68a2c", critique: "#b6522f" };
const glyphFillColor: Record<"stable" | "vigilance" | "critique", string> = { stable: "rgba(29,68,104,.05)", vigilance: "rgba(198,138,44,.07)", critique: "rgba(182,82,47,.07)" };
// Remplissage plus marqué que glyphFillColor — réservé aux blocs qui
// appellent une décision (situations à arbitrer) : ils doivent se
// détacher des blocs de simple lecture (liste territoriale de
// l'Atlas, qui garde glyphFillColor). Hiérarchie de contraste, pas une
// nouvelle couleur.
const arbitrageFillColor: Record<"stable" | "vigilance" | "critique", string> = { stable: "rgba(29,68,104,.08)", vigilance: "rgba(198,138,44,.14)", critique: "rgba(182,82,47,.15)" };

// Passe de resserrage visuel (post-Lot 4) : variantes pleines plutôt
// que destructive (rouge générique, pas la terre-cuite de marque) ou
// ambre pastel — un statut critique doit se voir immédiatement.
// "Stable" reste volontairement discret (secondary) : la hiérarchie
// vient du contraste entre calme et urgent, pas d'un remplissage
// uniforme partout.
function StatusBadge({ status }: { status: "stable" | "vigilance" | "critique" }) {
  if (status === "critique") return <Badge variant="terracotta">Critique</Badge>;
  if (status === "vigilance") return <Badge variant="amber">Vigilance</Badge>;
  return <Badge variant="secondary">Stable</Badge>;
}

function formatFcfa(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(amount))} FCFA`;
}

type Mission = {
  key: string;
  territoryId: string;
  territoryLabel: string;
  raison: string;
  action: string;
  glyphStatus: "stable" | "vigilance" | "critique";
  suggestedObjective: FieldVisitObjective;
};

export default function EtatPage() {
  const { state, actorId } = useProduct();
  const [cases, setCases] = useState<VigilanceCase[]>([]);
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [territoryDrawer, setTerritoryDrawer] = useState<Territory | null>(null);
  const [missionDrawer, setMissionDrawer] = useState<Mission | null>(null);
  const [signalDrawerOpen, setSignalDrawerOpen] = useState(false);

  const reload = async () => {
    const [visitsRes, casesRes] = await Promise.all([fetch("/api/ministry/field-visits"), fetch("/api/ministry/vigilance")]);
    if (visitsRes.ok) setVisits((await visitsRes.json()).visits ?? []);
    if (casesRes.ok) setCases((await casesRes.json()).cases ?? []);
  };

  useEffect(() => {
    void reload();
  }, []);

  const actor = state?.actors.find((item) => item.id === actorId);
  const openCases = useMemo(() => cases.filter((item) => item.status !== "clos"), [cases]);

  const { executedValue, engagedValue } = useMemo(() => {
    if (!state) return { executedValue: 0, engagedValue: 0 };
    let executed = 0;
    let engaged = 0;
    for (const opportunity of state.opportunities) {
      const lot = state.lots.find((item) => item.id === opportunity.lotId);
      const species = lot ? state.species.find((item) => item.id === lot.speciesId) : undefined;
      if (!lot || !species) continue;
      const value = lot.quantityKg * species.indicativePriceFcfaKg;
      if (opportunity.status === "executee") executed += value;
      if (opportunity.status === "engagee") engaged += value;
    }
    return { executedValue: executed, engagedValue: engaged };
  }, [state]);

  const dominant = useMemo(() => {
    if (openCases.length > 0) {
      const top = [...openCases].sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0];
      return { kind: "signal" as const, glyphStatus: severityToTag[top.severity], case: top };
    }
    const critiqueTerritory = state?.territories.find((item) => item.activity === "critique");
    if (critiqueTerritory) return { kind: "territoire" as const, glyphStatus: "critique" as const, territory: critiqueTerritory };
    return { kind: "calme" as const, glyphStatus: "stable" as const };
  }, [openCases, state]);

  const leadIndicators = useMemo(() => {
    if (!state) return [];
    return state.initiatives.slice(0, 2).map((initiative) => ({ title: initiative.title, indicator: initiative.indicators[0] })).filter((item) => item.indicator);
  }, [state]);

  if (!state) return null;
  const signauxTraites = cases.filter((item) => item.status === "transmis_autorites" || item.status === "clos").length;
  const territoiresActifs = state.territories.length;
  const territoiresAttention = state.territories.filter((item) => item.activity !== "stable");
  const territoiresStables = state.territories.filter((item) => item.activity === "stable");

  // Répartition de l'état du réseau — vue de supervision, jamais présentée
  // au Coordinateur de cette façon (lui travaille situation par situation,
  // pas la santé agrégée du système).
  const territoryHealthData = [
    { name: "Stable", value: territoiresStables.length, fill: "#1d4468" },
    { name: "Vigilance", value: state.territories.filter((item) => item.activity === "vigilance").length, fill: "#c68a2c" },
    { name: "Critique", value: state.territories.filter((item) => item.activity === "critique").length, fill: "#b6522f" }
  ].filter((item) => item.value > 0);

  // Ratios réels utilisés par le bloc Impact clé — aucun n'est une
  // série temporelle inventée : ce sont des proportions calculées à
  // partir de l'état courant du système (§2.6 du spec maître, pas de
  // fausse précision).
  const totalValue = executedValue + engagedValue;
  const executedRatio = totalValue > 0 ? Math.round((executedValue / totalValue) * 100) : 0;
  const tauxTraitement = cases.length > 0 ? Math.round((signauxTraites / cases.length) * 100) : 0;

  // Libellés des étapes de la boucle de coordination — utilisés pour
  // afficher l'étape courante de chaque situation à arbitrer, pas pour
  // une vue agrégée du pipeline (retirée : redondante avec Impact clé
  // et Situations à arbitrer, référentiel D9 étape 5).
  const pipelineStages: Array<{ status: Situation["status"]; label: string }> = [
    { status: "recue", label: "Reçue" },
    { status: "qualification", label: "Qualification" },
    { status: "priorisee", label: "Priorisée" },
    { status: "coordination", label: "Coordination" },
    { status: "intervention", label: "Intervention" },
    { status: "attente", label: "En attente" },
    { status: "resultat", label: "Résultat" },
    { status: "reglee", label: "Réglée" }
  ];
  // Situations nécessitant un arbitrage institutionnel — priorité élevée
  // ou critique, dossier non réglé. Remplace les anciennes listes
  // parallèles « vigilance » et « missions » (référentiel D9) par une
  // seule liste orientée décision, cohérente avec un espace État
  // décision-first plutôt qu'une file de travail.
  const situationsAArbitrer = state.situations
    .filter((item) => item.status !== "reglee" && (item.priority === "critique" || item.priority === "haute"))
    .sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority])
    .slice(0, 5);

  // Décisions récentes — première consommation réelle de Decision (Lot 1,
  // D3) dans l'Espace État : le pendant naturel de « Situations à
  // arbitrer » — ce qui a déjà été tranché, pas seulement ce qui reste
  // à trancher.
  const recentDecisions = [...state.decisions]
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime())
    .slice(0, 5);

  return (
    <div className="shadcn-scope space-y-10 bg-background p-5 pb-16 lg:p-8">
      <div className="flex items-start gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#1d4468]" />
        <p>Mbàmbulaan <strong>qualifie et signale</strong> les situations remontées du terrain. La décision et l’action relèvent des autorités compétentes.</p>
      </div>

      <Card className="overflow-hidden border-none bg-sidebar text-sidebar-foreground shadow-lg">
        <CardContent className="p-6 md:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Espace État · {actor?.name ?? "Ministère"}</p>
          <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-center">
            <TensionGlyph status={dominant.glyphStatus} size={100} pulse={dominant.kind !== "calme"} />
            <div className="min-w-0 flex-1">
              {dominant.kind === "signal" && (
                <>
                  <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">En ce moment : {vigilanceCategoryLabels[dominant.case.category]} à {dominant.case.territoryLabel}.</h1>
                  <p className="mt-3 max-w-2xl text-sm text-sidebar-foreground/70">{dominant.case.description}</p>
                </>
              )}
              {dominant.kind === "territoire" && (
                <>
                  <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">En ce moment : {dominant.territory.name} concentre l’attention du réseau.</h1>
                  <p className="mt-3 max-w-2xl text-sm text-sidebar-foreground/70">Territoire classé en activité critique — voir le détail pour comprendre ce qui s’y joue.</p>
                </>
              )}
              {dominant.kind === "calme" && (
                <>
                  <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Aucune tension prioritaire signalée pour le moment.</h1>
                  <p className="mt-3 max-w-2xl text-sm text-sidebar-foreground/70">Le réseau reste sous surveillance continue ; les territoires et signaux actifs restent consultables ci-dessous.</p>
                </>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                {dominant.kind === "territoire" && (
                  <Button variant="secondary" onClick={() => setTerritoryDrawer(dominant.territory)}>Voir le territoire <ArrowRight /></Button>
                )}
                <Button variant="secondary" asChild><a href="#arbitrage">Voir les situations à arbitrer <ArrowRight /></a></Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bande ambiante — territoires suivis par le réseau. Décorative
          uniquement : le statut réel de chaque territoire se lit plus bas,
          dans la grille interactive (Défi 2), jamais ici. */}
      <div className="-mx-5 border-y bg-muted/30 lg:-mx-8">
        <Marquee pauseOnHover className="[--duration:32s]">
          {state.territories.map((territory) => (
            <span key={territory.id} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: glyphBorderColor[territory.activity] }}
                aria-hidden="true"
              />
              {territory.name}
            </span>
          ))}
        </Marquee>
      </div>

      {/* Impact clé — les trois chiffres qui font autorité pour le
          ministère. Trois proportions réellement calculées sur l'état
          courant (exécuté/engagé, composition des territoires, taux de
          traitement des signaux) — aucune série temporelle n'est
          inventée : le domaine n'a pas d'historique réel à ce jour
          (§2.6 du spec maître, pas de fausse précision). */}
      <BlurFade inView>
      <section>
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Impact clé</p>
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">Environnement de démonstration</Badge>
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Ce que la coordination a produit, en un coup d’œil.</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {/* Revenus = le point-clé de la section (référentiel D9 :
              terre-cuite réservée aux décisions/tensions/points-clés) —
              fond plein, pas un lavis léger. */}
          <Card className="overflow-hidden border-none bg-gradient-to-br from-[#b6522f] to-[#8a3d20] text-white shadow-lg">
            <CardContent>
              <ResultatIcon size={22} color="#fff8f2" />
              <p className="mt-3 text-3xl font-bold tracking-tight"><NumberTicker value={executedValue} /> <span className="text-base font-semibold">FCFA</span></p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/70">Valeur exécutée à date</p>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-white" style={{ width: `${executedRatio}%` }} />
              </div>
              <p className="mt-2 text-xs text-white/75">{executedRatio}% exécuté · {formatFcfa(engagedValue)} encore engagés, en cours de réalisation.</p>
            </CardContent>
          </Card>
          {/* Territoires et Signaux = lecture d'ensemble (neutre), pas un
              point de décision isolé — fond plein marine plutôt que
              terre-cuite, cohérent avec « neutre = information » de la
              passe de resserrage visuel. */}
          <Card className="overflow-hidden border-none bg-gradient-to-br from-[#1d4468] to-[#122c44] text-white shadow-lg">
            <CardContent>
              <SituationIcon size={22} color="#eef2f4" />
              <p className="mt-3 text-3xl font-bold tracking-tight"><NumberTicker value={territoiresActifs} /></p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/70">Territoires suivis par le réseau</p>
              <div className="mt-4 flex h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                {territoryHealthData.map((entry) => (
                  <div key={entry.name} className="h-full" style={{ width: `${territoiresActifs > 0 ? (entry.value / territoiresActifs) * 100 : 0}%`, backgroundColor: entry.name === "Stable" ? "rgba(255,255,255,.45)" : entry.fill }} />
                ))}
              </div>
              <p className="mt-2 text-xs text-white/75">{territoryHealthData.map((entry) => `${entry.name} ${entry.value}`).join(" · ")}</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-none bg-gradient-to-br from-[#1d4468] to-[#122c44] text-white shadow-lg">
            <CardContent>
              <SignalIcon size={22} color="#eef2f4" />
              <p className="mt-3 text-3xl font-bold tracking-tight"><NumberTicker value={signauxTraites} /></p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/70">Signaux traités sur {cases.length} reçu(s)</p>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-[#c68a2c]" style={{ width: `${tauxTraitement}%` }} />
              </div>
              <p className="mt-2 text-xs text-white/75">{tauxTraitement}% de taux de traitement.</p>
            </CardContent>
          </Card>
        </div>
        {/* Lecture seule (indicateurs de programmes déjà connus) — reste
            volontairement plus sobre que les 3 tuiles ci-dessus : c'est
            la hiérarchie de contraste demandée entre blocs de décision
            et blocs d'information. */}
        <Card className="mt-4">
          <CardHeader>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Évolution des programmes en cours</Label>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {leadIndicators.map(({ title, indicator }) => indicator && (
              <div key={title}>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{indicator.label}</p>
                <Progress className="mt-2" value={Math.min(100, (indicator.current / indicator.target) * 100)} />
                <p className="mt-1.5 text-xs text-muted-foreground">{indicator.current} / {indicator.target} {indicator.unit} <span className="text-muted-foreground/70">(départ : {indicator.baseline})</span></p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      </BlurFade>

      <Separator />

      {/* Atlas territorial — digital twin de l'Espace État. Carte et liste
          pointent vers la même fiche détaillée : cliquer un point sur la
          carte OU une ligne de la liste ouvre le même panneau. Illustratif
          (D6, PRODUCT_DECISION_LOG.md) — pas un fond de carte réel, aucune
          précision géographique impliquée. Kicker en marine plutôt qu'en
          terre-cuite : cette section est descriptive (explorer le
          territoire), pas un moment de décision — le référentiel D9
          réserve la terre-cuite aux décisions/tensions/points-clés, pas
          à un usage décoratif systématique. */}
      <BlurFade inView>
      <section id="terrain">
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Rencontrer les pêcheurs sans déplacement systématique</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Atlas territorial — le littoral, territoire par territoire.</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{territoiresAttention.length} territoire(s) demandent une attention particulière sur {territoiresActifs} suivis par le réseau. Cliquez un point sur la carte ou une fiche pour ouvrir le détail.</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <Card className="overflow-hidden border-[#1d4468]/20 bg-gradient-to-br from-[#1d4468]/[0.06] via-transparent to-primary/[0.03]">
            <CardContent className="p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Littoral suivi par le réseau · illustratif</p>
              <div className="aspect-[16/11] w-full">
                <DottedMap
                  countries={["SEN"]}
                  region={{ lat: { min: 12, max: 17 }, lng: { min: -17.5, max: -11 } }}
                  className="text-muted-foreground/20"
                  markerColor="#b6522f"
                  dotRadius={0.35}
                  markers={state.territories.map((territory) => ({
                    lat: territory.latitude,
                    lng: territory.longitude,
                    size: territory.activity === "critique" ? 3.2 : territory.activity === "vigilance" ? 2.2 : 1.4,
                    pulse: territory.activity === "critique",
                    color: glyphBorderColor[territory.activity],
                    territoryId: territory.id,
                    name: territory.name,
                    activity: territory.activity
                  }))}
                  onMarkerClick={(marker) => {
                    const territory = state.territories.find((item) => item.id === marker.territoryId);
                    if (territory) setTerritoryDrawer(territory);
                  }}
                  renderMarkerOverlay={({ marker, x, y, r }) =>
                    marker.activity === "stable" ? null : (
                      <text x={x + r + 1} y={y + 0.9} fontSize={2.5} fontWeight={700} fill={glyphBorderColor[marker.activity]} style={{ pointerEvents: "none" }}>
                        {marker.name}
                      </text>
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {[...territoiresAttention, ...territoiresStables].map((territory) => {
              const infraCount = state.infrastructures.filter((item) => item.territoryId === territory.id).length;
              const situationsOuvertes = state.situations.filter((item) => item.territoryId === territory.id && item.status !== "reglee").length;
              return (
                <button
                  key={territory.id}
                  onClick={() => setTerritoryDrawer(territory)}
                  className="flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left shadow-sm transition hover:border-primary/40"
                  style={{ borderLeftWidth: 3, borderLeftColor: glyphBorderColor[territory.activity], backgroundColor: glyphFillColor[territory.activity] }}
                >
                  <TensionGlyph status={territory.activity} size={24} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{territory.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{infraCount} infrastructure(s) · {situationsOuvertes} situation(s) ouverte(s)</span>
                  </span>
                  <StatusBadge status={territory.activity} />
                </button>
              );
            })}
          </div>
        </div>
      </section>
      </BlurFade>

      <Separator />

      {/* Situations critiques à arbitrer — remplace les anciennes listes
          « vigilance » et « missions » (référentiel D9, plan Lot 2 étape
          3) : une seule liste orientée décision institutionnelle, avec
          deux issues possibles par situation — arbitrer (Situation Room)
          ou envoyer une visite terrain pour vérifier avant de trancher. */}
      <BlurFade inView>
      <section id="arbitrage">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Lutter contre les fléaux, arbitrer les priorités</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Situations critiques à arbitrer.</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{situationsAArbitrer.length} situation(s) de risque élevé ou critique attendent une décision, sur {state.situations.filter((item) => item.status !== "reglee").length} dossier(s) ouverts.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={() => setSignalDrawerOpen(true)}><Radio /> Signaler une situation</Button>
            <Button variant="ghost" asChild><Link href="/app/situations">Voir toutes les situations <ArrowRight /></Link></Button>
          </div>
        </div>
        {situationsAArbitrer.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">Aucune situation de risque élevé ou critique en attente d’arbitrage pour le moment.</p>
        ) : (
          <div className="mt-5 space-y-2.5">
            {situationsAArbitrer.map((situation) => {
              const territory = state.territories.find((item) => item.id === situation.territoryId);
              const tag = priorityToTag[situation.priority];
              const stageLabel = pipelineStages.find((stage) => stage.status === situation.status)?.label ?? situation.status;
              return (
                <Card key={situation.id} className="flex-row flex-wrap items-center justify-between gap-3 p-4" style={{ borderLeftWidth: 4, borderLeftColor: glyphBorderColor[tag], backgroundColor: arbitrageFillColor[tag] }}>
                  <div className="flex items-center gap-3">
                    <TensionGlyph status={tag} size={30} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{territory?.name ?? situation.territoryId} · {situation.title}</p>
                        <Badge variant={tag === "critique" ? "terracotta" : "amber"}>{priorityLabels[situation.priority]}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{situation.nextStep}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">Étape {stageLabel.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMissionDrawer({
                        key: `situation-${situation.id}`,
                        territoryId: situation.territoryId,
                        territoryLabel: territory?.name ?? situation.territoryId,
                        raison: situation.title,
                        action: situation.nextStep,
                        glyphStatus: tag,
                        suggestedObjective: "verification_vigilance"
                      })}
                    >
                      Planifier une visite
                    </Button>
                    <Button size="sm" asChild><Link href={`/app/situations/${situation.id}`}>Arbitrer <ArrowRight /></Link></Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        {visits.filter((item) => item.status === "planifiee").length > 0 && (
          <p className="mt-4 text-xs text-muted-foreground">{visits.filter((item) => item.status === "planifiee").length} visite(s) terrain déjà planifiée(s) par le ministère.</p>
        )}
      </section>
      </BlurFade>

      <Separator />

      {/* Décisions récentes — pendant de « Situations à arbitrer » :
          ce qui a déjà été tranché par le ministère. Première
          consommation réelle de Decision (Lot 1, D3) dans l'Espace
          État — jusqu'ici l'objet existait dans le domaine sans être
          jamais affiché nulle part. */}
      <BlurFade inView>
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Rendre compte des arbitrages</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Décisions récentes.</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{state.decisions.length} décision(s) enregistrée(s) au total — chaque arbitrage institutionnel reste tracé et consultable.</p>
        {recentDecisions.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">Aucune décision enregistrée pour le moment.</p>
        ) : (
          <div className="mt-5 space-y-2.5">
            {recentDecisions.map((decision) => {
              const situation = state.situations.find((item) => item.id === decision.situationId);
              const territory = situation ? state.territories.find((item) => item.id === situation.territoryId) : undefined;
              const decider = state.actors.find((item) => item.id === decision.decidedByActorId);
              return (
                <Card key={decision.id} className="flex-row flex-wrap items-center justify-between gap-3 border-[#1d4468]/20 bg-gradient-to-br from-[#1d4468]/[0.08] via-[#1d4468]/[0.02] to-transparent p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1d4468]"><DecisionIcon size={20} color="#eef2f4" /></span>
                    <div>
                      <p className="text-sm font-semibold">{decisionTypeLabels[decision.type]}{situation ? ` · ${territory?.name ?? situation.territoryId}` : ""}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{decision.rationale}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        {new Date(decision.decidedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                        {decider ? ` · ${decider.name}` : ""}
                      </p>
                    </div>
                  </div>
                  {situation && (
                    <Button variant="ghost" size="sm" asChild><Link href={`/app/situations/${situation.id}`}>Voir la situation <ArrowRight /></Link></Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
      </BlurFade>

      <Separator />

      {/* Défi 5 — bailleurs */}
      <BlurFade inView>
      <Card className="flex-row flex-wrap items-center justify-between gap-5 border-none bg-sidebar p-7 text-sidebar-foreground shadow-lg">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Capter l’attention des bailleurs</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Un rapport d’impact prêt à partager.</h2>
          <p className="mt-2 max-w-xl text-sm text-sidebar-foreground/65">Structuré par territoire, exportable, pensé pour vos propres échanges avec les bailleurs et programmes.</p>
        </div>
        <Button asChild><Link href="/app/etat/rapport"><FileDown /> Ouvrir le rapport bailleurs</Link></Button>
      </Card>
      </BlurFade>

      {/* Panneau territoire */}
      <Sheet open={!!territoryDrawer} onOpenChange={(open) => !open && setTerritoryDrawer(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{territoryDrawer?.name}</SheetTitle>
            <SheetDescription>Territoire</SheetDescription>
          </SheetHeader>
          {territoryDrawer && <TerritoryDetail territory={territoryDrawer} cases={cases.filter((item) => item.territoryId === territoryDrawer.id)} />}
        </SheetContent>
      </Sheet>

      {/* Panneau signalement */}
      <Sheet open={signalDrawerOpen} onOpenChange={setSignalDrawerOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Signaler une situation</SheetTitle>
            <SheetDescription>Vigilance</SheetDescription>
          </SheetHeader>
          <SignalForm territories={state.territories} onDone={() => { setSignalDrawerOpen(false); void reload(); }} />
        </SheetContent>
      </Sheet>

      {/* Panneau mission */}
      <Sheet open={!!missionDrawer} onOpenChange={(open) => !open && setMissionDrawer(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Planifier la mission</SheetTitle>
            <SheetDescription>Terrain</SheetDescription>
          </SheetHeader>
          {missionDrawer && <MissionForm mission={missionDrawer} onDone={() => { setMissionDrawer(null); void reload(); }} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function severityRank(severity: VigilanceSeverity) {
  return { faible: 0, moyenne: 1, haute: 2, critique: 3 }[severity];
}

const situationPriorityRank: Record<Situation["priority"], number> = { critique: 3, haute: 2, moyenne: 1, faible: 0 };

const infraStatusColor: Record<"operationnelle" | "fragile" | "indisponible", string> = { operationnelle: "#1d8a5f", fragile: "#c68a2c", indisponible: "#b6522f" };
const infraStatusLabel: Record<"operationnelle" | "fragile" | "indisponible", string> = { operationnelle: "Opérationnelle", fragile: "Fragile", indisponible: "Indisponible" };

function TerritoryDetail({ territory, cases }: { territory: Territory; cases: VigilanceCase[] }) {
  const { state } = useProduct();
  if (!state) return null;
  const sites = state.sites.filter((item) => item.territoryId === territory.id);
  const infrastructures = state.infrastructures.filter((item) => item.territoryId === territory.id);
  const acteurs = state.actors.filter((item) => item.territoryIds.includes(territory.id));
  const acteursParRole = acteurs.reduce<Record<string, number>>((acc, item) => {
    acc[item.role] = (acc[item.role] ?? 0) + 1;
    return acc;
  }, {});
  const prioritySituation = state.situations
    .filter((item) => item.territoryId === territory.id && item.status !== "reglee")
    .sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority])[0];

  return (
    <div className="space-y-6 px-4">
      <StatusBadge status={territory.activity} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Localisation</p>
        <p className="mt-1 text-sm">{territory.region}</p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acteurs actifs · {acteurs.length}</p>
        {acteurs.length === 0 ? (
          <p className="mt-1.5 text-xs text-muted-foreground">Aucun acteur rattaché pour le moment.</p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {Object.entries(acteursParRole).map(([role, count]) => (
              <Badge key={role} variant="outline" className="capitalize">{role.replaceAll("_", " ")} · {count}</Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Infrastructures · {sites.length} site(s), {infrastructures.length} infrastructure(s)</p>
        {infrastructures.length === 0 ? (
          <p className="mt-1.5 text-xs text-muted-foreground">Aucune infrastructure recensée.</p>
        ) : (
          <div className="mt-1.5 space-y-1.5">
            {infrastructures.map((infra) => (
              <div key={infra.id} className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2">
                <span className="text-xs font-medium capitalize">{infra.type.replaceAll("_", " ")}</span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: infraStatusColor[infra.status] }}>
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: infraStatusColor[infra.status] }} aria-hidden="true" />
                  {infraStatusLabel[infra.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {prioritySituation && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Situation prioritaire</p>
          <div className="mt-2 rounded-lg border bg-card p-3">
            <p className="text-sm font-semibold">{prioritySituation.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{prioritySituation.nextStep}</p>
            {prioritySituation.history.length > 0 && (
              <div className="mt-3 space-y-1.5 border-t pt-3">
                {prioritySituation.history.slice(0, 2).map((entry) => (
                  <div key={entry.id} className="border-l-2 border-muted pl-2 text-[11px] leading-4 text-muted-foreground">
                    <span className="font-semibold text-foreground">{entry.label}</span> · {new Date(entry.at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </div>
                ))}
              </div>
            )}
            {/* Accès direct à la Situation Room (livrable Lot 2) — cette route
                vit dans le groupe (coordination) et rend donc le shell partagé,
                pas InstitutionShell : état intermédiaire assumé, la Situation
                Room elle-même sera reconstruite « dans le nouveau système de
                composants » au Lot 4, occasion de traiter aussi son rendu pour
                un accès Institution. */}
            <Button variant="secondary" size="sm" className="mt-3 w-full" asChild>
              <Link href={`/app/situations/${prioritySituation.id}`}>Entrer dans la Situation Room <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      )}
      {cases.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Signaux sur ce territoire</p>
          <div className="mt-2 space-y-2">
            {cases.map((item) => (
              <div key={item.id} className="rounded-lg bg-muted p-3 text-xs">{vigilanceCategoryLabels[item.category]} — {item.description}</div>
            ))}
          </div>
        </div>
      )}
      <Button variant="outline" className="w-full" asChild>
        <a href={`/atlas/${territory.id}`} target="_blank" rel="noreferrer">Fiche territoire complète (site public) <ArrowUpRight /></a>
      </Button>
    </div>
  );
}

function SignalForm({ territories, onDone }: { territories: Territory[]; onDone: () => void }) {
  const [category, setCategory] = useState<VigilanceCategory>("immigration_clandestine");
  const [territoryId, setTerritoryId] = useState("");
  const [severity, setSeverity] = useState<VigilanceSeverity>("moyenne");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/ministry/vigilance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, territoryId, severity, description })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Impossible d’enregistrer ce signalement.");
        return;
      }
      onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <label className="block text-xs font-semibold">
        Catégorie
        <select value={category} onChange={(event) => setCategory(event.target.value as VigilanceCategory)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {Object.entries(vigilanceCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="block text-xs font-semibold">
        Territoire
        <select required value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">Sélectionner…</option>
          {territories.map((territory) => <option key={territory.id} value={territory.id}>{territory.name}</option>)}
        </select>
      </label>
      <label className="block text-xs font-semibold">
        Gravité
        <select value={severity} onChange={(event) => setSeverity(event.target.value as VigilanceSeverity)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {Object.entries(vigilanceSeverityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="block text-xs font-semibold">
        Description
        <textarea required rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ce qui a été observé, où et par qui." />
      </label>
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
      <Button disabled={pending} className="w-full">Signaler <Send /></Button>
    </form>
  );
}

function MissionForm({ mission, onDone }: { mission: Mission; onDone: () => void }) {
  const [title, setTitle] = useState(`${fieldVisitObjectiveLabels[mission.suggestedObjective]} — ${mission.territoryLabel}`);
  const [plannedAt, setPlannedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/ministry/field-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, territoryId: mission.territoryId, objective: mission.suggestedObjective, plannedAt, notes: notes || undefined })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Impossible de planifier cette mission.");
        return;
      }
      onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <div className="rounded-md bg-muted p-3.5 text-xs leading-5"><strong>{mission.territoryLabel}</strong> — {mission.raison}</div>
      <label className="block text-xs font-semibold">
        Titre
        <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Date prévue
        <input required type="date" value={plannedAt} onChange={(event) => setPlannedAt(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Notes (facultatif)
        <textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
      <Button disabled={pending} className="w-full">Planifier la mission <ArrowRight /></Button>
    </form>
  );
}
