"use client";

import Link from "next/link";
import { ArrowLeft, Compass, Download, Handshake, Printer, ShieldAlert, Users } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { generateNationalSnapshot } from "@/domain/national/national-engine";
import { NumberTicker } from "@/components/magicui/number-ticker";
import type { TrustLevel } from "@/domain/types";

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
  lines.push(`## Programmes et financements`);
  lines.push("");
  for (const initiative of state.initiatives) {
    const confirmed = initiative.funding.filter((f) => f.status === "confirme").reduce((sum, f) => sum + f.amountFcfa, 0);
    const budgetText = initiative.budgetFcfa !== undefined
      ? `${new Intl.NumberFormat("fr-FR").format(initiative.budgetFcfa)} FCFA`
      : "à estimer";
    lines.push(`- **${initiative.title}** — ${initiative.objective}. Budget : ${budgetText}, dont ${new Intl.NumberFormat("fr-FR").format(confirmed)} FCFA confirmés.`);
  }
  return lines.join("\n");
}

export default function EtatReportPage() {
  const { state } = useProduct();
  if (!state) return null;

  const snapshot = generateNationalSnapshot(state);

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

        <article className="etat-panel p-6">
          <h2 className="etat-display text-lg not-italic text-[var(--etat-navy-950)]">Programmes et financements</h2>
          <div className="mt-4 divide-y divide-[var(--etat-line)]">
            {state.initiatives.map((initiative) => {
              const confirmed = initiative.funding.filter((f) => f.status === "confirme").reduce((sum, f) => sum + f.amountFcfa, 0);
              return (
                <div key={initiative.id} className="py-3.5 first:pt-0 last:pb-0">
                  <p className="text-sm font-bold text-[var(--etat-navy-950)]">{initiative.title}</p>
                  <p className="mt-1 text-xs text-[var(--etat-stone-600)]">{initiative.objective}</p>
                  <p className="mt-1.5 text-xs font-semibold text-[var(--etat-navy-600)]">{initiative.budgetFcfa !== undefined ? `${new Intl.NumberFormat("fr-FR").format(initiative.budgetFcfa)} FCFA de budget` : "Budget à estimer"}, dont {new Intl.NumberFormat("fr-FR").format(confirmed)} FCFA confirmés.</p>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </div>
  );
}
