import Link from "next/link";
import { domainRepository } from "@/domain/repositories";
import {
  getAvailableCapacitiesByTerritory,
  getExpectedReturnsByTerritory,
  getOpenServiceNeedsByTerritory,
  getOpenTensionsByTerritory,
  getTerritoryOperationalSummary,
} from "@/domain/selectors";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function GovernmentPage() {
  const data = domainRepository.getData();
  const totalValue = data.outcomes.reduce((sum, item) => sum + (item.valueCreated ?? 0), 0);
  const protectedKg = data.outcomes.reduce((sum, item) => sum + (item.valueSavedKg ?? 0), 0);
  const criticalAlerts = data.tensions.filter((item) => ["high", "critical"].includes(item.severity) && item.status !== "resolved");
  const institution = data.actors.find((actor) => actor.actorType === "institutional_decision_maker");

  const territories = data.territories.map((territory) => {
    const summary = getTerritoryOperationalSummary(data, territory.id, new Date().toISOString());
    const actors = data.actors.filter((actor) => actor.territoryId === territory.id);
    const sites = data.landingSites.filter((site) => site.territoryId === territory.id);
    const capacities = getAvailableCapacitiesByTerritory(data, territory.id);
    const openNeeds = getOpenServiceNeedsByTerritory(data, territory.id);
    const tensions = getOpenTensionsByTerritory(data, territory.id);
    const status = tensions.some((item) => ["high", "critical"].includes(item.severity))
      ? "Sous pression"
      : openNeeds.length > capacities.length
        ? "À surveiller"
        : "Opérationnel";
    return { territory, summary, actors, sites, capacities, openNeeds, tensions, status };
  });

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mb-ocean-400)]">Mbàmbulaan Government</p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Lecture institutionnelle fondée sur les opérations</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Le décideur public voit les territoires, les capacités, les tensions, les acteurs, les retours et les résultats sans dupliquer le système opérationnel.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/exploitation-mbambulaan" className="border border-white/25 px-4 py-3 text-xs font-bold">Control Tower</Link>
              <Link href="/administration-ecosysteme" className="border border-white/25 px-4 py-3 text-xs font-bold">Référentiel</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Territoires suivis" value={String(data.territories.length)} detail={`${territories.filter((item) => item.status !== "Opérationnel").length} nécessitent une attention`} />
          <Metric label="Acteurs enregistrés" value={String(data.actors.length)} detail={`${data.organizations.length} organisations actives`} />
          <Metric label="Valeur documentée" value={formatCurrency(totalValue)} detail={`${protectedKg.toLocaleString("fr-FR")} kg protégés`} />
          <Metric label="Alertes critiques" value={String(criticalAlerts.length)} detail="Tensions élevées ou critiques non résolues" />
        </section>

        <section className="mt-8 border border-[var(--mb-neutral-200)] bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Pilotage territorial</p>
              <h2 className="mt-2 text-2xl font-semibold">Comparer besoins, capacités et tensions</h2>
            </div>
            <span className="text-xs text-[var(--mb-neutral-500)]">Lecture calculée à partir du domaine opérationnel.</span>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]">
                <tr>{["Territoire", "Situation", "Acteurs", "Sites", "Retours", "Besoins ouverts", "Capacités", "Tensions", "Lots disponibles"].map((header) => <th key={header} className="py-3 pr-4">{header}</th>)}</tr>
              </thead>
              <tbody>
                {territories.map(({ territory, summary, actors, sites, capacities, openNeeds, tensions, status }) => (
                  <tr key={territory.id} className="border-b border-[var(--mb-neutral-100)]">
                    <td className="py-4 pr-4 font-semibold">{territory.name}</td>
                    <td className="py-4 pr-4">{status}</td>
                    <td className="py-4 pr-4">{actors.length}</td>
                    <td className="py-4 pr-4">{sites.length}</td>
                    <td className="py-4 pr-4">{summary.expectedReturnsCount}</td>
                    <td className="py-4 pr-4">{openNeeds.length}</td>
                    <td className="py-4 pr-4">{capacities.length}</td>
                    <td className="py-4 pr-4 font-bold">{tensions.length}</td>
                    <td className="py-4 pr-4">{summary.availableLotsCount} · {summary.availableLotWeightKg.toLocaleString("fr-FR")} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="border border-[var(--mb-neutral-200)] bg-white p-6">
            <SectionTitle eyebrow="Capacités prioritaires" title="Voir où l'offre de service ne couvre pas les besoins" />
            <div className="mt-5 space-y-4">
              {territories.map(({ territory, capacities, openNeeds }) => {
                const uncovered = openNeeds.filter((need) => {
                  const compatible = capacities.filter((capacity) => capacity.capacityType === need.needType);
                  const available = compatible.reduce((sum, capacity) => sum + capacity.availableQuantity, 0);
                  return available < need.requestedQuantity;
                });
                if (!uncovered.length) return null;
                return (
                  <div key={territory.id} className="border border-[var(--mb-neutral-200)] p-4">
                    <div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{territory.name}</p><p className="mt-1 text-xs text-[var(--mb-neutral-500)]">{uncovered.length} besoin(s) insuffisamment couvert(s)</p></div><span className="text-xs font-bold">Prioritaire</span></div>
                    <div className="mt-3 space-y-2">{uncovered.map((need) => <p key={need.id} className="text-sm capitalize">{need.needType.replaceAll("_", " ")} · {need.requestedQuantity} {need.unit} · priorité {need.priority}</p>)}</div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="border border-[var(--mb-neutral-200)] bg-white p-6">
            <SectionTitle eyebrow="Décisions institutionnelles" title="Transformer une tension en arbitrage explicite" />
            <div className="mt-5 space-y-4">
              {criticalAlerts.length ? criticalAlerts.map((tension) => {
                const territory = data.territories.find((item) => item.id === tension.territoryId);
                const commitments = data.commitments.filter((item) => item.tensionId === tension.id);
                return (
                  <div key={tension.id} className="border border-[var(--mb-neutral-200)] p-4">
                    <div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{tension.description}</p><p className="mt-1 text-xs text-[var(--mb-neutral-500)]">{territory?.name ?? tension.territoryId}</p></div><span className="text-xs font-bold uppercase">{tension.severity}</span></div>
                    <p className="mt-3 text-sm">{commitments.length} engagement(s) associé(s) · décideur de référence : {institution?.name ?? "non renseigné"}</p>
                  </div>
                );
              }) : <p className="text-sm text-[var(--mb-neutral-500)]">Aucun arbitrage critique requis.</p>}
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <ValueCard title="Valeur pour l'État" text="Une lecture consolidée des opérations sans reconstruire un système séparé du terrain." />
          <ValueCard title="Preuve de performance" text="Les résultats présentés sont reliés à des services, tensions, engagements et preuves enregistrés." />
          <ValueCard title="Modèle Mbàmbulaan" text="La lecture institutionnelle peut être monétisée comme licence, déploiement territorial, intégration et reporting de résultats." />
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">{eyebrow}</p><h2 className="mt-2 text-xl font-semibold">{title}</h2></div>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><p className="font-mono text-[9px] font-bold uppercase text-[var(--mb-neutral-500)]">{label}</p><p className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">{value}</p><p className="mt-2 text-xs leading-5 text-[var(--mb-neutral-500)]">{detail}</p></article>;
}

function ValueCard({ title, text }: { title: string; text: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><h3 className="text-lg font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>;
}
