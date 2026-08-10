"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  FileDown,
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
import type { Territory } from "@/domain/types";
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

      {/* Défi 1 — valeur générée */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Diversifier les revenus des pêcheurs</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Une valeur additionnelle réelle, générée par la coordination.</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <Card>
            <CardContent>
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">Environnement de démonstration</Badge>
              <p className="mt-4 text-4xl font-bold tracking-tight">{formatFcfa(executedValue)}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valeur exécutée à date</p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{formatFcfa(engagedValue)} supplémentaires sont engagés — mise en relation confirmée entre un lot disponible et un besoin qualifié, en cours de réalisation.</p>
              <p className="mt-4 text-xs leading-5 text-muted-foreground/80">Origine : mise en relation directe entre lots disponibles et besoins qualifiés par le réseau Mbàmbulaan — un calcul sur les opportunités réellement traitées, pas une promesse théorique.</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/40">
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

      <Separator />

      {/* Défi 2 — présence terrain */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Rencontrer les pêcheurs sans déplacement systématique</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">La réalité terrain, territoire par territoire.</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{territoiresAttention.length} territoire(s) demandent une attention particulière sur {territoiresActifs} suivis par le réseau.</p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {territoiresAttention.map((territory) => (
            <button key={territory.id} onClick={() => setTerritoryDrawer(territory)} className="flex items-center gap-2.5 rounded-lg border bg-card px-3.5 py-2.5 text-left shadow-sm transition hover:border-primary/40" style={{ borderLeftWidth: 3, borderLeftColor: glyphBorderColor[territory.activity] }}>
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
      </section>

      <Separator />

      {/* Défi 3 — vigilance */}
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
              <Card key={item.id} className="flex-row flex-wrap items-center justify-between gap-3 p-4" style={{ borderLeftWidth: 3, borderLeftColor: glyphBorderColor[severityToTag[item.severity]] }}>
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

      <Separator />

      {/* Défi 6 — missions terrain recommandées */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Donner au ministère une activité terrain concrète</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Missions recommandées.</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Générées à partir des tensions et signaux actifs — une liste priorisée, pas un système de gestion.</p>
        {missions.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">Aucune mission suggérée : aucune tension active à traiter en priorité.</p>
        ) : (
          <div className="mt-5 space-y-2.5">
            {missions.map((mission) => (
              <Card key={mission.key} className="flex-row flex-wrap items-center justify-between gap-3 p-4" style={{ borderLeftWidth: 3, borderLeftColor: glyphBorderColor[mission.glyphStatus] }}>
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

      <Separator />

      {/* Défi 4 — statistiques */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Outil statistique de supervision</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">La coordination en chiffres.</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
          <Card>
            <CardContent>
              <div className="flex items-center gap-2"><Users size={16} className="text-primary" /><Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">Démonstration</Badge></div>
              <p className="mt-3 text-4xl font-bold tracking-tight">{acteursCoordonnes}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acteurs coordonnés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">Démonstration</Badge>
              <p className="mt-3 text-2xl font-bold tracking-tight">{signauxTraites}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Signaux traités</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">Démonstration</Badge>
              <p className="mt-3 text-2xl font-bold tracking-tight">{territoiresActifs}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Territoires actifs</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Défi 5 — bailleurs */}
      <Card className="flex-row flex-wrap items-center justify-between gap-5 border-none bg-sidebar p-7 text-sidebar-foreground shadow-lg">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Capter l’attention des bailleurs</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Un rapport d’impact prêt à partager.</h2>
          <p className="mt-2 max-w-xl text-sm text-sidebar-foreground/65">Structuré par territoire, exportable, pensé pour vos propres échanges avec les bailleurs et programmes.</p>
        </div>
        <Button asChild><Link href="/app/etat/rapport"><FileDown /> Ouvrir le rapport bailleurs</Link></Button>
      </Card>

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

function TerritoryDetail({ territory, cases }: { territory: Territory; cases: VigilanceCase[] }) {
  const { state } = useProduct();
  if (!state) return null;
  const sites = state.sites.filter((item) => item.territoryId === territory.id);
  const infrastructures = state.infrastructures.filter((item) => item.territoryId === territory.id);
  const fragile = infrastructures.filter((item) => item.status !== "operationnelle");
  return (
    <div className="space-y-6 px-4">
      <StatusBadge status={territory.activity} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Localisation</p>
        <p className="mt-1 text-sm">{territory.region}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Infrastructures</p>
        <p className="mt-1 text-sm">{sites.length} site(s) · {infrastructures.length} infrastructure(s), dont {fragile.length} fragile(s) ou indisponible(s).</p>
      </div>
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
