import Link from "next/link";
import { domainRepository } from "@/domain/repositories";
import {
  getAvailableCapacitiesByTerritory,
  getExpectedReturnsByTerritory,
  getOpenTensionsByTerritory,
} from "@/domain/selectors";

const actorLabels: Record<string, string> = {
  fisher: "Pêcheur",
  captain: "Capitaine",
  landing_site_agent: "Agent de site",
  weigher: "Peseur",
  buyer: "Acheteur",
  processor: "Transformateur",
  transporter: "Transporteur",
  cold_chain_operator: "Opérateur froid",
  territorial_coordinator: "Coordinateur territorial",
  institutional_decision_maker: "Décideur institutionnel",
};

const organizationLabels: Record<string, string> = {
  fisher_organization: "Organisation de pêcheurs",
  landing_site_management: "Gestionnaire de site",
  buyer: "Acheteur",
  processor: "Transformateur",
  transport_provider: "Prestataire transport",
  cold_chain_provider: "Prestataire froid",
  public_authority: "Autorité publique",
  community_organization: "Organisation communautaire",
};

export default function EcosystemAdministrationPage() {
  const data = domainRepository.getData();
  const activeActors = data.actors.filter((actor) => actor.status === "active");
  const activeOrganizations = data.organizations.filter(
    (organization) => organization.status === "active",
  );
  const activeTerritories = data.territories.filter(
    (territory) => territory.status === "active",
  );

  const territorySummaries = activeTerritories.map((territory) => ({
    territory,
    sites: data.landingSites.filter((site) => site.territoryId === territory.id),
    vessels: data.vessels.filter((vessel) => {
      const site = data.landingSites.find(
        (landingSite) => landingSite.id === vessel.homeLandingSiteId,
      );
      return site?.territoryId === territory.id;
    }),
    capacities: getAvailableCapacitiesByTerritory(data, territory.id),
    returns: getExpectedReturnsByTerritory(data, territory.id),
    tensions: getOpenTensionsByTerritory(data, territory.id),
  }));

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Administration de l'écosystème</p>
              <h1 className="mt-2 text-3xl font-semibold">Acteurs, organisations, territoires et responsabilités</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Le référentiel expose uniquement les identités, rôles, rattachements et capacités réellement présents dans le domaine Mbàmbulaan.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/operations/retours" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Retours</Link>
              <Link href="/coordination-services" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Coordination</Link>
              <Link href="/exploitation-mbambulaan" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Exploitation</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Acteurs actifs" value={String(activeActors.length)} detail="Identité, rôle, organisation et territoire" />
          <Metric label="Organisations actives" value={String(activeOrganizations.length)} detail="Pêcheurs, sites, acheteurs et prestataires" />
          <Metric label="Territoires actifs" value={String(activeTerritories.length)} detail="Sites, embarcations, capacités et tensions" />
          <Metric label="Rôles opérationnels" value={String(new Set(activeActors.map((actor) => actor.actorType)).size)} detail="Responsabilités distinctes dans le domaine" />
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <SectionTitle eyebrow="Acteurs" title="Savoir qui agit, pour quelle organisation et sur quel territoire" />
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]">
                <tr>{["Acteur", "Rôle", "Organisation", "Territoire", "Téléphone", "Statut"].map((header) => <th key={header} className="py-3 pr-4">{header}</th>)}</tr>
              </thead>
              <tbody>
                {activeActors.map((actor) => {
                  const organization = data.organizations.find(
                    (item) => item.id === actor.organizationId,
                  );
                  const territory = data.territories.find(
                    (item) => item.id === actor.territoryId,
                  );
                  return (
                    <tr key={actor.id} className="border-b border-[var(--mb-neutral-100)]">
                      <td className="py-4 pr-4 font-semibold">{actor.name}</td>
                      <td className="py-4 pr-4">{actorLabels[actor.actorType] ?? actor.actorType}</td>
                      <td className="py-4 pr-4">{organization?.name ?? "Indépendant"}</td>
                      <td className="py-4 pr-4">{territory?.name ?? actor.territoryId}</td>
                      <td className="py-4 pr-4">{actor.phone ?? "Non renseigné"}</td>
                      <td className="py-4 pr-4"><span className="rounded border px-2 py-1 text-xs font-semibold">{actor.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
          <SectionTitle eyebrow="Organisations" title="Rendre visibles les responsabilités et services réellement portés" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {activeOrganizations.map((organization) => {
              const territory = data.territories.find(
                (item) => item.id === organization.territoryId,
              );
              const members = data.actors.filter(
                (actor) => actor.organizationId === organization.id,
              );
              const capacities = data.capacities.filter(
                (capacity) => capacity.providerOrganizationId === organization.id,
              );
              const allocations = data.serviceAllocations.filter(
                (allocation) => allocation.providerOrganizationId === organization.id,
              );
              return (
                <article key={organization.id} className="rounded-xl border border-[var(--mb-neutral-200)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{organization.name}</h3>
                      <p className="mt-1 text-sm text-[var(--mb-neutral-500)]">{organizationLabels[organization.organizationType] ?? organization.organizationType} · {territory?.name ?? organization.territoryId}</p>
                    </div>
                    <span className="rounded border px-2 py-1 text-xs font-semibold">{organization.status}</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <MiniMetric label="Acteurs rattachés" value={String(members.length)} />
                    <MiniMetric label="Capacités déclarées" value={String(capacities.length)} />
                    <MiniMetric label="Services alloués" value={String(allocations.length)} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <SectionTitle eyebrow="Territoires" title="Voir les ressources et contraintes locales" />
            <div className="mt-4 space-y-3">
              {territorySummaries.map(({ territory, sites, vessels, capacities, returns, tensions }) => (
                <div key={territory.id} className="rounded-lg border border-[var(--mb-neutral-200)] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{territory.name}</h3>
                      <p className="mt-1 text-sm text-[var(--mb-neutral-500)]">Région de {territory.region}</p>
                    </div>
                    <span className="text-xs font-bold text-[var(--mb-ocean-700)]">{tensions.length} tension(s) ouverte(s)</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <MiniMetric label="Sites" value={String(sites.length)} />
                    <MiniMetric label="Embarcations" value={String(vessels.length)} />
                    <MiniMetric label="Retours suivis" value={String(returns.length)} />
                    <MiniMetric label="Capacités disponibles" value={String(capacities.length)} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5">
            <SectionTitle eyebrow="Règles visibles dans le domaine" title="Éviter les décisions floues ou sans responsable" />
            <div className="mt-4 space-y-3">
              <RuleCard title="Confirmation d'un débarquement" text="L'action conserve l'acteur confirmateur, le site, l'embarcation et l'horodatage." />
              <RuleCard title="Validation d'une pesée" text="La méthode, le niveau de confiance et le vérificateur peuvent être enregistrés." />
              <RuleCard title="Réservation d'une capacité" text="La quantité réservée ne peut dépasser ni la capacité disponible ni le besoin restant." />
              <RuleCard title="Exécution d'un service" text="La quantité exécutée ne peut dépasser la réservation et doit conserver une preuve." />
              <RuleCard title="Coordination d'une tension" text="Les engagements rendent visibles l'action, le responsable, l'échéance et le statut." />
              <RuleCard title="Mesure d'un résultat" text="La valeur créée, la quantité protégée et les preuves sont liées à une entité métier précise." />
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <ValueCard title="Pour les acteurs" text="Des responsabilités claires et des actions rattachées à une identité, une organisation et un territoire." />
          <ValueCard title="Pour les territoires" text="Une vision commune des sites, embarcations, capacités, retours et tensions réellement enregistrés." />
          <ValueCard title="Pour Mbàmbulaan" text="Un socle fiable pour coordonner, mesurer la valeur et répliquer le produit sans créer une application distincte par acteur." />
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

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-[var(--mb-neutral-50)] p-3"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>;
}

function RuleCard({ title, text }: { title: string; text: string }) {
  return <div className="rounded-lg bg-[var(--mb-neutral-50)] p-4"><p className="font-semibold">{title}</p><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></div>;
}

function ValueCard({ title, text }: { title: string; text: string }) {
  return <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><h3 className="font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>;
}
