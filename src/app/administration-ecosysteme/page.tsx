import Link from "next/link";

const actors = [
  { name: "Moussa Ndiaye", role: "Capitaine", organization: "GIE Ndiambour", territory: "Fass Boye", status: "Actif", reliability: "Fiable" },
  { name: "Awa Diop", role: "Transformatrice", organization: "Femmes de Kayar", territory: "Kayar", status: "Actif", reliability: "Confirmé" },
  { name: "Cheikh Fall", role: "Transporteur frigorifique", organization: "Sunu Froid", territory: "Dakar", status: "Actif", reliability: "À consolider" },
  { name: "Fatou Sarr", role: "Responsable coopérative", organization: "Coopérative Joal", territory: "Joal-Fadiouth", status: "Actif", reliability: "Fiable" },
];

const organizations = [
  { name: "GIE Ndiambour", type: "Organisation de pêcheurs", members: 86, territory: "Fass Boye", services: "Campagnes, glace, commercialisation" },
  { name: "Femmes de Kayar", type: "Groupement de transformatrices", members: 42, territory: "Kayar", services: "Transformation, stockage, vente" },
  { name: "Sunu Froid", type: "Prestataire", members: 12, territory: "Dakar", services: "Transport et froid" },
  { name: "Coopérative Joal", type: "Coopérative territoriale", members: 124, territory: "Joal-Fadiouth", services: "Débarquement, pesée, fonds commun" },
];

const territories = [
  { name: "Fass Boye", sites: 2, vessels: 78, services: 9, rule: "Sardinelle sous surveillance" },
  { name: "Kayar", sites: 3, vessels: 112, services: 14, rule: "Taille minimale renforcée" },
  { name: "Joal-Fadiouth", sites: 4, vessels: 166, services: 21, rule: "Zones sensibles actives" },
  { name: "Dakar", sites: 6, vessels: 95, services: 37, rule: "Contrôle qualité renforcé" },
];

const rules = [
  { title: "Qui peut confirmer une pesée", scope: "Site de débarquement", owner: "Gestionnaire de site", effect: "Seuls les peseurs habilités valident le poids final." },
  { title: "Qui peut engager un fonds commun", scope: "Coopérative", owner: "Comité local", effect: "Toute affectation requiert une décision enregistrée." },
  { title: "Quand une sortie doit être restreinte", scope: "Espèce et territoire", owner: "Autorité compétente", effect: "Une fermeture active bloque l'autorisation de campagne." },
  { title: "Qui peut publier un lot", scope: "Débarquement et qualité", owner: "Organisation vendeuse", effect: "Le lot doit être pesé, qualifié et rattaché à son origine." },
];

export default function EcosystemAdministrationPage() {
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Administration de l'écosystème</p>
              <h1 className="mt-2 text-3xl font-semibold">Organiser les acteurs, organisations, territoires et règles</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Un même référentiel pour savoir qui agit, pour quelle organisation, sur quel territoire, avec quelles responsabilités et selon quelles règles.</p>
            </div>
            <Link href="/pilote" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Retour au parcours transversal</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Acteurs qualifiés" value="1 248" detail="Identité, rôle et organisation reliés" />
          <Metric label="Organisations actives" value="74" detail="Coopératives, prestataires et acheteurs" />
          <Metric label="Territoires couverts" value="12" detail="Sites, capacités et règles visibles" />
          <Metric label="Règles actives" value="38" detail="Responsabilités et décisions applicables" />
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <SectionTitle eyebrow="Acteurs" title="Savoir qui peut agir et au nom de qui" />
          <DataTable headers={["Acteur", "Rôle", "Organisation", "Territoire", "Statut", "Fiabilité"]} rows={actors.map((item) => [item.name, item.role, item.organization, item.territory, item.status, item.reliability])} />
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <SectionTitle eyebrow="Organisations" title="Rendre visibles les responsabilités et services collectifs" />
          <DataTable headers={["Organisation", "Type", "Membres", "Territoire", "Services coordonnés"]} rows={organizations.map((item) => [item.name, item.type, item.members.toLocaleString("fr-FR"), item.territory, item.services])} />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <SectionTitle eyebrow="Territoires" title="Connaître les capacités et contraintes locales" />
            <div className="mt-4 space-y-3">
              {territories.map((item) => (
                <div key={item.name} className="rounded-lg border border-[var(--mb-neutral-200)] p-4">
                  <div className="flex items-center justify-between gap-4"><h3 className="font-semibold">{item.name}</h3><span className="text-xs font-bold text-[var(--mb-ocean-700)]">{item.rule}</span></div>
                  <p className="mt-2 text-sm text-[var(--mb-neutral-500)]">{item.sites} sites · {item.vessels} embarcations · {item.services} capacités de service</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <SectionTitle eyebrow="Règles de fonctionnement" title="Éviter les décisions floues ou sans responsable" />
            <div className="mt-4 space-y-3">
              {rules.map((item) => (
                <div key={item.title} className="rounded-lg bg-[var(--mb-neutral-50)] p-4">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-[var(--mb-neutral-400)]">{item.scope} · Décideur : {item.owner}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{item.effect}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <ValueCard title="Pour les acteurs" text="Des responsabilités claires, moins de contestations et un accès aux services correspondant réellement à leur rôle." />
          <ValueCard title="Pour les territoires" text="Une vision commune des embarcations, sites, capacités disponibles, règles et organisations responsables." />
          <ValueCard title="Pour Mbàmbulaan" text="Un socle fiable qui rend possibles la coordination, la facturation des services, la confiance et le déploiement multi-sites." />
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

function ValueCard({ title, text }: { title: string; text: string }) {
  return <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><h3 className="font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>;
}
