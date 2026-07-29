import Link from "next/link";

const chain = [
  { step: "01", title: "Campagne", actor: "Pirogue Ndiambour 12", detail: "Départ validé, zone autorisée, équipage enregistré, espèce cible conforme." },
  { step: "02", title: "Retour annoncé", actor: "Capitaine", detail: "Arrivée prévue à 16 h 40, 820 kg estimés, besoin de glace et manutention confirmé." },
  { step: "03", title: "Débarquement", actor: "Site de Fass Boye", detail: "Pesée officielle, qualité vérifiée, origine et horodatage enregistrés." },
  { step: "04", title: "Lot constitué", actor: "Coopérative", detail: "Lot FB-260729-018 : 610 kg frais, 210 kg orientés vers transformation." },
  { step: "05", title: "Services exécutés", actor: "Prestataires", detail: "Glace, manutention, froid et transport reliés au même lot." },
  { step: "06", title: "Engagement commercial", actor: "Acheteur", detail: "Quantité réservée, prix convenu, responsabilités et délai de livraison confirmés." },
  { step: "07", title: "Livraison", actor: "Transporteur", detail: "Réception confirmée avec quantité acceptée, température et preuve de remise." },
  { step: "08", title: "Règlement et partage", actor: "Mbàmbulaan", detail: "Paiement rapproché, bénéficiaires servis, contributions et rémunération de coordination calculées." },
];

const lots = [
  { id: "FB-260729-018", species: "Sardinelle ronde", origin: "Fass Boye", quantity: "610 kg", destination: "Marché frais Dakar", status: "Livré", value: "1 845 000 FCFA" },
  { id: "FB-260729-019", species: "Sardinelle ronde", origin: "Fass Boye", quantity: "210 kg", destination: "Transformation Kayar", status: "En froid", value: "399 000 FCFA" },
  { id: "KY-260729-007", species: "Ethmalose", origin: "Kayar", quantity: "480 kg", destination: "Restauration collective", status: "Réservé", value: "1 104 000 FCFA" },
  { id: "JF-260729-011", species: "Carpe blanche", origin: "Joal-Fadiouth", quantity: "155 kg", destination: "Poissonnerie Dakar", status: "En transport", value: "697 500 FCFA" },
];

const controls = [
  ["Origine vérifiable", "Campagne, embarcation, équipage, zone et site de débarquement reliés."],
  ["Qualité visible", "Pesée, température, état, classement et preuves attachés au lot."],
  ["Responsabilités claires", "Chaque transfert indique qui remet, qui reçoit, quand et sous quelles conditions."],
  ["Transformation conservée", "Les sous-lots issus d'un lot d'origine gardent le lien de filiation."],
  ["Règlement rapproché", "Le paiement est relié à la quantité réellement acceptée et aux services exécutés."],
  ["Tensions mémorisées", "Les écarts de quantité, qualité, délai ou paiement restent attachés au parcours."],
];

export default function TraceabilityPage() {
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Traçabilité de filière</p>
              <h1 className="mt-2 text-3xl font-semibold">Suivre le lot de la campagne jusqu'au règlement</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Une continuité de preuves, responsabilités et décisions pour réduire les pertes, sécuriser les échanges et valoriser l'origine.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/pilote" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Parcours transversal</Link>
              <Link href="/administration-ecosysteme" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Référentiel écosystème</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Lots actifs" value="36" detail="Réservés, en service, transport ou livraison" />
          <Metric label="Poids tracé" value="18,4 t" detail="Origine, qualité et destination reliées" />
          <Metric label="Pertes évitées" value="1,8 t" detail="Réorientation rapide vers froid ou transformation" />
          <Metric label="Valeur sécurisée" value="42,7 M FCFA" detail="Livraisons et règlements rapprochés" />
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Chaîne de confiance</p>
          <h2 className="mt-2 text-xl font-semibold">Une même histoire opérationnelle partagée entre tous les acteurs</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {chain.map((item) => (
              <article key={item.step} className="rounded-xl border border-[var(--mb-neutral-200)] p-4">
                <span className="font-mono text-xs font-bold text-[var(--mb-ocean-700)]">{item.step}</span>
                <h3 className="mt-2 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm font-semibold text-[var(--mb-navy-900)]">{item.actor}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-500)]">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Lots en circulation</p>
              <h2 className="mt-2 text-xl font-semibold">Voir où se trouve la valeur et ce qui doit encore être confirmé</h2>
            </div>
            <span className="rounded-lg bg-[var(--mb-neutral-50)] px-3 py-2 text-xs font-semibold text-[var(--mb-neutral-600)]">Dernière synchronisation : 18 h 12</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]"><tr>{["Lot", "Espèce", "Origine", "Quantité", "Destination", "Statut", "Valeur"].map((header) => <th key={header} className="py-3 pr-4">{header}</th>)}</tr></thead>
              <tbody>{lots.map((lot) => <tr key={lot.id} className="border-b border-[var(--mb-neutral-100)]"><td className="py-4 pr-4 font-semibold">{lot.id}</td><td className="py-4 pr-4">{lot.species}</td><td className="py-4 pr-4">{lot.origin}</td><td className="py-4 pr-4">{lot.quantity}</td><td className="py-4 pr-4">{lot.destination}</td><td className="py-4 pr-4"><span className="rounded border px-2 py-1 text-xs font-semibold">{lot.status}</span></td><td className="py-4 pr-4 font-semibold">{lot.value}</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {controls.map(([title, text]) => <article key={title} className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>)}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-2 text-xs leading-5 text-[var(--mb-neutral-500)]">{detail}</p></article>;
}
