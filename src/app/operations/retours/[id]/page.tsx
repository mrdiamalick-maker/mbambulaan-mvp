import Link from "next/link";
import { notFound } from "next/navigation";
import { domainRepository } from "@/domain/repositories";
import {
  getCommitmentsByTension,
  getCompatibleCapacitiesForNeed,
  getOutcomesByRelatedEntity,
  getServiceAllocationsByNeed,
  getServiceExecutionsByAllocation,
  getServiceNeedCoverage,
} from "@/domain/selectors";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCurrency(value?: number) {
  if (value === undefined) return "Non estimée";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function ExpectedReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = domainRepository.getData();
  const expectedReturn = data.expectedReturns.find((item) => item.id === id);
  if (!expectedReturn) notFound();

  const vessel = data.vessels.find((item) => item.id === expectedReturn.vesselId);
  const site = data.landingSites.find(
    (item) => item.id === expectedReturn.expectedLandingSiteId,
  );
  const creator = data.actors.find(
    (item) => item.id === expectedReturn.createdByActorId,
  );
  const linkedLanding = data.landings.find(
    (item) => item.expectedReturnId === expectedReturn.id,
  );
  const weighing = linkedLanding
    ? data.weighings.find((item) => item.landingId === linkedLanding.id)
    : undefined;
  const lots = linkedLanding
    ? data.lots.filter((item) => item.landingId === linkedLanding.id)
    : [];
  const serviceNeeds = data.serviceNeeds.filter(
    (need) => need.expectedReturnId === expectedReturn.id,
  );
  const linkedTensions = data.tensions.filter(
    (item) =>
      (item.relatedEntityType === "expected_return" &&
        item.relatedEntityId === expectedReturn.id) ||
      (item.relatedEntityType === "service_need" &&
        serviceNeeds.some((need) => need.id === item.relatedEntityId)),
  );
  const outcomes = [
    ...getOutcomesByRelatedEntity(data, "landing", linkedLanding?.id ?? ""),
    ...serviceNeeds.flatMap((need) =>
      getOutcomesByRelatedEntity(data, "service_need", need.id),
    ),
    ...linkedTensions.flatMap((tension) =>
      getOutcomesByRelatedEntity(data, "tension", tension.id),
    ),
  ];
  const estimatedWeight = expectedReturn.estimatedCatch.reduce(
    (total, item) => total + item.estimatedWeightKg,
    0,
  );
  const lotWeight = lots.reduce((total, lot) => total + lot.weightKg, 0);

  const flowSteps = [
    { label: "Retour annoncé", done: true },
    { label: "Besoin de service déclaré", done: serviceNeeds.length > 0 },
    {
      label: "Capacité réservée",
      done: serviceNeeds.some(
        (need) => getServiceAllocationsByNeed(data, need.id).length > 0,
      ),
    },
    {
      label: "Service exécuté",
      done: serviceNeeds.some((need) =>
        getServiceAllocationsByNeed(data, need.id).some(
          (allocation) =>
            getServiceExecutionsByAllocation(data, allocation.id).length > 0,
        ),
      ),
    },
    { label: "Débarquement confirmé", done: Boolean(linkedLanding) },
    { label: "Pesée enregistrée", done: Boolean(weighing) },
    { label: "Lots constitués", done: lots.length > 0 },
    { label: "Valeur documentée", done: outcomes.length > 0 },
  ];
  const completedSteps = flowSteps.filter((step) => step.done).length;

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
          <Link
            href="/operations/retours"
            className="text-sm font-semibold text-[var(--mb-ocean-600)]"
          >
            ← Retours attendus
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">
                Parcours opérationnel complet
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[var(--mb-navy-900)]">
                {vessel?.name ?? expectedReturn.vesselId}
              </h1>
              <p className="mt-2 text-sm text-[var(--mb-neutral-600)]">
                {site?.name ?? expectedReturn.expectedLandingSiteId} · arrivée prévue le {formatDateTime(expectedReturn.expectedAt)}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] px-4 py-3 text-right">
              <p className="text-xs uppercase text-[var(--mb-neutral-500)]">Progression MVP</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--mb-navy-900)]">
                {completedSteps}/{flowSteps.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <section className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
          {flowSteps.map((step, index) => (
            <article
              key={step.label}
              className={`rounded-lg border p-3 ${
                step.done
                  ? "border-[var(--mb-ocean-600)] bg-white"
                  : "border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-50)]"
              }`}
            >
              <p className="font-mono text-[10px] text-[var(--mb-neutral-400)]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className={`mt-2 text-xs font-semibold ${step.done ? "text-[var(--mb-navy-900)]" : "text-[var(--mb-neutral-400)]"}`}>
                {step.label}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_.55fr]">
          <div className="space-y-6">
            <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Retour</p>
                  <h2 className="mt-2 text-xl font-semibold">Capture estimée : {estimatedWeight.toLocaleString("fr-FR")} kg</h2>
                </div>
                <p className="text-xs text-[var(--mb-neutral-500)]">Déclaré par {creator?.name ?? expectedReturn.createdByActorId}</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {expectedReturn.estimatedCatch.map((item) => (
                  <div key={`${item.species}-${item.estimatedWeightKg}`} className="rounded-lg bg-[var(--mb-neutral-50)] p-4">
                    <p className="font-semibold">{item.species}</p>
                    <p className="mt-1 text-sm text-[var(--mb-neutral-600)]">{item.estimatedWeightKg.toLocaleString("fr-FR")} kg</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Coordination des services</p>
                  <h2 className="mt-2 text-xl font-semibold">Besoins, capacités, réservations et exécutions</h2>
                </div>
                <Link href="/coordination-services" className="text-sm font-semibold text-[var(--mb-ocean-600)]">Vue consolidée →</Link>
              </div>
              <div className="mt-5 space-y-4">
                {serviceNeeds.length ? serviceNeeds.map((need) => {
                  const coverage = getServiceNeedCoverage(data, need.id);
                  const capacities = getCompatibleCapacitiesForNeed(data, need.id);
                  const allocations = getServiceAllocationsByNeed(data, need.id);
                  const executions = allocations.flatMap((allocation) =>
                    getServiceExecutionsByAllocation(data, allocation.id),
                  );
                  return (
                    <section key={need.id} className="rounded-lg border border-[var(--mb-neutral-200)] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold capitalize">{need.needType.replaceAll("_", " ")}</h3>
                          <p className="mt-1 text-xs text-[var(--mb-neutral-500)]">Requis le {formatDateTime(need.neededAt)} · priorité {need.priority}</p>
                        </div>
                        <span className="rounded border px-2 py-1 text-xs font-semibold">{need.status}</span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-4">
                        <MiniMetric label="Demandé" value={`${need.requestedQuantity} ${need.unit}`} />
                        <MiniMetric label="Réservé" value={`${coverage?.allocatedQuantity ?? 0} ${need.unit}`} />
                        <MiniMetric label="Exécuté" value={`${coverage?.executedQuantity ?? 0} ${need.unit}`} />
                        <MiniMetric label="Capacités compatibles" value={String(capacities.length)} />
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg bg-[var(--mb-neutral-50)] p-3">
                          <p className="text-xs font-semibold uppercase text-[var(--mb-neutral-500)]">Allocations</p>
                          <p className="mt-2 text-sm">{allocations.length ? `${allocations.length} réservation(s) active(s)` : "Aucune capacité réservée"}</p>
                        </div>
                        <div className="rounded-lg bg-[var(--mb-neutral-50)] p-3">
                          <p className="text-xs font-semibold uppercase text-[var(--mb-neutral-500)]">Preuves d'exécution</p>
                          <p className="mt-2 text-sm">{executions.length ? `${executions.length} exécution(s) confirmée(s)` : "Aucune exécution confirmée"}</p>
                        </div>
                      </div>
                    </section>
                  );
                }) : (
                  <p className="rounded-lg bg-[var(--mb-neutral-50)] p-4 text-sm text-[var(--mb-neutral-500)]">Aucun besoin de service déclaré pour ce retour.</p>
                )}
              </div>
            </article>

            <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
              <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Traçabilité minimale</p>
              <h2 className="mt-2 text-xl font-semibold">Débarquement, pesée et constitution des lots</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MiniMetric label="Débarquement" value={linkedLanding ? formatDateTime(linkedLanding.landedAt) : "Non confirmé"} />
                <MiniMetric label="Poids mesuré" value={weighing ? `${weighing.totalWeightKg.toLocaleString("fr-FR")} kg` : "Non pesé"} />
                <MiniMetric label="Poids en lots" value={`${lotWeight.toLocaleString("fr-FR")} kg`} />
              </div>
              {weighing ? (
                <p className="mt-4 text-sm text-[var(--mb-neutral-600)]">Écart restant à constituer en lots : {Math.max(weighing.totalWeightKg - lotWeight, 0).toLocaleString("fr-FR")} kg · confiance {weighing.confidenceLevel}</p>
              ) : null}
            </article>
          </div>

          <aside className="space-y-6">
            <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
              <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Tensions et engagements</p>
              <div className="mt-4 space-y-3">
                {linkedTensions.length ? linkedTensions.map((tension) => {
                  const commitments = getCommitmentsByTension(data, tension.id);
                  return (
                    <div key={tension.id} className="rounded-lg border border-[var(--mb-neutral-200)] p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold">{tension.description}</h3>
                        <span className="text-xs font-semibold uppercase text-[var(--mb-neutral-500)]">{tension.severity}</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {commitments.length ? commitments.map((commitment) => {
                          const owner = commitment.actorId
                            ? data.actors.find((actor) => actor.id === commitment.actorId)?.name
                            : data.organizations.find((organization) => organization.id === commitment.organizationId)?.name;
                          return (
                            <div key={commitment.id} className="rounded bg-[var(--mb-neutral-50)] p-3 text-xs">
                              <p className="font-semibold">{commitment.action}</p>
                              <p className="mt-1 text-[var(--mb-neutral-500)]">Responsable : {owner ?? "Non attribué"}</p>
                              <p className="mt-1 text-[var(--mb-neutral-500)]">Échéance : {formatDateTime(commitment.dueAt)} · {commitment.status}</p>
                            </div>
                          );
                        }) : <p className="text-xs text-[var(--mb-neutral-500)]">Aucun engagement attribué.</p>}
                      </div>
                    </div>
                  );
                }) : <p className="text-sm text-[var(--mb-neutral-500)]">Aucune tension liée au retour ou à ses besoins.</p>}
              </div>
            </article>

            <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
              <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Résultats et valeur</p>
              <div className="mt-4 space-y-3">
                {outcomes.length ? outcomes.map((outcome) => (
                  <div key={outcome.id} className="rounded-lg bg-[var(--mb-neutral-50)] p-4">
                    <p className="text-sm font-semibold">{outcome.description}</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--mb-navy-900)]">{formatCurrency(outcome.valueCreated)}</p>
                    <p className="mt-1 text-xs text-[var(--mb-neutral-500)]">Quantité protégée : {outcome.valueSavedKg?.toLocaleString("fr-FR") ?? "—"} kg</p>
                    <p className="mt-1 text-xs text-[var(--mb-neutral-500)]">{outcome.evidence.length} preuve(s) enregistrée(s)</p>
                  </div>
                )) : <p className="text-sm text-[var(--mb-neutral-500)]">La valeur créée n'est pas encore documentée pour ce parcours.</p>}
              </div>
            </article>
          </aside>
        </section>
      </div>
    </main>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--mb-neutral-50)] p-3">
      <p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[var(--mb-navy-900)]">{value}</p>
    </div>
  );
}
