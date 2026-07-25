import Link from "next/link";
import { domainRepository } from "@/domain/repositories";

function formatCurrency(value?: number): string {
  if (value === undefined) return "Non renseigné";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function LotsPage() {
  const data = domainRepository.getData();
  const lots = [...data.lots].sort((a, b) => {
    const availabilityScore = Number(b.availabilityStatus === "available") - Number(a.availabilityStatus === "available");
    if (availabilityScore !== 0) return availabilityScore;
    return b.weightKg - a.weightKg;
  });

  const availableLots = lots.filter((lot) => lot.availabilityStatus === "available");
  const availableWeight = availableLots.reduce((total, lot) => total + lot.weightKg, 0);
  const atRiskWeight = availableLots
    .filter((lot) => lot.conservationStatus === "at_risk")
    .reduce((total, lot) => total + lot.weightKg, 0);
  const pricedLots = availableLots.filter((lot) => lot.askingPricePerKg !== undefined);

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
          <Link
            href="/operations"
            className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]"
          >
            ← Retour au pilotage
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">
                Offre mobilisable
              </p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">
                Lots disponibles
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mb-neutral-600)]">
                Donner aux acteurs une vision exploitable des volumes, de leur qualité, de leur niveau de risque et de leur positionnement indicatif.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Lots disponibles" value={availableLots.length.toLocaleString("fr-FR")} />
          <Metric label="Volume disponible" value={`${availableWeight.toLocaleString("fr-FR")} kg`} />
          <Metric label="Volume à risque" value={`${atRiskWeight.toLocaleString("fr-FR")} kg`} />
          <Metric label="Lots avec prix" value={pricedLots.length.toLocaleString("fr-FR")} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {lots.map((lot) => {
            const landing = data.landings.find((item) => item.id === lot.landingId);
            const vessel = landing
              ? data.vessels.find((item) => item.id === landing.vesselId)
              : undefined;
            const site = landing
              ? data.landingSites.find((item) => item.id === landing.landingSiteId)
              : undefined;
            const isAtRisk = lot.conservationStatus === "at_risk";

            return (
              <article
                key={lot.id}
                className="border border-[var(--mb-neutral-200)] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">
                      {lot.qualityGrade} · {lot.conservationStatus.replaceAll("_", " ")}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">
                      {lot.species}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.08em] ${
                      isAtRisk
                        ? "border-[var(--mb-danger-300)] bg-[var(--mb-danger-50)] text-[var(--mb-danger-700)]"
                        : "border-[var(--mb-success-300)] bg-[var(--mb-success-50)] text-[var(--mb-success-700)]"
                    }`}
                  >
                    {lot.availabilityStatus}
                  </span>
                </div>

                <p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[var(--mb-navy-900)]">
                  {lot.weightKg.toLocaleString("fr-FR")} kg
                </p>

                <div className="mt-5 space-y-3 border-t border-[var(--mb-neutral-200)] pt-4">
                  <SummaryLine label="Pirogue" value={vessel?.name ?? "Non renseignée"} />
                  <SummaryLine label="Quai" value={site?.name ?? "Non renseigné"} />
                  <SummaryLine label="Prix indicatif" value={`${formatCurrency(lot.askingPricePerKg)} / kg`} />
                </div>

                <div className="mt-5 flex gap-3">
                  {landing ? (
                    <Link
                      href={`/operations/debarquements/${landing.id}`}
                      className="inline-flex h-10 flex-1 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-300)] px-4 text-[10px] font-bold text-[var(--mb-navy-900)]"
                    >
                      Voir l'origine
                    </Link>
                  ) : null}
                  <Link
                    href={`/operations/lots/${lot.id}`}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-4 text-[10px] font-bold text-white"
                  >
                    Ouvrir le lot
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="border border-[var(--mb-neutral-200)] bg-white p-5">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">{value}</p>
    </article>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</span>
      <span className="text-right text-[11px] font-semibold text-[var(--mb-navy-900)]">{value}</span>
    </div>
  );
}
