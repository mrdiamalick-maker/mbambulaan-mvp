"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import { computeIntelligentAlerts } from "@/lib/alerts";
import { computeMatching } from "@/lib/coordination";
import type { DemoJourney as DemoJourneyData } from "@/lib/demo";
import { computeImpactMetrics } from "@/lib/impact";
import { computePrioritizationMetrics } from "@/lib/prioritization";
import { computeSensitiveLots } from "@/lib/quality";
import { createCoordinationSimulation, coordinationSimulationStorageKey } from "@/lib/simulation";
import type { CoordinationSimulation } from "@/lib/simulation";
import { computeTensionMetrics } from "@/lib/tension";
import { computeTraceability } from "@/lib/traceability";
import { ActorNode } from "@/components/ui/ActorNode";
import { Button } from "@/components/ui/Button";
import { FlowStep } from "@/components/ui/FlowStep";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageShell } from "@/components/ui/PageShell";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

type FlowItem = {
  title: string;
  detail: string;
  href: string;
};

export function DemoJourney({ arrivages, besoins, journey }: { arrivages: Arrivage[]; besoins: Besoin[]; journey: DemoJourneyData }) {
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [simulation, setSimulation] = useState<CoordinationSimulation | null>(null);

  const baseOpportunites = useMemo(() => computeMatching(arrivages, besoins), [arrivages, besoins]);
  const allArrivages = useMemo(() => (simulation ? [...simulation.arrivages, ...arrivages] : arrivages), [arrivages, simulation]);
  const allBesoins = useMemo(() => (simulation ? [...simulation.besoins, ...besoins] : besoins), [besoins, simulation]);
  const opportunites = simulation?.opportunites ?? baseOpportunites;
  const transactions = simulation?.transactions ?? [];
  const notifications = simulation?.notifications ?? [];
  const impact = useMemo(() => computeImpactMetrics(allArrivages, allBesoins, opportunites, transactions), [allArrivages, allBesoins, opportunites, transactions]);
  const priorities = useMemo(() => computePrioritizationMetrics(allArrivages, allBesoins, opportunites, transactions), [allArrivages, allBesoins, opportunites, transactions]);
  const tensions = useMemo(() => computeTensionMetrics(allArrivages, allBesoins, opportunites, transactions), [allArrivages, allBesoins, opportunites, transactions]);
  const alerts = useMemo(() => computeIntelligentAlerts(allArrivages, allBesoins, opportunites, transactions, notifications), [allArrivages, allBesoins, opportunites, transactions, notifications]);
  const traceableLots = useMemo(() => computeTraceability(allArrivages, opportunites, transactions, notifications), [allArrivages, opportunites, transactions, notifications]);
  const sensitiveLots = useMemo(() => computeSensitiveLots(allArrivages, { besoins: allBesoins, opportunites, transactions }), [allArrivages, allBesoins, opportunites, transactions]);

  const lot = traceableLots[0];
  const quality = sensitiveLots[0];
  const decision = priorities.actionsPrioritaires[0];
  const tension = tensions.zonesPrioritaires[0];
  const flow = buildFlow(journey, impact, transactions[0]?.statut, decision?.titre);

  useEffect(() => {
    if (!running || activeStep >= flow.length) return;

    const timer = window.setTimeout(() => setActiveStep((step) => Math.min(step + 1, flow.length)), 440);

    return () => window.clearTimeout(timer);
  }, [activeStep, flow.length, running]);

  function launchSimulation() {
    const nextSimulation = createCoordinationSimulation(arrivages, besoins);
    window.localStorage.setItem(coordinationSimulationStorageKey, JSON.stringify(nextSimulation));
    setSimulation(nextSimulation);
    setRunning(true);
    setActiveStep(1);
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center gap-2 overflow-x-auto pb-1">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-black transition ${
                item.href === "/demo" ? "bg-[#F8FAFC] text-[#0F2D4A] ring-1 ring-[#1F6F8B]/18" : "text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F2D4A]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="mt-6 grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch">
          <ProductCard className="flex flex-col justify-between gap-5">
            <div>
              <StatusBadge tone={running ? "success" : "info"}>{running ? "Simulation lancée" : "Parcours guidé"}</StatusBadge>
              <h1 className="mt-4 text-3xl font-black leading-tight text-[#0F2D4A] sm:text-4xl">Démonstration Mbàmbulaan</h1>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#334155]">Suivez un lot depuis le quai jusqu’à l’impact.</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#334155]">
                Cette démonstration relie les modules entre eux pour montrer le parcours complet, contrairement aux pages métier qui affichent chaque module séparément.
              </p>
            </div>

            <div className="grid gap-3">
              <StateList title="Avant" items={beforeState} active={!running} />
              <StateList title="Après" items={afterState} active={running} />
            </div>

            <Button onClick={launchSimulation} className="w-full">
              {running ? "Relancer la simulation" : "Lancer la simulation"}
            </Button>
          </ProductCard>

          <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
            <LivingLotCard lot={lot} qualityScore={quality?.score} running={running} />

            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard label="Opportunités" value={running ? String(opportunites.length) : "0"} tone={running ? "info" : "warm"} size="compact" />
                <MetricCard label="Transactions" value={running ? String(transactions.length) : "0"} tone={running ? "success" : "warm"} size="compact" />
                <MetricCard label="Impact" value={running ? impact.poissonSauve : "Non mesuré"} tone={running ? "success" : "warm"} size="compact" />
                <MetricCard label="Alertes" value={running ? String(alerts.length) : "0"} tone={running ? "info" : "warm"} size="compact" />
              </div>
              <DecisionPanel active={running} alert={alerts[0]?.titre} decision={decision?.titre} tension={tension?.raison} zone={tension?.quai} />
            </div>
          </div>
        </section>

        <ProductCard className="mt-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Modules activés</p>
              <h2 className="mt-2 text-2xl font-black text-[#0F2D4A]">Arrivages → Besoins → Opportunités → Transactions → Impact → Décision</h2>
            </div>
            <StatusBadge tone={running ? "success" : "neutral"}>{running ? "flux actif" : "prêt"}</StatusBadge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {flow.map((step, index) => (
              <FlowStep
                key={step.title}
                active={running && activeStep >= index + 1}
                detail={running ? step.detail : "À observer"}
                href={step.href}
                index={index + 1}
                status={!running ? "démo" : activeStep > index + 1 ? "activé" : activeStep === index + 1 ? "en cours" : "à venir"}
                title={step.title}
                tone={!running ? "neutral" : activeStep > index + 1 ? "success" : activeStep === index + 1 ? "info" : "warning"}
              />
            ))}
          </div>
        </ProductCard>

        <ProductCard className="mt-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Acteurs mobilisés</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {stakeholders.map((actor) => (
              <ActorNode key={actor.role} active={running} action={actor.action} benefit={actor.benefit} role={actor.role} tone={actor.tone} />
            ))}
          </div>
        </ProductCard>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <ProductCard className="bg-[#F8FAFC]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Par où commencer ?</p>
            <div className="mt-5 grid gap-3">
              {startSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-[#0F2D4A]/8">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F8FAFC] text-xs font-black text-[#0F2D4A] ring-1 ring-[#1F6F8B]/18">{index + 1}</span>
                  <p className="text-sm font-black text-[#0F2D4A]">{step}</p>
                </div>
              ))}
            </div>
          </ProductCard>

          <ProductCard>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Décision recommandée</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <DecisionLine label="Décision" value={running ? "Orienter les mareyeurs vers Hann et prioriser les lots sensibles." : "Lancer la simulation pour consolider la décision."} />
              <DecisionLine label="Pourquoi" value={running ? "700 kg demandés, tension critique et lot sensible." : "Avant la démo, les signaux restent séparés."} />
              <DecisionLine label="Impact attendu" value={running ? "Moins de perte, meilleure couverture et lecture territoriale." : "Impact visible après activation du scénario."} />
            </div>
          </ProductCard>
        </section>
      </div>
    </PageShell>
  );
}

