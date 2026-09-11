"use client";

// LOT V3.6 ("Results / Analytics — National Performance, Accountability &
// Learning") — le "premier écran" analytique (mandat §2) : ce que la
// version texte/registre (EtatResultsOverview, redevabilite/page.tsx,
// PilotageWorkspace Chapitre 4 — tous préservés, jamais supprimés,
// mandat §13) ne pouvait pas offrir à elle seule — une lecture visuelle
// explorable, pas seulement lisible. Composant PARTAGÉ (mandat §22,
// "one shared analytical capability, permission-aware depth") : monté à
// l'identique par l'Espace État (/app/etat/rapport) et la Coordination
// (Chapitre 4 de PilotageWorkspace), toujours en shadcn-scope — même
// mécanisme que ProgrammeCockpit (V3.5) et le bloc portefeuille
// d'/app/etat/programmes (même lot) : StatusChip/ChartContainer sont
// calibrés pour le jeu de jetons shadcn générique, jamais réécrits en
// jetons --etat-*.
//
// Distinction non négociable (mandat §4) : les 4 tuiles ci-dessous
// comptent le registre CANONIQUE (Result/Outcome/ImpactEvidence/
// Learning, LOT 4) — jamais le comptage plus ancien "décisions avec un
// résultat renseigné en engagement" déjà affiché ailleurs (13 dans ce
// Demo World, cf. redevabilite/page.tsx) : les deux restent des
// définitions RÉELLES mais DIFFÉRENTES d'un "résultat", jamais fondues.
import { useMemo, useState } from "react";
import { Award, Compass, GraduationCap, Sparkles, Target } from "lucide-react";
import type { ProductState } from "@/domain/types";
import { attributionLevelLabels } from "@/domain/types";
import { trustLabels } from "@/lib/status-tokens";
import { ETAT_DEMO_SERIES_NOTICE, resultTrendDemo } from "@/domain/etat-presentation";
import {
  decisionResultLineage,
  evidenceMaturityBreakdown,
  programmeLinkedResultsWithoutDecision,
  programmeResultsDistribution,
  resultsKnowledgeGaps,
  territorialResultsDistribution,
  valueTrailFunnel
} from "@/domain/results-analytics";
import { BarMetricChart } from "@/components/private/BarMetricChart";
import { ResultsTrendChart } from "@/components/results/ResultsTrendChart";
import { StatusChip } from "@/components/private/primitives";

type Period = "3m" | "6m" | "all";
const periodOptions: { value: Period; label: string; months: number }[] = [
  { value: "3m", label: "3 mois", months: 3 },
  { value: "6m", label: "6 mois", months: 6 },
  { value: "all", label: "Depuis février", months: resultTrendDemo.length }
];

function Tile({ icon, dot, label, value, caption }: { icon: React.ReactNode; dot: string; label: string; value: number | string; caption: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><span style={{ color: dot }}>●</span>{label}</p>
      <p className="mt-2 flex items-center gap-2 text-2xl font-bold">{icon}{value}</p>
      <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">{caption}</p>
    </div>
  );
}

