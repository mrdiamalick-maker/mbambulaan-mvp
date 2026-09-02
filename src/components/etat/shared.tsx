// Extraction partagée Espace État (mandat "Brief national" — navigation par
// page, 2026-08-26) : StatusBadge/TerritoryDetail/SituationDetail/
// SignalForm/MissionForm et les constantes qu'ils utilisent vivaient
// jusqu'ici en local dans src/app/app/etat/page.tsx (seule page à les
// consommer). Devenus nécessaires sur plusieurs pages distinctes
// (/app/etat, /app/etat/arbitrages, /app/etat/redevabilite) une fois les
// registres complets extraits de /app/etat vers de vraies routes — extrait
// ici tel quel, aucune logique changée, pour ne pas dupliquer le travail
// déjà fait (consigne explicite du mandat).
"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, ArrowUpRight, Compass, HelpCircle, Send, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { decisionTypeLabels, evidenceTypeLabels, signalDispositionLabels, type Situation, type Territory } from "@/domain/types";
import { channelMeta, trustLabels } from "@/lib/status-tokens";
import { fieldVisitObjectiveLabels, type FieldVisitObjective } from "@/domain/ministry/field-visit";
import {
  buildValueTrail,
  collectSituationSignals,
  describeFindingTrust,
  findKnowledgeGapForSituation,
  relatedDecisionsForSituation,
  resolveFindingForSituation,
  resolveSourceRefDisplay
} from "@/domain/situation-narrative";
import {
  vigilanceCategoryLabels,
  vigilanceSeverityLabels,
  type VigilanceCase,
  type VigilanceCategory,
  type VigilanceSeverity
} from "@/domain/ministry/vigilance";
import { buildTerritoryIntelligence } from "@/domain/territory-intelligence";
import { TerritoryDossierSections } from "@/components/territories/TerritoryDossierSections";

export const priorityLabels: Record<Situation["priority"], string> = { critique: "Critique", haute: "Élevé", moyenne: "Moyen", faible: "Faible" };
export const priorityToTag: Record<Situation["priority"], "stable" | "vigilance" | "critique"> = { critique: "critique", haute: "vigilance", moyenne: "stable", faible: "stable" };
export const glyphBorderColor: Record<"stable" | "vigilance" | "critique", string> = { stable: "var(--etat-navy-600)", vigilance: "var(--etat-ocre)", critique: "var(--etat-terracotta)" };
export const arbitrageFillColor: Record<"stable" | "vigilance" | "critique", string> = { stable: "rgba(29,68,104,.08)", vigilance: "rgba(198,138,44,.14)", critique: "rgba(182,82,47,.15)" };
export const statusTagClass: Record<"stable" | "vigilance" | "critique", string> = { stable: "etat-tag--stable", vigilance: "etat-tag--vigilance", critique: "etat-tag--critique" };
export const statusTagLabel: Record<"stable" | "vigilance" | "critique", string> = { stable: "Stable", vigilance: "Vigilance", critique: "Critique" };
// Correctif 2026-08-17 (audit CTA) : la fiche territoire publique
// (/atlas/[slug]) est indexée par slug, pas par Territory.id du Produit —
// les deux coïncident pour 17 des 18 territoires partagés, sauf "joal"
// (Territory.id="joal", data/public-atlas.ts slug="joal-fadiouth") où le
// lien produisait une vraie 404, vérifié en conditions réelles.
export const territoryPublicSlug: Partial<Record<string, string>> = { joal: "joal-fadiouth" };
// Correctif 2026-08-18 (CEO) : "Ouakam" n'a jamais eu de fiche Atlas
// publique — pas un des territoires éditoriaux couverts par le site public.
export const territoriesWithoutPublicAtlas = new Set(["ouakam"]);
export const pipelineStages: Array<{ status: Situation["status"]; label: string }> = [
  { status: "recue", label: "Reçue" },
  { status: "qualification", label: "Qualification" },
  { status: "priorisee", label: "Priorisée" },
  { status: "coordination", label: "Coordination" },
  { status: "intervention", label: "Intervention" },
  { status: "attente", label: "En attente" },
  { status: "resultat", label: "Résultat" },
  { status: "reglee", label: "Réglée" }
];
export const situationPriorityRank: Record<Situation["priority"], number> = { critique: 3, haute: 2, moyenne: 1, faible: 0 };
export const infraStatusColor: Record<"operationnelle" | "fragile" | "indisponible", string> = { operationnelle: "#1d8a5f", fragile: "var(--etat-ocre)", indisponible: "var(--etat-terracotta)" };
export const infraStatusLabel: Record<"operationnelle" | "fragile" | "indisponible", string> = { operationnelle: "Opérationnelle", fragile: "Fragile", indisponible: "Indisponible" };
// Lot État-C — mêmes libellés que /app/app/(coordination)/initiatives/page.tsx
// et /app/etat/rapport (pages internes, non modifiées) pour ne pas
// introduire un 3e vocabulaire de statut de programme.
export const initiativeStatusLabel: Record<"cadrage" | "financee" | "execution" | "terminee", string> = { cadrage: "Cadrage", financee: "Financée", execution: "Exécution", terminee: "Terminée" };
export const commitmentStatusLabel: Record<"a_faire" | "en_cours" | "bloquee" | "terminee", string> = { a_faire: "À faire", en_cours: "En cours", bloquee: "Bloqué", terminee: "Terminé" };
// Lot État-E — mêmes libellés que /app/app/(coordination)/initiatives/page.tsx
// et /app/etat/rapport pour ne pas introduire un 3e vocabulaire de statut
// de financement.
export const fundingStatusLabel: Record<"a_mobiliser" | "en_instruction" | "confirme", string> = { a_mobiliser: "À mobiliser", en_instruction: "En instruction", confirme: "Confirmé" };
export const fundingTagClass: Record<"a_mobiliser" | "en_instruction" | "confirme", string> = { a_mobiliser: "etat-tag--stable", en_instruction: "etat-tag--vigilance", confirme: "etat-tag--reel" };

