"use client";

import Link from "next/link";
import { ArrowLeft, Compass, Download, Handshake, Printer, ShieldAlert, Users } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { generateNationalSnapshot } from "@/domain/national/national-engine";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { EngagementIcon, PreuveIcon, ResultatIcon, SituationIcon } from "@/components/etat/MotifIcons";
import { decisionTypeLabels, evidenceTypeLabels, type Funding, type TrustLevel } from "@/domain/types";

// Audit DA Premium XXL v2 (mandat CEO 2026-08-19, arbitrage gap analysis
// /app/etat/rapport). 4 lots, dans l'ordre approuvé :
// Lot A — executive summary + couverture institutionnelle
//   (generateNationalSnapshot, déjà réutilisé par le Pilotage — aucun
//   nouveau calcul d'agrégat).
// Lot B — baseline/actuel/cible (Initiative.indicators) + financements
//   détaillés par statut/bailleur (Funding, imbriqué dans Initiative).
// Lot C — chaîne situation → intervention → résultat → preuve, limitée
//   au sous-ensemble avec result renseigné ET au moins une Evidence liée
//   (compteur honnête, cf. gap analysis — 30 situations n'ont pas toutes
//   un dossier complet).
// Lot D — réorganisation visuelle (regroupement des cartes de rapport,
//   mise en avant confiance/source, contrôle de la longueur mobile).
// Aucune modification du modèle de données, des moteurs métier, ni de
// l'Atlas spatial dans ce mandat.

const trustLabels: Record<TrustLevel, string> = {
  declaree: "Déclarée",
  observee: "Observée",
  verifiee: "Vérifiée",
  consolidee: "Consolidée",
  rapprochee: "Rapprochée",
  documentee: "Documentée",
  officielle: "Officielle",
  estimee: "Estimée",
  contestee: "Contestée",
  expiree: "Expirée"
};
const trustTagClass: Record<TrustLevel, string> = {
  declaree: "etat-tag--demo",
  observee: "etat-tag--vigilance",
  verifiee: "etat-tag--reel",
  consolidee: "etat-tag--stable",
  rapprochee: "etat-tag--vigilance",
  documentee: "etat-tag--stable",
  officielle: "etat-tag--reel",
  estimee: "etat-tag--demo",
  contestee: "etat-tag--critique",
  expiree: "etat-tag--critique"
};

// Lot B — mêmes libellés que /app/app/(coordination)/initiatives/page.tsx
// (page interne, non modifiée) pour ne pas introduire un 3e vocabulaire
// de statut de financement.
const fundingStatusLabel: Record<Funding["status"], string> = {
  a_mobiliser: "À mobiliser",
  en_instruction: "En instruction",
  confirme: "Confirmé"
};
const fundingTagClass: Record<Funding["status"], string> = {
  a_mobiliser: "etat-tag--stable",
  en_instruction: "etat-tag--vigilance",
  confirme: "etat-tag--reel"
};

