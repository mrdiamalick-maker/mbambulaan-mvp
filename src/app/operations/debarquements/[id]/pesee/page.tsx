import Link from "next/link";
import { notFound } from "next/navigation";
import { domainRepository } from "@/domain/repositories";

export default async function RegisterWeighingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = domainRepository.getData();
  const landing = data.landings.find((item) => item.id === id);
  if (!landing) notFound();

  const existingWeighing = data.weighings.find((item) => item.landingId === landing.id);
  const vessel = data.vessels.find((item) => item.id === landing.vesselId);
  const site = data.landingSites.find((item) => item.id === landing.landingSiteId);
  const verifiers = data.actors.filter(
    (item) => item.actorType === "landing_site_agent" || item.actorType === "territorial_coordinator",
  );

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] p-6 text-[var(--mb-neutral-900)]">
      <div className="mx-auto max-w-4xl">
        <Link href={`/operations/debarquements/${landing.id}`} className="text-sm text-[var(--mb-ocean-600)]">
          ← Retour au débarquement
        </Link>
        <h1 className="mt-5 text-3xl font-semibold text-[var(--mb-navy-900)]">Enregistrer la pesée</h1>
        <p className="mt-2 text-sm text-[var(--mb-neutral-600)]">
          {vessel?.name ?? landing.vesselId} · {site?.name ?? landing.landingSiteId}
        </p>

        <form className="mt-8 space-y-6 border border-[var(--mb-neutral-200)] bg-white p-6">
          {existingWeighing ? (
            <p className="border border-[var(--mb-warning-300)] bg-[var(--mb-warning-50)] p-4 text-sm">
              Une pesée de {existingWeighing.totalWeightKg.toLocaleString("fr-FR")} kg existe déjà.
            </p>
          ) : null}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Poids total (kg)"><input name="totalWeightKg" type="number" min="1" step="0.1" required defaultValue={existingWeighing?.totalWeightKg} className={controlClassName} /></Field>
            <Field label="Date et heure"><input name="measuredAt" type="datetime-local" required defaultValue={existingWeighing?.measuredAt.slice(0, 16)} className={controlClassName} /></Field>
            <Field label="Méthode"><select name="method" required defaultValue={existingWeighing?.method ?? "scale"} className={controlClassName}><option value="scale">Balance</option><option value="estimated">Estimation contrôlée</option><option value="declared">Déclaration</option></select></Field>
            <Field label="Niveau de confiance"><select name="confidenceLevel" required defaultValue={existingWeighing?.confidenceLevel ?? "high"} className={controlClassName}><option value="high">Élevé</option><option value="medium">Moyen</option><option value="low">Faible</option></select></Field>
            <Field label="Vérifié par"><select name="verifiedByActorId" defaultValue={existingWeighing?.verifiedByActorId ?? ""} className={controlClassName}><option value="">Non renseigné</option>{verifiers.map((actor) => <option key={actor.id} value={actor.id}>{actor.name}</option>)}</select></Field>
          </div>
          <input type="hidden" name="landingId" value={landing.id} />
          <button type="submit" disabled={Boolean(existingWeighing)} className="h-11 rounded bg-[var(--mb-navy-700)] px-5 text-sm font-bold text-white disabled:opacity-40">Valider la pesée</button>
        </form>
      </div>
    </main>
  );
}

const controlClassName = "h-11 w-full rounded border border-[var(--mb-neutral-300)] px-3 text-sm";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold uppercase text-[var(--mb-neutral-500)]">{label}</span>{children}</label>;
}
