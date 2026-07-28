import Link from "next/link";

const programmes = [
  {
    nom: "Réduction des pertes post-capture",
    territoires: "Dakar · Saint-Louis",
    budget: "650 000 000 FCFA",
    engage: "410 000 000 FCFA",
    decaisse: "275 000 000 FCFA",
    couverture: "1 860 / 4 000 bénéficiaires",
    situation: "En cours",
  },
  {
    nom: "Autonomisation des femmes transformatrices",
    territoires: "Thiès · Ziguinchor",
    budget: "420 000 000 FCFA",
    engage: "230 000 000 FCFA",
    decaisse: "118 000 000 FCFA",
    couverture: "640 / 2 000 bénéficiaires",
    situation: "À accélérer",
  },
  {
    nom: "Formalisation et accès au financement",
    territoires: "National",
    budget: "280 000 000 FCFA",
    engage: "205 000 000 FCFA",
    decaisse: "171 000 000 FCFA",
    couverture: "3 420 / 5 000 bénéficiaires",
    situation: "En bonne voie",
  },
];

const interventions = [
  { action: "Équiper trois sites en capacités froides", territoire: "Saint-Louis", responsable: "Unité de programme", avancement: "58 %", jalon: "Réception technique", echeance: "15 septembre 2026", situation: "Sous surveillance" },
  { action: "Former et enregistrer 1 200 transformatrices", territoire: "Thiès", responsable: "Partenaire d'exécution", avancement: "46 %", jalon: "Deuxième cohorte", echeance: "30 octobre 2026", situation: "En cours" },
  { action: "Mettre en place une garantie de campagne", territoire: "National", responsable: "Institution financière partenaire", avancement: "72 %", jalon: "Signature de la convention", echeance: "20 août 2026", situation: "En bonne voie" },
];

const resultats = [
  { indicateur: "Pertes post-capture évitées", valeur: "186 tonnes", cible: "320 tonnes", evolution: "+22 % ce trimestre" },
  { indicateur: "Revenus additionnels générés", valeur: "148 000 000 FCFA", cible: "280 000 000 FCFA", evolution: "+31 % ce trimestre" },
  { indicateur: "Femmes accompagnées", valeur: "1 240", cible: "2 600", evolution: "+420 depuis le dernier comité" },
  { indicateur: "Acteurs formalisés", valeur: "3 420", cible: "5 000", evolution: "+680 ce trimestre" },
];

const arbitrages = [
  { titre: "Réallouer 85 000 000 FCFA vers la chaîne du froid à Saint-Louis", motif: "Risque de sous-capacité sur la prochaine période de forte activité", porteur: "Comité de pilotage", situation: "Décision attendue" },
  { titre: "Changer d'opérateur local à Ziguinchor", motif: "Retard répété sur l'enregistrement des bénéficiaires", porteur: "Direction de programme", situation: "Instruction en cours" },
  { titre: "Étendre la garantie de campagne à 310 acteurs supplémentaires", motif: "Portefeuille éligible confirmé par le partenaire financier", porteur: "Bailleur et institution financière", situation: "Validation attendue" },
];

