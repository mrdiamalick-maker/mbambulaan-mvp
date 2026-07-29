"use client";

import { useCallback, useEffect, useState } from "react";

const actors = [
  { key: "seller", label: "Coopérative", identityId: "demo-cooperative-dakar", description: "Publier et allouer" },
  { key: "buyer", label: "Acheteur", identityId: "demo-buyer-hotel-dakar", description: "Réserver et payer" },
  { key: "logistics", label: "Logistique", identityId: "demo-cold-chain-operator", description: "Transporter et livrer" },
  { key: "finance", label: "Finance", identityId: "demo-finance-officer", description: "Confirmer et réconcilier" },
] as const;

type ActorKey = typeof actors[number]["key"];
type WorkItemKind = "publish_offer" | "reserve_offer" | "confirm_reservation" | "allocate_order" | "start_transport" | "confirm_delivery" | "request_payment" | "confirm_payment" | "reconcile_order";
type WorkItem = {
  id: string;
  kind: WorkItemKind;
  title: string;
  description: string;
  priority: "normal" | "high";
  offerId?: string;
  logisticsOptionId?: string;
  suggestedQuantityKg?: number;
  orderId?: string;
  reservationId?: string;
  paymentId?: string;
  amountXof?: number;
};
type QueueResponse = { items: WorkItem[] };
type FlowSnapshot = { economics?: { platformRevenueXof?: number; confirmedPaymentsXof?: number }; orders?: Array<{ status: string }> };

