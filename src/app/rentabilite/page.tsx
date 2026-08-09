import { buildDefaultViabilityScenarios } from "@/platform/economics/mbambulaan-unit-economics";

const formatter = new Intl.NumberFormat("fr-FR");

const actorModels = [
  {
    product: "Fisher",
    users: "Pêcheurs, capitaines et équipages",
    value: "Visibilité sur les campagnes, sécurisation du retour, prise en charge du débarquement, suivi des lots et des règlements.",
    decisionMaker: "Capitaine, GIE ou organisation de pêcheurs",
    payer: "Organisation de pêcheurs, programme public ou partenaire de développement.",
    revenue: "Abonnement organisationnel, frais de coordination et commission sur les transactions sécurisées.",
    billing: "Organisation, navire, transaction ou kilogramme coordonné.",
    proof: "Pertes évitées, revenus sécurisés, temps de traitement réduit et règlements réconciliés.",
  },
  {
    product: "Cooperative",
    users: "Coopératives, GIE et organisations de producteurs",
    value: "Consolidation des volumes, mutualisation des capacités, allocation des services et amélioration du pouvoir de négociation.",
    decisionMaker: "Direction ou gouvernance de l'organisation",
    payer: "Coopérative, programme d'appui ou institution partenaire.",
    revenue: "Abonnement, commission transactionnelle et frais de gestion de services mutualisés.",
    billing: "Organisation, transaction, kilogramme ou site couvert.",
    proof: "Volumes consolidés, taux de service, valeur collective créée et pertes évitées.",
  },
  {
    product: "Business",
    users: "Acheteurs, mareyeurs, transformateurs, transporteurs et opérateurs de froid",
    value: "Approvisionnement qualifié, traçabilité, allocation logistique, exécution coordonnée et sécurisation du règlement.",
    decisionMaker: "Direction des opérations, achats ou commerce",
    payer: "Entreprise utilisatrice ou contrepartie bénéficiaire de la transaction.",
    revenue: "Abonnement, frais de transaction, commission, frais d'intégration et services de sécurisation.",
    billing: "Organisation, transaction, kilogramme, paiement ou intégration.",
    proof: "Taux de livraison, disponibilité sécurisée, incidents évités et délais de règlement réduits.",
  },
  {
    product: "Government",
    users: "Ministère, agences publiques et services territoriaux",
    value: "Pilotage sectoriel, supervision territoriale, ciblage des investissements et suivi des politiques publiques.",
    decisionMaker: "Ministère, agence, programme national ou direction générale",
    payer: "État, agence publique, programme national ou partenaire de financement.",
    revenue: "Licence annuelle, frais de déploiement, intégration, services de données et reporting institutionnel.",
    billing: "Année, site, territoire, intégration ou rapport.",
    proof: "Couverture opérationnelle, qualité des données, décisions publiques prises et résultats territoriaux mesurés.",
  },
  {
    product: "Development",
    users: "Bailleurs, ONG, programmes et partenaires de développement",
    value: "Ciblage des bénéficiaires, exécution traçable, contrôle des interventions et preuve d'impact.",
    decisionMaker: "Direction de programme, bailleur ou comité de pilotage",
    payer: "Programme, bailleur, ONG ou partenaire de développement.",
    revenue: "Frais de gestion de programme, mise en œuvre, intégration et reporting d'impact.",
    billing: "Programme, bénéficiaire, intégration ou rapport.",
    proof: "Bénéficiaires servis, budget exécuté, résultats atteints et preuves auditables.",
  },
  {
    product: "Finance",
    users: "Banques, fonds, mutuelles, assureurs et investisseurs",
    value: "Dossiers finançables fondés sur des preuves, réduction du risque informationnel et suivi du portefeuille.",
    decisionMaker: "Direction des risques, crédit, investissement ou assurance",
    payer: "Institution financière, assureur, fonds ou programme de garantie.",
    revenue: "Abonnement, frais d'usage, services de données, success fee et intégration.",
    billing: "Organisation, utilisateur actif, appel API, paiement ou navire assuré.",
    proof: "Dossiers qualifiés, risque réduit, remboursements observés et portefeuille financé.",
  },
  {
    product: "Community",
    users: "Communautés, associations, femmes, jeunes et structures locales",
    value: "Inclusion économique, gouvernance locale, accès aux opportunités et partage de valeur traçable.",
    decisionMaker: "Association, collectivité, comité local ou programme communautaire",
    payer: "Programme, collectivité, sponsor, bailleur ou organisation partenaire.",
    revenue: "Gestion de programme, abonnement sponsorisé, services de preuve et reporting social.",
    billing: "Organisation, programme, bénéficiaire ou rapport.",
    proof: "Bénéficiaires inclus, revenus distribués, initiatives financées et gouvernance documentée.",
  },
  {
    product: "Knowledge",
    users: "Recherche, formation, experts, centres techniques et organismes de qualité",
    value: "Capitalisation des pratiques, production de référentiels, apprentissage sectoriel et amélioration de la qualité des données.",
    decisionMaker: "Institution de recherche, organisme technique ou programme de formation",
    payer: "Institution, programme, entreprise ou partenaire public.",
    revenue: "Abonnement, services de données, études, rapports, formation et accès API.",
    billing: "Organisation, rapport, utilisateur actif ou appel API.",
    proof: "Contenus utilisés, décisions améliorées, pratiques diffusées et qualité des données accrue.",
  },
  {
    product: "Atlas",
    users: "CEO, ministère, dirigeants, investisseurs et partenaires stratégiques",
    value: "Intelligence décisionnelle transverse, arbitrage territorial, simulation de scénarios et pilotage de la valeur créée.",
    decisionMaker: "Dirigeant, ministre, comité stratégique ou comité d'investissement",
    payer: "Institution, entreprise, programme, fonds ou partenaire stratégique.",
    revenue: "Licence premium, services décisionnels, scénarios, rapports exécutifs et intégrations.",
    billing: "Année, organisation, rapport, intégration ou utilisateur actif.",
    proof: "Décisions prises, risques anticipés, investissements ciblés et valeur consolidée.",
  },
];

