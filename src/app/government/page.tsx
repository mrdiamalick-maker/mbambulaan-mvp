import Link from "next/link";

const territories = [
  { name: "Dakar", status: "Sous pression", actors: 1840, campaigns: 126, coldChain: 48, serviceLevel: 71, waste: 8.4, alerts: 4 },
  { name: "Thiès", status: "Opérationnel", actors: 1320, campaigns: 94, coldChain: 66, serviceLevel: 82, waste: 5.1, alerts: 1 },
  { name: "Saint-Louis", status: "Critique", actors: 1610, campaigns: 103, coldChain: 39, serviceLevel: 63, waste: 11.8, alerts: 6 },
  { name: "Ziguinchor", status: "Opérationnel", actors: 940, campaigns: 67, coldChain: 61, serviceLevel: 79, waste: 5.9, alerts: 2 },
];

const capacityNeeds = [
  { territory: "Saint-Louis", type: "Chaîne du froid", gap: "18 tonnes", priority: "Critique", funding: "185 000 000 FCFA" },
  { territory: "Dakar", type: "Transport frigorifique", gap: "6 rotations/jour", priority: "Élevée", funding: "92 000 000 FCFA" },
  { territory: "Ziguinchor", type: "Contrôle qualité", gap: "2 équipes", priority: "Élevée", funding: "38 000 000 FCFA" },
  { territory: "Thiès", type: "Financement de campagne", gap: "310 acteurs", priority: "Moyenne", funding: "120 000 000 FCFA" },
];

const programs = [
  { name: "Résilience de la chaîne du froid", territories: "Dakar · Saint-Louis", budget: "650 000 000 FCFA", execution: "42 %", beneficiaries: "1 860 / 4 000", status: "En cours" },
  { name: "Formalisation des acteurs", territories: "National", budget: "280 000 000 FCFA", execution: "61 %", beneficiaries: "3 420 / 5 000", status: "En cours" },
  { name: "Inclusion financière des femmes transformatrices", territories: "Thiès · Ziguinchor", budget: "190 000 000 FCFA", execution: "28 %", beneficiaries: "640 / 2 000", status: "À accélérer" },
];

const decisions = [
  { title: "Autoriser un transfert temporaire de capacité froide vers Saint-Louis", type: "Allocation de capacité", budget: "35 000 000 FCFA", impact: "240 tonnes de valeur protégée", status: "Arbitrage requis" },
  { title: "Prioriser une garantie de financement de campagne à Thiès", type: "Financement", budget: "120 000 000 FCFA", impact: "310 acteurs finançables", status: "Instruction" },
  { title: "Renforcer le contrôle qualité à Ziguinchor", type: "Appui qualité", budget: "38 000 000 FCFA", impact: "+14 points de conformité", status: "Validation requise" },
];

