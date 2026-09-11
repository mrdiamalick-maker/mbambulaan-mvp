import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Printer } from "lucide-react";
import { ResultTrendChart } from "@/components/etat/EtatDataVisualizations";
import { decisionTypeLabels, type Decision, type ProductState } from "@/domain/types";

function completedResultForDecision(state: ProductState, decision: Decision) {
  const coordination = decision.coordinationId
    ? state.coordinationSpaces.find((item) => item.id === decision.coordinationId)
    : undefined;
  return coordination?.commitments.find((item) => item.status === "terminee" && item.result)?.result;
}

export function EtatResultsOverview({ state, onPrint }: { state: ProductState; onPrint: () => void }) {
  const documentedDecisions = [...state.decisions]
    .map((decision) => ({ decision, result: completedResultForDecision(state, decision) }))
    .filter((row): row is { decision: Decision; result: string } => Boolean(row.result))
    .sort((a, b) => b.decision.decidedAt.localeCompare(a.decision.decidedAt));

  const resultCounts = new Map<string, number>();
  for (const { decision } of documentedDecisions) {
    const situation = state.situations.find((item) => item.id === decision.situationId);
    if (situation) resultCounts.set(situation.territoryId, (resultCounts.get(situation.territoryId) ?? 0) + 1);
  }
  const territoryRows = [...resultCounts.entries()]
    .map(([territoryId, count]) => ({ territory: state.territories.find((item) => item.id === territoryId), count }))
    .filter((row): row is { territory: ProductState["territories"][number]; count: number } => Boolean(row.territory))
    .sort((a, b) => b.count - a.count || a.territory.name.localeCompare(b.territory.name))
    .slice(0, 7);
  const maxTerritoryCount = Math.max(1, ...territoryRows.map((item) => item.count));
  const coveredTerritories = new Set(
    state.decisions
      .map((decision) => state.situations.find((item) => item.id === decision.situationId)?.territoryId)
      .filter(Boolean)
  ).size;

  const tableRows = documentedDecisions.slice(0, 6).map(({ decision, result }) => {
    const situation = state.situations.find((item) => item.id === decision.situationId);
    const territory = situation ? state.territories.find((item) => item.id === situation.territoryId) : undefined;
    const learning = situation ? state.learnings.find((item) => item.situationId === situation.id) : undefined;
    return { decision, result, situation, territory, learning };
  });
  const learningRows = state.learnings
    .filter((learning) => Boolean(learning.situationId || learning.initiativeId || learning.outcomeId || learning.fieldMissionId))
    .slice(0, 3);

  return (
    <section className="px-5 pb-2 pt-8 print:px-0 lg:px-8 lg:pt-10">
      <div className="flex flex-col gap-6 border-b border-[var(--etat-line)] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="etat-eyebrow">Résultats et redevabilité</p>
          {/* 32px Newsreader littéral (valeur exacte de l'écran `isRes` de
              la maquette) plutôt que l'échelle "registry" (clamp) — LOT
              V3.20 ("Résultats — copie conforme"). Le reste de la page
              (registre, méthode, chaîne décision → résultat) reste
              inchangé : ResultsAnalyticsOverview.tsx est un composant
              PARTAGÉ avec la Coordination (Chapitre 4 de
              PilotageWorkspace, mandat §22/§23 du LOT V3.6) — le
              reconstruire en entier ferait courir un risque de
              régression sur une 2e surface non revue dans ce lot, pour
              un contenu déjà substantiellement fidèle à l'esprit de la
              maquette (entonnoir de preuve, comparaison territoriale,
              tendance, "ce que ce graphique ne dit pas"). */}
          <h1 className="mt-3 max-w-[34ch] font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 32, lineHeight: 1.15, color: "var(--etat-navy)" }}>Qu’avons-nous décidé, fait, obtenu, appris&nbsp;?</h1>
          <p className="mt-4 max-w-[760px] text-[14px] leading-6 text-[var(--etat-stone-600)]">{state.decisions.length} décisions enregistrées, {documentedDecisions.length} résultats d’engagement renseignés, {coveredTerritories} territoires concernés — sans confondre décision prise, changement observé et impact non démontré.</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button onClick={onPrint} className="etat-btn etat-btn-outline"><Printer size={14} /> Version imprimable</button>
          <a href="#rapports-territoriaux" className="etat-btn etat-btn-primary">Rapports et registres <ArrowRight size={14} /></a>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border border-[var(--etat-line)] bg-white p-5 lg:p-6">
          <ResultTrendChart />
        </div>
        <div className="border border-[var(--etat-line)] bg-white p-5 lg:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[var(--etat-stone-600)]">Résultats documentés par territoire</p>
            <span className="text-[11px] text-[var(--etat-stone-400)]">{documentedDecisions.length} au total</span>
          </div>
          {territoryRows.length > 0 ? (
            <div className="mt-5 space-y-3.5">
              {territoryRows.map(({ territory, count }) => (
                <div key={territory.id}>
                  <div className="flex items-baseline justify-between gap-3 text-[12px]"><span className="font-semibold text-[var(--etat-navy)]">{territory.name}</span><span className="text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-mono)" }}>{count}</span></div>
                  <div className="mt-1.5 h-[5px] bg-[var(--etat-line)]"><div className="h-full bg-[var(--etat-terracotta)]" style={{ width: `${(count / maxTerritoryCount) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          ) : <p className="mt-5 text-xs leading-5 text-[var(--etat-stone-600)]">Aucun résultat d’engagement n’est encore documenté.</p>}
          <p className="mt-5 border-t border-[var(--etat-line)] pt-3 text-[10.5px] leading-4 text-[var(--etat-stone-600)]">Comptage réel des décisions dont un engagement de coordination est terminé avec un résultat renseigné.</p>
        </div>
      </div>

      <div className="etat-canvas-dark relative mt-5 grid min-h-[290px] overflow-hidden md:grid-cols-[minmax(0,1.35fr)_minmax(250px,.65fr)]">
        <div className="px-6 py-7 lg:px-9 lg:py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/60">Distinguer résultat, changement et impact</p>
          <h2 className="etat-display mt-4 max-w-[700px] text-[30px] leading-[1.12] text-white lg:text-[38px]">Ce que nous pouvons affirmer — et ce que nous ne pouvons pas.</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-[9.5px] font-semibold uppercase tracking-[.13em] text-white/60"><span className="mr-2 text-[#8FCB9B]">●</span>Résultat</p>
              <p className="etat-display mt-2 text-[34px] text-white">{documentedDecisions.length}</p>
              <p className="mt-2 text-[11px] leading-4 text-white/70">Engagement terminé avec un résultat renseigné. {state.results.length} entrée(s) existent dans le registre formel Résultat.</p>
            </div>
            <div>
              <p className="text-[9.5px] font-semibold uppercase tracking-[.13em] text-white/60"><span className="mr-2 text-[#E6A27A]">◐</span>Changement</p>
              <p className="etat-display mt-2 text-[34px] text-white">{state.outcomes.length}</p>
              <p className="mt-2 text-[11px] leading-4 text-white/70">Évolution observée, avec attribution explicitée.</p>
            </div>
            <div>
              <p className="text-[9.5px] font-semibold uppercase tracking-[.13em] text-white/60"><span className="mr-2">○</span>Impact</p>
              <p className="etat-display mt-2 text-[34px] text-white">{state.impactEvidences.length || "—"}</p>
              <p className="mt-2 text-[11px] leading-4 text-white/70">{state.impactEvidences.length ? "Effet attribué et documenté." : "Non démontré à ce stade."}</p>
            </div>
          </div>
        </div>
        <div className="relative min-h-[230px] border-t border-white/10 md:border-l md:border-t-0">
          <Image src="/images/etat-brief-decision-quai.webp" alt="" fill sizes="(min-width: 768px) 34vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(11,26,42,.75)] to-transparent" />
          <p className="absolute bottom-4 left-4 max-w-[230px] text-[10px] leading-4 text-white/70">Image de contexte territorial — non présentée comme preuve.</p>
        </div>
      </div>

      <div className="mt-8 border-t border-[var(--etat-line)] pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="etat-eyebrow">Chaîne de preuve</p>
            <h2 className="etat-display etat-h2 mt-3">De la décision au résultat, puis à l’apprentissage.</h2>
          </div>
          <Link href="/app/etat/redevabilite" className="etat-btn etat-btn-outline print:hidden">Ouvrir le registre complet <ArrowRight size={13} /></Link>
        </div>
        <div className="mt-5 overflow-x-auto border-y border-[var(--etat-line)]">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead><tr className="bg-[var(--etat-warm-white)] text-[9.5px] uppercase tracking-[.13em] text-[var(--etat-stone-400)]"><th className="px-4 py-3">Territoire · situation</th><th className="px-4 py-3">Décision</th><th className="px-4 py-3">Résultat renseigné</th><th className="px-4 py-3">Apprentissage</th></tr></thead>
            <tbody className="divide-y divide-[var(--etat-line)]">
              {tableRows.map(({ decision, result, situation, territory, learning }) => (
                <tr key={decision.id} className="align-top text-[11.5px] leading-5 text-[var(--etat-stone-600)]">
                  <td className="px-4 py-4"><p className="font-semibold text-[var(--etat-navy)]">{territory?.name ?? "Territoire non résolu"}</p><p>{situation?.title ?? decision.situationId}</p></td>
                  <td className="px-4 py-4"><p className="font-semibold text-[var(--etat-navy)]">{decisionTypeLabels[decision.type]}</p><p>{decision.rationale}</p></td>
                  <td className="px-4 py-4">{result}</td>
                  <td className="px-4 py-4">{learning ? <><p className="font-semibold text-[var(--etat-navy)]">{learning.title}</p><p>{learning.summary}</p></> : <span className="text-[var(--etat-stone-400)]">À documenter</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 grid gap-5 border-b border-[var(--etat-line)] pb-9 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="bg-[var(--etat-warm-white)] p-6">
          <p className="etat-eyebrow">Ce que nous apprenons</p>
          <div className="mt-4 divide-y divide-[var(--etat-line)]">
            {learningRows.map((learning) => <div key={learning.id} className="py-3.5 first:pt-0 last:pb-0"><p className="text-[13px] font-semibold text-[var(--etat-navy)]">{learning.title}</p><p className="mt-1 text-[11.5px] leading-5 text-[var(--etat-stone-600)]">{learning.summary}</p></div>)}
          </div>
        </div>
        <div className="border border-[var(--etat-line)] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[var(--etat-stone-600)]">Règle de lecture</p>
          <p className="mt-4 text-[12px] leading-5 text-[var(--etat-stone-600)]">Mbàmbulaan documente d’abord ce qui a été décidé et réalisé. Un changement reste qualifié avec son niveau de confiance. Aucun impact n’est revendiqué sans preuve et sans attribution défendable.</p>
          <a href="#methodologie" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--etat-terracotta)]">Voir la méthode de confiance <ArrowRight size={12} /></a>
        </div>
      </div>
    </section>
  );
}
