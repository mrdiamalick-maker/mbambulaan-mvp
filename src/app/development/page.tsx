import Link from "next/link";
import { domainRepository } from "@/domain/repositories";
import {
  getCommitmentsByTension,
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}

export default function DevelopmentPage() {
  const data = domainRepository.getData();
  const totalValue = data.outcomes.reduce((sum, item) => sum + (item.valueCreated ?? 0), 0);
  const protectedKg = data.outcomes.reduce((sum, item) => sum + (item.valueSavedKg ?? 0), 0);
  const openCommitments = data.commitments.filter((item) => !["completed", "cancelled"].includes(item.status));
  const overdueCommitments = openCommitments.filter((item) => Date.parse(item.dueAt) < Date.now());
  const programmeTerritories = data.territories.map((territory) => {
    const summary = getTerritoryOperationalSummary(data, territory.id, new Date().toISOString());
    const needs = getOpenServiceNeedsByTerritory(data, territory.id);
    const tensions = getOpenTensionsByTerritory(data, territory.id);
    const outcomes = data.outcomes.filter((outcome) => {
      if (outcome.relatedEntityType === "tension") {
        return tensions.some((tension) => tension.id === outcome.relatedEntityId);
      }
      if (outcome.relatedEntityType === "landing") {
        const landing = data.landings.find((item) => item.id === outcome.relatedEntityId);
        const site = data.landingSites.find((item) => item.id === landing?.landingSiteId);
        return site?.territoryId === territory.id;
      }
      return false;
    });
    return { territory, summary, needs, tensions, outcomes };
  });

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mb-ocean-400)]">Mbàmbulaan Development</p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Piloter des programmes à partir des opérations réelles</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">Les programmes de développement s'appuient sur les mêmes territoires, besoins, tensions, engagements et résultats que les équipes opérationnelles.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/government" className="border border-white/25 px-4 py-3 text-xs font-bold">Voir Government</Link>
              <Link href="/exploitation-mbambulaan" className="border border-white/25 px-4 py-3 text-xs font-bold">Voir l'exploitation</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Territoires couverts" value={String(data.territories.length)} detail="Lecture consolidée des opérations et résultats" />
          <Metric label="Engagements ouverts" value={String(openCommitments.length)} detail={`${overdueCommitments.length} en retard`} />
          <Metric label="Valeur créée" value={formatCurrency(totalValue)} detail="Résultats documentés dans le domaine" />
          <Metric label="Poids protégé" value={`${protectedKg.toLocaleString("fr-FR")} kg`} detail="Pertes évitées ou valeur préservée" />
        </section>

        <section className="mt-8 border border-[var(--mb-neutral-200)] bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Portefeuille territorial</p>
              <h2 className="mt-2 text-2xl font-semibold">Objectifs opérationnels, besoins et résultats</h2>
            </div>
            <p className="text-xs text-[var(--mb-neutral-500)]">Chaque carte représente une unité de pilotage fondée sur les données du terrain.</p>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {programmeTerritories.map(({ territory, summary, needs, tensions, outcomes }) => (
              <article key={territory.id} className="border border-[var(--mb-neutral-200)] p-5">
                <p className="text-xs font-bold uppercase text-[var(--mb-ocean-700)]">{territory.region}</p>
                <h3 className="mt-2 text-lg font-semibold">Programme territorial {territory.name}</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <Fact label="Retours suivis" value={String(summary.expectedReturnsCount)} />
                  <Fact label="Besoins ouverts" value={String(needs.length)} />
                  <Fact label="Tensions ouvertes" value={String(tensions.length)} />
                  <Fact label="Lots disponibles" value={`${summary.availableLotsCount} · ${summary.availableLotWeightKg.toLocaleString("fr-FR")} kg`} />
                  <Fact label="Résultats constatés" value={String(outcomes.length)} />
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,.75fr)]">
          <article className="border border-[var(--mb-neutral-200)] bg-white p-6">
            <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Mise en œuvre</p>
            <h2 className="mt-2 text-xl font-semibold">Interventions et engagements</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--mb-neutral-200)] text-xs uppercase text-[var(--mb-neutral-500)]">
                  <tr>{["Action", "Territoire", "Responsable", "Échéance", "Statut", "Tension associée"].map((header) => <th key={header} className="py-3 pr-4">{header}</th>)}</tr>
                </thead>
                <tbody>
                  {data.commitments.map((commitment) => {
                    const tension = data.tensions.find((item) => item.id === commitment.tensionId);
                    const territory = data.territories.find((item) => item.id === tension?.territoryId);
                    const actor = commitment.actorId ? data.actors.find((item) => item.id === commitment.actorId) : undefined;
                    const organization = commitment.organizationId ? data.organizations.find((item) => item.id === commitment.organizationId) : undefined;
                    return (
                      <tr key={commitment.id} className="border-b border-[var(--mb-neutral-100)] align-top">
                        <td className="py-4 pr-4 font-semibold">{commitment.action}</td>
                        <td className="py-4 pr-4">{territory?.name ?? "Non renseigné"}</td>
                        <td className="py-4 pr-4">{actor?.name ?? organization?.name ?? "Non attribué"}</td>
                        <td className="py-4 pr-4">{formatDate(commitment.dueAt)}</td>
                        <td className="py-4 pr-4 font-bold">{commitment.status}</td>
                        <td className="py-4 pr-4">{tension?.description ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="border border-[var(--mb-neutral-200)] bg-white p-6">
            <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Résultats constatés</p>
            <h2 className="mt-2 text-xl font-semibold">Ce que les interventions ont réellement produit</h2>
            <div className="mt-5 space-y-4">
              {data.outcomes.length ? data.outcomes.map((item) => (
                <div key={item.id} className="border-b border-[var(--mb-neutral-100)] pb-4">
                  <p className="text-sm font-semibold">{item.description}</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--mb-navy-900)]">{formatCurrency(item.valueCreated ?? 0)}</p>
                  <p className="mt-1 text-xs text-[var(--mb-neutral-500)]">{item.valueSavedKg?.toLocaleString("fr-FR") ?? 0} kg protégés · {item.evidence.length} preuve(s)</p>
                </div>
              )) : <p className="text-sm text-[var(--mb-neutral-500)]">Aucun résultat documenté.</p>}
            </div>
          </aside>
        </section>

        <section className="mt-6 border border-[var(--mb-neutral-200)] bg-white p-6">
          <p className="font-mono text-[10px] font-bold uppercase text-[var(--mb-ocean-600)]">Gouvernance du programme</p>
          <h2 className="mt-2 text-2xl font-semibold">Tensions à soumettre au prochain comité</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {data.tensions.filter((item) => item.status !== "resolved").map((item) => {
              const territory = data.territories.find((territory) => territory.id === item.territoryId);
              const commitments = getCommitmentsByTension(data, item.id);
              return (
                <article key={item.id} className="border border-[var(--mb-neutral-200)] p-5">
                  <p className="text-xs font-bold uppercase text-[var(--mb-ocean-700)]">{item.severity} · {item.status}</p>
                  <h3 className="mt-2 text-lg font-semibold">{item.description}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--mb-neutral-600)]">{territory?.name ?? item.territoryId} · {commitments.length} engagement(s) associé(s)</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <ValueCard title="Valeur pour le bailleur" text="Visibilité sur les interventions, engagements, retards et résultats réellement constatés." />
          <ValueCard title="Valeur pour l'unité de programme" text="Une base commune pour préparer les comités, arbitrer et coordonner les partenaires." />
          <ValueCard title="Revenu Mbàmbulaan" text="Pilotage de programme, intégration, reporting d'impact et accompagnement opérationnel peuvent être facturés sur une valeur vérifiable." />
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><p className="font-mono text-[9px] font-bold uppercase text-[var(--mb-neutral-500)]">{label}</p><p className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">{value}</p><p className="mt-2 text-xs leading-5 text-[var(--mb-neutral-500)]">{detail}</p></article>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-[var(--mb-neutral-100)] pb-2 last:border-0"><dt className="text-[10px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</dt><dd className="mt-1 font-semibold leading-5">{value}</dd></div>;
}

function ValueCard({ title, text }: { title: string; text: string }) {
  return <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><h3 className="text-lg font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>;
}
