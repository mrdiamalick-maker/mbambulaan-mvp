"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, CircleCheckBig, Download, FileCheck2, HandCoins, MapPinned, Printer, ShieldCheck } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import type { TrustLevel } from "@/domain/types";

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

  const readyReports = state.reports.filter((report) => report.status === "pret").length;
  const coveredTerritories = new Set(state.reports.flatMap((report) => report.territoryIds)).size;
  const documentedMetrics = state.reports.reduce((total, report) => total + report.metrics.length, 0);
  const confirmedFunding = state.initiatives.flatMap((initiative) => initiative.funding).filter((funding) => funding.status === "confirme").reduce((total, funding) => total + funding.amountFcfa, 0);

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
    <div className="etat-scope min-h-screen">
      <div className="etat-page space-y-8">
        <div className="etat-print-hidden flex flex-wrap items-center justify-between gap-3">
          <Link href="/app/etat" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-bold text-[var(--etat-navy-800)] transition hover:bg-white hover:text-[var(--etat-sea-700)]"><ArrowLeft size={15} /> Retour à la vue nationale</Link>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="etat-btn etat-btn-outline"><Printer size={15} /> Imprimer</button>
            <button onClick={download} className="etat-btn etat-btn-primary"><Download size={15} /> Télécharger le rapport</button>
          </div>
        </div>

        <section className="etat-briefing" aria-labelledby="report-title">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3">
              <p className="etat-eyebrow">Rapport de coordination</p>
              <span className="etat-tag etat-tag--demo">Données de démonstration</span>
            </div>
            <h1 id="report-title" className="etat-display mt-4 max-w-4xl text-3xl leading-[1.1] not-italic text-[var(--etat-navy-950)] sm:text-4xl lg:text-5xl">Des résultats lisibles, des limites explicites, des programmes finançables.</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--etat-stone-600)]">Ce document transforme les traces de coordination en une lecture partageable : ce qui s’est passé, ce qui a été obtenu, comment l’information a été construite et ce qui reste à confirmer.</p>
          </div>

          <div className="etat-briefing__note">
            <p className="text-[11px] font-black uppercase tracking-[.14em] text-[var(--etat-sea-700)]">Édition présentée</p>
            <p className="etat-display mt-3 text-xl not-italic text-[var(--etat-navy-950)]">{state.tenant.name}</p>
            <div className="mt-5 space-y-3 text-sm text-[var(--etat-stone-600)]">
              <p className="flex items-center gap-2"><CalendarDays size={16} className="text-[var(--etat-sea-700)]" /> Généré le {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p className="flex items-center gap-2"><MapPinned size={16} className="text-[var(--etat-sea-700)]" /> {coveredTerritories} {coveredTerritories === 1 ? "territoire documenté" : "territoires documentés"}</p>
              <p className="flex items-center gap-2"><FileCheck2 size={16} className="text-[var(--etat-sea-700)]" /> {readyReports} {readyReports === 1 ? "rapport prêt" : "rapports prêts"} à partager</p>
            </div>
          </div>
        </section>

        <section aria-label="Synthèse du rapport" className="etat-national-strip">
          <div>
            <p className="text-2xl font-black tracking-tight text-[var(--etat-navy-950)]">{state.reports.length}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Chapitres territoriaux</p>
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight text-[var(--etat-sea-700)]">{documentedMetrics}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Indicateurs documentés</p>
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight text-[var(--etat-navy-950)]">{new Intl.NumberFormat("fr-FR").format(confirmedFunding)} <span className="text-sm">FCFA</span></p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Financements confirmés</p>
          </div>
        </section>

        <div className="etat-report-sheet">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--etat-navy-950)] px-6 py-5 text-white sm:px-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-white/50">Partie I</p>
              <h2 className="etat-display mt-1 text-xl not-italic">Résultats par territoire</h2>
            </div>
            <p className="max-w-xl text-xs leading-5 text-white/60">Chaque indicateur conserve sa source, son niveau de confiance et sa limite d’interprétation.</p>
          </div>

          {state.reports.map((report, index) => (
            <article key={report.id} className="etat-report-chapter">
              <header>
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-[var(--etat-sea-100)] text-xs font-black text-[var(--etat-sea-700)]">{String(index + 1).padStart(2, "0")}</span>
                  <span className={`etat-tag ${report.status === "pret" ? "etat-tag--reel" : "etat-tag--vigilance"}`}>{report.status === "pret" ? "Prêt à partager" : "À actualiser"}</span>
                </div>
                <h3 className="etat-display mt-4 text-xl leading-tight not-italic text-[var(--etat-navy-950)]">{report.title}</h3>
                <p className="mt-3 text-xs leading-5 text-[var(--etat-stone-600)]">{report.period}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--etat-stone-600)]">{report.territoryIds.map((id) => state.territories.find((territory) => territory.id === id)?.name ?? id).join(", ")}</p>
              </header>

              <div className="grid gap-x-7 gap-y-5 sm:grid-cols-2">
                {report.metrics.map((metric) => (
                  <div key={metric.label} className="etat-report-metric">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-2xl font-black tracking-tight text-[var(--etat-navy-950)]">{metric.value}</p>
                        <p className="mt-1 text-xs font-bold text-[var(--etat-navy-800)]">{metric.label}</p>
                      </div>
                      <span className={`etat-tag ${trustTagClass[metric.trust]}`}>{trustLabels[metric.trust]}</span>
                    </div>
                    <p className="mt-3 text-[11px] leading-4 text-[var(--etat-stone-400)]"><strong className="text-[var(--etat-stone-600)]">Source :</strong> {metric.source}</p>
                    <p className="mt-1 text-[11px] leading-4 text-[var(--etat-stone-400)]"><strong className="text-[var(--etat-stone-600)]">Limite :</strong> {metric.limit}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <section className="etat-report-sheet" aria-labelledby="funding-title">
          <div className="grid gap-5 bg-[var(--etat-sea-50)] px-6 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:px-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--etat-sea-700)]">Partie II · Mise en mouvement</p>
              <h2 id="funding-title" className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]">Programmes et financements</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--etat-stone-600)]">Les besoins qualifiés deviennent des initiatives traçables, avec un objectif, un budget et un état réel du financement.</p>
            </div>
            <div className="rounded-xl bg-white px-5 py-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-wide text-[var(--etat-stone-400)]">Confirmé à ce jour</p>
              <p className="mt-1 text-xl font-black text-[var(--etat-sea-700)]">{new Intl.NumberFormat("fr-FR").format(confirmedFunding)} FCFA</p>
            </div>
          </div>

          <div className="divide-y divide-[var(--etat-line)] px-6 sm:px-8">
            {state.initiatives.map((initiative) => {
              const confirmed = initiative.funding.filter((funding) => funding.status === "confirme").reduce((sum, funding) => sum + funding.amountFcfa, 0);
              const fundingRatio = initiative.budgetFcfa && initiative.budgetFcfa > 0 ? Math.min(100, Math.round((confirmed / initiative.budgetFcfa) * 100)) : 0;
              return (
                <article key={initiative.id} className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.45fr)] lg:items-center">
                  <div>
                    <div className="flex items-center gap-2 text-[var(--etat-sea-700)]"><HandCoins size={16} /><p className="text-[10px] font-black uppercase tracking-[.13em]">Initiative à financer</p></div>
                    <h3 className="mt-2 text-sm font-black text-[var(--etat-navy-950)]">{initiative.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-[var(--etat-stone-600)]">{initiative.objective}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-bold text-[var(--etat-navy-800)]">{initiative.budgetFcfa !== undefined ? `${new Intl.NumberFormat("fr-FR").format(initiative.budgetFcfa)} FCFA recherchés` : "Budget à estimer"}</span>
                      <span className="font-black text-[var(--etat-sea-700)]">{new Intl.NumberFormat("fr-FR").format(confirmed)} FCFA confirmés</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--etat-offwhite-dim)]" role="progressbar" aria-label={`Financement confirmé pour ${initiative.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={fundingRatio}><div className="h-full rounded-full bg-[var(--etat-sea-600)]" style={{ width: `${fundingRatio}%` }} /></div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="etat-principle" aria-label="Règle de lecture des données">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[var(--etat-sea-700)]" />
          <div><p className="font-black text-[var(--etat-navy-950)]">Une donnée n’est jamais présentée avec plus de certitude qu’elle n’en a.</p><p className="mt-1 text-[var(--etat-stone-600)]">Les valeurs qui ne sont pas marquées « Vérifiée » ou « Consolidée » restent des éléments de démonstration. Elles ne constituent pas des statistiques officielles.</p></div>
          <CircleCheckBig size={18} className="ml-auto hidden shrink-0 text-[var(--etat-sea-700)] sm:block" />
        </aside>
      </div>
    </div>
  );
}
