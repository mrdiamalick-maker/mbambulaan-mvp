"use client";

import Link from "next/link";
import { useState } from "react";
import type { DemoScenarioResult } from "@/platform/product-suite/integrated-demo-scenario";

export function ProductTestConsole() {
  const [result, setResult] = useState<DemoScenarioResult>();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string>();

  async function runScenario() {
    setRunning(true);
    setError(undefined);
    try {
      const response = await fetch("/api/v1/demo/cold-chain", { method: "POST" });
      if (!response.ok) throw new Error("Le scénario transversal n'a pas pu être exécuté.");
      setResult(await response.json() as DemoScenarioResult);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erreur inconnue.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] p-5 text-[var(--mb-neutral-900)] sm:p-8 lg:p-10">
      <div className="mx-auto max-w-[84rem]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Test système intégré</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--mb-navy-900)] sm:text-4xl">Scénario chaîne du froid</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--mb-neutral-600)]">Exécute un flux réel entre Cooperative, Business, Government et Atlas dans le même runtime.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/produit" className="inline-flex h-11 items-center rounded border border-[var(--mb-neutral-300)] px-4 text-xs font-bold">Suite produit</Link>
            <button type="button" onClick={() => void runScenario()} disabled={running} className="h-11 rounded bg-[var(--mb-navy-700)] px-4 text-xs font-bold text-white disabled:opacity-50">
              {running ? "Exécution…" : "Lancer le scénario"}
            </button>
          </div>
        </div>

        {error ? <div className="mt-6 border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</div> : null}

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Cooperative", "Déclare le besoin et le flux bloqué"],
            ["Business", "Porte la capacité de froid à mobiliser"],
            ["Government", "Déclenche l'analyse et reçoit le briefing"],
            ["Atlas", "Analyse, évalue et recommande"],
          ].map(([name, description]) => (
            <article key={name} className="border border-[var(--mb-neutral-200)] bg-white p-5">
              <h2 className="font-semibold text-[var(--mb-navy-900)]">{name}</h2>
              <p className="mt-2 text-xs leading-5 text-[var(--mb-neutral-600)]">{description}</p>
            </article>
          ))}
        </section>

        {result ? (
          <>
            <section className="mt-8 border border-[var(--mb-neutral-200)] bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-3 border-b border-[var(--mb-neutral-200)] pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">{result.scenarioId}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">{result.name}</h2>
                </div>
                <p className="text-xs text-[var(--mb-neutral-500)]">Terminé à {new Date(result.completedAt).toLocaleString("fr-FR")}</p>
              </div>

              <ol className="mt-6 space-y-4">
                {result.steps.map((step, index) => (
                  <li key={step.code} className="grid gap-3 border border-[var(--mb-neutral-200)] p-4 md:grid-cols-[3rem_8rem_minmax(0,1fr)_auto] md:items-center">
                    <span className="font-mono text-[var(--mb-ocean-600)]">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-xs font-bold uppercase">{step.productCode}</span>
                    <span className="text-sm">{step.label}</span>
                    <span className="font-mono text-[9px] text-[var(--mb-neutral-400)]">{step.evidence}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-6 grid gap-px border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] md:grid-cols-3 xl:grid-cols-6">
              <Metric label="Signaux ouverts" value={result.outcome.openSignals} />
              <Metric label="Questions Atlas" value={result.outcome.atlasQuestions} />
              <Metric label="Insights" value={result.outcome.atlasInsights} />
              <Metric label="Scénarios" value={result.outcome.atlasScenarios} />
              <Metric label="Briefings" value={result.outcome.atlasBriefings} />
              <Metric label="Événements traités" value={result.outcome.processedEvents} />
            </section>
          </>
        ) : (
          <section className="mt-8 border border-dashed border-[var(--mb-neutral-300)] p-8 text-center text-sm text-[var(--mb-neutral-500)]">
            Aucun scénario exécuté. Lance le test pour observer le flux inter-produits.
          </section>
        )}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="bg-white p-5"><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">{value}</p></div>;
}
