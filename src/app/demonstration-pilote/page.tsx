import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Comprendre la coordination",
    text: "Voir les acteurs, les territoires, les tensions et les décisions que Mbàmbulaan rend visibles.",
    href: "/atlas",
    action: "Découvrir l’écosystème",
  },
  {
    number: "02",
    title: "Exécuter une transaction",
    text: "Publier une offre, réserver, allouer, transporter, livrer, payer et réconcilier avec quatre rôles distincts.",
    href: "/pilote",
    action: "Ouvrir l’espace pilote",
  },
  {
    number: "03",
    title: "Traiter un incident",
    text: "Simuler une livraison partielle, calculer les responsabilités et déterminer le remboursement acheteur dans le même espace.",
    href: "/pilote",
    action: "Continuer dans le pilote",
  },
  {
    number: "04",
    title: "Évaluer le modèle",
    text: "Distinguer le volume coordonné du revenu Mbàmbulaan et challenger les hypothèses de rentabilité.",
    href: "/rentabilite",
    action: "Voir la viabilité",
  },
];

const sponsorQuestions = [
  ["Utilité", "Le produit réduit-il les ruptures d’information, les délais et les litiges entre acteurs ?"],
  ["Adoption", "Les coopératives, acheteurs et logisticiens utilisent-ils le parcours sans assistance permanente ?"],
  ["Confiance", "Les preuves, responsabilités et montants sont-ils suffisamment clairs pour sécuriser la transaction ?"],
  ["Économie", "Qui accepte de payer, combien, et pour quelle valeur récurrente ?"],
];

export default function DemonstrationPilotePage() {
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--mb-ocean-400)]">MVP de coordination halieutique</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold sm:text-4xl">Démontrer que Mbàmbulaan coordonne une transaction réelle et crée une valeur mesurable</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70">Cette démonstration ne cherche pas à présenter une plateforme nationale terminée. Elle valide quatre hypothèses : utilité opérationnelle, adoption, confiance et modèle économique.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/pilote" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[var(--mb-navy-900)]">Commencer le test unifié</Link>
            <Link href="/rentabilite" className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white">Voir le modèle économique</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <Metric value="4" label="rôles coordonnés" />
          <Metric value="1" label="espace pilote unifié" />
          <Metric value="3" label="flux financiers réconciliés" />
          <Metric value="0" label="service payant obligatoire" />
        </section>

        <section className="mt-7">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-neutral-500)]">Parcours recommandé</p>
            <h2 className="mt-2 text-2xl font-semibold">Un test simple en quatre étapes</h2>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {steps.map((step) => (
              <article key={step.number} className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="rounded-lg bg-[var(--mb-navy-900)] px-3 py-2 font-mono text-xs font-bold text-white">{step.number}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{step.text}</p>
                    <Link href={step.href} className="mt-4 inline-flex text-sm font-semibold text-[var(--mb-ocean-700)]">{step.action} →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-7 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-neutral-500)]">Décision sponsor</p>
            <h2 className="mt-2 text-xl font-semibold">Ce que le pilote doit prouver</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sponsorQuestions.map(([title, text]) => (
                <div key={title} className="rounded-lg bg-[var(--mb-neutral-50)] p-4">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-5 text-[var(--mb-neutral-600)]">{text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-700">Périmètre MVP</p>
            <h2 className="mt-2 text-xl font-semibold">Ce que nous ne finançons pas encore</h2>
            <ul className="mt-4 space-y-2 text-sm leading-5 text-amber-950/80">
              <li>• déploiement national multi-régions ;</li>
              <li>• intégration de plusieurs opérateurs de paiement ;</li>
              <li>• automatisation avancée par intelligence artificielle ;</li>
              <li>• couverture exhaustive de toutes les espèces et métiers ;</li>
              <li>• équipe d’exploitation complète avant preuve de traction.</li>
            </ul>
            <p className="mt-4 text-sm font-semibold text-amber-950">Le financement suivant doit être déclenché par des preuves terrain, pas par l’accumulation de fonctionnalités.</p>
          </article>
        </section>

        <section className="mt-7 rounded-xl bg-[var(--mb-navy-900)] p-6 text-white">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Critère de passage</p>
          <h2 className="mt-2 text-2xl font-semibold">Décider après un pilote limité, mesuré et documenté</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/70">La prochaine phase ne doit être financée que si le pilote démontre une utilisation récurrente, une réduction mesurable des frictions, une volonté de payer et un coût de service compatible avec la marge capturable.</p>
        </section>
      </div>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><p className="text-3xl font-bold">{value}</p><p className="mt-1 text-sm text-[var(--mb-neutral-500)]">{label}</p></div>;
}