export function formatFcfa(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(amount))} FCFA`;
}

// Baseline → actuel → cible : même formule générique que /app/etat/rapport,
// correcte aussi pour les indicateurs à réduire (cible < baseline).
export function indicatorProgress(indicator: { baseline: number; target: number; current: number }) {
  const span = indicator.target - indicator.baseline;
  if (span === 0) return 100;
  return Math.min(100, Math.max(0, Math.round(((indicator.current - indicator.baseline) / span) * 100)));
}

export type Mission = {
  key: string;
  territoryId: string;
  territoryLabel: string;
  raison: string;
  action: string;
  glyphStatus: "stable" | "vigilance" | "critique";
  suggestedObjective: FieldVisitObjective;
};

export function StatusBadge({ status }: { status: "stable" | "vigilance" | "critique" }) {
  return <span className={`etat-tag ${statusTagClass[status]}`}>{statusTagLabel[status]}</span>;
}

export function TerritoryDetail({ territory, cases, onOpenSituation }: { territory: Territory; cases: VigilanceCase[]; onOpenSituation: (situation: Situation) => void }) {
  const { state } = useProduct();
  if (!state) return null;
  const sites = state.sites.filter((item) => item.territoryId === territory.id);
  const infrastructures = state.infrastructures.filter((item) => item.territoryId === territory.id);
  const acteurs = state.actors.filter((item) => item.territoryIds.includes(territory.id));
  const acteursParRole = acteurs.reduce<Record<string, number>>((acc, item) => { acc[item.role] = (acc[item.role] ?? 0) + 1; return acc; }, {});
  const prioritySituation = state.situations.filter((item) => item.territoryId === territory.id && item.status !== "reglee").sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority])[0];
  // Lot État-C (mandat §3.4) : deux ajouts additifs, données déjà
  // présentes dans le modèle mais jusqu'ici non lues par cette fiche —
  // débarquements/flux documentés (via les sites du territoire) et
  // programmes actifs (Initiative.territoryIds).
  const siteIds = new Set(sites.map((item) => item.id));
  const landings = state.landings.filter((item) => siteIds.has(item.siteId));
  const programmes = state.initiatives.filter((item) => item.territoryIds.includes(territory.id));
  // Lot 5 (mandat "Atlas & Territoire", §26 — "une seule réalité,
  // différentes expériences") : même projection que l'Atlas
  // professionnel, réutilisée telle quelle par la fiche territoire de
  // l'Espace État. territory venant toujours de state.territories,
  // buildTerritoryIntelligence ne peut pas renvoyer undefined ici.
  const intelligence = buildTerritoryIntelligence(state, territory.id)!;

  return (
    <div className="space-y-6">
      <StatusBadge status={territory.activity} />
      <div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Localisation</p><p className="mt-1 text-sm text-[var(--etat-navy-950)]">{territory.region}</p></div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Acteurs actifs · {acteurs.length}</p>
        {acteurs.length === 0 ? <p className="mt-1.5 text-xs text-[var(--etat-stone-400)]">Aucun acteur rattaché pour le moment.</p> : <div className="mt-1.5 flex flex-wrap gap-1.5">{Object.entries(acteursParRole).map(([role, count]) => <span key={role} className="etat-tag etat-tag--stable capitalize">{role.replaceAll("_", " ")} · {count}</span>)}</div>}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Infrastructures · {sites.length} site(s), {infrastructures.length} infrastructure(s)</p>
        {infrastructures.length === 0 ? <p className="mt-1.5 text-xs text-[var(--etat-stone-400)]">Aucune infrastructure recensée.</p> : <div className="mt-1.5 space-y-1.5">{infrastructures.map((infra) => <div key={infra.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--etat-line)] bg-white px-3 py-2"><span className="text-xs font-medium capitalize text-[var(--etat-navy-950)]">{infra.type.replaceAll("_", " ")}</span><span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: infraStatusColor[infra.status] }}><span className="size-1.5 rounded-full" style={{ backgroundColor: infraStatusColor[infra.status] }} aria-hidden="true" />{infraStatusLabel[infra.status]}</span></div>)}</div>}
      </div>
      {/* Lot État-C : débarquements/flux documentés + programmes actifs —
          données déjà présentes dans le modèle (landings via les sites
          du territoire, Initiative.territoryIds), non lues jusqu'ici par
          cette fiche. */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Débarquements documentés · {landings.length}</p>
        {landings.length === 0 ? <p className="mt-1.5 text-xs text-[var(--etat-stone-400)]">Aucun débarquement documenté pour le moment.</p> : <p className="mt-1.5 text-xs text-[var(--etat-stone-600)]">{landings.filter((item) => item.status === "lots_crees").length} déjà valorisé(s) en lot(s), sur {landings.length} au total.</p>}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Programmes actifs · {programmes.length}</p>
        {programmes.length === 0 ? <p className="mt-1.5 text-xs text-[var(--etat-stone-400)]">Aucun programme actif sur ce territoire pour le moment.</p> : <div className="mt-1.5 space-y-1.5">{programmes.map((programme) => <div key={programme.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--etat-line)] bg-white px-3 py-2"><span className="text-xs font-medium text-[var(--etat-navy-950)]">{programme.title}</span><span className="etat-tag etat-tag--stable shrink-0">{initiativeStatusLabel[programme.status]}</span></div>)}</div>}
      </div>
      {prioritySituation && <div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Situation prioritaire</p><div className="mt-2 rounded-lg border border-[var(--etat-line)] bg-white p-3"><p className="text-sm font-semibold text-[var(--etat-navy-950)]">{prioritySituation.title}</p><p className="mt-1 text-xs text-[var(--etat-stone-600)]">{prioritySituation.nextStep}</p>{prioritySituation.history.length > 0 && <div className="mt-3 space-y-1.5 border-t border-[var(--etat-line)] pt-3">{prioritySituation.history.slice(0, 2).map((entry) => <div key={entry.id} className="border-l-2 border-[var(--etat-line)] pl-2 text-[11px] leading-4 text-[var(--etat-stone-600)]"><span className="font-semibold text-[var(--etat-navy-950)]">{entry.label}</span> · {new Date(entry.at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</div>)}</div>}<button onClick={() => onOpenSituation(prioritySituation)} className="etat-btn etat-btn-outline mt-3 w-full justify-center">Entrer dans le dossier <ArrowRight size={15} /></button></div></div>}
      {cases.length > 0 && <div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Signaux sur ce territoire</p><div className="mt-2 space-y-2">{cases.map((item) => <div key={item.id} className="rounded-lg bg-[var(--etat-offwhite)] p-3 text-xs text-[var(--etat-navy-950)]">{vigilanceCategoryLabels[item.category]} — {item.description}</div>)}</div></div>}

      {/* Lot 5 (mandat "Atlas & Territoire", §5/§8-§14) — le dossier
          territorial complet : ce qui se passe, ce qui émerge, ce que
          nous ne savons pas, ce que le terrain vérifie, ce qui est en
          cours, ce qui a été réalisé, ce qui change, ce que nous
          apprenons. Même moteur que l'Atlas professionnel
          (buildTerritoryIntelligence), habillage etat-* propre à cette
          fiche. */}
      <div className="border-t border-[var(--etat-line)] pt-5">
        <TerritoryDossierSections intelligence={intelligence} tone="etat" />
      </div>

      {/* Repli honnête plutôt qu'un lien vers un 404 (mandat CEO
          2026-08-18) : ce territoire n'a pas de fiche publique
          équivalente à retrouver, contrairement à Joal — le bloc reste
          visible, dans le même gabarit visuel que le lien actif, mais
          explicitement non cliquable et expliqué plutôt que masqué en
          silence. */}
      {territoriesWithoutPublicAtlas.has(territory.id) ? (
        <div className="etat-btn etat-btn-outline pointer-events-none w-full cursor-not-allowed justify-center opacity-50" aria-disabled="true">Pas encore de fiche publique pour ce territoire</div>
      ) : (
        <a href={`/atlas/${territoryPublicSlug[territory.id] ?? territory.id}`} target="_blank" rel="noreferrer" className="etat-btn etat-btn-outline w-full justify-center">Fiche territoire complète (site public) <ArrowUpRight size={15} /></a>
      )}
    </div>
  );
}

// SituationDetail — dossier de lecture institutionnel d'une Situation
// (LOT 1, mandat "Vertical Slice Joal") : le même composant sert désormais
// de "Situation Room" pour l'Espace État (§10/§11 du mandat — l'État
// descend dans le détail sans devenir un poste de travail Coordinateur,
// cf. SituationRoom.tsx, non touché). Étendu en place plutôt que dupliqué
// (mandat §10 : "si une surface existe déjà, la faire évoluer") — les 4
// pages qui l'utilisent (/app/etat, /arbitrages, /redevabilite,
// /territoires) en bénéficient toutes sans code supplémentaire.
export function SituationDetail({ situation, state, onPlanVisit }: { situation: Situation; state: NonNullable<ReturnType<typeof useProduct>["state"]>; onPlanVisit: () => void }) {
  const territory = state.territories.find((item) => item.id === situation.territoryId);
  const tag = priorityToTag[situation.priority];
  const stageLabel = pipelineStages.find((stage) => stage.status === situation.status)?.label ?? situation.status;
  const responsable = situation.responsibleId ? state.actors.find((item) => item.id === situation.responsibleId) : undefined;
  const relatedDecisions = relatedDecisionsForSituation(state, situation);
  // Lot État-C (mandat §3.4, "quelles capacités ou coordinations sont
  // déjà engagées") : situation.coordinationId existe déjà dans le
  // modèle et n'était affiché nulle part sur cette fiche.
  const coordination = situation.coordinationId ? state.coordinationSpaces.find((item) => item.id === situation.coordinationId) : undefined;
  // Signature produit "pourquoi Mbàmbulaan vous le signale" (§7 du mandat)
  // — n'apparaît que si la Situation résout à un Finding réel. Les
  // situations issues des wrappers legacy (report_signal_and_open_situation,
  // convert_message_to_signal_and_situation, convert_post) n'en ont pas :
  // pas de texte fabriqué pour combler l'absence, la signature s'efface
  // simplement plutôt que d'inventer une explication.
  const finding = resolveFindingForSituation(state, situation);
  const sourceElements = finding ? finding.sourceRefs.map((ref) => resolveSourceRefDisplay(state, ref)).filter((item): item is NonNullable<typeof item> => Boolean(item)) : [];
  const knowledgeGap = findKnowledgeGapForSituation(state, situation);
  // Traçabilité (mandat CEO "reconstruire l'Espace État autour de la
  // capture de signal", Lot A, 2026-08-29 ; étendu §9 du mandat LOT 1 —
  // « ne plus afficher uniquement le premier ») : tous les Signals
  // pertinents, pas un seul. channelMeta/trustLabels depuis
  // @/lib/status-tokens, même vocabulaire que SituationRoom.tsx.
  const signals = collectSituationSignals(state, situation);
  const evidences = state.evidences
    .filter((item) => item.situationId === situation.id)
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  const valueTrail = buildValueTrail(state, situation);

  // "Pourquoi c'est important" (§10) — effet potentiel dérivé de données
  // réelles du territoire (infrastructures fragiles, activité documentée),
  // jamais un montant de pertes fabriqué (garde-fou §14). Générique : ne
  // suppose aucun territoire précis.
  const territoryInfra = state.infrastructures.filter((item) => item.territoryId === situation.territoryId);
  const fragileInfra = territoryInfra.filter((item) => item.status !== "operationnelle");
  const territorySiteIds = new Set(state.sites.filter((item) => item.territoryId === situation.territoryId).map((item) => item.id));
  const territoryLandings = state.landings.filter((item) => territorySiteIds.has(item.siteId));

  // "Qui peut agir" (§10) — acteurs opérationnels du territoire et
  // capacités déjà disponibles localement (distinct de "capacité
  // mobilisable ailleurs", SituationRoom.tsx, qui répond à une autre
  // question — ici, qui peut agir sur place).
  const territoryActors = state.actors.filter((item) => item.territoryIds.includes(situation.territoryId) && item.role !== "institution");
  const territoryCapacities = state.capacities
    .filter((item) => item.status === "disponible")
    .map((item) => ({ capacity: item, infra: state.infrastructures.find((infraItem) => infraItem.id === item.infrastructureId) }))
    .filter((item) => item.infra?.territoryId === situation.territoryId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`etat-tag ${tag === "critique" ? "etat-tag--critique" : tag === "vigilance" ? "etat-tag--vigilance" : "etat-tag--stable"}`}>{priorityLabels[situation.priority]}</span>
        <span className="text-xs text-[var(--etat-stone-600)]">{situation.reference} · {territory?.name ?? situation.territoryId}</span>
      </div>

      {finding && (
        <div className="rounded-xl border border-[var(--etat-line)] bg-[var(--etat-offwhite)] p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--etat-navy-800)]"><Sparkles size={13} /> Pourquoi Mbàmbulaan vous le signale</p>
          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Ce que Mbàmbulaan a compris</p>
            <p className="mt-1 text-sm font-medium leading-6 text-[var(--etat-navy-950)]">{finding.statement}</p>
          </div>
          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Pourquoi</p>
            <p className="mt-1 text-sm leading-6 text-[var(--etat-stone-600)]">{finding.explanation}</p>
          </div>
          {sourceElements.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Éléments utilisés</p>
              <ul className="mt-1.5 space-y-1">
                {sourceElements.map((item) => (
                  <li key={`${item.ref.objectType}-${item.ref.objectId}`} className="text-xs leading-4 text-[var(--etat-navy-950)]">
                    <span className="font-semibold">{item.label}</span>{item.detail ? <span className="text-[var(--etat-stone-600)]"> — {item.detail}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-3 flex items-start gap-1.5 border-t border-[var(--etat-line)] pt-3">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-[var(--etat-navy-600)]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Niveau de confiance</p>
              <p className="mt-0.5 text-xs leading-4 text-[var(--etat-navy-950)]">{describeFindingTrust(finding)}</p>
            </div>
          </div>
        </div>
      )}

      {signals.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Ce que nous savons · {signals.length} signal{signals.length > 1 ? "aux" : ""}</p>
          <div className="mt-2 space-y-2">
            {signals.map((item) => {
              const ChannelIcon = channelMeta[item.channel].icon;
              const capturedBy = state.actors.find((actor) => actor.id === item.actorId);
              return (
                <div key={item.id} className="rounded-lg border border-[var(--etat-line)] bg-white p-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <ChannelIcon size={13} className="shrink-0 text-[var(--etat-navy-600)]" />
                    <span className="text-xs font-semibold text-[var(--etat-navy-950)]">{channelMeta[item.channel].label}</span>
                    <span className="text-[11px] text-[var(--etat-stone-400)]">· {new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}</span>
                    <span className="ml-auto text-[10px] font-semibold text-[var(--etat-stone-400)]">{trustLabels[item.trust]}</span>
                  </div>
                  <p className="mt-1 text-xs leading-4 text-[var(--etat-stone-600)]">{item.description}</p>
                  <p className="mt-1 text-[11px] text-[var(--etat-stone-400)]">
                    {item.reportedBy ? `Rapporté par ${item.reportedBy}` : capturedBy ? `Saisi par ${capturedBy.name}` : item.source}
                    {" · "}{signalDispositionLabels[item.disposition]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]"><HelpCircle size={13} /> Ce que nous ne savons pas</p>
        <p className="mt-1.5 text-sm leading-6 text-[var(--etat-navy-950)]">
          {knowledgeGap ? knowledgeGap.statement : "Aucun angle mort critique identifié dans le dossier actuel — cela ne garantit pas l’exhaustivité de la connaissance disponible."}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Description</p>
        <p className="mt-1 text-sm text-[var(--etat-navy-950)]">{situation.description}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Étape actuelle · {stageLabel}</p>
        <p className="mt-1 text-sm text-[var(--etat-navy-950)]">{situation.nextStep}</p>
        {situation.waitingReason && <p className="mt-1 text-xs text-[var(--etat-stone-600)]">Motif d’attente : {situation.waitingReason}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Échéance</p>
          <p className="mt-1 text-sm text-[var(--etat-navy-950)]">{situation.dueAt ? new Date(situation.dueAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "Non renseignée"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Responsable</p>
          <p className="mt-1 text-sm text-[var(--etat-navy-950)]">{responsable?.name ?? "Non désigné"}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Pourquoi c’est important</p>
        <p className="mt-1.5 text-sm leading-6 text-[var(--etat-navy-950)]">
          {fragileInfra.length > 0
            ? `${fragileInfra.length} infrastructure${fragileInfra.length > 1 ? "s" : ""} fragile(s) ou indisponible(s) sur ce territoire, dont ${fragileInfra[0].name}. `
            : "Aucune infrastructure fragile ou indisponible recensée sur ce territoire à ce stade. "}
          {territoryLandings.length > 0
            ? `${territoryLandings.length} débarquement(s) documenté(s) — l’activité se poursuit pendant que la situation est traitée.`
            : "Aucun débarquement documenté sur ce territoire pour le moment."}
        </p>
      </div>

      {(territoryActors.length > 0 || territoryCapacities.length > 0) && (
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]"><UsersRound size={13} /> Qui peut agir</p>
          {territoryActors.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {territoryActors.slice(0, 6).map((actor) => <span key={actor.id} className="etat-tag etat-tag--stable capitalize">{actor.name} · {actor.role.replaceAll("_", " ")}</span>)}
            </div>
          )}
          {territoryCapacities.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {territoryCapacities.map(({ capacity, infra }) => (
                <p key={capacity.id} className="text-xs leading-4 text-[var(--etat-stone-600)]"><span className="font-semibold text-[var(--etat-navy-950)]">{infra?.name}</span> — {capacity.availableQuantity} {capacity.unit} disponible(s)</p>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]"><Compass size={13} /> Recommandation</p>
        <p className="mt-1.5 text-sm leading-6 text-[var(--etat-navy-950)]">{finding?.nextStep ?? situation.nextStep}</p>
        <p className="mt-1 text-[11px] text-[var(--etat-stone-400)]">Une orientation proposée — distincte d’une décision effectivement prise (ci-dessous).</p>
      </div>

      {relatedDecisions.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Décision · {relatedDecisions.length}</p>
          <div className="mt-2 space-y-2">
            {relatedDecisions.map((decision) => (
              <div key={decision.id} className="rounded-lg border border-[var(--etat-line)] bg-white p-3">
                <p className="text-sm font-semibold text-[var(--etat-navy-950)]">{decisionTypeLabels[decision.type]}</p>
                <p className="mt-1 text-xs text-[var(--etat-stone-600)]">{decision.rationale}</p>
                <p className="mt-1 text-[11px] text-[var(--etat-stone-400)]">{new Date(decision.decidedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {coordination && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Engagements</p>
          <div className="mt-2 rounded-lg border border-[var(--etat-line)] bg-white p-3">
            <p className="text-sm font-semibold text-[var(--etat-navy-950)]">{coordination.title}</p>
            {coordination.commitments.length === 0 ? (
              <p className="mt-1 text-xs text-[var(--etat-stone-400)]">Aucun engagement enregistré pour le moment.</p>
            ) : (
              <div className="mt-2 space-y-1.5 border-t border-[var(--etat-line)] pt-2">
                {coordination.commitments.map((commitment) => {
                  const actor = state.actors.find((item) => item.id === commitment.actorId);
                  return <p key={commitment.id} className="text-xs leading-4 text-[var(--etat-stone-600)]"><span className="font-semibold text-[var(--etat-navy-950)]">{actor?.name ?? commitment.actorId}</span> — {commitment.label} <span className="text-[var(--etat-stone-400)]">({commitmentStatusLabel[commitment.status]})</span></p>;
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Preuves</p>
        {evidences.length === 0 ? (
          <p className="mt-1.5 text-sm text-[var(--etat-stone-400)]">Aucune preuve enregistrée pour cette situation pour le moment.</p>
        ) : (
          <div className="mt-2 space-y-1.5">
            {evidences.map((evidence) => (
              <p key={evidence.id} className="text-xs leading-4 text-[var(--etat-stone-600)]"><span className="font-semibold text-[var(--etat-navy-950)]">{evidenceTypeLabels[evidence.type]}</span> — {evidence.label}</p>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Résultat</p>
        {situation.result ? (
          <>
            <p className="mt-1 text-sm text-[var(--etat-navy-950)]">{situation.result}</p>
            {situation.confirmation && <p className="mt-1 text-xs text-[var(--etat-stone-600)]">{situation.confirmation}</p>}
          </>
        ) : (
          <p className="mt-1 text-sm text-[var(--etat-stone-400)]">Effet à confirmer — aucun résultat constaté pour le moment.</p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Chaîne de valeur</p>
        <div className="mt-2 space-y-1.5">
          {valueTrail.map((step, index) => (
            <div key={step.key} className="flex items-start gap-2">
              <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${step.proven ? "bg-[var(--etat-navy-600)] text-white" : "border border-dashed border-[var(--etat-stone-400)] text-[var(--etat-stone-400)]"}`}>{index + 1}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--etat-navy-950)]">{step.label}{!step.proven && <span className="ml-1.5 font-normal text-[var(--etat-stone-400)]">— à confirmer</span>}</p>
                <p className="text-[11px] leading-4 text-[var(--etat-stone-600)]">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {situation.history.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Historique</p>
          <div className="mt-2 space-y-1.5 border-l border-[var(--etat-line)] pl-3">
            {situation.history.map((entry) => (
              <div key={entry.id} className="text-xs leading-4 text-[var(--etat-stone-600)]"><span className="font-semibold text-[var(--etat-navy-950)]">{entry.label}</span> · {new Date(entry.at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</div>
            ))}
          </div>
        </div>
      )}
      <button onClick={onPlanVisit} className="etat-btn etat-btn-primary w-full justify-center">Planifier une visite <ArrowRight size={15} /></button>
    </div>
  );
}

