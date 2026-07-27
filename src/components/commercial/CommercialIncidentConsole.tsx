"use client";

import { useState } from "react";

type Snapshot = {
  incidents: Array<{ id: string; orderId: string; type: string; status: string; buyerRefundXof: number; description: string }>;
  economics: { totalBuyerRefundXof: number; netPlatformRevenueXof: number };
};

export function CommercialIncidentConsole() {
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [message, setMessage] = useState("Chargez une transaction livrée, puis signalez un incident réel.");
  const [busy, setBusy] = useState(false);

  async function session(identityId: string, territoryId: string) {
    const response = await fetch("/api/v1/access/sessions", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ identityId, territoryId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message ?? "Session impossible.");
    return data.session.id as string;
  }

  async function post(identityId: string, territoryId: string, commandId: string, command: Record<string, unknown>) {
    const token = await session(identityId, territoryId);
    const response = await fetch("/api/v1/commercial-incidents", {
      method: "POST",
      headers: { "content-type": "application/json", "x-mbambulaan-demo-session": token },
      body: JSON.stringify({ commandId, command }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message ?? "Action impossible.");
    setSnapshot(data.snapshot);
  }

  async function findDeliveredOrder() {
    const token = await session("demo-buyer-hotel-dakar", "territory-dakar");
    const response = await fetch("/api/v1/commercial-flow/commands", { headers: { "x-mbambulaan-demo-session": token } });
    const data = await response.json();
    const order = data.orders?.find((item: { status: string }) => ["delivered", "payment_requested", "paid", "reconciled"].includes(item.status));
    if (!order) throw new Error("Aucune commande livrée n'est disponible. Terminez d'abord le parcours /terrain-commerce.");
    return order.id as string;
  }

  async function run(action: "open" | "assess" | "resolve") {
    setBusy(true);
    try {
      if (action === "open") {
        const orderId = await findDeliveredOrder();
        await post("demo-buyer-hotel-dakar", "territory-dakar", `incident-open-${orderId}`, {
          type: "open", incidentId: `incident-${orderId}`, orderId, incidentType: "partial_delivery",
          description: "80 kg manquants à la réception.",
        });
        setMessage("Incident signalé. Le contrôle financier doit maintenant évaluer l'écart.");
      } else {
        const incident = snapshot?.incidents.find((item) => item.status === (action === "assess" ? "open" : "assessed"));
        if (!incident) throw new Error("Aucun incident compatible avec cette action.");
        if (action === "assess") {
          await post("demo-finance-officer", "territory-national", `incident-assess-${incident.id}`, {
            type: "assess", incidentId: incident.id, deliveredQuantityKg: 320, acceptedQuantityKg: 320,
            logisticsPenaltyXof: 20_000, platformGoodwillXof: 5_000,
            note: "Écart confirmé par la preuve de pesée et le constat de livraison.",
          });
          setMessage("Évaluation terminée : le remboursement et les ajustements sont calculés.");
        } else {
          await post("demo-finance-officer", "territory-national", `incident-resolve-${incident.id}`, {
            type: "resolve", incidentId: incident.id, note: "Remboursement approuvé et dossier clôturé.",
          });
          setMessage("Incident résolu et clôturé.");
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action impossible.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
    <header className="bg-[var(--mb-navy-900)] px-5 py-7 text-white"><div className="mx-auto max-w-5xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Incidents commerciaux</p>
      <h1 className="mt-2 text-3xl font-semibold">Signaler, évaluer et compenser</h1>
      <p className="mt-3 text-sm text-white/65">Chaque écart terrain produit un impact financier explicite et traçable.</p>
    </div></header>
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-4 text-sm">{message}</div>
      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <Action title="1. Signaler" text="Acheteur : livraison partielle" disabled={busy} onClick={() => void run("open")} />
        <Action title="2. Évaluer" text="Finance : calculer les ajustements" disabled={busy} onClick={() => void run("assess")} />
        <Action title="3. Résoudre" text="Finance : approuver et clôturer" disabled={busy} onClick={() => void run("resolve")} />
      </section>
      <section className="mt-6 grid grid-cols-2 gap-3">
        <Metric label="Remboursement acheteur" value={snapshot?.economics.totalBuyerRefundXof ?? 0} />
        <Metric label="Revenu net Mbàmbulaan" value={snapshot?.economics.netPlatformRevenueXof ?? 0} />
      </section>
      <section className="mt-6 space-y-3">{snapshot?.incidents.map((incident) => <article key={incident.id} className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-4">
        <p className="text-xs font-bold uppercase text-[var(--mb-neutral-400)]">{incident.status} · {incident.type}</p>
        <h2 className="mt-1 font-semibold">{incident.orderId}</h2><p className="mt-2 text-sm">{incident.description}</p>
        <p className="mt-3 text-sm font-bold">Remboursement : {incident.buyerRefundXof.toLocaleString("fr-FR")} FCFA</p>
      </article>)}</section>
    </div>
  </main>;
}

function Action({ title, text, disabled, onClick }: { title: string; text: string; disabled: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="min-h-28 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-4 text-left shadow-sm disabled:opacity-40">
    <span className="block font-semibold">{title}</span><span className="mt-2 block text-sm text-[var(--mb-neutral-500)]">{text}</span>
  </button>;
}
function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-4"><p className="text-xs uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-xl font-semibold">{value.toLocaleString("fr-FR")} FCFA</p></div>;
}
