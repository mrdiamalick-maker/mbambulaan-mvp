"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DemoJourney as DemoJourneyData } from "@/lib/demo";

export function DemoJourney({ journey }: { journey: DemoJourneyData }) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const isRunning = visibleSteps > 0 && visibleSteps < journey.steps.length;
  const isComplete = visibleSteps === journey.steps.length;

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setTimeout(() => setVisibleSteps((current) => Math.min(current + 1, journey.steps.length)), 850);

    return () => window.clearTimeout(timer);
  }, [isRunning, journey.steps.length, visibleSteps]);

  function launchDemo() {
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
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Mbàmbulaan orchestre toute la chaîne, pas seulement une vente.</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">{journey.summary}</p>
            </div>
            <div className="rounded-3xl bg-[#f7f4ec] p-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <ImpactMetric label="Opportunites" value={String(journey.impact.opportunities)} />
                <ImpactMetric label="Couverture" value={`${journey.impact.coverageRate}%`} />
                <ImpactMetric label="Quai actif" value={journey.impact.topQuai.replace("Quai de ", "")} />
              </div>
              <button
                type="button"
                onClick={launchDemo}
                className="mt-5 h-12 w-full rounded-2xl bg-[#14312d] px-5 text-sm font-black text-white transition hover:bg-[#1e4a43]"
              >
                {isComplete ? "Relancer la démo" : "Lancer la démo"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">{journey.title}</p>
              <h2 className="mt-3 text-3xl font-black">Parcours guidé en 7 étapes</h2>
            </div>
            <p className="text-sm font-black text-[#14312d]/60">{visibleSteps}/7 étapes visibles</p>
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
                        <p className="mt-2 text-sm font-bold text-[#14312d]/65">{step.businessValue}</p>
                      </div>
                      <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-[#d65a31] ring-1 ring-[#14312d]/10">{step.module}</span>
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
