"use client";

import type { ReactNode } from "react";
import { quays, type Level, type Quay } from "@/data/ministryControlTowerData";
import type { FundingDossierRecord, FundingOpportunity, GeneratedArtifact } from "@/data/ministryValueJourneyData";
import type { DossierOperationnel } from "@/lib/ministryOperationalDossiers";
import { DossierCard, MyDossiers } from "./MinistryDossierExperience";
import { formatFcfa } from "@/data/ministryValueJourneyData";
import { DataTrustBadge, primaryButton, StatusBadge, type WorkspaceId } from "./MinistryControlTowerParts";
import type { DemoRole } from "./MinistryOperationalRegisters";

type DailyAction = { title: string; detail: string; label: string; level: Level; onClick: () => void };

export function TodayView({ role, dossiers, opportunities, onNavigate, onOpenDossier }: {
  role: DemoRole;
  dossiers: DossierOperationnel[];
  opportunities: FundingOpportunity[];
  onNavigate: (workspace: WorkspaceId) => void;
  onOpenDossier: (dossier: DossierOperationnel) => void;
}) {
  const activeQuays = quays.length;
  const trackedBoats = quays.reduce((sum, quay) => sum + quay.activePirogues, 0);
  const attentionZones = quays.filter((quay) => quay.level !== "normal").length;
  const openDossiers = dossiers.filter((dossier) => dossier.workStatus !== "Terminé");
  const closedDossiers = dossiers.filter((dossier) => dossier.workStatus === "Terminé");
  const roleDossiers = role === "Ministère"
    ? openDossiers.filter((dossier) => ["Note", "Financement", "Incident"].includes(dossier.type))
    : role === "Direction régionale"
      ? openDossiers.filter((dossier) => ["Vérification", "Incident", "Rapport"].includes(dossier.type))
      : openDossiers.filter((dossier) => ["Financement", "Rapport", "Note"].includes(dossier.type));
  const urgentDossiers = [...roleDossiers, ...openDossiers.filter((dossier) => !roleDossiers.some((item) => item.id === dossier.id))].slice(0, 3);
  const primaryDossier = urgentDossiers[0];
  const financeable = opportunities.filter((item) => item.status !== "Financé");
  const financeableAmount = financeable.reduce((sum, item) => sum + item.estimatedAmount, 0);
  const financeableBeneficiaries = financeable.reduce((sum, item) => sum + item.beneficiaries, 0);
  const availablePieces = dossiers.reduce((sum, dossier) => sum + dossier.pieces.filter((piece) => piece.status === "Disponible").length, 0);
  const moduleItems = [
    { id: "atlas" as const, title: "Atlas", count: dossiers.filter((dossier) => dossier.type === "Situation terrain" && dossier.workStatus !== "Terminé").length, detail: "Situations territoriales" },
    { id: "community" as const, title: "Communautés & Programmes", count: dossiers.filter((dossier) => dossier.type === "Besoin filière" && dossier.workStatus !== "Terminé").length, detail: "Besoins à instruire" },
    { id: "pilotage" as const, title: "Pilotage", count: dossiers.filter((dossier) => dossier.type === "Décision institutionnelle" && dossier.workStatus !== "Terminé").length, detail: "Décisions à arbitrer" },
  ];
  const moduleOrder = role === "Ministère" ? ["pilotage", "community", "atlas"] : role === "Direction régionale" ? ["atlas", "community", "pilotage"] : ["community", "pilotage", "atlas"];
  const modules = moduleOrder.map((id) => moduleItems.find((item) => item.id === id)!).filter(Boolean);
  const roleIntro = role === "Ministère" ? "Dossiers à arbitrer, financer ou suivre au niveau national." : role === "Direction régionale" ? "Vérifications, incidents et rapports confiés à la direction régionale." : "Dossiers finançables, preuves et documents utiles au partenaire.";
  const pageTitle = role === "Ministère" ? "Situation nationale" : role === "Direction régionale" ? "Briefing régional" : "Portefeuille finançable";
  const primaryLabel = role === "Ministère" ? "Arbitrer le prochain dossier" : role === "Direction régionale" ? "Traiter le prochain dossier" : "Consulter le dossier prioritaire";
  const dossierSectionTitle = role === "Ministère" ? "Décisions et dossiers à arbitrer" : role === "Direction régionale" ? "Dossiers à traiter" : "Dossiers instruisibles";
  const dossierSectionHelper = role === "Partenaire / Bailleur" ? "Montants, bénéficiaires et preuves restent reliés à chaque dossier, sans exposer les échanges terrain bruts." : "Chaque dossier conserve son origine, ses pièces, son historique et sa prochaine action.";

  return <section className="min-h-full bg-[var(--mb-offwhite)]">
    <header className="border-b border-[var(--mb-neutral-200)] bg-[linear-gradient(115deg,#f7fbfc_0%,#edf7f8_55%,#f7f3e8_100%)] px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[86rem]"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Briefing du jour · {role}</p><div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><div><h1 className="text-[28px] font-semibold text-[var(--mb-navy-900)]">{pageTitle}</h1><p className="mt-2 max-w-2xl text-[13px] leading-6 text-[var(--mb-neutral-600)]">{roleIntro}</p>{primaryDossier ? <button onClick={() => onOpenDossier(primaryDossier)} className={`${primaryButton} mt-4`}>{primaryLabel}</button> : null}</div>{role === "Partenaire / Bailleur" ? <div className="grid grid-cols-3 divide-x divide-[var(--mb-neutral-200)] border-y border-[var(--mb-neutral-200)] bg-white/70"><BriefMetric label="Portefeuille" value={formatFcfa(financeableAmount)} /><BriefMetric label="Bénéficiaires" value={String(financeableBeneficiaries)} /><BriefMetric label="Pièces disponibles" value={String(availablePieces)} /></div> : <div className="flex flex-wrap gap-4 font-mono text-[11px] text-[var(--mb-navy-700)]"><strong>{trackedBoats} pirogues suivies</strong><strong>{activeQuays} quais actifs</strong><strong className="text-[#805817]">{attentionZones} zones en vigilance</strong></div>}</div></div>
    </header>
    <div className="mx-auto grid max-w-[86rem] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,.55fr)] lg:px-8">
      <div className="grid content-start gap-5">
        <section><SectionTitle eyebrow={role === "Partenaire / Bailleur" ? "Instruction" : "Priorités"} title={dossierSectionTitle} helper={dossierSectionHelper} /><div className="mt-3 grid gap-3 md:grid-cols-2">{urgentDossiers.map((dossier, index) => <DossierCard key={dossier.id} dossier={dossier} onOpen={onOpenDossier} prominent={index === 0} />)}</div></section>
        <section><SectionTitle eyebrow="Clôture" title="Dossiers clôturés aujourd’hui" helper="Les sorties terminées restent consultables et reliées à leurs preuves." /><ol className="mt-3 divide-y divide-[var(--mb-neutral-100)] border border-[var(--mb-neutral-200)] bg-white">{closedDossiers.slice(0, 4).map((dossier) => <li key={dossier.id}><button onClick={() => onOpenDossier(dossier)} className="grid w-full gap-2 px-4 py-3 text-left sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center"><span className="font-mono text-[9px] font-bold text-[var(--mb-ocean-600)]">{dossier.id}</span><div><p className="text-[10px] font-semibold text-[var(--mb-navy-900)]">{dossier.linkedObject}</p><p className="mt-1 text-[8px] text-[var(--mb-neutral-600)]">{dossier.finalOutput}</p></div><span className="text-[8px] font-bold text-[var(--mb-green-600)]">TERMINÉ</span></button></li>)}</ol></section>
      </div>
      <aside className="grid content-start gap-4">
        <section className="border border-[var(--mb-neutral-200)] bg-white"><header className="border-b border-[var(--mb-neutral-200)] px-4 py-3"><h2 className="text-[12px] font-bold text-[var(--mb-navy-900)]">Accès par dossier</h2><p className="mt-1 text-[9px] text-[var(--mb-neutral-600)]">Compteurs adaptés à la vue actuelle.</p></header><div className="divide-y divide-[var(--mb-neutral-100)]">{modules.map((module) => <button key={module.id} onClick={() => onNavigate(module.id)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-4 text-left hover:bg-[var(--mb-foam)]"><div><h3 className="text-[11px] font-semibold text-[var(--mb-navy-900)]">{module.title}</h3><p className="mt-1 text-[9px] text-[var(--mb-neutral-600)]">{module.detail}</p></div><span className="font-mono text-[9px] font-bold text-[var(--mb-ocean-600)]">{module.count} →</span></button>)}</div></section>
        <section className="border-l-2 border-[var(--mb-ocean-600)] bg-[var(--mb-foam)] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[8px] font-bold uppercase tracking-[0.09em] text-[var(--mb-ocean-600)]">Pourquoi faire confiance</p><h2 className="mt-2 text-[12px] font-semibold text-[var(--mb-navy-900)]">Chaque dossier rattache une source, un responsable et des pièces consultables.</h2></div><DataTrustBadge level="consolidated" source="Synthèse locale issue des dossiers et preuves de cette démonstration." /></div><p className="mt-3 text-[9px] leading-4 text-[var(--mb-neutral-600)]">{role === "Partenaire / Bailleur" ? "Les statuts de transmission restent explicites et manuels. Aucun envoi externe n’est simulé comme réellement effectué." : "Les canaux terrain restent manuels. Le poste officiel assure le premier niveau ; la validation finale reste régionale."}</p></section>
      </aside>
    </div>
    {role === "Direction régionale" ? <MyDossiers dossiers={dossiers} onOpen={onOpenDossier} /> : null}
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

function BriefMetric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 px-3 py-3"><strong className="block truncate font-mono text-[13px] text-[var(--mb-navy-900)]">{value}</strong><span className="mt-1 block text-[7px] font-bold uppercase tracking-[0.07em] text-[var(--mb-neutral-500)]">{label}</span></div>;
}

export function RegisterSummaryBanner({ items }: { items: Array<{ label: string; value?: string; tone?: "done" | "waiting" | "ready" | "blocked"; content?: ReactNode }> }) {
  const visible = items.filter((item) => item.value || item.content);
  if (!visible.length) return null;
  const toneClass = { done: "border-[var(--mb-green-600)]", waiting: "border-[var(--mb-amber-500)]", ready: "border-[var(--mb-ocean-600)]", blocked: "border-[var(--mb-red-600)]" };
  return <div className="grid border-b border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] sm:grid-cols-2 xl:grid-cols-4">{visible.map((item) => <div key={item.label} className={`border-l-2 ${toneClass[item.tone || "waiting"]} px-3 py-2.5`}><p className="font-mono text-[7px] font-bold uppercase tracking-[0.07em] text-[var(--mb-neutral-400)]">{item.label}</p><div className="mt-1 text-[9px] font-semibold leading-4 text-[var(--mb-navy-900)]">{item.content || item.value}</div></div>)}</div>;
}
