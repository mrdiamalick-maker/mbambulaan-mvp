import Link from "next/link";

const needs = [
  { id: "BES-1042", territory: "Fass Boye", need: "Glace pour retour campagne", quantity: "1 200 kg", deadline: "15 h 40", priority: "Critique", status: "Affecté" },
  { id: "BES-1043", territory: "Kayar", need: "Transport frigorifique", quantity: "480 kg", deadline: "17 h 15", priority: "Haute", status: "À confirmer" },
  { id: "BES-1044", territory: "Joal-Fadiouth", need: "Manutention débarquement", quantity: "2 équipes", deadline: "18 h 00", priority: "Normale", status: "Confirmé" },
  { id: "BES-1045", territory: "Dakar", need: "Stockage court terme", quantity: "6 palettes", deadline: "20 h 30", priority: "Haute", status: "En recherche" },
];

const providers = [
  { name: "Sunu Glace", capability: "Production de glace", territory: "Fass Boye", capacity: "2 400 kg disponibles", reliability: "96 %", status: "Disponible" },
  { name: "Sunu Froid", capability: "Transport frigorifique", territory: "Dakar / Littoral", capacity: "2 camions disponibles", reliability: "93 %", status: "Disponible" },
  { name: "GIE Débarquement Joal", capability: "Manutention", territory: "Joal-Fadiouth", capacity: "3 équipes", reliability: "98 %", status: "Mobilisé" },
  { name: "Entrepôts du Cap", capability: "Froid positif", territory: "Dakar", capacity: "4 palettes", reliability: "91 %", status: "Partiel" },
];

const assignments = [
  { need: "BES-1042", provider: "Sunu Glace", commitment: "1 200 kg avant 15 h 20", price: "84 000 FCFA", proof: "Bon de livraison + réception", status: "En exécution" },
  { need: "BES-1043", provider: "Sunu Froid", commitment: "Départ Kayar 17 h 00", price: "145 000 FCFA", proof: "Température + géolocalisation", status: "À confirmer" },
  { need: "BES-1044", provider: "GIE Débarquement Joal", commitment: "2 équipes dès 17 h 45", price: "60 000 FCFA", proof: "Présence + volume traité", status: "Confirmé" },
];

const rules = [
  ["Priorité métier", "Le risque de perte, la qualité du produit et l'urgence priment sur l'ordre d'arrivée."],
  ["Capacité réelle", "Une affectation n'est proposée que si la capacité disponible couvre le besoin au bon moment."],
  ["Responsabilité explicite", "Le demandeur, le prestataire, le décideur et le payeur sont identifiés avant confirmation."],
  ["Preuve d'exécution", "Le service n'est payable qu'après une preuve adaptée : réception, température, présence ou résultat."],
  ["Réaffectation", "Un retard ou refus déclenche immédiatement une alternative sans perdre l'historique de décision."],
  ["Rémunération Mbàmbulaan", "La plateforme facture la coordination et la sécurisation du service, jamais l'augmentation de l'effort de pêche."],
];

export default function ServiceCoordinationPage() {
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Moteur de coordination des services</p>
              <h1 className="mt-2 text-3xl font-semibold">Transformer un besoin terrain en service exécuté et prouvé</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Mbàmbulaan qualifie le besoin, trouve la capacité adaptée, formalise l'engagement, suit l'exécution et sécurise le règlement.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/pilote" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Parcours transversal</Link>
              <Link href="/exploitation-mbambulaan" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Exploitation</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Besoins ouverts" value="27" detail="Dont 6 urgents ou critiques" />
          <Metric label="Capacités disponibles" value="64" detail="Prestataires, équipements et équipes" />
          <Metric label="Services exécutés aujourd'hui" value="83" detail="Avec preuve et responsable identifiés" />
          <Metric label="Valeur protégée" value="18,6 M FCFA" detail="Lots préservés grâce aux services coordonnés" />
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <SectionTitle eyebrow="Demandes terrain" title="Voir les besoins à traiter avant qu'ils ne deviennent des pertes" />
          <DataTable headers={["Besoin", "Territoire", "Service", "Quantité", "Échéance", "Priorité", "Statut"]} rows={needs.map((item) => [item.id, item.territory, item.need, item.quantity, item.deadline, item.priority, item.status])} />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <SectionTitle eyebrow="Capacités mobilisables" title="Connaître ce qui est réellement disponible" />
            <div className="mt-4 space-y-3">
              {providers.map((item) => (
                <div key={item.name} className="rounded-lg border border-[var(--mb-neutral-200)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-sm text-[var(--mb-neutral-500)]">{item.capability} · {item.territory}</p></div><span className="rounded border px-2 py-1 text-xs font-semibold">{item.status}</span></div>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm"><span>{item.capacity}</span><span>Fiabilité : {item.reliability}</span></div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <SectionTitle eyebrow="Affectations" title="Formaliser qui fait quoi, quand et à quel prix" />
            <div className="mt-4 space-y-3">
              {assignments.map((item) => (
                <div key={item.need} className="rounded-lg bg-[var(--mb-neutral-50)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-[10px] text-[var(--mb-neutral-400)]">{item.need}</p><h3 className="mt-1 font-semibold">{item.provider}</h3></div><span className="text-xs font-bold">{item.status}</span></div>
                  <p className="mt-3 text-sm">Engagement : {item.commitment}</p>
                  <p className="mt-2 text-sm text-[var(--mb-neutral-500)]">Prix : {item.price}</p>
                  <p className="mt-1 text-sm text-[var(--mb-neutral-500)]">Preuve : {item.proof}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <SectionTitle eyebrow="Règles du moteur" title="Affecter vite sans sacrifier la confiance" />
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rules.map(([title, text]) => <article key={title} className="rounded-xl border border-[var(--mb-neutral-200)] p-4"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>)}
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">{eyebrow}</p><h2 className="mt-2 text-xl font-semibold">{title}</h2></div>;
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return <div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]"><tr>{headers.map((header) => <th key={header} className="py-3 pr-4">{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className="border-b border-[var(--mb-neutral-100)]">{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`} className="py-4 pr-4">{cell}</td>)}</tr>)}</tbody></table></div>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-2 text-xs leading-5 text-[var(--mb-neutral-500)]">{detail}</p></article>;
}
