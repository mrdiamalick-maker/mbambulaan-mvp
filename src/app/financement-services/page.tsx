import Link from "next/link";

const fundingRequests = [
  { id: "FIN-260729-041", actor: "GIE Femmes transformatrices de Kayar", need: "Glace et emballages", amount: "850 000 FCFA", duration: "21 jours", payer: "Acheteur contractuel", status: "Pré-autorisé", risk: "Faible" },
  { id: "FIN-260729-042", actor: "Collectif de mareyeurs de Joal", need: "Transport frigorifique mutualisé", amount: "1 450 000 FCFA", duration: "14 jours", payer: "Collectif", status: "À compléter", risk: "Moyen" },
  { id: "FIN-260729-043", actor: "Coopérative de Fass Boye", need: "Stockage court terme", amount: "620 000 FCFA", duration: "10 jours", payer: "Produit de la vente", status: "Autorisé", risk: "Faible" },
  { id: "FIN-260729-044", actor: "Opérateur froid Dakar", need: "Réparation urgente groupe froid", amount: "2 800 000 FCFA", duration: "45 jours", payer: "Revenus services", status: "En analyse", risk: "Élevé" },
];

const sources = [
  { name: "Fonds de roulement Mbàmbulaan", capacity: "12,5 M FCFA", available: "7,8 M FCFA", use: "Services courts adossés à un flux vérifié", cost: "Frais fixe + risque" },
  { name: "Partenaire financier local", capacity: "35 M FCFA", available: "18,2 M FCFA", use: "Besoins structurés avec payeur identifié", cost: "Selon durée et garantie" },
  { name: "Avance acheteur", capacity: "Variable", available: "9,6 M FCFA", use: "Engagement commercial confirmé", cost: "Négocié dans le contrat" },
  { name: "Programme d'appui filière", capacity: "20 M FCFA", available: "6,4 M FCFA", use: "Services à impact collectif et résilience", cost: "Subvention ou cofinancement" },
];

const rules = [
  ["Usage productif", "Le financement couvre un service qui protège un lot, sécurise une vente ou améliore une capacité utile."],
  ["Payeur identifié", "Aucune avance n'est activée sans source de remboursement claire : acheteur, collectif, revenu service ou programme."],
  ["Flux traçable", "Le besoin, le service, la preuve d'exécution et le règlement restent reliés dans une même chaîne de confiance."],
  ["Montant proportionné", "Le financement est limité à la valeur protégée et à la capacité réelle de remboursement."],
  ["Risque partagé", "Les garanties et responsabilités sont réparties entre bénéficiaire, payeur, prestataire et financeur."],
  ["Revenu Mbàmbulaan", "Mbàmbulaan facture l'orchestration, l'instruction et le suivi, sans dépendre de pratiques de crédit opaques."],
];

const repayments = [
  { id: "RMB-260729-018", request: "FIN-260729-031", source: "Vente lot FB-260728-009", due: "29 juil.", amount: "480 000 FCFA", recovered: "480 000 FCFA", status: "Soldé" },
  { id: "RMB-260729-019", request: "FIN-260729-034", source: "Contrat cuisine centrale", due: "31 juil.", amount: "1 120 000 FCFA", recovered: "720 000 FCFA", status: "Partiel" },
  { id: "RMB-260729-020", request: "FIN-260729-036", source: "Revenus stockage", due: "5 août", amount: "950 000 FCFA", recovered: "0 FCFA", status: "À venir" },
];

export default function ServiceFundingPage() {
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Financement des services</p>
              <h1 className="mt-2 text-3xl font-semibold">Financer le service utile, pas la prise de risque aveugle</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Mbàmbulaan relie les besoins de financement aux flux réels, aux engagements commerciaux, aux preuves d'exécution et aux sources de remboursement.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/coordination-services" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Services</Link>
              <Link href="/engagements-commercials" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Engagements</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Demandes ouvertes" value="18" detail="Services, équipements et besoins de trésorerie ciblée" />
          <Metric label="Montant sollicité" value="14,9 M FCFA" detail="Dont 71 % adossés à un payeur identifié" />
          <Metric label="Financements actifs" value="9,7 M FCFA" detail="Suivis jusqu'à preuve d'usage et remboursement" />
          <Metric label="Taux de récupération" value="94 %" detail="Sur les avances arrivées à échéance" />
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <SectionTitle eyebrow="Demandes de financement" title="Qualifier le besoin avant de mobiliser l'argent" />
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]"><tr>{["Demande", "Bénéficiaire", "Besoin", "Montant", "Durée", "Payeur", "Statut", "Risque"].map((header) => <th key={header} className="py-3 pr-4">{header}</th>)}</tr></thead>
              <tbody>{fundingRequests.map((item) => <tr key={item.id} className="border-b border-[var(--mb-neutral-100)]"><td className="py-4 pr-4 font-semibold">{item.id}</td><td className="py-4 pr-4">{item.actor}</td><td className="py-4 pr-4">{item.need}</td><td className="py-4 pr-4">{item.amount}</td><td className="py-4 pr-4">{item.duration}</td><td className="py-4 pr-4">{item.payer}</td><td className="py-4 pr-4"><span className="rounded border px-2 py-1 text-xs font-semibold">{item.status}</span></td><td className="py-4 pr-4">{item.risk}</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <SectionTitle eyebrow="Sources mobilisables" title="Combiner les moyens selon le besoin et le risque" />
            <div className="mt-4 space-y-3">
              {sources.map((item) => <div key={item.name} className="rounded-lg border border-[var(--mb-neutral-200)] p-4"><h3 className="font-semibold">{item.name}</h3><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p>Capacité : {item.capacity}</p><p>Disponible : {item.available}</p><p className="text-[var(--mb-neutral-500)]">Usage : {item.use}</p><p className="text-[var(--mb-neutral-500)]">Coût : {item.cost}</p></div></div>)}
            </div>
          </article>

          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <SectionTitle eyebrow="Remboursements" title="Suivre la récupération dans le même flux opérationnel" />
            <div className="mt-4 space-y-3">
              {repayments.map((item) => <div key={item.id} className="rounded-lg bg-[var(--mb-neutral-50)] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-[10px] text-[var(--mb-neutral-400)]">{item.id} · {item.request}</p><h3 className="mt-1 font-semibold">{item.source}</h3></div><span className="rounded border px-2 py-1 text-xs font-semibold">{item.status}</span></div><div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm"><span>Échéance : {item.due}</span><span>Attendu : {item.amount}</span><span>Récupéré : {item.recovered}</span></div></div>)}
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rules.map(([title, text]) => <article key={title} className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>)}
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">{eyebrow}</p><h2 className="mt-2 text-xl font-semibold">{title}</h2></div>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-2 text-xs leading-5 text-[var(--mb-neutral-500)]">{detail}</p></article>;
}
