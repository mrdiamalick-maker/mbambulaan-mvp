"use client";

import { useEffect, useMemo, useState } from "react";
import {
  communityNeeds,
  communityProjects,
  partners,
  quays,
  trainingPrograms,
  type CommunityNeed,
} from "@/data/ministryControlTowerData";
import {
  fundingCoverageByOpportunity,
  impactProofs,
  needMaturityScores,
  type FundingDossierRecord,
  type FundingOpportunity,
  type GeneratedArtifact,
} from "@/data/ministryValueJourneyData";
import type { DossierOperationnel } from "@/lib/ministryOperationalDossiers";
import { DataTrustBadge, primaryButton, secondaryButton, StatusBadge, WorkspaceHeader } from "./MinistryControlTowerParts";
import { FundingRegister } from "./MinistryOperationalRegisters";

type Reading = "needs" | "programs" | "funding";

type Props = {
  focusQuayId?: string | null;
  assistanceEnabled: boolean;
  dossiers: DossierOperationnel[];
  opportunities: FundingOpportunity[];
  fundingDossiers: FundingDossierRecord[];
  artifacts: GeneratedArtifact[];
  onOpenDossier: (dossier: DossierOperationnel) => void;
  onConstituteFunding: (opportunity: FundingOpportunity) => void;
  onConfirmTransmission: (id: string, date: string, responsible: string) => void;
  onRecordPartnerResponse: (id: string) => void;
  onViewAtlas: (quayId: string) => void;
};

const maturityStages = ["Signalé", "Vérifié", "Qualifié", "Programme proposé", "Finançable"] as const;

