"use client";

import { useCallback, useEffect, useState } from "react";

type JsonValue = Record<string, unknown>;

interface RuntimeStatus {
  running: boolean;
  pendingEvents: number;
  failedEvents: number;
  atlas: { workspaces: number; questions: number; insights: number; scenarios: number; briefings: number };
  digitalTwin: { nodes: number; flows: number; openSignals: number };
  knowledgeGraph: { nodes: number; edges: number; causalPaths: number };
}

interface LogEntry {
  title: string;
  status: "success" | "error" | "info";
  payload?: JsonValue;
}

async function callApi(path: string, options?: RequestInit) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message ?? `Erreur HTTP ${response.status}`);
  return body;
}

export function AtlasConsole() {
  const [status, setStatus] = useState<RuntimeStatus>();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [busy, setBusy] = useState<string>();

  const refresh = useCallback(async () => {
    const value = await callApi("/api/v1/runtime/status");
    setStatus(value as RuntimeStatus);
  }, []);

  useEffect(() => {
    refresh().catch((error) => setLogs([{ title: String(error), status: "error" }]));
  }, [refresh]);

  const execute = async (name: string, work: () => Promise<JsonValue>) => {
    setBusy(name);
    try {
      const payload = await work();
      const entry: LogEntry = { title: name, status: "success", payload };
      setLogs((current) => [entry, ...current].slice(0, 8));
      await refresh();
    } catch (error) {
      const entry: LogEntry = {
        title: `${name} — ${error instanceof Error ? error.message : String(error)}`,
        status: "error",
      };
      setLogs((current) => [entry, ...current].slice(0, 8));
    } finally {
      setBusy(undefined);
    }
  };

  const reportColdChainTension = () => execute("Tension chaîne du froid signalée", async () => {
    const stamp = Date.now();
    const event = await callApi("/api/v1/runtime/events", {
      method: "POST",
      body: JSON.stringify({
        id: `event-ui-cold-chain-${stamp}`,
        type: "operational.flow.blocked",
        occurredAt: new Date().toISOString(),
        correlationId: `atlas-ui-${stamp}`,
        tenantId: "tenant-national",
        territoryId: "territory-dakar",
        payload: {
          flowId: `flow-ui-cold-chain-${stamp}`,
          flowKind: "service",
          fromEntityId: "cooperative-dakar-ui",
          fromLabel: "Coopérative Dakar",
          toEntityId: "cold-room-dakar-ui",
          toLabel: "Chambre froide Dakar",
          quantity: 2_400,
          unit: "kg",
        },
      }),
    });
    const processing = await callApi("/api/v1/runtime/process", { method: "POST" });
    return { event, processing };
  });

  const askAtlas = () => execute("Analyse territoriale produite", async () => {
    const stamp = Date.now();
    return callApi("/api/v1/atlas/questions", {
      method: "POST",
      body: JSON.stringify({
        id: `question-ui-cold-chain-${stamp}`,
        workspaceId: "atlas-national-operations",
        askedByActorId: "actor-ministry-ui",
        question: "Comment résorber le risque de chaîne du froid à Dakar dans les 90 prochains jours ?",
        decisionDomain: "operational_resilience",
        territoryId: "territory-dakar",
        horizon: "90_days",
        correlationId: `atlas-ui-${stamp}`,
      }),
    });
  });

  const createAndEvaluateScenario = () => execute("Scénario d'arbitrage évalué", async () => {
    const stamp = Date.now();
    const scenarioId = `scenario-ui-cold-chain-${stamp}`;
    const scenario = await callApi("/api/v1/atlas/scenarios", {
      method: "POST",
      body: JSON.stringify({
        id: scenarioId,
        workspaceId: "atlas-national-operations",
        name: "Réallocation temporaire de capacité froide",
        decisionDomain: "operational_resilience",
        actions: [
          {
            id: `action-capacity-${stamp}`,
            actionType: "allocate_capacity",
            targetEntityIds: ["cold-room-dakar-ui"],
            description: "Mobiliser une capacité froide alternative de 2 400 kg.",
            estimatedCostXof: 1_500_000,
            expectedDelayDays: 7,
          },
          {
            id: `action-monitoring-${stamp}`,
            actionType: "increase_monitoring",
            targetEntityIds: ["territory-dakar"],
            description: "Suivre quotidiennement les volumes et délais.",
            estimatedCostXof: 250_000,
            expectedDelayDays: 1,
          },
        ],
        assumptions: ["Une capacité alternative peut être contractualisée dans un territoire voisin."],
        status: "draft",
        createdAt: new Date().toISOString(),
      }),
    });
    const evaluation = await callApi(`/api/v1/atlas/scenarios/${scenarioId}/evaluate`, { method: "POST" });
    return { scenario, evaluation };
  });

  const generateBriefing = () => execute("Note de décision générée", async () => {
    const stamp = Date.now();
    return callApi("/api/v1/atlas/briefings", {
      method: "POST",
      body: JSON.stringify({
        id: `briefing-ui-${stamp}`,
        workspaceId: "atlas-national-operations",
        title: "Note de décision — chaîne du froid à Dakar",
        generatedAt: new Date().toISOString(),
      }),
    });
  });

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mb-ocean-400)]">Mbàmbulaan Atlas · Pilotage national de la filière</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Cockpit CEO / Ministère</h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Identifier une tension territoriale, consolider les preuves, comparer les options d'intervention, arbitrer les capacités et préparer une décision d'investissement ou de politique publique.</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Couverture de pilotage" value={status?.running ? "Active" : "Indisponible"} />
          <Metric label="Tensions territoriales ouvertes" value={status?.digitalTwin.openSignals ?? 0} />
          <Metric label="Analyses disponibles" value={status?.atlas.insights ?? 0} />
          <Metric label="Objets sectoriels suivis" value={status?.knowledgeGraph.nodes ?? 0} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.72fr)]">
          <div className="border border-[var(--mb-neutral-200)] bg-white p-6">
            <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Parcours de décision</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">Sécuriser la chaîne du froid à Dakar</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--mb-neutral-600)]">Le scénario relie un problème terrain à une décision institutionnelle : tension, analyse, arbitrage de capacité et note de décision.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ActionButton step="1" title="Signaler la tension" detail="Enregistre 2 400 kg exposés à un risque de rupture de la chaîne du froid." busy={busy} action="Tension chaîne du froid signalée" onClick={reportColdChainTension} />
              <ActionButton step="2" title="Analyser le territoire" detail="Consolide les capacités, volumes, acteurs concernés et preuves disponibles." busy={busy} action="Analyse territoriale produite" onClick={askAtlas} />
              <ActionButton step="3" title="Comparer les options" detail="Évalue le coût, le délai, la résilience et la valeur préservée de chaque option." busy={busy} action="Scénario d'arbitrage évalué" onClick={createAndEvaluateScenario} />
              <ActionButton step="4" title="Préparer la décision" detail="Produit une note exploitable par le ministère, la direction ou un financeur." busy={busy} action="Note de décision générée" onClick={generateBriefing} />
            </div>
          </div>

          <aside className="border border-[var(--mb-neutral-200)] bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div><p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Portefeuille de décision</p><h2 className="mt-2 text-xl font-semibold">État du pilotage</h2></div>
              <button type="button" onClick={() => refresh()} className="rounded border border-[var(--mb-neutral-300)] px-3 py-2 text-xs font-bold">Actualiser</button>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <StatusRow label="Informations à consolider" value={status?.pendingEvents ?? 0} />
              <StatusRow label="Anomalies de traitement" value={status?.failedEvents ?? 0} />
              <StatusRow label="Flux opérationnels suivis" value={status?.digitalTwin.flows ?? 0} />
              <StatusRow label="Questions de pilotage" value={status?.atlas.questions ?? 0} />
              <StatusRow label="Scénarios d'arbitrage" value={status?.atlas.scenarios ?? 0} />
              <StatusRow label="Notes de décision" value={status?.atlas.briefings ?? 0} />
            </dl>
          </aside>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <DecisionCard title="Valeur opérationnelle" text="Réduction des pertes, mobilisation des capacités disponibles et sécurisation des débarquements." />
          <DecisionCard title="Valeur institutionnelle" text="Ciblage des investissements, priorisation territoriale et suivi des engagements publics." />
          <DecisionCard title="Valeur économique Mbàmbulaan" text="Licence Atlas/Government, services de données, intégration et reporting de décision." />
        </section>

        <section className="mt-6 border border-[var(--mb-neutral-200)] bg-white p-6">
          <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Journal de décision</p>
          <div className="mt-4 space-y-3">
            {logs.length === 0 ? <p className="text-sm text-[var(--mb-neutral-500)]">Aucune décision préparée pour le moment.</p> : logs.map((entry, index) => (
              <article key={`${entry.title}-${index}`} className="border border-[var(--mb-neutral-200)] p-4">
                <div className="flex items-center justify-between gap-3"><strong className="text-sm">{entry.title}</strong><span className="font-mono text-[10px] uppercase">{entry.status}</span></div>
                {entry.payload ? <pre className="mt-3 max-h-72 overflow-auto bg-[var(--mb-neutral-50)] p-3 text-[11px] leading-5">{JSON.stringify(entry.payload, null, 2)}</pre> : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><p className="font-mono text-[9px] font-bold uppercase text-[var(--mb-neutral-500)]">{label}</p><p className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">{value}</p></article>;
}

function StatusRow({ label, value }: { label: string; value: number }) {
  return <div className="flex items-center justify-between border-b border-[var(--mb-neutral-100)] pb-3"><dt className="text-[var(--mb-neutral-600)]">{label}</dt><dd className="font-semibold">{value}</dd></div>;
}

function DecisionCard({ title, text }: { title: string; text: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><h3 className="text-lg font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>;
}

function ActionButton({ step, title, detail, busy, action, onClick }: { step: string; title: string; detail: string; busy?: string; action: string; onClick: () => void }) {
  const loading = busy === action;
  return <button type="button" disabled={Boolean(busy)} onClick={onClick} className="min-h-36 border border-[var(--mb-neutral-200)] p-5 text-left disabled:opacity-50"><span className="font-mono text-[10px] font-bold text-[var(--mb-ocean-600)]">ÉTAPE {step}</span><strong className="mt-3 block text-lg text-[var(--mb-navy-900)]">{loading ? "Traitement…" : title}</strong><span className="mt-2 block text-xs leading-5 text-[var(--mb-neutral-600)]">{detail}</span></button>;
}
