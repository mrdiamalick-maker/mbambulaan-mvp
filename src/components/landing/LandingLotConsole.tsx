"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ActorKey = "landing" | "weigher" | "cooperative";
type Snapshot = {
  expectedReturns: Array<{ id: string; expectedWeightKg?: number; status: string }>;
  landings: Array<{ id: string; landedAt: string; status: string }>;
  weighings: Array<{ id: string; totalWeightKg: number; confidenceLevel: string }>;
  lots: Array<{ id: string; speciesCode: string; weightKg: number; qualityGrade: string; conservationStatus: string; status: string; destination?: string }>;
};

type DestinationDecision = {
  recommendedDestination: string;
  reasons: string[];
  sustainabilitySignals: string[];
  communityValueSignals: string[];
};

const actors = {
  landing: { label: "Agent de débarquement", identityId: "demo-landing-agent-dakar", purpose: "Confirmer l'arrivée et le débarquement" },
  weigher: { label: "Peseur", identityId: "demo-weigher-dakar", purpose: "Produire et vérifier la pesée" },
  cooperative: { label: "Coopérative", identityId: "demo-cooperative-dakar", purpose: "Constituer et orienter les lots" },
} as const;

export function LandingLotConsole() {
  const [activeActor, setActiveActor] = useState<ActorKey>("landing");
  const [sessionId, setSessionId] = useState<string>();
  const [snapshot, setSnapshot] = useState<Snapshot>({ expectedReturns: [], landings: [], weighings: [], lots: [] });
  const [decision, setDecision] = useState<DestinationDecision>();
  const [message, setMessage] = useState("Initialisation du poste de travail…");
  const [busy, setBusy] = useState(false);

  const createSession = useCallback(async (actor: ActorKey) => {
    const response = await fetch("/api/v1/access/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ identityId: actors[actor].identityId, territoryId: "territory-dakar" }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message ?? "Session impossible.");
    return body.session.id as string;
  }, []);

  const load = useCallback(async (actor: ActorKey) => {
    try {
      const token = await createSession(actor);
      setSessionId(token);
      const response = await fetch("/api/v1/landing-lots", { headers: { "x-mbambulaan-demo-session": token } });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Lecture impossible.");
      setSnapshot(body);
      setMessage(`${actors[actor].label} — ${actors[actor].purpose}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Chargement impossible.");
    }
  }, [createSession]);

  useEffect(() => { void load(activeActor); }, [activeActor, load]);

  async function execute(command: Record<string, unknown>, success: string) {
    if (!sessionId) return;
    setBusy(true);
    try {
      const response = await fetch("/api/v1/landing-lots", {
        method: "POST",
        headers: { "content-type": "application/json", "x-mbambulaan-demo-session": sessionId },
        body: JSON.stringify({ commandId: `${String(command.type)}-${crypto.randomUUID()}`, command }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Action refusée.");
      setSnapshot(body.snapshot);
      if (command.type === "decide_destination") setDecision(body.result as DestinationDecision);
      setMessage(success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action impossible.");
    } finally {
      setBusy(false);
    }
  }

  const landing = snapshot.landings[0];
  const weighing = snapshot.weighings[0];
  const lot = snapshot.lots[0];
  const allocatedWeight = useMemo(() => snapshot.lots.reduce((sum, item) => sum + item.weightKg, 0), [snapshot.lots]);

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Mbàmbulaan Fisher × Cooperative × Business</p>
          <h1 className="mt-2 text-3xl font-semibold">Du débarquement à la bonne destination</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Chaque acteur exécute sa responsabilité. La pesée devient une preuve, les lots restent cohérents et les produits à risque sont orientés vers le froid, la transformation ou une initiative communautaire encadrée.</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="grid gap-2 md:grid-cols-3">
          {(Object.keys(actors) as ActorKey[]).map((key) => (
            <button key={key} type="button" onClick={() => setActiveActor(key)} className={`rounded-lg border p-4 text-left ${activeActor === key ? "border-[var(--mb-ocean-600)] bg-white" : "border-[var(--mb-neutral-200)] bg-white/60"}`}>
              <span className="block text-sm font-semibold">{actors[key].label}</span>
              <span className="mt-1 block text-xs text-[var(--mb-neutral-500)]">{actors[key].purpose}</span>
            </button>
          ))}
        </section>

        <div className="mt-4 rounded-lg border border-[var(--mb-neutral-200)] bg-white p-4 text-sm">{message}</div>

        <section className="mt-5 grid gap-4 lg:grid-cols-3">
          <Step title="1. Débarquer" status={landing ? "Confirmé" : "À faire"} value={landing?.id ?? "Aucun débarquement"}>
            {activeActor === "landing" && !landing && <Action disabled={busy} onClick={() => execute({ type: "seed_demo", at: new Date().toISOString() }, "Retour prévu et débarquement confirmés.")}>Confirmer le scénario pilote</Action>}
          </Step>

          <Step title="2. Peser" status={weighing?.confidenceLevel ?? "À faire"} value={weighing ? `${weighing.totalWeightKg.toLocaleString("fr-FR")} kg` : "Aucune pesée"}>
            {activeActor === "weigher" && landing && !weighing && <Action disabled={busy} onClick={() => execute({ type: "register_weighing", weighingId: `weighing-${crypto.randomUUID()}`, landingId: landing.id, totalWeightKg: 920, method: "digital_scale", recordedAt: new Date().toISOString() }, "Pesée enregistrée à 920 kg.")}>Enregistrer 920 kg</Action>}
            {activeActor === "weigher" && weighing?.confidenceLevel === "confirmed" && <Action disabled={busy} onClick={() => execute({ type: "verify_weighing", weighingId: weighing.id }, "Pesée vérifiée et retenue comme référence.")}>Vérifier la pesée</Action>}
          </Step>

          <Step title="3. Constituer" status={lot?.status ?? "À faire"} value={lot ? `${lot.speciesCode} · ${lot.weightKg} kg` : `${allocatedWeight} kg affectés`}>
            {activeActor === "cooperative" && weighing && !lot && <Action disabled={busy} onClick={() => execute({ type: "create_lot", lotId: `lot-${crypto.randomUUID()}`, landingId: landing.id, speciesCode: "thiof", weightKg: 400, qualityGrade: "processing", conservationStatus: "at_risk", createdAt: new Date().toISOString() }, "Lot de 400 kg constitué et qualifié à risque.")}>Créer un lot à risque</Action>}
            {activeActor === "cooperative" && lot && !lot.destination && <Action disabled={busy} onClick={() => execute({ type: "decide_destination", lotId: lot.id, coldStorageAvailable: false, processingAvailable: true, communityProgramAvailable: true }, "Destination recommandée selon qualité, capacités et risque de perte.")}>Décider la destination</Action>}
          </Step>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-4">
          <Metric label="Poids prévu" value={`${snapshot.expectedReturns[0]?.expectedWeightKg ?? 0} kg`} />
          <Metric label="Poids réel" value={`${weighing?.totalWeightKg ?? 0} kg`} />
          <Metric label="Lots constitués" value={String(snapshot.lots.length)} />
          <Metric label="Poids orienté" value={`${snapshot.lots.filter((item) => item.destination).reduce((sum, item) => sum + item.weightKg, 0)} kg`} />
        </section>

        {decision && (
          <section className="mt-5 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-6">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-700)]">Décision de valorisation</p>
            <h2 className="mt-2 text-2xl font-semibold">{destinationLabel(decision.recommendedDestination)}</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <Signal title="Raisons" values={decision.reasons} />
              <Signal title="Durabilité" values={decision.sustainabilitySignals} />
              <Signal title="Valeur communautaire" values={decision.communityValueSignals} />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Step({ title, status, value, children }: { title: string; status: string; value: string; children?: React.ReactNode }) {
  return <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{title}</h2><span className="rounded border px-2 py-1 font-mono text-[8px] uppercase">{status}</span></div><p className="mt-4 text-sm text-[var(--mb-neutral-500)]">{value}</p><div className="mt-5">{children}</div></article>;
}
function Action({ children, disabled, onClick }: { children: React.ReactNode; disabled: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="min-h-11 w-full rounded-lg bg-[var(--mb-navy-800)] px-4 text-sm font-bold text-white disabled:opacity-40">{children}</button>;
}
function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-[var(--mb-neutral-200)] bg-white p-4"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>;
}
function Signal({ title, values }: { title: string; values: string[] }) {
  return <div><h3 className="text-sm font-semibold">{title}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{values.length ? values.map((value) => <li key={value}>• {value}</li>) : <li>• Aucun signal spécifique.</li>}</ul></div>;
}
function destinationLabel(destination: string) {
  return ({ fresh_market: "Marché frais", cold_storage: "Stockage froid", processing: "Transformation", community_program: "Programme communautaire", rejected: "Rejet contrôlé" } as Record<string, string>)[destination] ?? destination;
}
