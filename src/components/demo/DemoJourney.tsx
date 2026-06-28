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
import { InsightPanel } from "@/components/ui/InsightPanel";
import { MetricCard } from "@/components/ui/MetricCard";
import { ModuleCard } from "@/components/ui/ModuleCard";
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

    const timer = window.setTimeout(() => setVisibleSteps((current) => Math.min(current + 1, flowSteps.length)), 520);

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
    <main className="min-h-screen bg-white px-4 py-5 text-[#14312d] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <DemoNav />

        <section className="mt-5 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-3xl border border-[#14312d]/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <UiStatusBadge tone={demoLaunched ? "success" : "neutral"}>{demoLaunched ? "Filière coordonnée" : "Filière dispersée"}</UiStatusBadge>
              <span className="text-xs font-black text-[#14312d]/45">{visibleSteps}/{flowSteps.length}</span>
            </div>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">Mbàmbulaan en action</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#14312d]/68">
              Une démonstration courte pour voir comment un lot devient une opportunité, une transaction suivie et une décision territoriale.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <StatePanel active={!demoLaunched} title="Avant" label="Informations séparées" points={beforePoints} tone="neutral" />
              <StatePanel active={demoLaunched} title="Après" label="Modules connectés" points={afterPoints} tone="success" />
            </div>

            <button
              type="button"
              onClick={launchDemo}
              className="mt-5 h-12 w-full rounded-2xl bg-[#14312d] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#1e4a43]"
            >
              {demoLaunched ? "Relancer la démonstration" : "Lancer la démonstration"}
            </button>
          </div>

          <div className="rounded-3xl border border-[#14312d]/10 bg-[#f8faf8] p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Volume valorisé" value={demoLaunched ? impact.volumeValorise : "Non relié"} tone="default" size="compact" />
              <MetricCard label="Poisson sauvé" value={demoLaunched ? impact.poissonSauve : "À risque"} tone="default" size="compact" />
              <MetricCard label="Besoins couverts" value={demoLaunched ? `${journey.finalSummary.couverture}%` : "Non visible"} tone="default" size="compact" />
              <MetricCard label="Décision" value={demoLaunched ? "Priorisée" : "Intuitive"} tone="default" size="compact" />
            </div>

            <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-[#14312d]/8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#d65a31]">Flux visuel</p>
                  <h2 className="mt-1 text-xl font-black">Du débarquement à la décision</h2>
                </div>
                <UiStatusBadge tone={demoLaunched ? "info" : "neutral"}>{demoLaunched ? "flux activé" : "en attente"}</UiStatusBadge>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-4">
                {flowSteps.map((step) => (
                  <FlowCard key={step.id} demoLaunched={demoLaunched} isActive={visibleSteps === step.id} isDone={visibleSteps > step.id} step={step} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
            <LotCard demoLaunched={demoLaunched} lotQualifie={lotSensible} lotSuivi={lotSuivi} />
            <DecisionCard alertTitle={activeAlert?.titre} decisionTitle={decision?.titre} priority={decision?.priorite} zone={zonePrioritaire?.quai} />
          </div>

          <div className="grid gap-4">
            <InsightPanel eyebrow="Parties prenantes" title="Ce que je fais maintenant">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {actorCards.map((actor) => (
                  <ActorCard key={actor.role} actor={actor} active={demoLaunched} />
                ))}
              </div>
            </InsightPanel>

            <InsightPanel eyebrow="Écosystème" title="Un lot au centre, des modules connectés">
              <EcosystemVisual active={demoLaunched} />
            </InsightPanel>
          </div>
        </section>
      </div>
    </main>
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

function StatePanel({ active, label, points, title, tone }: { active: boolean; label: string; points: string[]; title: string; tone: StatusTone }) {
  return (
    <div className={`rounded-2xl border p-4 ${active ? "border-[#14312d]/22 bg-[#f8faf8]" : "border-[#14312d]/8 bg-white"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-black">{title}</p>
        <UiStatusBadge tone={active ? tone : "neutral"}>{label}</UiStatusBadge>
      </div>
      <ul className="mt-3 space-y-2">
        {points.map((point) => (
          <li key={point} className="text-sm font-semibold leading-5 text-[#14312d]/65">
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FlowCard({ demoLaunched, isActive, isDone, step }: { demoLaunched: boolean; isActive: boolean; isDone: boolean; step: FlowStep }) {
  const tone: StatusTone = !demoLaunched ? "neutral" : isDone ? "success" : isActive ? "info" : "warning";
  const status = !demoLaunched ? "off" : isDone ? "ok" : isActive ? "actif" : "à venir";

  return (
    <Link
      href={step.href}
      className={`min-h-28 rounded-2xl border p-3 transition ${
        isActive
          ? "border-[#14312d] bg-[#eef6ff]"
          : isDone
            ? "border-[#95d5b2] bg-[#e8f7f2]"
            : "border-[#14312d]/8 bg-white hover:border-[#14312d]/28"
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

function LotCard({ demoLaunched, lotQualifie, lotSuivi }: { demoLaunched: boolean; lotQualifie?: SensitiveLot; lotSuivi?: TraceableLot }) {
  return (
    <section className="rounded-3xl border border-[#14312d]/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#d65a31]">Lot suivi</p>
          <h2 className="mt-2 text-xl font-black">{demoLaunched ? (lotSuivi?.espece ?? lotQualifie?.espece ?? "Lot pilote") : "Lot non tracé"}</h2>
          <p className="mt-1 text-sm font-semibold text-[#14312d]/62">{demoLaunched && lotSuivi ? `${lotSuivi.lotId} · ${lotSuivi.quai}` : "Les informations sont séparées."}</p>
        </div>
        <UiStatusBadge tone={demoLaunched ? "success" : "neutral"}>{demoLaunched ? "tracé" : "dispersé"}</UiStatusBadge>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricCard label="Quantité" value={demoLaunched ? (lotSuivi?.quantite ?? "Lot mock") : "Inconnue"} size="compact" tone="warm" />
        <MetricCard label="Qualité" value={demoLaunched && lotQualifie ? `${lotQualifie.score}/100` : "Non qualifiée"} size="compact" tone="warm" />
        <MetricCard label="Statut" value={demoLaunched ? (lotSuivi?.statutActuel ?? "Suivi") : "Non suivi"} size="compact" tone="warm" />
        <MetricCard label="Transaction" value={demoLaunched ? (lotSuivi?.transactionLiee?.statut ?? "À créer") : "Absente"} size="compact" tone="warm" />
      </div>
    </section>
  );
}

function DecisionCard({ alertTitle, decisionTitle, priority, zone }: { alertTitle?: string; decisionTitle?: string; priority?: "Critique" | "Haute" | "Moyenne" | "Faible"; zone?: string }) {
  return (
    <section className="rounded-3xl border border-[#14312d]/10 bg-[#14312d] p-5 text-white shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <UiStatusBadge tone={priority ? priorityTone(priority) : "impact"}>Décision</UiStatusBadge>
        <span className="text-xs font-black text-white/55">{zone ?? "Zone pilote"}</span>
      </div>
      <h2 className="mt-4 text-xl font-black leading-snug">{decisionTitle ?? "Orienter les mareyeurs vers Hann"}</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-white/72">{alertTitle ?? "Prioriser les lots sensibles et renforcer la conservation."}</p>
      <div className="mt-4 rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#f5c85d]">Priorité</p>
        <p className="mt-1 text-lg font-black">{priority ?? "Haute"}</p>
      </div>
    </section>
  );
}

function ActorCard({ active, actor }: { active: boolean; actor: { action: string; role: string; tone: StatusTone } }) {
  return (
    <ModuleCard className={active ? "bg-white" : "bg-[#f8faf8]"}>
      <UiStatusBadge tone={active ? actor.tone : "neutral"}>{actor.role}</UiStatusBadge>
      <p className="mt-3 text-sm font-black leading-5">{actor.action}</p>
    </ModuleCard>
  );
}

function EcosystemVisual({ active }: { active: boolean }) {
  return (
    <div className="grid gap-3 lg:grid-cols-[0.8fr_1fr_0.8fr] lg:items-center">
      <div className="grid gap-2">
        {["Pêcheur", "Mareyeur", "Transformateur"].map((node) => (
          <div key={node} className={`rounded-2xl border px-4 py-3 text-sm font-black ${active ? "border-[#95d5b2] bg-[#e8f7f2]" : "border-[#14312d]/8 bg-white text-[#14312d]/55"}`}>
            {node}
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-[#14312d]/10 bg-white p-5 text-center shadow-sm">
        <UiStatusBadge tone={active ? "success" : "neutral"}>{active ? "Lot coordonné" : "Lot isolé"}</UiStatusBadge>
        <p className="mt-3 text-2xl font-black">Arrivage central</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#14312d]/62">
          {active ? "Connecté aux besoins, opportunités, transactions et décisions." : "Visible localement, sans vision partagée."}
        </p>
      </div>
      <div className="grid gap-2">
        {["Dashboard", "Notifications", "Vue exécutive"].map((node) => (
          <div key={node} className={`rounded-2xl border px-4 py-3 text-sm font-black ${active ? "border-[#93c5fd] bg-[#eef6ff]" : "border-[#14312d]/8 bg-white text-[#14312d]/55"}`}>
            {node}
          </div>
        ))}
      </div>
    </div>
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

const beforePoints = ["Arrivages dispersés", "Besoins non visibles", "Décisions par téléphone"];
const afterPoints = ["Lot déclaré", "Besoin identifié", "Impact mesuré"];

const actorCards: Array<{ role: string; action: string; tone: StatusTone }> = [
  { role: "Pêcheur", action: "Je déclare mon lot.", tone: "success" },
  { role: "Mareyeur", action: "Je trouve et réserve.", tone: "info" },
  { role: "Transformateur", action: "Je capte un surplus.", tone: "warning" },
  { role: "Collectivité", action: "Je vois les tensions.", tone: "impact" },
  { role: "Administration", action: "Je comprends l'impact.", tone: "dark" }
];
