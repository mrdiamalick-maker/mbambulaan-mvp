"use client";

import { useState } from "react";
import Image from "next/image";
import { useProduct } from "@/components/providers/ProductProvider";
import { EtatRegistryHeader } from "@/components/etat/EtatRegistryHeader";
import {
  formatFcfa,
  fundingStatusLabel,
  fundingTagClass,
  indicatorProgress,
  initiativeStatusLabel
} from "@/components/etat/shared";
import type { Initiative, ProductState } from "@/domain/types";
import { EditorialSection } from "@/components/foundations";

// XXL-R2 (§15 du mandat) — "quels programmes sont en cadrage/exécution ?"
// lu depuis le vrai statut du modèle, jamais une "priorité" inventée sans
// champ qui la porte (§35, pas de nouvelle donnée fictive) : la tierce
// "PROGRAMMES PRIORITAIRES" du mandat n'est donc pas reproduite ici — un
// classement prioritaire ne se laisse pas dériver honnêtement d'Initiative
// aujourd'hui. Les deux tiers réellement portées par Initiative.status le
// sont : cadrage/financee = encore en conception, execution = en cours ;
// terminee reste montré séparément (peu nombreux, mais réel).
const programmeGroups: { key: "execution" | "conception" | "terminee"; title: string; statuses: Initiative["status"][] }[] = [
  { key: "execution", title: "En exécution", statuses: ["execution"] },
  { key: "conception", title: "En conception", statuses: ["cadrage", "financee"] },
  { key: "terminee", title: "Terminés", statuses: ["terminee"] }
];

// P2.DESIGN-1A (§10, signature de confiance) — Initiative.budgetStatus est
// un champ réel du Core (domain/types.ts), déjà affiché dans le Pro
// (app/(coordination)/initiatives/page.tsx, budgetStatusCaption) mais
// jamais montré côté État jusqu'ici : le seul montant sans distinction
// "à estimer/estimé/simulé" laisse croire à une précision budgétaire
// souvent non garantie. Même 3 libellés que le Pro, pas un second
// vocabulaire inventé pour cette page.
const budgetStatusCaption: Record<Initiative["budgetStatus"], string> = {
  a_estimer: "budget non encore chiffré",
  estime: "budget estimé, à confirmer",
  valide: "budget simulé à titre indicatif"
};

