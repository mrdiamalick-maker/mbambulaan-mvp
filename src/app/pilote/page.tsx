import Link from "next/link";
import { domainRepository } from "@/domain/repositories";
import {
  getCommitmentsByTension,
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
  if (value === undefined) return "Non valorisé";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PilotPage() {
  const data = domainRepository.getData();
  const expectedReturn =
    data.expectedReturns.find((item) => item.id === "return-001") ??
    data.expectedReturns[0];

  if (!expectedReturn) {
    return (
      <main className="min-h-screen bg-[var(--mb-offwhite)] p-8">
        <p>Aucun retour attendu disponible pour le parcours pilote.</p>
      </main>
    );
  }

  const vessel = data.vessels.find((item) => item.id === expectedReturn.vesselId);
  const site = data.landingSites.find(
    (item) => item.id === expectedReturn.expectedLandingSiteId,
  );
  const territory = data.territories.find((item) => item.id === site?.territoryId);
  const serviceNeeds = data.serviceNeeds.filter(
    (item) => item.expectedReturnId === expectedReturn.id,
  );
  const allocations = serviceNeeds.flatMap((need) =>
    getServiceAllocationsByNeed(data, need.id),
  );
  const executions = allocations.flatMap((allocation) =>
    getServiceExecutionsByAllocation(data, allocation.id),
  );
  const landing = data.landings.find(
    (item) => item.expectedReturnId === expectedReturn.id,
  );
  const weighing = landing
    ? data.weighings.find((item) => item.landingId === landing.id)
    : undefined;
  const lots = landing
    ? data.lots.filter((item) => item.landingId === landing.id)
    : [];
  const tensions = data.tensions.filter(
    (item) =>
      (item.relatedEntityType === "expected_return" &&
        item.relatedEntityId === expectedReturn.id) ||
      (item.relatedEntityType === "service_need" &&
        serviceNeeds.some((need) => need.id === item.relatedEntityId)),
  );
  const outcomes = [
    ...executions.flatMap((execution) =>
      data.outcomes.filter(
        (item) =>
          item.relatedEntityType === "service_execution" &&
          item.relatedEntityId === execution.id,
      ),
    ),
    ...tensions.flatMap((tension) =>
      data.outcomes.filter(
        (item) =>
          item.relatedEntityType === "tension" &&
          item.relatedEntityId === tension.id,
      ),
    ),
    ...(landing
      ? data.outcomes.filter(
          (item) =>
            item.relatedEntityType === "landing" &&
            item.relatedEntityId === landing.id,
        )
      : []),
  ];
  const estimatedWeight = expectedReturn.estimatedCatch.reduce(
    (total, item) => total + item.estimatedWeightKg,
    0,
  );
  const lotWeight = lots.reduce((total, lot) => total + lot.weightKg, 0);
  const documentedValue = outcomes.reduce(
    (total, outcome) => total + (outcome.valueCreated ?? 0),
    0,
  );
  const protectedWeight = outcomes.reduce(
    (total, outcome) => total + (outcome.valueSavedKg ?? 0),
    0,
  );

  const steps = [
    { label: "Retour annoncé", done: true },
    { label: "Besoins déclarés", done: serviceNeeds.length > 0 },
    { label: "Capacités réservées", done: allocations.length > 0 },
    { label: "Services exécutés", done: executions.length > 0 },
    { label: "Débarquement confirmé", done: Boolean(landing) },
    { label: "Pesée enregistrée", done: Boolean(weighing) },
    { label: "Lots constitués", done: lots.length > 0 },
    { label: "Résultats mesurés", done: outcomes.length > 0 },
  ];

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Pilote transversal Mbàmbulaan</p>
              <h1 className="mt-2 text-3xl font-semibold">Un parcours réel, de l'annonce à la valeur créée</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">
                Ce pilote ne simule plus le produit : il assemble les retours, besoins, capacités, exécutions, tensions, débarquements, pesées, lots et résultats déjà présents dans le domaine.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/operations/retours/${expectedReturn.id}`} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Ouvrir le retour</Link>
              <Link href="/coordination-services" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Coordination</Link>
              <Link href="/exploitation-mbambulaan" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Exploitation</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
          {steps.map((step, index) => (
            <article key={step.label} className={`rounded-xl border p-4 ${step.done ? "border-[var(--mb-ocean-600)] bg-white" : "border-[var(--mb-neutral-200)] bg-white/50"}`}>
              <p className="font-mono text-[10px] text-[var(--mb-neutral-400)]">{String(index + 1).padStart(2, "0")}</p>
              <p className={`mt-2 text-xs font-semibold ${step.done ? "text-[var(--mb-navy-900)]" : "text-[var(--mb-neutral-400)]"}`}>{step.label}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-4">
          <Metric label="Poids estimé" value={`${estimatedWeight.toLocaleString("fr-FR")} kg`} detail={`${vessel?.name ?? expectedReturn.vesselId} · ${territory?.name ?? site?.name ?? "Territoire"}`} />
          <Metric label="Besoins coordonnés" value={String(serviceNeeds.length)} detail={`${allocations.length} réservation(s), ${executions.length} exécution(s)`} />
          <Metric label="Poids tracé" value={`${lotWeight.toLocaleString("fr-FR")} kg`} detail={weighing ? `Pesée source : ${weighing.totalWeightKg.toLocaleString("fr-FR")} kg` : "Pesée non enregistrée"} />
          <Metric label="Valeur documentée" value={formatCurrency(documentedValue)} detail={`${protectedWeight.toLocaleString("fr-FR")} kg protégés`} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <div className="space-y-6">
            <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
              <SectionTitle eyebrow="1. Retour et préparation" title={`${vessel?.name ?? expectedReturn.vesselId} attendu à ${site?.name ?? expectedReturn.expectedLandingSiteId}`} />
              <p className="mt-3 text-sm text-[var(--mb-neutral-600)]">Arrivée prévue le {formatDateTime(expectedReturn.expectedAt)} · statut {expectedReturn.status}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {expectedReturn.estimatedCatch.map((item) => <MiniMetric key={`${item.species}-${item.estimatedWeightKg}`} label={item.species} value={`${item.estimatedWeightKg.toLocaleString("fr-FR")} kg estimés`} />)}
              </div>
            </article>

            <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
              <SectionTitle eyebrow="2. Coordination des services" title="Voir comment chaque besoin est couvert" />
              <div className="mt-4 space-y-4">
                {serviceNeeds.map((need) => {
                  const coverage = getServiceNeedCoverage(data, need.id);
                  const needAllocations = getServiceAllocationsByNeed(data, need.id);
                  const needExecutions = needAllocations.flatMap((allocation) => getServiceExecutionsByAllocation(data, allocation.id));
                  return (
                    <div key={need.id} className="rounded-lg border border-[var(--mb-neutral-200)] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold capitalize">{need.needType.replaceAll("_", " ")}</h3>
                          <p className="mt-1 text-sm text-[var(--mb-neutral-500)]">Besoin le {formatDateTime(need.neededAt)} · priorité {need.priority}</p>
                        </div>
                        <span className="rounded border px-2 py-1 text-xs font-semibold">{need.status}</span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-4">
                        <MiniMetric label="Demandé" value={`${need.requestedQuantity} ${need.unit}`} />
                        <MiniMetric label="Réservé" value={`${coverage?.allocatedQuantity ?? 0} ${need.unit}`} />
                        <MiniMetric label="Exécuté" value={`${coverage?.executedQuantity ?? 0} ${need.unit}`} />
                        <MiniMetric label="Preuves" value={String(needExecutions.reduce((total, execution) => total + execution.evidence.length, 0))} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
              <SectionTitle eyebrow="3. Débarquement et traçabilité" title="Comparer l'annonce, la pesée et les lots" />
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <MiniMetric label="Débarquement" value={landing ? formatDateTime(landing.landedAt) : "Non confirmé"} />
                <MiniMetric label="Poids mesuré" value={weighing ? `${weighing.totalWeightKg.toLocaleString("fr-FR")} kg` : "Non pesé"} />
                <MiniMetric label="Poids en lots" value={`${lotWeight.toLocaleString("fr-FR")} kg`} />
                <MiniMetric label="Écart" value={weighing ? `${Math.max(weighing.totalWeightKg - lotWeight, 0).toLocaleString("fr-FR")} kg` : "—"} />
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]"><tr>{["Lot", "Espèce", "Poids", "Qualité", "Conservation", "Statut", "Valeur"].map((header) => <th key={header} className="py-3 pr-4">{header}</th>)}</tr></thead>
                  <tbody>{lots.map((lot) => <tr key={lot.id} className="border-b border-[var(--mb-neutral-100)]"><td className="py-4 pr-4 font-semibold">{lot.id}</td><td className="py-4 pr-4">{lot.species}</td><td className="py-4 pr-4">{lot.weightKg.toLocaleString("fr-FR")} kg</td><td className="py-4 pr-4">{lot.qualityGrade}</td><td className="py-4 pr-4">{lot.conservationStatus}</td><td className="py-4 pr-4">{lot.availabilityStatus}</td><td className="py-4 pr-4">{formatCurrency(lot.askingPricePerKg ? lot.askingPricePerKg * lot.weightKg : undefined)}</td></tr>)}</tbody>
                </table>
              </div>
            </article>
          </div>

          <aside className="space-y-6">
            <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
              <SectionTitle eyebrow="4. Tensions et engagements" title="Responsabiliser la résolution" />
              <div className="mt-4 space-y-3">
                {tensions.length ? tensions.map((tension) => {
                  const commitments = getCommitmentsByTension(data, tension.id);
                  return (
                    <div key={tension.id} className="rounded-lg border border-[var(--mb-neutral-200)] p-4">
                      <div className="flex items-start justify-between gap-3"><p className="font-semibold">{tension.description}</p><span className="text-xs font-bold uppercase">{tension.severity}</span></div>
                      <div className="mt-3 space-y-2">{commitments.length ? commitments.map((commitment) => <div key={commitment.id} className="rounded bg-[var(--mb-neutral-50)] p-3 text-xs"><p className="font-semibold">{commitment.action}</p><p className="mt-1 text-[var(--mb-neutral-500)]">Échéance {formatDateTime(commitment.dueAt)} · {commitment.status}</p></div>) : <p className="text-sm text-[var(--mb-neutral-500)]">Aucun engagement associé.</p>}</div>
                    </div>
                  );
                }) : <p className="text-sm text-[var(--mb-neutral-500)]">Aucune tension sur ce parcours.</p>}
              </div>
            </article>

            <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
              <SectionTitle eyebrow="5. Résultats" title="Montrer la valeur créée ou protégée" />
              <div className="mt-4 space-y-3">
                {outcomes.length ? outcomes.map((outcome) => <div key={outcome.id} className="rounded-lg bg-[var(--mb-neutral-50)] p-4"><p className="text-sm font-semibold">{outcome.description}</p><p className="mt-2 text-lg font-semibold">{formatCurrency(outcome.valueCreated)}</p><p className="mt-1 text-xs text-[var(--mb-neutral-500)]">{outcome.valueSavedKg?.toLocaleString("fr-FR") ?? "—"} kg protégés · {outcome.evidence.length} preuve(s)</p></div>) : <p className="text-sm text-[var(--mb-neutral-500)]">Aucun résultat documenté pour ce parcours.</p>}
              </div>
            </article>

            <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
              <SectionTitle eyebrow="Navigation produit" title="Continuer sans rupture" />
              <div className="mt-4 grid gap-2">
                <Link href="/coordination-services" className="rounded-lg border border-[var(--mb-neutral-300)] px-4 py-3 text-sm font-semibold">Coordination des services</Link>
                <Link href="/tracabilite-filiere" className="rounded-lg border border-[var(--mb-neutral-300)] px-4 py-3 text-sm font-semibold">Traçabilité de filière</Link>
                <Link href="/administration-ecosysteme" className="rounded-lg border border-[var(--mb-neutral-300)] px-4 py-3 text-sm font-semibold">Administration de l'écosystème</Link>
                <Link href="/exploitation-mbambulaan" className="rounded-lg border border-[var(--mb-neutral-300)] px-4 py-3 text-sm font-semibold">Control Tower</Link>
              </div>
            </article>
          </aside>
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
  return <div className="rounded-lg bg-[var(--mb-neutral-50)] p-3"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>;
}