export default function RentabilitePage() {
  const scenarios = buildDefaultViabilityScenarios();
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Architecture de revenus</p>
          <h1 className="mt-2 text-3xl font-semibold">Tester la rentabilité de Mbàmbulaan par produit acteur</h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Le cockpit distingue la valeur créée, le décideur économique, le payeur, l'unité de facturation, l'événement facturable et la preuve de valeur. Le GMV n'est pas le chiffre d'affaires de Mbàmbulaan : seuls les abonnements, licences, commissions et services facturés constituent le revenu de l'entreprise.</p>
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

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--mb-ocean-700)]">Propositions de valeur et monétisation</p>
            <h2 className="mt-2 text-2xl font-semibold">Qui utilise, qui bénéficie, qui décide et qui paie ?</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">Chaque produit acteur dispose d'un modèle économique propre. Un utilisateur peut bénéficier du service sans être le payeur direct, notamment pour Fisher et Community. La monétisation reste liée à un événement facturable et à une preuve de valeur observable.</p>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {actorModels.map((model) => (
              <article key={model.product} className="rounded-xl border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-50)] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-700)]">Mbàmbulaan {model.product}</p>
                <h3 className="mt-1 text-lg font-semibold">{model.users}</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <BusinessLine label="Résultat métier" value={model.value} />
                  <BusinessLine label="Décideur économique" value={model.decisionMaker} />
                  <BusinessLine label="Payeur potentiel" value={model.payer} />
                  <BusinessLine label="Modèle de revenu" value={model.revenue} />
                  <BusinessLine label="Unité de facturation" value={model.billing} />
                  <BusinessLine label="Preuve de valeur" value={model.proof} />
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <h2 className="text-lg font-semibold">Lecture stratégique</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--mb-neutral-600)]">
              <p>Le scénario pilote valide l'utilité opérationnelle, mais ne finance pas encore une équipe complète.</p>
              <p>Une commission transactionnelle seule ne suffit pas. Les licences Government, les contrats Development, les abonnements professionnels et les services Finance/Atlas sont structurants.</p>
              <p>Le modèle combine revenus récurrents, revenus variables indexés sur la valeur créée et frais de déploiement ou d'intégration.</p>
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
          <h2 className="text-lg font-semibold">Mesures obligatoires du pilote</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Probe title="Résultat métier" text="Valeur réellement obtenue par chaque produit acteur et fréquence de réutilisation." />
            <Probe title="Consentement à payer" text="Payeur réel, budget mobilisable, niveau de prix et moteur de renouvellement." />
            <Probe title="Économie unitaire" text="Revenu, coût direct, marge contributive et coût de coordination par événement facturable." />
            <Probe title="Confiance" text="Livraisons réussies, pertes, retards, règlements réconciliés et décisions prises." />
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

function BusinessLine({ label, value }: { label: string; value: string }) {
  return <div className="border-t border-[var(--mb-neutral-200)] pt-3 first:border-t-0 first:pt-0"><dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-500)]">{label}</dt><dd className="mt-1 leading-6 text-[var(--mb-neutral-700)]">{value}</dd></div>;
}

function Probe({ title, text }: { title: string; text: string }) {
  return <div className="rounded-lg bg-[var(--mb-neutral-50)] p-4"><p className="font-semibold">{title}</p><p className="mt-1 text-[var(--mb-neutral-500)]">{text}</p></div>;
}