export default function DevelopmentPage() {
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mb-ocean-400)]">Mbàmbulaan Development</p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Pilotage des programmes de développement</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Suivre les objectifs, les budgets, les bénéficiaires, les interventions, les jalons, les résultats constatés et les décisions de gouvernance d'un programme.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/government" className="border border-white/25 px-4 py-3 text-xs font-bold">Voir Government</Link>
              <Link href="/atlas" className="border border-white/25 px-4 py-3 text-xs font-bold">Analyser dans Atlas</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Programmes actifs" value="7" detail="4 nationaux · 3 territoriaux" />
          <Metric label="Budget total suivi" value="2,45 Mds FCFA" detail="62 % engagés · 44 % décaissés" />
          <Metric label="Bénéficiaires couverts" value="8 760" detail="Femmes, jeunes, pêcheurs et organisations" />
          <Metric label="Décisions en attente" value="6" detail="Budget, opérateurs, extension et réallocation" />
        </section>

        <section className="mt-8 border border-[var(--mb-neutral-200)] bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Portefeuille de programmes</p>
              <h2 className="mt-2 text-2xl font-semibold">Objectifs, budgets et couverture</h2>
            </div>
            <p className="text-xs text-[var(--mb-neutral-500)]">Lecture consolidée pour le bailleur, le ministère et l'unité de programme.</p>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {programmes.map((programme) => (
              <article key={programme.nom} className="border border-[var(--mb-neutral-200)] p-5">
                <p className="text-xs font-bold uppercase text-[var(--mb-ocean-700)]">{programme.territoires}</p>
                <h3 className="mt-2 text-lg font-semibold">{programme.nom}</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <Fact label="Budget autorisé" value={programme.budget} />
                  <Fact label="Montant engagé" value={programme.engage} />
                  <Fact label="Montant décaissé" value={programme.decaisse} />
                  <Fact label="Couverture" value={programme.couverture} />
                  <Fact label="Situation" value={programme.situation} />
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,.75fr)]">
          <article className="border border-[var(--mb-neutral-200)] bg-white p-6">
            <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Mise en œuvre</p>
            <h2 className="mt-2 text-xl font-semibold">Interventions et jalons</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]">
                  <tr><th className="py-3 pr-4">Intervention</th><th className="py-3 pr-4">Territoire</th><th className="py-3 pr-4">Responsable</th><th className="py-3 pr-4">Avancement</th><th className="py-3 pr-4">Prochain jalon</th><th className="py-3">Situation</th></tr>
                </thead>
                <tbody>
                  {interventions.map((item) => (
                    <tr key={item.action} className="border-b border-[var(--mb-neutral-100)] align-top">
                      <td className="py-4 pr-4 font-semibold">{item.action}</td><td className="py-4 pr-4">{item.territoire}</td><td className="py-4 pr-4">{item.responsable}</td><td className="py-4 pr-4">{item.avancement}</td><td className="py-4 pr-4">{item.jalon}<br /><span className="text-xs text-[var(--mb-neutral-500)]">{item.echeance}</span></td><td className="py-4 font-bold">{item.situation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="border border-[var(--mb-neutral-200)] bg-white p-6">
            <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Résultats constatés</p>
            <h2 className="mt-2 text-xl font-semibold">Progression vers les cibles</h2>
            <div className="mt-5 space-y-4">
              {resultats.map((item) => (
                <div key={item.indicateur} className="border-b border-[var(--mb-neutral-100)] pb-4">
                  <p className="text-sm font-semibold">{item.indicateur}</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--mb-navy-900)]">{item.valeur}</p>
                  <p className="mt-1 text-xs text-[var(--mb-neutral-500)]">Cible : {item.cible}</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--mb-ocean-700)]">{item.evolution}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-6 border border-[var(--mb-neutral-200)] bg-white p-6">
          <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Gouvernance du programme</p>
          <h2 className="mt-2 text-2xl font-semibold">Arbitrages à soumettre au prochain comité</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {arbitrages.map((item) => (
              <article key={item.titre} className="border border-[var(--mb-neutral-200)] p-5">
                <p className="text-xs font-bold uppercase text-[var(--mb-ocean-700)]">{item.situation}</p>
                <h3 className="mt-2 text-lg font-semibold">{item.titre}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--mb-neutral-600)]">{item.motif}</p>
                <p className="mt-4 text-xs"><strong>Porteur :</strong> {item.porteur}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <ValueCard title="Valeur pour le bailleur" text="Visibilité sur l'utilisation des budgets, la couverture réelle et les écarts par rapport aux objectifs." />
          <ValueCard title="Valeur pour l'unité de programme" text="Coordination des partenaires, suivi des jalons, gestion des retards et préparation des comités de pilotage." />
          <ValueCard title="Revenu Mbàmbulaan" text="Frais de gestion de programme, déploiement, reporting d'impact, intégration et accompagnement opérationnel." />
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><p className="font-mono text-[9px] font-bold uppercase text-[var(--mb-neutral-500)]">{label}</p><p className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">{value}</p><p className="mt-2 text-xs leading-5 text-[var(--mb-neutral-500)]">{detail}</p></article>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-[var(--mb-neutral-100)] pb-2 last:border-0"><dt className="text-[10px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</dt><dd className="mt-1 font-semibold leading-5">{value}</dd></div>;
}

function ValueCard({ title, text }: { title: string; text: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><h3 className="text-lg font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>;
}
