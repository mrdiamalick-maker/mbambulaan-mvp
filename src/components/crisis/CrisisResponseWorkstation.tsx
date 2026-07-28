"use client";

import { useCallback, useEffect, useState } from "react";

type Snapshot = {
  crises: Array<{ id: string; title: string; status: string; severity: string }>;
  priorityNeeds: Array<{ id: string; needType: string; status: string; requiredQuantity: number; unit: string }>;
  commitments: Array<{ id: string; actionDescription: string; status: string }>;
  recoveryResults: Array<{ valueProtectedXof: number; volumeSavedKg: number }>;
  metrics: {
    activeCrisisCount: number;
    affectedActorCount: number;
    exposedVolumeKg: number;
    exposedValueXof: number;
    priorityNeedCoveragePercent: number;
    fulfilledCommitmentCount: number;
    blockedCommitmentCount: number;
    actorsProtectedCount: number;
    volumeSavedKg: number;
    valueProtectedXof: number;
    jobsProtectedCount: number;
    averageResponseTimeHours: number;
  };
};

const initial: Snapshot = {
  crises: [], priorityNeeds: [], commitments: [], recoveryResults: [],
  metrics: { activeCrisisCount: 0, affectedActorCount: 0, exposedVolumeKg: 0, exposedValueXof: 0, priorityNeedCoveragePercent: 0, fulfilledCommitmentCount: 0, blockedCommitmentCount: 0, actorsProtectedCount: 0, volumeSavedKg: 0, valueProtectedXof: 0, jobsProtectedCount: 0, averageResponseTimeHours: 0 },
};

export function CrisisResponseWorkstation() {
  const [sessionId, setSessionId] = useState<string>();
  const [snapshot, setSnapshot] = useState<Snapshot>(initial);
  const [message, setMessage] = useState("Ouverture du poste de réponse…");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const sessionResponse = await fetch("/api/v1/access/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identityId: "demo-government-supervisor", territoryId: "territory-national" }),
      });
      const sessionBody = await sessionResponse.json();
      if (!sessionResponse.ok) throw new Error(sessionBody?.error?.message ?? "Impossible d’ouvrir la session.");
      const token = sessionBody.session.id as string;
      setSessionId(token);
      const response = await fetch("/api/v1/crisis-response", { headers: { "x-mbambulaan-demo-session": token } });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Impossible de charger la situation.");
      setSnapshot(body);
      setMessage("Les territoires, besoins prioritaires, décisions, engagements et résultats de reprise sont réunis dans une même boucle.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Chargement impossible.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function execute(command: Record<string, unknown>, success: string) {
    if (!sessionId) return;
    setBusy(true);
    try {
      const response = await fetch("/api/v1/crisis-response", {
        method: "POST",
        headers: { "content-type": "application/json", "x-mbambulaan-demo-session": sessionId },
        body: JSON.stringify({ commandId: `${String(command.type)}-${crypto.randomUUID()}`, command }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Cette action ne peut pas être réalisée.");
      setSnapshot(body.snapshot);
      setMessage(success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action impossible.");
    } finally {
      setBusy(false);
    }
  }

  const crisis = snapshot.crises[0];
  const at = new Date().toISOString();

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Réponse territoriale</p>
          <h1 className="mt-2 text-3xl font-semibold">De la situation grave à la reprise des activités</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Qualifier les impacts, organiser les responsables, couvrir les besoins urgents, suivre les engagements et mesurer la reprise.</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="rounded-lg border border-[var(--mb-neutral-200)] bg-white p-4 text-sm">{message}</div>

        <section className="mt-5 grid gap-4 md:grid-cols-4">
          <Metric label="Acteurs concernés" value={snapshot.metrics.affectedActorCount.toLocaleString("fr-FR")} />
          <Metric label="Volume exposé" value={`${snapshot.metrics.exposedVolumeKg.toLocaleString("fr-FR")} kg`} />
          <Metric label="Besoins couverts" value={`${snapshot.metrics.priorityNeedCoveragePercent}%`} />
          <Metric label="Valeur protégée" value={`${snapshot.metrics.valueProtectedXof.toLocaleString("fr-FR")} FCFA`} />
        </section>

        <section className="mt-5 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--mb-neutral-400)]">Situation principale</p>
              <h2 className="mt-1 text-xl font-semibold">{crisis?.title ?? "Aucune situation grave signalée"}</h2>
            </div>
            <span className="rounded border px-3 py-1 text-xs">{crisis?.status ?? "À signaler"}</span>
          </div>

          {!crisis && <button type="button" disabled={busy} onClick={() => void execute({ type: "report_crisis", crisis: {
            id: `crisis-${crypto.randomUUID()}`, title: "Rupture de froid multi-sites", type: "cold_chain_breakdown",
            territoryIds: ["territory-dakar", "territory-thies"], severity: "critical", description: "Deux chambres froides indisponibles après panne électrique.",
            reportedByActorId: "demo-government-supervisor", reportedAt: at, situationDocumentIds: ["site-report-dakar", "site-report-thies"], status: "reported",
          } }, "Situation grave enregistrée à partir des constats des sites.")} className="mt-5 rounded-lg bg-[var(--mb-navy-800)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">Enregistrer la situation</button>}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Panel title="Besoins urgents" value={`${snapshot.priorityNeeds.length} besoin(s)`} detail="Froid, transport, carburant, contrôle qualité ou soutien solidaire." />
            <Panel title="Engagements" value={`${snapshot.metrics.fulfilledCommitmentCount} exécuté(s)`} detail={`${snapshot.metrics.blockedCommitmentCount} bloqué(s) à traiter.`} />
            <Panel title="Reprise" value={`${snapshot.metrics.volumeSavedKg.toLocaleString("fr-FR")} kg sauvés`} detail={`${snapshot.metrics.jobsProtectedCount} emplois protégés.`} />
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-[var(--mb-neutral-200)] bg-white p-4"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>;
}

function Panel({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <div className="rounded-lg border border-[var(--mb-neutral-200)] p-4"><p className="text-sm font-semibold">{title}</p><p className="mt-2 text-lg">{value}</p><p className="mt-2 text-xs leading-5 text-[var(--mb-neutral-500)]">{detail}</p></div>;
}