// XXL-R2 — carte programme extraite en composant propre (inchangée dans
// son contenu) pour être réutilisable à la fois en liste plate (un statut
// filtré) et groupée par tiers réels (§15, filtre "Tous les statuts").
function ProgrammeCard({ programme, state }: { programme: Initiative; state: ProductState }) {
  const owner = state.actors.find((item) => item.id === programme.ownerId);
  const territoryNames = programme.territoryIds.map((id) => state.territories.find((item) => item.id === id)?.name ?? id);
  const confirmed = programme.funding.filter((item) => item.status === "confirme").reduce((sum, item) => sum + item.amountFcfa, 0);
  const totalFunding = programme.funding.reduce((sum, item) => sum + item.amountFcfa, 0);
  const linkedDueDates = programme.situationIds
    .map((id) => state.situations.find((item) => item.id === id)?.dueAt)
    .filter((value): value is string => Boolean(value))
    .sort();
  const nextDeadline = linkedDueDates[0];
  const indicatorsAvgProgress = programme.indicators.length > 0
    ? Math.round(programme.indicators.reduce((sum, indicator) => sum + indicatorProgress(indicator), 0) / programme.indicators.length)
    : null;
  return (
    <div className="etat-panel--warm p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="etat-h3 text-base">{programme.title}</p>
          <p className="mt-1 text-xs text-[var(--etat-stone-600)]">{programme.objective}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{territoryNames.map((name) => <span key={name} className="etat-tag etat-tag--stable">{name}</span>)}</div>
        </div>
        <span className="etat-tag etat-tag--stable shrink-0">{initiativeStatusLabel[programme.status]}</span>
      </div>

      <div className="mt-4 grid gap-3 border-t border-[var(--etat-line)] pt-4 sm:grid-cols-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">Responsable</p>
          <p className="mt-1 text-xs font-semibold text-[var(--etat-navy-950)]">{owner?.name ?? "Non désigné"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">Budget / financement</p>
          <p className="mt-1 text-xs font-semibold text-[var(--etat-navy-950)]">{programme.budgetFcfa !== undefined ? formatFcfa(programme.budgetFcfa) : "Budget à estimer"}</p>
          <p className="mt-0.5 text-[11px] text-[var(--etat-stone-600)]">{budgetStatusCaption[programme.budgetStatus]}</p>
          <p className="mt-0.5 text-[11px] text-[var(--etat-stone-600)]">{formatFcfa(confirmed)} confirmés{totalFunding > 0 ? ` sur ${formatFcfa(totalFunding)} identifiés` : ""}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">Prochaine échéance</p>
          <p className="mt-1 text-xs font-semibold text-[var(--etat-navy-950)]">{nextDeadline ? new Date(nextDeadline).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "Aucune échéance documentée"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">Progression</p>
          <p className="mt-1 text-xs font-semibold text-[var(--etat-navy-950)]">{indicatorsAvgProgress !== null ? `${indicatorsAvgProgress}% en moyenne` : "Aucun indicateur suivi"}</p>
          {indicatorsAvgProgress !== null && <p className="mt-0.5 text-[11px] text-[var(--etat-stone-600)]">{programme.indicators.length} indicateur{programme.indicators.length > 1 ? "s" : ""}</p>}
        </div>
      </div>

      {programme.indicators.length > 0 && (
        <div className="mt-4 space-y-3 border-t border-[var(--etat-line)] pt-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">Progression baseline → actuel → cible</p>
          {programme.indicators.map((indicator) => (
            <div key={indicator.label}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs">
                <span className="font-semibold text-[var(--etat-navy-800)]">{indicator.label}</span>
                <span className="text-[var(--etat-stone-600)]">{indicator.baseline}{indicator.unit} → {indicator.current}{indicator.unit} → {indicator.target}{indicator.unit}</span>
              </div>
              {/* Barre sharp (mandat §"Programmes", géométrie du prototype :
                  jamais de pilule) + repère de cible fixe à 100% — la
                  progression réelle (indicatorProgress) reste la seule
                  donnée qui bouge, le repère ne fait que marquer où se
                  trouve la cible déjà affichée en toutes lettres au-dessus. */}
              <div className="relative mt-1.5 h-[3px] w-full overflow-hidden rounded-[1px] bg-[var(--etat-line)]">
                <div className="h-full rounded-[1px] bg-[var(--etat-terracotta)]" style={{ width: `${indicatorProgress(indicator)}%` }} />
                <span className="absolute right-0 top-1/2 h-2 w-[1.5px] -translate-y-1/2 bg-[var(--etat-navy)]" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      )}

      {programme.funding.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[var(--etat-line)] pt-4">
          {programme.funding.map((fund) => {
            const partner = state.actors.find((item) => item.id === fund.partnerId);
            return <span key={fund.id} className={`etat-tag ${fundingTagClass[fund.status]}`}>{partner?.name ?? fund.partnerId} · {fundingStatusLabel[fund.status]}</span>;
          })}
        </div>
      )}
    </div>
  );
}

// Portefeuille complet "Programmes en cours" — extrait de /app/etat
// (mandat "Brief national", navigation par page, 2026-08-26). Contenu et
// logique IDENTIQUES au chapitre "programmes-detail" qui vivait sur
// /app/etat jusqu'ici. Périmètre (territoire) et Statut : états LOCAUX à
// cette page désormais (même remarque que /app/etat/arbitrages).
export default function ProgrammesPage() {
  const { state } = useProduct();
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [programmeStatusFilter, setProgrammeStatusFilter] = useState<Initiative["status"] | "all">("all");

  if (!state) return null;

  const focusTerritory = selectedTerritoryId ? state.territories.find((item) => item.id === selectedTerritoryId) : undefined;
  const filteredProgrammes = state.initiatives.filter((item) =>
    (!selectedTerritoryId || item.territoryIds.includes(selectedTerritoryId)) &&
    (programmeStatusFilter === "all" || item.status === programmeStatusFilter)
  );
  const activeProgrammesCount = filteredProgrammes.filter((item) => item.status !== "terminee").length;
  const confirmedFunding = filteredProgrammes.reduce((sum, item) => sum + item.funding.filter((fund) => fund.status === "confirme").reduce((fundingSum, fund) => fundingSum + fund.amountFcfa, 0), 0);
  const confirmedFundingCompact = `${new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(confirmedFunding)} FCFA`;
  const coveredTerritoriesCount = new Set(filteredProgrammes.flatMap((item) => item.territoryIds)).size;
  const trackedIndicatorsCount = filteredProgrammes.reduce((sum, item) => sum + item.indicators.length, 0);

  // Chaîne "Besoin territorial → Intervention → Acteurs/Capacités → Mise
  // en œuvre → Résultats documentés" (mandat P2.DESIGN-1B.1 §10, dette
  // héritée de P2.DESIGN-1B : cette page n'avait jusqu'ici aucune lecture
  // en chaîne, seulement des cartes isolées). Cinq comptages réels, jamais
  // une numérotation décorative : chaque étape lit un champ du domaine déjà
  // utilisé ailleurs dans le produit (Initiative.situationIds,
  // Initiative.status, Initiative.ownerId/funding, Result.sourceRef).
  const chainSituations = new Set(filteredProgrammes.flatMap((item) => item.situationIds)).size;
  const chainActors = new Set([
    ...filteredProgrammes.map((item) => item.ownerId).filter(Boolean),
    ...filteredProgrammes.flatMap((item) => item.funding.map((fund) => fund.partnerId))
  ]).size;
  const chainInOeuvre = filteredProgrammes.filter((item) => item.status === "execution").length;
  const chainResults = state.results.filter((item) => item.sourceRef.objectType === "initiative" && filteredProgrammes.some((programme) => programme.id === item.sourceRef.objectId)).length;
  const chainSteps = [
    { label: "Besoin territorial", value: chainSituations, detail: "situation(s) à l’origine d’un programme" },
    { label: "Intervention", value: filteredProgrammes.length, detail: "programme(s) engagé(s)" },
    { label: "Acteurs / capacités", value: chainActors, detail: "responsable(s) et partenaire(s) de financement" },
    { label: "Mise en œuvre", value: chainInOeuvre, detail: "en exécution" },
    { label: "Résultats documentés", value: chainResults, detail: chainResults > 0 ? "résultat(s) rattaché(s)" : "aucun résultat rattaché pour le moment" }
  ];

  return (
    <div className="px-6 pb-16 pt-8 lg:px-[60px] lg:pt-10">
      <EtatRegistryHeader
        eyebrow="Programmes en cours — portefeuille complet"
        title="Relier les priorités territoriales aux moyens mobilisables."
        description={<>{filteredProgrammes.length} programme(s){selectedTerritoryId ? ` · ${focusTerritory?.name ?? selectedTerritoryId}` : ""}{programmeStatusFilter !== "all" ? ` · ${initiativeStatusLabel[programmeStatusFilter]}` : ""} sur {state.initiatives.length} au total. Les montants distinguent explicitement financements identifiés et financements confirmés.</>}
        metrics={[
          { label: "Programmes actifs", value: activeProgrammesCount, detail: `${filteredProgrammes.length} affiché(s)` },
          { label: "Financements confirmés", value: confirmedFundingCompact, detail: formatFcfa(confirmedFunding), tone: confirmedFunding > 0 ? "positive" : "neutral" },
          { label: "Territoires couverts", value: coveredTerritoriesCount },
          { label: "Indicateurs suivis", value: trackedIndicatorsCount, detail: "Baseline, actuel et cible" }
        ]}
        signature={Boolean(selectedTerritoryId)}
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
          <label className="block">
            <p className="etat-filter-label">Statut</p>
            <select
              value={programmeStatusFilter}
              onChange={(event) => setProgrammeStatusFilter(event.target.value as Initiative["status"] | "all")}
              className="etat-filter-select"
            >
              <option value="all">Tous les statuts</option>
              {(["cadrage", "financee", "execution", "terminee"] as const).map((status) => (
                <option key={status} value={status}>{initiativeStatusLabel[status]}</option>
              ))}
            </select>
          </label>
      </EtatRegistryHeader>

      {/* Bande "chaîne du programme" (mandat §10/§12, corrigée au mandat
          P2.DESIGN-1B.2 §1) — personnalité DEVELOPMENT/ACTION propre à
          cette page. Le financement N'EST PAS l'attribut visuel dominant :
          il reste une carte parmi cinq, à poids égal avec le besoin, les
          acteurs, la mise en œuvre et les résultats.
          Correctif §1 : la maquette V2 (`<image-slot id="prog-hero"
          fit="cover">`, colonne pleine hauteur, sans marge) place l'image
          comme un second panneau à part entière, jamais une vignette posée
          dans un espace blanc. Le padding vivait auparavant sur TOUT le
          conteneur (texte + image), ce qui emprisonnait l'image dans une
          marge — désormais le padding ne porte que sur la colonne de
          texte, l'image occupe sa colonne à bord perdu (object-cover,
          aucune marge, seule une bordure de couture la sépare du texte,
          overflow-hidden sur le panneau pour respecter son rayon). */}
      <div className="etat-panel mt-5 flex flex-col overflow-hidden lg:flex-row lg:items-stretch">
        <div className="min-w-0 flex-1 p-6 lg:p-7">
          <p className="text-[9.5px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-body)" }}>Besoin territorial → intervention → résultat</p>
          <div className="mt-4 flex flex-wrap items-stretch gap-0">
            {chainSteps.map((step, i) => (
              <div key={step.label} className="flex items-stretch">
                <div className="min-w-[132px] px-4 first:pl-0">
                  <p className="etat-display text-[26px] leading-none" style={{ color: "var(--etat-navy)" }}>{step.value}</p>
                  <p className="mt-1.5 text-[11.5px] font-semibold text-[var(--etat-navy)]">{step.label}</p>
                  <p className="mt-0.5 text-[10.5px] leading-[1.4] text-[var(--etat-stone-400)]">{step.detail}</p>
                </div>
                {i < chainSteps.length - 1 && <div className="mx-1 hidden w-px shrink-0 self-stretch bg-[var(--etat-line)] sm:block" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
        {/* Illustration fournie (mandat §10) : composition à but éditorial,
            jamais une source de données — les chiffres qui y apparaissent
            (18 territoires / 21 indicateurs / 9 programmes) sont ceux du
            prototype, coïncidence vérifiée avec les compteurs réels de
            cette page au moment de l'intégration ; ils ne les remplacent
            ni ne les redéfinissent — la chaîne calculée à gauche reste la
            seule source affichée. object-position recentré sur la scène de
            quai (opérateurs + tablette), pas sur les pictogrammes/chiffres
            du haut. */}
        <div className="relative min-h-[240px] w-full shrink-0 overflow-hidden border-t border-[var(--etat-line)] lg:min-h-0 lg:w-[360px] lg:border-l lg:border-t-0">
          <Image src="/images/etat-programmes-hero.webp" alt="" fill sizes="360px" className="object-cover" style={{ objectPosition: "58% 64%" }} />
        </div>
      </div>

      <div className="etat-panel mt-5 p-6 lg:p-7">
        {filteredProgrammes.length === 0 ? (
          <p className="text-sm text-[var(--etat-stone-600)]">Aucun programme ne correspond à ce filtre pour le moment.</p>
        ) : programmeStatusFilter !== "all" ? (
          <div className="space-y-5">
            {filteredProgrammes.map((programme) => <ProgrammeCard key={programme.id} programme={programme} state={state} />)}
          </div>
        ) : (
          // §15 — regroupé par tier réel seulement quand aucun statut
          // précis n'est déjà choisi (sinon la section redirait ce que le
          // filtre affirme déjà).
          <div className="space-y-8">
            {programmeGroups.map((group) => {
              const programmes = filteredProgrammes.filter((item) => group.statuses.includes(item.status));
              if (programmes.length === 0) return null;
              return (
                <div key={group.key}>
                  <EditorialSection eyebrow={`${programmes.length} programme${programmes.length > 1 ? "s" : ""}`} title={group.title} />
                  <div className="mt-3 space-y-5">
                    {programmes.map((programme) => <ProgrammeCard key={programme.id} programme={programme} state={state} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
