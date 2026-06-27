"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import { computeMatching } from "@/lib/coordination";
import type { DemoJourney as DemoJourneyData } from "@/lib/demo";
import { computeImpactMetrics } from "@/lib/impact";
import { createCoordinationSimulation, coordinationSimulationStorageKey } from "@/lib/simulation";
import type { CoordinationSimulation } from "@/lib/simulation";
import { computeTensionMetrics, getTensionTone } from "@/lib/tension";

export function DemoJourney({ arrivages, besoins, journey }: { arrivages: Arrivage[]; besoins: Besoin[]; journey: DemoJourneyData }) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [demoLaunched, setDemoLaunched] = useState(false);
  const [simulation, setSimulation] = useState<CoordinationSimulation | null>(null);
  const isRunning = visibleSteps > 0 && visibleSteps < journey.steps.length;
  const isComplete = visibleSteps === journey.steps.length;
  const activeStep = Math.max(1, visibleSteps || 1);
  const baseOpportunites = useMemo(() => computeMatching(arrivages, besoins), [arrivages, besoins]);
  const impact = useMemo(
    () =>
      simulation
        ? computeImpactMetrics([...simulation.arrivages, ...arrivages], [...simulation.besoins, ...besoins], simulation.opportunites, simulation.transactions)
        : computeImpactMetrics(arrivages, besoins, baseOpportunites),
    [arrivages, baseOpportunites, besoins, simulation]
  );
  const tensions = useMemo(
    () =>
      simulation
        ? computeTensionMetrics([...simulation.arrivages, ...arrivages], [...simulation.besoins, ...besoins], simulation.opportunites, simulation.transactions)
        : computeTensionMetrics(arrivages, besoins, baseOpportunites),
    [arrivages, baseOpportunites, besoins, simulation]
  );
  const displayedImpact = demoLaunched
    ? {
        opportunities: journey.finalSummary.opportunites,
        coverageRate: journey.finalSummary.couverture,
        activeTransactions: journey.finalSummary.transactions,
        notifications: journey.finalSummary.notifications
      }
    : {
        opportunities: journey.impact.opportunities,
        coverageRate: journey.impact.coverageRate,
        activeTransactions: journey.impact.activeTransactions,
        notifications: 0
      };

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setTimeout(() => setVisibleSteps((current) => Math.min(current + 1, journey.steps.length)), 850);

    return () => window.clearTimeout(timer);
  }, [isRunning, journey.steps.length, visibleSteps]);

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

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Démo MVP</p>
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Un parcours guidé pour voir Mbàmbulaan coordonner toute la filière.</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">{journey.summary}</p>
            </div>
            <div className="rounded-3xl bg-[#f7f4ec] p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <ImpactMetric label="Opportunités" value={String(displayedImpact.opportunities)} />
                <ImpactMetric label="Couverture" value={`${displayedImpact.coverageRate}%`} />
                <ImpactMetric label="Transactions" value={String(displayedImpact.activeTransactions)} />
                <ImpactMetric label="Notifications" value={String(displayedImpact.notifications)} />
              </div>
              <button
                type="button"
                onClick={launchDemo}
                className="mt-5 h-12 w-full rounded-2xl bg-[#14312d] px-5 text-sm font-black text-white transition hover:bg-[#1e4a43]"
              >
                {isComplete ? "Relancer la démonstration" : "Lancer une démonstration"}
              </button>
              {demoLaunched ? <p className="mt-4 rounded-2xl bg-[#d8f3dc] p-4 text-sm font-black text-[#1b5e20]">Simulation active : les modules métier lisent maintenant les données de démonstration.</p> : null}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#14312d]/10 sm:p-6">
          <div className="grid gap-3 md:grid-cols-6">
            {progressItems.map((item) => {
              const isActive = activeStep >= item.firstStep && activeStep <= item.lastStep;
              const isDone = visibleSteps > item.lastStep;

              return (
                <div key={item.label} className={`rounded-2xl border p-4 ${isActive ? "border-[#14312d] bg-[#14312d] text-white" : isDone ? "border-[#95d5b2] bg-[#d8f3dc] text-[#1b5e20]" : "border-[#14312d]/10 bg-[#f7f4ec] text-[#14312d]/60"}`}>
                  <span className="text-lg leading-none">●</span>
                  <p className="mt-2 text-sm font-black">{item.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">{journey.title}</p>
              <h2 className="mt-3 text-3xl font-black">Parcours guidé en 8 étapes</h2>
            </div>
            <p className="text-sm font-black text-[#14312d]/60">{visibleSteps}/8 étapes visibles</p>
          </div>

          <div className="mt-8 grid gap-4">
            {journey.steps.map((step) => {
              const isVisible = step.id <= visibleSteps;

              return (
                <article
                  key={step.id}
                  className={`grid gap-4 rounded-3xl border p-5 transition sm:grid-cols-[4rem_1fr] ${
                    isVisible ? "border-[#14312d]/10 bg-[#f7f4ec] opacity-100" : "border-dashed border-[#14312d]/15 bg-white opacity-45"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14312d] text-lg font-black text-white">{step.id}</div>
                  <div>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-2xl font-black">{step.title}</h3>
                        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#14312d]/70">{step.description}</p>
                        <p className="mt-2 text-sm font-bold text-[#14312d]/65">{step.businessValue}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-[#d65a31] ring-1 ring-[#14312d]/10">{step.module}</span>
                        <Link href={step.href} className="w-fit rounded-full bg-[#14312d] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1e4a43]">
                          Voir
                        </Link>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <StepDetail label="Acteur" value={step.actor} />
                      <StepDetail label="Donnee" value={step.data} />
                      <StepDetail label="Valeur métier" value={step.businessValue} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-[#14312d] p-6 text-white shadow-sm sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f5c85d]">Aujourd'hui</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FinalMetric label="Arrivages" value={String(journey.finalSummary.arrivages)} />
            <FinalMetric label="Besoins" value={String(journey.finalSummary.besoins)} />
            <FinalMetric label="Opportunités" value={String(journey.finalSummary.opportunites)} />
            <FinalMetric label="Transactions" value={String(journey.finalSummary.transactions)} />
            <FinalMetric label="Besoins couverts" value={`${journey.finalSummary.couverture}%`} />
            <FinalMetric label="Notifications envoyées" value={String(journey.finalSummary.notifications)} />
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Impact généré par Mbàmbulaan</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ImpactResult label="Volume valorisé" value={impact.volumeValorise} />
            <ImpactResult label="Valeur économique" value={impact.valeurEconomique} />
            <ImpactResult label="Poisson sauvé" value={impact.poissonSauve} />
            <ImpactResult label="Familles impactées" value={String(impact.famillesImpactees)} />
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Lecture territoriale de la filière</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl bg-[#f7f4ec] p-5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">Zone prioritaire</p>
              <p className="mt-2 text-2xl font-black">{tensions.zonesPrioritaires[0]?.quai ?? "Aucune"}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/65">{tensions.zonesPrioritaires[0]?.raison ?? "Equilibre territorial stable sur les données mock."}</p>
              {tensions.zonesPrioritaires[0] ? <TensionBadge level={tensions.zonesPrioritaires[0].niveau} /> : null}
            </div>
            <div className="grid gap-3">
              {tensions.recommandations.slice(0, 3).map((recommandation) => (
                <p key={recommandation} className="rounded-2xl bg-[#f7f4ec] p-5 text-sm font-black leading-6 text-[#14312d]/75">
                  {recommandation}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
          <h2 className="text-2xl font-black">Explorer les modules</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {moduleLinks.filter((item) => item.href !== "/demo").map((item) => (
              <Link key={item.href} href={item.href} className="rounded-2xl border border-[#14312d]/15 px-4 py-3 text-center text-sm font-black transition hover:border-[#14312d] hover:bg-[#f7f4ec]">
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

const moduleLinks = [
  { href: "/", label: "Accueil" },
  { href: "/demo", label: "Démo" },
  { href: "/arrivages", label: "Arrivages" },
  { href: "/besoins", label: "Besoins" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/transactions", label: "Transactions" },
  { href: "/notifications", label: "Notifications" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quais", label: "Quais" }
];

const progressItems = [
  { label: "Arrivage", firstStep: 1, lastStep: 2 },
  { label: "Besoin", firstStep: 3, lastStep: 3 },
  { label: "Opportunité", firstStep: 4, lastStep: 4 },
  { label: "Réservation", firstStep: 5, lastStep: 5 },
  { label: "Transaction", firstStep: 6, lastStep: 7 },
  { label: "Tableau de bord", firstStep: 8, lastStep: 8 }
];

function ImpactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function StepDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/75">{value}</p>
    </div>
  );
}

function FinalMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm font-semibold text-white/75">{label}</p>
    </div>
  );
}

function ImpactResult({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f4ec] p-5">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function TensionBadge({ level }: { level: "Faible" | "Moyenne" | "Forte" | "Critique" }) {
  const tone = getTensionTone(level);
  const styles = {
    low: "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]",
    medium: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]",
    high: "bg-[#ffe8cc] text-[#9a3412] ring-[#fdba74]",
    critical: "bg-[#ffe3e3] text-[#9b1c1c] ring-[#ffa8a8]"
  };

  return <span className={`mt-4 inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[tone]}`}>{level}</span>;
}
