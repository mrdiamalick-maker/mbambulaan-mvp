import Link from "next/link";
import { AtlasConsole } from "@/components/atlas/AtlasConsole";
import { domainRepository } from "@/domain/repositories";

export default function AtlasPage() {
  const data = domainRepository.getData();
  const openTensions = data.tensions.filter((item) => item.status !== "resolved" && item.status !== "cancelled");
  const openCommitments = data.commitments.filter((item) => item.status !== "completed" && item.status !== "cancelled");
  const availableCapacity = data.capacities.reduce((sum, item) => sum + (item.status === "available" || item.status === "partially_available" ? item.availableQuantity : 0), 0);
  const valueCreated = data.outcomes.reduce((sum, item) => sum + (item.valueCreated ?? 0), 0);
  const valueSavedKg = data.outcomes.reduce((sum, item) => sum + (item.valueSavedKg ?? 0), 0);

  const territoryBriefs = data.territories.map((territory) => {
    const tensions = openTensions.filter((item) => item.territoryId === territory.id);
    const capacities = data.capacities.filter((item) => item.territoryId === territory.id);
    const sites = data.landingSites.filter((item) => item.territoryId === territory.id);
    const returns = data.expectedReturns.filter((item) => {
      const site = data.landingSites.find((landingSite) => landingSite.id === item.expectedLandingSiteId);
      return site?.territoryId === territory.id;
    });
    const commitments = openCommitments.filter((commitment) => tensions.some((tension) => tension.id === commitment.tensionId));
    return { territory, tensions, capacities, sites, returns, commitments };
  });

  return (
    <>
      <div className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Link href="/" className="text-sm font-semibold text-[var(--mb-navy-900)]">Mbàmbulaan</Link>
          <nav className="flex flex-wrap items-center gap-4 text-xs font-bold text-[var(--mb-neutral-600)]">
            <Link href="/operations/retours">Opérations</Link>
            <Link href="/coordination-services">Coordination</Link>
            <Link href="/government">Government</Link>
            <Link href="/development">Development</Link>
            <Link href="/atlas" className="text-[var(--mb-ocean-600)]">Atlas</Link>
          </nav>
        </div>
      </div>

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="Tensions ouvertes" value={String(openTensions.length)} />
            <Metric label="Engagements ouverts" value={String(openCommitments.length)} />
            <Metric label="Capacité disponible" value={availableCapacity.toLocaleString("fr-FR")} />
            <Metric label="Valeur créée" value={new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(valueCreated)} />
            <Metric label="Poids protégé" value={`${valueSavedKg.toLocaleString("fr-FR")} kg`} />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]">
                <tr>{["Territoire", "Sites", "Retours", "Capacités", "Tensions", "Engagements"].map((header) => <th key={header} className="py-3 pr-4">{header}</th>)}</tr>
              </thead>
              <tbody>
                {territoryBriefs.map(({ territory, sites, returns, capacities, tensions, commitments }) => (
                  <tr key={territory.id} className="border-b border-[var(--mb-neutral-100)]">
                    <td className="py-4 pr-4 font-semibold">{territory.name}</td>
                    <td className="py-4 pr-4">{sites.length}</td>
                    <td className="py-4 pr-4">{returns.length}</td>
                    <td className="py-4 pr-4">{capacities.length}</td>
                    <td className="py-4 pr-4 font-bold">{tensions.length}</td>
                    <td className="py-4 pr-4">{commitments.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <AtlasConsole />
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-50)] p-4"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-xl font-semibold text-[var(--mb-navy-900)]">{value}</p></article>;
}
