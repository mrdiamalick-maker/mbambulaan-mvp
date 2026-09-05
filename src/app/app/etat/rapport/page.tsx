"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Compass, Download, Handshake, ListChecks, Printer, ShieldAlert, Users } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { EngagementIcon, PreuveIcon, ResultatIcon, SituationIcon } from "@/components/etat/MotifIcons";
import { decisionTypeLabels, evidenceTypeLabels, type Funding, type Initiative, type Report, type Territory, type TrustLevel } from "@/domain/types";

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
// Légende des niveaux de confiance (Lot 5, mandat §4.6 : "créer une
// lecture méthodologique premium : légende des niveaux de confiance").
// Définitions du vocabulaire réel du modèle (TrustLevel, domain/types.ts,
// §12.1 du cahier des charges maître) — pas une donnée d'usage, un
// glossaire des 10 valeurs possibles, qu'elles apparaissent ou non dans
// le jeu de démonstration actuel (cf. bande de comptage réel juste
// au-dessus, qui elle ne montre que les niveaux effectivement présents).
const trustDefinitions: Record<TrustLevel, string> = {
  declaree: "Rapportée par un acteur du terrain, sans vérification indépendante à ce stade.",
  observee: "Constatée directement sur le terrain, sans recoupement formel avec une autre source.",
  verifiee: "Contrôlée et confirmée par un second processus ou une source indépendante.",
  consolidee: "Agrégée à partir de plusieurs mesures ou sources réconciliées entre elles.",
  rapprochee: "Recoupée entre deux enregistrements indépendants (ex. besoin déclaré et lot réellement pesé).",
  documentee: "Appuyée par une pièce écrite ou un document conservé.",
  officielle: "Émise par une source institutionnelle ou réglementaire reconnue.",
  estimee: "Calculée ou approchée à partir d’autres valeurs, pas mesurée directement.",
  contestee: "Signalée comme disputée ou remise en question par une partie prenante.",
  expiree: "N’est plus à jour et nécessite une actualisation avant d’être réutilisée."
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

// Lot 5 — mêmes libellés que /app/etat (Chapitre 4, Programmes en cours),
// pour ne pas introduire un 2e vocabulaire de statut de programme entre
// État et Rapport.
const initiativeStatusLabel: Record<Initiative["status"], string> = { cadrage: "Cadrage", financee: "Financée", execution: "Exécution", terminee: "Terminée" };

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
  // Lot Rapport-B (mandat §4.2) : filtres réellement fonctionnels sur le
  // portefeuille de rapports. Pas de filtre Période ici — les 8 rapports
  // de démonstration partagent tous exactement le même period ("Semaine
  // du 3 août 2026"), un sélecteur à une seule option réelle serait un
  // contrôle sans effet, contraire à la consigne du mandat. Pas de
  // filtre "type de rapport" non plus — cette notion n'existe pas dans
  // le modèle (national/territorial est une distinction de présentation
  // introduite au Lot D, pas un champ Report).
  const [rapportTerritoryFilter, setRapportTerritoryFilter] = useState<string>("all");
  const [rapportStatusFilter, setRapportStatusFilter] = useState<"all" | "pret" | "a_actualiser">("all");
  const [rapportTrustFilter, setRapportTrustFilter] = useState<"all" | TrustLevel>("all");
  // Lot Rapport-D (mandat §4.4) : explorateur registre/détail — un seul
  // rapport sélectionné à la fois, plutôt qu'une succession de cartes
  // empilées. null = pas de sélection explicite, retombe sur le premier
  // rapport filtré (cf. selectedReport plus bas).
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  if (!state) return null;

  // Lot C — seuil de sélection retenu par le CEO (arbitrage 2026-08-19) :
  // result renseigné ET au moins une Evidence liée. Sur 30 situations,
  // seules 11 remplissent les deux conditions — compteur honnête affiché,
  // pas une narration forcée sur l'ensemble des situations.
  const documentedSituations = state.situations.filter(
    (situation) => situation.result && state.evidences.some((evidence) => evidence.situationId === situation.id)
  );

  // Lot D — regroupement des rapports : le rapport national (18
  // territoires) est distingué des 7 revues territoriales, plutôt que 8
  // cartes plates de même poids visuel (cf. gap analysis, mesure au
  // pixel de la longueur excessive). Aucun rapport n'est retiré ni
  // fusionné — même donnée, hiérarchie de lecture différente.
  const nationalReport = state.reports.find((report) => report.id === "report-national") ?? state.reports[0];

  // Lot Rapport-B — filtres appliqués uniformément à l'ensemble des
  // rapports (national inclus : pas d'exemption arbitraire, un filtre
  // qui ignore un item défait sa propre fonction).
  const matchesReportFilters = (report: (typeof state.reports)[number]) =>
    (rapportTerritoryFilter === "all" || report.territoryIds.includes(rapportTerritoryFilter)) &&
    (rapportStatusFilter === "all" || report.status === rapportStatusFilter) &&
    (rapportTrustFilter === "all" || report.metrics.some((metric) => metric.trust === rapportTrustFilter));
  // Lot Rapport-D — le rapport national reste en tête de liste (ordre
  // naturel de state.reports), simplement signalé "Vue nationale" dans
  // le registre plutôt que structurellement séparé en deux blocs.
  const filteredReports = state.reports.filter(matchesReportFilters);
  const selectedReport = filteredReports.find((report) => report.id === selectedReportId) ?? filteredReports[0];

  // Lot D — synthèse confiance/sources sur l'ensemble des métriques de
  // rapport, agrégée une seule fois plutôt que dispersée en petite
  // légende répétée sur chaque tuile.
  const allMetrics = state.reports.flatMap((report) => report.metrics);
  const trustCounts = allMetrics.reduce<Partial<Record<TrustLevel, number>>>((acc, metric) => {
    acc[metric.trust] = (acc[metric.trust] ?? 0) + 1;
    return acc;
  }, {});

  // Lot Rapport-C (mandat §4.3) : synthèse propre au rapport plutôt que
  // les KPI de l'Espace État (territoires/situations/acteurs/
  // opportunités) repris tels quels au Lot A — un lecteur de ce rapport
  // veut savoir où en est le PORTEFEUILLE de rapports, pas relire les
  // chiffres déjà sur /app/etat. "Confiance dominante" = le niveau le
  // plus fréquent parmi les métriques (donnée réelle agrégée), jamais
  // un score composite fabriqué (doctrine anti-score déjà appliquée
  // ailleurs sur ce produit).
  const reportsPret = state.reports.filter((report) => report.status === "pret").length;
  const reportsAActualiser = state.reports.length - reportsPret;
  const territoriesCovered = new Set(state.reports.flatMap((report) => report.territoryIds)).size;
  const lastUpdatedAt = state.reports[0]?.generatedAt;
  const dominantTrust = (Object.entries(trustCounts) as [TrustLevel, number][]).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Points clés (Lot 5, R5 — arbitrage CEO "Option A" : gabarits
  // déterministes, aucune modification du modèle de données). Chaque
  // phrase est un template rempli avec des agrégats déjà réels et déjà
  // calculés ailleurs sur cette page (ou une variante immédiate du même
  // calcul) — jamais un résumé narratif libre, jamais un nouveau champ.
  // Financement global : même somme que celle affichée par initiative
  // plus bas, agrégée une fois sur l'ensemble du portefeuille.
  const globalConfirmedFunding = state.initiatives.reduce((sum, item) => sum + item.funding.filter((f) => f.status === "confirme").reduce((s, f) => s + f.amountFcfa, 0), 0);
  const globalIdentifiedFunding = state.initiatives.reduce((sum, item) => sum + item.funding.reduce((s, f) => s + f.amountFcfa, 0), 0);
  const globalConfirmedPct = globalIdentifiedFunding > 0 ? Math.round((globalConfirmedFunding / globalIdentifiedFunding) * 100) : 0;
  const initiativesWithoutIndicators = state.initiatives.filter((item) => item.indicators.length === 0).length;

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
    <div className="pb-4">
      {/* Lot D — masqué à l'impression (print:hidden) : la barre d'actions
          n'a pas sa place sur le document imprimé, qui doit rester un
          document linéaire complet (rappel CEO), sans rien d'autre y
          être caché ou conditionné à un état d'interface. */}
      <div className="mx-5 mt-5 flex flex-wrap items-center justify-between gap-3 print:hidden lg:mx-8 lg:mt-6">
        {/* XXL-R2 (§6, grammaire commune) — même libellé exact que les 3
            autres registres (etat-back-link/EtatRegistryHeader) : "Retour
            à l'Espace État" pointait déjà vers /app/etat mais avec un mot
            différent pour la même destination — un des petits écarts qui
            faisaient sembler Résultats moins de la même famille. */}
        <Link href="/app/etat" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--etat-navy-800)]"><ArrowLeft size={15} /> Retour au Brief national</Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/app/etat/redevabilite" className="etat-btn etat-btn-outline">Registre des décisions</Link>
          <button onClick={() => window.print()} className="etat-btn etat-btn-outline"><Printer size={15} /> Version imprimable</button>
          <button onClick={download} className="etat-btn etat-btn-primary"><Download size={15} /> Télécharger (.md)</button>
        </div>
      </div>

      {/* Lot Rapport-A (mandat §4.1) : navigation d'ancrage propre à
          l'espace Rapport — même discipline que /app/etat (Lot État-B) :
          non permanente, masquée à l'impression, retour évident déjà
          assuré par le lien "Retour à l'Espace État" ci-dessus. */}
      <nav className="mx-5 mt-4 -mb-2 flex gap-1 overflow-x-auto print:hidden lg:mx-8 text-sm">
        {[
          { href: "#synthese", label: "Synthèse" },
          { href: "#rapports-territoriaux", label: "Rapports territoriaux" },
          { href: "#programmes-financements", label: "Programmes & financements" },
          { href: "#methodologie", label: "Méthodologie & confiance" }
        ].map((item) => (
          <a key={item.href} href={item.href} className="shrink-0 whitespace-nowrap rounded-[2px] px-3 py-1.5 font-semibold text-[var(--etat-navy-800)] transition hover:bg-white">{item.label}</a>
        ))}
      </nav>

      {/* Fond hero — asset d'illustration réelle (mandat "2 assets
          d'illustration réelle", 2026-08-23), même méthode que le fond
          Atlas et le fond Passerelle : posé sous le contenu existant,
          object-cover, aucune modification du texte/CTA/données. Aucun
          élément décoratif Lucide/SVG additionnel n'existait déjà à cet
          emplacement (seules les 4 icônes de la bande KPI, fonctionnelles
          — chacune accompagne un vrai chiffre, pas de la décoration —
          restent inchangées). overflow-hidden ajouté (absent jusqu'ici,
          jamais nécessaire tant que le fond n'était qu'un dégradé CSS
          contenu par le rounded lui-même) : indispensable maintenant pour
          que la photo en fill respecte le même rayon d'angle que le
          bandeau. Contenu existant enveloppé dans "relative z-10" (absent
          avant, inutile tant qu'il n'y avait aucun élément
          position:absolute à ce niveau) : sans ça, un enfant absolument
          positionné (la photo) se peint après les enfants en flux normal
          dans l'ordre d'empilement CSS, donc au-dessus du texte plutôt
          qu'en dessous.
          P2.DESIGN-1A.2 (North Star) : rounded-[28px] → rounded-[4px] —
          géométrie nette du prototype (jamais de grand rayon "carte
          arrondie"), même bandeau, même photo, même voile. */}
      <section id="synthese" className="etat-canvas-dark relative mx-5 mt-5 scroll-mt-6 overflow-hidden rounded-[4px] p-8 lg:mx-8 lg:p-10">
        <Image
          src="/images/etat-rapport-hero-background.webp"
          alt=""
          fill
          sizes="100vw"
          priority={false}
          className="pointer-events-none absolute inset-0 object-cover"
        />
        {/* Voile (même discipline que les 2 autres fonds de ce lot) :
            assombrissement léger pour sécuriser le texte le plus fin
            (white/55 et white/65) sur toute la largeur du bandeau,
            vérifié par capture, pas présumé. */}
        <div className="pointer-events-none absolute inset-0 bg-[var(--etat-navy-950)]/30" aria-hidden="true" />
        <div className="relative z-10">
          <p className="etat-eyebrow etat-eyebrow--on-dark">Rapport bailleurs</p>
          <h1 className="etat-display mt-3 text-2xl not-italic text-white md:text-3xl">Impact de la coordination, territoire par territoire.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Généré depuis l’environnement {state.tenant.name}, le {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}. Préparé pour faciliter vos échanges avec les partenaires et bailleurs.</p>

          {/* Lot Rapport-C (mandat §4.3) : synthèse propre au portefeuille
              de rapports — remplace les 4 KPI de l'Espace État du Lot A
              (territoires/situations/acteurs/opportunités), redondants
              avec /app/etat et hors-sujet pour un lecteur de CE rapport.
              Chiffres inline (même doctrine §17), aucune grosse KPI card. */}
          <div className="mt-7 grid grid-cols-2 gap-6 border-t border-white/15 pt-6 sm:grid-cols-4">
            <div>
              <Compass size={18} color="var(--etat-ocre-dim)" />
              <p className="etat-display mt-2 text-2xl not-italic text-white"><NumberTicker value={reportsPret} /></p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/55">Rapports prêts</p>
            </div>
            <div>
              <ShieldAlert size={18} color="var(--etat-ocre-dim)" />
              <p className="etat-display mt-2 text-2xl not-italic text-white"><NumberTicker value={reportsAActualiser} /></p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/55">Rapports à actualiser</p>
            </div>
            <div>
              <Users size={18} color="var(--etat-ocre-dim)" />
              <p className="etat-display mt-2 text-2xl not-italic text-white"><NumberTicker value={territoriesCovered} /></p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/55">Territoires couverts</p>
            </div>
            <div>
              <Handshake size={18} color="var(--etat-ocre-dim)" />
              <p className="etat-display mt-2 text-lg not-italic text-white">{lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" }) : "—"}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/55">Dernière mise à jour{dominantTrust ? ` · Confiance dominante : ${trustLabels[dominantTrust]}` : ""}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-5 mt-8 space-y-6 pb-16 lg:mx-8">
        {/* Points clés (Lot 5, R5 — arbitrage CEO "Option A" : gabarits
            déterministes remplis d'agrégats réels, aucune modification du
            modèle de données ni résumé narratif fabriqué — cf. calcul des
            variables au niveau du composant). Positionné juste après la
            synthèse : ce qu'un lecteur pressé doit retenir avant de
            plonger dans l'explorateur — action-vs-preuve, la lecture
            rapide d'abord, le détail vérifiable ensuite. Pas dans la
            navigation d'ancrage (§4.1) : prolongement visuel de la
            synthèse, pas un nouveau chapitre. */}
        <article className="etat-panel p-6">
          <div className="flex items-center gap-2"><ListChecks size={18} color="var(--etat-terracotta)" /><h2 className="etat-display text-lg not-italic text-[var(--etat-navy-950)]">Points clés</h2></div>
          <ul className="mt-4 space-y-2.5 text-sm leading-6 text-[var(--etat-navy-800)]">
            <li className="flex gap-2"><span className="text-[var(--etat-terracotta)]">·</span><span>{reportsPret} rapport{reportsPret > 1 ? "s" : ""} sur {state.reports.length} {reportsPret > 1 ? "sont prêts" : "est prêt"} à être partagé{reportsPret > 1 ? "s" : ""} ; {reportsAActualiser} {reportsAActualiser > 1 ? "restent" : "reste"} à actualiser.</span></li>
            <li className="flex gap-2"><span className="text-[var(--etat-terracotta)]">·</span><span>{documentedSituations.length} situation{documentedSituations.length > 1 ? "s" : ""} sur {state.situations.length} {documentedSituations.length > 1 ? "disposent" : "dispose"} d’un dossier complet (résultat documenté et au moins une preuve enregistrée) — les autres restent en cours ou sans preuve documentée.</span></li>
            <li className="flex gap-2"><span className="text-[var(--etat-terracotta)]">·</span><span>{formatFcfa(globalConfirmedFunding)} confirmés sur {formatFcfa(globalIdentifiedFunding)} identifiés à travers les {state.initiatives.length} programmes ({globalConfirmedPct}%).</span></li>
            <li className="flex gap-2"><span className="text-[var(--etat-terracotta)]">·</span><span>{initiativesWithoutIndicators > 0 ? `${initiativesWithoutIndicators} programme${initiativesWithoutIndicators > 1 ? "s" : ""} sur ${state.initiatives.length} ${initiativesWithoutIndicators > 1 ? "n’ont" : "n’a"} pas encore d’indicateur défini — encore au stade cadrage.` : `Les ${state.initiatives.length} programmes disposent tous d’au moins un indicateur suivi.`}</span></li>
            {dominantTrust && <li className="flex gap-2"><span className="text-[var(--etat-terracotta)]">·</span><span>Niveau de confiance dominant des métriques de rapport : {trustLabels[dominantTrust]}.</span></li>}
          </ul>
        </article>

        {/* Lot D — vue nationale distinguée des revues territoriales,
            plutôt que 8 cartes de même poids visuel. Même donnée,
            hiérarchie de lecture différente. Lot Rapport-B — filtres
            réellement fonctionnels (territoire/statut/confiance),
            appliqués uniformément au national et aux revues, comptage
            visible, repli honnête si aucun résultat. */}
        <div id="rapports-territoriaux" className="scroll-mt-6">
          <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
            <p className="text-sm font-semibold text-[var(--etat-navy-950)]">{filteredReports.length} rapport(s) sur {state.reports.length}.</p>
            <div className="flex flex-wrap items-end gap-3">
              <label className="block">
                <p className="etat-filter-label">Territoire</p>
                <select value={rapportTerritoryFilter} onChange={(event) => setRapportTerritoryFilter(event.target.value)} className="etat-filter-select">
                  <option value="all">Tous les territoires</option>
                  {[...state.territories].sort((a, b) => a.name.localeCompare(b.name)).map((territory) => (
                    <option key={territory.id} value={territory.id}>{territory.name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <p className="etat-filter-label">Statut</p>
                <select value={rapportStatusFilter} onChange={(event) => setRapportStatusFilter(event.target.value as "all" | "pret" | "a_actualiser")} className="etat-filter-select">
                  <option value="all">Tous les statuts</option>
                  <option value="pret">Prêt</option>
                  <option value="a_actualiser">À actualiser</option>
                </select>
              </label>
              <label className="block">
                <p className="etat-filter-label">Confiance</p>
                <select value={rapportTrustFilter} onChange={(event) => setRapportTrustFilter(event.target.value as "all" | TrustLevel)} className="etat-filter-select">
                  <option value="all">Tous les niveaux</option>
                  {(Object.keys(trustLabels) as TrustLevel[]).map((trust) => (
                    <option key={trust} value={trust}>{trustLabels[trust]}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <p className="etat-panel mt-4 p-6 text-sm text-[var(--etat-stone-600)]">Aucun rapport ne correspond à ces filtres pour le moment.</p>
          ) : (
            <>
              {/* Explorateur (mandat §4.4) : registre à gauche, détail du
                  rapport sélectionné à droite (desktop) — empilé en
                  dessous du registre en mobile via l'ordre naturel du
                  flux (le registre garde une hauteur bornée avec défilement
                  interne, le détail suit). print:hidden : la version
                  imprimable ne doit jamais dépendre d'un état de
                  sélection — cf. le bloc plein ci-dessous, réservé à
                  l'impression, qui liste tous les rapports filtrés en
                  entier.
                  Split en % plutôt qu'en px fixe (Lot 4, gap analysis
                  Lot 0) : 320px sur un conteneur étroit (fenêtre réduite,
                  panneau latéral ouvert) laissait trop peu de place au
                  détail — 30%/70% s'adapte à la largeur réelle du
                  conteneur au lieu d'une valeur figée. */}
              <div className="mt-4 grid gap-5 print:hidden lg:grid-cols-[30%_1fr]">
                {/* lg:sticky (Lot 4, gap analysis Lot 0 — faisabilité
                    confirmée) : le registre reste visible pendant que le
                    lecteur parcourt un détail de rapport long, au lieu de
                    disparaître en haut de page au défilement — top-6
                    aligné sur la marge du conteneur (mt-4 du grid parent +
                    léger espace de respiration, cohérent avec lg:mt-6 de
                    la barre d'actions plus haut). lg:self-start
                    indispensable : par défaut une grid stretch ses items
                    sur la hauteur de la ligne (align-items: stretch), ce
                    qui annule le "sticky" en pratique (rien à quoi
                    s'accrocher, l'item occupe déjà toute la hauteur) —
                    confirmé par mesure directe (position: sticky posé
                    mais top défilant en continu jusqu'à -448px à 1200px
                    de scroll, exactement comme un élément statique, avant
                    l'ajout de self-start).
                    Correctif (CEO 2026-08-22, plage de collage nulle sur
                    tous les rapports testés) : max-h-[70vh] remplacé par une
                    hauteur fixe. Diagnostic vérifié avant correction (pas
                    supposé) : ni le registre ni le détail n'avaient de
                    hauteur "coincée" ou clippée l'un par l'autre (offsetHeight
                    === scrollHeight des deux côtés, aucun overflow interne
                    actif, aucun ancêtre ne contraint le détail) — les deux
                    mesuraient exactement 613px sur les 8 rapports parce que
                    (a) le registre affiche toujours la même liste de 8 lignes,
                    donc sa hauteur naturelle est constante quel que soit le
                    rapport sélectionné, et (b) chaque fiche de rapport tient
                    ses 2 ou 4 métriques sur une seule ligne à cette largeur
                    (sm:grid-cols-4), donc la hauteur du détail ne varie pas
                    non plus avec le nombre de métriques. Ce n'est pas un bug
                    de propagation de hauteur : les deux colonnes convergent
                    juste naturellement vers une hauteur proche avec CE jeu de
                    données, laissant une plage de collage nulle par
                    construction plutôt que par accident.
                    Un premier essai à h-[420px] restait insuffisant : une
                    fois lg:self-start ajouté aussi au détail (ci-dessous,
                    nécessaire pour révéler sa vraie hauteur naturelle plutôt
                    que la hauteur étirée par la grille), la mesure a montré
                    que 5 des 8 rapports (les revues territoriales, 4
                    métriques) ont un détail naturellement plus COURT que
                    420px (405px) — pire qu'avant sur ces rapports-là.
                    h-[280px] choisi à la place : nettement sous la plus
                    courte fiche de détail mesurée (405px), marge de ~125px
                    minimum sur les 8 rapports, pas seulement sur le plus
                    riche. */}
                <div className="etat-panel divide-y divide-[var(--etat-line)] overflow-y-auto lg:sticky lg:top-6 lg:h-[280px] lg:self-start">
                  {filteredReports.map((report) => {
                    const active = report.id === selectedReport?.id;
                    return (
                      <button
                        key={report.id}
                        onClick={() => setSelectedReportId(report.id)}
                        className="block w-full p-4 text-left transition"
                        style={{ backgroundColor: active ? "var(--etat-offwhite)" : undefined, borderLeft: active ? "3px solid var(--etat-terracotta)" : "3px solid transparent" }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {report.id === nationalReport?.id && <p className="etat-eyebrow text-[10px]">Vue nationale</p>}
                            <p className="mt-0.5 truncate text-sm font-semibold text-[var(--etat-navy-950)]">{report.title}</p>
                            <p className="mt-0.5 text-[11px] text-[var(--etat-stone-600)]">{report.territoryIds.length} territoire(s)</p>
                          </div>
                          <span className={`etat-tag shrink-0 ${report.status === "pret" ? "etat-tag--reel" : "etat-tag--vigilance"}`}>{report.status === "pret" ? "Prêt" : "À actualiser"}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* lg:self-start ici aussi (correctif CEO 2026-08-22) :
                    sans lui, align-items: stretch (défaut de la grid)
                    étire le détail à la hauteur de la ligne — déterminée
                    en partie par le registre, désormais à hauteur fixe —
                    ce qui masquait la vraie hauteur naturelle du détail et
                    réduisait d'autant la marge de collage réellement
                    disponible. Avec les deux colonnes en self-start, la
                    ligne de la grille prend enfin la hauteur naturelle du
                    détail (perturbée par rien), et le registre — fixé à
                    une hauteur volontairement compacte — a une vraie marge
                    de collage en dessous, quel que soit le contenu du
                    rapport affiché. */}
                {selectedReport && (
                  <div className="lg:self-start">
                    <ReportDetailCard report={selectedReport} isNational={selectedReport.id === nationalReport?.id} territories={state.territories} />
                  </div>
                )}
              </div>

              {/* Version imprimable (mandat : document linéaire complet,
                  jamais de contenu caché par un état d'onglet) : tous les
                  rapports filtrés, en entier, indépendamment de la
                  sélection de l'explorateur ci-dessus. */}
              <div className="mt-4 hidden space-y-5 print:block">
                {filteredReports.map((report) => (
                  <ReportDetailCard key={report.id} report={report} isNational={report.id === nationalReport?.id} territories={state.territories} />
                ))}
              </div>
            </>
          )}
        </div>

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

        <article id="programmes-financements" className="etat-panel scroll-mt-6 p-6">
          <h2 className="etat-display text-lg not-italic text-[var(--etat-navy-950)]">Programmes et financements</h2>
          <p className="mt-1 text-xs text-[var(--etat-stone-600)]">Baseline, actuel et cible par indicateur ; financement détaillé par bailleur et par statut.</p>

          {/* Table de synthèse (Lot 5, mandat "programmes table") : lecture
              scannable en un coup d'œil avant le détail complet plus bas —
              même doctrine que l'explorateur (registre/détail) : le
              résumé d'abord, la preuve vérifiable ensuite. Progression =
              moyenne des indicateurs disponibles, repli honnête "—" sinon
              — même règle que /app/etat (Chapitre 4, arbitrage CEO Lot 0),
              pas une 2e formule inventée pour ce tableau. */}
          <div className="mt-4 overflow-x-auto border-t border-[var(--etat-line)] pt-4">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--etat-line)] text-[10px] font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">
                  <th className="px-2 py-2 font-bold">Programme</th>
                  <th className="px-2 py-2 font-bold">Statut</th>
                  <th className="px-2 py-2 font-bold">Budget</th>
                  <th className="px-2 py-2 font-bold">Confirmé</th>
                  <th className="px-2 py-2 font-bold">Progression</th>
                </tr>
              </thead>
              <tbody>
                {state.initiatives.map((initiative) => {
                  const confirmedRow = initiative.funding.filter((f) => f.status === "confirme").reduce((sum, f) => sum + f.amountFcfa, 0);
                  const avgProgress = initiative.indicators.length > 0
                    ? Math.round(initiative.indicators.reduce((sum, indicator) => sum + indicatorProgress(indicator), 0) / initiative.indicators.length)
                    : null;
                  return (
                    <tr key={initiative.id} className="border-b border-[var(--etat-line)] last:border-b-0">
                      <td className="px-2 py-2.5 font-semibold text-[var(--etat-navy-950)]">{initiative.title}</td>
                      <td className="px-2 py-2.5 text-[var(--etat-stone-600)]">{initiativeStatusLabel[initiative.status]}</td>
                      <td className="px-2 py-2.5 text-[var(--etat-stone-600)]">{initiative.budgetFcfa !== undefined ? formatFcfa(initiative.budgetFcfa) : "À estimer"}</td>
                      <td className="px-2 py-2.5 text-[var(--etat-stone-600)]">{formatFcfa(confirmedRow)}</td>
                      <td className="px-2 py-2.5 text-[var(--etat-stone-600)]">{avgProgress !== null ? `${avgProgress}%` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Lot B : chaque initiative expose désormais ses indicateurs
              réels (Initiative.indicators) et son financement ventilé
              par bailleur (Initiative.funding → state.actors), plutôt
              que la seule somme confirmée. init-lompoul-balises a 0
              indicateur et 0 financement — repli honnête affiché tel
              quel, jamais masqué ni fabriqué. */}
          <div className="mt-6 space-y-5">
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
                              <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-[1px] bg-[var(--etat-line)]">
                                <div className="h-full rounded-[1px] bg-[var(--etat-terracotta)]" style={{ width: `${indicatorProgress(indicator)}%` }} />
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

        {/* Lot D — sources, confiance et limites méthodologiques : une
            synthèse dédiée plutôt que la seule petite légende répétée
            sur chaque tuile (rappel arbitrage CEO "mise en avant
            confiance/source"). Le disclaimer démo, déjà présent dans
            l'export Markdown, est désormais aussi visible à l'écran. */}
        <article id="methodologie" className="etat-panel scroll-mt-6 p-6">
          <h2 className="etat-display text-lg not-italic text-[var(--etat-navy-950)]">Sources, confiance et limites méthodologiques</h2>
          <p className="mt-3 text-xs leading-5 text-[var(--etat-stone-600)]">Les valeurs non marquées « Vérifiée » ou « Consolidée » sont des données de démonstration et ne constituent pas des statistiques officielles. Chaque métrique de rapport porte sa propre source et sa propre limite (visibles sur chaque tuile ci-dessus) ; la répartition ci-dessous en donne la synthèse.</p>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--etat-line)] pt-4">
            {(Object.keys(trustCounts) as TrustLevel[]).map((trust) => (
              <span key={trust} className={`etat-tag ${trustTagClass[trust]}`}>{trustLabels[trust]} · {trustCounts[trust]}</span>
            ))}
          </div>

          {/* Légende des niveaux de confiance (Lot 5) : définit le
              vocabulaire complet, pas seulement les niveaux présents dans
              la bande ci-dessus — un bailleur qui compare plusieurs
              rapports dans le temps doit pouvoir comprendre un niveau
              même s'il n'apparaît pas dans CETTE version du rapport. */}
          <div className="mt-5 grid gap-x-6 gap-y-3 border-t border-[var(--etat-line)] pt-4 sm:grid-cols-2">
            {(Object.keys(trustLabels) as TrustLevel[]).map((trust) => (
              <div key={trust} className="flex gap-2">
                <span className={`etat-tag shrink-0 ${trustTagClass[trust]}`}>{trustLabels[trust]}</span>
                <p className="text-[11px] leading-4 text-[var(--etat-stone-600)]">{trustDefinitions[trust]}</p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs leading-5 text-[var(--etat-stone-600)] border-t border-[var(--etat-line)] pt-4">La chaîne situation → intervention → résultat → preuve n’est présentée que pour les {documentedSituations.length} situations sur {state.situations.length} qui disposent d’un résultat renseigné et d’au moins une preuve enregistrée ; les autres restent en cours ou sans preuve documentée et ne sont pas incluses dans ce rapport.</p>

          {/* "Zero-chart-by-default" (Lot 5) : ce rapport n'affiche aucun
              graphique de tendance — confirmé par relecture explicite de
              l'ensemble de la page à ce lot. Les barres de progression
              (baseline → actuel → cible) sont des jauges d'un état
              ponctuel documenté, pas des séries temporelles ; aucune
              n'implique une évolution qui ne serait pas mesurée. */}
        </article>
      </div>
    </div>
  );
}

// Lot Rapport-D — rendu détaillé d'un rapport, partagé entre
// l'explorateur (un seul rapport affiché, celui sélectionné) et la
// version imprimable (tous les rapports filtrés, en entier) : même
// contenu exact dans les deux cas, jamais une version imprimée
// appauvrie par rapport à ce que l'explorateur peut montrer.
//
// Fiche d'identité (Lot 4) : generatedAt ajouté à l'en-tête — donnée
// réelle du modèle (Report.generatedAt), déjà utilisée au niveau page
// pour "Dernière mise à jour" du portefeuille entier, mais jusqu'ici
// absente de la fiche de CE rapport précis. Un lecteur qui consulte un
// rapport territorial isolé doit pouvoir dater CE rapport, pas
// seulement le plus récent du portefeuille.
function ReportDetailCard({ report, isNational, territories }: { report: Report; isNational: boolean; territories: Territory[] }) {
  return (
    <article className="etat-panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {isNational && <p className="etat-eyebrow">Vue nationale</p>}
          <h2 className="etat-display mt-1 text-lg not-italic text-[var(--etat-navy-950)]">{report.title}</h2>
          <p className="mt-1 text-xs text-[var(--etat-stone-600)]">{report.period} · {isNational ? `${report.territoryIds.length} territoires suivis` : report.territoryIds.map((id) => territories.find((t) => t.id === id)?.name ?? id).join(", ")}</p>
          <p className="mt-1 text-[11px] text-[var(--etat-stone-400)]">Généré le {new Date(report.generatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</p>
        </div>
        <span className={`etat-tag ${report.status === "pret" ? "etat-tag--reel" : "etat-tag--vigilance"}`}>{report.status === "pret" ? "Prêt" : "À actualiser"}</span>
      </div>
      {/* Blocs de preuve (mandat §4.4, Lot 4) : VALEUR / LABEL / CONFIANCE
          / Source / Limite comme 5 champs distincts — Source et Limite
          vivaient jusqu'ici dans une seule ligne jointe par un tiret
          ("source — limite"), ce qui les faisait lire comme une seule
          note plutôt que deux informations méthodologiques différentes
          (d'où vient la donnée / jusqu'où elle va). Séparées en deux
          lignes labellisées, même contenu réel, aucune donnée ajoutée. */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {report.metrics.map((metric) => (
          <div key={metric.label} className="etat-panel--warm p-4">
            <p className="etat-display text-xl not-italic text-[var(--etat-navy-950)]">{metric.value}</p>
            <p className="mt-1 text-xs font-bold text-[var(--etat-navy-800)]">{metric.label}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`etat-tag ${trustTagClass[metric.trust]}`}>{trustLabels[metric.trust]}</span>
            </div>
            <div className="mt-2.5 space-y-1 border-t border-[var(--etat-line)] pt-2">
              <p className="text-[11px] leading-4 text-[var(--etat-stone-400)]"><span className="font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Source · </span>{metric.source}</p>
              <p className="text-[11px] leading-4 text-[var(--etat-stone-400)]"><span className="font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Limite · </span>{metric.limit}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
