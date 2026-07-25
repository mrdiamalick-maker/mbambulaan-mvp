import Link from "next/link";
import { domainRepository } from "@/domain/repositories";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function TensionsPage() {
  const data = domainRepository.getData();
  const tensions = [...data.tensions].sort((a, b) => {
    const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 } as const;
    const severityDelta = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDelta !== 0) return severityDelta;
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });

  const openTensions = tensions.filter((item) => item.status === "open");
  const criticalTensions = openTensions.filter((item) => item.severity === "critical");
  const commitments = data.commitments.filter((item) =>
    tensions.some((tension) => tension.id === item.tensionId),
  );
  const overdueCommitments = commitments.filter(
    (item) => item.status !== "completed" && new Date(item.dueAt).getTime() < Date.now(),
  );

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
          <Link
            href="/operations"
            className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]"
          >
            ← Retour au pilotage
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">
                Coordination active
              </p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">
                Tensions opérationnelles
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mb-neutral-600)]">
                Centraliser les blocages, prioriser les urgences et rendre visibles les engagements attendus des acteurs.
              </p>
            </div>
            <Link
              href="/operations/tensions/nouvelle"
              className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white"
            >
              Signaler une tension
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Tensions ouvertes" value={openTensions.length.toLocaleString("fr-FR")} />
          <Metric label="Critiques" value={criticalTensions.length.toLocaleString("fr-FR")} />
          <Metric label="Engagements liés" value={commitments.length.toLocaleString("fr-FR")} />
          <Metric label="Engagements en retard" value={overdueCommitments.length.toLocaleString("fr-FR")} />
        </div>

        <div className="mt-6 space-y-4">
          {tensions.map((tension) => {
            const reporter = data.actors.find((item) => item.id === tension.reportedByActorId);
            const territory = data.territories.find((item) => item.id === tension.territoryId);
            const relatedCommitments = data.commitments.filter((item) => item.tensionId === tension.id);

            return (
              <Link
                key={tension.id}
                href={`/operations/tensions/${tension.id}`}
                className="block border border-[var(--mb-neutral-200)] bg-white p-5 hover:bg-[var(--mb-foam)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[var(--mb-neutral-300)] bg-white px-3 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-500)]">
                        {tension.tensionType.replaceAll("_", " ")}
                      </span>
                      <span className="rounded-full border border-[var(--mb-danger-300)] bg-[var(--mb-danger-50)] px-3 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-[var(--mb-danger-700)]">
                        {tension.severity}
                      </span>
                      <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">
                        {tension.status}
                      </span>
                    </div>
                    <h2 className="mt-3 text-lg font-semibold text-[var(--mb-navy-900)]">
                      {tension.description}
                    </h2>
                    <p className="mt-2 text-[11px] text-[var(--mb-neutral-500)]">
                      {territory?.name ?? tension.territoryId} · signalé par {reporter?.name ?? tension.reportedByActorId} · {formatDateTime(tension.reportedAt)}
                    </p>
                  </div>

                  <div className="grid min-w-[15rem] grid-cols-2 gap-3">
                    <SmallMetric label="Engagements" value={relatedCommitments.length.toLocaleString("fr-FR")} />
                    <SmallMetric label="Entité liée" value={tension.relatedEntityType.replaceAll("_", " ")} />
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
  return (
    <article className="border border-[var(--mb-neutral-200)] bg-white p-5">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">{value}</p>
    </article>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-3">
      <p className="font-mono text-[8px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</p>
      <p className="mt-2 text-[11px] font-semibold capitalize text-[var(--mb-navy-900)]">{value}</p>
    </article>
  );
}
