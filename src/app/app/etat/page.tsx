"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  FileDown,
  Globe2,
  Radio,
  Send,
  ShieldCheck,
  Users
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
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
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { BlurFade } from "@/components/magicui/blur-fade";
import { DottedMap } from "@/components/magicui/dotted-map";
import { Marquee } from "@/components/magicui/marquee";
import { NumberTicker } from "@/components/magicui/number-ticker";
import type { Situation, Territory } from "@/domain/types";
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

const activityLabels: Record<Territory["activity"], string> = { stable: "Stable", vigilance: "Vigilance", critique: "Critique" };
const severityToTag: Record<VigilanceSeverity, "stable" | "vigilance" | "critique"> = { faible: "stable", moyenne: "vigilance", haute: "vigilance", critique: "critique" };
const glyphBorderColor: Record<"stable" | "vigilance" | "critique", string> = { stable: "#1d4468", vigilance: "#c68a2c", critique: "#b6522f" };
const glyphFillColor: Record<"stable" | "vigilance" | "critique", string> = { stable: "rgba(29,68,104,.05)", vigilance: "rgba(198,138,44,.07)", critique: "rgba(182,82,47,.07)" };

const territoryHealthConfig: ChartConfig = {
  value: { label: "Territoires" },
  Stable: { label: "Stable", color: "#1d4468" },
  Vigilance: { label: "Vigilance", color: "#c68a2c" },
  Critique: { label: "Critique", color: "#b6522f" }
};