export default function GovernmentPage() {
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mb-ocean-400)]">Mbàmbulaan Government</p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Supervision nationale de la filière</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Suivre les territoires, les campagnes, la valeur économique, les capacités critiques, les programmes publics et les décisions qui nécessitent un arbitrage institutionnel.</p>
            </div>
            <Link href="/atlas" className="border border-white/25 px-4 py-3 text-xs font-bold">Ouvrir Atlas →</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Territoires suivis" value="14" detail="11 opérationnels · 2 sous pression · 1 critique" />
          <Metric label="Acteurs enregistrés" value="18 460" detail="Pêcheurs, coopératives, acheteurs et opérateurs" />
          <Metric label="Valeur commerciale suivie" value="4,8 Mds FCFA" detail="Sur les 30 derniers jours" />
          <Metric label="Alertes critiques ouvertes" value="11" detail="Capacité, qualité, ressource et exécution" />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-4">
          <Pillar title="Opérations" value="76 %" text="Niveau de service national moyen" />
          <Pillar title="Économie" value="82 %" text="Valeur nette conservée par les vendeurs" />
          <Pillar title="Inclusion" value="6 240" text="Acteurs formalisés ou financièrement inclus" />
          <Pillar title="Durabilité" value="68 %" text="Volume traçable et conforme aux règles de durabilité" />
        </section>

        <section className="mt-8 border border-[var(--mb-neutral-200)] bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Pilotage territorial</p>
              <h2 className="mt-2 text-2xl font-semibold">Territoires nécessitant une attention</h2>
            </div>
            <span className="text-xs text-[var(--mb-neutral-500)]">Lecture : activité, capacités, qualité de service, pertes et alertes.</span>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]">
                <tr><th className="py-3 pr-4">Territoire</th><th className="py-3 pr-4">Situation</th><th className="py-3 pr-4">Acteurs actifs</th><th className="py-3 pr-4">Campagnes</th><th className="py-3 pr-4">Capacité froide</th><th className="py-3 pr-4">Niveau de service</th><th className="py-3 pr-4">Taux de perte</th><th className="py-3">Alertes</th></tr>
              </thead>
              <tbody>
                {territories.map((territory) => (
                  <tr key={territory.name} className="border-b border-[var(--mb-neutral-100)]">
                    <td className="py-4 pr-4 font-semibold">{territory.name}</td><td className="py-4 pr-4">{territory.status}</td><td className="py-4 pr-4">{territory.actors}</td><td className="py-4 pr-4">{territory.campaigns}</td><td className="py-4 pr-4">{territory.coldChain}/100</td><td className="py-4 pr-4">{territory.serviceLevel} %</td><td className="py-4 pr-4">{territory.waste} %</td><td className="py-4 font-bold">{territory.alerts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="border border-[var(--mb-neutral-200)] bg-white p-6">
            <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Planification des capacités</p>
            <h2 className="mt-2 text-xl font-semibold">Besoins prioritaires à couvrir</h2>
            <div className="mt-5 space-y-4">
              {capacityNeeds.map((need) => (
                <div key={`${need.territory}-${need.type}`} className="border border-[var(--mb-neutral-200)] p-4">
                  <div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{need.type}</p><p className="mt-1 text-xs text-[var(--mb-neutral-500)]">{need.territory} · Déficit : {need.gap}</p></div><span className="text-xs font-bold">{need.priority}</span></div>
                  <p className="mt-3 text-sm">Besoin de financement estimé : <strong>{need.funding}</strong></p>
                </div>
              ))}
            </div>
          </article>

          <article className="border border-[var(--mb-neutral-200)] bg-white p-6">
            <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Programmes publics</p>
            <h2 className="mt-2 text-xl font-semibold">Exécution et couverture des bénéficiaires</h2>
            <div className="mt-5 space-y-4">
              {programs.map((program) => (
                <div key={program.name} className="border border-[var(--mb-neutral-200)] p-4">
                  <div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{program.name}</p><p className="mt-1 text-xs text-[var(--mb-neutral-500)]">{program.territories}</p></div><span className="text-xs font-bold">{program.status}</span></div>
                  <dl className="mt-3 grid grid-cols-3 gap-3 text-xs"><Fact label="Budget" value={program.budget} /><Fact label="Exécution" value={program.execution} /><Fact label="Bénéficiaires" value={program.beneficiaries} /></dl>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-6 border border-[var(--mb-neutral-200)] bg-white p-6">
          <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Portefeuille de décisions</p>
          <h2 className="mt-2 text-2xl font-semibold">Arbitrages institutionnels requis</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {decisions.map((decision) => (
              <article key={decision.title} className="border border-[var(--mb-neutral-200)] p-5">
                <p className="text-xs font-bold uppercase text-[var(--mb-ocean-700)]">{decision.type}</p>
                <h3 className="mt-2 text-lg font-semibold">{decision.title}</h3>
                <dl className="mt-4 space-y-3 text-sm"><Fact label="Budget à autoriser" value={decision.budget} /><Fact label="Résultat attendu" value={decision.impact} /><Fact label="Situation" value={decision.status} /></dl>
                <Link href="/atlas" className="mt-5 inline-flex text-xs font-bold text-[var(--mb-navy-900)]">Analyser dans Atlas →</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <ValueCard title="Valeur pour l'État" text="Une lecture consolidée de la filière, des territoires et de l'exécution des politiques publiques." />
          <ValueCard title="Preuve de performance" text="Décisions reliées aux interventions, budgets, jalons, bénéficiaires et résultats mesurés." />
          <ValueCard title="Revenu Mbàmbulaan" text="Licence Government, déploiement territorial, intégration, services de données et reporting institutionnel." />
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><p className="font-mono text-[9px] font-bold uppercase text-[var(--mb-neutral-500)]">{label}</p><p className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">{value}</p><p className="mt-2 text-xs leading-5 text-[var(--mb-neutral-500)]">{detail}</p></article>;
}

function Pillar({ title, value, text }: { title: string; value: string; text: string }) {
  return <article className="border-l-4 border-[var(--mb-ocean-600)] bg-white p-5"><p className="text-sm font-semibold">{title}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-[var(--mb-neutral-500)]">{text}</p></article>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[10px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</dt><dd className="mt-1 font-semibold leading-5">{value}</dd></div>;
}

function ValueCard({ title, text }: { title: string; text: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><h3 className="text-lg font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>;
}
