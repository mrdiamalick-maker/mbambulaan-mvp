"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import { computeIntelligentAlerts, getAlertTone } from "@/lib/alerts";
import { computeMatching } from "@/lib/coordination";
import type { DemoJourney as DemoJourneyData } from "@/lib/demo";
import { computeImpactMetrics } from "@/lib/impact";
import { computePrioritizationMetrics, getPriorityTone } from "@/lib/prioritization";
import { computeSensitiveLots, getWasteRiskTone } from "@/lib/quality";
import { createCoordinationSimulation, coordinationSimulationStorageKey } from "@/lib/simulation";
import type { CoordinationSimulation } from "@/lib/simulation";
import { computeTensionMetrics, getTensionTone } from "@/lib/tension";
import { computeTraceability } from "@/lib/traceability";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge as UiStatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { InsightPanel } from "@/components/ui/InsightPanel";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

type SensitiveLot = ReturnType<typeof computeSensitiveLots>[number];
type TraceableLot = ReturnType<typeof computeTraceability>[number];
type NarrativeStep = {
  id: number;
  title: string;
  description: string;
  actor: string;
  data: string;
  module: string;
  businessValue: string;
  href: string;
};

export function DemoJourney({ arrivages, besoins, journey }: { arrivages: Arrivage[]; besoins: Besoin[]; journey: DemoJourneyData }) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [demoLaunched, setDemoLaunched] = useState(false);
  const [simulation, setSimulation] = useState<CoordinationSimulation | null>(null);
  const totalSteps = 10;
  const isRunning = visibleSteps > 0 && visibleSteps < totalSteps;
  const isComplete = visibleSteps === totalSteps;
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
  const priorities = useMemo(
    () =>
      simulation
        ? computePrioritizationMetrics([...simulation.arrivages, ...arrivages], [...simulation.besoins, ...besoins], simulation.opportunites, simulation.transactions)
        : computePrioritizationMetrics(arrivages, besoins, baseOpportunites),
    [arrivages, baseOpportunites, besoins, simulation]
  );
  const alertes = useMemo(
    () =>
      simulation
        ? computeIntelligentAlerts([...simulation.arrivages, ...arrivages], [...simulation.besoins, ...besoins], simulation.opportunites, simulation.transactions, simulation.notifications)
        : computeIntelligentAlerts(arrivages, besoins, baseOpportunites),
    [arrivages, baseOpportunites, besoins, simulation]
  );
  const lotsSuivis = useMemo(
    () =>
      simulation
        ? computeTraceability([...simulation.arrivages, ...arrivages], simulation.opportunites, simulation.transactions, simulation.notifications)
        : computeTraceability(arrivages, baseOpportunites),
    [arrivages, baseOpportunites, simulation]
  );
  const sensitiveLots = useMemo(
    () =>
      simulation
        ? computeSensitiveLots([...simulation.arrivages, ...arrivages], { besoins: [...simulation.besoins, ...besoins], opportunites: simulation.opportunites, transactions: simulation.transactions })
        : computeSensitiveLots(arrivages, { besoins, opportunites: baseOpportunites }),
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
  const narrativeSteps = buildNarrativeSteps(journey.steps, {
    sensitiveLot: sensitiveLots[0],
    tracedLot: lotsSuivis[0],
    priorityTitle: priorities.actionsPrioritaires[0]?.titre,
    impactValue: impact.valeurEconomique
  });

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setTimeout(() => setVisibleSteps((current) => Math.min(current + 1, totalSteps)), 850);

    return () => window.clearTimeout(timer);
  }, [isRunning, totalSteps, visibleSteps]);

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
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Mbàmbulaan en action</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">
                Une journée simulée pour comprendre comment la plateforme coordonne les arrivages, les besoins, les opportunités, les transactions et l’impact territorial.
              </p>
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

        <InsightPanel
          className="mt-6"
          eyebrow="Storytelling métier"
          title="Les moments clés de la journée"
          description="La démonstration relie les événements terrain, la détection automatique, la coordination opérationnelle et la lecture institutionnelle."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {narrativeMoments.map((moment) => (
              <ModuleCard key={moment.title}>
                <UiStatusBadge tone={moment.tone}>{moment.label}</UiStatusBadge>
                <h3 className="mt-4 text-xl font-black">{moment.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#14312d]/70">{moment.description}</p>
              </ModuleCard>
            ))}
          </div>
        </InsightPanel>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">{journey.title}</p>
              <h2 className="mt-3 text-3xl font-black">Parcours guidé en 10 étapes</h2>
            </div>
            <p className="text-sm font-black text-[#14312d]/60">{visibleSteps}/{totalSteps} étapes visibles</p>
          </div>

          <div className="mt-8 grid gap-4">
            {narrativeSteps.map((step) => {
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
                      <StepDetail label="Donnée clé" value={step.data} />
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
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Décision assistée par Mbàmbulaan</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl bg-[#f7f4ec] p-5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">Action à traiter</p>
              <p className="mt-2 text-2xl font-black">{priorities.actionsPrioritaires[0]?.titre ?? "Aucune action prioritaire"}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/65">{priorities.actionsPrioritaires[0]?.description ?? "Les données mock restent équilibrées."}</p>
              {priorities.actionsPrioritaires[0] ? <PriorityBadge priority={priorities.actionsPrioritaires[0].priorite} /> : null}
            </div>
            <div className="grid gap-3">
              {priorities.actionsPrioritaires.slice(1, 4).map((action) => (
                <Link key={action.id} href={action.href} className="rounded-2xl bg-[#f7f4ec] p-5 transition hover:bg-[#eee7d7]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-black">{action.titre}</p>
                      <p className="mt-1 text-sm font-semibold text-[#14312d]/65">{action.description}</p>
                    </div>
                    <PriorityBadge priority={action.priorite} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Mbàmbulaan alerte les acteurs au bon moment</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl bg-[#f7f4ec] p-5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">Alerte prioritaire</p>
              <p className="mt-2 text-2xl font-black">{alertes[0]?.titre ?? "Aucune alerte critique"}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/65">{alertes[0]?.description ?? "La journée mock reste sous contrôle."}</p>
              {alertes[0] ? <AlertBadge level={alertes[0].niveau} /> : null}
            </div>
            <div className="grid gap-3">
              {alertes.slice(1, 4).map((alerte) => (
                <Link key={alerte.id} href={alerte.lienAction} className="rounded-2xl bg-[#f7f4ec] p-5 transition hover:bg-[#eee7d7]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-black">{alerte.titre}</p>
                      <p className="mt-1 text-sm font-semibold text-[#14312d]/65">{alerte.acteurConcerne} · {alerte.zoneOuQuai}</p>
                    </div>
                    <AlertBadge level={alerte.niveau} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Traçabilité de bout en bout</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl bg-[#f7f4ec] p-5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">Lot suivi</p>
              <p className="mt-2 text-2xl font-black">{lotsSuivis[0]?.lotId ?? "Aucun lot suivi"}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/65">
                {lotsSuivis[0] ? `${lotsSuivis[0].quantite} de ${lotsSuivis[0].espece} · ${lotsSuivis[0].quai} · ${lotsSuivis[0].statutActuel}` : "Lancez la démonstration pour suivre un lot complet."}
              </p>
            </div>
            <div className="grid gap-3">
              {lotsSuivis[0]?.historique.slice(0, 4).map((event) => (
                <div key={event.id} className="rounded-2xl bg-[#f7f4ec] p-5">
                  <p className="text-lg font-black">{event.titre}</p>
                  <p className="mt-1 text-sm font-semibold text-[#14312d]/65">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Mbàmbulaan aide à sauver les lots sensibles</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl bg-[#f7f4ec] p-5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">Lot à traiter</p>
              <p className="mt-2 text-2xl font-black">{sensitiveLots[0]?.espece ?? "Aucun lot sensible"}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/65">
                {sensitiveLots[0] ? `${sensitiveLots[0].lotId} · ${sensitiveLots[0].quai} · ${sensitiveLots[0].actionRecommandee}` : "Les lots mockés ne présentent pas de risque critique immédiat."}
              </p>
              {sensitiveLots[0] ? <RiskBadge risk={sensitiveLots[0].risqueGaspillage} /> : null}
            </div>
            <div className="grid gap-3">
              {sensitiveLots.slice(1, 4).map((lot) => (
                <div key={lot.lotId} className="rounded-2xl bg-[#f7f4ec] p-5">
                  <p className="text-lg font-black">{lot.espece}</p>
                  <p className="mt-1 text-sm font-semibold text-[#14312d]/65">{lot.fraicheur} · {lot.actionRecommandee}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
          <SectionHeader
            eyebrow="Conclusion"
            title="Ce que Mbàmbulaan démontre"
            description="Le MVP montre qu'une plateforme de coordination peut rendre la filière plus visible, plus réactive et plus lisible pour les acteurs publics comme privés."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {demoProofPoints.map((point) => (
              <ModuleCard key={point}>
                <p className="text-sm font-black leading-6 text-[#14312d]/75">{point}</p>
              </ModuleCard>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
          <h2 className="text-2xl font-black">Explorer les modules</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {moduleLinks.filter((item) => ctaLinks.includes(item.href)).map((item) => (
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
  { href: "/quais", label: "Quais" },
  { href: "/coordination", label: "Coordination" },
  { href: "/executive", label: "Executive" }
];

const progressItems = [
  { label: "Arrivage", firstStep: 1, lastStep: 1 },
  { label: "Besoin", firstStep: 2, lastStep: 2 },
  { label: "Opportunité", firstStep: 3, lastStep: 4 },
  { label: "Réservation", firstStep: 5, lastStep: 5 },
  { label: "Transaction", firstStep: 6, lastStep: 8 },
  { label: "Impact", firstStep: 9, lastStep: 10 }
];

const ctaLinks = ["/arrivages", "/besoins", "/opportunites", "/transactions", "/dashboard", "/coordination", "/executive"];

const narrativeMoments: Array<{ label: string; title: string; description: string; tone: StatusTone }> = [
  {
    label: "Terrain",
    title: "Le problème terrain",
    description: "Les lots arrivent vite, la demande est dispersée et les décisions se prennent souvent sans vision consolidée.",
    tone: "warning"
  },
  {
    label: "Moteur",
    title: "La détection intelligente",
    description: "Mbàmbulaan rapproche automatiquement les arrivages disponibles et les besoins compatibles.",
    tone: "info"
  },
  {
    label: "Coordination",
    title: "La coordination des acteurs",
    description: "Les acteurs voient les priorités, réservent les lots et suivent les transactions sans backend réel dans ce MVP.",
    tone: "success"
  },
  {
    label: "Lot",
    title: "La traçabilité du lot",
    description: "Chaque lot peut être suivi depuis le débarquement jusqu'à la réservation, la transaction et les notifications.",
    tone: "dark"
  },
  {
    label: "Territoire",
    title: "L’impact territorial",
    description: "Le dashboard et la carte montrent les quais actifs, les tensions et la valeur économique potentielle.",
    tone: "impact"
  },
  {
    label: "Décision",
    title: "La lecture décideur",
    description: "Les priorités, alertes et risques sont rendus lisibles pour une collectivité, une administration ou un partenaire.",
    tone: "danger"
  }
];

const demoProofPoints = [
  "Meilleure visibilité des arrivages publiés sur les quais.",
  "Meilleure coordination entre pêcheurs, mareyeurs, transformateurs et collectivités.",
  "Réduction du risque de perte grâce à la qualification des lots sensibles.",
  "Suivi des réservations et transactions dans un parcours lisible.",
  "Lecture territoriale des tensions, quais actifs et priorités.",
  "Aide à la décision publique avec une synthèse exécutive exploitable."
];

function buildNarrativeSteps(
  steps: DemoJourneyData["steps"],
  context: {
    sensitiveLot?: SensitiveLot;
    tracedLot?: TraceableLot;
    priorityTitle?: string;
    impactValue: string;
  }
): NarrativeStep[] {
  const byId = new Map(steps.map((step) => [step.id, step]));
  const arrivage = byId.get(2) ?? steps[0];
  const besoin = byId.get(3) ?? steps[1] ?? arrivage;
  const opportunite = byId.get(4) ?? steps[2] ?? arrivage;
  const reservation = byId.get(5) ?? opportunite;
  const transaction = byId.get(6) ?? reservation;
  const notification = byId.get(7) ?? transaction;
  const dashboard = byId.get(8) ?? notification;
  const lot = context.sensitiveLot;
  const trace = context.tracedLot;

  return [
    {
      id: 1,
      title: "Un arrivage est déclaré",
      description: arrivage.description,
      actor: arrivage.actor,
      data: arrivage.data,
      module: "Arrivages",
      businessValue: "Le lot devient visible dès son débarquement.",
      href: "/arrivages"
    },
    {
      id: 2,
      title: "Un besoin existe",
      description: besoin.description,
      actor: besoin.actor,
      data: besoin.data,
      module: "Besoins",
      businessValue: "La demande est structurée et exploitable par le moteur.",
      href: "/besoins"
    },
    {
      id: 3,
      title: "Mbàmbulaan détecte une opportunité",
      description: opportunite.description,
      actor: opportunite.actor,
      data: opportunite.data,
      module: "Opportunités",
      businessValue: opportunite.businessValue,
      href: "/opportunites"
    },
    {
      id: 4,
      title: "Le lot est qualifié",
      description: "Le MVP évalue la fraîcheur, le risque de gaspillage et l'action à mener en priorité.",
      actor: "Moteur qualité",
      data: lot ? `${lot.espece} · ${lot.fraicheur} · risque ${lot.risqueGaspillage}` : "Qualification qualité mockée",
      module: "Qualité",
      businessValue: lot?.actionRecommandee ?? "Les lots sensibles sont remontés avant perte de valeur.",
      href: "/arrivages"
    },
    {
      id: 5,
      title: "Le lot est réservé",
      description: reservation.description,
      actor: reservation.actor,
      data: reservation.data,
      module: "Opportunités",
      businessValue: reservation.businessValue,
      href: reservation.href
    },
    {
      id: 6,
      title: "La transaction est suivie",
      description: transaction.description,
      actor: transaction.actor,
      data: transaction.data,
      module: "Transactions",
      businessValue: transaction.businessValue,
      href: "/transactions"
    },
    {
      id: 7,
      title: "Les acteurs sont alertés",
      description: notification.description,
      actor: notification.actor,
      data: notification.data,
      module: "Notifications",
      businessValue: notification.businessValue,
      href: "/notifications"
    },
    {
      id: 8,
      title: "Le lot est tracé",
      description: "L'historique relie arrivage, opportunité, réservation, transaction et notification.",
      actor: "Traçabilité",
      data: trace ? `${trace.lotId} · ${trace.statutActuel}` : "Historique de lot simulé",
      module: "Traçabilité",
      businessValue: "La confiance augmente car le parcours du lot devient vérifiable.",
      href: "/transactions"
    },
    {
      id: 9,
      title: "L'impact est mesuré",
      description: dashboard.description,
      actor: dashboard.actor,
      data: context.impactValue,
      module: "Dashboard",
      businessValue: "La valeur économique, sociale et territoriale est consolidée.",
      href: "/dashboard"
    },
    {
      id: 10,
      title: "Le décideur voit les priorités",
      description: "La synthèse exécutive transforme les signaux métier en décisions actionnables.",
      actor: "Collectivité, administration ou partenaire",
      data: context.priorityTitle ?? "Priorités opérationnelles du jour",
      module: "Executive",
      businessValue: "Les arbitrages publics ou partenariaux deviennent plus rapides et mieux documentés.",
      href: "/executive"
    }
  ];
}

function ImpactMetric({ label, value }: { label: string; value: string }) {
  return <MetricCard label={label} value={value} tone="default" />;
}

function StepDetail({ label, value }: { label: string; value: string }) {
  return <MetricCard label={label} value={value} tone="default" size="compact" />;
}

function FinalMetric({ label, value }: { label: string; value: string }) {
  return <MetricCard label={label} value={value} tone="dark" />;
}

function ImpactResult({ label, value }: { label: string; value: string }) {
  return <MetricCard label={label} value={value} />;
}

function TensionBadge({ level }: { level: "Faible" | "Moyenne" | "Forte" | "Critique" }) {
  const tone = getTensionTone(level);
  return <UiStatusBadge tone={toneFromLevel(tone)} className="mt-4">{level}</UiStatusBadge>;
}

function PriorityBadge({ priority }: { priority: "Critique" | "Haute" | "Moyenne" | "Faible" }) {
  const tone = getPriorityTone(priority);
  return <UiStatusBadge tone={toneFromLevel(tone)} className="mt-4">{priority}</UiStatusBadge>;
}

function AlertBadge({ level }: { level: "info" | "attention" | "critique" }) {
  const tone = getAlertTone(level);
  return <UiStatusBadge tone={tone === "critical" ? "danger" : tone === "high" ? "warning" : "info"} className="mt-4">{level}</UiStatusBadge>;
}

function RiskBadge({ risk }: { risk: Parameters<typeof getWasteRiskTone>[0] }) {
  return <UiStatusBadge tone={toneFromLevel(getWasteRiskTone(risk))} className="mt-4">{risk}</UiStatusBadge>;
}

function toneFromLevel(tone: "low" | "medium" | "high" | "critical"): StatusTone {
  if (tone === "low") return "success";
  if (tone === "medium") return "warning";
  if (tone === "high") return "warning";
  return "danger";
}
