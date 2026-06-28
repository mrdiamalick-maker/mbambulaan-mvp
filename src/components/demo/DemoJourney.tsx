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

    const timer = window.setTimeout(() => setActiveStep((step) => Math.min(step + 1, flow.length)), 460);

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
              className={`whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-black transition ${
                item.href === "/demo" ? "border-[#14312d] bg-[#14312d] text-white" : "border-[#14312d]/12 bg-white text-[#14312d]/70 hover:border-[#14312d]/35"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="mt-5 grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
          <ProductCard className="flex flex-col justify-between gap-5 overflow-hidden p-0" tone="plain">
            <div
              className="bg-[#0F2D4A] bg-cover bg-center p-5 text-white"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(15,45,74,0.88), rgba(31,111,139,0.52)), url('/images/mbambulaan/sea-texture.webp')"
              }}
            >
            <div>
              <StatusBadge tone={running ? "success" : "neutral"}>{running ? "Simulation active" : "État initial"}</StatusBadge>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">Démonstration opérationnelle</h1>
              <p className="mt-3 text-sm font-semibold leading-6 text-white/76">Suivez un lot depuis le quai jusqu’à l’impact.</p>
            </div>
            </div>

            <div className="grid gap-3 px-5">
              <StateList active={!running} title="Avant" items={beforeState} />
              <StateList active={running} title="Après" items={afterState} />
            </div>

            <Button onClick={launchSimulation} className="mx-5 mb-5 w-[calc(100%-2.5rem)]">
              {running ? "Relancer la simulation" : "Lancer la simulation"}
            </Button>
          </ProductCard>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <LivingLotCard lot={lot} qualityScore={quality?.score} running={running} />

            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard label="Opportunités" value={running ? String(opportunites.length) : "0"} tone={running ? "info" : "warm"} size="compact" />
                <MetricCard label="Transactions" value={running ? String(transactions.length) : "0"} tone={running ? "success" : "warm"} size="compact" />
                <MetricCard label="Impact" value={running ? impact.poissonSauve : "Non calculé"} tone={running ? "success" : "warm"} size="compact" />
                <MetricCard label="Alertes" value={running ? String(alerts.length) : "0"} tone={running ? "info" : "warm"} size="compact" />
              </div>
              <DecisionPanel active={running} alert={alerts[0]?.titre} decision={decision?.titre} tension={tension?.raison} zone={tension?.quai} />
            </div>
          </div>
        </section>

        <ProductCard className="mt-4" tone="plain">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d65a31]">Flux compact</p>
              <h2 className="mt-2 text-2xl font-black">Arrivage → Décision</h2>
            </div>
            <StatusBadge tone={running ? "info" : "neutral"}>{running ? "flux activé" : "flux inactif"}</StatusBadge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {flow.map((step, index) => (
              <FlowStep
                key={step.title}
                active={running && activeStep >= index + 1}
                detail={running ? step.detail : "Non connecté"}
                href={step.href}
                index={index + 1}
                status={!running ? "off" : activeStep > index + 1 ? "ok" : activeStep === index + 1 ? "actif" : "à venir"}
                title={step.title}
                tone={!running ? "neutral" : activeStep > index + 1 ? "success" : activeStep === index + 1 ? "info" : "warning"}
              />
            ))}
          </div>
        </ProductCard>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
          <ProductCard tone="plain">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d65a31]">Parties prenantes</p>
            <h2 className="mt-2 text-2xl font-black">Chaque acteur reçoit une action claire</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {stakeholders.map((actor) => (
                <ActorNode key={actor.role} active={running} action={actor.action} benefit={actor.benefit} need={actor.need} role={actor.role} tone={actor.tone} />
              ))}
            </div>
          </ProductCard>

          <ProductCard tone="plain">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d65a31]">Sortie de plateforme</p>
            <h2 className="mt-2 text-2xl font-black">Décision recommandée</h2>
            <div className="mt-5 grid gap-3">
              <DecisionLine label="Décision" value={running ? "Orienter les mareyeurs vers Hann et prioriser les lots sensibles." : "Aucune décision structurée."} />
              <DecisionLine label="Pourquoi" value={running ? "700 kg demandés, 0 kg disponibles, tension critique." : "Les données restent dispersées."} />
              <DecisionLine label="Impact attendu" value={running ? "Réduction du risque de perte et meilleure couverture des besoins." : "Impact non mesuré."} />
            </div>
          </ProductCard>
        </section>
      </div>
    </PageShell>
  );
}

function StateList({ active, items, title }: { active: boolean; items: string[]; title: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${active ? "border-[#1F6F8B]/28 bg-[#EAF6F8]" : "border-[#0F2D4A]/8 bg-white text-[#0F2D4A]/55"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black">{title}</p>
        <StatusBadge tone={active ? "impact" : "neutral"}>{active ? "visible" : "référence"}</StatusBadge>
      </div>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div key={item} className="rounded-xl bg-white px-3 py-2 text-sm font-bold ring-1 ring-[#0F2D4A]/8">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function LivingLotCard({ lot, qualityScore, running }: { lot?: ReturnType<typeof computeTraceability>[number]; qualityScore?: number; running: boolean }) {
  return (
    <ProductCard tone={running ? "active" : "soft"} className="min-h-full overflow-hidden p-0">
      <div
        className="h-28 bg-[#1F6F8B] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(15,45,74,0.24), rgba(15,45,74,0.04)), url('/images/mbambulaan/fishermen-action.webp')"
        }}
        aria-hidden="true"
      />
      <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#D85A34]">Le lot vivant</p>
          <h2 className="mt-2 text-2xl font-black">{running ? (lot?.espece ?? "Sardinelle ronde") : "Lot non suivi"}</h2>
          <p className="mt-1 text-sm font-semibold text-[#0F2D4A]/62">{running ? (lot ? `${lot.quai} · ${lot.lotId}` : "Kayar · lot pilote") : "Aucune vue partagée"}</p>
        </div>
        <StatusBadge tone={running ? "success" : "neutral"}>{running ? "actif" : "isolé"}</StatusBadge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetricCard label="Espèce" value={running ? (lot?.espece ?? "Sardinelle") : "Inconnue"} size="compact" tone="default" />
        <MetricCard label="Quai" value={running ? (lot?.quai ?? "Kayar") : "Non relié"} size="compact" tone="default" />
        <MetricCard label="Quantité" value={running ? (lot?.quantite ?? "700 kg") : "Non suivie"} size="compact" tone="default" />
        <MetricCard label="Qualité" value={running ? `${qualityScore ?? 88}/100` : "Non évaluée"} size="compact" tone="default" />
        <MetricCard label="Statut" value={running ? (lot?.statutActuel ?? "Opportunité détectée") : "Dispersé"} size="compact" tone="default" />
        <MetricCard label="Transaction" value={running ? (lot?.transactionLiee?.statut ?? "À créer") : "Absente"} size="compact" tone="default" />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-[#0F2D4A]/8">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#D85A34]">Traçabilité</p>
        <p className="mt-2 text-sm font-bold leading-6 text-[#0F2D4A]/66">
          {running ? (lot?.historique.slice(0, 4).map((event) => event.titre).join(" → ") ?? "Arrivage → Opportunité → Réservation → Transaction") : "Non disponible"}
        </p>
      </div>
      </div>
    </ProductCard>
  );
}

function DecisionPanel({ active, alert, decision, tension, zone }: { active: boolean; alert?: string; decision?: string; tension?: string; zone?: string }) {
  return (
    <ProductCard tone={active ? "dark" : "plain"}>
      <StatusBadge tone={active ? "impact" : "neutral"}>Décision recommandée</StatusBadge>
      <h2 className="mt-3 text-xl font-black">{active ? (decision ?? "Orienter les mareyeurs vers Hann") : "Décision informelle"}</h2>
      <p className={`mt-2 text-sm font-semibold leading-6 ${active ? "text-white/72" : "text-[#14312d]/62"}`}>
        {active ? (alert ?? tension ?? "700 kg demandés, tension critique.") : "Les arbitrages restent faits par téléphone."}
      </p>
      <p className={`mt-4 text-xs font-black uppercase tracking-[0.12em] ${active ? "text-[#F7F2E8]" : "text-[#D85A34]"}`}>{zone ?? "Hann"}</p>
    </ProductCard>
  );
}

function DecisionLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#0F2D4A]/8 bg-[#F7F2E8] p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#D85A34]">{label}</p>
      <p className="mt-2 text-sm font-black leading-6 text-[#0F2D4A]/78">{value}</p>
    </div>
  );
}

function buildFlow(journey: DemoJourneyData, impact: ReturnType<typeof computeImpactMetrics>, transactionStatus?: string, decisionTitle?: string): FlowItem[] {
  const byId = new Map(journey.steps.map((step) => [step.id, step]));
  return [
    { title: "Arrivage", detail: byId.get(2)?.data ?? "Lot déclaré", href: "/arrivages" },
    { title: "Besoin", detail: byId.get(3)?.data ?? "Besoin détecté", href: "/besoins" },
    { title: "Opportunité", detail: byId.get(4)?.data ?? "Correspondance créée", href: "/opportunites" },
    { title: "Réservation", detail: byId.get(5)?.data ?? "Lot réservé", href: "/opportunites" },
    { title: "Transaction", detail: transactionStatus ?? "Retrait suivi", href: "/transactions" },
    { title: "Impact", detail: `${impact.poissonSauve} sauvés`, href: "/dashboard" },
    { title: "Décision", detail: decisionTitle ?? "Action priorisée", href: "/executive" }
  ];
}

const navLinks = [
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

const beforeState = ["Informations dispersées", "Besoin invisible", "Lot non suivi", "Décision informelle"];
const afterState = ["Lot déclaré", "Besoin détecté", "Opportunité créée", "Transaction suivie", "Impact calculé", "Décision recommandée"];

const stakeholders = [
  { role: "Pêcheur", need: "Besoin", action: "Déclarer le lot", benefit: "Plus de visibilité", tone: "success" as const },
  { role: "Mareyeur", need: "Besoin", action: "Réserver le bon lot", benefit: "Meilleure disponibilité", tone: "info" as const },
  { role: "Transformateur", need: "Besoin", action: "Capter le surplus", benefit: "Moins de perte", tone: "warning" as const },
  { role: "Collectivité", need: "Besoin", action: "Suivre les tensions", benefit: "Lecture territoriale", tone: "impact" as const },
  { role: "Administration", need: "Besoin", action: "Lire l’impact", benefit: "Décision publique", tone: "dark" as const }
];
