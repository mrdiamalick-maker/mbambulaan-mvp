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
  const flowSteps = buildFlowSteps(journey, {
    impact,
    priorityTitle: decision?.titre,
    transactionStatus: transactions[0]?.statut
  });

  useEffect(() => {
    if (!demoLaunched || visibleSteps >= flowSteps.length) return;

    const timer = window.setTimeout(() => setVisibleSteps((current) => Math.min(current + 1, flowSteps.length)), 650);

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
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap gap-2">
          {moduleLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                item.href === "/demo" ? "border-[#14312d] bg-[#14312d] text-white" : "border-[#14312d]/15 text-[#14312d] hover:border-[#14312d]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
            <div className="flex flex-col justify-between rounded-3xl bg-[#14312d] p-6 text-white">
              <div>
                <UiStatusBadge tone={demoLaunched ? "success" : "warning"}>{demoLaunched ? "Démonstration active" : "État initial"}</UiStatusBadge>
                <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">Mbàmbulaan en action</h1>
                <p className="mt-4 text-base font-semibold leading-7 text-white/78">
                  Voyez comment un lot débarqué devient une opportunité, une transaction suivie et un impact mesurable.
                </p>
              </div>
              <div className="mt-8">
                <p className="rounded-2xl bg-white/10 p-4 text-sm font-black leading-6 ring-1 ring-white/15">
                  {demoLaunched
                    ? "Mbàmbulaan connecte les acteurs, suit le lot et affiche les priorités."
                    : "La filière est dispersée : arrivages, besoins et décisions sont séparés."}
                </p>
                <button
                  type="button"
                  onClick={launchDemo}
                  className="mt-4 h-12 w-full rounded-2xl bg-[#f5c85d] px-5 text-sm font-black text-[#14312d] transition hover:bg-[#ffd977]"
                >
                  {demoLaunched ? "Relancer la démonstration" : "Lancer la démonstration"}
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Volume valorisé" value={impact.volumeValorise} tone={demoLaunched ? "default" : "warm"} />
                <MetricCard label="Valeur estimée" value={impact.valeurEconomique} tone={demoLaunched ? "default" : "warm"} />
                <MetricCard label="Poisson sauvé" value={impact.poissonSauve} tone={demoLaunched ? "default" : "warm"} />
                <MetricCard label="Besoins couverts" value={`${demoLaunched ? journey.finalSummary.couverture : journey.impact.coverageRate}%`} tone={demoLaunched ? "default" : "warm"} />
              </div>

              <div className="rounded-3xl bg-[#f7f4ec] p-5 ring-1 ring-[#14312d]/8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#d65a31]">Flux de coordination</p>
                    <h2 className="mt-2 text-2xl font-black">Arrivage → Décision</h2>
                  </div>
                  <p className="text-sm font-black text-[#14312d]/55">{visibleSteps}/{flowSteps.length} étapes actives</p>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  {flowSteps.map((step) => (
                    <FlowCard key={step.id} demoLaunched={demoLaunched} isActive={visibleSteps === step.id} isDone={visibleSteps > step.id} step={step} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <LotCard demoLaunched={demoLaunched} lotQualifie={lotSensible} lotSuivi={lotSuivi} />

          <div className="grid gap-6">
            <DecisionCard alertTitle={alertes[0]?.titre} decisionTitle={decision?.titre} priority={decision?.priorite} zone={zonePrioritaire?.quai} />
            <div className="grid gap-4 md:grid-cols-2">
              {actorCards.map((actor) => (
                <ModuleCard key={actor.title} className={demoLaunched ? "bg-white" : ""}>
                  <UiStatusBadge tone={actor.tone}>{actor.role}</UiStatusBadge>
                  <h3 className="mt-4 text-lg font-black">{actor.title}</h3>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/65">{actor.action}</p>
                </ModuleCard>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <InsightPanel
            eyebrow="Écosystème"
            title="Modules activés par le cockpit"
            description="Les liens restent disponibles, mais chaque module est présenté comme une pièce du système de coordination."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ecosystemModules.map((module) => (
                <Link key={module.href} href={module.href} className="rounded-2xl bg-[#f7f4ec] p-4 ring-1 ring-[#14312d]/5 transition hover:bg-[#eee7d7]">
                  <p className="text-sm font-black">{module.label}</p>
                  <p className="mt-2 text-xs font-bold leading-5 text-[#14312d]/60">{module.description}</p>
                </Link>
              ))}
            </div>
          </InsightPanel>

          <InsightPanel eyebrow="En 30 secondes" title="Ce que la démo prouve">
            <div className="grid gap-3">
              {proofPoints.map((point) => (
                <div key={point} className="rounded-2xl bg-[#f7f4ec] p-4 text-sm font-black leading-6 text-[#14312d]/75">
                  {point}
                </div>
              ))}
            </div>
          </InsightPanel>
        </section>
      </div>
    </main>
  );
}

function FlowCard({ demoLaunched, isActive, isDone, step }: { demoLaunched: boolean; isActive: boolean; isDone: boolean; step: FlowStep }) {
  const tone: StatusTone = !demoLaunched ? "neutral" : isDone ? "success" : isActive ? "info" : "warning";
  const status = !demoLaunched ? "en attente" : isDone ? "terminé" : isActive ? "actif" : "en attente";

  return (
    <Link
      href={step.href}
      className={`min-h-36 rounded-2xl border p-4 transition ${
        isActive
          ? "border-[#14312d] bg-white shadow-sm"
          : isDone
            ? "border-[#95d5b2] bg-[#d8f3dc]"
            : "border-[#14312d]/10 bg-white/70 hover:border-[#14312d]/25"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14312d] text-sm font-black text-white">{step.id}</span>
        <UiStatusBadge tone={tone}>{status}</UiStatusBadge>
      </div>
      <h3 className="mt-4 text-lg font-black">{step.title}</h3>
      <p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/65">{step.data}</p>
    </Link>
  );
}

function LotCard({ demoLaunched, lotQualifie, lotSuivi }: { demoLaunched: boolean; lotQualifie?: SensitiveLot; lotSuivi?: TraceableLot }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Le lot suivi</p>
          <h2 className="mt-3 text-3xl font-black">{lotSuivi?.espece ?? lotQualifie?.espece ?? "Lot pilote"}</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/65">
            {lotSuivi ? `${lotSuivi.lotId} · ${lotSuivi.quai}` : "Lancez la démonstration pour suivre un objet métier réel."}
          </p>
        </div>
        <UiStatusBadge tone={demoLaunched ? "success" : "neutral"}>{demoLaunched ? "suivi actif" : "en attente"}</UiStatusBadge>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <MetricCard label="Quantité" value={lotSuivi?.quantite ?? "Lot mock"} size="compact" />
        <MetricCard label="Qualité" value={lotQualifie ? `${lotQualifie.score}/100` : "À qualifier"} size="compact" />
        <MetricCard label="Statut" value={lotSuivi?.statutActuel ?? "Non lancé"} size="compact" />
        <MetricCard label="Transaction liée" value={lotSuivi?.transactionLiee?.statut ?? "À créer"} size="compact" />
      </div>

      <div className="mt-5 rounded-2xl bg-[#f7f4ec] p-4">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">Traçabilité</p>
        <p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/70">
          {lotSuivi?.historique.slice(0, 3).map((event) => event.titre).join(" → ") ?? "Arrivage → Opportunité → Réservation → Transaction"}
        </p>
      </div>
    </section>
  );
}

function DecisionCard({ alertTitle, decisionTitle, priority, zone }: { alertTitle?: string; decisionTitle?: string; priority?: "Critique" | "Haute" | "Moyenne" | "Faible"; zone?: string }) {
  return (
    <section className="rounded-3xl bg-[#14312d] p-6 text-white shadow-sm sm:p-8">
      <UiStatusBadge tone={priority ? priorityTone(priority) : "impact"}>Décision recommandée</UiStatusBadge>
      <h2 className="mt-4 text-3xl font-black">{decisionTitle ?? "Orienter les mareyeurs vers Hann"}</h2>
      <p className="mt-3 text-sm font-semibold leading-6 text-white/75">
        {alertTitle ?? "Traiter d'abord Sardinelle plate et renforcer la conservation à Hann."}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#f5c85d]">Zone</p>
          <p className="mt-2 text-xl font-black">{zone ?? "Hann"}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#f5c85d]">Priorité</p>
          <p className="mt-2 text-xl font-black">{priority ?? "Haute"}</p>
        </div>
      </div>
    </section>
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
    { id: 1, title: "Pêcheur", data: "Lot déclaré au quai", href: "/arrivages" },
    { id: 2, title: "Arrivage", data: arrivage.data, href: "/arrivages" },
    { id: 3, title: "Besoin", data: besoin.data, href: "/besoins" },
    { id: 4, title: "Opportunité", data: opportunite.data, href: "/opportunites" },
    { id: 5, title: "Réservation", data: reservation.data, href: reservation.href },
    { id: 6, title: "Transaction", data: context.transactionStatus ?? "Retrait en cours", href: "/transactions" },
    { id: 7, title: "Impact", data: `${context.impact.poissonSauve} sauvés`, href: "/dashboard" },
    { id: 8, title: "Décision", data: context.priorityTitle ?? "Renforcer Hann", href: "/executive" }
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

const actorCards: Array<{ role: string; title: string; action: string; tone: StatusTone }> = [
  { role: "Pêcheur", title: "Déclarer un lot", action: "Je rends mon arrivage visible immédiatement.", tone: "success" },
  { role: "Mareyeur", title: "Trouver et réserver", action: "Je repère les lots compatibles avec mes besoins.", tone: "info" },
  { role: "Transformateur", title: "Capter un surplus", action: "Je traite les volumes sensibles avant perte.", tone: "warning" },
  { role: "Collectivité", title: "Voir les priorités", action: "Je lis les tensions, risques et impacts du territoire.", tone: "impact" }
];

const ecosystemModules = [
  { href: "/arrivages", label: "Arrivages", description: "Déclaration et visibilité des lots." },
  { href: "/besoins", label: "Besoins", description: "Demandes d'achat structurées." },
  { href: "/opportunites", label: "Opportunités", description: "Matching et réservation." },
  { href: "/transactions", label: "Transactions", description: "Suivi de retrait et livraison." },
  { href: "/dashboard", label: "Dashboard", description: "Impact, KPI et lecture globale." },
  { href: "/coordination", label: "Coordination", description: "File d'actions et alertes." },
  { href: "/executive", label: "Executive", description: "Synthèse décideur." }
];

const proofPoints = [
  "Un lot devient un objet suivi, pas une simple annonce.",
  "L'offre, la demande et la transaction sont reliées dans un même cockpit.",
  "Les décisions publiques s'appuient sur impact, tension et priorité."
];
