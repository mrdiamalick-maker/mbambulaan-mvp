"use client";

// LOT V3.5 ("Programme Portfolio & Cockpit") — le dossier programme
// devient un poste de pilotage à divulgation progressive (mandat §6/§18 :
// "avoid title → paragraphs → cards → paragraphs", "reduce text"), pas un
// scroll vertical d'une douzaine de sections pleine largeur. Reprend TOUT
// le contenu réel déjà construit (mandat §21, "ne pas reconstruire") —
// origine du programme (traceInitiativeOrigin, P2.5-A), mobilisation
// d'écosystème (findProgrammeCapabilityCandidates/engagementsForInitiative,
// P2.5-B), Résultat/Changement/Impact/Apprentissage (LOT 4) — réorganisé
// en 5 onglets plutôt qu'empilé, plus 2 apports réels de ce lot : la
// santé du programme (programmeHealth) et "ce que l'écosystème dit"
// (programmeEcosystem), tous deux dans domain/programme-intelligence.ts.
//
// `canAct` (mandat §21, "Executive/State" vs "Operational/Coordination")
// distingue la PROFONDEUR D'ACTION par espace, pas seulement par
// permission serveur : l'Espace État ne montre jamais les gestes
// d'exécution (transition de statut, mobilisation, enregistrement de
// résultat/impact) même quand le rôle qui l'atteint (institution) les
// porte techniquement (server/permissions.ts) — un choix de présentation
// explicite, pas un oubli. Quand `canAct` est vrai, chaque geste reste en
// plus gardé par canRole comme aujourd'hui (jamais relâché par ce lot).
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Banknote, CircleDollarSign, Flag, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusChip } from "@/components/private/primitives";
import { ResultForm } from "@/components/impact/ResultForm";
import { OutcomeForm } from "@/components/impact/OutcomeForm";
import { ImpactForm } from "@/components/impact/ImpactForm";
import { LearningForm } from "@/components/impact/LearningForm";
import { TrustBadge } from "@/components/shared/StatusBadges";
import type { CommandInput, Funding, Initiative, Outcome, PartnerService, ProductState, ProgrammeOrganizationEngagementStatus, Role } from "@/domain/types";
import {
  attributionLevelLabels,
  collectiveNeedStatusLabels,
  impactStatusLabels,
  programOpportunityStatusLabels,
  programmeOrganizationEngagementRoleLabels,
  programmeOrganizationEngagementStatusLabels,
  serviceRequestIntentLabels,
  verificationStatusLabels
} from "@/domain/types";
import { engagementsForInitiative, findProgrammeCapabilityCandidates } from "@/domain/programme-mobilization";
import { programmeResultChain } from "@/domain/results-analytics";
import {
  programmeEcosystem,
  programmeHealth,
  programmeHealthLabel,
  programmeMilestones,
  traceInitiativeOrigin,
  type ProgrammeHealthState
} from "@/domain/programme-intelligence";
import { canRole } from "@/server/permissions";

const money = new Intl.NumberFormat("fr-FR", { notation: "compact", style: "currency", currency: "XOF", maximumFractionDigits: 0 });

const initiativeStatusLabel: Record<Initiative["status"], string> = {
  cadrage: "Cadrage",
  financee: "Financée",
  execution: "Exécution",
  terminee: "Terminée"
};
const initiativeStatusVariant: Record<Initiative["status"], "marine" | "amber" | "success"> = {
  cadrage: "marine",
  financee: "amber",
  execution: "amber",
  terminee: "success"
};
const fundingStatusLabel: Record<Funding["status"], string> = {
  a_mobiliser: "À mobiliser",
  en_instruction: "En instruction",
  confirme: "Confirmé"
};
const fundingStatusVariant: Record<Funding["status"], "marine" | "amber" | "success"> = {
  a_mobiliser: "marine",
  en_instruction: "amber",
  confirme: "success"
};
// budget simulé à titre indicatif (arbitrage CEO 13/08/2026, repris tel
// quel des deux pages précédentes) : "valide" ne signifie jamais "chiffre
// Ministère officiel", même discipline que Landing/FishingTrip.source
// ailleurs dans le Produit.
const budgetStatusCaption: Record<Initiative["budgetStatus"], string> = {
  a_estimer: "budget non encore chiffré",
  estime: "budget estimé, à confirmer",
  valide: "budget simulé à titre indicatif"
};
const healthTone: Record<ProgrammeHealthState, "success" | "warning" | "critical"> = {
  aligne: "success",
  attention: "warning",
  critique: "critical"
};
const capabilityCategoryLabel: Record<PartnerService["category"], string> = {
  logistique: "Logistique / transport",
  froid: "Froid",
  maintenance: "Maintenance",
  financement: "Financement",
  assurance: "Assurance"
};
const engagementStatusVariant: Record<ProgrammeOrganizationEngagementStatus, "marine" | "amber" | "success" | "outline"> = {
  considered: "outline",
  contacted: "marine",
  engaged: "success",
  declined: "outline"
};
function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

