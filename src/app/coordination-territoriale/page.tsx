import Link from "next/link";

const territories = [
  { name: "Kayar", coordinator: "Awa Ndiaye", actors: 186, activeFlows: 42, criticalNeeds: 2, readiness: "Opérationnel" },
  { name: "Fass Boye", coordinator: "Mamadou Lô", actors: 121, activeFlows: 31, criticalNeeds: 5, readiness: "Sous tension" },
  { name: "Joal-Fadiouth", coordinator: "Fatou Diouf", actors: 248, activeFlows: 67, criticalNeeds: 3, readiness: "Opérationnel" },
  { name: "Dakar", coordinator: "Cheikh Fall", actors: 314, activeFlows: 89, criticalNeeds: 4, readiness: "À surveiller" },
];

const decisions = [
  { id: "DEC-260729-031", territory: "Fass Boye", subject: "Prioriser le froid sur le marché frais", reason: "Capacité acheteur insuffisante et risque de perte", owner: "Coordination locale", deadline: "19 h 00", status: "Exécutée" },
  { id: "DEC-260729-032", territory: "Kayar", subject: "Mutualiser deux transports", reason: "Volumes compatibles et économie de trajet", owner: "Coordination services", deadline: "20 h 30", status: "Confirmée" },
  { id: "DEC-260729-033", territory: "Joal-Fadiouth", subject: "Réserver une équipe de manutention", reason: "Deux arrivées simultanées prévues", owner: "Responsable débarquement", deadline: "21 h 15", status: "En cours" },
  { id: "DEC-260729-034", territory: "Dakar", subject: "Arbitrer une différence de qualité", reason: "Réception partielle contestée", owner: "Responsable qualité", deadline: "Demain 10 h", status: "À arbitrer" },
];

const capabilities = [
  ["Vue territoriale partagée", "Les acteurs locaux voient les flux, capacités, tensions et échéances qui concernent leur territoire."],
  ["Responsabilités locales", "Chaque besoin, décision ou incident possède un responsable opérationnel clairement identifié."],
  ["Arbitrage documenté", "La décision, sa justification, son délai et ses effets restent visibles pour éviter les conflits de mémoire."],
  ["Escalade maîtrisée", "Seuls les sujets dépassant les règles ou capacités locales remontent vers la coordination centrale."],
  ["Apprentissage entre territoires", "Les pratiques efficaces peuvent être répliquées sans imposer un fonctionnement identique partout."],
  ["Pilotage par résultat", "La coordination est évaluée sur les pertes évitées, les délais, la confiance et la valeur protégée."],
];

const agenda = [
  { time: "07 h 30", territory: "Kayar", action: "Point retours campagne et capacités de glace", participants: "Capitaines, quai, prestataires" },
  { time: "10 h 00", territory: "Dakar", action: "Validation engagements restauration collective", participants: "Acheteurs, qualité, transport" },
  { time: "15 h 30", territory: "Fass Boye", action: "Arbitrage lots frais / transformation", participants: "Coopérative, transformateurs" },
  { time: "18 h 00", territory: "Joal-Fadiouth", action: "Coordination débarquement simultané", participants: "Quai, manutention, froid" },
];

export default function TerritorialCoordinationPage() {
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Coordination territoriale</p>
              <h1 className="mt-2 text-3xl font-semibold">Donner à chaque territoire les moyens de décider et d'agir</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Une coordination locale autonome, reliée à des règles communes et capable d'escalader seulement ce qui dépasse son périmètre.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/administration-ecosysteme" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Référentiel</Link>
              <Link href="/exploitation-mbambulaan" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Exploitation centrale</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Territoires actifs" value="4" detail="Avec coordination et responsabilités locales" />
          <Metric label="Acteurs coordonnés" value="869" detail="Pêche, services, commerce et institutions" />
          <Metric label="Décisions aujourd'hui" value="38" detail="Dont 82 % traitées localement" />
          <Metric label="Escalades centrales" value="7" detail="Sujets hors capacité ou hors règle locale" />
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <SectionTitle eyebrow="Carte des territoires" title="Repérer les zones où la coordination doit être renforcée" />
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]"><tr>{["Territoire", "Coordinateur", "Acteurs", "Flux actifs", "Besoins critiques", "État"].map((header) => <th key={header} className="py-3 pr-4">{header}</th>)}</tr></thead>
              <tbody>{territories.map((item) => <tr key={item.name} className="border-b border-[var(--mb-neutral-100)]"><td className="py-4 pr-4 font-semibold">{item.name}</td><td className="py-4 pr-4">{item.coordinator}</td><td className="py-4 pr-4">{item.actors}</td><td className="py-4 pr-4">{item.activeFlows}</td><td className="py-4 pr-4">{item.criticalNeeds}</td><td className="py-4 pr-4"><span className="rounded border px-2 py-1 text-xs font-semibold">{item.readiness}</span></td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <SectionTitle eyebrow="Décisions locales" title="Rendre les arbitrages visibles et exécutables" />
            <div className="mt-4 space-y-3">
              {decisions.map((item) => (
                <div key={item.id} className="rounded-lg border border-[var(--mb-neutral-200)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-[10px] text-[var(--mb-neutral-400)]">{item.id} · {item.territory}</p><h3 className="mt-1 font-semibold">{item.subject}</h3></div><span className="rounded border px-2 py-1 text-xs font-semibold">{item.status}</span></div>
                  <p className="mt-3 text-sm text-[var(--mb-neutral-600)]">Motif : {item.reason}</p>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--mb-neutral-500)]"><span>Responsable : {item.owner}</span><span>Échéance : {item.deadline}</span></div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <SectionTitle eyebrow="Rituels du jour" title="Synchroniser les acteurs au bon moment" />
            <div className="mt-4 space-y-3">
              {agenda.map((item) => <div key={`${item.time}-${item.territory}`} className="rounded-lg bg-[var(--mb-neutral-50)] p-4"><p className="font-mono text-xs font-bold text-[var(--mb-ocean-700)]">{item.time} · {item.territory}</p><h3 className="mt-2 font-semibold">{item.action}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-500)]">{item.participants}</p></div>)}
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(([title, text]) => <article key={title} className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>)}
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