function StatusBadge({ status }: { status: "stable" | "vigilance" | "critique" }) {
  if (status === "critique") return <Badge variant="destructive">Critique</Badge>;
  if (status === "vigilance") return <Badge className="border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100">Vigilance</Badge>;
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

  const missions: Mission[] = useMemo(() => {
    if (!state) return [];
    const fromCases: Mission[] = openCases.map((item) => ({
      key: `case-${item.id}`,
      territoryId: item.territoryId,
      territoryLabel: item.territoryLabel,
      raison: `Signal ${vigilanceCategoryLabels[item.category].toLowerCase()} — gravité ${vigilanceSeverityLabels[item.severity].toLowerCase()}`,
      action: "Vérifier la situation sur place et transmettre aux autorités compétentes si confirmée.",
      glyphStatus: severityToTag[item.severity],
      suggestedObjective: "verification_vigilance"
    }));
    const coveredTerritoryIds = new Set(openCases.map((item) => item.territoryId));
    const fromTerritories: Mission[] = state.territories
      .filter((item) => item.activity !== "stable" && !coveredTerritoryIds.has(item.id))
      .map((item) => {
        const fragile = state.infrastructures.filter((infra) => infra.territoryId === item.id && infra.status !== "operationnelle").length;
        return {
          key: `territoire-${item.id}`,
          territoryId: item.id,
          territoryLabel: item.name,
          raison: fragile > 0 ? `Territoire en ${activityLabels[item.activity].toLowerCase()} — ${fragile} infrastructure(s) fragile(s) ou indisponible(s)` : `Territoire en ${activityLabels[item.activity].toLowerCase()}`,
          action: "Rencontrer les acteurs locaux et évaluer les besoins prioritaires.",
          glyphStatus: item.activity,
          suggestedObjective: "rencontre_pecheurs" as const
        };
      });
    return [...fromCases, ...fromTerritories].sort((a, b) => rankGlyph(b.glyphStatus) - rankGlyph(a.glyphStatus)).slice(0, 5);
  }, [state, openCases]);

  const leadIndicators = useMemo(() => {
    if (!state) return [];
    return state.initiatives.slice(0, 2).map((initiative) => ({ title: initiative.title, indicator: initiative.indicators[0] })).filter((item) => item.indicator);
  }, [state]);

  if (!state) return null;
  const acteursCoordonnes = state.actors.length;
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

  // Boucle de coordination — combien de dossiers à chaque étape, tous
  // territoires confondus. Répond à « où en est le système », pas
  // « qu'est-ce que je dois faire » (ça, c'est l'écran Coordinateur).
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
  const pipelineCounts = pipelineStages.map((stage) => ({
    ...stage,
    count: state.situations.filter((item) => item.status === stage.status).length
  }));

  return (
    <div className="shadcn-scope space-y-10 bg-background p-5 pb-16 lg:p-8">
      <div className="flex items-start gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
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
                <Button variant="secondary" asChild><a href="#signaux">Voir la vigilance <ArrowRight /></a></Button>
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

      {/* Vue d'ensemble — supervision du système, pas une file de travail.
          C'est ce qui distingue structurellement l'Espace État du
          Coordinateur : lui agit dossier par dossier, le ministère lit
          l'état agrégé du réseau et l'avancement de la boucle. */}
      <BlurFade inView>
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Vue d’ensemble du système</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Ce que le ministère supervise, pas ce qu’il exécute.</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-[.85fr_1.65fr]">
          <Card className="border-[#1d4468]/20 bg-gradient-to-br from-[#1d4468]/[0.06] via-transparent to-transparent">
            <CardHeader>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Santé des territoires</Label>
            </CardHeader>
            <CardContent>
              <ChartContainer config={territoryHealthConfig} className="mx-auto aspect-square max-h-[170px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={territoryHealthData} dataKey="value" nameKey="name" innerRadius={44} strokeWidth={3}>
                    {territoryHealthData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} stroke="var(--card)" />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
                {territoryHealthData.map((entry) => (
                  <span key={entry.name} className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ backgroundColor: entry.fill }} aria-hidden="true" />
                    {entry.name} · {entry.value}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent">
            <CardHeader>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Boucle de coordination — tous territoires confondus</Label>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-1">
                {pipelineCounts.map((stage, index) => (
                  <div key={stage.status} className="flex items-center gap-1">
                    <div className={`min-w-[5.5rem] rounded-lg border px-3 py-2.5 text-center ${stage.count > 0 ? "border-primary/25 bg-primary/[0.05]" : "border-border bg-muted/50"}`}>
                      <p className={`text-lg font-bold tracking-tight ${stage.count > 0 ? "text-primary" : "text-muted-foreground"}`}>{stage.count}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{stage.label}</p>
                    </div>
                    {index < pipelineCounts.length - 1 && <ChevronRight size={14} className="shrink-0 text-muted-foreground/40" aria-hidden="true" />}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{state.situations.length} dossier(s) suivis au total, du signal reçu jusqu’à la clôture.</p>
            </CardContent>
          </Card>
        </div>
      </section>
      </BlurFade>

      {/* Défi 1 — valeur générée */}
      <BlurFade inView>
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Diversifier les revenus des pêcheurs</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Une valeur additionnelle réelle, générée par la coordination.</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <Card className="border-primary/25 bg-gradient-to-br from-primary/[0.09] via-primary/[0.03] to-transparent">
            <CardContent>
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">Environnement de démonstration</Badge>
              <p className="mt-4 text-4xl font-bold tracking-tight text-primary">{formatFcfa(executedValue)}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valeur exécutée à date</p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{formatFcfa(engagedValue)} supplémentaires sont engagés — mise en relation confirmée entre un lot disponible et un besoin qualifié, en cours de réalisation.</p>
              <p className="mt-4 text-xs leading-5 text-muted-foreground/80">Origine : mise en relation directe entre lots disponibles et besoins qualifiés par le réseau Mbàmbulaan — un calcul sur les opportunités réellement traitées, pas une promesse théorique.</p>
            </CardContent>
          </Card>
          <Card className="border-[#1d4468]/20 bg-gradient-to-br from-[#1d4468]/[0.07] via-[#1d4468]/[0.02] to-transparent">
            <CardHeader>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Évolution des programmes en cours</Label>
            </CardHeader>
            <CardContent className="space-y-5">
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
        </div>
      </section>
      </BlurFade>

      <Separator />

      {/* Défi 2 — présence terrain */}
      <BlurFade inView>
      <section id="terrain">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Rencontrer les pêcheurs sans déplacement systématique</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">La réalité terrain, territoire par territoire.</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{territoiresAttention.length} territoire(s) demandent une attention particulière sur {territoiresActifs} suivis par le réseau.</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.5fr]">
          {/* Illustration, pas un fond de carte réel (D6, PRODUCT_DECISION_LOG.md)
              — aucune donnée géographique de précision, juste une silhouette
              du littoral pour situer les territoires les uns par rapport aux
              autres. */}
          <Card className="overflow-hidden border-[#1d4468]/20 bg-gradient-to-br from-[#1d4468]/[0.06] via-transparent to-primary/[0.03]">
            <CardContent className="p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Littoral suivi par le réseau · illustratif</p>
              <div className="aspect-[4/3] w-full">
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
                    pulse: territory.activity === "critique"
                  }))}
                />
              </div>
            </CardContent>
          </Card>
          <div>
            <div className="flex flex-wrap gap-2.5">
              {territoiresAttention.map((territory) => (
                <button key={territory.id} onClick={() => setTerritoryDrawer(territory)} className="flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left shadow-sm transition hover:border-primary/40" style={{ borderLeftWidth: 3, borderLeftColor: glyphBorderColor[territory.activity], backgroundColor: glyphFillColor[territory.activity] }}>
                  <TensionGlyph status={territory.activity} size={26} />
                  <span>
                    <span className="block text-sm font-semibold">{territory.name}</span>
                    <span className="mt-1 block"><StatusBadge status={territory.activity} /></span>
                  </span>
                </button>
              ))}
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">+ {territoiresStables.length} territoire(s) stables</summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {territoiresStables.map((territory) => (
                  <Button key={territory.id} variant="secondary" size="sm" onClick={() => setTerritoryDrawer(territory)}>{territory.name}</Button>
                ))}
              </div>
            </details>
          </div>
        </div>
      </section>
      </BlurFade>

      <Separator />

      {/* Défi 3 — vigilance */}
      <BlurFade inView>
      <section id="signaux">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Lutter contre les fléaux</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Vigilance — signaux à qualifier.</h2>
          </div>
          <Button variant="outline" onClick={() => setSignalDrawerOpen(true)}><Radio /> Signaler une situation</Button>
        </div>
        {openCases.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">Aucun signal ouvert pour le moment.</p>
        ) : (
          <div className="mt-5 space-y-2.5">
            {openCases.map((item) => (
              <Card key={item.id} className="flex-row flex-wrap items-center justify-between gap-3 p-4" style={{ borderLeftWidth: 3, borderLeftColor: glyphBorderColor[severityToTag[item.severity]], backgroundColor: glyphFillColor[severityToTag[item.severity]] }}>
                <div className="flex items-center gap-3">
                  <TensionGlyph status={severityToTag[item.severity]} size={30} />
                  <div>
                    <p className="text-sm font-semibold">{vigilanceCategoryLabels[item.category]} · {item.territoryLabel}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/70">Signalé le {new Date(item.createdAt).toLocaleDateString("fr-FR")} · gravité {vigilanceSeverityLabels[item.severity].toLowerCase()}</p>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">{item.status.replace(/_/g, " ")}</Badge>
              </Card>
            ))}
          </div>
        )}
      </section>
      </BlurFade>

      <Separator />

      {/* Défi 6 — missions terrain recommandées */}
      <BlurFade inView>
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Donner au ministère une activité terrain concrète</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Missions recommandées.</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Générées à partir des tensions et signaux actifs — une liste priorisée, pas un système de gestion.</p>
        {missions.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">Aucune mission suggérée : aucune tension active à traiter en priorité.</p>
        ) : (
          <div className="mt-5 space-y-2.5">
            {missions.map((mission) => (
              <Card key={mission.key} className="flex-row flex-wrap items-center justify-between gap-3 p-4" style={{ borderLeftWidth: 3, borderLeftColor: glyphBorderColor[mission.glyphStatus], backgroundColor: glyphFillColor[mission.glyphStatus] }}>
                <div className="flex items-center gap-3">
                  <TensionGlyph status={mission.glyphStatus} size={30} />
                  <div>
                    <p className="text-sm font-semibold">{mission.territoryLabel}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{mission.raison}</p>
                    <p className="mt-1 text-xs font-medium text-primary">→ {mission.action}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setMissionDrawer(mission)}>Planifier <ArrowRight /></Button>
              </Card>
            ))}
          </div>
        )}
        {visits.filter((item) => item.status === "planifiee").length > 0 && (
          <p className="mt-4 text-xs text-muted-foreground">{visits.filter((item) => item.status === "planifiee").length} mission(s) déjà planifiée(s) par le ministère.</p>
        )}
      </section>
      </BlurFade>

      <Separator />

      {/* Défi 4 — statistiques */}
      <BlurFade inView>
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Outil statistique de supervision</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">La coordination en chiffres.</h2>
        <BentoGrid className="mt-5 grid-cols-1 gap-4 sm:grid-cols-3 auto-rows-[13rem]">
          <BentoCard
            name="Acteurs coordonnés"
            className="border-[#1d4468]/20 bg-gradient-to-br from-[#1d4468]/[0.08] via-[#1d4468]/[0.02] to-transparent sm:col-span-2"
            Icon={Users}
            href="#terrain"
            cta="Voir le réseau territorial"
            description={
              <>
                <Badge variant="outline" className="mb-2 border-amber-300 bg-amber-50 text-amber-800">Démonstration</Badge>
                <span className="block text-4xl font-bold tracking-tight text-foreground"><NumberTicker value={acteursCoordonnes} /></span>
                <span className="mt-1 block text-sm">acteurs vérifiés et mobilisables sur les territoires suivis.</span>
              </>
            }
            background={<div />}
          />
          <BentoCard
            name="Signaux traités"
            className="border-amber-500/20 bg-gradient-to-br from-amber-500/[0.09] via-amber-500/[0.02] to-transparent sm:col-span-1"
            Icon={Radio}
            href="#signaux"
            cta="Voir la vigilance"
            description={
              <>
                <Badge variant="outline" className="mb-2 border-amber-300 bg-amber-50 text-amber-800">Démonstration</Badge>
                <span className="block text-2xl font-bold tracking-tight text-foreground"><NumberTicker value={signauxTraites} /></span>
              </>
            }
            background={<div />}
          />
          <BentoCard
            name="Territoires actifs"
            className="border-primary/20 bg-gradient-to-br from-primary/[0.09] via-primary/[0.02] to-transparent sm:col-span-1"
            Icon={Globe2}
            href="#terrain"
            cta="Explorer la carte"
            description={
              <>
                <Badge variant="outline" className="mb-2 border-amber-300 bg-amber-50 text-amber-800">Démonstration</Badge>
                <span className="block text-2xl font-bold tracking-tight text-foreground"><NumberTicker value={territoiresActifs} /></span>
              </>
            }
            background={<div />}
          />
        </BentoGrid>
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
function rankGlyph(status: "stable" | "vigilance" | "critique") {
  return { stable: 0, vigilance: 1, critique: 2 }[status];
}

const situationPriorityRank: Record<Situation["priority"], number> = { critique: 3, haute: 2, moyenne: 1, faible: 0 };

function TerritoryDetail({ territory, cases }: { territory: Territory; cases: VigilanceCase[] }) {
  const { state } = useProduct();
  if (!state) return null;
  const sites = state.sites.filter((item) => item.territoryId === territory.id);
  const infrastructures = state.infrastructures.filter((item) => item.territoryId === territory.id);
  const fragile = infrastructures.filter((item) => item.status !== "operationnelle");
  const acteurs = state.actors.filter((item) => item.territoryIds.includes(territory.id));
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
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acteurs actifs</p>
        <p className="mt-1 text-sm">{acteurs.length} acteur(s) rattaché(s) à ce territoire.</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Infrastructures</p>
        <p className="mt-1 text-sm">{sites.length} site(s) · {infrastructures.length} infrastructure(s), dont {fragile.length} fragile(s) ou indisponible(s).</p>
      </div>
      {prioritySituation && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Situation prioritaire</p>
          <div className="mt-2 rounded-lg border bg-card p-3">
            <p className="text-sm font-semibold">{prioritySituation.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{prioritySituation.nextStep}</p>
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
