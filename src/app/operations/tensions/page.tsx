import Link from "next/link";
import { domainRepository } from "@/domain/repositories";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function TensionsPage() {
  const data = domainRepository.getData();
  const tensions = [...data.tensions].sort((a, b) => {
    const statusOrder = { open: 3, coordinating: 2, resolved: 1, cancelled: 0 } as const;
    const statusDelta = statusOrder[b.status] - statusOrder[a.status];
    if (statusDelta !== 0) return statusDelta;
    const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 } as const;
    const severityDelta = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDelta !== 0) return severityDelta;
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });

  const activeTensions = tensions.filter((item) => item.status === "open" || item.status === "coordinating");
  const criticalTensions = activeTensions.filter((item) => item.severity === "critical");
  const commitments = data.commitments.filter((item) => tensions.some((tension) => tension.id === item.tensionId));
  const openCommitments = commitments.filter((item) => !["completed", "cancelled"].includes(item.status));
  const overdueCommitments = openCommitments.filter((item) => new Date(item.dueAt).getTime() < Date.now());
  const tensionOutcomes = data.outcomes.filter((item) => item.relatedEntityType === "tension");
  const totalValueCreated = tensionOutcomes.reduce((sum, item) => sum + (item.valueCreated ?? 0), 0);
  const totalValueSavedKg = tensionOutcomes.reduce((sum, item) => sum + (item.valueSavedKg ?? 0), 0);

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
          <Link href="/operations" className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">← Retour au pilotage</Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">Coordination active</p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">Tensions opérationnelles</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--mb-neutral-600)]">Détecter un blocage, attribuer les responsabilités, suivre les échéances et documenter la valeur produite par sa résolution.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/coordination-services" className="inline-flex h-11 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-300)] px-5 text-[11px] font-bold text-[var(--mb-navy-900)]">Voir les services</Link>
              <Link href="/operations/tensions/nouvelle" className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white">Signaler une tension</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <Metric label="Tensions actives" value={activeTensions.length.toLocaleString("fr-FR")} />
          <Metric label="Critiques" value={criticalTensions.length.toLocaleString("fr-FR")} />
          <Metric label="Engagements ouverts" value={openCommitments.length.toLocaleString("fr-FR")} />
          <Metric label="En retard" value={overdueCommitments.length.toLocaleString("fr-FR")} />
          <Metric label="Poids protégé" value={`${totalValueSavedKg.toLocaleString("fr-FR")} kg`} />
          <Metric label="Valeur créée" value={formatCurrency(totalValueCreated)} />
        </div>

        <div className="mt-6 space-y-4">
          {tensions.map((tension) => {
            const reporter = data.actors.find((item) => item.id === tension.reportedByActorId);
            const territory = data.territories.find((item) => item.id === tension.territoryId);
            const relatedCommitments = data.commitments.filter((item) => item.tensionId === tension.id);
            const relatedOutcomes = data.outcomes.filter((item) => item.relatedEntityType === "tension" && item.relatedEntityId === tension.id);
            const openRelatedCommitments = relatedCommitments.filter((item) => !["completed", "cancelled"].includes(item.status));
            const overdueRelatedCommitments = openRelatedCommitments.filter((item) => new Date(item.dueAt).getTime() < Date.now());
            const resolvedValue = relatedOutcomes.reduce((sum, item) => sum + (item.valueCreated ?? 0), 0);
            const savedKg = relatedOutcomes.reduce((sum, item) => sum + (item.valueSavedKg ?? 0), 0);

            return (
              <Link key={tension.id} href={`/operations/tensions/${tension.id}`} className="block border border-[var(--mb-neutral-200)] bg-white p-5 hover:bg-[var(--mb-foam)]">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[var(--mb-neutral-300)] bg-white px-3 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-500)]">{tension.tensionType.replaceAll("_", " ")}</span>
                      <span className="rounded-full border border-[var(--mb-danger-300)] bg-[var(--mb-danger-50)] px-3 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-[var(--mb-danger-700)]">{tension.severity}</span>
                      <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{tension.status}</span>
                    </div>
                    <h2 className="mt-3 text-lg font-semibold text-[var(--mb-navy-900)]">{tension.description}</h2>
                    <p className="mt-2 text-[11px] text-[var(--mb-neutral-500)]">{territory?.name ?? tension.territoryId} · signalé par {reporter?.name ?? tension.reportedByActorId} · {formatDateTime(tension.reportedAt)}</p>
                  </div>

                  <div className="grid min-w-[24rem] grid-cols-2 gap-3 md:grid-cols-4">
                    <SmallMetric label="Engagements ouverts" value={openRelatedCommitments.length.toLocaleString("fr-FR")} />
                    <SmallMetric label="En retard" value={overdueRelatedCommitments.length.toLocaleString("fr-FR")} />
                    <SmallMetric label="Poids protégé" value={`${savedKg.toLocaleString("fr-FR")} kg`} />
                    <SmallMetric label="Valeur créée" value={formatCurrency(resolvedValue)} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</p><p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">{value}</p></article>;
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-3"><p className="font-mono text-[8px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-[11px] font-semibold capitalize text-[var(--mb-navy-900)]">{value}</p></article>;
}
