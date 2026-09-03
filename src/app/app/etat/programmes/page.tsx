"use client";

import { useState } from "react";
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
          <p className="text-sm font-bold text-[var(--etat-navy-950)]">{programme.title}</p>
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
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--etat-line)]"><div className="h-full rounded-full bg-[var(--etat-terracotta)]" style={{ width: `${indicatorProgress(indicator)}%` }} /></div>
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

  return (
    <div className="etat-scope min-h-screen bg-[var(--etat-offwhite)] p-5 pb-16 lg:p-8">
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Périmètre</p>
            <select
              value={selectedTerritoryId ?? ""}
              onChange={(event) => setSelectedTerritoryId(event.target.value || null)}
              className="mt-1 rounded-md border border-[var(--etat-line)] bg-white py-1 pl-0 pr-6 text-sm font-semibold text-[var(--etat-navy-950)] outline-none focus:border-[var(--etat-navy-600)]"
            >
              <option value="">Sénégal entier</option>
              {[...state.territories].sort((a, b) => a.name.localeCompare(b.name)).map((territory) => (
                <option key={territory.id} value={territory.id}>{territory.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Statut</p>
            <select
              value={programmeStatusFilter}
              onChange={(event) => setProgrammeStatusFilter(event.target.value as Initiative["status"] | "all")}
              className="mt-1 rounded-md border border-[var(--etat-line)] bg-white py-1 pl-0 pr-6 text-sm font-semibold text-[var(--etat-navy-950)] outline-none focus:border-[var(--etat-navy-600)]"
            >
              <option value="all">Tous les statuts</option>
              {(["cadrage", "financee", "execution", "terminee"] as const).map((status) => (
                <option key={status} value={status}>{initiativeStatusLabel[status]}</option>
              ))}
            </select>
          </label>
      </EtatRegistryHeader>

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