function formatFcfa(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(amount))} FCFA`;
}

// Baseline → actuel → cible : formule générique qui fonctionne aussi
// pour les indicateurs à réduire (ex. délai médian, cible < baseline),
// pas seulement current/target — sinon un indicateur en cours de baisse
// afficherait une progression fausse.
function indicatorProgress(indicator: { baseline: number; target: number; current: number }) {
  const span = indicator.target - indicator.baseline;
  if (span === 0) return 100;
  return Math.min(100, Math.max(0, Math.round(((indicator.current - indicator.baseline) / span) * 100)));
}

function buildMarkdown(state: NonNullable<ReturnType<typeof useProduct>["state"]>) {
  const lines: string[] = [];
  lines.push(`# Rapport d'impact — Mbàmbulaan`);
  lines.push("");
  lines.push(`Environnement : ${state.tenant.name} · Généré le ${new Date().toLocaleDateString("fr-FR")}`);
  lines.push("");
  lines.push(`> Les valeurs non marquées « Vérifiée » ou « Consolidée » sont des données de démonstration et ne constituent pas des statistiques officielles.`);
  lines.push("");
  for (const report of state.reports) {
    lines.push(`## ${report.title}`);
    lines.push(`_${report.period} · Territoires : ${report.territoryIds.map((id) => state.territories.find((t) => t.id === id)?.name ?? id).join(", ")}_`);
    lines.push("");
    for (const metric of report.metrics) {
      lines.push(`- **${metric.label}** : ${metric.value} — source : ${metric.source} (${trustLabels[metric.trust]}). ${metric.limit}`);
    }
    lines.push("");
  }
  const documented = state.situations.filter(
    (situation) => situation.result && state.evidences.some((evidence) => evidence.situationId === situation.id)
  );
  lines.push(`## Situation initiale → intervention → résultat → preuve`);
  lines.push("");
  lines.push(`_${documented.length} situation(s) avec dossier complet sur ${state.situations.length}. Les autres restent en cours ou sans preuve documentée et ne sont pas listées ici._`);
  lines.push("");
  for (const situation of documented) {
    const decision = state.decisions.find((item) => item.situationId === situation.id);
    const evidences = state.evidences.filter((item) => item.situationId === situation.id);
    const territory = state.territories.find((item) => item.id === situation.territoryId);
    lines.push(`### ${situation.title} (${territory?.name ?? situation.territoryId})`);
    lines.push(`- Situation initiale : ${situation.description}`);
    lines.push(`- Intervention : ${decision ? `${decisionTypeLabels[decision.type]} — ${decision.rationale}` : "Aucune décision enregistrée."}`);
    lines.push(`- Résultat : ${situation.result}`);
    for (const evidence of evidences) {
      lines.push(`- Preuve (${evidenceTypeLabels[evidence.type]}) : ${evidence.label} — ${evidence.detail}`);
    }
    lines.push("");
  }
  lines.push(`## Programmes et financements`);
  lines.push("");
  for (const initiative of state.initiatives) {
    const confirmed = initiative.funding.filter((f) => f.status === "confirme").reduce((sum, f) => sum + f.amountFcfa, 0);
    const budgetText = initiative.budgetFcfa !== undefined
      ? `${new Intl.NumberFormat("fr-FR").format(initiative.budgetFcfa)} FCFA`
      : "à estimer";
    lines.push(`### ${initiative.title}`);
    lines.push(`${initiative.objective}. Budget : ${budgetText}, dont ${new Intl.NumberFormat("fr-FR").format(confirmed)} FCFA confirmés.`);
    if (initiative.indicators.length === 0) {
      lines.push(`_Aucun indicateur défini pour ce programme — encore au stade cadrage._`);
    } else {
      for (const indicator of initiative.indicators) {
        lines.push(`- ${indicator.label} : ${indicator.baseline}${indicator.unit} (baseline) → ${indicator.current}${indicator.unit} (actuel) → ${indicator.target}${indicator.unit} (cible)`);
      }
    }
    if (initiative.funding.length > 0) {
      for (const fund of initiative.funding) {
        const partner = state.actors.find((item) => item.id === fund.partnerId);
        lines.push(`- Financement ${partner?.name ?? fund.partnerId} : ${new Intl.NumberFormat("fr-FR").format(fund.amountFcfa)} FCFA (${fundingStatusLabel[fund.status]}) — ${fund.condition}`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

export default function EtatReportPage() {
  const { state } = useProduct();
  if (!state) return null;

  const snapshot = generateNationalSnapshot(state);

  // Lot C — seuil de sélection retenu par le CEO (arbitrage 2026-08-19) :
  // result renseigné ET au moins une Evidence liée. Sur 30 situations,
  // seules 11 remplissent les deux conditions — compteur honnête affiché,
  // pas une narration forcée sur l'ensemble des situations.
  const documentedSituations = state.situations.filter(
    (situation) => situation.result && state.evidences.some((evidence) => evidence.situationId === situation.id)
  );

  const download = () => {
    const markdown = buildMarkdown(state);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rapport-impact-mbambulaan-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="etat-scope">
      <div className="mx-5 mt-5 flex flex-wrap items-center justify-between gap-3 lg:mx-8 lg:mt-6">
        <Link href="/app/etat" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--etat-navy-800)]"><ArrowLeft size={15} /> Retour à l’Espace État</Link>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="etat-btn etat-btn-outline"><Printer size={15} /> Version imprimable</button>
          <button onClick={download} className="etat-btn etat-btn-primary"><Download size={15} /> Télécharger (.md)</button>
        </div>
      </div>

      <section className="etat-canvas-dark mx-5 mt-5 rounded-[28px] p-8 lg:mx-8 lg:p-10">
        <p className="etat-eyebrow etat-eyebrow--on-dark">Rapport bailleurs</p>
        <h1 className="etat-display mt-3 text-2xl not-italic text-white md:text-3xl">Impact de la coordination, territoire par territoire.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Généré depuis l’environnement {state.tenant.name}, le {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}. Préparé pour faciliter vos échanges avec les partenaires et bailleurs.</p>

        {/* Executive summary — Lot A. Chiffres inline sur la toile sombre
            (même doctrine §17 que /app/etat), agrégat déjà calculé par
            generateNationalSnapshot (réutilisé tel quel, également
            consommé par le Pilotage) : aucun nouveau calcul introduit. */}
        <div className="mt-7 grid grid-cols-2 gap-6 border-t border-white/15 pt-6 sm:grid-cols-4">
          <div>
            <Compass size={18} color="var(--etat-ocre-dim)" />
            <p className="etat-display mt-2 text-2xl not-italic text-white"><NumberTicker value={snapshot.territories} /></p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/55">Territoires suivis</p>
          </div>
          <div>
            <ShieldAlert size={18} color="var(--etat-ocre-dim)" />
            <p className="etat-display mt-2 text-2xl not-italic text-white"><NumberTicker value={snapshot.activeSituations} /></p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/55">Situations actives{snapshot.criticalSituations > 0 ? ` · ${snapshot.criticalSituations} critique${snapshot.criticalSituations > 1 ? "s" : ""}` : ""}</p>
          </div>
          <div>
            <Users size={18} color="var(--etat-ocre-dim)" />
            <p className="etat-display mt-2 text-2xl not-italic text-white"><NumberTicker value={snapshot.actors} /></p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/55">Acteurs mobilisés</p>
          </div>
          <div>
            <Handshake size={18} color="var(--etat-ocre-dim)" />
            <p className="etat-display mt-2 text-2xl not-italic text-white"><NumberTicker value={snapshot.opportunities} /></p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/55">Opportunités de coordination</p>
          </div>
        </div>
      </section>

      <div className="mx-5 mt-8 space-y-6 pb-16 lg:mx-8">
        {state.reports.map((report) => (
          <article key={report.id} className="etat-panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="etat-display text-lg not-italic text-[var(--etat-navy-950)]">{report.title}</h2>
                <p className="mt-1 text-xs text-[var(--etat-stone-600)]">{report.period} · {report.territoryIds.map((id) => state.territories.find((t) => t.id === id)?.name ?? id).join(", ")}</p>
              </div>
              <span className={`etat-tag ${report.status === "pret" ? "etat-tag--reel" : "etat-tag--vigilance"}`}>{report.status === "pret" ? "Prêt" : "À actualiser"}</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {report.metrics.map((metric) => (
                <div key={metric.label} className="etat-panel--warm p-4">
                  <p className="etat-display text-xl not-italic text-[var(--etat-navy-950)]">{metric.value}</p>
                  <p className="mt-1 text-xs font-bold text-[var(--etat-navy-800)]">{metric.label}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`etat-tag ${trustTagClass[metric.trust]}`}>{trustLabels[metric.trust]}</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-4 text-[var(--etat-stone-400)]">{metric.source} — {metric.limit}</p>
                </div>
              ))}
            </div>
          </article>
        ))}

        {/* Lot C — chaîne situation initiale → intervention → résultat →
            preuve, limitée au sous-ensemble réellement documenté
            (cf. documentedSituations ci-dessus). Preuves rendues en
            cartes texte typées (evidenceTypeLabels), jamais une image
            fabriquée — Evidence.type === "photo" n'a aucun champ image
            réel dans le modèle, même discipline que SituationRoom.tsx. */}
        <article className="etat-panel p-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="etat-display text-lg not-italic text-[var(--etat-navy-950)]">Situation initiale → intervention → résultat → preuve</h2>
            <span className="etat-tag etat-tag--stable whitespace-normal text-left">{documentedSituations.length} situation(s) avec dossier complet sur {state.situations.length}</span>
          </div>
          <p className="mt-1 text-xs text-[var(--etat-stone-600)]">Sous-ensemble des situations avec un résultat renseigné et au moins une preuve enregistrée. Les autres situations restent en cours ou sans preuve documentée et ne sont pas incluses ici.</p>

          <div className="mt-5 space-y-5">
            {documentedSituations.map((situation) => {
              const decision = state.decisions.find((item) => item.situationId === situation.id);
              const evidences = state.evidences.filter((item) => item.situationId === situation.id);
              const territory = state.territories.find((item) => item.id === situation.territoryId);
              return (
                <div key={situation.id} className="etat-panel--warm p-5">
                  <p className="text-sm font-bold text-[var(--etat-navy-950)]">{situation.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--etat-stone-600)]">{territory?.name ?? situation.territoryId}</p>

                  <div className="mt-4 grid gap-4 border-t border-[var(--etat-line)] pt-4 md:grid-cols-4">
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]"><SituationIcon size={13} color="var(--etat-navy-600)" /> Situation initiale</p>
                      <p className="mt-1.5 text-xs leading-5 text-[var(--etat-navy-800)]">{situation.description}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]"><EngagementIcon size={13} color="var(--etat-navy-600)" /> Intervention</p>
                      {decision ? (
                        <p className="mt-1.5 text-xs leading-5 text-[var(--etat-navy-800)]"><span className="font-semibold">{decisionTypeLabels[decision.type]}</span> — {decision.rationale}</p>
                      ) : (
                        <p className="mt-1.5 text-xs text-[var(--etat-stone-400)]">Aucune décision enregistrée.</p>
                      )}
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]"><ResultatIcon size={13} color="var(--etat-terracotta)" /> Résultat</p>
                      <p className="mt-1.5 text-xs leading-5 text-[var(--etat-navy-800)]">{situation.result}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]"><PreuveIcon size={13} color="var(--etat-terracotta)" /> Preuve{evidences.length > 1 ? "s" : ""}</p>
                      <div className="mt-1.5 space-y-2">
                        {evidences.map((evidence) => (
                          <div key={evidence.id}>
                            <p className="text-xs font-semibold text-[var(--etat-navy-800)]">{evidenceTypeLabels[evidence.type]} — {evidence.label}</p>
                            <p className="text-[11px] leading-4 text-[var(--etat-stone-400)]">{evidence.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="etat-panel p-6">
          <h2 className="etat-display text-lg not-italic text-[var(--etat-navy-950)]">Programmes et financements</h2>
          <p className="mt-1 text-xs text-[var(--etat-stone-600)]">Baseline, actuel et cible par indicateur ; financement détaillé par bailleur et par statut.</p>
          {/* Lot B : chaque initiative expose désormais ses indicateurs
              réels (Initiative.indicators) et son financement ventilé
              par bailleur (Initiative.funding → state.actors), plutôt
              que la seule somme confirmée. init-lompoul-balises a 0
              indicateur et 0 financement — repli honnête affiché tel
              quel, jamais masqué ni fabriqué. */}
          <div className="mt-5 space-y-5">
            {state.initiatives.map((initiative) => {
              const confirmed = initiative.funding.filter((f) => f.status === "confirme").reduce((sum, f) => sum + f.amountFcfa, 0);
              const totalFunding = initiative.funding.reduce((sum, f) => sum + f.amountFcfa, 0);
              return (
                <div key={initiative.id} className="etat-panel--warm p-5">
                  <p className="text-sm font-bold text-[var(--etat-navy-950)]">{initiative.title}</p>
                  <p className="mt-1 text-xs text-[var(--etat-stone-600)]">{initiative.objective}</p>
                  <p className="mt-1.5 text-xs font-semibold text-[var(--etat-navy-600)]">{initiative.budgetFcfa !== undefined ? `${formatFcfa(initiative.budgetFcfa)} de budget` : "Budget à estimer"}, dont {formatFcfa(confirmed)} confirmés.</p>

                  <div className="mt-4 grid gap-6 border-t border-[var(--etat-line)] pt-4 lg:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Baseline → actuel → cible</p>
                      {initiative.indicators.length === 0 ? (
                        <p className="mt-2 text-xs text-[var(--etat-stone-400)]">Aucun indicateur défini pour ce programme — encore au stade cadrage.</p>
                      ) : (
                        <div className="mt-3 space-y-4">
                          {initiative.indicators.map((indicator) => (
                            <div key={indicator.label}>
                              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs">
                                <span className="font-semibold text-[var(--etat-navy-800)]">{indicator.label}</span>
                                <span className="text-[var(--etat-stone-600)]">{indicator.baseline}{indicator.unit} → {indicator.current}{indicator.unit} → {indicator.target}{indicator.unit}</span>
                              </div>
                              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--etat-line)]">
                                <div className="h-full rounded-full bg-[var(--etat-terracotta)]" style={{ width: `${indicatorProgress(indicator)}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Financement par bailleur</p>
                      {initiative.funding.length === 0 ? (
                        <p className="mt-2 text-xs text-[var(--etat-stone-400)]">Aucun financement engagé pour le moment.</p>
                      ) : (
                        <div className="mt-3 divide-y divide-[var(--etat-line)]">
                          {initiative.funding.map((fund) => {
                            const partner = state.actors.find((item) => item.id === fund.partnerId);
                            return (
                              <div key={fund.id} className="py-2.5 first:pt-0 last:pb-0">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-[var(--etat-navy-950)]">{partner?.name ?? fund.partnerId}</span>
                                  <span className={`etat-tag ${fundingTagClass[fund.status]}`}>{fundingStatusLabel[fund.status]}</span>
                                </div>
                                <p className="mt-1 text-xs text-[var(--etat-stone-600)]">{formatFcfa(fund.amountFcfa)}</p>
                                <p className="mt-1 text-[11px] leading-4 text-[var(--etat-stone-400)]">{fund.condition}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {totalFunding > 0 && <p className="mt-3 text-xs font-semibold text-[var(--etat-navy-600)]">{formatFcfa(confirmed)} confirmés sur {formatFcfa(totalFunding)} identifiés.</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </div>
  );
}
