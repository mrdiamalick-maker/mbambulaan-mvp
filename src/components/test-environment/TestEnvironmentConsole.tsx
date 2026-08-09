"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { IntegratedTestEnvironmentSnapshot } from "@/platform/test-environment/integrated-test-environment";

interface ActionResponse {
  environment: IntegratedTestEnvironmentSnapshot;
  result?: unknown;
  error?: { message: string };
}

export function TestEnvironmentConsole() {
  const [environment, setEnvironment] = useState<IntegratedTestEnvironmentSnapshot>();
  const [busyAction, setBusyAction] = useState<string>();
  const [error, setError] = useState<string>();

  async function refresh() {
    const response = await fetch("/api/v1/test-environment", { cache: "no-store" });
    if (!response.ok) throw new Error("Impossible de charger l'environnement de test.");
    setEnvironment(await response.json() as IntegratedTestEnvironmentSnapshot);
  }

  async function execute(action: Record<string, unknown>) {
    const actionName = String(action.action ?? "action");
    setBusyAction(actionName);
    setError(undefined);
    try {
      const response = await fetch("/api/v1/test-environment/actions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(action),
      });
      const body = await response.json() as ActionResponse | IntegratedTestEnvironmentSnapshot;
      if (!response.ok) {
        const failure = body as ActionResponse;
        throw new Error(failure.error?.message ?? "L'action de test a échoué.");
      }
      if ("environment" in body) setEnvironment(body.environment);
      else setEnvironment(body);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erreur inconnue.");
    } finally {
      setBusyAction(undefined);
    }
  }

  useEffect(() => {
    void refresh().catch((caught: unknown) => {
      setError(caught instanceof Error ? caught.message : "Erreur inconnue.");
    });
  }, []);

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto max-w-[90rem] px-5 py-8 sm:px-8 lg:px-10">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Environnement complet de test</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tester Mbàmbulaan de bout en bout</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Runtime, Atlas, PostgreSQL, notifications, météo, documents et paiements simulés dans un environnement réinitialisable.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/produit" className="inline-flex h-11 items-center rounded border border-white/20 px-4 text-xs font-bold">Suite produit</Link>
              <Link href="/atlas" className="inline-flex h-11 items-center rounded border border-white/20 px-4 text-xs font-bold">Atlas</Link>
              <button type="button" onClick={() => void execute({ action: "reset" })} disabled={Boolean(busyAction)} className="h-11 rounded bg-white px-4 text-xs font-bold text-[var(--mb-navy-900)] disabled:opacity-50">Réinitialiser</button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[90rem] px-5 py-8 sm:px-8 lg:px-10">
        {error ? <div className="mb-6 border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</div> : null}
        {!environment ? <p className="text-sm text-[var(--mb-neutral-500)]">Chargement de l'environnement…</p> : null}

        {environment ? (
          <>
            <section className="grid gap-px border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] md:grid-cols-4 xl:grid-cols-8">
              <Metric label="État" value={environment.status === "ready" ? "Prêt" : environment.status} />
              <Metric label="Infrastructures" value={environment.infrastructures.length.toString()} />
              <Metric label="Événements traités" value={environment.runtime.processedEvents.toString()} />
              <Metric label="Échecs runtime" value={environment.runtime.failedEvents.toString()} />
              <Metric label="Signaux ouverts" value={environment.runtime.openSignals.toString()} />
              <Metric label="Insights Atlas" value={environment.runtime.atlasInsights.toString()} />
              <Metric label="Paiements" value={environment.payments.length.toString()} />
              <Metric label="Resets" value={environment.resetCount.toString()} />
            </section>

            <section className="mt-8 border border-[var(--mb-neutral-200)] bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--mb-ocean-600)]">Scénario principal</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">Chaîne du froid inter-produits</h2>
                  <p className="mt-2 text-sm text-[var(--mb-neutral-600)]">Injecte un blocage de 2 400 kg, produit un signal, interroge Atlas, évalue un scénario et génère un briefing.</p>
                </div>
                <button type="button" onClick={() => void execute({ action: "run_cold_chain_scenario" })} disabled={Boolean(busyAction)} className="h-11 rounded bg-[var(--mb-navy-700)] px-5 text-xs font-bold text-white disabled:opacity-50">
                  {busyAction === "run_cold_chain_scenario" ? "Exécution…" : "Lancer le scénario complet"}
                </button>
              </div>
              {environment.latestScenario ? (
                <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                  <Metric label="Étapes" value={environment.latestScenario.steps.length.toString()} />
                  <Metric label="Signaux" value={environment.latestScenario.outcome.openSignals.toString()} />
                  <Metric label="Questions Atlas" value={environment.latestScenario.outcome.atlasQuestions.toString()} />
                  <Metric label="Insights" value={environment.latestScenario.outcome.atlasInsights.toString()} />
                  <Metric label="Scénarios" value={environment.latestScenario.outcome.atlasScenarios.toString()} />
                  <Metric label="Briefings" value={environment.latestScenario.outcome.atlasBriefings.toString()} />
                </div>
              ) : null}
            </section>

            <section className="mt-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--mb-ocean-600)]">État technique</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">Infrastructures</h2>
                </div>
                <button type="button" onClick={() => void refresh()} className="text-xs font-bold text-[var(--mb-ocean-700)]">Actualiser</button>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {environment.infrastructures.map((item) => (
                  <article key={item.code} className="border border-[var(--mb-neutral-200)] bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-[var(--mb-navy-900)]">{item.name}</h3>
                      <span className="rounded border border-[var(--mb-neutral-300)] px-2 py-1 font-mono text-[8px] uppercase">{item.status}</span>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[var(--mb-neutral-600)]">{item.detail}</p>
                    <div className="mt-4 flex justify-between font-mono text-[9px] uppercase text-[var(--mb-neutral-400)]"><span>{item.mode}</span><span>{item.operations} opération(s)</span></div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-2">
              <ActionPanel title="Connecteurs simulés" description="Tester les échanges terrain sans dépendre d'un fournisseur externe.">
                <ActionButton label="Envoyer un SMS" busy={busyAction === "send_sms"} onClick={() => void execute({ action: "send_sms", recipient: "+221770000000", message: "Retour attendu à 16h au site de Dakar." })} />
                <ActionButton label="Envoyer un WhatsApp" busy={busyAction === "send_whatsapp"} onClick={() => void execute({ action: "send_whatsapp", recipient: "+221780000000", message: "Capacité froide demandée pour 2 400 kg." })} />
                <ActionButton label="Recevoir la météo" busy={busyAction === "get_weather"} onClick={() => void execute({ action: "get_weather", territoryId: "territory-dakar" })} />
                <ActionButton label="Analyser une preuve" busy={busyAction === "scan_document"} onClick={() => void execute({ action: "scan_document", documentId: `document-${Date.now()}`, fileName: "preuve-debarquement.pdf" })} />
              </ActionPanel>

              <ActionPanel title="Paiement Mobile Money" description="Tester la demande, la confirmation et la traçabilité d'un règlement en FCFA.">
                <ActionButton label="Demander 850 000 FCFA" busy={busyAction === "request_payment"} onClick={() => void execute({ action: "request_payment", paymentId: `payment-${Date.now()}`, payerActorId: "buyer-demo", beneficiaryActorId: "cooperative-dakar-demo", amountXof: 850000, provider: "wave_simulator" })} />
                {environment.payments.filter((payment) => payment.status === "requested").map((payment) => (
                  <ActionButton key={payment.id} label={`Confirmer ${payment.amountXof.toLocaleString("fr-FR")} FCFA`} busy={busyAction === "confirm_payment"} onClick={() => void execute({ action: "confirm_payment", paymentId: payment.id })} />
                ))}
                <div className="mt-4 space-y-3">
                  {environment.payments.map((payment) => (
                    <div key={payment.id} className="border border-[var(--mb-neutral-200)] p-4 text-sm">
                      <div className="flex justify-between gap-3"><strong>{payment.amountXof.toLocaleString("fr-FR")} FCFA</strong><span>{payment.status}</span></div>
                      <p className="mt-2 font-mono text-[9px] text-[var(--mb-neutral-400)]">{payment.providerReference ?? payment.id}</p>
                    </div>
                  ))}
                </div>
              </ActionPanel>
            </section>

            <section className="mt-8 border border-[var(--mb-neutral-200)] bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-[var(--mb-navy-900)]">Journal des opérations</h2>
              <div className="mt-5 space-y-2">
                {[...environment.operations].reverse().map((operation) => (
                  <div key={operation.id} className="grid gap-2 border-b border-[var(--mb-neutral-200)] py-3 text-xs md:grid-cols-[12rem_10rem_minmax(0,1fr)]">
                    <span className="font-mono text-[var(--mb-neutral-400)]">{new Date(operation.occurredAt).toLocaleString("fr-FR")}</span>
                    <strong>{operation.type.replaceAll("_", " ")}</strong>
                    <span className="text-[var(--mb-neutral-600)]">{operation.reference ?? JSON.stringify(operation.payload)}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="bg-white p-5"><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">{value}</p></div>;
}

function ActionPanel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="border border-[var(--mb-neutral-200)] bg-white p-6"><h2 className="text-xl font-semibold text-[var(--mb-navy-900)]">{title}</h2><p className="mt-2 text-xs leading-5 text-[var(--mb-neutral-600)]">{description}</p><div className="mt-5 flex flex-wrap gap-3">{children}</div></section>;
}

function ActionButton({ label, busy, onClick }: { label: string; busy: boolean; onClick: () => void }) {
  return <button type="button" disabled={busy} onClick={onClick} className="h-10 rounded border border-[var(--mb-neutral-300)] px-4 text-xs font-bold disabled:opacity-50">{busy ? "Traitement…" : label}</button>;
}
