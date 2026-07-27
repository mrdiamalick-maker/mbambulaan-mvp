import { buildDefaultViabilityScenarios } from "@/platform/economics/mbambulaan-unit-economics";

const formatter = new Intl.NumberFormat("fr-FR");

export default function RentabilitePage() {
  const scenarios = buildDefaultViabilityScenarios();
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Économie du modèle</p>
          <h1 className="mt-2 text-3xl font-semibold">Mbàmbulaan peut-il devenir rentable ?</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Le GMV représente la valeur des transactions coordonnées. Le revenu Mbàmbulaan correspond uniquement aux commissions et abonnements réellement capturés.</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="grid gap-4 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <article key={scenario.name} className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">{scenario.name}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${scenario.result.viable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {scenario.result.viable ? "Rentable" : "Non rentable"}
                </span>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <Metric label="GMV mensuel" value={money(scenario.result.monthlyGmvXof)} />
                <Metric label="Revenu Mbàmbulaan" value={money(scenario.result.totalRevenueXof)} />
                <Metric label="Marge contributive" value={money(scenario.result.contributionMarginXof)} />
                <Metric label="Coûts fixes" value={money(scenario.result.totalFixedCostXof)} />
                <Metric label="Résultat mensuel" value={money(scenario.result.operatingProfitXof)} strong />
                <Metric label="Transactions" value={formatter.format(scenario.result.transactionCount)} />
              </dl>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <h2 className="text-lg font-semibold">Lecture stratégique</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--mb-neutral-600)]">
              <p>Le scénario pilote valide l’utilité opérationnelle, mais ne finance pas encore une équipe complète.</p>
              <p>Le scénario traction reste déficitaire avec une commission seule à 2,5 %. Les abonnements institutionnels ou professionnels sont donc structurants.</p>
              <p>Le scénario échelle devient rentable avec 1 milliard FCFA de GMV mensuel, 700 transactions et 10 millions FCFA d’abonnements.</p>
            </div>
          </article>

          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <h2 className="text-lg font-semibold">Seuil indicatif</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {scenarios.map((scenario) => (
                <Metric key={scenario.name} label={scenario.name} value={scenario.result.breakEvenGmvXof === null ? "Impossible avec ces hypothèses" : money(scenario.result.breakEvenGmvXof)} />
              ))}
            </dl>
            <p className="mt-4 text-xs leading-5 text-[var(--mb-neutral-500)]">Hypothèses de travail : commission 2,5 %, frais de paiement 0,8 %, pertes de litiges 0,2 %, support 3 000 FCFA par transaction et 12,5 millions FCFA de coûts fixes mensuels.</p>
          </article>
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <h2 className="text-lg font-semibold">Ce que le pilote doit mesurer</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Probe title="Volume" text="GMV réellement coordonné par mois et fréquence de réachat." />
            <Probe title="Monétisation" text="Commission acceptée et abonnement accepté par chaque segment." />
            <Probe title="Coût de service" text="Temps humain, support, vérification et gestion des litiges." />
            <Probe title="Confiance" text="Livraisons réussies, pertes, retards et paiements réconciliés." />
          </div>
        </section>
      </div>
    </main>
  );
}

function money(value: number) {
  return `${formatter.format(value)} FCFA`;
}

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-center justify-between gap-4 border-b border-[var(--mb-neutral-100)] pb-2"><dt className="text-[var(--mb-neutral-500)]">{label}</dt><dd className={strong ? "font-bold" : "font-semibold"}>{value}</dd></div>;
}

function Probe({ title, text }: { title: string; text: string }) {
  return <div className="rounded-lg bg-[var(--mb-neutral-50)] p-4"><p className="font-semibold">{title}</p><p className="mt-1 text-[var(--mb-neutral-500)]">{text}</p></div>;
}
