"use client";

import { useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { DetailSurface } from "@/components/private/DetailSurface";
import { ProgrammePortfolioScatter } from "@/components/programmes/ProgrammePortfolioScatter";
import { ProgrammeCockpit } from "@/components/programmes/ProgrammeCockpit";
import { glyphBorderColor, initiativeStatusLabel, priorityToTag } from "@/components/etat/shared";
import { portfolioRows, portfolioStats, programmeHealthLabel, type ProgrammePortfolioRow } from "@/domain/programme-intelligence";
import { MARITIME_ZONE_LABEL, MARITIME_ZONE_ORDER, resolveMaritimeZone } from "@/domain/atlas-overview";

const compactMoney = new Intl.NumberFormat("fr-FR", { notation: "compact", style: "currency", currency: "XOF", maximumFractionDigits: 0 });
// Formateur dédié au h1 (LOT V3.22, "copie conforme littérale") — le
// style "currency" (compactMoney, ci-dessus, déjà utilisé par les tuiles
// de stat) rend "889 M F CFA" (espace parasite entre F et CFA, artefact
// de l'ICU fr-FR pour la devise XOF) ; la maquette écrit "889 M FCFA"
// sans espace — un formateur "decimal" + suffixe littéral reproduit
// exactement ce rendu.
const compactNumber = new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 0 });
function compactFcfa(amountFcfa: number): string {
  return `${compactNumber.format(amountFcfa)} FCFA`;
}
const FRENCH_PROGRAMME_COUNT = ["Zéro", "Un", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf", "Dix"];
function frenchProgrammeCount(n: number): string {
  const word = n >= 0 && n <= 10 ? FRENCH_PROGRAMME_COUNT[n] : String(n);
  return `${word} programme${n > 1 ? "s" : ""}`;
}
const healthColor: Record<string, string> = { aligne: "#4E7B5A", attention: "#D89A4A", critique: "#C8452B" };

// LOT V3.19 ("Programmes — copie conforme du rendu maquette") —
// reconstruction complète sur le plan exact de l'écran `isPortfolio` :
// bandeau plat (pas de photo, pas de bandeau "5 étapes" méthodologique —
// aucun des deux n'existe dans la maquette), waterfall budgétaire,
// cartographie (scatter, déjà réel — ProgrammePortfolioScatter, LOT
// V3.5) + jalons/couverture territoriale, puis le tableau des programmes
// (colonnes Programme/Phase/Avancement/Budget confirmé/Calendrier/
// Signaux terrain) au lieu des cartes empilées de la version précédente.
// Mandat explicite de l'utilisateur, identique aux LOTs V3.16-V3.18 :
// "j'oublie tout l'existant [...] copie conforme".
//
// "Jalons des 60 prochains jours" (mandat, non négociable — même
// discipline que le LOT V3.5, "DO NOT add Initiative.milestones yet") :
// aucun champ de jalon programme daté dans le futur n'existe dans le
// Core (programmeMilestones, déjà réel, ne porte que des évènements
// PASSÉS — audit/engagements/résultats déjà survenus). Plutôt que
// fabriquer un calendrier de jalons, ce panneau réutilise les VRAIES
// échéances déjà réelles à l'échelle d'une situation (Situation.dueAt,
// déjà utilisé au Brief national LOT V3.16) parmi celles rattachées à un
// programme — un jalon honnête, jamais un calendrier inventé.
//
// Le dossier complet d'un programme (drill-in, écran `isProgDetail` de
// la maquette — gauges, jalons, budget détaillé) reste ProgrammeCockpit
// (LOT V3.5, déjà réel et déjà testé) ouvert en survol via DetailSurface
// plutôt que reconstruit en page plein écran : un composant partagé avec
// le poste de travail Coordination, jamais une 2e implémentation.
export default function ProgrammesPage() {
  const { state, role, run } = useProduct();
  const [dossierInitiativeId, setDossierInitiativeId] = useState<string | null>(null);

  if (!state) return null;

  const rows = portfolioRows(state);
  const stats = portfolioStats(state, rows);

  // Waterfall budgétaire — répartition réelle des lignes de financement
  // (Funding.status), jamais un montant fabriqué.
  const allFunding = state.initiatives.flatMap((item) => item.funding);
  const budgetBuckets = ([
    { key: "confirme", label: "Confirmé", color: "#4E7B5A" },
    { key: "en_instruction", label: "En instruction", color: "#D89A4A" },
    { key: "a_mobiliser", label: "À mobiliser", color: "rgba(11,26,42,.25)" }
  ] as const).map((bucket) => ({ ...bucket, total: allFunding.filter((f) => f.status === bucket.key).reduce((sum, f) => sum + f.amountFcfa, 0) }));
  const budgetTotal = Math.max(1, budgetBuckets.reduce((sum, b) => sum + b.total, 0));
  const confirmedBudgetPct = Math.round(((budgetBuckets.find((b) => b.key === "confirme")?.total ?? 0) / budgetTotal) * 100);

  // Jalons — voir commentaire d'en-tête : échéances réelles (Situation.
  // dueAt, futures) parmi les situations rattachées à un programme.
  const referenceMs = Date.now();
  const upcomingMilestones = state.initiatives
    .flatMap((programme) => programme.situationIds
      .map((id) => state.situations.find((item) => item.id === id))
      .filter((item): item is NonNullable<typeof item> => item != null && item.dueAt != null)
      .map((situation) => ({ programme, situation, dueAt: new Date(situation.dueAt!).getTime() })))
    .filter((item) => item.dueAt >= referenceMs - 86_400_000 * 60)
    .sort((a, b) => a.dueAt - b.dueAt)
    .slice(0, 5);

  // Couverture territoriale par façade maritime réelle (LOT V3.4,
  // domain/atlas-overview.ts) — % de territoires de la façade couverts
  // par au moins un programme.
  const coverageByZone = MARITIME_ZONE_ORDER.map((zone) => {
    const territoriesInZone = state.territories.filter((t) => resolveMaritimeZone(t.id) === zone);
    const covered = territoriesInZone.filter((t) => state.initiatives.some((p) => p.territoryIds.includes(t.id))).length;
    return { zone, covered, total: territoriesInZone.length };
  }).filter((item) => item.total > 0);

  const sortedRows = [...rows].sort((a, b) => (b.progressPct ?? -1) - (a.progressPct ?? -1));
  const dossierInitiative = dossierInitiativeId ? state.initiatives.find((item) => item.id === dossierInitiativeId) ?? null : null;

  return (
    <div className="mb-rise px-4 pb-16 pt-6 sm:px-[30px]">
      {/* lg:flex-row (pas sm:) : les 4 tuiles de stat (min-w-[104px]
          chacune, ~440px+bordures au total) débordaient à 768px quand
          elles partageaient la ligne avec le titre dès 640px — trouvé en
          QA réelle. Empilées jusqu'à 1024px, elles peuvent alors
          librement passer sur 2 rangées (flex-wrap) sans pousser la
          page en largeur. */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-[26px]">
        <div className="min-w-0 flex-1">
          <p className="etat-eyebrow">Portefeuille de programmes</p>
          {/* h1 littéral de la maquette ("{N} programmes, {montant}
              identifiés, {pct} % confirmés") — mêmes 3 chiffres réels que
              les tuiles de stat et le waterfall ci-dessous, jamais un
              4e calcul divergent. */}
          <h1 className="mt-2.5 max-w-[32ch] font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 32, lineHeight: 1.15, color: "var(--etat-navy)" }}>
            {frenchProgrammeCount(state.initiatives.length)}, {compactFcfa(stats.totalBudgetFcfa)} identifiés, {confirmedBudgetPct} % confirmés
          </h1>
        </div>
        <div className="flex flex-wrap gap-px border lg:flex-none" style={{ background: "rgba(11,26,42,.12)", borderColor: "rgba(11,26,42,.12)" }}>
          {[
            { v: stats.active, k: "Actifs" },
            { v: stats.attentionOrCritical, k: "À surveiller" },
            { v: stats.territoriesCovered, k: "Territoires" },
            { v: compactMoney.format(stats.totalBudgetFcfa), k: "Budget chiffré" }
          ].map((stat) => (
            <div key={stat.k} className="min-w-[104px] bg-white px-[18px] py-3">
              <p style={{ fontFamily: "var(--etat-font-mono)", fontSize: 22, lineHeight: 1, color: "var(--etat-navy)" }}>{stat.v}</p>
              <p className="mt-1.5 text-[10px] uppercase leading-[1.3] tracking-[.07em]" style={{ color: "rgba(11,26,42,.5)" }}>{stat.k}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border p-[17px]" style={{ borderColor: "rgba(11,26,42,.12)" }}>
        <div className="mb-3.5 flex flex-wrap items-baseline gap-3">
          <p className="text-[10px] uppercase tracking-[.12em]" style={{ color: "rgba(11,26,42,.5)" }}>Du montant identifié à la dépense réelle</p>
          <p className="text-[11px]" style={{ color: "rgba(11,26,42,.5)" }}>Saisies manuelles — aucun système budgétaire connecté</p>
        </div>
        <div className="flex h-[38px] gap-0.5">
          {budgetBuckets.map((bucket) => (
            <div key={bucket.key} className="flex items-center overflow-hidden px-3" style={{ width: `${(bucket.total / budgetTotal) * 100}%`, background: bucket.color, minWidth: bucket.total > 0 ? 8 : 0 }}>
              {bucket.total > 0 && <span className="whitespace-nowrap text-[12.5px]" style={{ fontFamily: "var(--etat-font-mono)", color: bucket.key === "a_mobiliser" ? "var(--etat-navy)" : "#F7F3E9" }}>{compactMoney.format(bucket.total)}</span>}
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex gap-0.5">
          {budgetBuckets.map((bucket) => (
            <div key={bucket.key} className="truncate px-3 text-[10.5px]" style={{ width: `${(bucket.total / budgetTotal) * 100}%`, color: "rgba(11,26,42,.55)" }}>{bucket.label}</div>
          ))}
        </div>
      </div>

      {/* min-w-0 sur les 2 enfants : sans lui, le contenu min-content du
          panneau de droite (libellés longs, lignes d'échéance) pousse
          toute la piste de grille (donc la page) en largeur à 1024/768 —
          même piège CSS Grid déjà rencontré et documenté aux LOTs
          V3.6/V3.17. */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="shadcn-scope min-w-0 border" style={{ borderColor: "rgba(11,26,42,.12)" }}>
          <div className="px-5 pb-1.5 pt-4">
            <p className="font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 20, color: "var(--etat-navy)" }}>Cartographie du portefeuille</p>
            <p className="mt-1 text-[11.5px]" style={{ color: "rgba(11,26,42,.52)" }}>Avancement × financement confirmé — taille : territoires couverts, couleur : santé déclarée</p>
          </div>
          <div className="px-5 pb-4">
            <ProgrammePortfolioScatter rows={rows} onSelect={setDossierInitiativeId} />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <div style={{ background: "var(--etat-navy)", color: "#F7F3E9" }}>
            <div className="px-[18px] pb-3 pt-4">
              <p className="font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 19 }}>Prochaines échéances réelles</p>
              <p className="mt-1 text-[11.5px]" style={{ color: "rgba(247,243,233,.55)" }}>Situations à échéance rattachées à un programme</p>
            </div>
            {upcomingMilestones.length === 0 ? (
              <p className="px-[18px] pb-4 text-[12px] leading-[1.55]" style={{ color: "rgba(247,243,233,.6)" }}>Aucune situation rattachée à un programme ne porte d’échéance documentée pour le moment.</p>
            ) : upcomingMilestones.map(({ programme, situation, dueAt }) => (
              <div key={situation.id} className="flex items-center gap-3 border-t px-[18px] py-2.5" style={{ borderColor: "rgba(247,243,233,.1)" }}>
                <span className="w-[52px] shrink-0 text-[12px]" style={{ fontFamily: "var(--etat-font-mono)", color: "#DE9C74" }}>{new Date(dueAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium">{situation.title}</p>
                  <p className="mt-0.5 truncate text-[10.5px]" style={{ color: "rgba(247,243,233,.55)" }}>{programme.title}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border" style={{ borderColor: "rgba(11,26,42,.12)" }}>
            <div className="border-b px-[18px] pb-3 pt-4" style={{ borderColor: "rgba(11,26,42,.09)" }}>
              <p className="font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 19, color: "var(--etat-navy)" }}>Couverture territoriale</p>
              <p className="mt-1 text-[11.5px]" style={{ color: "rgba(11,26,42,.52)" }}>Territoires couverts par au moins un programme, par façade</p>
            </div>
            <div className="px-[18px] py-4">
              {coverageByZone.map((item) => (
                <div key={item.zone} className="mb-2.5 flex items-center gap-3">
                  <span className="w-24 shrink-0 text-[11.5px]" style={{ color: "rgba(11,26,42,.7)" }}>{MARITIME_ZONE_LABEL[item.zone]}</span>
                  <span className="relative h-3.5 flex-1" style={{ background: "rgba(11,26,42,.07)" }}><span className="absolute inset-y-0 left-0" style={{ width: `${(item.covered / item.total) * 100}%`, background: "var(--etat-terracotta)" }} /></span>
                  <span className="w-11 shrink-0 text-right text-[11.5px]" style={{ fontFamily: "var(--etat-font-mono)" }}>{item.covered}/{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 border" style={{ borderColor: "rgba(11,26,42,.12)" }}>
        <div className="border-b px-5 py-[15px]" style={{ borderColor: "rgba(11,26,42,.1)" }}>
          <p className="font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 20, color: "var(--etat-navy)" }}>Les {sortedRows.length} programmes</p>
        </div>
        <div className="hidden items-center gap-3 px-5 py-2.5 text-[9.5px] uppercase tracking-[.1em] lg:flex" style={{ background: "rgba(11,26,42,.03)", borderBottom: "1px solid rgba(11,26,42,.08)", color: "rgba(11,26,42,.45)" }}>
          <div className="flex-1">Programme</div>
          <div className="w-24 shrink-0">Phase</div>
          <div className="w-32 shrink-0">Avancement</div>
          <div className="w-32 shrink-0">Budget confirmé</div>
          <div className="w-24 shrink-0">Calendrier</div>
          <div className="w-36 shrink-0">Signaux terrain</div>
        </div>
        {sortedRows.map((row: ProgrammePortfolioRow) => {
          const nearestDue = row.initiative.situationIds
            .map((id) => state.situations.find((s) => s.id === id)?.dueAt)
            .filter((value): value is string => Boolean(value))
            .sort()[0];
          const criticalCount = row.ecosystem.openSituations.filter((s) => s.priority === "critique" || s.priority === "haute").length;
          return (
            <button key={row.initiative.id} onClick={() => setDossierInitiativeId(row.initiative.id)} className="flex w-full flex-col gap-2.5 border-b px-5 py-[13px] text-left lg:flex-row lg:items-center lg:gap-3" style={{ borderColor: "rgba(11,26,42,.06)" }}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="size-[7px] shrink-0 rounded-full" style={{ background: healthColor[row.health.state] }} />
                  <span className="truncate text-[13.5px] font-medium">{row.initiative.title}</span>
                </div>
                <p className="mt-1 truncate pl-4 text-[11px]" style={{ color: "rgba(11,26,42,.5)" }}>{programmeHealthLabel[row.health.state]} · {row.territoryCount} territoire(s)</p>
              </div>
              <div className="w-full text-[11.5px] lg:w-24" style={{ color: "rgba(11,26,42,.7)" }}>{initiativeStatusLabel[row.initiative.status]}</div>
              <div className="w-full lg:w-32">
                <div className="relative h-[5px]" style={{ background: "rgba(11,26,42,.1)" }}><span className="absolute inset-y-0 left-0" style={{ width: `${row.progressPct ?? 0}%`, background: "var(--etat-navy)" }} /></div>
                <p className="mt-1 text-[11px]" style={{ fontFamily: "var(--etat-font-mono)", color: "rgba(11,26,42,.65)" }}>{row.progressPct !== null ? `${row.progressPct}%` : "—"}</p>
              </div>
              <div className="w-full lg:w-32">
                <div className="relative h-[5px]" style={{ background: "rgba(11,26,42,.1)" }}><span className="absolute inset-y-0 left-0" style={{ width: `${row.budgetConfirmedPct ?? 0}%`, background: "#4E7B5A" }} /></div>
                <p className="mt-1 text-[11px]" style={{ fontFamily: "var(--etat-font-mono)", color: "#4E7B5A" }}>{row.budgetConfirmedPct !== null ? `${row.budgetConfirmedPct}%` : "à estimer"}</p>
              </div>
              <div className="w-full text-[11.5px] lg:w-24" style={{ fontFamily: "var(--etat-font-mono)", color: nearestDue ? "var(--etat-navy)" : "rgba(11,26,42,.4)" }}>{nearestDue ? new Date(nearestDue).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—"}</div>
              <div className="flex w-full items-center gap-[7px] lg:w-36">
                {row.ecosystem.openSituations.slice(0, 3).map((situation) => (
                  <span key={situation.id} className="size-2 shrink-0 rounded-[2px]" style={{ background: glyphBorderColor[priorityToTag[situation.priority]] }} />
                ))}
                <span className="text-[11px]" style={{ color: criticalCount > 0 ? "var(--etat-critique)" : "rgba(11,26,42,.5)" }}>{row.ecosystem.openSituations.length} situation(s)</span>
              </div>
            </button>
          );
        })}
      </div>

      <DetailSurface open={dossierInitiative !== null} onOpenChange={(open) => !open && setDossierInitiativeId(null)} eyebrow="Dossier programme" title={dossierInitiative?.title ?? ""} size="lg">
        <div className="shadcn-scope">
          {dossierInitiative && <ProgrammeCockpit initiative={dossierInitiative} state={state} role={role} run={run} canAct={false} />}
        </div>
      </DetailSurface>
    </div>
  );
}