export function FieldCommerceConsole() {
  const [activeActor, setActiveActor] = useState<ActorKey>("seller");
  const [sessionId, setSessionId] = useState<string>();
  const [items, setItems] = useState<WorkItem[]>([]);
  const [busy, setBusy] = useState<string>();
  const [message, setMessage] = useState("Chargement des tâches terrain…");
  const [flow, setFlow] = useState<FlowSnapshot>();

  const createSession = useCallback(async (actorKey: ActorKey) => {
    const actor = actors.find((item) => item.key === actorKey)!;
    const response = await fetch("/api/v1/access/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ identityId: actor.identityId, territoryId: actorKey === "finance" ? "territory-national" : "territory-dakar" }),
    });
    if (!response.ok) throw new Error("Impossible d'ouvrir la session acteur.");
    const data = await response.json() as { session: { id: string } };
    return data.session.id;
  }, []);

  const load = useCallback(async (actorKey: ActorKey) => {
    setMessage("Mise à jour des tâches…");
    try {
      const token = await createSession(actorKey);
      setSessionId(token);
      const [queueResponse, flowResponse] = await Promise.all([
        fetch("/api/v1/commercial-work-queue", { headers: { "x-mbambulaan-demo-session": token } }),
        fetch("/api/v1/commercial-flow/commands", { headers: { "x-mbambulaan-demo-session": token } }),
      ]);
      const queueData = await queueResponse.json() as QueueResponse & { error?: { message?: string } };
      if (!queueResponse.ok) throw new Error(queueData.error?.message ?? "Impossible de charger les tâches.");
      setItems(queueData.items);
      if (flowResponse.ok) setFlow(await flowResponse.json() as FlowSnapshot);
      setMessage(queueData.items.length > 0 ? `${queueData.items.length} action(s) à traiter.` : "Aucune action en attente pour cet acteur.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Chargement impossible.");
      setItems([]);
    }
  }, [createSession]);

  useEffect(() => { void load(activeActor); }, [activeActor, load]);

  async function post(url: string, token: string, body: unknown) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-mbambulaan-demo-session": token },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message ?? "Action refusée.");
    return data;
  }

  async function execute(item: WorkItem) {
    if (!sessionId) return;
    setBusy(item.id);
    try {
      const commandId = `${item.kind}-${crypto.randomUUID()}`;
      if (item.kind === "publish_offer") {
        await post("/api/v1/commercial-catalog", sessionId, { action: "seed_demo", commandId, at: new Date().toISOString() });
      } else if (item.kind === "reserve_offer") {
        await post("/api/v1/commercial-catalog", sessionId, {
          action: "reserve", commandId, reservationId: `reservation-${crypto.randomUUID()}`,
          offerId: item.offerId, quantityKg: item.suggestedQuantityKg, logisticsOptionId: item.logisticsOptionId,
          ttlMinutes: 60, at: new Date().toISOString(),
        });
      } else if (item.kind === "confirm_reservation") {
        await post("/api/v1/commercial-catalog", sessionId, { action: "confirm_reservation", commandId, reservationId: item.reservationId, at: new Date().toISOString() });
      } else {
        await post("/api/v1/commercial-flow/commands", sessionId, { commandId, command: commandFor(item) });
      }
      setMessage(`Action validée : ${item.title}.`);
      await load(activeActor);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action impossible.");
    } finally {
      setBusy(undefined);
    }
  }

  const completedOrders = flow?.orders?.filter((order) => order.status === "reconciled").length ?? 0;
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-7 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Opérations terrain</p>
          <h1 className="mt-2 text-3xl font-semibold">Mes actions du jour</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Les tâches viennent directement des stocks, commandes, livraisons et paiements enregistrés.</p>
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

        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[var(--mb-neutral-200)] bg-white p-4 text-sm">
          <span>{message}</span>
          <button type="button" onClick={() => void load(activeActor)} className="rounded-md border px-3 py-2 text-xs font-semibold">Actualiser</button>
        </div>

        <section className="mt-5 space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--mb-ocean-700)]">{item.priority === "high" ? "Prioritaire" : "À faire"}</p>
                  <h2 className="mt-1 text-base font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-[var(--mb-neutral-500)]">{item.description}</p>
                  {item.amountXof !== undefined && <p className="mt-2 text-sm font-semibold">{new Intl.NumberFormat("fr-FR").format(item.amountXof)} FCFA</p>}
                </div>
                <button type="button" disabled={Boolean(busy)} onClick={() => void execute(item)}
                  className="min-h-11 rounded-lg bg-[var(--mb-navy-800)] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-35">
                  {busy === item.id ? "Validation…" : "Valider"}
                </button>
              </div>
            </article>
          ))}
          {items.length === 0 && <div className="rounded-xl border border-dashed border-[var(--mb-neutral-300)] p-8 text-center text-sm text-[var(--mb-neutral-500)]">Aucune tâche pour le moment. Passez à l’acteur suivant ou actualisez.</div>}
        </section>

        <section className="mt-6 grid grid-cols-3 gap-2 text-center">
          <Metric label="À traiter" value={String(items.length)} />
          <Metric label="Transactions" value={String(completedOrders)} />
          <Metric label="Revenu Mbàmbulaan" value={new Intl.NumberFormat("fr-FR").format(flow?.economics?.platformRevenueXof ?? 0)} suffix="FCFA" />
        </section>
      </div>
    </main>
  );
}

function commandFor(item: WorkItem) {
  switch (item.kind) {
    case "allocate_order": return { type: "allocate_order", orderId: item.orderId };
    case "start_transport": return { type: "start_transport", orderId: item.orderId };
    case "confirm_delivery": return { type: "confirm_delivery", orderId: item.orderId, proofId: `proof-${crypto.randomUUID()}`, at: new Date().toISOString() };
    case "request_payment": return { type: "request_payment", orderId: item.orderId, at: new Date().toISOString() };
    case "confirm_payment": return { type: "confirm_payment", paymentId: item.paymentId, providerReference: `MM-${Date.now()}`, at: new Date().toISOString() };
    case "reconcile_order": return { type: "reconcile_order", orderId: item.orderId, at: new Date().toISOString() };
    default: throw new Error("Cette action n'est pas une commande commerciale.");
  }
}

function Metric({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return <div className="rounded-lg border border-[var(--mb-neutral-200)] bg-white p-3"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-1 text-sm font-semibold">{value} {suffix}</p></div>;
}
