import Link from "next/link";
import { notFound } from "next/navigation";
import { domainRepository } from "@/domain/repositories";
import { getLotsByLanding } from "@/domain/selectors";

export default async function NewLotPage({
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
  const weighing = data.weighings.find((item) => item.landingId === landing.id);
  const existingLots = getLotsByLanding(data, landing.id);
  const allocatedWeight = existingLots.reduce((total, lot) => total + lot.weightKg, 0);
  const remainingWeight = weighing
    ? Math.max(weighing.totalWeightKg - allocatedWeight, 0)
    : undefined;

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
            Structurer la marchandise
          </p>
          <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">
            Créer un lot
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mb-neutral-600)]">
            {vessel?.name ?? landing.vesselId} · {site?.name ?? landing.landingSiteId}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[84rem] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.38fr)] lg:px-10">
        <form className="space-y-6 border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
          {!weighing ? (
            <div className="border border-[var(--mb-warning-300)] bg-[var(--mb-warning-50)] p-4">
              <p className="text-sm font-semibold text-[var(--mb-navy-900)]">
                Pesée requise avant création
              </p>
              <p className="mt-2 text-[11px] leading-5 text-[var(--mb-neutral-600)]">
                Le poids du lot doit être rattaché à une mesure de référence. Enregistrez d'abord la pesée du débarquement.
              </p>
              <Link
                href={`/operations/debarquements/${landing.id}/pesee`}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-4 text-[10px] font-bold text-white"
              >
                Aller à la pesée
              </Link>
            </div>
          ) : null}

          <fieldset disabled={!weighing} className="disabled:opacity-50">
            <div className="mb-5 border-b border-[var(--mb-neutral-200)] pb-4">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
                1. Qualifier
              </p>
              <legend className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">
                Caractéristiques du lot
              </legend>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Espèce">
                <input
                  name="species"
                  type="text"
                  required
                  placeholder="Ex. Sardinelle"
                  className={controlClassName}
                />
              </Field>
              <Field label="Poids du lot (kg)">
                <input
                  name="weightKg"
                  type="number"
                  min="0.1"
                  max={remainingWeight}
                  step="0.1"
                  required
                  placeholder={remainingWeight ? `Maximum ${remainingWeight}` : undefined}
                  className={controlClassName}
                />
              </Field>
              <Field label="Qualité">
                <select name="qualityGrade" required defaultValue="A" className={controlClassName}>
                  <option value="A">A · qualité supérieure</option>
                  <option value="B">B · qualité standard</option>
                  <option value="C">C · qualité dégradée</option>
                </select>
              </Field>
              <Field label="État de conservation">
                <select
                  name="conservationStatus"
                  required
                  defaultValue="fresh"
                  className={controlClassName}
                >
                  <option value="fresh">Frais</option>
                  <option value="iced">Sous glace</option>
                  <option value="chilled">Réfrigéré</option>
                  <option value="frozen">Congelé</option>
                  <option value="at_risk">À risque</option>
                </select>
              </Field>
            </div>
          </fieldset>

          <fieldset disabled={!weighing} className="disabled:opacity-50">
            <div className="mb-5 border-b border-[var(--mb-neutral-200)] pb-4">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
                2. Positionner
              </p>
              <legend className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">
                Indication commerciale
              </legend>
            </div>
            <Field label="Prix indicatif par kg (FCFA)">
              <input
                name="askingPricePerKg"
                type="number"
                min="0"
                step="1"
                placeholder="Optionnel"
                className={controlClassName}
              />
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
              disabled={!weighing || remainingWeight === 0}
              className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Créer le lot
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <section className="border border-[var(--mb-neutral-200)] bg-white p-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">
              Réconciliation
            </p>
            <div className="mt-4 space-y-4">
              <SummaryLine
                label="Poids pesé"
                value={weighing ? `${weighing.totalWeightKg.toLocaleString("fr-FR")} kg` : "Non disponible"}
              />
              <SummaryLine
                label="Déjà réparti"
                value={`${allocatedWeight.toLocaleString("fr-FR")} kg`}
              />
              <SummaryLine
                label="Reste à répartir"
                value={remainingWeight !== undefined ? `${remainingWeight.toLocaleString("fr-FR")} kg` : "Non calculable"}
              />
            </div>
          </section>

          <section className="border border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] p-5 text-white">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-400)]">
              Rôle métier
            </p>
            <h2 className="mt-2 text-lg font-semibold">Transformer le poids en offre exploitable</h2>
            <p className="mt-3 text-[11px] leading-5 text-white/60">
              Le lot est l'unité de coordination entre la production, la conservation, le transport et le marché. Sans lot qualifié, aucune décision fiable ne peut être prise.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}

const controlClassName =
  "h-11 w-full rounded-[3px] border border-[var(--mb-neutral-300)] bg-white px-3 text-[12px] text-[var(--mb-navy-900)] outline-none focus:border-[var(--mb-ocean-600)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-500)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--mb-neutral-200)] pb-3 last:border-0 last:pb-0">
      <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--mb-navy-900)]">{value}</p>
    </div>
  );
}
