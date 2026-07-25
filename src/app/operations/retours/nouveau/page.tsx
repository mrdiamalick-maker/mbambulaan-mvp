import Link from "next/link";
import { domainRepository } from "@/domain/repositories";

export default function NewExpectedReturnPage() {
  const data = domainRepository.getData();
  const vessels = data.vessels.filter((item) => item.status === "operational");
  const landingSites = data.landingSites.filter(
    (item) => item.operationalStatus !== "unavailable",
  );
  const actors = data.actors.filter(
    (item) => item.actorType === "captain" || item.actorType === "landing_site_agent",
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
          <p className="mt-5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">
            Nouveau signal opérationnel
          </p>
          <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] text-[var(--mb-navy-900)]">
            Annoncer un retour
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mb-neutral-600)]">
            Rendre l'arrivée visible suffisamment tôt pour préparer les services, les capacités et les débouchés.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[84rem] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.38fr)] lg:px-10">
        <form className="space-y-6 border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
          <Fieldset title="Retour et quai" eyebrow="1. Identifier le flux">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Pirogue">
                <select name="vesselId" required className={controlClassName} defaultValue="">
                  <option value="" disabled>Sélectionner une pirogue</option>
                  {vessels.map((vessel) => (
                    <option key={vessel.id} value={vessel.id}>{vessel.name} · {vessel.registrationNumber}</option>
                  ))}
                </select>
              </Field>
              <Field label="Quai attendu">
                <select name="expectedLandingSiteId" required className={controlClassName} defaultValue="">
                  <option value="" disabled>Sélectionner un quai</option>
                  {landingSites.map((site) => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Date et heure estimées">
                <input name="expectedAt" type="datetime-local" required className={controlClassName} />
              </Field>
              <Field label="Déclarant">
                <select name="createdByActorId" required className={controlClassName} defaultValue="">
                  <option value="" disabled>Sélectionner un acteur</option>
                  {actors.map((actor) => (
                    <option key={actor.id} value={actor.id}>{actor.name}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Fieldset>

          <Fieldset title="Capture estimée" eyebrow="2. Anticiper le volume">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Espèce principale">
                <input name="species" type="text" required placeholder="Ex. Sardinelle" className={controlClassName} />
              </Field>
              <Field label="Poids estimé (kg)">
                <input name="estimatedWeightKg" type="number" min="1" step="1" required placeholder="Ex. 850" className={controlClassName} />
              </Field>
            </div>
          </Fieldset>

          <Fieldset title="Services à préparer" eyebrow="3. Déclencher la coordination">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["ice", "Glace"],
                ["cold_storage", "Stockage froid"],
                ["transport", "Transport"],
                ["handling", "Manutention"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-start gap-3 border border-[var(--mb-neutral-200)] p-4">
                  <input type="checkbox" name="serviceNeeds" value={value} className="mt-1" />
                  <span>
                    <span className="block text-sm font-semibold text-[var(--mb-navy-900)]">{label}</span>
                    <span className="mt-1 block text-[11px] leading-5 text-[var(--mb-neutral-500)]">Rendre le besoin visible pour les fournisseurs de capacité.</span>
                  </span>
                </label>
              ))}
            </div>
          </Fieldset>

          <div className="flex flex-col gap-3 border-t border-[var(--mb-neutral-200)] pt-5 sm:flex-row sm:justify-end">
            <Link href="/operations/retours" className="inline-flex h-11 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-300)] px-5 text-[11px] font-bold text-[var(--mb-navy-900)]">
              Annuler
            </Link>
            <button type="submit" className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white">
              Enregistrer l'annonce
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <section className="border border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] p-5 text-white">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-400)]">Impact attendu</p>
            <h2 className="mt-2 text-lg font-semibold">Créer un temps d'avance collectif</h2>
            <p className="mt-3 text-[11px] leading-5 text-white/60">
              L'annonce n'est utile que si elle permet à d'autres acteurs de se préparer : quai, glace, transport, acheteurs ou coordination territoriale.
            </p>
          </section>
          <section className="border border-[var(--mb-neutral-200)] bg-white p-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">Règle produit</p>
            <p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">
              Cette page pose la structure du formulaire métier. Le branchement serveur et la persistance seront ajoutés dans l'itération suivante afin d'utiliser directement <code>DomainService</code> sans sacrifier l'intégrité du domaine.
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

function Fieldset({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <div className="mb-5 border-b border-[var(--mb-neutral-200)] pb-4">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">{eyebrow}</p>
        <legend className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">{title}</legend>
      </div>
      {children}
    </fieldset>
  );
}
