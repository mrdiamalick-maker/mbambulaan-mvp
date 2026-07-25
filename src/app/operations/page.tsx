import { domainRepository } from "@/domain/repositories";
import {
  getAvailableCapacitiesByTerritory,
  getAvailableLotsByTerritory,
  getExpectedReturnsByTerritory,
  getOpenTensionsByTerritory,
  getTerritoryOperationalSummary,
} from "@/domain/selectors";

function formatKg(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function OperationsPage() {
  const data = domainRepository.getData();
  const territory = data.territories[0];

  if (!territory) {
    return (
      <main className="min-h-screen bg-[var(--mb-offwhite)] p-8 text-[var(--mb-neutral-900)]">
        Aucun territoire disponible.
      </main>
    );
  }

  const summary = getTerritoryOperationalSummary(data, territory.id);
  const expectedReturns = getExpectedReturnsByTerritory(data, territory.id);
  const lots = getAvailableLotsByTerritory(data, territory.id);
  const tensions = getOpenTensionsByTerritory(data, territory.id);
  const capacities = getAvailableCapacitiesByTerritory(data, territory.id);

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-400)]">
            Pilotage opérationnel
          </p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-none tracking-[-0.03em]">
                {territory.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
                Une vue commune des retours attendus, lots disponibles, capacités mobilisables et tensions à coordonner.
              </p>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/45">
              Données V1 simulées · modèle métier réel
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto grid max-w-[84rem] gap-px bg-[var(--mb-neutral-200)] sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Retours attendus" value={summary.expectedReturnsCount} />
          <Metric label="Poids disponible" value={`${formatKg(summary.availableLotWeightKg)} kg`} />
          <Metric label="Besoins ouverts" value={`${formatKg(summary.openMarketNeedWeightKg)} kg`} />
          <Metric label="Tensions critiques" value={summary.criticalTensionsCount} />
        </div>
      </section>

      <section className="mx-auto grid max-w-[84rem] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-2 lg:px-10">
        <Panel title="Retours attendus" eyebrow="Anticiper">
          <div className="divide-y divide-[var(--mb-neutral-200)]">
            {expectedReturns.map((item) => {
              const vessel = data.vessels.find((candidate) => candidate.id === item.vesselId);
              const site = data.landingSites.find((candidate) => candidate.id === item.expectedLandingSiteId);
              const estimatedWeight = item.estimatedCatch.reduce(
                (total, catchEstimate) => total + catchEstimate.estimatedWeightKg,
                0,
              );

              return (
                <article key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--mb-navy-900)]">
                        {vessel?.name ?? item.vesselId}
                      </h3>
                      <p className="mt-1 text-[11px] text-[var(--mb-neutral-500)]">
                        {site?.name ?? item.expectedLandingSiteId} · {formatDateTime(item.expectedAt)}
                      </p>
                    </div>
                    <span className="rounded-full border border-[var(--mb-neutral-300)] px-2 py-1 font-mono text-[9px] uppercase text-[var(--mb-neutral-500)]">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">
                    Estimation : {formatKg(estimatedWeight)} kg · {item.estimatedCatch.map((entry) => entry.species).join(", ")}
                  </p>
                </article>
              );
            })}
          </div>
        </Panel>

        <Panel title="Tensions à coordonner" eyebrow="Décider">
          <div className="divide-y divide-[var(--mb-neutral-200)]">
            {tensions.map((item) => (
              <article key={item.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--mb-navy-900)]">
                      {item.description}
                    </h3>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">
                      {item.tensionType.replaceAll("_", " ")}
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--mb-neutral-300)] px-2 py-1 font-mono text-[9px] uppercase text-[var(--mb-neutral-500)]">
                    {item.severity}
                  </span>
                </div>
                <p className="mt-3 text-[11px] text-[var(--mb-neutral-500)]">
                  Signalée le {formatDateTime(item.reportedAt)} · statut {item.status}
                </p>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Lots disponibles" eyebrow="Créer de la valeur">
          <div className="grid gap-3 sm:grid-cols-2">
            {lots.map((lot) => (
              <article key={lot.id} className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">
                  {lot.qualityGrade} · {lot.conservationStatus}
                </p>
                <h3 className="mt-2 text-base font-semibold text-[var(--mb-navy-900)]">{lot.species}</h3>
                <p className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">
                  {formatKg(lot.weightKg)} kg
                </p>
                {lot.askingPricePerKg ? (
                  <p className="mt-1 text-[11px] text-[var(--mb-neutral-500)]">
                    {new Intl.NumberFormat("fr-FR").format(lot.askingPricePerKg)} XOF/kg
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Capacités mobilisables" eyebrow="Coordonner">
          <div className="divide-y divide-[var(--mb-neutral-200)]">
            {capacities.map((capacity) => {
              const provider = data.organizations.find(
                (organization) => organization.id === capacity.providerOrganizationId,
              );

              return (
                <article key={capacity.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--mb-navy-900)]">
                      {capacity.capacityType.replaceAll("_", " ")}
                    </h3>
                    <p className="mt-1 text-[11px] text-[var(--mb-neutral-500)]">
                      {provider?.name ?? capacity.providerOrganizationId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-[var(--mb-navy-900)]">
                      {formatKg(capacity.availableQuantity)} {capacity.unit}
                    </p>
                    <p className="mt-1 font-mono text-[9px] uppercase text-[var(--mb-neutral-400)]">
                      {capacity.status}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="bg-white px-5 py-5 sm:px-6">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--mb-navy-900)]">
        {value}
      </p>
    </article>
  );
}

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
      <div className="mb-5 border-b border-[var(--mb-neutral-200)] pb-4">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">{title}</h2>
      </div>
      {children}
    </section>
  );
}
