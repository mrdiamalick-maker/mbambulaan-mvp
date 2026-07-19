import Link from "next/link";

export default function EspacePrivePortalPage() {
  return <main data-private-console className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
    <div className="grid min-h-screen lg:grid-cols-[minmax(22rem,38fr)_minmax(32rem,62fr)]">
      <section className="relative flex min-h-[34vh] overflow-hidden bg-[var(--mb-navy-900)] px-6 py-8 text-white sm:px-10 lg:min-h-screen lg:px-14">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(165deg,transparent_0_42%,rgba(31,167,163,.18)_43%_58%,transparent_59%)]" aria-hidden="true" />
        <div className="relative flex w-full flex-col justify-between">
          <header className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-[3px] bg-[var(--mb-sand-300)] text-[11px] font-black text-[var(--mb-navy-900)]">Mb</span>
            <div><p className="text-[14px] font-bold">Mbàmbulaan</p><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">Coordination maritime</p></div>
          </header>
          <div className="max-w-md py-12">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--mb-ocean-400)]">Espace institutionnel</p>
            <h1 className="mt-4 text-[26px] font-semibold leading-tight text-[var(--mb-offwhite)] sm:text-[31px]">Une lecture commune pour coordonner la pêche artisanale.</h1>
            <p className="mt-4 max-w-sm text-[11px] leading-5 text-white/60">Accès réservé aux équipes habilitées. Les données de cette version sont simulées et les décisions restent validées par un agent.</p>
          </div>
          <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/35">Sénégal · démonstration locale</p>
        </div>
      </section>

      <section className="flex min-h-[66vh] items-center px-6 py-10 sm:px-12 lg:min-h-screen lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <p className="font-mono text-[9px] uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">Accès institutionnel</p>
          <h2 className="mt-3 text-[25px] font-semibold text-[var(--mb-navy-900)]">Ouvrir l’espace Ministère</h2>
          <p className="mt-2 text-[11px] leading-5 text-[var(--mb-neutral-600)]">Utilisez les identifiants de démonstration préremplis.</p>
          <form className="mt-8 grid gap-4">
            <Field label="Organisation"><select defaultValue="ministere" className={fieldClass}><option value="ministere">Ministère des Pêches</option><option value="direction">Direction technique</option><option value="partenaire">Partenaire de programme</option></select></Field>
            <Field label="Identifiant"><input defaultValue="demo.ministere" className={`${fieldClass} font-mono`} /></Field>
            <Field label="Code d’accès"><input type="password" defaultValue="mbambulaan" className={`${fieldClass} font-mono`} /></Field>
            <Link href="/espace-prive/etat" className="mt-2 inline-flex h-11 items-center justify-between rounded-[3px] bg-[var(--mb-navy-700)] px-4 text-[11px] font-bold text-white hover:bg-[var(--mb-ocean-700)]"><span>Accéder à l’espace</span><span aria-hidden="true">→</span></Link>
          </form>
          <p className="mt-6 border-l-2 border-[var(--mb-ocean-500)] pl-3 text-[9px] leading-4 text-[var(--mb-neutral-500)]">Accès simulé, sans authentification ni transmission externe.</p>
        </div>
      </section>
    </div>
  </main>;
}

const fieldClass = "h-11 w-full rounded-[3px] border border-[var(--mb-neutral-200)] bg-white px-3 text-[11px] font-semibold text-[var(--mb-navy-900)] outline-none focus:border-[var(--mb-ocean-600)]";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-600)]">{label}{children}</label>; }