export function SignalForm({ territories, onDone }: { territories: Territory[]; onDone: () => void }) {
  const [category, setCategory] = useState<VigilanceCategory>("immigration_clandestine");
  const [territoryId, setTerritoryId] = useState("");
  const [severity, setSeverity] = useState<VigilanceSeverity>("moyenne");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/ministry/vigilance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category, territoryId, severity, description }) });
      const payload = await response.json();
      if (!response.ok) { setError(payload.error ?? "Impossible d’enregistrer ce signalement."); return; }
      onDone();
    } finally { setPending(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-xs font-semibold text-[var(--etat-navy-950)]">Catégorie<select value={category} onChange={(event) => setCategory(event.target.value as VigilanceCategory)} className="mt-1.5 w-full rounded-md border border-[var(--etat-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--etat-navy-600)]">{Object.entries(vigilanceCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="block text-xs font-semibold text-[var(--etat-navy-950)]">Territoire<select required value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 w-full rounded-md border border-[var(--etat-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--etat-navy-600)]"><option value="">Sélectionner…</option>{territories.map((territory) => <option key={territory.id} value={territory.id}>{territory.name}</option>)}</select></label>
      <label className="block text-xs font-semibold text-[var(--etat-navy-950)]">Gravité<select value={severity} onChange={(event) => setSeverity(event.target.value as VigilanceSeverity)} className="mt-1.5 w-full rounded-md border border-[var(--etat-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--etat-navy-600)]">{Object.entries(vigilanceSeverityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="block text-xs font-semibold text-[var(--etat-navy-950)]">Description<textarea required rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1.5 w-full rounded-md border border-[var(--etat-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--etat-navy-600)]" placeholder="Ce qui a été observé, où et par qui." /></label>
      {error && <p className="text-xs font-semibold text-[var(--etat-terracotta)]">{error}</p>}
      <button disabled={pending} className="etat-btn etat-btn-primary w-full justify-center disabled:opacity-60">Signaler <Send size={15} /></button>
    </form>
  );
}

export function MissionForm({ mission, onDone }: { mission: Mission; onDone: () => void }) {
  const [title, setTitle] = useState(`${fieldVisitObjectiveLabels[mission.suggestedObjective]} — ${mission.territoryLabel}`);
  const [plannedAt, setPlannedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/ministry/field-visits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, territoryId: mission.territoryId, objective: mission.suggestedObjective, plannedAt, notes: notes || undefined }) });
      const payload = await response.json();
      if (!response.ok) { setError(payload.error ?? "Impossible de planifier cette mission."); return; }
      onDone();
    } finally { setPending(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-lg bg-[var(--etat-offwhite)] p-3.5 text-xs leading-5 text-[var(--etat-navy-950)]"><strong>{mission.territoryLabel}</strong> — {mission.raison}</div>
      <label className="block text-xs font-semibold text-[var(--etat-navy-950)]">Titre<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-md border border-[var(--etat-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--etat-navy-600)]" /></label>
      <label className="block text-xs font-semibold text-[var(--etat-navy-950)]">Date prévue<input required type="date" value={plannedAt} onChange={(event) => setPlannedAt(event.target.value)} className="mt-1.5 w-full rounded-md border border-[var(--etat-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--etat-navy-600)]" /></label>
      <label className="block text-xs font-semibold text-[var(--etat-navy-950)]">Notes (facultatif)<textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1.5 w-full rounded-md border border-[var(--etat-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--etat-navy-600)]" /></label>
      {error && <p className="text-xs font-semibold text-[var(--etat-terracotta)]">{error}</p>}
      <button disabled={pending} className="etat-btn etat-btn-primary w-full justify-center disabled:opacity-60">Planifier la mission <ArrowRight size={15} /></button>
    </form>
  );
}
