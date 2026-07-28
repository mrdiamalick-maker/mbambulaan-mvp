"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Snapshot = {
  sources: Array<{ id: string; title: string; summary: string; confidenceScore: number; sourceType: string }>;
  lessons: Array<{ id: string; finding: string; recommendation: string; status: string }>;
  practices: Array<{ id: string; title: string; status: string }>;
  adoptions: Array<{ id: string; organizationId: string; status: string }>;
  outcomes: Array<{ id: string; valueCreatedXof: number; avoidedLossKg: number; incidentReductionPercent: number }>;
  metrics: {
    verifiedSourceCount: number;
    publishedLessonCount: number;
    activePracticeCount: number;
    appliedAdoptionCount: number;
    measuredOutcomeCount: number;
    valueCreatedXof: number;
    avoidedLossKg: number;
    averageIncidentReductionPercent: number;
  };
};

const emptySnapshot: Snapshot = {
  sources: [], lessons: [], practices: [], adoptions: [], outcomes: [],
  metrics: { verifiedSourceCount: 0, publishedLessonCount: 0, activePracticeCount: 0, appliedAdoptionCount: 0, measuredOutcomeCount: 0, valueCreatedXof: 0, avoidedLossKg: 0, averageIncidentReductionPercent: 0 },
};

export function KnowledgeWorkstation() {
  const [sessionId, setSessionId] = useState<string>();
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot);
  const [persistence, setPersistence] = useState("memory");
  const [message, setMessage] = useState("Initialisation du poste Knowledge…");
  const [busy, setBusy] = useState(false);

  const createSession = useCallback(async () => {
    const response = await fetch("/api/v1/access/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ identityId: "demo-knowledge-manager", territoryId: "territory-national" }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message ?? "Session Knowledge impossible.");
    return body.session.id as string;
  }, []);

  const load = useCallback(async () => {
    try {
      const token = await createSession();
      setSessionId(token);
      const response = await fetch("/api/v1/sector-learning", { headers: { "x-mbambulaan-demo-session": token } });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Lecture Knowledge impossible.");
      setSnapshot(body);
      setPersistence(body.persistence ?? "memory");
      setMessage("Sokhna Gueye — qualifier, publier et diffuser les apprentissages sectoriels.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Chargement impossible.");
    }
  }, [createSession]);

  useEffect(() => { void load(); }, [load]);

  async function execute(command: Record<string, unknown>, success: string) {
    if (!sessionId) return;
    setBusy(true);
    try {
      const response = await fetch("/api/v1/sector-learning", {
        method: "POST",
        headers: { "content-type": "application/json", "x-mbambulaan-demo-session": sessionId },
        body: JSON.stringify({ commandId: `${String(command.type)}-${crypto.randomUUID()}`, command }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Action Knowledge refusée.");
      setSnapshot(body.snapshot);
      setPersistence(body.persistence ?? persistence);
      setMessage(success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function ingestIncident() {
    if (!sessionId) return;
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const response = await fetch("/api/v1/sector-learning/ingest", {
        method: "POST",
        headers: { "content-type": "application/json", "x-mbambulaan-demo-session": sessionId },
        body: JSON.stringify({
          commandId: `ingest-${crypto.randomUUID()}`,
          event: {
            type: "commercial_incident_resolved",
            id: `incident-${crypto.randomUUID()}`,
            territoryId: "territory-dakar",
            title: "Rupture répétée de chaîne du froid au transfert",
            summary: "Les incidents montrent que le contrôle de température n'est pas confirmé lors du passage entre transporteur et acheteur.",
            evidenceIds: [`proof-${crypto.randomUUID()}`],
            confidenceScore: 88,
            occurredAt: now,
            actorId: "demo-knowledge-manager",
          },
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Ingestion impossible.");
      setSnapshot(body.snapshot);
      setPersistence(body.persistence ?? persistence);
      setMessage("Incident vérifié converti en source de connaissance.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ingestion impossible.");
    } finally {
      setBusy(false);
    }
  }

  const source = snapshot.sources.at(-1);
  const lesson = snapshot.lessons.at(-1);
  const practice = snapshot.practices.at(-1);
  const adoption = snapshot.adoptions.at(-1);
  const outcome = snapshot.outcomes.at(-1);
  const completion = useMemo(() => [source, lesson?.status === "published", practice?.status === "active", adoption?.status === "applied", outcome].filter(Boolean).length, [source, lesson, practice, adoption, outcome]);

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Mbàmbulaan Knowledge × Atlas</p>
          <h1 className="mt-2 text-3xl font-semibold">Transformer les preuves en pratiques utiles</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Les événements opérationnels deviennent des apprentissages revus, des pratiques diffusables et des résultats mesurables. Aucun contenu n'est publié sans source, preuve et responsabilité explicites.</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="grid gap-3 md:grid-cols-3">
          <Metric label="Avancement du scénario" value={`${completion}/5 étapes`} />
          <Metric label="Persistance" value={persistence === "postgres" ? "PostgreSQL" : "Mémoire locale"} />
          <Metric label="Valeur créée" value={`${snapshot.metrics.valueCreatedXof.toLocaleString("fr-FR")} FCFA`} />
        </section>

        <div className="mt-4 rounded-lg border border-[var(--mb-neutral-200)] bg-white p-4 text-sm">{message}</div>

        <section className="mt-5 grid gap-4 lg:grid-cols-5">
          <Step title="1. Source" status={source ? "Vérifiée" : "À qualifier"} value={source?.title ?? "Aucune source récente"}>
            {!source && <Action disabled={busy} onClick={ingestIncident}>Importer un incident résolu</Action>}
          </Step>
          <Step title="2. Enseignement" status={lesson?.status ?? "À formuler"} value={lesson?.finding ?? "Aucun enseignement"}>
            {source && !lesson && <Action disabled={busy} onClick={() => execute({ type: "create_lesson", lesson: { id: `lesson-${crypto.randomUUID()}`, sourceIds: [source.id], territoryIds: ["territory-dakar"], actorKinds: ["business_operator", "buyer_operator"], problem: "Ruptures de froid lors des transferts", finding: "L'absence de confirmation conjointe de température au transfert augmente les incidents.", causalFactors: ["Responsabilité non confirmée", "Preuve de température absente"], recommendation: "Faire confirmer la température par les deux acteurs au transfert.", expectedValue: ["Réduction des avaries", "Moins de litiges"], confidenceScore: 85, status: "draft", createdAt: new Date().toISOString() } }, "Enseignement formulé à partir de la source vérifiée.")}>Formuler l'enseignement</Action>}
            {lesson?.status === "draft" && <Action disabled={busy} onClick={() => execute({ type: "review_lesson", lessonId: lesson.id, actorId: "demo-knowledge-manager" }, "Enseignement revu par le gestionnaire Knowledge.")}>Revoir</Action>}
            {lesson?.status === "reviewed" && <Action disabled={busy} onClick={() => execute({ type: "publish_lesson", lessonId: lesson.id, at: new Date().toISOString() }, "Enseignement publié avec ses preuves.")}>Publier</Action>}
          </Step>
          <Step title="3. Pratique" status={practice?.status ?? "À créer"} value={practice?.title ?? "Aucune pratique"}>
            {lesson?.status === "published" && !practice && <Action disabled={busy} onClick={() => execute({ type: "create_practice", practice: { id: `practice-${crypto.randomUUID()}`, lessonId: lesson.id, title: "Double confirmation de température au transfert", targetActorKinds: ["business_operator", "buyer_operator"], steps: ["Mesurer la température", "Faire confirmer par les deux parties", "Joindre la preuve au transfert"], requiredCapabilities: ["temperature_capture", "delivery_evidence"], successIndicators: ["cold_chain_incident_rate", "transfer_proof_rate"], status: "draft" } }, "Pratique recommandée créée.")}>Créer la pratique</Action>}
            {practice?.status === "draft" && <Action disabled={busy} onClick={() => execute({ type: "activate_practice", practiceId: practice.id, at: new Date().toISOString() }, "Pratique activée pour diffusion.")}>Activer</Action>}
          </Step>
          <Step title="4. Adoption" status={adoption?.status ?? "À appliquer"} value={adoption?.organizationId ?? "Aucune organisation"}>
            {practice?.status === "active" && !adoption && <Action disabled={busy} onClick={() => execute({ type: "adopt_practice", adoption: { id: `adoption-${crypto.randomUUID()}`, practiceId: practice.id, organizationId: "org-cold-chain-dakar", territoryId: "territory-dakar", adoptedByActorId: "demo-cold-chain-operator", adoptedAt: new Date().toISOString(), status: "applied", evidenceIds: [`adoption-proof-${crypto.randomUUID()}`] } }, "La pratique est appliquée par l'opérateur de froid.")}>Enregistrer l'adoption</Action>}
          </Step>
          <Step title="5. Résultat" status={outcome ? "Mesuré" : "À mesurer"} value={outcome ? `${outcome.avoidedLossKg} kg évités` : "Aucun résultat"}>
            {adoption?.status === "applied" && !outcome && <Action disabled={busy} onClick={() => execute({ type: "record_outcome", outcome: { id: `outcome-${crypto.randomUUID()}`, adoptionId: adoption.id, measuredAt: new Date().toISOString(), indicatorValues: { cold_chain_incident_rate: 4, transfer_proof_rate: 96 }, valueCreatedXof: 1_260_000, avoidedLossKg: 420, incidentReductionPercent: 35, confidenceScore: 82, evidenceIds: [`outcome-proof-${crypto.randomUUID()}`] } }, "Résultat mesuré et prêt pour Atlas.")}>Mesurer l'effet</Action>}
          </Step>
        </section>

        <section className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric label="Sources fiables" value={String(snapshot.metrics.verifiedSourceCount)} />
          <Metric label="Enseignements publiés" value={String(snapshot.metrics.publishedLessonCount)} />
          <Metric label="Pratiques actives" value={String(snapshot.metrics.activePracticeCount)} />
          <Metric label="Pertes évitées" value={`${snapshot.metrics.avoidedLossKg.toLocaleString("fr-FR")} kg`} />
        </section>
      </div>
    </main>
  );
}

function Step({ title, status, value, children }: { title: string; status: string; value: string; children?: React.ReactNode }) {
  return <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-4"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">{title}</h2><span className="rounded border px-2 py-1 font-mono text-[8px] uppercase">{status}</span></div><p className="mt-4 min-h-14 text-xs leading-5 text-[var(--mb-neutral-500)]">{value}</p><div className="mt-4 space-y-2">{children}</div></article>;
}

function Action({ children, disabled, onClick }: { children: React.ReactNode; disabled: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="min-h-10 w-full rounded-lg bg-[var(--mb-navy-800)] px-3 text-xs font-bold text-white disabled:opacity-40">{children}</button>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-[var(--mb-neutral-200)] bg-white p-4"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>;
}