type InitiativeTransition = { status: Exclude<Initiative["status"], "cadrage">; label: string };
function nextInitiativeTransitionFor(status: Initiative["status"]): InitiativeTransition | undefined {
  switch (status) {
    case "cadrage": return { status: "financee", label: "Confirmer le financement" };
    case "financee": return { status: "execution", label: "Démarrer l'exécution" };
    case "execution": return { status: "terminee", label: "Clore le programme" };
    case "terminee": return undefined;
  }
}

export function ProgrammeCockpit({
  initiative,
  state,
  role,
  run,
  canAct,
  onOpenOpportunity
}: {
  initiative: Initiative;
  state: ProductState;
  role: Role;
  run: (command: CommandInput) => Promise<unknown>;
  canAct: boolean;
  onOpenOpportunity?: (id: string) => void;
}) {
  const owner = state.actors.find((item) => item.id === initiative.ownerId);
  const ownerOrganization = owner ? state.organizations.find((item) => item.id === owner.organizationId) : undefined;
  const secured = initiative.funding.filter((item) => item.status === "confirme").reduce((sum, item) => sum + item.amountFcfa, 0);
  const instructed = initiative.funding.filter((item) => item.status === "en_instruction").reduce((sum, item) => sum + item.amountFcfa, 0);

  const health = programmeHealth(state, initiative);
  const ecosystem = programmeEcosystem(state, initiative);
  const milestones = programmeMilestones(state, initiative);
  const origin = traceInitiativeOrigin(state, initiative);

  // LOT V3.6 — même chaîne Résultat→Changement→Impact→Apprentissage
  // qu'avant (V3.5), désormais calculée une seule fois par
  // programmeResultChain (domain/results-analytics.ts) plutôt que
  // recalculée ici — mandat §22/§23, "share read models" : le module
  // d'analytique national (ResultsAnalyticsOverview) l'utilise pour la
  // distribution par programme, ce cockpit pour son propre onglet
  // Résultats. Mêmes noms de variable qu'avant, aucun autre changement.
  const { results: initiativeResults, outcomes: initiativeOutcomes, impacts: initiativeImpacts, learnings: initiativeLearnings } = programmeResultChain(state, initiative);
  const outcomesWithoutImpact = initiativeOutcomes.filter((outcome) => !initiativeImpacts.some((impact) => impact.outcomeId === outcome.id));

  const [resultFormOpen, setResultFormOpen] = useState(false);
  const [outcomeFormOpen, setOutcomeFormOpen] = useState(false);
  const [learningFormOpen, setLearningFormOpen] = useState(false);
  const [impactFormOutcome, setImpactFormOutcome] = useState<Outcome | null>(null);
  const [transitionPending, setTransitionPending] = useState(false);
  const [candidateCapability, setCandidateCapability] = useState<PartnerService["category"] | "">("");
  const [consideringOrganizationId, setConsideringOrganizationId] = useState<string | null>(null);
  const [engagementPendingId, setEngagementPendingId] = useState<string | null>(null);
  const [selectedRepresentatives, setSelectedRepresentatives] = useState<Record<string, string>>({});

  const canTransition = canAct && canRole(role, "update_initiative_status");
  const nextTransition = nextInitiativeTransitionFor(initiative.status);
  const canMobilize = canAct && canRole(role, "create_programme_organization_engagement");
  const canTransitionEngagement = canAct && canRole(role, "update_programme_organization_engagement_status");
  const candidates = candidateCapability ? findProgrammeCapabilityCandidates(state, initiative, candidateCapability) : [];
  const engagements = engagementsForInitiative(state, initiative.id);

  const transitionInitiative = async () => {
    if (!nextTransition) return;
    setTransitionPending(true);
    try {
      await run({ type: "update_initiative_status", initiativeId: initiative.id, status: nextTransition.status });
    } finally {
      setTransitionPending(false);
    }
  };

  const considerCandidate = async (organizationId: string) => {
    if (!candidateCapability) return;
    const engagementRole = candidateCapability === "financement" ? "funder" : "implementer";
    const representativeActorId = selectedRepresentatives[organizationId] || undefined;
    setConsideringOrganizationId(organizationId);
    try {
      await run({ type: "create_programme_organization_engagement", initiativeId: initiative.id, organizationId, role: engagementRole, capabilityCategory: candidateCapability, representativeActorId });
    } finally {
      setConsideringOrganizationId(null);
    }
  };

  const transitionEngagement = async (engagementId: string, status: Exclude<ProgrammeOrganizationEngagementStatus, "considered">) => {
    setEngagementPendingId(engagementId);
    try {
      await run({ type: "update_programme_organization_engagement_status", engagementId, status });
    } finally {
      setEngagementPendingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Hero — identité + santé, toujours visible (mandat §6, "WHAT IS
          THIS PROGRAMME? IS IT HEALTHY?" en premier niveau). */}
      <div className="rounded-2xl border bg-sidebar p-5 text-sidebar-foreground lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/60">Programme · {initiative.territoryIds.length} territoire(s)</p>
            <h2 className="mt-2 max-w-2xl text-xl font-semibold tracking-tight">{initiative.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-sidebar-foreground/70">{initiative.objective}</p>
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-sidebar-foreground/70">
              {initiative.territoryIds.map((tid, index) => {
                const territory = state.territories.find((item) => item.id === tid);
                if (!territory) return null;
                return (
                  <span key={tid}>
                    <Link href={`/app/atlas?territoire=${territory.id}`} className="font-semibold text-sidebar-foreground underline decoration-sidebar-foreground/30 underline-offset-2 hover:decoration-sidebar-foreground">{territory.name}</Link>
                    {index < initiative.territoryIds.length - 1 ? " ·" : ""}
                  </span>
                );
              })}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={initiativeStatusVariant[initiative.status]}>{initiativeStatusLabel[initiative.status]}</Badge>
              <StatusChip tone={healthTone[health.state]}>{programmeHealthLabel[health.state]}</StatusChip>
            </div>
            {canTransition && nextTransition && (
              <Button size="sm" disabled={transitionPending} onClick={transitionInitiative}>{transitionPending ? "…" : nextTransition.label}</Button>
            )}
          </div>
        </div>
        {/* Pourquoi cet état de santé — jamais un badge sans justification
            (mandat §4, "always accompanied with explainable reasons"). */}
        <ul className="mt-4 space-y-1 border-t border-sidebar-foreground/10 pt-3">
          {health.reasons.map((reason) => <li key={reason} className="text-xs leading-5 text-sidebar-foreground/70">· {reason}</li>)}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
        <div className="bg-background p-4"><Banknote size={18} className="text-[#1d4468]" /><p className="mt-2 text-xl font-bold">{initiative.budgetFcfa !== undefined ? money.format(initiative.budgetFcfa) : "À estimer"}</p><p className="text-[11px] text-muted-foreground">{budgetStatusCaption[initiative.budgetStatus]}</p></div>
        <div className="bg-background p-4"><CircleDollarSign size={18} className="text-[#1d4468]" /><p className="mt-2 text-xl font-bold">{money.format(secured + instructed)}</p><p className="text-[11px] text-muted-foreground">confirmé ou en instruction</p></div>
        <div className="bg-background p-4"><Flag size={18} className="text-[#1d4468]" /><p className="mt-2 text-xl font-bold">{initiative.territoryIds.length}</p><p className="text-[11px] text-muted-foreground">territoires reliés</p></div>
        <div className="bg-background p-4"><UsersRound size={18} className="text-[#1d4468]" />
          {ownerOrganization ? <Link href={`/app/organisation?organisation=${ownerOrganization.id}`} className="mt-2 block font-bold text-[#1d4468] hover:underline">{owner?.name}</Link> : <p className="mt-2 font-bold">{owner?.name}</p>}
          <p className="text-[11px] text-muted-foreground">responsable{ownerOrganization ? ` · ${ownerOrganization.name}` : ""}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="gap-4">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="overview">Vue d’ensemble</TabsTrigger>
          <TabsTrigger value="trajectory">Trajectoire</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="ecosystem">Écosystème</TabsTrigger>
          <TabsTrigger value="results">Résultats</TabsTrigger>
        </TabsList>

        {/* VUE D'ENSEMBLE — le prochain jalon + un résumé écosystème
            compact (mandat §6, "WHAT IS NEXT? WHAT IS AT RISK?"). */}
        <TabsContent value="overview" className="space-y-4">
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Prochain jalon</p>
            {milestones[0] ? (
              <div className="mt-2 rounded-lg border p-3">
                <p className="text-sm font-semibold">{milestones[0].detail}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(milestones[0].at)}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Aucun jalon documenté pour le moment.</p>
            )}
          </section>
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce que l’écosystème dit</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Signaux opérationnels réels sur les territoires de ce programme — jamais une causalité affirmée envers le programme lui-même.</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border p-3"><p className="text-lg font-bold">{ecosystem.openSituations.length}</p><p className="text-[11px] text-muted-foreground">situation(s) ouverte(s){ecosystem.criticalOpenSituations > 0 ? `, dont ${ecosystem.criticalOpenSituations} critique(s)` : ""}</p></div>
              <div className="rounded-lg border p-3"><p className="text-lg font-bold">{ecosystem.unresolvedFindings.length}</p><p className="text-[11px] text-muted-foreground">constat(s) non résolu(s)</p></div>
              <div className="rounded-lg border p-3"><p className="text-lg font-bold">{ecosystem.fragileInfrastructureCount}</p><p className="text-[11px] text-muted-foreground">infrastructure(s) fragile(s)</p></div>
            </div>
          </section>
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Progression vers les résultats</p>
            <div className="mt-3 space-y-4">
              {initiative.indicators.map((indicator) => {
                const progress = Math.min(100, Math.round((indicator.current / indicator.target) * 100));
                return (
                  <div key={indicator.label}>
                    <div className="flex justify-between gap-4 text-sm"><span className="font-semibold">{indicator.label}</span><strong>{indicator.current}{indicator.unit} / {indicator.target}{indicator.unit}</strong></div>
                    <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-[#1d4468]" style={{ width: `${progress}%` }} /></div>
                    <p className="mt-1 text-xs text-muted-foreground">Référence initiale : {indicator.baseline}{indicator.unit}</p>
                  </div>
                );
              })}
              {initiative.indicators.length === 0 && <p className="text-sm text-muted-foreground">Aucun indicateur défini pour le moment — programme en cadrage.</p>}
            </div>
          </section>
        </TabsContent>

        {/* TRAJECTOIRE — origine administrative + jalons chronologiques
            (mandat §7, "ADMINISTRATIVE TRAJECTORY"). */}
        <TabsContent value="trajectory" className="space-y-4">
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pourquoi ce programme existe</p>
            {origin.kind === "program_opportunity" && origin.programOpportunity ? (
              <div className="mt-3 space-y-3">
                <button
                  onClick={() => onOpenOpportunity?.(origin.programOpportunity!.id)}
                  disabled={!onOpenOpportunity}
                  className="flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left text-sm transition hover:bg-muted disabled:cursor-default disabled:hover:bg-transparent"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{origin.programOpportunity.problem}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">Opportunité de programme · {programOpportunityStatusLabels[origin.programOpportunity.status]}</span>
                  </span>
                  {onOpenOpportunity && <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#1d4468]">Ouvrir l’opportunité <ArrowRight size={13} /></span>}
                </button>
                {origin.collectiveNeed && (
                  <div className="rounded-lg border border-dashed p-3">
                    <p className="text-xs font-semibold">{origin.collectiveNeed.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Besoin collectif d’origine · {collectiveNeedStatusLabels[origin.collectiveNeed.status]}</p>
                  </div>
                )}
                {origin.collectiveNeedSources.length > 0 && (
                  <ul className="space-y-1">
                    {origin.collectiveNeedSources.map((item) => (
                      <li key={`${item.ref.objectType}-${item.ref.objectId}`} className="text-xs leading-4"><span className="font-semibold">{item.label}</span>{item.detail ? <span className="text-muted-foreground"> — {item.detail}</span> : null}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : origin.kind === "grouped_service_requests" ? (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground">Constitué en regroupant {origin.serviceRequests.length} demandes de service de même intention :</p>
                <ul className="space-y-1">{origin.serviceRequests.map((request) => <li key={request.id} className="text-xs leading-4"><span className="font-semibold">{request.reference}</span> — {serviceRequestIntentLabels[request.intent]}</li>)}</ul>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Programme antérieur à la traçabilité structurée de l’origine — non reconstitué.</p>
            )}
          </section>
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Jalons</p>
            {milestones.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Aucun jalon opérationnel documenté pour ce programme à ce stade.</p>
            ) : (
              <ol className="mt-3 space-y-3 border-l pl-4">
                {milestones.map((milestone) => (
                  <li key={milestone.id}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{milestone.label} · {formatDate(milestone.at)}</p>
                    <p className="text-sm">{milestone.detail}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </TabsContent>

        {/* BUDGET — mandat §5 : utile, jamais dominant, jamais présenté
            comme une dépense Ministère réelle (funding[] = Demo World,
            cf. domain/programme-intelligence.ts en tête de fichier). */}
        <TabsContent value="budget" className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border p-3"><p className="text-lg font-bold">{initiative.budgetFcfa !== undefined ? money.format(initiative.budgetFcfa) : "À estimer"}</p><p className="text-[11px] text-muted-foreground">{budgetStatusCaption[initiative.budgetStatus]}</p></div>
            <div className="rounded-lg border p-3"><p className="text-lg font-bold">{money.format(secured)}</p><p className="text-[11px] text-muted-foreground">confirmé (illustratif)</p></div>
            <div className="rounded-lg border p-3"><p className="text-lg font-bold">{money.format(instructed)}</p><p className="text-[11px] text-muted-foreground">en instruction (illustratif)</p></div>
          </div>
          <div className="divide-y border-y">
            {initiative.funding.map((fund) => {
              const partner = state.actors.find((item) => item.id === fund.partnerId);
              const partnerOrganization = partner ? state.organizations.find((item) => item.id === partner.organizationId) : undefined;
              return (
                <div key={fund.id} className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    {partnerOrganization ? <Link href={`/app/organisation?organisation=${partnerOrganization.id}`} className="text-sm font-bold text-[#1d4468] hover:underline">{partner?.name}</Link> : <strong className="text-sm">{partner?.name}</strong>}
                    <Badge variant={fundingStatusVariant[fund.status]}>{fundingStatusLabel[fund.status]}</Badge>
                  </div>
                  <p className="mt-2 text-lg font-bold">{money.format(fund.amountFcfa)}</p>
                  <p className="mt-2 text-sm leading-5 text-muted-foreground">{fund.condition}</p>
                </div>
              );
            })}
            {initiative.funding.length === 0 && <p className="py-4 text-sm text-muted-foreground">Aucun financement engagé pour le moment.</p>}
          </div>
          {initiative.funding.length > 0 && (
            <p className="text-[11px] leading-4 text-muted-foreground">Financements présentés à titre illustratif — le domaine ne trace pas encore d’engagement financier réel piloté par un geste humain (mandat V3.5, dette documentée dans le rapport de lot).</p>
          )}
        </TabsContent>

        {/* ÉCOSYSTÈME — signaux opérationnels réels + mobilisation de
            partenaires réelle (P2.5-B), jamais fondus ensemble : la
            section "ce que l'écosystème dit" reste en lecture seule (même
            hors canAct), la mobilisation reste gardée par canAct+canRole. */}
        <TabsContent value="ecosystem" className="space-y-5">
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Situations ouvertes sur les territoires du programme</p>
            <div className="mt-3 space-y-2">
              {ecosystem.openSituations.map((situation) => {
                const territory = state.territories.find((item) => item.id === situation.territoryId);
                return (
                  <Link key={situation.id} href={`/app/situations/${situation.id}`} className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3 text-sm transition hover:bg-muted">
                    <span className="min-w-0"><span className="block truncate font-semibold">{situation.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{territory?.name ?? situation.territoryId}</span></span>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#1d4468]">Ouvrir <ArrowRight size={13} /></span>
                  </Link>
                );
              })}
              {ecosystem.openSituations.length === 0 && <p className="text-sm text-muted-foreground">Aucune situation ouverte sur les territoires de ce programme pour le moment.</p>}
            </div>
          </section>

          {canAct && (
            <section className="border-t pt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mobiliser l’écosystème — qui peut contribuer ?</p>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">Une capacité déclarée dans le réseau n’est jamais une organisation déjà engagée — chaque étape reste un geste humain distinct, tracé.</p>
              <label className="mt-4 block text-xs font-semibold text-muted-foreground">
                Quelle capacité ce programme recherche-t-il ?
                <select value={candidateCapability} onChange={(event) => setCandidateCapability(event.target.value as PartnerService["category"] | "")} className="mt-1.5 h-10 w-full max-w-xs rounded-md border bg-background px-3 text-sm font-semibold text-foreground">
                  <option value="">Choisir une capacité…</option>
                  {Object.entries(capabilityCategoryLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              {candidateCapability && (
                <div className="mt-4 space-y-3">
                  {candidates.length === 0 && <p className="text-sm text-muted-foreground">Aucune organisation du réseau ne déclare « {capabilityCategoryLabel[candidateCapability]} » sur un territoire de ce programme pour le moment.</p>}
                  {candidates.map((candidate) => {
                    const existingEngagement = engagements.find((item) => item.organizationId === candidate.organization.id && item.capabilityCategory === candidateCapability);
                    const matchingTerritories = candidate.matchingTerritoryIds.map((tid) => state.territories.find((item) => item.id === tid)?.name ?? tid).join(", ");
                    return (
                      <div key={candidate.organization.id} className="rounded-lg border p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link href={`/app/organisation?organisation=${candidate.organization.id}`} className="text-sm font-bold text-[#1d4468] hover:underline">{candidate.organization.name}</Link>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">Pourquoi cette organisation ? Fournit « {capabilityCategoryLabel[candidateCapability]} », couvre {matchingTerritories}, capacité {candidate.partnerService.status === "qualifie" ? "qualifiée" : candidate.partnerService.status === "a_activer" ? "à activer" : "référencée"}.</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{candidate.representatives.length > 0 ? `Représentant${candidate.representatives.length > 1 ? "s" : ""} connu${candidate.representatives.length > 1 ? "s" : ""} : ${candidate.representatives.map((item) => `${item.actor?.name ?? "Acteur introuvable"} — ${verificationStatusLabels[item.relationship.verificationStatus]}`).join(", ")}` : "Représentant documenté non identifié."}</p>
                          </div>
                          <TrustBadge trust={candidate.partnerService.trust} />
                        </div>
                        {!existingEngagement && candidate.representatives.length > 0 && (
                          <label className="mt-3 block text-xs font-semibold text-muted-foreground">
                            Représentant pour cette mobilisation (facultatif)
                            <select value={selectedRepresentatives[candidate.organization.id] ?? ""} onChange={(event) => setSelectedRepresentatives((prev) => ({ ...prev, [candidate.organization.id]: event.target.value }))} className="mt-1.5 h-9 w-full max-w-xs rounded-md border bg-background px-3 text-xs font-semibold text-foreground">
                              <option value="">Aucun représentant associé</option>
                              {candidate.representatives.map((item) => <option key={item.relationship.id} value={item.relationship.actorId}>{item.actor?.name ?? "Acteur introuvable"} — {verificationStatusLabels[item.relationship.verificationStatus]}</option>)}
                            </select>
                          </label>
                        )}
                        <div className="mt-3">
                          {existingEngagement ? (
                            <Badge variant={engagementStatusVariant[existingEngagement.status]}>{programmeOrganizationEngagementStatusLabels[existingEngagement.status]}</Badge>
                          ) : canMobilize ? (
                            <Button size="sm" variant="outline" disabled={consideringOrganizationId === candidate.organization.id} onClick={() => considerCandidate(candidate.organization.id)}>{consideringOrganizationId === candidate.organization.id ? "…" : "Considérer"}</Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          <section className={canAct ? "border-t pt-5" : ""}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Organisations mobilisées</p>
            {engagements.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Aucune organisation mobilisée pour ce programme à ce stade.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {engagements.map((engagement) => {
                  const organization = state.organizations.find((item) => item.id === engagement.organizationId);
                  const representative = engagement.representativeActorId ? state.actors.find((item) => item.id === engagement.representativeActorId) : undefined;
                  return (
                    <div key={engagement.id} className="rounded-lg border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{organization?.name ?? "Organisation introuvable"}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{programmeOrganizationEngagementRoleLabels[engagement.role]}{engagement.capabilityCategory ? ` · ${capabilityCategoryLabel[engagement.capabilityCategory]}` : ""}{representative ? ` · Représentant·e : ${representative.name}` : ""}</p>
                        </div>
                        <Badge variant={engagementStatusVariant[engagement.status]}>{programmeOrganizationEngagementStatusLabels[engagement.status]}</Badge>
                      </div>
                      {engagement.note && <p className="mt-1.5 text-xs leading-4 text-muted-foreground">{engagement.note}</p>}
                      <p className="mt-1.5 text-[11px] text-muted-foreground">Dernière évolution : {formatDate(engagement.updatedAt ?? engagement.createdAt)}</p>
                      {canTransitionEngagement && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {engagement.status === "considered" && <Button size="sm" variant="outline" disabled={engagementPendingId === engagement.id} onClick={() => transitionEngagement(engagement.id, "contacted")}>{engagementPendingId === engagement.id ? "…" : "Marquer comme contactée"}</Button>}
                          {engagement.status === "contacted" && (
                            <>
                              <Button size="sm" disabled={engagementPendingId === engagement.id} onClick={() => transitionEngagement(engagement.id, "engaged")}>{engagementPendingId === engagement.id ? "…" : "Confirmer la participation"}</Button>
                              <Button size="sm" variant="ghost" className="text-muted-foreground" disabled={engagementPendingId === engagement.id} onClick={() => transitionEngagement(engagement.id, "declined")}>Décliner</Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </TabsContent>

        {/* RÉSULTATS — Result/Outcome/Impact/Learning (LOT 4), inchangés. */}
        <TabsContent value="results" className="space-y-5">
          <section>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce qui a été réalisé</p>
              {canAct && <button onClick={() => setResultFormOpen(true)} className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#1d4468] hover:text-[#1d4468]/70">Enregistrer un résultat <ArrowRight size={13} /></button>}
            </div>
            {initiativeResults.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Aucun résultat enregistré pour ce programme à ce stade.</p> : (
              <div className="mt-3 space-y-2">{initiativeResults.map((result) => <div key={result.id} className="rounded-lg border p-3"><p className="text-sm font-semibold">{result.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{result.description}</p></div>)}</div>
            )}
          </section>

          <section className="border-t pt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce qui a changé</p>
              {canAct && <button onClick={() => setOutcomeFormOpen(true)} disabled={initiativeResults.length === 0} className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#1d4468] hover:text-[#1d4468]/70 disabled:cursor-not-allowed disabled:opacity-40">Documenter un changement <ArrowRight size={13} /></button>}
            </div>
            {initiativeOutcomes.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Effet opérationnel à confirmer — aucun changement documenté pour le moment.</p> : (
              <div className="mt-3 space-y-3">
                {initiativeOutcomes.map((outcome) => (
                  <div key={outcome.id} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{outcome.title}</p><Badge variant="outline">{attributionLevelLabels[outcome.attribution]}</Badge></div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{outcome.statement}</p>
                    {outcome.attributionJustification && <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground"><span className="font-semibold text-foreground">Justification · </span>{outcome.attributionJustification}</p>}
                    {outcome.limits && <p className="mt-1 text-[11px] leading-4 text-muted-foreground"><span className="font-semibold text-foreground">Limites · </span>{outcome.limits}</p>}
                    <p className="mt-1.5 text-[11px] text-muted-foreground">{outcome.baseline ?? "Baseline insuffisante pour mesurer précisément l’évolution."}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="border-t pt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce qui reste à mesurer</p>
            {initiativeOutcomes.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Impact non encore mesuré — aucun changement documenté ne permet pour l’instant d’évaluer un effet plus large.</p> : outcomesWithoutImpact.length === 0 && initiativeImpacts.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Impact non encore mesuré pour les changements documentés.</p> : (
              <div className="mt-3 space-y-2">
                {initiativeImpacts.map((impact) => (
                  <div key={impact.id} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{impact.title}</p><Badge variant="outline">{impactStatusLabels[impact.status]}</Badge></div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{impact.statement}</p>
                    {impact.attributionJustification && <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground"><span className="font-semibold text-foreground">Justification · </span>{impact.attributionJustification}</p>}
                  </div>
                ))}
                {canAct && outcomesWithoutImpact.map((outcome) => (
                  <div key={outcome.id} className="flex items-center justify-between gap-3 rounded-lg border border-dashed p-3">
                    <p className="text-xs text-muted-foreground">Impact non encore mesuré pour « {outcome.title} ».</p>
                    <button onClick={() => setImpactFormOutcome(outcome)} className="shrink-0 text-xs font-bold text-[#1d4468] hover:text-[#1d4468]/70">Renseigner</button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="border-t pt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce que nous apprenons</p>
              {canAct && <button onClick={() => setLearningFormOpen(true)} className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#1d4468] hover:text-[#1d4468]/70">Enregistrer un apprentissage <ArrowRight size={13} /></button>}
            </div>
            {initiativeLearnings.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Aucun apprentissage enregistré pour ce programme à ce stade.</p> : (
              <div className="mt-3 space-y-2">{initiativeLearnings.map((learning) => <div key={learning.id} className="rounded-lg border p-3"><p className="text-sm font-semibold">{learning.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{learning.summary}</p></div>)}</div>
            )}
          </section>
        </TabsContent>
      </Tabs>

      {canAct && (
        <>
          <Sheet open={resultFormOpen} onOpenChange={setResultFormOpen}>
            <SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>Enregistrer un résultat</SheetTitle><SheetDescription>Ce qui a effectivement été produit ou réalisé pour ce programme.</SheetDescription></SheetHeader><ResultForm initiativeId={initiative.id} onDone={() => setResultFormOpen(false)} onCancel={() => setResultFormOpen(false)} /></SheetContent>
          </Sheet>
          <Sheet open={outcomeFormOpen} onOpenChange={setOutcomeFormOpen}>
            <SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>Documenter le changement observé</SheetTitle><SheetDescription>Une activité réalisée n’est pas un changement en soi — décrivez ce qui a réellement évolué, avec son niveau d’attribution.</SheetDescription></SheetHeader>{initiativeResults.length > 0 && <OutcomeForm results={initiativeResults} onDone={() => setOutcomeFormOpen(false)} onCancel={() => setOutcomeFormOpen(false)} />}</SheetContent>
          </Sheet>
          <Sheet open={impactFormOutcome !== null} onOpenChange={(open) => !open && setImpactFormOutcome(null)}>
            <SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>Impact</SheetTitle><SheetDescription>« À mesurer » reste un état honnête — ne jamais extrapoler un changement local en effet national.</SheetDescription></SheetHeader>{impactFormOutcome && <ImpactForm outcome={impactFormOutcome} onDone={() => setImpactFormOutcome(null)} onCancel={() => setImpactFormOutcome(null)} />}</SheetContent>
          </Sheet>
          <Sheet open={learningFormOpen} onOpenChange={setLearningFormOpen}>
            <SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>Enregistrer un apprentissage</SheetTitle><SheetDescription>Que devons-nous faire différemment ou réutiliser ailleurs ?</SheetDescription></SheetHeader><LearningForm initiativeId={initiative.id} onDone={() => setLearningFormOpen(false)} onCancel={() => setLearningFormOpen(false)} /></SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}
