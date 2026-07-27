"use client";

import { useState } from "react";
import type { CommercialExecutionSnapshot } from "@/platform/commercial/commercial-financial-execution";
import type { CommercialWorkflowCommand } from "@/platform/commercial/commercial-actor-workflow";

const steps: Array<{
  key: string;
  actor: string;
  identityId: string;
  label: string;
  command: (snapshot?: CommercialExecutionSnapshot) => CommercialWorkflowCommand;
}> = [
  {
    key: "offer",
    actor: "Coopérative vendeuse",
    identityId: "demo-cooperative-dakar",
    label: "Publier l’offre de 2 400 kg",
    command: () => ({ type: "publish_offer", offerId: "offer-actor-demo", sellerOrganizationId: "org-cooperative-dakar", territoryId: "territory-dakar", speciesCode: "thiof", qualityGrade: "A", availableQuantityKg: 2400, unitPriceXof: 2500 }),
  },
  {
    key: "order",
    actor: "Acheteur professionnel",
    identityId: "demo-buyer-hotel-dakar",
    label: "Passer la commande",
    command: () => ({ type: "place_order", orderId: "order-actor-demo", offerId: "offer-actor-demo", buyerOrganizationId: "org-buyer-hotel-dakar", quantityKg: 2400, logisticsAmountXof: 600000, platformCommissionRateBps: 250 }),
  },
  {
    key: "allocate",
    actor: "Coopérative vendeuse",
    identityId: "demo-cooperative-dakar",
    label: "Allouer le lot",
    command: () => ({ type: "allocate_order", orderId: "order-actor-demo" }),
  },
  {
    key: "transport",
    actor: "Opératrice logistique",
    identityId: "demo-cold-chain-operator",
    label: "Démarrer le transport",
    command: () => ({ type: "start_transport", orderId: "order-actor-demo" }),
  },
  {
    key: "delivery",
    actor: "Opératrice logistique",
    identityId: "demo-cold-chain-operator",
    label: "Confirmer la livraison",
    command: () => ({ type: "confirm_delivery", orderId: "order-actor-demo", proofId: "proof-actor-demo" }),
  },
  {
    key: "payment-request",
    actor: "Acheteur professionnel",
    identityId: "demo-buyer-hotel-dakar",
    label: "Initier le paiement",
    command: () => ({ type: "request_payment", orderId: "order-actor-demo", payerOrganizationId: "org-buyer-hotel-dakar" }),
  },
  {
    key: "payment-confirm",
    actor: "Contrôleur financier",
    identityId: "demo-finance-officer",
    label: "Confirmer le paiement simulé",
    command: (snapshot) => ({ type: "confirm_payment", paymentId: snapshot?.payments[0]?.id ?? "payment-0001", providerReference: "MM-ACTOR-DEMO" }),
  },
  {
    key: "reconcile",
    actor: "Contrôleur financier",
    identityId: "demo-finance-officer",
    label: "Réconcilier et répartir",
    command: () => ({ type: "reconcile_order", orderId: "order-actor-demo" }),
  },
];

export function CommercialActorJourneyConsole() {
  const [snapshot, setSnapshot] = useState<CommercialExecutionSnapshot>();
  const [completed, setCompleted] = useState<string[]>([]);
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();

  async function executeStep(index: number) {
    const step = steps[index];
    if (!step || index !== completed.length) return;
    setBusy(step.key);
    setError(undefined);
    try {
      const sessionResponse = await fetch("/api/v1/access/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identityId: step.identityId, territoryId: "territory-dakar" }),
      });
      const sessionPayload = await sessionResponse.json();
      if (!sessionResponse.ok) throw new Error(sessionPayload.error?.message ?? "Session impossible.");
      const response = await fetch("/api/v1/commercial-flow/commands", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mbambulaan-demo-session": sessionPayload.session.id,
        },
        body: JSON.stringify({ commandId: `actor-demo-${String(index + 1).padStart(2, "0")}`, command: step.command(snapshot) }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Commande refusée.");
      setSnapshot(payload as CommercialExecutionSnapshot);
      setCompleted((current) => [...current, step.key]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erreur inconnue.");
    } finally {
      setBusy(undefined);
    }
  }

  const order = snapshot?.orders[0];
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] p-5 text-[var(--mb-neutral-900)] sm:p-8">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--mb-ocean-700)]">Transaction multi-acteurs</p>
        <h1 className="mt-3 text-4xl font-semibold text-[var(--mb-navy-900)]">Vente, livraison et règlement séparés</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--mb-neutral-600)]">Chaque bouton crée la session du seul acteur autorisé à exécuter l’étape. Le journal PostgreSQL permet de reconstruire le parcours après redémarrage.</p>

        {error ? <div className="mt-6 border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</div> : null}

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          {steps.map((step, index) => {
            const done = completed.includes(step.key);
            const active = index === completed.length;
            return (
              <article key={step.key} className="border border-[var(--mb-neutral-200)] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--mb-neutral-400)]">Étape {index + 1} · {step.actor}</p>
                    <h2 className="mt-2 font-semibold text-[var(--mb-navy-900)]">{step.label}</h2>
                  </div>
                  <span className="text-xs font-bold">{done ? "Terminée" : active ? "À exécuter" : "Verrouillée"}</span>
                </div>
                <button type="button" disabled={!active || Boolean(busy)} onClick={() => void executeStep(index)} className="mt-5 h-10 rounded bg-[var(--mb-navy-800)] px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-30">
                  {busy === step.key ? "Exécution…" : "Exécuter avec ce profil"}
                </button>
              </article>
            );
          })}
        </section>

        {snapshot ? (
          <section className="mt-8 grid gap-px border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] md:grid-cols-5">
            <Metric label="Statut" value={order?.status ?? "—"} />
            <Metric label="Marchandise" value={`${snapshot.economics.grossMerchandiseValueXof.toLocaleString("fr-FR")} FCFA`} />
            <Metric label="Logistique" value={`${snapshot.economics.logisticsRevenueXof.toLocaleString("fr-FR")} FCFA`} />
            <Metric label="Mbàmbulaan" value={`${snapshot.economics.platformRevenueXof.toLocaleString("fr-FR")} FCFA`} />
            <Metric label="Paiement confirmé" value={`${snapshot.economics.confirmedPaymentsXof.toLocaleString("fr-FR")} FCFA`} />
          </section>
        ) : null}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="bg-white p-5"><p className="font-mono text-[9px] uppercase tracking-wider text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-lg font-semibold text-[var(--mb-navy-900)]">{value}</p></div>;
}
