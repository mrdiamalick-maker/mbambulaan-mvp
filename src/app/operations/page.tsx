import Link from "next/link";
import { domainRepository } from "@/domain/repositories";
import {
  getAvailableCapacitiesByTerritory,
  getAvailableLotsByTerritory,
  getExpectedReturnsByTerritory,
  getOpenTensionsByTerritory,
  getTerritoryOperationalSummary,
} from "@/domain/selectors";

function formatKg(value: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function OperationsPage() {
  const data = domainRepository.getData();
  const territory = data.territories[0];

  if (!territory) {
    return <main className="min-h-screen bg-[var(--mb-offwhite)] p-8 text-[var(--mb-neutral-900)]">Aucun territoire disponible.</main>;
  }

  const summary = getTerritoryOperationalSummary(data, territory.id);
  const expectedReturns = getExpectedReturnsByTerritory(data, territory.id);
  const lots = getAvailableLotsByTerritory(data, territory.id);
  const tensions = getOpenTensionsByTerritory(data, territory.id);
  const capacities = getAvailableCapacitiesByTerritory(data, territory.id);
  const siteIds = data.landingSites.filter((item) => item.territoryId === territory.id).map((item) => item.id);
  const territoryReturnIds = expectedReturns.map((item) => item.id);
  const serviceNeeds = data.serviceNeeds.filter((item) => item.territoryId === territory.id);
  const allocations = data.serviceAllocations.filter((item) => serviceNeeds.some((need) => need.id === item.serviceNeedId));
  const executions = data.serviceExecutions.filter((item) => allocations.some((allocation) => allocation.id === item.allocationId));
  const landings = data.landings.filter((item) => siteIds.includes(item.landingSiteId));
  const weighings = data.weighings.filter((item) => landings.some((landing) => landing.id === item.landingId));
  const outcomes = data.outcomes.filter((item) => {
    if (item.relatedEntityType === "tension") return tensions.some((tension) => tension.id === item.relatedEntityId);
    if (item.relatedEntityType === "service_need") return serviceNeeds.some((need) => need.id === item.relatedEntityId);
    if (item.relatedEntityType === "service_allocation") return allocations.some((allocation) => allocation.id === item.relatedEntityId);
    if (item.relatedEntityType === "service_execution") return executions.some((execution) => execution.id === item.relatedEntityId);
    if (item.relatedEntityType === "landing") return landings.some((landing) => landing.id === item.relatedEntityId);
    if (item.relatedEntityType === "lot") return lots.some((lot) => lot.id === item.relatedEntityId);
    return false;
  });
  const commitments = data.commitments.filter((item) => tensions.some((tension) => tension.id === item.tensionId));
  const completedCommitments = commitments.filter((item) => item.status === "completed");
  const completedRate = commitments.length ? Math.round((completedCommitments.length / commitments.length) * 100) : 0;
  const landedReturns = expectedReturns.filter((item) => item.status === "arrived");
  const announcedBeforeArrivalRate = expectedReturns.length ? Math.round((landedReturns.length / expectedReturns.length) * 100) : 0;
  const confirmedLandings = landings.filter((item) => item.status === "confirmed");
  const weighingCoverage = confirmedLandings.length ? Math.round((weighings.length / confirmedLandings.length) * 100) : 0;
  const executedAllocationRate = allocations.length ? Math.round((executions.length / allocations.length) * 100) : 0;
  const protectedKg = outcomes.reduce((sum, item) => sum + (item.valueSavedKg ?? 0), 0);
  const valueCreated = outcomes.reduce((sum, item) => sum + (item.valueCreated ?? 0), 0);
  const estimatedLotValue = lots.reduce((sum, lot) => sum + (lot.askingPricePerKg ? lot.askingPricePerKg * lot.weightKg : 0), 0);

  const loopSteps = [
    { label: "Retours annoncés", value: expectedReturns.length, href: "/operations/retours-attendus" },
    { label: "Besoins déclarés", value: serviceNeeds.length, href: "/coordination-services" },
    { label: "Allocations", value: allocations.length, href: "/coordination-services" },
    { label: "Exécutions", value: executions.length, href: "/coordination-services" },
    { label: "Débarquements", value: landings.length, href: "/operations/debarquements" },
    { label: "Pesées", value: weighings.length, href: "/operations/debarquements" },
    { label: "Lots", value: lots.length, href: "/operations/lots" },
    { label: "Résultats", value: outcomes.length, href: "/operations/tensions" },
  ];

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-400)]">Pilotage opérationnel</p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <Link href="/coordination-services" className="rounded border border-white/20 px-3 py-2 text-white/80">Coordination</Link>
              <Link href="/operations/tensions" className="rounded border border-white/20 px-3 py-2 text-white/80">Tensions</Link>
              <Link href="/atlas" className="rounded border border-white/20 px-3 py-2 text-white/80">Atlas</Link>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-none tracking-[-0.03em]">{territory.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Une lecture de bout en bout de la boucle MVP : anticipation, besoin, capacité, coordination, exécution, traçabilité et preuve de valeur.</p>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/45">Données V1 simulées · modèle métier réel</div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto grid max-w-[84rem] gap-px bg-[var(--mb-neutral-200)] sm:grid-cols-2 lg:grid-cols-6">
          <Metric label="Retours attendus" value={summary.expectedReturnsCount} />
          <Metric label="Besoins de service" value={serviceNeeds.length} />
          <Metric label="Capacité mobilisable" value={`${formatKg(capacities.reduce((sum, item) => sum + item.availableQuantity, 0))}`} />
          <Metric label="Tensions actives" value={tensions.length} />
          <Metric label="Poids protégé" value={`${formatKg(protectedKg)} kg`} />
          <Metric label="Valeur créée" value={formatCurrency(valueCreated)} />
        </div>
      </section>

      <section className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
        <section className="border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-[var(--mb-neutral-200)] pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">Boucle MVP instrumentée</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">Du retour annoncé à la preuve de valeur</h2>
            </div>
            <p className="max-w-2xl text-[11px] leading-5 text-[var(--mb-neutral-500)]">Le cockpit mesure l'avancement réel de la tranche verticale prévue dans la roadmap, sans introduire paiement, marketplace ou automatisation prématurée.</p>
          </div>
          <div className="mt-5 grid gap-px border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            {loopSteps.map((step, index) => (
              <Link key={step.label} href={step.href} className="bg-[var(--mb-offwhite)] p-4 hover:bg-[var(--mb-foam)]">
                <p className="font-mono text-[8px] font-bold uppercase text-[var(--mb-neutral-400)]">Étape {index + 1}</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--mb-navy-900)]">{step.value}</p>
                <p className="mt-1 text-[10px] font-bold text-[var(--mb-neutral-600)]">{step.label}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Kpi label="Retours arrivés" value={`${announcedBeforeArrivalRate}%`} note={`${landedReturns.length}/${expectedReturns.length} retours`} />
          <Kpi label="Allocations exécutées" value={`${executedAllocationRate}%`} note={`${executions.length}/${allocations.length} allocations`} />
          <Kpi label="Engagements exécutés" value={`${completedRate}%`} note={`${completedCommitments.length}/${commitments.length} engagements`} />
          <Kpi label="Couverture des pesées" value={`${weighingCoverage}%`} note={`${weighings.length}/${confirmedLandings.length} débarquements`} />
          <Kpi label="Valeur des lots" value={formatCurrency(estimatedLotValue)} note={`${formatKg(summary.availableLotWeightKg)} kg disponibles`} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="Retours attendus" eyebrow="Anticiper" href="/operations/retours-attendus">
            <div className="divide-y divide-[var(--mb-neutral-200)]">
              {expectedReturns.map((item) => {
                const vessel = data.vessels.find((candidate) => candidate.id === item.vesselId);
                const site = data.landingSites.find((candidate) => candidate.id === item.expectedLandingSiteId);
                const estimatedWeight = item.estimatedCatch.reduce((total, catchEstimate) => total + catchEstimate.estimatedWeightKg, 0);
                const needs = serviceNeeds.filter((need) => need.expectedReturnId === item.id);
                return <article key={item.id} className="py-4 first:pt-0 last:pb-0"><div className="flex items-start justify-between gap-4"><div><h3 className="text-sm font-semibold text-[var(--mb-navy-900)]">{vessel?.name ?? item.vesselId}</h3><p className="mt-1 text-[11px] text-[var(--mb-neutral-500)]">{site?.name ?? item.expectedLandingSiteId} · {formatDateTime(item.expectedAt)}</p></div><span className="rounded-full border border-[var(--mb-neutral-300)] px-2 py-1 font-mono text-[9px] uppercase text-[var(--mb-neutral-500)]">{item.status}</span></div><p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">Estimation : {formatKg(estimatedWeight)} kg · {item.estimatedCatch.map((entry) => entry.species).join(", ")} · {needs.length} besoin(s)</p></article>;
              })}
            </div>
          </Panel>

          <Panel title="Tensions à coordonner" eyebrow="Décider" href="/operations/tensions">
            <div className="divide-y divide-[var(--mb-neutral-200)]">
              {tensions.map((item) => {
                const relatedCommitments = commitments.filter((commitment) => commitment.tensionId === item.id);
                return <article key={item.id} className="py-4 first:pt-0 last:pb-0"><div className="flex items-start justify-between gap-4"><div><h3 className="text-sm font-semibold text-[var(--mb-navy-900)]">{item.description}</h3><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{item.tensionType.replaceAll("_", " ")}</p></div><span className="rounded-full border border-[var(--mb-neutral-300)] px-2 py-1 font-mono text-[9px] uppercase text-[var(--mb-neutral-500)]">{item.severity}</span></div><p className="mt-3 text-[11px] text-[var(--mb-neutral-500)]">Signalée le {formatDateTime(item.reportedAt)} · {relatedCommitments.length} engagement(s)</p></article>;
              })}
            </div>
          </Panel>

          <Panel title="Lots disponibles" eyebrow="Créer de la valeur" href="/operations/lots">
            <div className="grid gap-3 sm:grid-cols-2">
              {lots.map((lot) => <article key={lot.id} className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-4"><p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{lot.qualityGrade} · {lot.conservationStatus}</p><h3 className="mt-2 text-base font-semibold text-[var(--mb-navy-900)]">{lot.species}</h3><p className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">{formatKg(lot.weightKg)} kg</p>{lot.askingPricePerKg ? <p className="mt-1 text-[11px] text-[var(--mb-neutral-500)]">{formatCurrency(lot.askingPricePerKg)}/kg</p> : null}</article>)}
            </div>
          </Panel>

          <Panel title="Capacités mobilisables" eyebrow="Coordonner" href="/coordination-services">
            <div className="divide-y divide-[var(--mb-neutral-200)]">
              {capacities.map((capacity) => {
                const provider = data.organizations.find((organization) => organization.id === capacity.providerOrganizationId);
                return <article key={capacity.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div><h3 className="text-sm font-semibold text-[var(--mb-navy-900)]">{capacity.capacityType.replaceAll("_", " ")}</h3><p className="mt-1 text-[11px] text-[var(--mb-neutral-500)]">{provider?.name ?? capacity.providerOrganizationId}</p></div><div className="text-right"><p className="text-base font-semibold text-[var(--mb-navy-900)]">{formatKg(capacity.availableQuantity)} {capacity.unit}</p><p className="mt-1 font-mono text-[9px] uppercase text-[var(--mb-neutral-400)]">{capacity.status}</p></div></article>;
              })}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <article className="bg-white px-5 py-5 sm:px-6"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--mb-navy-900)]">{value}</p></article>;
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-white p-4"><p className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">{value}</p><p className="mt-1 text-[10px] text-[var(--mb-neutral-500)]">{note}</p></article>;
}

function Panel({ title, eyebrow, href, children }: { title: string; eyebrow: string; href: string; children: React.ReactNode }) {
  return <section className="border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6"><div className="mb-5 flex items-end justify-between gap-4 border-b border-[var(--mb-neutral-200)] pb-4"><div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">{eyebrow}</p><h2 className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">{title}</h2></div><Link href={href} className="text-[10px] font-bold text-[var(--mb-ocean-600)]">Ouvrir →</Link></div>{children}</section>;
}