export function MinistryCommunityProgramsView({ focusQuayId, assistanceEnabled, dossiers, opportunities, fundingDossiers, artifacts, onOpenDossier, onConstituteFunding, onConfirmTransmission, onRecordPartnerResponse, onViewAtlas }: Props) {
  const [reading, setReading] = useState<Reading>("needs");
  const [quayId, setQuayId] = useState("Tous");

  useEffect(() => {
    if (focusQuayId) setQuayId(focusQuayId);
  }, [focusQuayId]);

  const selectedQuay = quays.find((quay) => quay.id === quayId);
  const matchesTerritory = (value: string) => !selectedQuay || [selectedQuay.name, selectedQuay.commune].some((name) => value.toLocaleLowerCase("fr").includes(name.toLocaleLowerCase("fr")));
  const visibleNeeds = communityNeeds.filter((need) => !selectedQuay || matchesTerritory(need.place));
  const visibleProjects = communityProjects.filter((project) => !selectedQuay || matchesTerritory(project.territory));
  const visibleTraining = trainingPrograms.filter((program) => !selectedQuay || program.region === selectedQuay.region);
  const visibleOpportunities = opportunities.filter((opportunity) => !selectedQuay || matchesTerritory(opportunity.title) || opportunity.territory === selectedQuay.region);
  const totalBudget = visibleOpportunities.reduce((sum, opportunity) => sum + opportunity.estimatedAmount, 0);
  const totalCovered = visibleOpportunities.reduce((sum, opportunity) => sum + (fundingCoverageByOpportunity[opportunity.id]?.coveredAmount ?? 0), 0);
  const joalMbour = opportunities.find((opportunity) => opportunity.id === "fund-op-1");
  const joalDossier = findOpportunityDossier(dossiers, joalMbour);

  return <section className="min-h-full bg-[var(--mb-offwhite)]">
    <WorkspaceHeader title="Communautés & Programmes" question="Transformer les besoins remontés en programmes mesurables et en dossiers finançables." scope={selectedQuay?.name ?? "Nationale"} onScopeChange={() => undefined} onExport={() => undefined} />
    <div className="border-b border-[var(--mb-neutral-200)] bg-white px-4 py-5 sm:px-6">
      <div className="mx-auto grid max-w-[86rem] gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,.75fr)] xl:items-end">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">Écoute structurée du terrain</p><h2 className="mt-2 max-w-3xl text-[24px] font-semibold leading-tight text-[var(--mb-navy-900)]">Un besoin communautaire devient un programme documenté, un impact mesurable et un financement à instruire.</h2><p className="mt-3 max-w-3xl text-[11px] leading-5 text-[var(--mb-neutral-600)]">Les chiffres sont simulés. Les partenaires ne sont jamais sollicités automatiquement et toute transmission reste confirmée manuellement.</p></div>
        <div className="grid grid-cols-3 border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)]"><SummaryNumber label="Besoins" value={String(visibleNeeds.length)} /><SummaryNumber label="Programmes" value={String(visibleProjects.length + visibleTraining.length)} /><SummaryNumber label="À mobiliser" value={formatCompact(Math.max(totalBudget - totalCovered, 0))} /></div>
      </div>
    </div>

    <div className="sticky top-0 z-30 border-b border-[var(--mb-neutral-200)] bg-white px-4 sm:px-6">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex overflow-x-auto" aria-label="Lectures Communautés et Programmes"><ReadingButton active={reading === "needs"} onClick={() => setReading("needs")}>Besoins remontés</ReadingButton><ReadingButton active={reading === "programs"} onClick={() => setReading("programs")}>Programmes & actions</ReadingButton><ReadingButton active={reading === "funding"} onClick={() => setReading("funding")}>Financements & partenaires</ReadingButton></nav>
        <label className="flex items-center gap-2 text-[10px] font-bold text-[var(--mb-neutral-600)]">Quai <select value={quayId} onChange={(event) => setQuayId(event.target.value)} className="h-9 min-w-44 border border-[var(--mb-neutral-200)] bg-white px-2 text-[11px] font-semibold text-[var(--mb-navy-900)]"><option value="Tous">Tous les quais</option>{quays.map((quay) => <option key={quay.id} value={quay.id}>{quay.name}</option>)}</select></label>
      </div>
    </div>

    <div className="mx-auto max-w-[86rem] px-4 py-5 sm:px-6">
      {reading === "needs" ? <NeedsReading needs={visibleNeeds} opportunities={opportunities} dossiers={dossiers} onOpenDossier={onOpenDossier} /> : null}
      {reading === "programs" ? <ProgramsReading projects={visibleProjects} trainings={visibleTraining} onViewAtlas={onViewAtlas} /> : null}
      {reading === "funding" ? <FundingReading opportunities={visibleOpportunities} fundingDossiers={fundingDossiers} dossiers={dossiers} onOpenDossier={onOpenDossier} onConstituteFunding={onConstituteFunding} onConfirmTransmission={onConfirmTransmission} onRecordPartnerResponse={onRecordPartnerResponse} /> : null}

      {quayId === "Tous" && joalMbour ? <section className="mt-5 border border-[var(--mb-ocean-600)]/25 bg-[linear-gradient(105deg,#edf7f8,#fff)] p-5"><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Parcours de démonstration · Joal–Mbour</p><h3 className="mt-2 text-[20px] font-semibold text-[var(--mb-navy-900)]">Chaîne de froid communautaire</h3><p className="mt-2 max-w-3xl text-[11px] leading-5 text-[var(--mb-neutral-600)]">Besoin vérifié, 680 bénéficiaires, programme structuré, budget de {formatCompact(joalMbour.estimatedAmount)} et partenaire compatible identifié. Le dossier unique conserve les pièces et la prochaine action.</p><div className="mt-4 flex flex-wrap gap-4 text-[10px]"><strong>{fundingCoverageByOpportunity[joalMbour.id].availablePieces} pièces disponibles</strong><span>{formatCompact(fundingCoverageByOpportunity[joalMbour.id].coveredAmount)} couverts</span><span>{formatCompact(joalMbour.estimatedAmount - fundingCoverageByOpportunity[joalMbour.id].coveredAmount)} à mobiliser</span></div></div><button onClick={() => joalDossier ? onOpenDossier(joalDossier) : onConstituteFunding(joalMbour)} className={primaryButton}>{joalDossier ? "Ouvrir le dossier de financement" : "Constituer le dossier de financement"}</button></div></section> : null}

      {assistanceEnabled ? <section className="mt-5 border-l-2 border-[var(--mb-ocean-600)] bg-[var(--mb-foam)] p-4"><p className="text-[9px] font-bold uppercase tracking-[0.09em] text-[var(--mb-ocean-600)]">Proposition à valider</p><h3 className="mt-2 text-[13px] font-semibold text-[var(--mb-navy-900)]">Regrouper les besoins froid de Joal et Mbour dans une fiche programme commune.</h3><p className="mt-2 text-[10px] leading-5 text-[var(--mb-neutral-600)]">Sources : besoins need-1 et need-4, programme project-1, opportunité fund-op-1 et {artifacts.filter((artifact) => artifact.scope.includes("Joal")).length} preuve(s) locale(s). Assistance déterministe, aucune API. Validation humaine obligatoire.</p></section> : null}
    </div>
  </section>;
}

