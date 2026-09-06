"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Drawer } from "@/components/etat/Drawer";
import { EtatRegistryHeader } from "@/components/etat/EtatRegistryHeader";
import { DecisionIcon } from "@/components/etat/MotifIcons";
import { Mission, MissionForm, SituationDetail, glyphBorderColor, priorityToTag } from "@/components/etat/shared";
import { attributionLevelLabels, decisionTypeLabels, type Decision, type Situation } from "@/domain/types";
import { outcomesForResults, resultsForSituation } from "@/domain/situation-narrative";
import { KnowledgeState } from "@/components/foundations";

// Registre complet "Décisions exécutées & résultats observés" — extrait de
// /app/etat (mandat "Brief national", navigation par page, 2026-08-26).
// Contenu et logique IDENTIQUES au chapitre "redevabilite" qui vivait sur
// /app/etat jusqu'ici, à une différence assumée près : le plafond de 5
// décisions (recentDecisions.slice(0, 5), pertinent pour un aperçu sur la
// même page que le reste) est retiré ici — le but explicite d'une page
// dédiée "registre complet" est de montrer TOUT ce qui correspond au
// filtre, pas un extrait. Périmètre (territoire) : état local à cette
// page, même remarque que /app/etat/arbitrages et /app/etat/programmes.
export default function RedevabilitePage() {
  const { state } = useProduct();
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [situationDrawer, setSituationDrawer] = useState<Situation | null>(null);
  const [missionDrawer, setMissionDrawer] = useState<Mission | null>(null);

  if (!state) return null;

  const decisions = [...state.decisions]
    .filter((item) => {
      if (!selectedTerritoryId) return true;
      const linkedSituation = state.situations.find((situation) => situation.id === item.situationId);
      return linkedSituation?.territoryId === selectedTerritoryId;
    })
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime());
  const documentedResultCount = decisions.filter((decision) => {
    const coordination = decision.coordinationId ? state.coordinationSpaces.find((item) => item.id === decision.coordinationId) : undefined;
    return (coordination?.commitments ?? []).some((item) => item.status === "terminee" && item.result);
  }).length;
  const coveredTerritoriesCount = new Set(decisions.map((decision) => state.situations.find((item) => item.id === decision.situationId)?.territoryId).filter(Boolean)).size;
  const latestDecisionAt = decisions[0]?.decidedAt;

  // P2.DESIGN-1B.2 (mandat §2 — "compléter la personnalité analytique") :
  // la maquette V2 place ici un graphique de tendance temporelle
  // ("Évolution de deux indicateurs suivis", février → septembre). Vérifié
  // au Lot 1B.1 puis reconfirmé ici : decidedAt/recordedAt valent
  // quasi-tous `now` dans le Demo World actuel — aucune série temporelle
  // réelle n'existe pour tracer une courbe honnête. Plutôt qu'une valeur
  // fabriquée, ce panneau est remplacé par une structure analytique
  // authentique et de poids visuel équivalent : la chaîne
  // décision → apprentissage documenté.
  //
  // "Résultat" ici reprend EXACTEMENT la même définition que
  // documentedResultCount ci-dessus (engagement de coordination clos avec
  // un résultat renseigné) — pas l'entité Result canonique
  // (state.results), qui ne compte qu'1 entrée dans ce Demo World, toute
  // rattachée à un programme et non à une situation
  // (resultsForSituation ne renverrait donc jamais rien ici). Utiliser
  // deux définitions différentes de "résultat documenté" sur la même page
  // contredirait le "13" déjà affiché plus haut — jamais acceptable.
  const coordinationSpaces = state.coordinationSpaces;
  function decisionHasDocumentedResult(decision: Decision): boolean {
    const coordination = decision.coordinationId ? coordinationSpaces.find((item) => item.id === decision.coordinationId) : undefined;
    return (coordination?.commitments ?? []).some((item) => item.status === "terminee" && item.result);
  }
  const learningRows = state.learnings
    .map((learning) => {
      const situation = learning.situationId ? state.situations.find((item) => item.id === learning.situationId) : undefined;
      const territory = situation ? state.territories.find((item) => item.id === situation.territoryId) : undefined;
      const linkedDecision = situation ? state.decisions.find((item) => item.situationId === situation.id) : undefined;
      const hasDocumentedResult = linkedDecision ? decisionHasDocumentedResult(linkedDecision) : false;
      return { learning, situation, territory, linkedDecision, hasDocumentedResult };
    })
    // Seuls les apprentissages qui remontent jusqu'à une décision réelle
    // illustrent la chaîne demandée — les autres apprentissages restent
    // réels mais isolés (aucune décision ne les référence encore).
    .filter((row) => Boolean(row.linkedDecision))
    .slice(0, 4);

  // "Résultats documentés par territoire" (V2, colonne fixe 360px) :
  // même définition que documentedResultCount, agrégée par territoire via
  // Decision.situationId → Situation.territoryId.
  const resultsByTerritory = new Map<string, number>();
  for (const decision of state.decisions) {
    if (!decisionHasDocumentedResult(decision)) continue;
    const situation = state.situations.find((item) => item.id === decision.situationId);
    if (!situation) continue;
    resultsByTerritory.set(situation.territoryId, (resultsByTerritory.get(situation.territoryId) ?? 0) + 1);
  }
  const territoryResultRows = [...resultsByTerritory.entries()]
    .map(([territoryId, count]) => ({ territory: state.territories.find((item) => item.id === territoryId), count }))
    .filter((row): row is { territory: NonNullable<typeof row.territory>; count: number } => Boolean(row.territory))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const maxTerritoryResults = territoryResultRows[0]?.count ?? 0;

  return (
    <div className="px-6 pb-16 pt-8 lg:px-[60px] lg:pt-10">
      <EtatRegistryHeader
        eyebrow="Décisions exécutées & résultats observés — registre complet"
        title="Rendre chaque décision traçable jusqu’au résultat."
        description={<>{decisions.length} décision(s){selectedTerritoryId ? " sur ce territoire" : " enregistrée(s) au total"}. Ce registre relie arbitrage, acteur mobilisé et résultat documenté sans confondre décision prise et effet effectivement observé.</>}
        metrics={[
          { label: "Décisions enregistrées", value: decisions.length },
          { label: "Résultats documentés", value: documentedResultCount, detail: `${decisions.length - documentedResultCount} encore en cours`, tone: documentedResultCount > 0 ? "positive" : "neutral" },
          { label: "Territoires concernés", value: coveredTerritoriesCount },
          { label: "Dernière décision", value: latestDecisionAt ? new Date(latestDecisionAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—", detail: latestDecisionAt ? new Date(latestDecisionAt).toLocaleDateString("fr-FR", { year: "numeric" }) : "Aucune décision" }
        ]}
      >
        <label className="block">
          <p className="etat-filter-label">Périmètre</p>
          <select
            value={selectedTerritoryId ?? ""}
            onChange={(event) => setSelectedTerritoryId(event.target.value || null)}
            className="etat-filter-select"
          >
            <option value="">Sénégal entier</option>
            {[...state.territories].sort((a, b) => a.name.localeCompare(b.name)).map((territory) => (
              <option key={territory.id} value={territory.id}>{territory.name}</option>
            ))}
          </select>
        </label>
        {/* XXL-R2 (§18) — lien réciproque vers Rapport (nav "Résultats") :
            ce registre reste une sous-profondeur, jamais une 6e
            destination concurrente — il pointe explicitement vers la
            lecture complète plutôt que de prétendre l'égaler. */}
        <Link href="/app/etat/rapport" className="etat-btn etat-btn-outline self-end">Voir le rapport complet</Link>
      </EtatRegistryHeader>

      {/* P2.DESIGN-1B.2 (mandat §2) : rangée analytique à 2 colonnes, même
          poids visuel que le graphique de tendance de la maquette V2 mais
          construite uniquement à partir de données réelles et
          défendables — jamais une série temporelle fabriquée (cf.
          commentaire sur learningRows ci-dessus). */}
      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-stretch">
        <div className="min-w-0 flex-1 border border-[var(--etat-line)] bg-white p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[var(--etat-stone-600)]">Décision → apprentissage documenté</p>
            <p className="text-[11px] text-[var(--etat-stone-400)]">{state.learnings.length} apprentissage(s) documenté(s) au total</p>
          </div>
          {learningRows.length === 0 ? (
            <p className="mt-4 text-[12.5px] leading-[1.6] text-[var(--etat-stone-600)]">Aucun apprentissage ne peut être relié à une décision documentée pour le moment.</p>
          ) : (
            <div className="mt-4 divide-y divide-[var(--etat-line)]">
              {learningRows.map(({ learning, situation, territory, hasDocumentedResult }) => (
                <div key={learning.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-mono)" }}>
                    {situation && <span>{situation.title}</span>}
                    {territory && <span>· {territory.name}</span>}
                    {hasDocumentedResult && <span className="etat-tag etat-tag--reel">Résultat documenté</span>}
                  </div>
                  <p className="mt-1 text-[13.5px] font-semibold leading-[1.4] text-[var(--etat-navy-950)]">{learning.title}</p>
                  <p className="mt-1 text-[12px] leading-[1.55] text-[var(--etat-stone-600)]">{learning.summary}</p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 border-t border-[var(--etat-line)] pt-3 text-[11px] leading-[1.6] text-[var(--etat-stone-600)]">Un apprentissage n’est retenu ici que s’il remonte jusqu’à une décision documentée — les autres apprentissages réels restent consultables situation par situation. « Résultat documenté » repère les décisions dont l’engagement de coordination est clos avec un résultat renseigné.</p>
        </div>
        <div className="w-full shrink-0 border border-[var(--etat-line)] bg-white p-6 lg:w-[360px]">
          <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[var(--etat-stone-600)]">Résultats documentés par territoire</p>
          {territoryResultRows.length === 0 ? (
            <p className="mt-4 text-[12.5px] leading-[1.6] text-[var(--etat-stone-600)]">Aucun résultat documenté pour le moment.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {territoryResultRows.map(({ territory, count }) => (
                <div key={territory.id}>
                  <div className="flex items-baseline justify-between text-[12px]"><span className="text-[var(--etat-navy)]">{territory.name}</span><span style={{ fontFamily: "var(--etat-font-mono)", color: "var(--etat-stone-400)" }}>{count}</span></div>
                  <div className="mt-1.5 h-[7px] w-full bg-[var(--etat-line)]"><div className="h-[7px]" style={{ width: `${maxTerritoryResults > 0 ? (count / maxTerritoryResults) * 100 : 0}%`, background: glyphBorderColor[territory.activity] }} /></div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 border-t border-[var(--etat-line)] pt-3 text-[11px] leading-[1.6] text-[var(--etat-stone-600)]">Seuls les résultats accompagnés d’une preuve enregistrée sont comptés ; un résultat couvrant plusieurs territoires compte une fois pour chacun.</p>
        </div>
      </div>

      {/* P2.DESIGN-1B (mandat §13, "Distinguer résultat, changement et
          impact") : bandeau agrégé, 3 vraies collections du domaine
          (state.results/outcomes/impactEvidences — jamais un Result
          reclassé en Outcome ou un Outcome présenté comme un Impact).
          Aucun impact n'est affirmé du seul fait qu'un résultat existe :
          si impactEvidences est vide, le "—" reste honnête, exactement
          comme le prototype fourni. */}
      <div className="etat-canvas-dark mt-5 flex flex-col overflow-hidden sm:flex-row">
        <div className="flex-1 border-b border-[rgba(247,243,233,.14)] p-6 sm:border-b-0 sm:border-r">
          <p className="flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[.14em]" style={{ color: "rgba(255,253,247,.72)", fontFamily: "var(--etat-font-body)" }}><span style={{ color: "#8FCB9B" }}>●</span>Résultat documenté</p>
          <p className="etat-display mt-2.5 text-[30px] not-italic" style={{ color: "var(--etat-cream)" }}>{state.results.length}</p>
          <p className="mt-2 text-[11.5px] leading-[1.55]" style={{ color: "rgba(255,253,247,.78)" }}>Preuve enregistrée et validée par un coordinateur.</p>
        </div>
        <div className="flex-1 border-b border-[rgba(247,243,233,.14)] p-6 sm:border-b-0 sm:border-r">
          <p className="flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[.14em]" style={{ color: "rgba(255,253,247,.72)", fontFamily: "var(--etat-font-body)" }}><span style={{ color: "#E6A27A" }}>◐</span>Changement observé</p>
          <p className="etat-display mt-2.5 text-[30px] not-italic" style={{ color: "var(--etat-cream)" }}>{state.outcomes.length}</p>
          <p className="mt-2 text-[11.5px] leading-[1.55]" style={{ color: "rgba(255,253,247,.78)" }}>Mesuré sur le terrain, sans attribution établie.</p>
        </div>
        <div className="flex-1 p-6">
          <p className="flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[.14em]" style={{ color: "rgba(255,253,247,.72)", fontFamily: "var(--etat-font-body)" }}><span style={{ color: "var(--etat-cream)" }}>○</span>Impact</p>
          <p className="etat-display mt-2.5 text-[30px] not-italic" style={{ color: "var(--etat-cream)" }}>{state.impactEvidences.length > 0 ? state.impactEvidences.length : "—"}</p>
          <p className="mt-2 text-[11.5px] leading-[1.55]" style={{ color: "rgba(255,253,247,.78)" }}>{state.impactEvidences.length > 0 ? "Constaté avec attribution documentée." : "Non démontré à ce stade. Aucun impact n’est revendiqué."}</p>
        </div>
      </div>
      {/* P2.DESIGN-1B.1 (mandat §11, §15) — l'image "contexte Résultats"
          fournie a été volontairement écartée de cette bande après
          vérification : sa composition met en scène une "Fiche territoire"
          reprenant le même logo Mbàmbulaan avec des chiffres fabriqués
          ("Signalements 24 / Actions en cours 6 / Résultats documentés 13")
          qui se lisent comme des données produit alors qu'ils n'en sont
          pas. Aucun recadrage testé n'a permis de l'utiliser sans soit
          exposer ces chiffres à côté du vrai compteur ci-dessus (risque de
          confusion explicitement interdit par le mandat), soit produire un
          cadrage illisible. Conformément à la hiérarchie d'autorité (§15,
          données réelles > images fournies), l'image n'est pas intégrée
          ici plutôt que forcée. */}
      {/* P2.DESIGN-1B.2 (mandat §2) : légende de désambiguïsation, ajoutée
          après avoir rapproché "Résultat documenté" (bande sombre, 1 —
          entité Result canonique, avec preuve typée et réutilisable) de
          "13 résultats documentés" (en-tête et panneau ci-dessus —
          décisions dont l'engagement de coordination est clos avec un
          résultat renseigné, une preuve moins structurée mais réelle).
          Les deux existaient déjà séparément avant ce lot ; les rapprocher
          sans le dire aurait pu se lire comme une contradiction. */}
      <p className="mt-2 text-[11px] leading-[1.6] text-[var(--etat-stone-400)]">Deux comptages distincts, jamais interchangeables : le « 1 » ci-dessus compte les preuves formelles du registre Résultat ; le « 13 » cité plus haut compte les décisions dont l’engagement de coordination est clos avec un résultat renseigné.</p>

      <div className="etat-panel mt-5 p-6 lg:p-7">
      {decisions.length === 0 ? (
        <p className="text-sm text-[var(--etat-stone-600)]">Aucune décision enregistrée pour le moment.</p>
      ) : (
        <div className="relative ml-5 border-l border-[var(--etat-line)] pl-7">
          {decisions.map((decision, index) => {
            const situation = state.situations.find((item) => item.id === decision.situationId);
            const territory = situation ? state.territories.find((item) => item.id === situation.territoryId) : undefined;
            const decider = state.actors.find((item) => item.id === decision.decidedByActorId);
            const coordination = decision.coordinationId ? state.coordinationSpaces.find((item) => item.id === decision.coordinationId) : undefined;
            const completedCommitments = (coordination?.commitments ?? []).filter((item) => item.status === "terminee" && item.result);
            // LOT 4 (mandat "de l'action à la valeur démontrable", §18) —
            // "engagements → résultats → effets → limites → preuves" :
            // Result canonique, puis Outcome documenté séparément (jamais
            // déduit automatiquement d'un indicateur ou d'un Result).
            const situationResults = situation ? resultsForSituation(state, situation) : [];
            const situationOutcome = outcomesForResults(state, situationResults.map((item) => item.id))[0];
            return (
              <div key={decision.id} className={index === decisions.length - 1 ? "relative pb-1" : "relative border-b border-[var(--etat-line)] pb-6 mb-6"}>
                <span className="absolute -left-[47px] top-0 grid size-10 place-items-center rounded-full" style={{ backgroundColor: "var(--etat-navy-600)" }}><DecisionIcon size={20} color="var(--etat-offwhite)" /></span>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--etat-navy-950)]">{decisionTypeLabels[decision.type]}{situation ? ` · ${territory?.name ?? situation.territoryId}` : ""}</p>
                      <span className={`etat-tag ${completedCommitments.length > 0 ? "etat-tag--reel" : "etat-tag--stable"}`}>{completedCommitments.length > 0 ? "Résultat documenté" : "En cours"}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[var(--etat-stone-600)]">{decision.rationale}</p>
                    <p className="mt-1.5 text-[11px] text-[var(--etat-stone-400)]">{new Date(decision.decidedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}{decider ? ` · ${decider.name}` : ""}</p>
                    {completedCommitments.length > 0 && (
                      <div className="mt-2.5 space-y-1 border-t border-[var(--etat-line)] pt-2.5">
                        {completedCommitments.slice(0, 2).map((commitment) => {
                          const mobilizedActor = state.actors.find((item) => item.id === commitment.actorId);
                          return (
                            <p key={commitment.id} className="text-[11px] leading-4 text-[var(--etat-stone-600)]"><span className="font-bold text-[var(--etat-navy-950)]">Acteur mobilisé · </span>{mobilizedActor?.name ?? commitment.actorId} <span className="font-bold text-[var(--etat-navy-950)]">· Résultat · </span>{commitment.result}</p>
                          );
                        })}
                      </div>
                    )}
                    {situationResults.length > 0 && (
                      <div className="mt-2 border-t border-[var(--etat-line)] pt-2">
                        {situationOutcome ? (
                          <p className="text-[11px] leading-4 text-[var(--etat-stone-600)]">
                            <span className="font-bold text-[var(--etat-navy-950)]">Effet observé · </span>{situationOutcome.statement}
                            <span className="text-[var(--etat-stone-400)]"> ({attributionLevelLabels[situationOutcome.attribution].toLowerCase()})</span>
                          </p>
                        ) : (
                          // XXL-R2 (§17, §26) — "Impact à mesurer" traité
                          // comme une limite de connaissance honnête
                          // (KnowledgeState), pas comme une ligne grise
                          // anonyme parmi d'autres.
                          <KnowledgeState level="a_verifier">Impact non encore mesuré</KnowledgeState>
                        )}
                      </div>
                    )}
                  </div>
                  {situation && <button className="etat-btn etat-btn-outline" style={{ minHeight: 32, padding: "5px 12px", fontSize: 12 }} onClick={() => setSituationDrawer(situation)}>Voir la situation <ArrowRight size={13} /></button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      <Drawer open={!!situationDrawer} onClose={() => setSituationDrawer(null)} eyebrow="Situation" title={situationDrawer?.title ?? ""} size="lg">
        {situationDrawer && <SituationDetail situation={situationDrawer} state={state} onPlanVisit={() => { const territory = state.territories.find((item) => item.id === situationDrawer.territoryId); setSituationDrawer(null); setMissionDrawer({ key: `situation-${situationDrawer.id}`, territoryId: situationDrawer.territoryId, territoryLabel: territory?.name ?? situationDrawer.territoryId, raison: situationDrawer.title, action: situationDrawer.nextStep, glyphStatus: priorityToTag[situationDrawer.priority], suggestedObjective: "verification_vigilance" }); }} />}
      </Drawer>
      <Drawer open={!!missionDrawer} onClose={() => setMissionDrawer(null)} eyebrow="Terrain" title="Planifier la mission">
        {missionDrawer && <MissionForm mission={missionDrawer} onDone={() => setMissionDrawer(null)} />}
      </Drawer>
    </div>
  );
}
