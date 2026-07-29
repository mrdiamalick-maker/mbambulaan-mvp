import Link from "next/link";

const situations = [
  {
    espece: "Sardinelle ronde",
    territoire: "Saint-Louis",
    etat: "Sous pression",
    effort: "Élevé",
    captureParSortie: "-18 % sur 12 mois",
    juveniles: "16 %",
    orientation: "Réduire l'effort sur la zone et mieux valoriser les volumes débarqués.",
  },
  {
    espece: "Thiof",
    territoire: "Dakar",
    etat: "Critique",
    effort: "Très élevé",
    captureParSortie: "-27 % sur 12 mois",
    juveniles: "21 %",
    orientation: "Limiter les sorties ciblées et protéger les tailles minimales.",
  },
  {
    espece: "Ethmalose",
    territoire: "Ziguinchor",
    etat: "Stable",
    effort: "Modéré",
    captureParSortie: "+4 % sur 12 mois",
    juveniles: "7 %",
    orientation: "Maintenir l'effort et renforcer la traçabilité des débarquements.",
  },
];

const valueLevers = [
  {
    title: "Mieux vendre chaque kilogramme",
    text: "Orientation des lots vers le débouché le plus adapté selon l'espèce, la qualité, l'urgence et la demande réelle.",
    indicator: "+12 à +20 % de revenu net visé",
  },
  {
    title: "Réduire les pertes après débarquement",
    text: "Anticipation de la glace, du transport, du stockage et de la transformation avant le retour de campagne.",
    indicator: "Pertes évitées plutôt que volumes pêchés supplémentaires",
  },
  {
    title: "Valoriser les espèces moins demandées",
    text: "Transformation, séchage, fumage, congélation ou nouveaux débouchés pour réduire la pression sur les espèces les plus recherchées.",
    indicator: "Part du revenu provenant d'espèces alternatives",
  },
  {
    title: "Sécuriser le revenu pendant les restrictions",
    text: "Fonds solidaires, appuis publics, financement éthique et activités alternatives lorsque l'effort de pêche doit être réduit.",
    indicator: "Revenu protégé sans intensification de l'effort",
  },
];

const decisions = [
  {
    title: "Reporter une sortie ciblant le thiof",
    reason: "Pression critique, proportion élevée de juvéniles et baisse durable de la capture par sortie.",
    compensation: "Orientation vers une autre espèce autorisée et mobilisation du fonds de continuité si nécessaire.",
    status: "Décision recommandée",
  },
  {
    title: "Prépositionner glace et acheteurs pour la sardinelle",
    reason: "Risque de pertes élevé sur un volume déjà limité par la baisse de disponibilité.",
    compensation: "Mieux valoriser les débarquements existants sans augmenter le nombre de sorties.",
    status: "Action prioritaire",
  },
  {
    title: "Développer la transformation de l'ethmalose",
    reason: "Ressource plus stable et potentiel de débouchés locaux et régionaux.",
    compensation: "Diversification du revenu et moindre dépendance aux espèces sous forte pression.",
    status: "Programme à lancer",
  },
];

export default function ResourceAndValuePage() {
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mb-ocean-400)]">Mbàmbulaan · Ressource et valeur</p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Créer plus de valeur avec une ressource plus rare</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">La raréfaction du poisson n'est pas un frein au modèle : elle renforce le besoin de coordination. Mbàmbulaan aide à préserver la ressource, réduire les pertes et augmenter la valeur nette créée par kilogramme débarqué.</p>
            </div>
            <Link href="/pilote" className="border border-white/25 px-4 py-3 text-xs font-bold">Ouvrir le parcours pilote →</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Espèces sous pression" value="2" detail="Décisions de pêche et de valorisation à adapter" />
          <Metric label="Pertes post-capture visées" value="-35 %" detail="Glace, froid, transport et transformation coordonnés" />
          <Metric label="Valeur nette par kg" value="+18 %" detail="Objectif par meilleure orientation des lots" />
          <Metric label="Revenu protégé" value="74 M FCFA" detail="Restrictions, diversification et soutien de continuité" />
        </section>

        <section className="mt-8 border border-[var(--mb-neutral-200)] bg-white p-6">
          <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Disponibilité de la ressource</p>
          <h2 className="mt-2 text-2xl font-semibold">Adapter l'activité à l'état réel des espèces</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]">
                <tr><th className="py-3 pr-4">Espèce</th><th className="py-3 pr-4">Territoire</th><th className="py-3 pr-4">État du stock</th><th className="py-3 pr-4">Effort de pêche</th><th className="py-3 pr-4">Capture par sortie</th><th className="py-3 pr-4">Part de juvéniles</th><th className="py-3">Orientation</th></tr>
              </thead>
              <tbody>
                {situations.map((item) => (
                  <tr key={`${item.espece}-${item.territoire}`} className="border-b border-[var(--mb-neutral-100)] align-top">
                    <td className="py-4 pr-4 font-semibold">{item.espece}</td><td className="py-4 pr-4">{item.territoire}</td><td className="py-4 pr-4">{item.etat}</td><td className="py-4 pr-4">{item.effort}</td><td className="py-4 pr-4">{item.captureParSortie}</td><td className="py-4 pr-4">{item.juveniles}</td><td className="py-4 leading-6">{item.orientation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-4">
          {valueLevers.map((lever) => (
            <article key={lever.title} className="border border-[var(--mb-neutral-200)] bg-white p-5">
              <h3 className="text-lg font-semibold text-[var(--mb-navy-900)]">{lever.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--mb-neutral-600)]">{lever.text}</p>
              <p className="mt-4 text-xs font-bold text-[var(--mb-ocean-700)]">{lever.indicator}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 border border-[var(--mb-neutral-200)] bg-white p-6">
          <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Décisions coordonnées</p>
          <h2 className="mt-2 text-2xl font-semibold">Préserver la ressource sans abandonner les pêcheurs</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {decisions.map((decision) => (
              <article key={decision.title} className="border border-[var(--mb-neutral-200)] p-5">
                <p className="text-xs font-bold uppercase text-[var(--mb-ocean-700)]">{decision.status}</p>
                <h3 className="mt-2 text-lg font-semibold">{decision.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--mb-neutral-600)]">{decision.reason}</p>
                <div className="mt-4 border-t border-[var(--mb-neutral-100)] pt-4">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">Protection du revenu</p>
                  <p className="mt-2 text-sm leading-6">{decision.compensation}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <ValueCard title="Pour le pêcheur" text="Un revenu mieux protégé, une meilleure valeur par débarquement et moins de dépendance à l'augmentation de l'effort de pêche." />
          <ValueCard title="Pour la ressource" text="Des décisions liées aux espèces, aux saisons, aux tailles, aux zones et à la pression réellement constatée." />
          <ValueCard title="Pour Mbàmbulaan" text="Revenus issus de la coordination, de la valorisation, du suivi des programmes et des services de décision — pas de l'épuisement de la ressource." />
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><p className="font-mono text-[9px] font-bold uppercase text-[var(--mb-neutral-500)]">{label}</p><p className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">{value}</p><p className="mt-2 text-xs leading-5 text-[var(--mb-neutral-500)]">{detail}</p></article>;
}

function ValueCard({ title, text }: { title: string; text: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><h3 className="text-lg font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>;
}