function NeedsReading({ needs, opportunities, dossiers, onOpenDossier }: { needs: CommunityNeed[]; opportunities: FundingOpportunity[]; dossiers: DossierOperationnel[]; onOpenDossier: (dossier: DossierOperationnel) => void }) {
  const grouped = maturityStages.map((stage) => ({ stage, needs: needs.filter((need) => maturityFor(need, opportunities) === stage) }));
  return <section><SectionIntro title="Maturité des besoins" helper="La qualification progresse uniquement quand une source, des acteurs et des éléments de preuve sont identifiés." /><div className="mt-4 grid gap-px overflow-hidden border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] lg:grid-cols-5">{grouped.map(({ stage, needs: stageNeeds }) => <div key={stage} className="min-w-0 bg-white"><header className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] px-3 py-3"><p className="text-[10px] font-bold text-[var(--mb-navy-900)]">{stage}</p><p className="mt-1 font-mono text-[9px] text-[var(--mb-neutral-500)]">{stageNeeds.length} besoin(s)</p></header><div className="divide-y divide-[var(--mb-neutral-100)]">{stageNeeds.map((need) => { const opportunity = opportunities.find((item) => item.needId === need.id); const dossier = findOpportunityDossier(dossiers, opportunity); return <article key={need.id} className="p-3"><div className="flex items-start justify-between gap-2"><h3 className="text-[11px] font-semibold leading-4 text-[var(--mb-navy-900)]">{need.need}</h3><StatusBadge level={need.urgency}>{need.urgency === "urgent" ? "Urgent" : need.urgency === "surveillance" ? "À suivre" : "Stable"}</StatusBadge></div><p className="mt-2 text-[9px] leading-4 text-[var(--mb-neutral-600)]">{need.place} · {need.actors}</p><div className="mt-2"><DataTrustBadge level={need.trustLevel} compact source={`Besoin remonté depuis ${need.place}.`} /></div><p className="mt-2 text-[9px] text-[var(--mb-neutral-500)]">Maturité · {needMaturityScores[need.id] ?? 40} %</p>{dossier ? <button onClick={() => onOpenDossier(dossier)} className="mt-3 text-[10px] font-bold text-[var(--mb-ocean-600)]">Ouvrir le dossier →</button> : <p className="mt-3 text-[9px] font-semibold text-[var(--mb-neutral-500)]">Prochaine action : {need.nextAction}</p>}</article>; })}{!stageNeeds.length ? <p className="p-3 text-[9px] text-[var(--mb-neutral-400)]">Aucun besoin à cette étape.</p> : null}</div></div>)}</div></section>;
}

function ProgramsReading({ projects, trainings, onViewAtlas }: { projects: typeof communityProjects; trainings: typeof trainingPrograms; onViewAtlas: (quayId: string) => void }) {
  return <section><SectionIntro title="Portefeuille de programmes et d’actions" helper="Projets communautaires, formations et campagnes restent reliés à un territoire, un public et un résultat attendu." /><div className="mt-4 divide-y divide-[var(--mb-neutral-200)] border-y border-[var(--mb-neutral-200)] bg-white">{projects.map((project) => <article key={project.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(8rem,.55fr))_auto] lg:items-center"><div><p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-ocean-600)]">Projet communautaire</p><h3 className="mt-1 text-[13px] font-semibold text-[var(--mb-navy-900)]">{project.project}</h3><p className="mt-1 text-[10px] text-[var(--mb-neutral-600)]">Objectif : apporter une réponse structurée au besoin remonté par {project.owner.toLocaleLowerCase("fr")}.</p></div><ProgramFact label="Territoire" value={project.territory} /><ProgramFact label="Bénéficiaires" value={String(project.beneficiaries)} /><ProgramFact label="Impact suivi" value={project.project.includes("froid") ? "Pertes évitées" : project.project.includes("Sécurité") ? "Équipement disponible" : "Acteurs accompagnés"} /><div><p className="text-[10px] font-bold text-[var(--mb-navy-900)]">{project.status}</p><p className="mt-1 text-[9px] text-[var(--mb-neutral-500)]">{project.nextAction}</p></div></article>)}{trainings.map((program) => <article key={program.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(8rem,.55fr))_auto] lg:items-center"><div><p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-ocean-600)]">Formation</p><h3 className="mt-1 text-[13px] font-semibold text-[var(--mb-navy-900)]">{program.title}</h3><p className="mt-1 text-[10px] text-[var(--mb-neutral-600)]">{program.target}</p></div><ProgramFact label="Territoire" value={program.region} /><ProgramFact label="Participants" value={String(program.expectedParticipants)} /><ProgramFact label="Période" value={program.period} /><div><p className="text-[10px] font-bold text-[var(--mb-navy-900)]">{program.status}</p><p className="mt-1 text-[9px] text-[var(--mb-neutral-500)]">{program.potentialPartner}</p></div></article>)}</div><button onClick={() => onViewAtlas("joal")} className={`${secondaryButton} mt-4`}>Voir l’ancrage territorial dans l’Atlas</button></section>;
}

