import Link from "next/link";
import { domainRepository } from "@/domain/repositories";
import { getExpectedReturnsByTerritory } from "@/domain/selectors";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ExpectedReturnsPage() {
  const data = domainRepository.getData();
  const territory = data.territories[0];

  if (!territory) {
    return <main className="min-h-screen bg-[var(--mb-offwhite)] p-8">Aucun territoire disponible.</main>;
  }

  const expectedReturns = getExpectedReturnsByTerritory(data, territory.id);

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
          <Link href="/operations" className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">
            ← Retour au pilotage
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">
                Anticiper les flux
              </p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">
                Retours attendus
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mb-neutral-600)]">
                Préparer les quais, les services et les débouchés avant l'arrivée des pirogues.
              </p>
            </div>
            <Link href="/operations/retours/nouveau" className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white">
              Annoncer un retour
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
        <div className="overflow-hidden border border-[var(--mb-neutral-200)] bg-white">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_.8fr] border-b border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-50)] px-5 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">
            <span>Pirogue</span>
            <span>Quai attendu</span>
            <span>Arrivée estimée</span>
            <span>Statut</span>
          </div>

          <div className="divide-y divide-[var(--mb-neutral-200)]">
            {expectedReturns.map((item) => {
              const vessel = data.vessels.find((candidate) => candidate.id === item.vesselId);
              const site = data.landingSites.find((candidate) => candidate.id === item.expectedLandingSiteId);
              const estimatedWeight = item.estimatedCatch.reduce((sum, entry) => sum + entry.estimatedWeightKg, 0);

              return (
                <Link key={item.id} href={`/operations/retours/${item.id}`} className="grid grid-cols-[1.2fr_1fr_1fr_.8fr] items-center px-5 py-4 hover:bg-[var(--mb-foam)]">
                  <div>
                    <p className="text-sm font-semibold text-[var(--mb-navy-900)]">{vessel?.name ?? item.vesselId}</p>
                    <p className="mt-1 text-[11px] text-[var(--mb-neutral-500)]">{estimatedWeight.toLocaleString("fr-FR")} kg estimés</p>
                  </div>
                  <p className="text-[12px] text-[var(--mb-neutral-600)]">{site?.name ?? item.expectedLandingSiteId}</p>
                  <p className="text-[12px] text-[var(--mb-neutral-600)]">{formatDateTime(item.expectedAt)}</p>
                  <span className="w-fit rounded-full border border-[var(--mb-neutral-300)] px-2 py-1 font-mono text-[9px] uppercase text-[var(--mb-neutral-500)]">{item.status}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
