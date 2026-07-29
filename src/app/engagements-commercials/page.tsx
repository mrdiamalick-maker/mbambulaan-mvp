import Link from "next/link";

const commitments = [
  { id: "ENG-260729-014", buyer: "Poissonneries Dakar Centre", lot: "FB-260729-018", quantity: "420 kg", price: "3 050 FCFA/kg", delivery: "30 juil. · 06 h 30", status: "Confirmé", risk: "Faible" },
  { id: "ENG-260729-015", buyer: "Cuisine scolaire Thiès", lot: "KY-260729-007", quantity: "300 kg", price: "2 250 FCFA/kg", delivery: "30 juil. · 09 h 00", status: "Sous conditions", risk: "Moyen" },
  { id: "ENG-260729-016", buyer: "Hôtel Teranga Littoral", lot: "JF-260729-011", quantity: "120 kg", price: "4 600 FCFA/kg", delivery: "29 juil. · 21 h 00", status: "En livraison", risk: "Faible" },
  { id: "ENG-260729-017", buyer: "Transformateurs Kayar", lot: "FB-260729-019", quantity: "210 kg", price: "1 900 FCFA/kg", delivery: "29 juil. · 19 h 30", status: "À confirmer", risk: "Élevé" },
];

const clauses = [
  { label: "Quantité engagée", value: "1 050 kg", detail: "Tolérance maximale : 3 % selon pesée acceptée" },
  { label: "Valeur contractualisée", value: "2 903 500 FCFA", detail: "Hors services de transport et de froid" },
  { label: "Délai moyen", value: "9 h 40", detail: "Entre confirmation et remise au destinataire" },
  { label: "Part couverte", value: "78 %", detail: "Engagements avec garantie ou historique fiable" },
];

const safeguards = [
  ["Réservation ferme", "La quantité réservée devient indisponible pour les autres acheteurs pendant la durée convenue."],
  ["Prix explicite", "Le prix, l'unité, les services inclus et les ajustements possibles sont visibles avant validation."],
  ["Conditions de qualité", "Espèce, calibre, fraîcheur, température et tolérance sont reliés au lot et à la réception."],
  ["Responsable de livraison", "Le transporteur, le lieu, le créneau et la preuve attendue sont connus avant départ."],
  ["Acceptation documentée", "La quantité acceptée, refusée ou reclassée déclenche automatiquement le bon règlement."],
  ["Gestion des écarts", "Tout écart ouvre une tension avec responsable, délai d'arbitrage et historique des décisions."],
];

const settlements = [
  { engagement: "ENG-260729-014", gross: "1 281 000 FCFA", services: "118 000 FCFA", platform: "38 430 FCFA", payable: "1 124 570 FCFA", status: "Prévisionnel" },
  { engagement: "ENG-260729-015", gross: "675 000 FCFA", services: "72 000 FCFA", platform: "20 250 FCFA", payable: "582 750 FCFA", status: "Sous conditions" },
  { engagement: "ENG-260729-016", gross: "552 000 FCFA", services: "64 000 FCFA", platform: "16 560 FCFA", payable: "471 440 FCFA", status: "À rapprocher" },
];

export default function CommercialCommitmentsPage() {
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Moteur d'engagements commerciaux</p>
              <h1 className="mt-2 text-3xl font-semibold">Transformer une intention d'achat en engagement exécutable</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Mbàmbulaan sécurise la quantité, le prix, la qualité, la livraison, l'acceptation et le règlement sans devenir une simple marketplace.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/tracabilite-filiere" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Traçabilité</Link>
              <Link href="/coordination-services" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Services</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {clauses.map((item) => <Metric key={item.label} label={item.label} value={item.value} detail={item.detail} />)}
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <SectionTitle eyebrow="Engagements actifs" title="Voir ce qui est promis, à qui et sous quelles conditions" />
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]"><tr>{["Engagement", "Acheteur", "Lot", "Quantité", "Prix", "Livraison", "Statut", "Risque"].map((header) => <th key={header} className="py-3 pr-4">{header}</th>)}</tr></thead>
              <tbody>{commitments.map((item) => <tr key={item.id} className="border-b border-[var(--mb-neutral-100)]"><td className="py-4 pr-4 font-semibold">{item.id}</td><td className="py-4 pr-4">{item.buyer}</td><td className="py-4 pr-4">{item.lot}</td><td className="py-4 pr-4">{item.quantity}</td><td className="py-4 pr-4">{item.price}</td><td className="py-4 pr-4">{item.delivery}</td><td className="py-4 pr-4"><span className="rounded border px-2 py-1 text-xs font-semibold">{item.status}</span></td><td className="py-4 pr-4">{item.risk}</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {safeguards.map(([title, text]) => <article key={title} className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>)}
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <SectionTitle eyebrow="Règlement projeté" title="Rendre le partage financier lisible avant la remise finale" />
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]"><tr>{["Engagement", "Valeur brute", "Services", "Mbàmbulaan", "À verser à la filière", "Statut"].map((header) => <th key={header} className="py-3 pr-4">{header}</th>)}</tr></thead>
              <tbody>{settlements.map((item) => <tr key={item.engagement} className="border-b border-[var(--mb-neutral-100)]"><td className="py-4 pr-4 font-semibold">{item.engagement}</td><td className="py-4 pr-4">{item.gross}</td><td className="py-4 pr-4">{item.services}</td><td className="py-4 pr-4">{item.platform}</td><td className="py-4 pr-4 font-semibold">{item.payable}</td><td className="py-4 pr-4">{item.status}</td></tr>)}</tbody>
            </table>
          </div>
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