function FundingReading({ opportunities, fundingDossiers, dossiers, onOpenDossier, onConstituteFunding, onConfirmTransmission, onRecordPartnerResponse }: { opportunities: FundingOpportunity[]; fundingDossiers: FundingDossierRecord[]; dossiers: DossierOperationnel[]; onOpenDossier: (dossier: DossierOperationnel) => void; onConstituteFunding: (opportunity: FundingOpportunity) => void; onConfirmTransmission: (id: string, date: string, responsible: string) => void; onRecordPartnerResponse: (id: string) => void }) {
  return <section><SectionIntro title="Financements à instruire" helper="Lecture documentaire des montants, pièces, partenaires compatibles et résultats attendus. Aucune transmission automatique." /><div className="mt-4 overflow-x-auto border-y border-[var(--mb-neutral-200)] bg-white"><table className="w-full min-w-[60rem] text-left"><thead><tr className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] text-[9px] uppercase tracking-[0.06em] text-[var(--mb-neutral-500)]"><th className="px-3 py-3">Besoin ou programme</th><th className="px-3 py-3">Budget</th><th className="px-3 py-3">Couvert / reste</th><th className="px-3 py-3">Maturité</th><th className="px-3 py-3">Partenaire</th><th className="px-3 py-3">Preuves</th><th className="px-3 py-3">Action</th></tr></thead><tbody>{opportunities.map((opportunity) => { const coverage = fundingCoverageByOpportunity[opportunity.id] ?? { coveredAmount: 0, availablePieces: 0, partnerStatus: "À qualifier" }; const dossier = findOpportunityDossier(dossiers, opportunity); const record = fundingDossiers.find((item) => item.needId === opportunity.needId); return <tr key={opportunity.id} className="border-b border-[var(--mb-neutral-100)] text-[10px]"><td className="px-3 py-4"><strong className="block max-w-xs text-[11px] text-[var(--mb-navy-900)]">{opportunity.title}</strong><span className="mt-1 block text-[var(--mb-neutral-500)]">{opportunity.beneficiaries} bénéficiaires · {opportunity.expectedImpact}</span></td><td className="px-3 py-4 font-mono font-semibold">{formatCompact(opportunity.estimatedAmount)}</td><td className="px-3 py-4"><span className="block font-semibold text-[var(--mb-green-600)]">{formatCompact(coverage.coveredAmount)}</span><span className="mt-1 block text-[var(--mb-neutral-500)]">reste {formatCompact(opportunity.estimatedAmount - coverage.coveredAmount)}</span></td><td className="px-3 py-4"><strong>{opportunity.maturityScore} %</strong><div className="mt-2 h-1.5 w-20 bg-[var(--mb-neutral-100)]"><div className="h-full bg-[var(--mb-ocean-600)]" style={{ width: `${opportunity.maturityScore}%` }} /></div></td><td className="px-3 py-4"><strong>{opportunity.compatibleFunder}</strong><span className="mt-1 block text-[var(--mb-neutral-500)]">{coverage.partnerStatus}</span></td><td className="px-3 py-4">{coverage.availablePieces} pièce(s)</td><td className="px-3 py-4">{dossier ? <button onClick={() => onOpenDossier(dossier)} className={secondaryButton}>Ouvrir le dossier</button> : <button onClick={() => onConstituteFunding(opportunity)} className={primaryButton}>Constituer le dossier</button>}<span className="mt-1 block text-[9px] text-[var(--mb-neutral-500)]">{record?.status ?? opportunity.status}</span></td></tr>; })}</tbody></table></div>{fundingDossiers.length ? <div className="mt-5"><FundingRegister dossiers={fundingDossiers} onConfirmTransmission={onConfirmTransmission} onRecordResponse={onRecordPartnerResponse} /></div> : null}<div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{impactProofs.map((proof) => <article key={proof.id} className="border-l-2 border-[var(--mb-ocean-400)] bg-white p-3"><strong className="font-mono text-[18px] text-[var(--mb-navy-900)]">{proof.figure}</strong><p className="mt-1 text-[10px] font-semibold">{proof.unit}</p><p className="mt-1 text-[9px] text-[var(--mb-neutral-500)]">{proof.detail}</p></article>)}</div><p className="mt-4 text-[9px] text-[var(--mb-neutral-500)]">Partenaires mobilisables dans le référentiel local : {partners.map((partner) => partner.name).join(" · ")}.</p></section>;
}

