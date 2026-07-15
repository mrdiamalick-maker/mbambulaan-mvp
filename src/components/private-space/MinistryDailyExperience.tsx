"use client";

import type { ReactNode } from "react";
import { quays, type Level, type Quay } from "@/data/ministryControlTowerData";
import type { DecisionRecord, FundingDossierRecord, GeneratedArtifact, SignalRecord, VerificationTask, ZoneReportRecord } from "@/data/ministryValueJourneyData";
import { formatFcfa } from "@/data/ministryValueJourneyData";
import { DataTrustBadge, primaryButton, StatusBadge, type WorkspaceId } from "./MinistryControlTowerParts";
import type { DemoRole } from "./MinistryOperationalRegisters";

type DailyAction = { title: string; detail: string; label: string; level: Level; onClick: () => void };

export function TodayView({ role, evidence, artifacts, tasks, signals, dossiers, decisions, reports, onNavigate, onOpenKayarVerification, onCreateNote }: {
  role: DemoRole;
  evidence: Array<{ time: string; title: string; detail: string }>;
  artifacts: GeneratedArtifact[];
  tasks: VerificationTask[];
  signals: SignalRecord[];
  dossiers: FundingDossierRecord[];
  decisions: DecisionRecord[];
  reports: ZoneReportRecord[];
  onNavigate: (workspace: WorkspaceId) => void;
  onOpenKayarVerification: () => void;
  onCreateNote: () => void;
}) {
  const activeQuays = quays.length;
  const trackedBoats = quays.reduce((sum, quay) => sum + quay.activePirogues, 0);
  const attentionZones = quays.filter((quay) => quay.level !== "normal").length;
  const awaitingChecks = tasks.filter((task) => !["Vérifiée", "Clôturée"].includes(task.status)).length;
  const readyDossiers = dossiers.filter((dossier) => dossier.status === "Transmission à confirmer").length;
  const pendingDecisions = decisions.filter((decision) => decision.status !== "Exécutée").length;
  const ministryActions: DailyAction[] = [
    pendingDecisions ? { title: `${pendingDecisions} décision(s) attendent un arbitrage`, detail: "Les recommandations sont documentées et prêtes à être suivies.", label: "Ouvrir le suivi des décisions", level: "urgent", onClick: () => onNavigate("tracking") } : { title: "Préparer la note de situation", detail: "Consolider les vigilances, financements et preuves du jour.", label: "Générer la note au Ministre", level: "surveillance", onClick: onCreateNote },
    readyDossiers ? { title: `${readyDossiers} dossier(s) prêt(s) à transmettre`, detail: "La transmission reste manuelle et doit être confirmée par un responsable.", label: "Vérifier les dossiers", level: "surveillance", onClick: () => onNavigate("community") } : { title: "Examiner les risques du jour", detail: "Distinguer les vigilances des décisions à prendre.", label: "Voir les risques", level: "normal", onClick: () => onNavigate("tracking") },
  ];
  const regionalActions: DailyAction[] = [
    awaitingChecks ? { title: `${awaitingChecks} vérification(s) attendent un retour terrain`, detail: "Les constats reçus doivent être déposés puis validés humainement.", label: "Suivre les vérifications", level: "urgent", onClick: () => onNavigate("map") } : { title: "Confirmer la situation de Kayar", detail: "L’écart de pesée déclaré doit être vérifié avant consolidation.", label: "Demander la vérification", level: "urgent", onClick: onOpenKayarVerification },
    { title: `${signals.filter((signal) => signal.status !== "Clôturé").length || 1} signalement(s) à qualifier`, detail: "Qualifier d’abord la situation avant toute escalade en alerte.", label: "Ouvrir les remontées terrain", level: "surveillance", onClick: () => onNavigate("map") },
  ];
  const partnerActions: DailyAction[] = [
    { title: "Examiner les besoins finançables", detail: "Les montants, bénéficiaires et preuves sont regroupés par dossier.", label: "Voir l’impact et les dossiers", level: "normal", onClick: () => onNavigate("community") },
    { title: `${dossiers.filter((dossier) => ["Transmis", "En négociation"].includes(dossier.status)).length} dossier(s) en relation partenaire`, detail: "Aucune transmission externe n’est simulée : seuls les suivis confirmés sont affichés.", label: "Suivre les financements", level: "surveillance", onClick: () => onNavigate("community") },
  ];
  const actions = role === "Ministère" ? ministryActions : role === "Direction régionale" ? regionalActions : partnerActions;
  const modules = role === "Partenaire / Bailleur"
    ? [{ id: "community" as const, title: "Filière & Financement", count: `${readyDossiers || dossiers.length} dossiers`, detail: "Impact, besoins et financement" }, { id: "tracking" as const, title: "Pilotage institutionnel", count: `${artifacts.length} preuves`, detail: "Synthèses et documents" }, { id: "map" as const, title: "Atlas consolidé", count: `${attentionZones} zones`, detail: "Lecture territoriale vérifiée" }]
    : role === "Direction régionale"
      ? [{ id: "map" as const, title: "Atlas maritime", count: `${awaitingChecks} à vérifier`, detail: "Terrain, quais et remontées" }, { id: "community" as const, title: "Filière & Financement", count: `${signals.length} signaux`, detail: "Qualification des besoins" }, { id: "tracking" as const, title: "Pilotage institutionnel", count: `${reports.length} rapports`, detail: "Rapports de zone" }]
      : [{ id: "tracking" as const, title: "Pilotage institutionnel", count: `${pendingDecisions} arbitrages`, detail: "Décisions, risques et notes" }, { id: "community" as const, title: "Filière & Financement", count: `${readyDossiers} prêts`, detail: "Dossiers et impact" }, { id: "map" as const, title: "Atlas maritime", count: `${attentionZones} vigilances`, detail: "Situation territoriale" }];
  const roleIntro = role === "Ministère" ? "Arbitrages, risques et financements à l’échelle nationale." : role === "Direction régionale" ? "Vérifications, signalements et rapports de zone à traiter." : "Dossiers finançables, impact démontré et preuves disponibles.";

  return <section className="min-h-full bg-[var(--mb-offwhite)]">
    <header className="border-b border-[var(--mb-neutral-200)] bg-[linear-gradient(115deg,#f7fbfc_0%,#edf7f8_55%,#f7f3e8_100%)] px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[86rem]"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Aujourd’hui · {role}</p><div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><div><h1 className="text-[28px] font-semibold text-[var(--mb-navy-900)]">La situation du jour, avant l’action.</h1><p className="mt-2 max-w-2xl text-[13px] leading-6 text-[var(--mb-neutral-600)]">{roleIntro}</p></div><div className="flex flex-wrap gap-4 font-mono text-[11px] text-[var(--mb-navy-700)]"><strong>{trackedBoats} pirogues suivies</strong><strong>{activeQuays} quais actifs</strong><strong className="text-[#9a6418]">{attentionZones} zones en vigilance</strong></div></div></div>
    </header>
    <div className="mx-auto grid max-w-[86rem] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,.55fr)] lg:px-8">
      <div className="grid content-start gap-5">
        <section><SectionTitle eyebrow="Priorités" title="À traiter maintenant" helper="Une action principale par situation, selon ce qui a déjà été fait." /><div className="mt-3 grid gap-3 md:grid-cols-2">{actions.map((action, index) => <article key={action.title} className={`border bg-white p-5 ${index === 0 ? "border-[var(--mb-ocean-600)]" : "border-[var(--mb-neutral-200)]"}`}><div className="flex items-start justify-between gap-3"><span className="font-mono text-[9px] text-[var(--mb-ocean-600)]">0{index + 1}</span><StatusBadge level={action.level} /></div><h2 className="mt-5 text-[17px] font-semibold text-[var(--mb-navy-900)]">{action.title}</h2><p className="mt-2 text-[11px] leading-5 text-[var(--mb-neutral-600)]">{action.detail}</p><button onClick={action.onClick} className={`${index === 0 ? primaryButton : "inline-flex h-9 items-center text-[11px] font-bold text-[var(--mb-ocean-600)]"} mt-5`}>{action.label} →</button></article>)}</div></section>
        <section><SectionTitle eyebrow="Activité" title="Fait aujourd’hui" helper="Les dernières actions et preuves enregistrées pendant la démonstration." /><ol className="mt-3 divide-y divide-[var(--mb-neutral-100)] border border-[var(--mb-neutral-200)] bg-white">{evidence.slice(0, 4).map((item) => <li key={`${item.time}-${item.title}`} className="grid gap-2 px-4 py-3 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:items-center"><time className="font-mono text-[10px] font-bold text-[var(--mb-ocean-600)]">{item.time}</time><div><p className="text-[11px] font-semibold text-[var(--mb-navy-900)]">{item.title}</p><p className="mt-1 text-[9px] leading-4 text-[var(--mb-neutral-600)]">{item.detail}</p></div><span className="text-[8px] font-bold text-[var(--mb-green-600)]">ENREGISTRÉ</span></li>)}</ol></section>
      </div>
      <aside className="grid content-start gap-4">
        <section className="border border-[var(--mb-neutral-200)] bg-white"><header className="border-b border-[var(--mb-neutral-200)] px-4 py-3"><h2 className="text-[12px] font-bold text-[var(--mb-navy-900)]">Accès rapides</h2><p className="mt-1 text-[9px] text-[var(--mb-neutral-600)]">Ordre adapté à la vue actuelle.</p></header><div className="divide-y divide-[var(--mb-neutral-100)]">{modules.map((module) => <button key={module.id} onClick={() => onNavigate(module.id)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-4 text-left hover:bg-[var(--mb-foam)]"><div><h3 className="text-[11px] font-semibold text-[var(--mb-navy-900)]">{module.title}</h3><p className="mt-1 text-[9px] text-[var(--mb-neutral-600)]">{module.detail}</p></div><span className="font-mono text-[9px] font-bold text-[var(--mb-ocean-600)]">{module.count} →</span></button>)}</div></section>
        <section className="border-l-2 border-[var(--mb-ocean-600)] bg-[var(--mb-foam)] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[8px] font-bold uppercase tracking-[0.09em] text-[var(--mb-ocean-600)]">Pourquoi faire confiance</p><h2 className="mt-2 text-[12px] font-semibold text-[var(--mb-navy-900)]">La maturité de chaque information reste visible.</h2></div><DataTrustBadge level="consolidated" source="Synthèse locale issue des déclarations, vérifications et preuves de cette démonstration." /></div><p className="mt-3 text-[9px] leading-4 text-[var(--mb-neutral-600)]">Données simulées. Les messages et transmissions restent manuels. Une validation humaine est nécessaire avant qu’une information devienne Vérifiée.</p></section>
      </aside>
    </div>
  </section>;
}

export function CoordinationBanner({ zones, evidence, onSelect }: { zones: Quay[]; evidence: Array<{ time: string; title: string; detail: string }>; onSelect: (id: string) => void }) {
  const priority = zones[0];
  return <section className="grid gap-3 border-b border-[var(--mb-neutral-200)] bg-white px-3 py-3 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,.7fr)]"><div><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-[var(--mb-ocean-600)]">Coordination du jour</p><h2 className="mt-1 text-[13px] font-semibold text-[var(--mb-navy-900)]">Zones à traiter</h2></div>{priority ? <p className="text-[9px] text-[var(--mb-neutral-600)]"><strong className="text-[var(--mb-navy-900)]">Action prioritaire :</strong> confirmer la situation à {priority.name}</p> : null}</div><div className="mt-3 flex flex-wrap gap-2">{zones.slice(0, 3).map((zone) => <button key={zone.id} onClick={() => onSelect(zone.id)} className="flex items-center gap-2 border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] px-3 py-2 text-left hover:border-[var(--mb-ocean-600)]"><StatusBadge level={zone.level} /><span><strong className="block text-[10px]">{zone.name}</strong><span className="text-[8px] text-[var(--mb-neutral-600)]">{zone.alertCount} signal(s)</span></span><DataTrustBadge level={zone.trustLevel} compact source={`Dernière mise à jour locale : ${zone.lastUpdated}.`} /></button>)}</div></div><div className="border-l border-[var(--mb-neutral-200)] pl-3"><p className="font-mono text-[8px] uppercase text-[var(--mb-neutral-400)]">Fil de coordination</p><ol className="mt-2 grid gap-1.5">{evidence.slice(0, 3).map((item) => <li key={`${item.time}-${item.title}`} className="grid grid-cols-[2.8rem_minmax(0,1fr)] gap-2 text-[9px]"><time className="font-mono font-bold text-[var(--mb-ocean-600)]">{item.time}</time><span className="truncate text-[var(--mb-neutral-600)]">{item.title}</span></li>)}</ol></div></section>;
}

export function ImpactDemonstrated({ opportunities, dossiers, artifacts }: { opportunities: Array<{ estimatedAmount: number; beneficiaries: number; status: string }>; dossiers: FundingDossierRecord[]; artifacts: GeneratedArtifact[] }) {
  const total = opportunities.reduce((sum, item) => sum + item.estimatedAmount, 0);
  const financed = opportunities.filter((item) => item.status === "Financé").reduce((sum, item) => sum + item.estimatedAmount, 0);
  const beneficiaries = opportunities.reduce((sum, item) => sum + item.beneficiaries, 0);
  const proofs = artifacts.length;
  return <section className="border-b border-[var(--mb-neutral-200)] bg-[linear-gradient(100deg,#eef8f8,#ffffff_55%,#f8f3e8)] px-4 py-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Impact démontré</p><h2 className="mt-1 text-[18px] font-semibold text-[var(--mb-navy-900)]">La valeur avant le détail des dossiers.</h2></div><p className="text-[9px] text-[var(--mb-neutral-600)]">Calculs sur données de démonstration · preuves locales visibles</p></div><div className="mt-4 grid gap-px bg-[var(--mb-neutral-200)] sm:grid-cols-2 xl:grid-cols-4"><ImpactMetric label="Valeur économique" value={formatFcfa(total)} detail="Besoins structurés" /><ImpactMetric label="Reste à financer" value={formatFcfa(Math.max(0, total - financed))} detail={`${dossiers.length} dossier(s) constitué(s)`} /><ImpactMetric label="Bénéficiaires" value={String(beneficiaries)} detail="Acteurs potentiellement concernés" /><ImpactMetric label="Preuves associées" value={String(proofs)} detail="Qualifications, dossiers et suivis" /></div></section>;
}

export function RisksPanel({ items }: { items: Array<{ title: string; detail: string; source: string; level: Level }> }) {
  if (!items.length) return null;
  return <section className="border border-[var(--mb-neutral-200)] bg-white"><header className="border-b border-[var(--mb-neutral-200)] px-3 py-2.5"><p className="font-mono text-[8px] uppercase text-[var(--mb-neutral-400)]">Vigilances à suivre</p><h2 className="mt-1 text-[12px] font-bold text-[var(--mb-navy-900)]">Risques</h2><p className="mt-1 text-[9px] text-[var(--mb-neutral-600)]">Un risque informe la surveillance. Il ne remplace pas une décision.</p></header><div className="divide-y divide-[var(--mb-neutral-100)]">{items.map((item) => <article key={item.title} className="grid gap-2 px-3 py-3"><div className="flex items-start justify-between gap-2"><h3 className="text-[10px] font-semibold leading-4">{item.title}</h3><StatusBadge level={item.level} /></div><p className="text-[9px] leading-4 text-[var(--mb-neutral-600)]">{item.detail}</p><p className="font-mono text-[8px] text-[var(--mb-ocean-600)]">SOURCE · {item.source}</p></article>)}</div></section>;
}

function SectionTitle({ eyebrow, title, helper }: { eyebrow: string; title: string; helper: string }) {
  return <div><p className="font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">{eyebrow}</p><h2 className="mt-1 text-[18px] font-semibold text-[var(--mb-navy-900)]">{title}</h2><p className="mt-1 text-[10px] text-[var(--mb-neutral-600)]">{helper}</p></div>;
}

function ImpactMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="bg-white px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-600)]">{label}</p><strong className="mt-2 block font-mono text-[18px] text-[var(--mb-navy-900)]">{value}</strong><p className="mt-1 text-[8px] text-[var(--mb-neutral-600)]">{detail}</p></div>;
}

export function RegisterSummaryBanner({ items }: { items: Array<{ label: string; value?: string; tone?: "done" | "waiting" | "ready" | "blocked"; content?: ReactNode }> }) {
  const visible = items.filter((item) => item.value || item.content);
  if (!visible.length) return null;
  const toneClass = { done: "border-[var(--mb-green-600)]", waiting: "border-[var(--mb-amber-500)]", ready: "border-[var(--mb-ocean-600)]", blocked: "border-[var(--mb-red-600)]" };
  return <div className="grid border-b border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] sm:grid-cols-2 xl:grid-cols-4">{visible.map((item) => <div key={item.label} className={`border-l-2 ${toneClass[item.tone || "waiting"]} px-3 py-2.5`}><p className="font-mono text-[7px] font-bold uppercase tracking-[0.07em] text-[var(--mb-neutral-400)]">{item.label}</p><div className="mt-1 text-[9px] font-semibold leading-4 text-[var(--mb-navy-900)]">{item.content || item.value}</div></div>)}</div>;
}
