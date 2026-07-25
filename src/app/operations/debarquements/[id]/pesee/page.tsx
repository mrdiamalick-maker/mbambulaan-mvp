import Link from "next/link";
import { notFound } from "next/navigation";
import { domainRepository } from "@/domain/repositories";

export default async function RegisterWeighingPage({
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

  const existingWeighing = data.weighings.find((item) => item.landingId === landing.id);
  const vessel = data.vessels.find((item) => item.id === landing.vesselId);
  const site = data.landingSites.find((item) => item.id === landing.landingSiteId);
  const verifiers = data.actors.filter(
    (item) => item.actorType === "landing_site_agent" || item.actorType === "coordinator",
  );

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
          <Link
            href={`/operations/debarquements/${landing.id}`}
            className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]"
          >
            ← Retour au débarquement
          </Link>
          <p className="mt-5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">
            Fiabiliser le flux
          </p>
          <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">
            Enregistrer la pesée
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mb-neutral-600)]">
            {vessel?.name ?? landing.vesselId} · {site?.name ?? landing.landingSiteId}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[84rem] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.38fr)] lg:px-10">
        <form className="space-y-6 border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
          {existingWeighing ? (
            <div className="border border-[var(--mb-warning-300)] bg-[var(--mb-warning-50)] p-4">
              <p className="text-sm font-semibold text-[var(--mb-navy-900)]">Une pesée existe déjà</p>
              <p className="mt-2 text-[11px] leading-5 text-[var(--mb-neutral-600)]">
                Poids enregistré : {existingWeighing.totalWeightKg.toLocaleString("fr-FR")} kg. La modification contrôlée sera traitée dans un parcours dédié afin de conserver la traçabilité.
              </p>
            </div>
          ) : null}

          <fieldset>
            <div className="mb-5 border-b border-[var(--mb-neutral-200)] pb-4">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">1. Mesurer</p>
              <legend className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">Données de pesée</legend>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Poids total (kg)">
                <input
                  name="totalWeightKg"
                  type="number"
                  min="1"
                  step="0.1"
                  required
                  defaultValue={existingWeighing?.totalWeightKg}
                  className={controlClassName}
                />
              </Field>
              <Field label="Date et heure de mesure">
                <input
                  name="measuredAt"
                  type="datetime-local"
                  required
                  defaultValue={existingWeighing?.measuredAt.slice(0, 16)}
                  className={controlClassName}
                />
              </Field>
              <Field label="Méthode">
                <select
                  name="method"
                  required
                  defaultValue={existingWeighing?.method ?? "scale"}
                  className={controlClassName}
                >
                  <option value="scale">Balance</option>
                  <option value="estimated">Estimation contrôlée</option>
                  <option value="declared">Déclaration</option>
                </select>
              </Field>
              <Field label="Niveau de confiance">
                <select
                  name="confidenceLevel"
                  required
                  defaultValue={existingWeighing?.confidenceLevel ?? "high"}
                  className={controlClassName}
                >
                  <option value="high">Élevé</option>
                  <option value="medium">Moyen</option>
                  <option value="low">Faible</option>
                </select>
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <div className="mb-5 border-b border-[var(--mb-neutral-200)] pb-4">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">2. Vérifier</p>
              <legend className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">Contrôle de la donnée</legend>
            </div>
            <Field label="Vérifié par">
              <select
                name="verifiedByActorId"
                defaultValue={existingWeighing?.verifiedByActorId ?? ""}
                className={controlClassName}
              >
                <option value="">Non renseigné</option>
                {verifiers.map((actor) => (
                  <option key={actor.id} value={actor.id}>{actor.name}</option>
                ))}
              </select>
            </Field>
          </fieldset>

          <input type="hidden" name="landingId" value={landing.id} />

          <div className="flex flex-col gap-3 border-t border-[var(--mb-neutral-200)] pt-5 sm:flex-row sm:justify-end">
            <Link
              href={`/operations/debarquements/${landing.id}`}
              className="inline-flex h-11 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-300)] px-5 text-[11px] font-bold text-[var(--mb-navy-900)]"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={Boolean(existingWeighing)}
              className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Valider la pesée
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <section className="border border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] p-5 text-white">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-400)]">Rôle métier</p>
            <h2 className="mt-2 text-lg font-semibold">Transformer une arrivée en donnée fiable</h2>
            <p className="mt-3 text-[11px] leading-5 text-white/60">
              La pesée crée la référence opérationnelle qui permettra de constituer les lots, détecter les écarts et sécuriser les décisions commerciales.
            </p>
          </section>
          <section className="border border-[var(--mb-neutral-200)] bg-white p-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">Étape suivante</p>
            <p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">
              Après validation, le poids devra être réparti en lots par espèce, qualité et état de conservation.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}

const controlClassName = "h-11 w-full rounded-[3px] border border-[var(--mb-neutral-300)] bg-white px-3 text-[12px] text-[var(--mb-navy-900)] outline-none focus:border-[var(--mb-ocean-600)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-500)]">{label}</span>
      {children}
    </label>
  );
}