function findOpportunityDossier(dossiers: DossierOperationnel[], opportunity?: FundingOpportunity) {
  if (!opportunity) return undefined;
  return dossiers.find((dossier) => dossier.type === "Besoin filière" && (dossier.sourceId === opportunity.id || dossier.linkedObject === opportunity.title));
}

function maturityFor(need: CommunityNeed, opportunities: FundingOpportunity[]): typeof maturityStages[number] {
  const opportunity = opportunities.find((item) => item.needId === need.id);
  if (opportunity?.status === "Éligible au financement" || opportunity?.status === "Dossier constitué") return "Finançable";
  if (opportunity) return "Programme proposé";
  if ((needMaturityScores[need.id] ?? 0) >= 70) return "Qualifié";
  if (["verified", "consolidated"].includes(need.trustLevel)) return "Vérifié";
  return "Signalé";
}

function formatCompact(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} Md FCFA`;
  return `${Math.round(value / 1_000_000).toLocaleString("fr-FR")} M FCFA`;
}

function ReadingButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} className={`min-h-9 shrink-0 border-b-2 px-3 text-[10px] font-bold ${active ? "border-[var(--mb-ocean-600)] text-[var(--mb-ocean-600)]" : "border-transparent text-[var(--mb-neutral-600)] hover:text-[var(--mb-navy-900)]"}`}>{children}</button>; }
function SummaryNumber({ label, value }: { label: string; value: string }) { return <div className="min-w-0 border-r border-[var(--mb-neutral-200)] p-3 last:border-r-0"><strong className="block truncate font-mono text-[18px] text-[var(--mb-navy-900)]">{value}</strong><span className="mt-1 block text-[9px] font-semibold text-[var(--mb-neutral-500)]">{label}</span></div>; }
function SectionIntro({ title, helper }: { title: string; helper: string }) { return <header><h2 className="text-[16px] font-semibold text-[var(--mb-navy-900)]">{title}</h2><p className="mt-1 max-w-3xl text-[10px] leading-5 text-[var(--mb-neutral-600)]">{helper}</p></header>; }
function ProgramFact({ label, value }: { label: string; value: string }) { return <div><p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--mb-neutral-500)]">{label}</p><p className="mt-1 text-[10px] font-semibold text-[var(--mb-navy-900)]">{value}</p></div>; }