function StateList({ active, items, title }: { active: boolean; items: string[]; title: string }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${active ? "bg-white ring-[#1F6F8B]/24" : "bg-[#F8FAFC] text-[#334155] ring-[#0F2D4A]/8"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-[#0F2D4A]">{title}</p>
        <StatusBadge tone={active ? "info" : "neutral"}>{active ? "visible" : "référence"}</StatusBadge>
      </div>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div key={item} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-[#334155] ring-1 ring-[#0F2D4A]/7">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function LivingLotCard({ lot, qualityScore, running }: { lot?: ReturnType<typeof computeTraceability>[number]; qualityScore?: number; running: boolean }) {
  return (
    <ProductCard tone={running ? "active" : "plain"} className="min-h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Lot central</p>
          <h2 className="mt-2 text-2xl font-black text-[#0F2D4A]">{running ? (lot?.espece ?? "Sardinelle ronde") : "Lot non suivi"}</h2>
          <p className="mt-1 text-sm font-semibold text-[#334155]">{running ? (lot ? `${lot.quai} · ${lot.lotId}` : "Kayar · lot pilote") : "Aucune vue partagée"}</p>
        </div>
        <StatusBadge tone={running ? "success" : "neutral"}>{running ? "suivi" : "isolé"}</StatusBadge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetricCard label="Espèce" value={running ? (lot?.espece ?? "Sardinelle") : "Inconnue"} size="compact" tone="default" />
        <MetricCard label="Quai" value={running ? (lot?.quai ?? "Kayar") : "Non relié"} size="compact" tone="default" />
        <MetricCard label="Quantité" value={running ? (lot?.quantite ?? "700 kg") : "Non suivie"} size="compact" tone="default" />
        <MetricCard label="Qualité" value={running ? `${qualityScore ?? 88}/100` : "Non évaluée"} size="compact" tone="default" />
        <MetricCard label="Transaction" value={running ? (lot?.transactionLiee?.statut ?? "À créer") : "Absente"} size="compact" tone="default" />
        <MetricCard label="Traçabilité" value={running ? "Activée" : "Non disponible"} size="compact" tone="default" />
      </div>

      <div className="mt-4 rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#0F2D4A]/8">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1F6F8B]">Historique du lot</p>
        <p className="mt-2 text-sm font-bold leading-6 text-[#334155]">
          {running ? (lot?.historique.slice(0, 4).map((event) => event.titre).join(" → ") ?? "Arrivage → Opportunité → Réservation → Transaction") : "L’historique apparaît quand la simulation relie les modules."}
        </p>
      </div>
    </ProductCard>
  );
}

function DecisionPanel({ active, alert, decision, tension, zone }: { active: boolean; alert?: string; decision?: string; tension?: string; zone?: string }) {
  return (
    <ProductCard className={active ? "ring-1 ring-[#1F6F8B]/20" : ""}>
      <StatusBadge tone={active ? "impact" : "neutral"}>Décision recommandée</StatusBadge>
      <h2 className="mt-3 text-xl font-black text-[#0F2D4A]">{active ? (decision ?? "Orienter les mareyeurs vers Hann") : "Décision non consolidée"}</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#334155]">
        {active ? (alert ?? tension ?? "700 kg demandés, tension critique.") : "Lancez la simulation pour transformer les signaux dispersés en décision lisible."}
      </p>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-[#D85A34]">{zone ?? "Zone pilote"}</p>
    </ProductCard>
  );
}

function DecisionLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#0F2D4A]/8">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1F6F8B]">{label}</p>
      <p className="mt-2 text-sm font-black leading-6 text-[#0F2D4A]">{value}</p>
    </div>
  );
}

function buildFlow(journey: DemoJourneyData, impact: ReturnType<typeof computeImpactMetrics>, transactionStatus?: string, decisionTitle?: string): FlowItem[] {
  const byId = new Map(journey.steps.map((step) => [step.id, step]));
  return [
    { title: "Arrivages", detail: byId.get(2)?.data ?? "Lot déclaré", href: "/arrivages" },
    { title: "Besoins", detail: byId.get(3)?.data ?? "Besoin détecté", href: "/besoins" },
    { title: "Opportunités", detail: byId.get(4)?.data ?? "Correspondance créée", href: "/opportunites" },
    { title: "Transactions", detail: transactionStatus ?? "Retrait suivi", href: "/transactions" },
    { title: "Impact", detail: `${impact.poissonSauve} sauvés`, href: "/dashboard" },
    { title: "Décision", detail: decisionTitle ?? "Action priorisée", href: "/executive" }
  ];
}

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/demo", label: "Démo" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/coordination", label: "Coordination" },
  { href: "/executive", label: "Executive" }
];

const beforeState = ["Arrivage isolé", "Besoin invisible", "Transaction informelle", "Décision non consolidée"];
const afterState = ["Lot suivi", "Opportunité détectée", "Transaction suivie", "Impact mesuré", "Décision recommandée"];

const startSteps = ["Lancer la simulation", "Observer le lot suivi", "Voir la décision recommandée", "Explorer les modules si besoin"];

const stakeholders = [
  { role: "Pêcheur", action: "Déclare le lot", benefit: "Visibilité immédiate", tone: "success" as const },
  { role: "Mareyeur", action: "Réserve", benefit: "Accès au bon volume", tone: "info" as const },
  { role: "Transformateur", action: "Capte un surplus", benefit: "Moins de perte", tone: "warning" as const },
  { role: "Collectivité", action: "Suit les tensions", benefit: "Lecture territoriale", tone: "impact" as const },
  { role: "Administration", action: "Décide", benefit: "Priorités consolidées", tone: "dark" as const }
];
