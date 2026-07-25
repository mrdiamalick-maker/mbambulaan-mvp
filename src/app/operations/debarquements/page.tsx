import Link from "next/link";
import { domainRepository } from "@/domain/repositories";
import { getLandingsByTerritory, getLotsByLanding } from "@/domain/selectors";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function LandingsPage() {
  const data = domainRepository.getData();
  const territory = data.territories[0];

  if (!territory) {
    return <main className="min-h-screen bg-[var(--mb-offwhite)] p-8">Aucun territoire disponible.</main>;
  }

  const landings = getLandingsByTerritory(data, territory.id);

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
          <Link href="/operations" className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">
            ← Retour au pilotage
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">Constater les arrivées</p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">Débarquements</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mb-neutral-600)]">Confirmer les arrivées, suivre les pesées et vérifier que les lots sont effectivement créés.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
        <div className="overflow-hidden border border-[var(--mb-neutral-200)] bg-white">
          <div className="grid grid-cols-[1.1fr_1fr_1fr_.8fr_.8fr] border-b border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-50)] px-5 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">
            <span>Pirogue</span>
            <span>Quai</span>
            <span>Débarqué le</span>
            <span>Pesée</span>
            <span>Lots</span>
          </div>

          <div className="divide-y divide-[var(--mb-neutral-200)]">
            {landings.map((landing) => {
              const vessel = data.vessels.find((item) => item.id === landing.vesselId);
              const site = data.landingSites.find((item) => item.id === landing.landingSiteId);
              const weighing = data.weighings.find((item) => item.landingId === landing.id);
              const lots = getLotsByLanding(data, landing.id);

              return (
                <Link key={landing.id} href={`/operations/debarquements/${landing.id}`} className="grid grid-cols-[1.1fr_1fr_1fr_.8fr_.8fr] items-center px-5 py-4 hover:bg-[var(--mb-foam)]">
                  <div>
                    <p className="text-sm font-semibold text-[var(--mb-navy-900)]">{vessel?.name ?? landing.vesselId}</p>
                    <p className="mt-1 text-[11px] text-[var(--mb-neutral-500)]">{landing.status}</p>
                  </div>
                  <p className="text-[12px] text-[var(--mb-neutral-600)]">{site?.name ?? landing.landingSiteId}</p>
                  <p className="text-[12px] text-[var(--mb-neutral-600)]">{formatDateTime(landing.landedAt)}</p>
                  <p className="text-[12px] font-semibold text-[var(--mb-navy-900)]">{weighing ? `${weighing.totalWeightKg.toLocaleString("fr-FR")} kg` : "À faire"}</p>
                  <p className="text-[12px] font-semibold text-[var(--mb-navy-900)]">{lots.length}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
