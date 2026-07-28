"use client";

import { useCallback, useEffect, useState } from "react";

type Snapshot = {
  needs: Array<{ id: string; title: string; status: string; priorityScore: number }>;
  initiatives: Array<{ id: string; title: string; status: string; targetAmountXof: number }>;
  contributions: Array<{ amountXof: number }>;
  allocations: Array<{ amountXof: number; status: string }>;
  outcomes: Array<{ beneficiaryCount: number; incomeCreatedXof: number; platformRevenueXof: number }>;
  metrics: {
    totalContributionsXof: number;
    totalAllocatedXof: number;
    availableBalanceXof: number;
    beneficiaryCount: number;
    womenBeneficiaryCount: number;
    jobsCreated: number;
    incomeCreatedXof: number;
    platformRevenueXof: number;
  };
};

const initial: Snapshot = {
  needs: [], initiatives: [], contributions: [], allocations: [], outcomes: [],
  metrics: { totalContributionsXof: 0, totalAllocatedXof: 0, availableBalanceXof: 0, beneficiaryCount: 0, womenBeneficiaryCount: 0, jobsCreated: 0, incomeCreatedXof: 0, platformRevenueXof: 0 },
};

export function CommunityValueWorkstation() {
  const [sessionId, setSessionId] = useState<string>();
  const [snapshot, setSnapshot] = useState<Snapshot>(initial);
  const [message, setMessage] = useState("Initialisation du poste communautaire…");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const sessionResponse = await fetch("/api/v1/access/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identityId: "demo-government-supervisor", territoryId: "territory-national" }),
      });
      const sessionBody = await sessionResponse.json();
      if (!sessionResponse.ok) throw new Error(sessionBody?.error?.message ?? "Session impossible.");
      const token = sessionBody.session.id as string;
      setSessionId(token);
      const response = await fetch("/api/v1/community-value", { headers: { "x-mbambulaan-demo-session": token } });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Lecture impossible.");
      setSnapshot(body);
      setMessage("Gouvernance locale, fonds et impact communautaire réunis dans une même boucle.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Chargement impossible.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function execute(command: Record<string, unknown>, success: string) {
    if (!sessionId) return;
    setBusy(true);
    try {
      const response = await fetch("/api/v1/community-value", {
        method: "POST",
        headers: { "content-type": "application/json", "x-mbambulaan-demo-session": sessionId },
        body: JSON.stringify({ commandId: `${String(command.type)}-${crypto.randomUUID()}`, command }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Action refusée.");
      setSnapshot(body.snapshot);
      setMessage(success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action impossible.");
    } finally {
      setBusy(false);
    }
  }

  const need = snapshot.needs[0];
  const initiative = snapshot.initiatives[0];
  const funded = snapshot.metrics.totalContributionsXof >= (initiative?.targetAmountXof ?? Infinity);
  const allocated = snapshot.allocations[0];
  const completed = snapshot.outcomes.length > 0;
  const at = new Date().toISOString();

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Mbàmbulaan Community</p>
          <h1 className="mt-2 text-3xl font-semibold">Du besoin collectif à la valeur partagée</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">La communauté qualifie le besoin, décide, mobilise les fonds, contrôle l’affectation et mesure les bénéficiaires, les revenus et les emplois créés.</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="rounded-lg border border-[var(--mb-neutral-200)] bg-white p-4 text-sm">{message}</div>

        <section className="mt-5 grid gap-4 lg:grid-cols-4">
          <Step title="1. Besoin" status={need?.status ?? "À signaler"} value={need?.title ?? "Aucun besoin collectif"}>
            {!need && <Action disabled={busy} onClick={() => execute({ type: "report_need", need: { id: `need-${crypto.randomUUID()}`, territoryId: "territory-dakar", title: "Atelier collectif de transformation", description: "Améliorer les revenus et réduire les pertes", objective: "women_income", affectedActorIds: ["actor-women-01"], evidenceIds: ["evidence-need-demo"], priorityScore: 92, status: "reported", reportedByActorId: "actor-women-01", reportedAt: at } }, "Besoin collectif signalé avec preuve.")}>Signaler le besoin</Action>}
            {need?.status === "reported" && <Action disabled={busy} onClick={() => execute({ type: "qualify_need", needId: need.id }, "Besoin qualifié et prêt à devenir une initiative.")}>Qualifier</Action>}
          </Step>

          <Step title="2. Décision" status={initiative?.status ?? "À créer"} value={initiative?.title ?? "Aucune initiative"}>
            {need?.status === "qualified" && !initiative && <Action disabled={busy} onClick={() => execute({ type: "create_initiative", initiative: { id: `initiative-${crypto.randomUUID()}`, needId: need.id, territoryId: "territory-dakar", title: "Atelier collectif de transformation", objective: "women_income", governanceOrganizationId: "org-community-dakar", beneficiaryOrganizationIds: ["org-women-processors-dakar"], targetBeneficiaryCount: 30, targetAmountXof: 12_000_000, platformFeeBps: 250, status: "draft", createdAt: at } }, "Initiative créée.")}>Créer l’initiative</Action>}
            {initiative?.status === "draft" && <Action disabled={busy} onClick={() => execute({ type: "open_vote", initiativeId: initiative.id }, "Vote communautaire ouvert.")}>Ouvrir le vote</Action>}
            {initiative?.status === "voting" && snapshot.contributions.length === 0 && <Action disabled={busy} onClick={async () => {
              await execute({ type: "cast_vote", vote: { id: `vote-${crypto.randomUUID()}`, initiativeId: initiative.id, voterActorId: "actor-community-01", voterOrganizationId: "org-community-dakar", choice: "approve", evidenceIds: ["evidence-vote-demo"], votedAt: at } }, "Vote favorable enregistré.");
            }}>Voter favorablement</Action>}
            {initiative?.status === "voting" && <Action disabled={busy} onClick={() => execute({ type: "close_vote", initiativeId: initiative.id, at }, "Initiative approuvée à la majorité.")}>Clore le vote</Action>}
          </Step>

          <Step title="3. Fonds" status={funded ? "Financé" : "À financer"} value={`${snapshot.metrics.totalContributionsXof.toLocaleString("fr-FR")} FCFA mobilisés`}>
            {initiative?.status === "funding" && !funded && <Action disabled={busy} onClick={() => execute({ type: "record_contribution", contribution: { id: `contribution-${crypto.randomUUID()}`, initiativeId: initiative.id, contributorActorId: "program-01", contributorOrganizationId: "org-program", sourceType: "public_program", amountXof: 12_000_000, evidenceIds: ["evidence-funding-demo"], contributedAt: at } }, "Financement reçu et prouvé.")}>Mobiliser 12 M FCFA</Action>}
            {funded && !allocated && <Action disabled={busy} onClick={() => execute({ type: "approve_allocation", allocation: { id: `allocation-${crypto.randomUUID()}`, initiativeId: initiative.id, beneficiaryOrganizationId: "org-women-processors-dakar", purpose: "Équipements et formation", amountXof: 10_000_000, approvedByActorId: "actor-community-01", evidenceIds: ["evidence-allocation-demo"], status: "approved", approvedAt: at } }, "Affectation approuvée sans dépasser les fonds.")}>Affecter 10 M FCFA</Action>}
          </Step>

          <Step title="4. Impact" status={completed ? "Mesuré" : allocated?.status ?? "À exécuter"} value={`${snapshot.metrics.beneficiaryCount} bénéficiaires`}>
            {allocated?.status === "approved" && <Action disabled={busy} onClick={() => execute({ type: "record_delivery", proof: { id: `delivery-${crypto.randomUUID()}`, allocationId: allocated.id, deliveredByActorId: "supplier-01", beneficiaryActorIds: ["actor-women-01", "actor-women-02"], description: "Équipements installés et acceptés", monetaryValueXof: 10_000_000, evidenceIds: ["evidence-delivery-demo"], deliveredAt: at, acceptedAt: at } }, "Équipements livrés avec preuve.")}>Prouver la livraison</Action>}
            {allocated?.status === "delivered" && !completed && <Action disabled={busy} onClick={() => execute({ type: "record_outcome", outcome: { id: `outcome-${crypto.randomUUID()}`, initiativeId: initiative.id, beneficiaryCount: 30, womenBeneficiaryCount: 30, youthBeneficiaryCount: 8, jobsCreated: 6, incomeCreatedXof: 18_000_000, collectiveAssetValueXof: 10_000_000, valueProtectedXof: 7_500_000, platformRevenueXof: 300_000, evidenceIds: ["evidence-impact-demo"], confidenceScore: 82, measuredAt: at } }, "Impact communautaire mesuré.")}>Mesurer l’impact</Action>}
          </Step>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-4">
          <Metric label="Fonds mobilisés" value={`${snapshot.metrics.totalContributionsXof.toLocaleString("fr-FR")} FCFA`} />
          <Metric label="Solde disponible" value={`${snapshot.metrics.availableBalanceXof.toLocaleString("fr-FR")} FCFA`} />
          <Metric label="Revenus créés" value={`${snapshot.metrics.incomeCreatedXof.toLocaleString("fr-FR")} FCFA`} />
          <Metric label="Revenu Mbàmbulaan" value={`${snapshot.metrics.platformRevenueXof.toLocaleString("fr-FR")} FCFA`} />
        </section>
      </div>
    </main>
  );
}

function Step({ title, status, value, children }: { title: string; status: string; value: string; children?: React.ReactNode }) {
  return <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{title}</h2><span className="rounded border px-2 py-1 font-mono text-[8px] uppercase">{status}</span></div><p className="mt-4 text-sm text-[var(--mb-neutral-500)]">{value}</p><div className="mt-5 space-y-2">{children}</div></article>;
}
function Action({ children, disabled, onClick }: { children: React.ReactNode; disabled: boolean; onClick: () => void | Promise<void> }) {
  return <button type="button" disabled={disabled} onClick={() => void onClick()} className="min-h-11 w-full rounded-lg bg-[var(--mb-navy-800)] px-4 text-sm font-bold text-white disabled:opacity-40">{children}</button>;
}
function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-[var(--mb-neutral-200)] bg-white p-4"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>;
}
