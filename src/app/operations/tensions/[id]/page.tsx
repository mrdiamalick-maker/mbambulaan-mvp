import Link from "next/link";
import { notFound } from "next/navigation";
import { domainRepository } from "@/domain/repositories";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function TensionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = domainRepository.getData();
  const tension = data.tensions.find((item) => item.id === id);

  if (!tension) {
    notFound();
  }

  const reporter = data.actors.find((item) => item.id === tension.reportedByActorId);
  const territory = data.territories.find((item) => item.id === tension.territoryId);
  const commitments = data.commitments.filter((item) => item.tensionId === tension.id);
  const outcomes = data.outcomes.filter(
    (item) => item.relatedEntityType === "tension" && item.relatedEntityId === tension.id,
  );
  const openCommitments = commitments.filter((item) => item.status !== "completed");
  const overdueCommitments = openCommitments.filter(
    (item) => new Date(item.dueAt).getTime() < Date.now(),
  );

  const relatedHref = getRelatedHref(tension.relatedEntityType, tension.relatedEntityId);

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
          <Link
            href="/operations/tensions"
            className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]"
          >
            ← Tensions opérationnelles
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">
                Situation à coordonner
              </p>
              <h1 className="mt-2 max-w-4xl text-[clamp(1.8rem,4vw,3rem)] font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">
                {tension.description}
              </h1>
              <p className="mt-3 text-sm text-[var(--mb-neutral-600)]">
                {territory?.name ?? tension.territoryId} · signalé par {reporter?.name ?? tension.reportedByActorId} · {formatDateTime(tension.reportedAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--mb-danger-300)] bg-[var(--mb-danger-50)] px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-danger-700)]">
                {tension.severity}
              </span>
              <span className="rounded-full border border-[var(--mb-neutral-300)] bg-white px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-600)]">
                {tension.status}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[84rem] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,.7fr)] lg:px-10">
        <div className="space-y-6">
          <section className="border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-[var(--mb-neutral-200)] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
                  Engagements
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">Qui fait quoi, pour quand ?</h2>
              </div>
              <Link
                href={`/operations/tensions/${tension.id}/engagements/nouveau`}
                className="inline-flex h-10 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-4 text-[10px] font-bold text-white"
              >
                Ajouter un engagement
              </Link>
            </div>

            {commitments.length > 0 ? (
              <div className="mt-5 space-y-3">
                {commitments.map((commitment) => {
                  const actor = commitment.actorId
                    ? data.actors.find((item) => item.id === commitment.actorId)
                    : undefined;
                  const organization = commitment.organizationId
                    ? data.organizations.find((item) => item.id === commitment.organizationId)
                    : undefined;
                  const overdue =
                    commitment.status !== "completed" &&
                    new Date(commitment.dueAt).getTime() < Date.now();

                  return (
                    <article key={commitment.id} className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">
                            {actor?.name ?? organization?.name ?? "Responsable non renseigné"}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[var(--mb-navy-900)]">{commitment.action}</p>
                          <p className="mt-2 text-[11px] text-[var(--mb-neutral-500)]">
                            Échéance : {formatDateTime(commitment.dueAt)}
                          </p>
                        </div>
                        <span
                          className={`w-fit rounded-full border px-3 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.08em] ${
                            overdue
                              ? "border-[var(--mb-danger-300)] bg-[var(--mb-danger-50)] text-[var(--mb-danger-700)]"
                              : "border-[var(--mb-neutral-300)] bg-white text-[var(--mb-neutral-600)]"
                          }`}
                        >
                          {overdue ? "en retard" : commitment.status}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="mt-5 text-[11px] leading-5 text-[var(--mb-neutral-500)]">
                Aucun engagement n'a encore été pris pour traiter cette tension.
              </p>
            )}
          </section>

          <section className="border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-[var(--mb-neutral-200)] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
                  Résultats
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">Preuves de résolution et de valeur</h2>
              </div>
              <Link
                href={`/operations/resultats/nouveau?entityType=tension&entityId=${tension.id}`}
                className="inline-flex h-10 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-300)] px-4 text-[10px] font-bold text-[var(--mb-navy-900)]"
              >
                Enregistrer un résultat
              </Link>
            </div>

            {outcomes.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {outcomes.map((outcome) => (
                  <article key={outcome.id} className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">
                      {outcome.outcomeType.replaceAll("_", " ")}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--mb-navy-900)]">{outcome.description}</p>
                    <p className="mt-2 text-[11px] text-[var(--mb-neutral-500)]">{formatDateTime(outcome.recordedAt)}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-[11px] leading-5 text-[var(--mb-neutral-500)]">
                Aucun résultat enregistré pour le moment.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-[var(--mb-neutral-200)] bg-white p-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">Synthèse de pilotage</p>
            <div className="mt-4 space-y-4">
              <SummaryLine label="Type" value={tension.tensionType.replaceAll("_", " ")} />
              <SummaryLine label="Engagements ouverts" value={openCommitments.length.toLocaleString("fr-FR")} />
              <SummaryLine label="Engagements en retard" value={overdueCommitments.length.toLocaleString("fr-FR")} />
              <SummaryLine label="Résultats enregistrés" value={outcomes.length.toLocaleString("fr-FR")} />
            </div>
          </section>

          <Link
            href={relatedHref}
            className="block border border-[var(--mb-neutral-200)] bg-white p-5 hover:bg-[var(--mb-foam)]"
          >
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">Entité liée</p>
            <p className="mt-2 text-sm font-semibold capitalize text-[var(--mb-navy-900)]">
              Ouvrir {tension.relatedEntityType.replaceAll("_", " ")}
            </p>
          </Link>

          <section className="border border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] p-5 text-white">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-400)]">Lecture métier</p>
            <p className="mt-3 text-[11px] leading-5 text-white/65">
              Une tension n'est utile que si elle produit une responsabilité claire, une échéance, une preuve d'action et un résultat mesurable.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}

function getRelatedHref(type: string, id: string): string {
  if (type === "lot") return `/operations/lots/${id}`;
  if (type === "landing") return `/operations/debarquements/${id}`;
  if (type === "expected_return") return `/operations/retours-attendus/${id}`;
  return "/operations";
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--mb-neutral-200)] pb-3 last:border-0 last:pb-0">
      <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize text-[var(--mb-navy-900)]">{value}</p>
    </div>
  );
}
