"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/Button";
import { MapPanel } from "@/components/ui/MapPanel";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageShell } from "@/components/ui/PageShell";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function DemoJourney({ arrivages, besoins }: { arrivages: Arrivage[]; besoins: Besoin[]; journey: DemoJourneyData }) {
  const [running, setRunning] = useState(false);
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

  function launchSimulation() {
    const nextSimulation = createCoordinationSimulation(arrivages, besoins);
    window.localStorage.setItem(coordinationSimulationStorageKey, JSON.stringify(nextSimulation));
    setSimulation(nextSimulation);
    setRunning(true);
  }

  return (
    <PageShell className="bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center gap-2 overflow-x-auto pb-1">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-black transition ${item.href === "/demo" ? "bg-[#0F2D4A] text-white" : "bg-white text-[#334155] ring-1 ring-[#E2E8F0] hover:text-[#0F2D4A]"}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="mt-6 rounded-[2rem] bg-[#0F2D4A] p-6 text-white shadow-[0_18px_45px_rgba(15,45,74,0.16)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-center">
            <div>
              <StatusBadge tone={running ? "success" : "info"}>{running ? "Simulation active" : "Scénario guidé"}</StatusBadge>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Démonstration Mbàmbulaan</h1>
              <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-white/76">
                Un scénario guidé qui relie les modules : arrivage, besoin, opportunité, transaction, impact et décision.
              </p>
            </div>
            <Button onClick={launchSimulation} className="w-full">
              Lancer la simulation
            </Button>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.82fr_1.1fr_0.82fr]">
          <StateColumn title="Avant" active={!running} items={beforeState} />
          <LotCockpit lot={lot} qualityScore={quality?.score} running={running} />
          <StateColumn title="Après" active={running} items={afterState} after />
        </section>

        <ProductCard className="mt-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Flux activé</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {flowSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-2 text-xs font-black ${running ? "bg-[#0F2D4A] text-white" : "bg-[#F8FAFC] text-[#334155] ring-1 ring-[#E2E8F0]"}`}>{step}</span>
                {index < flowSteps.length - 1 ? <span className="text-[#1F6F8B]">→</span> : null}
              </div>
            ))}
          </div>
        </ProductCard>

        <section className="mt-5 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <ProductCard>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Acteurs</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-5 xl:grid-cols-1">
              {stakeholders.map((actor) => (
                <div key={actor.role} className="rounded-2xl bg-[#F8FAFC] p-3 ring-1 ring-[#E2E8F0]">
                  <p className="text-sm font-black text-[#0F2D4A]">{actor.role}</p>
                  <p className="mt-1 text-xs font-semibold text-[#334155]">{actor.action}</p>
                </div>
              ))}
            </div>
          </ProductCard>
          <DecisionBlock running={running} alert={alerts[0]?.titre} decision={decision?.titre} tension={tension?.raison} zone={tension?.quai} impact={impact.poissonSauve} />
        </section>

        <div className="mt-5">
          <MapPanel title="Le territoire réagit au scénario" />
        </div>
      </div>
    </PageShell>
  );
}

function StateColumn({ active, after = false, items, title }: { active: boolean; after?: boolean; items: string[]; title: string }) {
  return (
    <ProductCard className={active ? (after ? "bg-[#EAF3EE]" : "bg-[#F7F2E8]") : ""}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-[#0F2D4A]">{title}</h2>
        <StatusBadge tone={active ? (after ? "success" : "warning") : "neutral"}>{active ? "visible" : "référence"}</StatusBadge>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item} className={`rounded-2xl p-4 text-sm font-black ${active ? "bg-white text-[#0F2D4A]" : "bg-[#F8FAFC] text-[#334155]"} ring-1 ring-[#E2E8F0]`}>
            {item}
          </div>
        ))}
      </div>
    </ProductCard>
  );
}

function LotCockpit({ lot, qualityScore, running }: { lot?: ReturnType<typeof computeTraceability>[number]; qualityScore?: number; running: boolean }) {
  return (
    <ProductCard className="bg-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Lot suivi</p>
          <h2 className="mt-2 text-3xl font-black text-[#0F2D4A]">{running ? (lot?.espece ?? "Sardinelle ronde") : "Lot non relié"}</h2>
          <p className="mt-1 text-sm font-semibold text-[#334155]">{running ? (lot ? `${lot.quai} · ${lot.lotId}` : "Kayar · lot pilote") : "Activez la simulation"}</p>
        </div>
        <StatusBadge tone={running ? "success" : "neutral"}>{running ? "tracé" : "isolé"}</StatusBadge>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetricCard label="Espèce" value={running ? (lot?.espece ?? "Sardinelle") : "Inconnue"} size="compact" tone="default" />
        <MetricCard label="Quai" value={running ? (lot?.quai ?? "Kayar") : "Non relié"} size="compact" tone="default" />
        <MetricCard label="Quantité" value={running ? (lot?.quantite ?? "700 kg") : "Non suivie"} size="compact" tone="default" />
        <MetricCard label="Qualité" value={running ? `${qualityScore ?? 88}/100` : "Non évaluée"} size="compact" tone="default" />
        <MetricCard label="Statut" value={running ? (lot?.statutActuel ?? "Opportunité") : "Dispersé"} size="compact" tone="default" />
        <MetricCard label="Transaction" value={running ? (lot?.transactionLiee?.statut ?? "À créer") : "Absente"} size="compact" tone="default" />
      </div>
    </ProductCard>
  );
}

function DecisionBlock({ alert, decision, impact, running, tension, zone }: { alert?: string; decision?: string; impact: string; running: boolean; tension?: string; zone?: string }) {
  return (
    <section className="rounded-3xl bg-[#0F2D4A] p-5 text-white shadow-[0_18px_45px_rgba(15,45,74,0.18)]">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-white/62">Décision finale</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <DecisionItem label="Décision recommandée" value={running ? (decision ?? "Orienter les mareyeurs vers Hann et prioriser les lots sensibles.") : "Lancer la simulation pour obtenir la décision."} />
        <DecisionItem label="Pourquoi" value={running ? (alert ?? tension ?? "Tension critique, besoin non couvert, risque de perte.") : "Les signaux ne sont pas encore consolidés."} />
        <DecisionItem label="Impact" value={running ? `${impact} sauvés et meilleure couverture.` : "Impact visible après activation."} />
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-white/62">{zone ?? "Zone pilote"}</p>
    </section>
  );
}

function DecisionItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-white/60">{label}</p>
      <p className="mt-2 text-sm font-black leading-6 text-white">{value}</p>
    </div>
  );
}

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/demo", label: "Démo" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/coordination", label: "Coordination" },
  { href: "/executive", label: "Executive" }
];

const beforeState = ["Arrivage isolé", "Besoin invisible", "Transaction informelle", "Décision non consolidée"];
const afterState = ["Opportunité détectée", "Transaction suivie", "Impact mesuré", "Décision recommandée"];
const flowSteps = ["Arrivage", "Besoin", "Opportunité", "Réservation", "Transaction", "Impact", "Décision"];
const stakeholders = [
  { role: "Pêcheur", action: "déclare" },
  { role: "Mareyeur", action: "réserve" },
  { role: "Transformateur", action: "capte" },
  { role: "Collectivité", action: "suit" },
  { role: "Administration", action: "décide" }
];