export function ResultsAnalyticsOverview({ state }: { state: ProductState }) {
  const [territoryFilter, setTerritoryFilter] = useState<string | null>(null);
  const [expandedInitiativeId, setExpandedInitiativeId] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("6m");

  const territorialDistribution = useMemo(() => territorialResultsDistribution(state), [state]);
  const programmeDistribution = useMemo(() => programmeResultsDistribution(state), [state]);
  const evidenceMaturity = useMemo(() => evidenceMaturityBreakdown(state), [state]);
  const knowledgeGaps = useMemo(() => resultsKnowledgeGaps(state), [state]);
  const programmeLinkedWithoutDecision = useMemo(() => programmeLinkedResultsWithoutDecision(state), [state]);
  const lineage = useMemo(() => decisionResultLineage(state), [state]);

  // Entonnoir de la Value Trail (mandat §5/§12) — filtré par territoire
  // sélectionné (mandat §10/§17, "territory bar → updates national
  // trend/context") : recalcul réel sur le sous-ensemble de situations
  // de ce territoire, jamais une simple mise en avant visuelle sans
  // changement de donnée sous-jacente.
  const scopedSituations = territoryFilter ? state.situations.filter((item) => item.territoryId === territoryFilter) : state.situations;
  const funnel = useMemo(() => valueTrailFunnel(state, scopedSituations), [state, scopedSituations]);
  const territoryName = territoryFilter ? state.territories.find((item) => item.id === territoryFilter)?.name : undefined;

  const activePeriod = periodOptions.find((item) => item.value === period)!;
  const trendData = resultTrendDemo.slice(-activePeriod.months).map((item) => ({ label: item.label, primary: item.qualificationMinutes, secondary: item.closedWithConfirmationPct }));

  const expandedInitiative = expandedInitiativeId ? state.initiatives.find((item) => item.id === expandedInitiativeId) : undefined;
  const expandedChain = expandedInitiative ? programmeDistribution.find((item) => item.initiativeId === expandedInitiative.id) : undefined;

  return (
    <section className="shadcn-scope space-y-6 rounded-lg border bg-background p-5 lg:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Analyse · résultats, changement, impact</p>
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight">Mesurer, comparer, apprendre — pas seulement lire.</h2>
        <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground">{state.results.length} résultat(s) documenté(s), {state.outcomes.length} changement(s) observé(s), {state.impactEvidences.length} impact(s) démontré(s), {state.learnings.length} apprentissage(s) — registre formel Résultat, distinct du registre de décisions plus large présenté plus bas.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile icon={<Target size={18} className="text-[#8FCB9B]" />} dot="#8FCB9B" label="Résultat" value={state.results.length} caption="Preuve enregistrée, reliée à une situation ou un programme." />
        <Tile icon={<Compass size={18} className="text-[#E6A27A]" />} dot="#E6A27A" label="Changement" value={state.outcomes.length} caption="Évolution observée, avec attribution explicite — jamais déduite." />
        <Tile icon={<Award size={18} className="text-[#1d4468]" />} dot="var(--foreground)" label="Impact" value={state.impactEvidences.length || "—"} caption={state.impactEvidences.length > 0 ? "Effet attribué et documenté." : "Non démontré à ce stade — aucun impact n'est revendiqué."} />
        <Tile icon={<GraduationCap size={18} className="text-[#1d4468]" />} dot="#1d4468" label="Apprentissage" value={state.learnings.length} caption="Ce que la coordination retient, réutilisable ailleurs." />
      </div>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Chaîne de la preuve — jusqu’où chaque situation est-elle allée ?</p>
          {territoryFilter && (
            <button onClick={() => setTerritoryFilter(null)} className="text-xs font-semibold text-[#1d4468] hover:underline">Réinitialiser · {territoryName}</button>
          )}
        </div>
        <BarMetricChart data={funnel.map((step) => ({ key: step.key, label: step.label, value: step.count }))} valueLabel="situation(s)" height={170} />
        <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{scopedSituations.length} situation(s) sur ce périmètre. Chaque étape compte les situations qui l’ont réellement atteinte (Signal → Compréhension → Décision → Engagement → Résultat → Changement → Impact → Apprentissage) — une baisse entre deux étapes est honnête, jamais masquée.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Résultats documentés par territoire</p>
          {territorialDistribution.length > 0 ? (
            <BarMetricChart
              data={territorialDistribution.slice(0, 8).map((row) => ({ key: row.territoryId, label: row.territoryName, value: row.results }))}
              valueLabel="résultat(s)"
              onSelect={(key) => setTerritoryFilter((current) => (current === key ? null : key))}
              selectedKey={territoryFilter ?? undefined}
            />
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Aucun résultat canonique documenté par territoire pour le moment.</p>
          )}
          <p className="mt-2 text-[11px] leading-4 text-muted-foreground">Cliquer une barre filtre la chaîne de preuve ci-dessus sur ce territoire.</p>
        </div>

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Évolution de deux indicateurs suivis</p>
            <div className="flex gap-1 rounded-md border bg-muted p-0.5">
              {periodOptions.map((option) => (
                <button key={option.value} onClick={() => setPeriod(option.value)} className={`rounded-sm px-2 py-1 text-[11px] font-medium transition ${period === option.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{option.label}</button>
              ))}
            </div>
          </div>
          <ResultsTrendChart data={trendData} primaryUnit="min" secondaryUnit="%" />
          <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{ETAT_DEMO_SERIES_NOTICE} Aucune causalité n’est affirmée entre les deux courbes.</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Résultats par programme</p>
        {programmeDistribution.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aucun programme ne porte encore de résultat canonique documenté.</p>
        ) : (
          <div className="mt-3 divide-y rounded-lg border">
            {programmeDistribution.map((row) => (
              <div key={row.initiativeId}>
                <button onClick={() => setExpandedInitiativeId((current) => (current === row.initiativeId ? null : row.initiativeId))} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/50">
                  <span className="min-w-0 truncate text-sm font-semibold">{row.title}</span>
                  <span className="flex shrink-0 gap-3 text-xs text-muted-foreground">
                    <span>{row.results} résultat(s)</span><span>{row.outcomes} changement(s)</span><span>{row.impacts} impact(s)</span>
                  </span>
                </button>
                {expandedInitiativeId === row.initiativeId && expandedChain && (
                  <div className="space-y-2 border-t bg-muted/30 px-4 py-3 text-xs leading-5 text-muted-foreground">
                    {state.results.filter((item) => item.sourceRef.objectType === "initiative" && item.sourceRef.objectId === row.initiativeId).map((result) => (
                      <p key={result.id}><span className="font-semibold text-foreground">Résultat · </span>{result.title}</p>
                    ))}
                    {state.outcomes.filter((outcome) => outcome.sourceResultIds.some((id) => state.results.some((r) => r.id === id && r.sourceRef.objectId === row.initiativeId))).map((outcome) => (
                      <p key={outcome.id}><span className="font-semibold text-foreground">Changement · </span>{outcome.statement} ({attributionLevelLabels[outcome.attribution].toLowerCase()})</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {programmeLinkedWithoutDecision.length > 0 && (
          <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{programmeLinkedWithoutDecision.length} résultat(s) canonique(s) relié(s) à un programme, sans lien vers une décision de situation — lignage honnête, pas une omission (voir « décision → résultat » ci-dessous).</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Maturité de la preuve</p>
          {evidenceMaturity.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Aucune preuve canonique à classer pour le moment.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {evidenceMaturity.map((bucket) => (
                <StatusChip key={bucket.trust} tone="neutral">{trustLabels[bucket.trust]} · {bucket.results + bucket.outcomes}</StatusChip>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ce qui reste non prouvé</p>
          <ul className="mt-3 space-y-1.5 text-xs leading-5 text-muted-foreground">
            <li>· {knowledgeGaps.situationsWithoutCanonicalResult} situation(s) réglée(s) sans résultat canonique enregistré.</li>
            <li>· {knowledgeGaps.outcomesWithoutImpact} changement(s) observé(s) sans impact démontré.</li>
            {knowledgeGaps.learningsWithoutSource > 0 && <li>· {knowledgeGaps.learningsWithoutSource} apprentissage(s) sans source réelle rattachée.</li>}
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-dashed p-4">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><Sparkles size={13} /> Ce que ce graphique ne dit pas</p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">L’historique réel de Result/Outcome/Impact reste trop court pour une série temporelle authentique (les dates réelles se concentrent sur 1 à 2 jours dans cette démonstration) — l’évolution ci-dessus reste une série illustrative. La chaîne décision → résultat ci-dessous ({lineage.filter((row) => row.canonicalResult).length} décision(s) sur {lineage.length} relient déjà un résultat canonique) reste incomplète par nature, jamais complétée artificiellement.</p>
      </div>
    </section>
  );
}
