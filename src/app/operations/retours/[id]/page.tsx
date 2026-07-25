import Link from "next/link";
import { notFound } from "next/navigation";
import { domainRepository } from "@/domain/repositories";
import { getCommitmentsByTension } from "@/domain/selectors";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ExpectedReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = domainRepository.getData();
  const expectedReturn = data.expectedReturns.find((item) => item.id === id);

  if (!expectedReturn) {
    notFound();
  }

  const vessel = data.vessels.find((item) => item.id === expectedReturn.vesselId);
  const site = data.landingSites.find(
    (item) => item.id === expectedReturn.expectedLandingSiteId,
  );
  const creator = data.actors.find(
    (item) => item.id === expectedReturn.createdByActorId,
  );
  const linkedLanding = data.landings.find(
    (item) => item.expectedReturnId === expectedReturn.id,
  );
  const linkedTensions = data.tensions.filter(
    (item) =>
      item.relatedEntityType === "expected_return" &&
      item.relatedEntityId === expectedReturn.id,
  );
  const estimatedWeight = expectedReturn.estimatedCatch.reduce(
    (total, item) => total + item.estimatedWeightKg,
    0,
  );

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
          <Link
            href="/operations/retours"
            className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]"
          >
            ← Retours attendus
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">
                Retour annoncé
              </p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">
                {vessel?.name ?? expectedReturn.vesselId}
              </h1>
              <p className="mt-3 text-sm text-[var(--mb-neutral-600)]">
                {site?.name ?? expectedReturn.expectedLandingSiteId} · arrivée prévue le {formatDateTime(expectedReturn.expectedAt)}
              </p>
            </div>
            <span className="w-fit rounded-full border border-[var(--mb-neutral-300)] bg-white px-3 py-2 font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-500)]">
              {expectedReturn.status}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[84rem] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,.6fr)] lg:px-10">
        <div className="space-y-6">
          <section className="border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-[var(--mb-neutral-200)] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
                  Capture estimée
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">
                  {estimatedWeight.toLocaleString("fr-FR")} kg annoncés
                </h2>
              </div>
              <p className="text-[11px] text-[var(--mb-neutral-500)]">
                Déclaré par {creator?.name ?? expectedReturn.createdByActorId}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {expectedReturn.estimatedCatch.map((item) => (
                <article
                  key={`${item.species}-${item.estimatedWeightKg}`}
                  className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-4"
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">
                    Espèce
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-[var(--mb-navy-900)]">
                    {item.species}
                  </h3>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">
                    {item.estimatedWeightKg.toLocaleString("fr-FR")} kg
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
            <div className="border-b border-[var(--mb-neutral-200)] pb-4">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
                Préparation nécessaire
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">
                Services à coordonner
              </h2>
            </div>
            <div className="mt-5 divide-y divide-[var(--mb-neutral-200)]">
              {expectedReturn.serviceNeeds.map((need, index) => (
                <article
                  key={`${need.type}-${index}`}
                  className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--mb-navy-900)]">
                      {need.type.replaceAll("_", " ")}
                    </h3>
                    {need.note ? (
                      <p className="mt-1 text-[11px] leading-5 text-[var(--mb-neutral-500)]">
                        {need.note}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-right text-sm font-semibold text-[var(--mb-navy-900)]">
                    {need.quantity ?? "—"} {need.unit ?? ""}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-[var(--mb-neutral-200)] bg-white p-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
              Statut du flux
            </p>
            <div className="mt-4 space-y-4">
              <StatusLine label="Retour annoncé" active />
              <StatusLine label="Débarquement confirmé" active={Boolean(linkedLanding)} />
              <StatusLine label="Pesée enregistrée" active={Boolean(linkedLanding && data.weighings.some((item) => item.landingId === linkedLanding.id))} />
              <StatusLine label="Lots créés" active={Boolean(linkedLanding && data.lots.some((item) => item.landingId === linkedLanding.id))} />
            </div>
          </section>

          <section className="border border-[var(--mb-neutral-200)] bg-white p-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
              Tensions liées
            </p>
            <div className="mt-4 space-y-3">
              {linkedTensions.length > 0 ? (
                linkedTensions.map((tension) => {
                  const commitments = getCommitmentsByTension(data, tension.id);
                  return (
                    <article key={tension.id} className="border border-[var(--mb-neutral-200)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold text-[var(--mb-navy-900)]">
                          {tension.description}
                        </h3>
                        <span className="font-mono text-[9px] uppercase text-[var(--mb-neutral-400)]">
                          {tension.severity}
                        </span>
                      </div>
                      <p className="mt-3 text-[11px] text-[var(--mb-neutral-500)]">
                        {commitments.length} engagement(s) associé(s)
                      </p>
                    </article>
                  );
                })
              ) : (
                <p className="text-[11px] leading-5 text-[var(--mb-neutral-500)]">
                  Aucune tension ouverte sur ce retour.
                </p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function StatusLine({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          active ? "bg-[var(--mb-ocean-600)]" : "bg-[var(--mb-neutral-200)]"
        }`}
      />
      <span
        className={`text-[12px] ${
          active ? "font-semibold text-[var(--mb-navy-900)]" : "text-[var(--mb-neutral-400)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
