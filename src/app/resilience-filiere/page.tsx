import Link from "next/link";

const alerts = [
  { territory: "Kayar", signal: "Baisse des captures de sardinelle", level: "Élevé", action: "Réduire l'effort ciblé et renforcer la valorisation", owner: "Coordination ressource" },
  { territory: "Fass Boye", signal: "Capacité de froid saturée", level: "Critique", action: "Réorienter vers transformation et mutualiser le transport", owner: "Coordination services" },
  { territory: "Joal-Fadiouth", signal: "Prix instables sur le marché frais", level: "Moyen", action: "Sécuriser des engagements acheteurs et diversifier les débouchés", owner: "Coordination commerciale" },
  { territory: "Dakar", signal: "Hausse des refus qualité", level: "Moyen", action: "Renforcer les critères de réception et la preuve de chaîne du froid", owner: "Responsable qualité" },
];

const scenarios = [
  { name: "Ressource rare", trigger: "Disponibilité en baisse sur 3 semaines", response: "Limiter les campagnes non prioritaires, maximiser la valeur par kilogramme et protéger les revenus", status: "Actif" },
  { name: "Rupture de froid", trigger: "Capacité disponible sous 20 %", response: "Mutualiser les moyens, prioriser les lots sensibles et basculer vers transformation", status: "Prêt" },
  { name: "Débouché saturé", trigger: "Taux de réservation inférieur à 55 %", response: "Diversifier les acheteurs, différer certains départs et proposer des formats alternatifs", status: "Prêt" },
  { name: "Choc de prix", trigger: "Baisse supérieure à 15 %", response: "Sécuriser les engagements, réduire les ventes forcées et activer les solutions de stockage", status: "À tester" },
];

const principles = [
  ["Valeur avant volume", "La performance est mesurée par la valeur créée et protégée, pas par la quantité débarquée."],
  ["Effort évité", "Une campagne non nécessaire ou reportée est considérée comme une décision économique positive."],
  ["Pertes évitées", "La réorientation rapide vers froid, transformation ou autre débouché protège la ressource déjà prélevée."],
  ["Revenus protégés", "Les acteurs doivent mieux vivre d'un volume maîtrisé plutôt que dépendre d'une hausse continue des captures."],
  ["Décision partagée", "Les alertes sont reliées à des responsables, des règles et des scénarios d'action connus de tous."],
  ["Résilience rentable", "Mbàmbulaan monétise la coordination, la sécurisation et l'intelligence opérationnelle de la filière."],
];

const outcomes = [
  { label: "Effort de pêche évité", value: "14 campagnes", detail: "Départs reportés ou annulés grâce aux signaux de demande et de capacité" },
  { label: "Pertes évitées", value: "3,7 t", detail: "Lots redirigés vers froid, transformation ou acheteurs alternatifs" },
  { label: "Valeur moyenne", value: "2 840 FCFA/kg", detail: "Hausse obtenue par qualité, orientation et engagement commercial" },
  { label: "Revenus protégés", value: "28,4 M FCFA", detail: "Valeur maintenue malgré les tensions de ressource et de marché" },
];

export default function ResiliencePage() {
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Résilience de la filière</p>
              <h1 className="mt-2 text-3xl font-semibold">Créer plus de valeur avec moins de pression sur la ressource</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Mbàmbulaan transforme les signaux de ressource, de capacité et de marché en décisions coordonnées qui protègent les revenus et évitent la surpêche.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/pilotage-ressource" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Pilotage ressource</Link>
              <Link href="/exploitation-mbambulaan" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Exploitation</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {outcomes.map((item) => <Metric key={item.label} label={item.label} value={item.value} detail={item.detail} />)}
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <SectionTitle eyebrow="Alertes systémiques" title="Détecter ce qui menace la coordination, la valeur ou la ressource" />
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]"><tr>{["Territoire", "Signal", "Niveau", "Action coordonnée", "Responsable"].map((header) => <th key={header} className="py-3 pr-4">{header}</th>)}</tr></thead>
              <tbody>{alerts.map((item) => <tr key={`${item.territory}-${item.signal}`} className="border-b border-[var(--mb-neutral-100)]"><td className="py-4 pr-4 font-semibold">{item.territory}</td><td className="py-4 pr-4">{item.signal}</td><td className="py-4 pr-4"><span className="rounded border px-2 py-1 text-xs font-semibold">{item.level}</span></td><td className="py-4 pr-4">{item.action}</td><td className="py-4 pr-4">{item.owner}</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <SectionTitle eyebrow="Scénarios de résilience" title="Réagir avant que la tension ne devienne une crise" />
            <div className="mt-4 space-y-3">
              {scenarios.map((item) => <div key={item.name} className="rounded-lg border border-[var(--mb-neutral-200)] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><h3 className="font-semibold">{item.name}</h3><span className="rounded border px-2 py-1 text-xs font-semibold">{item.status}</span></div><p className="mt-3 text-sm text-[var(--mb-neutral-500)]">Déclencheur : {item.trigger}</p><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-700)]">Réponse : {item.response}</p></div>)}
            </div>
          </article>

          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <SectionTitle eyebrow="Doctrine produit" title="Les règles non négociables de croissance" />
            <div className="mt-4 space-y-3">
              {principles.map(([title, text]) => <div key={title} className="rounded-lg bg-[var(--mb-neutral-50)] p-4"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></div>)}
            </div>
          </article>
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
