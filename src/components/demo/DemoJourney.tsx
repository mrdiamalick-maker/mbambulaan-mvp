"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import { computeIntelligentAlerts } from "@/lib/alerts";
import { computeMatching } from "@/lib/coordination";
import type { DemoJourney as DemoJourneyData } from "@/lib/demo";
import { computeImpactMetrics } from "@/lib/impact";
import { computePrioritizationMetrics, getPriorityTone } from "@/lib/prioritization";
import { computeSensitiveLots } from "@/lib/quality";
import { createCoordinationSimulation, coordinationSimulationStorageKey } from "@/lib/simulation";
import type { CoordinationSimulation } from "@/lib/simulation";
import { computeTensionMetrics } from "@/lib/tension";
import { computeTraceability } from "@/lib/traceability";
import { Button } from "@/components/ui/Button";
import { InsightPanel } from "@/components/ui/InsightPanel";
import { MetricCard } from "@/components/ui/MetricCard";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { PageShell } from "@/components/ui/PageShell";
import { StatusBadge as UiStatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

type SensitiveLot = ReturnType<typeof computeSensitiveLots>[number];
type TraceableLot = ReturnType<typeof computeTraceability>[number];

type FlowStep = {
  id: number;
  title: string;
  data: string;
  href: string;
};

export function DemoJourney({ arrivages, besoins, journey }: { arrivages: Arrivage[]; besoins: Besoin[]; journey: DemoJourneyData }) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [demoLaunched, setDemoLaunched] = useState(false);
  const [simulation, setSimulation] = useState<CoordinationSimulation | null>(null);
  const baseOpportunites = useMemo(() => computeMatching(arrivages, besoins), [arrivages, besoins]);
  const allArrivages = useMemo(() => (simulation ? [...simulation.arrivages, ...arrivages] : arrivages), [arrivages, simulation]);
  const allBesoins = useMemo(() => (simulation ? [...simulation.besoins, ...besoins] : besoins), [besoins, simulation]);
  const opportunites = simulation?.opportunites ?? baseOpportunites;
  const transactions = simulation?.transactions ?? [];
  const notifications = simulation?.notifications ?? [];
  const impact = useMemo(() => computeImpactMetrics(allArrivages, allBesoins, opportunites, transactions), [allArrivages, allBesoins, opportunites, transactions]);
  const tensions = useMemo(() => computeTensionMetrics(allArrivages, allBesoins, opportunites, transactions), [allArrivages, allBesoins, opportunites, transactions]);
  const priorities = useMemo(() => computePrioritizationMetrics(allArrivages, allBesoins, opportunites, transactions), [allArrivages, allBesoins, opportunites, transactions]);
  const alertes = useMemo(() => computeIntelligentAlerts(allArrivages, allBesoins, opportunites, transactions, notifications), [allArrivages, allBesoins, opportunites, transactions, notifications]);
  const lotsSuivis = useMemo(() => computeTraceability(allArrivages, opportunites, transactions, notifications), [allArrivages, opportunites, transactions, notifications]);
  const sensitiveLots = useMemo(() => computeSensitiveLots(allArrivages, { besoins: allBesoins, opportunites, transactions }), [allArrivages, allBesoins, opportunites, transactions]);
  const lotSuivi = lotsSuivis[0];
  const lotSensible = sensitiveLots[0];
  const decision = priorities.actionsPrioritaires[0];
  const zonePrioritaire = tensions.zonesPrioritaires[0];
  const activeAlert = alertes[0];
  const flowSteps = buildFlowSteps(journey, {
    impact,
    priorityTitle: decision?.titre,
    transactionStatus: transactions[0]?.statut
  });

  useEffect(() => {
    if (!demoLaunched || visibleSteps >= flowSteps.length) return;

    const timer = window.setTimeout(() => setVisibleSteps((current) => Math.min(current + 1, flowSteps.length)), 480);

    return () => window.clearTimeout(timer);
  }, [demoLaunched, flowSteps.length, visibleSteps]);

  function launchDemo() {
    const nextSimulation = createCoordinationSimulation(arrivages, besoins);
    window.localStorage.setItem(coordinationSimulationStorageKey, JSON.stringify(nextSimulation));
    setSimulation(nextSimulation);
    setDemoLaunched(true);
    setVisibleSteps(1);
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl">
        <DemoNav />

        <section className="mt-5 rounded-3xl border border-[#14312d]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
            <div className="flex flex-col justify-between gap-5">
              <div>
                <UiStatusBadge tone={demoLaunched ? "success" : "neutral"}>{demoLaunched ? "Après : filière coordonnée" : "Avant : informations dispersées"}</UiStatusBadge>
                <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">Démonstration Mbàmbulaan</h1>
                <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[#14312d]/68">
                  Suivez un lot depuis le quai jusqu’à l’impact : qui agit, ce qui change et quelle décision devient possible.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <StatePanel active={!demoLaunched} title="Avant Mbàmbulaan" points={beforePoints} tone="neutral" />
                <StatePanel active={demoLaunched} title="Après Mbàmbulaan" points={afterPoints} tone="success" />
              </div>

              <Button onClick={launchDemo} className="w-full">
                {demoLaunched ? "Relancer la démonstration" : "Lancer la démonstration"}
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <LotCenterCard demoLaunched={demoLaunched} lotQualifie={lotSensible} lotSuivi={lotSuivi} />
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricCard label="Volume valorisé" value={demoLaunched ? impact.volumeValorise : "Non relié"} tone={demoLaunched ? "success" : "warm"} size="compact" />
                  <MetricCard label="Poisson sauvé" value={demoLaunched ? impact.poissonSauve : "À risque"} tone={demoLaunched ? "success" : "warm"} size="compact" />
                  <MetricCard label="Couverture" value={demoLaunched ? `${journey.finalSummary.couverture}%` : "Non visible"} tone={demoLaunched ? "info" : "warm"} size="compact" />
                  <MetricCard label="Décision" value={demoLaunched ? "Priorisée" : "Informelle"} tone={demoLaunched ? "info" : "warm"} size="compact" />
                </div>
                <DecisionCard alertTitle={activeAlert?.titre} decisionTitle={decision?.titre} priority={decision?.priorite} zone={zonePrioritaire?.quai} active={demoLaunched} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-[#14312d]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d65a31]">Flux métier</p>
              <h2 className="mt-2 text-2xl font-black">Pêcheur → Décision</h2>
            </div>
            <UiStatusBadge tone={demoLaunched ? "info" : "neutral"}>{demoLaunched ? "modules actifs" : "modules non connectés"}</UiStatusBadge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {flowSteps.map((step) => (
              <FlowCard key={step.id} demoLaunched={demoLaunched} isActive={visibleSteps === step.id} isDone={visibleSteps > step.id} step={step} />
            ))}
          </div>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <InsightPanel eyebrow="Parties prenantes" title="Chaque acteur sait quoi faire">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-1">
              {actorCards.map((actor) => (
                <ActorCard key={actor.role} actor={actor} active={demoLaunched} />
              ))}
            </div>
          </InsightPanel>

          <InsightPanel eyebrow="Écosystème numérique" title="Des modules connectés autour du lot">
            <EcosystemModules active={demoLaunched} />
          </InsightPanel>
        </section>

        <section className="mt-4 rounded-3xl bg-[#14312d] p-5 text-white sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div>
              <UiStatusBadge tone="impact">Synthèse</UiStatusBadge>
              <h2 className="mt-3 text-2xl font-black">Mbàmbulaan démontre une coordination utile.</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-5">
              {summaryPoints.map((point) => (
                <div key={point} className="rounded-2xl bg-white/10 p-3 text-sm font-black ring-1 ring-white/15">
                  {point}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function DemoNav() {
  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-1">
      {moduleLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-black transition ${
            item.href === "/demo" ? "border-[#14312d] bg-[#14312d] text-white" : "border-[#14312d]/12 bg-white text-[#14312d]/70 hover:border-[#14312d]/40"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function StatePanel({ active, points, title, tone }: { active: boolean; points: string[]; title: string; tone: StatusTone }) {
  return (
    <div className={`rounded-2xl border p-4 ${active ? "border-[#14312d]/25 bg-[#f8faf8]" : "border-[#14312d]/8 bg-white text-[#14312d]/58"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-black">{title}</p>
        <UiStatusBadge tone={active ? tone : "neutral"}>{active ? "visible" : "référence"}</UiStatusBadge>
      </div>
      <ul className="mt-3 grid gap-2">
        {points.map((point) => (
          <li key={point} className="text-sm font-semibold leading-5">
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LotCenterCard({ demoLaunched, lotQualifie, lotSuivi }: { demoLaunched: boolean; lotQualifie?: SensitiveLot; lotSuivi?: TraceableLot }) {
  return (
    <section className={`rounded-3xl border p-5 shadow-sm ${demoLaunched ? "border-[#95d5b2] bg-[#eef8f1]" : "border-[#14312d]/10 bg-[#f8faf8]"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#d65a31]">Carte centrale du lot</p>
          <h2 className="mt-2 text-2xl font-black">{demoLaunched ? (lotSuivi?.espece ?? lotQualifie?.espece ?? "Lot pilote") : "Lot isolé"}</h2>
          <p className="mt-1 text-sm font-semibold text-[#14312d]/62">{demoLaunched && lotSuivi ? `${lotSuivi.lotId} · ${lotSuivi.quai}` : "Les informations ne circulent pas encore."}</p>
        </div>
        <UiStatusBadge tone={demoLaunched ? "success" : "neutral"}>{demoLaunched ? "coordonné" : "dispersé"}</UiStatusBadge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetricCard label="Quantité" value={demoLaunched ? (lotSuivi?.quantite ?? "Lot mock") : "Inconnue"} size="compact" tone="default" />
        <MetricCard label="Qualité" value={demoLaunched && lotQualifie ? `${lotQualifie.score}/100` : "Non qualifiée"} size="compact" tone="default" />
        <MetricCard label="Statut" value={demoLaunched ? (lotSuivi?.statutActuel ?? "Suivi") : "Non suivi"} size="compact" tone="default" />
        <MetricCard label="Transaction" value={demoLaunched ? (lotSuivi?.transactionLiee?.statut ?? "À créer") : "Absente"} size="compact" tone="default" />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-[#14312d]/8">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">Traçabilité</p>
        <p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/68">
          {demoLaunched
            ? (lotSuivi?.historique.slice(0, 4).map((event) => event.titre).join(" → ") ?? "Arrivage → Opportunité → Réservation → Transaction")
            : "Aucun historique partagé."}
        </p>
      </div>
    </section>
  );
}

function FlowCard({ demoLaunched, isActive, isDone, step }: { demoLaunched: boolean; isActive: boolean; isDone: boolean; step: FlowStep }) {
  const tone: StatusTone = !demoLaunched ? "neutral" : isDone ? "success" : isActive ? "info" : "warning";
  const status = !demoLaunched ? "off" : isDone ? "ok" : isActive ? "actif" : "à venir";

  return (
    <Link
      href={step.href}
      className={`min-h-28 rounded-2xl border p-4 transition ${
        isActive
          ? "border-[#14312d] bg-[#eef6ff] shadow-sm"
          : isDone
            ? "border-[#95d5b2] bg-[#e8f7f2]"
            : "border-[#14312d]/8 bg-[#fbfcfb] hover:border-[#14312d]/28"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#14312d] text-xs font-black text-white">{step.id}</span>
        <UiStatusBadge tone={tone}>{status}</UiStatusBadge>
      </div>
      <h3 className="mt-3 text-sm font-black">{step.title}</h3>
      <p className="mt-1 text-xs font-bold leading-5 text-[#14312d]/62">{demoLaunched ? step.data : "Non connecté"}</p>
    </Link>
  );
}

function DecisionCard({ active, alertTitle, decisionTitle, priority, zone }: { active: boolean; alertTitle?: string; decisionTitle?: string; priority?: "Critique" | "Haute" | "Moyenne" | "Faible"; zone?: string }) {
  return (
    <section className={`rounded-3xl border p-5 shadow-sm ${active ? "border-[#14312d] bg-[#14312d] text-white" : "border-[#14312d]/10 bg-white text-[#14312d]"}`}>
      <div className="flex items-center justify-between gap-3">
        <UiStatusBadge tone={active && priority ? priorityTone(priority) : "neutral"}>Décision recommandée</UiStatusBadge>
        <span className={`text-xs font-black ${active ? "text-white/60" : "text-[#14312d]/50"}`}>{zone ?? "Zone pilote"}</span>
      </div>
      <h2 className="mt-4 text-xl font-black leading-snug">{active ? (decisionTitle ?? "Orienter les mareyeurs vers Hann") : "Décision informelle"}</h2>
      <p className={`mt-2 text-sm font-semibold leading-6 ${active ? "text-white/72" : "text-[#14312d]/62"}`}>
        {active ? (alertTitle ?? "Prioriser les lots sensibles et renforcer la conservation.") : "Les décisions reposent encore sur des appels et de l’intuition."}
      </p>
      <div className={`mt-4 rounded-2xl p-3 ring-1 ${active ? "bg-white/10 ring-white/15" : "bg-[#f8faf8] ring-[#14312d]/8"}`}>
        <p className={`text-xs font-black uppercase tracking-[0.12em] ${active ? "text-[#f5c85d]" : "text-[#d65a31]"}`}>Priorité</p>
        <p className="mt-1 text-lg font-black">{active ? (priority ?? "Haute") : "Non calculée"}</p>
      </div>
    </section>
  );
}

function ActorCard({ active, actor }: { active: boolean; actor: { action: string; role: string; tone: StatusTone } }) {
  return (
    <ModuleCard className={active ? "bg-white" : "bg-[#f8faf8]"} interactive>
      <UiStatusBadge tone={active ? actor.tone : "neutral"}>{actor.role}</UiStatusBadge>
      <p className="mt-3 text-sm font-black leading-5">{active ? actor.action : "Je manque de visibilité."}</p>
    </ModuleCard>
  );
}

function EcosystemModules({ active }: { active: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr_0.85fr] lg:items-center">
      <div className="grid gap-3">
        {ecosystemLeft.map((node) => (
          <ModuleNode key={node.label} active={active} href={node.href} label={node.label} />
        ))}
      </div>
      <div className={`rounded-3xl border p-5 text-center shadow-sm ${active ? "border-[#95d5b2] bg-[#eef8f1]" : "border-[#14312d]/10 bg-[#fbfcfb]"}`}>
        <UiStatusBadge tone={active ? "success" : "neutral"}>{active ? "système activé" : "système en attente"}</UiStatusBadge>
        <p className="mt-3 text-2xl font-black">Lot suivi</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#14312d]/62">
          {active ? "Le lot connecte données terrain, matching, suivi et décision." : "Le lot existe, mais ses informations restent fragmentées."}
        </p>
      </div>
      <div className="grid gap-3">
        {ecosystemRight.map((node) => (
          <ModuleNode key={node.label} active={active} href={node.href} label={node.label} />
        ))}
      </div>
    </div>
  );
}

function ModuleNode({ active, href, label }: { active: boolean; href: string; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
        active ? "border-[#93c5fd] bg-[#eef6ff] text-[#14312d] hover:border-[#14312d]/35" : "border-[#14312d]/8 bg-white text-[#14312d]/55"
      }`}
    >
      {label}
    </Link>
  );
}

function buildFlowSteps(
  journey: DemoJourneyData,
  context: {
    impact: ReturnType<typeof computeImpactMetrics>;
    priorityTitle?: string;
    transactionStatus?: string;
  }
): FlowStep[] {
  const byId = new Map(journey.steps.map((step) => [step.id, step]));
  const arrivage = byId.get(2) ?? journey.steps[0];
  const besoin = byId.get(3) ?? journey.steps[1] ?? arrivage;
  const opportunite = byId.get(4) ?? journey.steps[2] ?? arrivage;
  const reservation = byId.get(5) ?? opportunite;

  return [
    { id: 1, title: "Pêcheur", data: "Lot déclaré", href: "/arrivages" },
    { id: 2, title: "Arrivage", data: arrivage.data, href: "/arrivages" },
    { id: 3, title: "Besoin", data: besoin.data, href: "/besoins" },
    { id: 4, title: "Opportunité", data: opportunite.data, href: "/opportunites" },
    { id: 5, title: "Réservation", data: reservation.data, href: reservation.href },
    { id: 6, title: "Transaction", data: context.transactionStatus ?? "Retrait lancé", href: "/transactions" },
    { id: 7, title: "Impact", data: `${context.impact.poissonSauve} sauvés`, href: "/dashboard" },
    { id: 8, title: "Décision", data: context.priorityTitle ?? "Action priorisée", href: "/executive" }
  ];
}

function priorityTone(priority: "Critique" | "Haute" | "Moyenne" | "Faible"): StatusTone {
  const tone = getPriorityTone(priority);
  if (tone === "low") return "success";
  if (tone === "medium") return "warning";
  if (tone === "high") return "impact";
  return "danger";
}

const moduleLinks = [
  { href: "/", label: "Accueil" },
  { href: "/demo", label: "Démo" },
  { href: "/arrivages", label: "Arrivages" },
  { href: "/besoins", label: "Besoins" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/transactions", label: "Transactions" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/coordination", label: "Coordination" },
  { href: "/executive", label: "Executive" }
];

const beforePoints = ["Arrivage isolé", "Besoin non visible", "Décision informelle", "Risque de perte"];
const afterPoints = ["Lot déclaré", "Besoin identifié", "Opportunité détectée", "Impact mesuré"];

const actorCards: Array<{ role: string; action: string; tone: StatusTone }> = [
  { role: "Pêcheur", action: "Je déclare le lot.", tone: "success" },
  { role: "Mareyeur", action: "Je réserve le bon lot.", tone: "info" },
  { role: "Transformateur", action: "Je capte le surplus.", tone: "warning" },
  { role: "Collectivité", action: "Je suis les tensions.", tone: "impact" },
  { role: "Administration", action: "Je lis l'impact.", tone: "dark" }
];

const ecosystemLeft = [
  { href: "/arrivages", label: "Arrivages" },
  { href: "/besoins", label: "Besoins" },
  { href: "/opportunites", label: "Opportunités" }
];

const ecosystemRight = [
  { href: "/transactions", label: "Transactions" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/coordination", label: "Coordination" },
  { href: "/executive", label: "Executive" }
];

const summaryPoints = ["Visibilité", "Coordination", "Traçabilité", "Impact", "Décision"];
