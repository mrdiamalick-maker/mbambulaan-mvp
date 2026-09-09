"use client";

import { useState } from "react";
import Image from "next/image";
import { useProduct } from "@/components/providers/ProductProvider";
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
    <article className="grid gap-6 border-t border-[var(--etat-line)] py-7 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] xl:gap-12">
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="etat-h3 text-[18px]">{programme.title}</p>
            <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[var(--etat-stone-600)]">{programme.objective}</p>
          </div>
          <span className="etat-tag etat-tag--stable shrink-0">{initiativeStatusLabel[programme.status]}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">{territoryNames.map((name) => <span key={name} className="etat-tag etat-tag--stable">{name}</span>)}</div>
        <dl className="mt-5 grid gap-x-7 gap-y-4 sm:grid-cols-3">
          <div>
            <dt className="text-[9.5px] font-bold uppercase tracking-[.13em] text-[var(--etat-stone-400)]">Responsable</dt>
            <dd className="mt-1 text-xs font-semibold text-[var(--etat-navy-950)]">{owner?.name ?? "Non désigné"}</dd>
          </div>
          <div>
            <dt className="text-[9.5px] font-bold uppercase tracking-[.13em] text-[var(--etat-stone-400)]">Financement</dt>
            <dd className="mt-1 text-xs font-semibold text-[var(--etat-navy-950)]">{programme.budgetFcfa !== undefined ? formatFcfa(programme.budgetFcfa) : "Budget à estimer"}</dd>
            <dd className="mt-0.5 text-[10.5px] text-[var(--etat-stone-600)]">{budgetStatusCaption[programme.budgetStatus]} · {formatFcfa(confirmed)} confirmés{totalFunding > 0 ? ` / ${formatFcfa(totalFunding)} identifiés` : ""}</dd>
          </div>
          <div>
            <dt className="text-[9.5px] font-bold uppercase tracking-[.13em] text-[var(--etat-stone-400)]">Prochaine échéance</dt>
            <dd className="mt-1 text-xs font-semibold text-[var(--etat-navy-950)]">{nextDeadline ? new Date(nextDeadline).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "Aucune échéance documentée"}</dd>
          </div>
        </dl>
        {programme.funding.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {programme.funding.map((fund) => {
              const partner = state.actors.find((item) => item.id === fund.partnerId);
              return <span key={fund.id} className={`etat-tag ${fundingTagClass[fund.status]}`}>{partner?.name ?? fund.partnerId} · {fundingStatusLabel[fund.status]}</span>;
            })}
          </div>
        )}
      </div>

      <div className="min-w-0 xl:border-l xl:border-[var(--etat-line)] xl:pl-8">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[9.5px] font-bold uppercase tracking-[.13em] text-[var(--etat-stone-400)]">Indicateurs de mise en œuvre</p>
          <p className="text-xs font-semibold text-[var(--etat-navy)]">{indicatorsAvgProgress !== null ? `${indicatorsAvgProgress}% en moyenne` : "Non documenté"}</p>
        </div>
        {programme.indicators.length > 0 ? (
        <div className="mt-4 space-y-4">
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
        ) : <p className="mt-4 text-xs leading-5 text-[var(--etat-stone-600)]">Aucun indicateur de progression n’est encore documenté pour ce programme.</p>}
      </div>
    </article>
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

  const filteredProgrammes = state.initiatives.filter((item) =>
    (!selectedTerritoryId || item.territoryIds.includes(selectedTerritoryId)) &&
    (programmeStatusFilter === "all" || item.status === programmeStatusFilter)
  );
  const activeProgrammesCount = filteredProgrammes.filter((item) => item.status !== "terminee").length;
  const confirmedFunding = filteredProgrammes.reduce((sum, item) => sum + item.funding.filter((fund) => fund.status === "confirme").reduce((fundingSum, fund) => fundingSum + fund.amountFcfa, 0), 0);
  const coveredTerritoriesCount = new Set(filteredProgrammes.flatMap((item) => item.territoryIds)).size;
  const trackedIndicatorsCount = filteredProgrammes.reduce((sum, item) => sum + item.indicators.length, 0);
  const chainSteps = [
    { label: "Besoin", detail: "Un problème territorial documenté" },
    { label: "Intervention", detail: "Une réponse cadrée et située" },
    { label: "Acteurs", detail: "Organisations et capacités mobilisées" },
    { label: "Mise en œuvre", detail: "Jalons et suivi territorial" },
    { label: "Résultats", detail: "Ce qui est documenté, pas revendiqué" }
  ];

  return (
    <div className="px-6 pb-16 pt-8 lg:px-[60px] lg:pt-10">
      <section className="overflow-hidden border border-[var(--etat-line)] bg-[var(--etat-warm-white)]">
        <div className="grid xl:grid-cols-[minmax(0,1.4fr)_minmax(310px,.6fr)]">
          <div className="min-w-0 px-6 py-8 lg:px-9 lg:py-10">
            <p className="etat-eyebrow"><span className="etat-eyebrow-dot" />Programmes · portefeuille</p>
            <h1 className="etat-display etat-h1 etat-h1--registry mt-4 max-w-[740px]">Du besoin territorial à l’action documentée.</h1>
            <p className="mt-4 max-w-[760px] text-[14px] leading-6 text-[var(--etat-stone-600)]">
              {activeProgrammesCount} programme(s) actif(s) sur {filteredProgrammes.length} affiché(s), dans {coveredTerritoriesCount} territoire(s). {trackedIndicatorsCount} indicateur(s) décrivent la mise en œuvre ; les financements confirmés représentent {formatFcfa(confirmedFunding)}. Chaque montant conserve son statut de confiance.
            </p>
            <div className="mt-8 grid gap-px border-y border-[var(--etat-line)] bg-[var(--etat-line)] sm:grid-cols-5" aria-label="Cycle d’un programme Mbàmbulaan">
              {chainSteps.map((step, index) => (
                <div key={step.label} className="relative bg-[var(--etat-warm-white)] px-3 py-4">
                  <p className="text-[9px] font-bold uppercase tracking-[.14em] text-[var(--etat-terracotta)]">0{index + 1}</p>
                  <p className="mt-2 text-[12px] font-semibold text-[var(--etat-navy)]">{step.label}</p>
                  <p className="mt-1 text-[10.5px] leading-4 text-[var(--etat-stone-600)]">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[260px] border-t border-[var(--etat-line)] xl:min-h-0 xl:border-l xl:border-t-0">
            <Image src="/images/etat-programmes-hero.webp" alt="" fill priority sizes="(min-width: 1024px) 34vw, 100vw" className="object-cover" style={{ objectPosition: "58% 64%" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,26,42,.34)] to-transparent" />
            <p className="absolute bottom-4 left-4 right-4 text-[10.5px] leading-4 text-white/80">Image de contexte éditorial — elle ne constitue pas une preuve opérationnelle.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-5 border-t border-[var(--etat-line)] bg-white px-6 py-4 lg:px-9">
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
        </div>
      </section>

      <div className="mt-8">
        {filteredProgrammes.length === 0 ? (
          <p className="text-sm text-[var(--etat-stone-600)]">Aucun programme ne correspond à ce filtre pour le moment.</p>
        ) : programmeStatusFilter !== "all" ? (
          <div>
            {filteredProgrammes.map((programme) => <ProgrammeCard key={programme.id} programme={programme} state={state} />)}
          </div>
        ) : (
          // §15 — regroupé par tier réel seulement quand aucun statut
          // précis n'est déjà choisi (sinon la section redirait ce que le
          // filtre affirme déjà).
          <div className="space-y-10">
            {programmeGroups.map((group) => {
              const programmes = filteredProgrammes.filter((item) => group.statuses.includes(item.status));
              if (programmes.length === 0) return null;
              return (
                <div key={group.key}>
                  <EditorialSection eyebrow={`${programmes.length} programme${programmes.length > 1 ? "s" : ""}`} title={group.title} />
                  <div className="mt-3">
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
