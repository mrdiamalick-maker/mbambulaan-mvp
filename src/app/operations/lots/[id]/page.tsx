import Link from "next/link";
import { notFound } from "next/navigation";
import { domainRepository } from "@/domain/repositories";

function formatCurrency(value?: number): string {
  if (value === undefined) return "Non renseigné";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function LotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = domainRepository.getData();
  const lot = data.lots.find((item) => item.id === id);

  if (!lot) {
    notFound();
  }

  const landing = data.landings.find((item) => item.id === lot.landingId);
  const vessel = landing
    ? data.vessels.find((item) => item.id === landing.vesselId)
    : undefined;
  const site = landing
    ? data.landingSites.find((item) => item.id === landing.landingSiteId)
    : undefined;
  const weighing = landing
    ? data.weighings.find((item) => item.landingId === landing.id)
    : undefined;
  const relatedTensions = data.tensions.filter(
    (item) => item.relatedEntityType === "lot" && item.relatedEntityId === lot.id,
  );
  const relatedOutcomes = data.outcomes.filter(
    (item) => item.relatedEntityType === "lot" && item.relatedEntityId === lot.id,
  );

  const isAtRisk = lot.conservationStatus === "at_risk";
  const openTensions = relatedTensions.filter((item) => item.status === "open");
  const createdValue = relatedOutcomes.reduce(
    (total, item) => total + (item.valueCreated ?? 0),
    0,
  );

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
          <Link
            href="/operations/lots"
            className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]"
          >
            ← Lots disponibles
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">
                Unité de coordination
              </p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">
                {lot.species}
              </h1>
              <p className="mt-3 text-sm text-[var(--mb-neutral-600)]">
                {vessel?.name ?? "Pirogue non renseignée"} · {site?.name ?? "Quai non renseigné"}
              </p>
            </div>
            <span
              className={`w-fit rounded-full border px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.08em] ${
                isAtRisk
                  ? "border-[var(--mb-danger-300)] bg-[var(--mb-danger-50)] text-[var(--mb-danger-700)]"
                  : "border-[var(--mb-success-300)] bg-[var(--mb-success-50)] text-[var(--mb-success-700)]"
              }`}
            >
              {lot.availabilityStatus}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[84rem] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)] lg:px-10">
        <div className="space-y-6">
          <section className="border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
            <div className="border-b border-[var(--mb-neutral-200)] pb-4">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
                Caractéristiques
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">Lecture du lot</h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Poids" value={`${lot.weightKg.toLocaleString("fr-FR")} kg`} />
              <Metric label="Qualité" value={lot.qualityGrade} />
              <Metric label="Conservation" value={lot.conservationStatus.replaceAll("_", " ")} />
              <Metric label="Prix indicatif" value={`${formatCurrency(lot.askingPricePerKg)} / kg`} />
            </div>
          </section>

          <section className="border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-[var(--mb-neutral-200)] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
                  Coordination
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">Tensions liées au lot</h2>
              </div>
              <Link
                href={`/operations/tensions/nouvelle?entityType=lot&entityId=${lot.id}`}
                className="inline-flex h-10 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-300)] px-4 text-[10px] font-bold text-[var(--mb-navy-900)]"
              >
                Signaler une tension
              </Link>
            </div>

            {relatedTensions.length > 0 ? (
              <div className="mt-5 space-y-3">
                {relatedTensions.map((tension) => (
                  <Link
                    key={tension.id}
                    href={`/operations/tensions/${tension.id}`}
                    className="block border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-4 hover:bg-[var(--mb-foam)]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">
                        {tension.tensionType.replaceAll("_", " ")} · {tension.severity}
                      </p>
                      <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-[var(--mb-neutral-500)]">
                        {tension.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[var(--mb-navy-900)]">{tension.description}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-[11px] leading-5 text-[var(--mb-neutral-500)]">Aucune tension signalée pour ce lot.</p>
            )}
          </section>

          <section className="border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
            <div className="border-b border-[var(--mb-neutral-200)] pb-4">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
                Preuve de valeur
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">Résultats enregistrés</h2>
            </div>

            {relatedOutcomes.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {relatedOutcomes.map((outcome) => (
                  <article key={outcome.id} className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">
                      {outcome.outcomeType.replaceAll("_", " ")}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--mb-navy-900)]">{outcome.description}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-[11px] leading-5 text-[var(--mb-neutral-500)]">Aucun résultat enregistré pour ce lot.</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-[var(--mb-neutral-200)] bg-white p-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">Synthèse</p>
            <div className="mt-4 space-y-4">
              <SummaryLine label="Poids pesé du débarquement" value={weighing ? `${weighing.totalWeightKg.toLocaleString("fr-FR")} kg` : "Non pesé"} />
              <SummaryLine label="Tensions ouvertes" value={openTensions.length.toLocaleString("fr-FR")} />
              <SummaryLine label="Valeur créée" value={formatCurrency(createdValue)} />
            </div>
          </section>

          {landing ? (
            <Link
              href={`/operations/debarquements/${landing.id}`}
              className="block border border-[var(--mb-neutral-200)] bg-white p-5 hover:bg-[var(--mb-foam)]"
            >
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">Traçabilité</p>
              <p className="mt-2 text-sm font-semibold text-[var(--mb-navy-900)]">Voir le débarquement d'origine</p>
            </Link>
          ) : null}

          <section className="border border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] p-5 text-white">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-400)]">Lecture métier</p>
            <p className="mt-3 text-[11px] leading-5 text-white/65">
              Cette fiche devient le point de coordination entre disponibilité, urgence, services nécessaires, acteurs engagés et valeur effectivement créée.
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
