"use client";

import { useState } from "react";
import type { CommercialExecutionSnapshot } from "@/platform/commercial/commercial-financial-execution";

const format = (value: number) => new Intl.NumberFormat("fr-FR").format(value);

export function CommercialFlowConsole() {
  const [data, setData] = useState<CommercialExecutionSnapshot>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setError(undefined);
    try {
      const sessionResponse = await fetch("/api/v1/access/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identityId: "demo-cold-chain-operator", territoryId: "territory-dakar" }),
      });
      const sessionData = await sessionResponse.json() as { session?: { id: string }; error?: { message?: string } };
      if (!sessionResponse.ok || !sessionData.session) throw new Error(sessionData.error?.message ?? "Session commerciale indisponible.");
      const response = await fetch("/api/v1/commercial-flow", {
        method: "POST",
        headers: { "content-type": "application/json", "x-mbambulaan-demo-session": sessionData.session.id },
        body: JSON.stringify({ action: "run_demo" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message ?? "Exécution commerciale impossible.");
      setData(result as CommercialExecutionSnapshot);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  const order = data?.orders[0];
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--mb-ocean-400)]">Flux de valeur testable</p>
          <h1 className="mt-3 text-4xl font-semibold">Chaîne commerciale et financière</h1>
          <p className="mt-3 max-w-3xl text-sm text-white/65">Offre, commande, allocation, transport, livraison, paiement, commission et réconciliation dans un seul parcours.</p>
          <button onClick={() => void run()} disabled={loading} className="mt-6 rounded bg-white px-5 py-3 text-sm font-bold text-[var(--mb-navy-900)] disabled:opacity-60">
            {loading ? "Exécution…" : "Exécuter la vente complète"}
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {error ? <p className="border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
        <section className="grid gap-4 md:grid-cols-5">
          <Metric label="Poisson" value={data?.economics.grossMerchandiseValueXof ?? 0} />
          <Metric label="Logistique" value={data?.economics.logisticsRevenueXof ?? 0} />
          <Metric label="Mbàmbulaan" value={data?.economics.platformRevenueXof ?? 0} />
          <Metric label="Vendeur" value={data?.economics.sellerRevenueXof ?? 0} />
          <Metric label="Payé" value={data?.economics.confirmedPaymentsXof ?? 0} />
        </section>
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="border bg-white p-6">
            <h2 className="text-xl font-semibold">Commande</h2>
            <p className="mt-4 text-sm">Statut : <strong>{order?.status ?? "non exécutée"}</strong></p>
            <p className="mt-2 text-sm">Quantité : <strong>{format(order?.quantityKg ?? 0)} kg</strong></p>
            <p className="mt-2 text-sm">Total acheteur : <strong>{format(order?.buyerTotalXof ?? 0)} FCFA</strong></p>
            <p className="mt-2 text-sm">Preuve : <strong>{order?.deliveryProofId ?? "—"}</strong></p>
          </article>
          <article className="border bg-white p-6">
            <h2 className="text-xl font-semibold">Répartition</h2>
            <div className="mt-4 space-y-3">
              {(data?.ledger ?? []).map((entry) => <div key={entry.id} className="flex justify-between border-b pb-2 text-sm"><span>{entry.beneficiaryType}</span><strong>{format(entry.amountXof)} FCFA</strong></div>)}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="border bg-white p-5"><p className="text-xs uppercase text-[var(--mb-neutral-500)]">{label}</p><p className="mt-2 text-xl font-semibold">{format(value)} FCFA</p></div>;
}
