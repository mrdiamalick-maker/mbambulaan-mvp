import Link from "next/link";
import { domainRepository } from "@/domain/repositories";
import { getLotsByLanding } from "@/domain/selectors";

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

export default function TraceabilityPage() {
  const data = domainRepository.getData();
  const tracedWeight = data.lots.reduce((total, lot) => total + lot.weightKg, 0);
  const protectedWeight = data.outcomes.reduce(
    (total, outcome) => total + (outcome.valueSavedKg ?? 0),
    0,
  );
  const securedValue = data.outcomes.reduce(
    (total, outcome) => total + (outcome.valueCreated ?? 0),
    0,
  );

  const tracedLots = data.lots.map((lot) => {
    const landing = data.landings.find((item) => item.id === lot.landingId);
    const expectedReturn = landing?.expectedReturnId
      ? data.expectedReturns.find((item) => item.id === landing.expectedReturnId)
      : undefined;
    const vessel = data.vessels.find((item) => item.id === landing?.vesselId);
    const site = data.landingSites.find((item) => item.id === landing?.landingSiteId);
    const weighing = data.weighings.find((item) => item.landingId === lot.landingId);
    const needs = expectedReturn
      ? data.serviceNeeds.filter((item) => item.expectedReturnId === expectedReturn.id)
      : [];
    const allocationIds = new Set(
      data.serviceAllocations
        .filter((item) => needs.some((need) => need.id === item.serviceNeedId))
        .map((item) => item.id),
    );
    const executions = data.serviceExecutions.filter((item) =>
      allocationIds.has(item.allocationId),
    );
    const lotValue = lot.askingPricePerKg
      ? lot.askingPricePerKg * lot.weightKg
      : undefined;

    return {
      lot,
      landing,
      expectedReturn,
      vessel,
      site,
      weighing,
      needs,
      executions,
      lotValue,
    };
  });

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Traçabilité de filière</p>
              <h1 className="mt-2 text-3xl font-semibold">Relier chaque lot à son retour, ses services et ses preuves</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">La traçabilité repose ici sur les objets réellement enregistrés : retour, débarquement, pesée, lot, service exécuté, preuve et résultat.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/operations/retours" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Retours</Link>
              <Link href="/coordination-services" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Coordination</Link>
              <Link href="/exploitation-mbambulaan" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Exploitation</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Lots tracés" value={String(data.lots.length)} detail="Reliés à un débarquement et à une origine" />
          <Metric label="Poids tracé" value={`${tracedWeight.toLocaleString("fr-FR")} kg`} detail="Somme des lots enregistrés" />
          <Metric label="Poids protégé" value={`${protectedWeight.toLocaleString("fr-FR")} kg`} detail="Résultats documentés avec preuve" />
          <Metric label="Valeur documentée" value={formatCurrency(securedValue)} detail="Valeur issue des résultats enregistrés" />
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Lots et continuité de preuve</p>
          <h2 className="mt-2 text-xl font-semibold">Vérifier la chaîne de confiance lot par lot</h2>
          <div className="mt-5 space-y-4">
            {tracedLots.map(({ lot, landing, expectedReturn, vessel, site, weighing, needs, executions, lotValue }) => (
              <article key={lot.id} className="rounded-xl border border-[var(--mb-neutral-200)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] text-[var(--mb-neutral-400)]">{lot.id}</p>
                    <h3 className="mt-1 text-lg font-semibold">{lot.species} · {lot.weightKg.toLocaleString("fr-FR")} kg</h3>
                    <p className="mt-1 text-sm text-[var(--mb-neutral-500)]">{site?.name ?? "Site non renseigné"} · {vessel?.name ?? landing?.vesselId ?? "Origine non renseignée"}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded border px-2 py-1 text-xs font-semibold">{lot.availabilityStatus}</span>
                    <p className="mt-2 text-sm font-semibold">{formatCurrency(lotValue)}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <MiniMetric label="Retour" value={expectedReturn ? formatDateTime(expectedReturn.expectedAt) : "Non relié"} />
                  <MiniMetric label="Débarquement" value={landing ? formatDateTime(landing.landedAt) : "Non confirmé"} />
                  <MiniMetric label="Pesée" value={weighing ? `${weighing.totalWeightKg.toLocaleString("fr-FR")} kg` : "Non enregistrée"} />
                  <MiniMetric label="Services liés" value={String(needs.length)} />
                  <MiniMetric label="Preuves d'exécution" value={String(executions.reduce((total, execution) => total + execution.evidence.length, 0))} />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <TraceCard title="Origine et responsabilité" text={`Débarquement ${landing?.id ?? "non renseigné"} · confirmation par ${landing ? data.actors.find((actor) => actor.id === landing.confirmedByActorId)?.name ?? landing.confirmedByActorId : "—"}.`} />
                  <TraceCard title="Qualité et confiance" text={`Qualité ${lot.qualityGrade}, conservation ${lot.conservationStatus}${weighing ? `, pesée ${weighing.confidenceLevel}` : ""}.`} />
                  <TraceCard title="Services exécutés" text={executions.length ? executions.map((execution) => `${execution.executedQuantity} exécuté(s), ${execution.evidence.length} preuve(s)`).join(" · ") : "Aucune exécution de service reliée à ce lot."} />
                </div>

                {expectedReturn ? (
                  <div className="mt-4">
                    <Link href={`/operations/retours/${expectedReturn.id}`} className="rounded-lg border border-[var(--mb-neutral-300)] px-3 py-2 text-xs font-semibold">Ouvrir le parcours complet du retour</Link>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <TraceCard title="Origine vérifiable" text="Chaque lot est relié au débarquement, au site, à l'embarcation et, lorsque disponible, au retour attendu." />
          <TraceCard title="Qualité visible" text="La méthode de pesée, le niveau de confiance, la qualité et l'état de conservation sont affichés ensemble." />
          <TraceCard title="Services prouvés" text="Les exécutions de glace, froid, transport ou manutention sont reliées aux besoins du retour et à leurs preuves." />
          <TraceCard title="Écart détectable" text="Le poids total des lots peut être comparé au poids mesuré afin d'identifier un reliquat ou une incohérence." />
          <TraceCard title="Responsabilités lisibles" text="Chaque confirmation conserve l'acteur, l'organisation et l'horodatage disponibles dans le domaine." />
          <TraceCard title="Valeur contestable" text="La valeur affichée provient des prix unitaires ou des résultats enregistrés, jamais d'une hypothèse non identifiée." />
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-2 text-xs leading-5 text-[var(--mb-neutral-500)]">{detail}</p></article>;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-[var(--mb-neutral-50)] p-3"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>;
}

function TraceCard({ title, text }: { title: string; text: string }) {
  return <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>;
}
