import Link from "next/link";
import { domainRepository } from "@/domain/repositories";
import {
  getCompatibleCapacitiesForNeed,
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

export default function ServiceCoordinationPage() {
  const data = domainRepository.getData();
  const needs = data.serviceNeeds;
  const openNeeds = needs.filter((need) =>
    ["open", "partially_allocated", "allocated"].includes(need.status),
  );
  const activeCapacities = data.capacities.filter((capacity) =>
    ["available", "partially_available"].includes(capacity.status),
  );
  const fulfilledExecutions = data.serviceExecutions.filter(
    (execution) => execution.status === "confirmed",
  );
  const protectedValue = data.outcomes.reduce(
    (total, outcome) => total + (outcome.valueCreated ?? 0),
    0,
  );

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Coordination opérationnelle</p>
              <h1 className="mt-2 text-3xl font-semibold">Besoins, capacités, réservations et preuves d'exécution</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Cette vue repose uniquement sur le domaine réel de Mbàmbulaan et rend visible la boucle documentée du MVP.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/operations/retours" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Retours attendus</Link>
              <Link href="/exploitation-mbambulaan" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Exploitation</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Besoins ouverts" value={String(openNeeds.length)} detail={`${openNeeds.filter((need) => ["urgent", "critical"].includes(need.priority)).length} urgents ou critiques`} />
          <Metric label="Capacités mobilisables" value={String(activeCapacities.length)} detail="Disponibles au bon moment et sur le bon territoire" />
          <Metric label="Exécutions confirmées" value={String(fulfilledExecutions.length)} detail="Avec auteur, quantité et preuve enregistrés" />
          <Metric label="Valeur documentée" value={`${protectedValue.toLocaleString("fr-FR")} FCFA`} detail="Résultats économiques enregistrés dans le domaine" />
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <SectionTitle eyebrow="Besoins à coordonner" title="Voir la couverture réelle de chaque demande" />
          <div className="mt-4 space-y-4">
            {needs.map((need) => {
              const expectedReturn = data.expectedReturns.find((item) => item.id === need.expectedReturnId);
              const vessel = data.vessels.find((item) => item.id === expectedReturn?.vesselId);
              const territory = data.territories.find((item) => item.id === need.territoryId);
              const site = data.landingSites.find((item) => item.id === need.landingSiteId);
              const coverage = getServiceNeedCoverage(data, need.id);
              const compatibleCapacities = getCompatibleCapacitiesForNeed(data, need.id);
              const allocations = getServiceAllocationsByNeed(data, need.id);
              const executions = allocations.flatMap((allocation) => getServiceExecutionsByAllocation(data, allocation.id));

              return (
                <article key={need.id} className="rounded-xl border border-[var(--mb-neutral-200)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] text-[var(--mb-neutral-400)]">{need.id}</p>
                      <h3 className="mt-1 font-semibold capitalize">{need.needType.replaceAll("_", " ")} · {vessel?.name ?? need.expectedReturnId}</h3>
                      <p className="mt-1 text-sm text-[var(--mb-neutral-500)]">{territory?.name} · {site?.name ?? "Site non défini"} · requis le {formatDateTime(need.neededAt)}</p>
                    </div>
                    <span className="rounded border px-2 py-1 text-xs font-semibold">{need.status}</span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <MiniMetric label="Demandé" value={`${need.requestedQuantity} ${need.unit}`} />
                    <MiniMetric label="Réservé" value={`${coverage?.allocatedQuantity ?? 0} ${need.unit}`} />
                    <MiniMetric label="Exécuté" value={`${coverage?.executedQuantity ?? 0} ${need.unit}`} />
                    <MiniMetric label="Reste à couvrir" value={`${coverage?.remainingToAllocate ?? need.requestedQuantity} ${need.unit}`} />
                    <MiniMetric label="Capacités compatibles" value={String(compatibleCapacities.length)} />
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-lg bg-[var(--mb-neutral-50)] p-4">
                      <p className="text-xs font-semibold uppercase text-[var(--mb-neutral-500)]">Réservations</p>
                      <div className="mt-3 space-y-2">
                        {allocations.length ? allocations.map((allocation) => {
                          const provider = data.organizations.find((item) => item.id === allocation.providerOrganizationId);
                          return <p key={allocation.id} className="text-sm">{provider?.name ?? allocation.providerOrganizationId} · {allocation.allocatedQuantity} {allocation.unit} · {allocation.status}</p>;
                        }) : <p className="text-sm text-[var(--mb-neutral-500)]">Aucune réservation active.</p>}
                      </div>
                    </div>
                    <div className="rounded-lg bg-[var(--mb-neutral-50)] p-4">
                      <p className="text-xs font-semibold uppercase text-[var(--mb-neutral-500)]">Exécutions et preuves</p>
                      <div className="mt-3 space-y-2">
                        {executions.length ? executions.map((execution) => <p key={execution.id} className="text-sm">{execution.executedQuantity} exécuté(s) · {execution.evidence.length} preuve(s) · {execution.status}</p>) : <p className="text-sm text-[var(--mb-neutral-500)]">Aucune exécution confirmée.</p>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/operations/retours/${need.expectedReturnId}`} className="rounded-lg border border-[var(--mb-neutral-300)] px-3 py-2 text-xs font-semibold">Ouvrir le parcours complet</Link>
                    {compatibleCapacities.slice(0, 2).map((capacity) => {
                      const provider = data.organizations.find((item) => item.id === capacity.providerOrganizationId);
                      return <span key={capacity.id} className="rounded-lg bg-[var(--mb-neutral-50)] px-3 py-2 text-xs">Alternative : {provider?.name ?? capacity.id} · {capacity.availableQuantity} {capacity.unit}</span>;
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">{eyebrow}</p><h2 className="mt-2 text-xl font-semibold">{title}</h2></div>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-2 text-xs leading-5 text-[var(--mb-neutral-500)]">{detail}</p></article>;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-white p-3 ring-1 ring-[var(--mb-neutral-200)]"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>;
}
