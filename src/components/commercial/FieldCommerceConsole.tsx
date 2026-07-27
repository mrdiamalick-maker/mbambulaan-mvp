"use client";

import { useMemo, useState } from "react";

const actors = [
  { key: "seller", label: "Coopérative", identityId: "demo-cooperative-dakar", description: "Publier et allouer" },
  { key: "buyer", label: "Acheteur", identityId: "demo-buyer-hotel-dakar", description: "Réserver et payer" },
  { key: "logistics", label: "Logistique", identityId: "demo-cold-chain-operator", description: "Transporter et livrer" },
  { key: "finance", label: "Finance", identityId: "demo-finance-officer", description: "Confirmer et réconcilier" },
] as const;

type ActorKey = typeof actors[number]["key"];

type Step = {
  id: string;
  actor: ActorKey;
  label: string;
  run: (sessionId: string) => Promise<unknown>;
};

export function FieldCommerceConsole() {
  const [activeActor, setActiveActor] = useState<ActorKey>("seller");
  const [completed, setCompleted] = useState<string[]>([]);
  const [busy, setBusy] = useState<string>();
  const [message, setMessage] = useState("Commencez par publier le catalogue vendeur.");

  async function createSession(identityId: string) {
    const response = await fetch("/api/v1/access/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ identityId, territoryId: identityId === "demo-finance-officer" ? "territory-national" : "territory-dakar" }),
    });
    if (!response.ok) throw new Error("Impossible d'ouvrir la session acteur.");
    const data = await response.json() as { session: { id: string } };
    return data.session.id;
  }

  async function post(url: string, sessionId: string, body: unknown) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-mbambulaan-demo-session": sessionId },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message ?? "Action refusée.");
    return data;
  }

  const steps = useMemo<Step[]>(() => [
    {
      id: "seed",
      actor: "seller",
      label: "Publier 1 000 kg de thiof",
      run: (sessionId) => post("/api/v1/commercial-catalog", sessionId, { action: "seed_demo", commandId: "terrain-seed-001", at: "2026-07-27T08:00:00.000Z" }),
    },
    {
      id: "reserve",
      actor: "buyer",
      label: "Réserver 400 kg avec chaîne du froid",
      run: (sessionId) => post("/api/v1/commercial-catalog", sessionId, {
        action: "reserve", commandId: "terrain-reserve-001", reservationId: "reservation-terrain-001",
        offerId: "offer-thiof-01", quantityKg: 400, logisticsOptionId: "log-dakar-cold", at: "2026-07-27T09:00:00.000Z",
      }),
    },
    {
      id: "confirm",
      actor: "buyer",
      label: "Confirmer la réservation",
      run: (sessionId) => post("/api/v1/commercial-catalog", sessionId, {
        action: "confirm_reservation", commandId: "terrain-confirm-001", reservationId: "reservation-terrain-001", at: "2026-07-27T09:05:00.000Z",
      }),
    },
    {
      id: "allocate",
      actor: "seller",
      label: "Allouer le lot à la commande",
      run: (sessionId) => post("/api/v1/commercial-flow/commands", sessionId, {
        commandId: "terrain-allocate-001", command: { type: "allocate_order", orderId: "order-reservation-terrain-001" },
      }),
    },
    {
      id: "transport",
      actor: "logistics",
      label: "Démarrer le transport",
      run: (sessionId) => post("/api/v1/commercial-flow/commands", sessionId, {
        commandId: "terrain-transport-001", command: { type: "start_transport", orderId: "order-reservation-terrain-001" },
      }),
    },
    {
      id: "delivery",
      actor: "logistics",
      label: "Confirmer la livraison avec preuve",
      run: (sessionId) => post("/api/v1/commercial-flow/commands", sessionId, {
        commandId: "terrain-delivery-001", command: { type: "confirm_delivery", orderId: "order-reservation-terrain-001", proofId: "photo-livraison-terrain-001" },
      }),
    },
    {
      id: "payment_request",
      actor: "buyer",
      label: "Initier le paiement de 1 125 000 FCFA",
      run: (sessionId) => post("/api/v1/commercial-flow/commands", sessionId, {
        commandId: "terrain-payment-request-001", command: { type: "request_payment", orderId: "order-reservation-terrain-001" },
      }),
    },
    {
      id: "payment_confirm",
      actor: "finance",
      label: "Confirmer le paiement reçu",
      run: (sessionId) => post("/api/v1/commercial-flow/commands", sessionId, {
        commandId: "terrain-payment-confirm-001", command: { type: "confirm_payment", paymentId: "payment-0001", providerReference: "MM-TERRAIN-001" },
      }),
    },
    {
      id: "reconcile",
      actor: "finance",
      label: "Répartir et réconcilier les fonds",
      run: (sessionId) => post("/api/v1/commercial-flow/commands", sessionId, {
        commandId: "terrain-reconcile-001", command: { type: "reconcile_order", orderId: "order-reservation-terrain-001" },
      }),
    },
  ], []);

  const visibleSteps = steps.filter((step) => step.actor === activeActor);
  const nextIncomplete = steps.find((step) => !completed.includes(step.id));

  async function execute(step: Step) {
    if (nextIncomplete?.id !== step.id) {
      setMessage(`Étape bloquée : ${nextIncomplete?.label ?? "le parcours est terminé"}.`);
      return;
    }
    setBusy(step.id);
    try {
      const actor = actors.find((item) => item.key === step.actor)!;
      const sessionId = await createSession(actor.identityId);
      await step.run(sessionId);
      setCompleted((current) => [...current, step.id]);
      const next = steps.find((item) => item.id === steps[steps.indexOf(step) + 1]?.id);
      setMessage(next ? `Étape validée. Prochaine action : ${next.label}.` : "Transaction terminée et réconciliée.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action impossible.");
    } finally {
      setBusy(undefined);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-7 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Parcours terrain</p>
          <h1 className="mt-2 text-3xl font-semibold">Vendre, transporter et payer</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Chaque acteur réalise uniquement les actions qui lui appartiennent.</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {actors.map((actor) => (
            <button key={actor.key} type="button" onClick={() => setActiveActor(actor.key)}
              className={`rounded-lg border p-3 text-left ${activeActor === actor.key ? "border-[var(--mb-ocean-600)] bg-white" : "border-[var(--mb-neutral-200)] bg-white/60"}`}>
              <span className="block text-sm font-semibold">{actor.label}</span>
              <span className="mt-1 block text-[11px] text-[var(--mb-neutral-500)]">{actor.description}</span>
            </button>
          ))}
        </section>

        <div className="mt-4 rounded-lg border border-[var(--mb-neutral-200)] bg-white p-4 text-sm">{message}</div>

        <section className="mt-5 space-y-3">
          {visibleSteps.map((step) => {
            const done = completed.includes(step.id);
            const enabled = nextIncomplete?.id === step.id;
            return (
              <article key={step.id} className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--mb-neutral-400)]">{done ? "Terminé" : enabled ? "À faire" : "En attente"}</p>
                    <h2 className="mt-1 text-base font-semibold">{step.label}</h2>
                  </div>
                  <button type="button" disabled={!enabled || Boolean(busy)} onClick={() => void execute(step)}
                    className="min-h-11 rounded-lg bg-[var(--mb-navy-800)] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-35">
                    {busy === step.id ? "Validation…" : done ? "Validé" : "Valider"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-6 grid grid-cols-3 gap-2 text-center">
          <Metric label="Étapes" value={`${completed.length}/9`} />
          <Metric label="Acheteur" value="1 125 000" suffix="FCFA" />
          <Metric label="Mbàmbulaan" value="25 000" suffix="FCFA" />
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return <div className="rounded-lg border border-[var(--mb-neutral-200)] bg-white p-3"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-1 text-sm font-semibold">{value} {suffix}</p></div>;
}
