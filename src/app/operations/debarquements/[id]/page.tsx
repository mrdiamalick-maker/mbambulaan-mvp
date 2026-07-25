import Link from "next/link";
import { notFound } from "next/navigation";
import { domainRepository } from "@/domain/repositories";
import { getLotsByLanding } from "@/domain/selectors";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function LandingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = domainRepository.getData();
  const landing = data.landings.find((item) => item.id === id);

  if (!landing) {
    notFound();
  }

  const vessel = data.vessels.find((item) => item.id === landing.vesselId);
  const site = data.landingSites.find((item) => item.id === landing.landingSiteId);
  const confirmer = data.actors.find((item) => item.id === landing.confirmedByActorId);
  const expectedReturn = landing.expectedReturnId
    ? data.expectedReturns.find((item) => item.id === landing.expectedReturnId)
    : undefined;
  const weighing = data.weighings.find((item) => item.landingId === landing.id);
  const lots = getLotsByLanding(data, landing.id);
  const landedWeight = lots.reduce((total, lot) => total + lot.weightKg, 0);
  const estimatedWeight = expectedReturn?.estimatedCatch.reduce(
    (total, item) => total + item.estimatedWeightKg,
    0,
  );

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
          <Link
            href="/operations/debarquements"
            className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]"
          >
            ← Débarquements
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">
                Débarquement confirmé
              </p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">
                {vessel?.name ?? landing.vesselId}
              </h1>
              <p className="mt-3 text-sm text-[var(--mb-neutral-600)]">
                {site?.name ?? landing.landingSiteId} · {formatDateTime(landing.landedAt)}
              </p>
            </div>
            <span className="w-fit rounded-full border border-[var(--mb-neutral-300)] bg-white px-3 py-2 font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-500)]">
              {landing.status}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[84rem] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)] lg:px-10">
        <div className="space-y-6">
          <section className="border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
            <div className="border-b border-[var(--mb-neutral-200)] pb-4">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
                Mesure du flux
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">Pesée</h2>
            </div>

            {weighing ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <Metric label="Poids mesuré" value={`${weighing.totalWeightKg.toLocaleString("fr-FR")} kg`} />
                <Metric label="Méthode" value={weighing.method.replaceAll("_", " ")} />
                <Metric label="Confiance" value={weighing.confidenceLevel} />
              </div>
            ) : (
              <div className="mt-5 border border-dashed border-[var(--mb-neutral-300)] bg-[var(--mb-offwhite)] p-5">
                <p className="text-sm font-semibold text-[var(--mb-navy-900)]">Pesée non enregistrée</p>
                <p className="mt-2 text-[11px] leading-5 text-[var(--mb-neutral-500)]">
                  La prochaine étape est d'enregistrer le poids réel pour fiabiliser les lots et les décisions marché.
                </p>
                <Link
                  href={`/operations/debarquements/${landing.id}/pesee`}
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-4 text-[10px] font-bold text-white"
                >
                  Enregistrer la pesée
                </Link>
              </div>
            )}
          </section>

          <section className="border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-[var(--mb-neutral-200)] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
                  Valeur disponible
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">Lots créés</h2>
              </div>
              <Link
                href={`/operations/debarquements/${landing.id}/lots/nouveau`}
                className="inline-flex h-10 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-300)] px-4 text-[10px] font-bold text-[var(--mb-navy-900)]"
              >
                Créer un lot
              </Link>
            </div>

            {lots.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {lots.map((lot) => (
                  <article key={lot.id} className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">
                      {lot.qualityGrade} · {lot.conservationStatus}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-[var(--mb-navy-900)]">{lot.species}</h3>
                    <p className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">
                      {lot.weightKg.toLocaleString("fr-FR")} kg
                    </p>
                    <p className="mt-2 text-[11px] text-[var(--mb-neutral-500)]">{lot.availabilityStatus}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-[11px] leading-5 text-[var(--mb-neutral-500)]">Aucun lot créé pour ce débarquement.</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-[var(--mb-neutral-200)] bg-white p-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">Synthèse</p>
            <div className="mt-4 space-y-4">
              <SummaryLine label="Confirmé par" value={confirmer?.name ?? landing.confirmedByActorId} />
              <SummaryLine label="Poids annoncé" value={estimatedWeight ? `${estimatedWeight.toLocaleString("fr-FR")} kg` : "Non annoncé"} />
              <SummaryLine label="Poids pesé" value={weighing ? `${weighing.totalWeightKg.toLocaleString("fr-FR")} kg` : "Non pesé"} />
              <SummaryLine label="Poids en lots" value={`${landedWeight.toLocaleString("fr-FR")} kg`} />
            </div>
          </section>

          <section className="border border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] p-5 text-white">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-400)]">Lecture métier</p>
            <p className="mt-3 text-[11px] leading-5 text-white/65">
              Le débarquement devient exploitable lorsqu'il est pesé puis transformé en lots. Sans ces deux étapes, le marché et les services ne disposent pas d'une information suffisamment fiable pour agir.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-4">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</p>
      <p className="mt-2 text-base font-semibold capitalize text-[var(--mb-navy-900)]">{value}</p>
    </article>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--mb-neutral-200)] pb-3 last:border-0 last:pb-0">
      <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--mb-navy-900)]">{value}</p>
    </div>
  );
}
