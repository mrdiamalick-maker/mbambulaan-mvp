import Link from "next/link";
import { notFound } from "next/navigation";
import { domainRepository } from "@/domain/repositories";
import { getCommitmentsByTension } from "@/domain/selectors";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function ExpectedReturnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = domainRepository.getData();
  const expectedReturn = data.expectedReturns.find((item) => item.id === id);
  if (!expectedReturn) notFound();

  const vessel = data.vessels.find((item) => item.id === expectedReturn.vesselId);
  const site = data.landingSites.find((item) => item.id === expectedReturn.expectedLandingSiteId);
  const creator = data.actors.find((item) => item.id === expectedReturn.createdByActorId);
  const linkedLanding = data.landings.find((item) => item.expectedReturnId === expectedReturn.id);
  const serviceNeeds = data.serviceNeeds.filter((need) => need.expectedReturnId === expectedReturn.id);
  const linkedTensions = data.tensions.filter(
    (item) => item.relatedEntityType === "expected_return" && item.relatedEntityId === expectedReturn.id,
  );
  const estimatedWeight = expectedReturn.estimatedCatch.reduce((total, item) => total + item.estimatedWeightKg, 0);

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] p-6 text-[var(--mb-neutral-900)]">
      <div className="mx-auto max-w-5xl">
        <Link href="/operations/retours" className="text-sm text-[var(--mb-ocean-600)]">← Retours attendus</Link>
        <header className="mt-5 border border-[var(--mb-neutral-200)] bg-white p-6">
          <p className="text-xs font-bold uppercase text-[var(--mb-ocean-600)]">Retour annoncé</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--mb-navy-900)]">{vessel?.name ?? expectedReturn.vesselId}</h1>
          <p className="mt-2 text-sm text-[var(--mb-neutral-600)]">{site?.name ?? expectedReturn.expectedLandingSiteId} · {formatDateTime(expectedReturn.expectedAt)}</p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="border border-[var(--mb-neutral-200)] bg-white p-6">
            <h2 className="text-xl font-semibold">Capture estimée · {estimatedWeight.toLocaleString("fr-FR")} kg</h2>
            <p className="mt-2 text-xs text-[var(--mb-neutral-500)]">Déclaré par {creator?.name ?? expectedReturn.createdByActorId}</p>
            <div className="mt-5 space-y-3">{expectedReturn.estimatedCatch.map((item) => <article key={`${item.species}-${item.estimatedWeightKg}`} className="border p-4"><strong>{item.species}</strong><p>{item.estimatedWeightKg.toLocaleString("fr-FR")} kg</p></article>)}</div>
          </section>

          <section className="border border-[var(--mb-neutral-200)] bg-white p-6">
            <h2 className="text-xl font-semibold">Services à coordonner</h2>
            <div className="mt-5 space-y-3">
              {serviceNeeds.length ? serviceNeeds.map((need) => <article key={need.id} className="border p-4"><strong>{need.needType.replaceAll("_", " ")}</strong><p>{need.requestedQuantity} {need.unit}</p>{need.note ? <p className="text-xs text-[var(--mb-neutral-500)]">{need.note}</p> : null}</article>) : <p className="text-sm text-[var(--mb-neutral-500)]">Aucun besoin déclaré.</p>}
            </div>
          </section>
        </div>

        <section className="mt-6 border border-[var(--mb-neutral-200)] bg-white p-6">
          <h2 className="text-xl font-semibold">État du flux</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Retour annoncé : oui</li>
            <li>Débarquement confirmé : {linkedLanding ? "oui" : "non"}</li>
            <li>Pesée enregistrée : {linkedLanding && data.weighings.some((item) => item.landingId === linkedLanding.id) ? "oui" : "non"}</li>
            <li>Lots créés : {linkedLanding && data.lots.some((item) => item.landingId === linkedLanding.id) ? "oui" : "non"}</li>
          </ul>
        </section>

        <section className="mt-6 border border-[var(--mb-neutral-200)] bg-white p-6">
          <h2 className="text-xl font-semibold">Tensions liées</h2>
          <div className="mt-4 space-y-3">{linkedTensions.length ? linkedTensions.map((tension) => <article key={tension.id} className="border p-4"><strong>{tension.description}</strong><p className="text-xs">{getCommitmentsByTension(data, tension.id).length} engagement(s)</p></article>) : <p className="text-sm text-[var(--mb-neutral-500)]">Aucune tension ouverte.</p>}</div>
        </section>
      </div>
    </main>
  );
}
