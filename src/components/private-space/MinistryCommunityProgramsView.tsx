"use client";

import { useEffect, useMemo, useState } from "react";
import {
  communityNeeds,
  communityProjects,
  partners,
  quays,
  trainingPrograms,
  type CommunityNeed,
  type Level,
} from "@/data/ministryControlTowerData";
import {
  fundingCoverageByOpportunity,
  impactProofs,
  type FundingDossierRecord,
  type FundingOpportunity,
  type GeneratedArtifact,
} from "@/data/ministryValueJourneyData";
import { fundingMaturity, needRelations } from "@/lib/ministrySelectors";
import type { DossierOperationnel } from "@/lib/ministryOperationalDossiers";
import { DataTrustBadge, primaryButton, secondaryButton, StatusBadge, WorkspaceHeader } from "./MinistryControlTowerParts";
import { FundingRegister } from "./MinistryOperationalRegisters";

type Reading = "needs" | "programs" | "funding";
type NeedStatus = "Tous" | CommunityNeed["maturity"];

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

export function MinistryCommunityProgramsView(props: Props) {
  const { focusQuayId, assistanceEnabled, opportunities, fundingDossiers, artifacts } = props;
  const [reading, setReading] = useState<Reading>("needs");
  const [quayId, setQuayId] = useState("Tous");
  const [needStatus, setNeedStatus] = useState<NeedStatus>("Tous");
  const [category, setCategory] = useState("Toutes");
  const [urgency, setUrgency] = useState("Tous");
  const [audience, setAudience] = useState("Tous");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedFundingId, setSelectedFundingId] = useState<string | null>(null);

  useEffect(() => {
    if (focusQuayId) setQuayId(focusQuayId);
  }, [focusQuayId]);

  const selectedQuay = quays.find((quay) => quay.id === quayId);
  const baseNeeds = communityNeeds.filter((need) => quayId === "Tous" || need.quayId === quayId);
  const visibleNeeds = baseNeeds.filter((need) => needStatus === "Tous" || need.maturity === needStatus).filter((need) => category === "Toutes" || need.category === category).filter((need) => urgency === "Tous" || need.urgency === urgency).filter((need) => audience === "Tous" || need.audience === audience);
  const visibleProjects = communityProjects.filter((program) => quayId === "Tous" || program.quayIds.includes(quayId));
  const visibleTraining = trainingPrograms.filter((program) => quayId === "Tous" || program.quayIds.includes(quayId));
  const visibleNeedIds = new Set(baseNeeds.map((need) => need.id));
  const visibleOpportunities = opportunities.filter((opportunity) => visibleNeedIds.has(opportunity.needId));
  const totalBudget = visibleOpportunities.reduce((sum, opportunity) => sum + opportunity.estimatedAmount, 0);
  const totalCovered = visibleOpportunities.reduce((sum, opportunity) => sum + (fundingCoverageByOpportunity[opportunity.id]?.coveredAmount ?? 0), 0);
  const assistantSources = visibleNeeds.slice(0, 3).map((need) => `${need.id} · ${need.place}`);

  const openProgram = (need: CommunityNeed) => {
    const relation = needRelations(need, opportunities);
    setSelectedProgramId(relation.program?.id ?? null);
    setReading("programs");
  };
  const openFunding = (need: CommunityNeed) => {
    const relation = needRelations(need, opportunities);
    setSelectedFundingId(relation.financing?.id ?? null);
    setReading("funding");
  };

  return <section className="min-h-full bg-[var(--mb-offwhite)]">
    <WorkspaceHeader title="Communautés & Programmes" question="Relier un besoin vérifié à une réponse organisée puis à un financement à instruire." scope={selectedQuay?.name ?? "Nationale"} onScopeChange={() => undefined} onExport={() => undefined} />
    <div className="border-b border-[var(--mb-neutral-200)] bg-white px-4 py-5 sm:px-6"><div className="mx-auto grid max-w-[86rem] gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,.75fr)] xl:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">Écoute structurée du terrain</p><h2 className="mt-2 max-w-3xl text-[24px] font-semibold leading-tight text-[var(--mb-navy-900)]">Le besoin garde son identité. Le programme organise la réponse. Le financement soutient sa réalisation.</h2><p className="mt-3 max-w-3xl text-[11px] leading-5 text-[var(--mb-neutral-600)]">Les relations sont visibles sans mélanger les maturités. Toute transmission partenaire reste confirmée manuellement.</p></div><div className="grid grid-cols-3 border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)]"><SummaryNumber label="Besoins" value={String(baseNeeds.length)} /><SummaryNumber label="Programmes" value={String(visibleProjects.length + visibleTraining.length)} /><SummaryNumber label="À mobiliser" value={formatCompact(Math.max(totalBudget - totalCovered, 0))} /></div></div></div>

    <div className="sticky top-0 z-30 border-b border-[var(--mb-neutral-200)] bg-white px-4 sm:px-6"><div className="mx-auto flex max-w-[86rem] flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between"><nav className="flex overflow-x-auto" aria-label="Lectures Communautés et Programmes"><ReadingButton active={reading === "needs"} onClick={() => setReading("needs")}>Besoins remontés</ReadingButton><ReadingButton active={reading === "programs"} onClick={() => setReading("programs")}>Programmes & actions</ReadingButton><ReadingButton active={reading === "funding"} onClick={() => setReading("funding")}>Financements & partenaires</ReadingButton></nav><label className="flex items-center gap-2 text-[10px] font-bold text-[var(--mb-neutral-600)]">Quai <select value={quayId} onChange={(event) => setQuayId(event.target.value)} className="h-10 min-w-44 border border-[var(--mb-neutral-200)] bg-white px-2 text-[11px] font-semibold text-[var(--mb-navy-900)]"><option value="Tous">Tous les quais</option>{quays.map((quay) => <option key={quay.id} value={quay.id}>{quay.name}</option>)}</select></label></div></div>

    <div className="mx-auto max-w-[86rem] px-4 py-5 sm:px-6">
      {reading === "needs" ? <NeedsReading needs={visibleNeeds} allNeeds={baseNeeds} opportunities={opportunities} status={needStatus} category={category} urgency={urgency} audience={audience} onStatus={setNeedStatus} onCategory={setCategory} onUrgency={setUrgency} onAudience={setAudience} onOpenProgram={openProgram} onOpenFunding={openFunding} /> : null}
      {reading === "programs" ? <ProgramsReading projects={visibleProjects} trainings={visibleTraining} selectedId={selectedProgramId} onViewAtlas={props.onViewAtlas} /> : null}
      {reading === "funding" ? <FundingReading opportunities={visibleOpportunities} selectedId={selectedFundingId} fundingDossiers={fundingDossiers} dossiers={props.dossiers} onOpenDossier={props.onOpenDossier} onConstituteFunding={props.onConstituteFunding} onConfirmTransmission={props.onConfirmTransmission} onRecordPartnerResponse={props.onRecordPartnerResponse} /> : null}

      {assistanceEnabled ? <section className="mt-5 border-l-2 border-[var(--mb-ocean-600)] bg-[var(--mb-foam)] p-4"><p className="text-[9px] font-bold uppercase tracking-[0.09em] text-[var(--mb-ocean-600)]">Assistance Mbàmbulaan · proposition à valider</p><h3 className="mt-2 text-[13px] font-semibold text-[var(--mb-navy-900)]">{selectedQuay ? `Préparer une synthèse des besoins de ${selectedQuay.name}.` : "Regrouper les besoins similaires avant de préparer une fiche programme."}</h3><p className="mt-2 text-[10px] leading-5 text-[var(--mb-neutral-600)]">{visibleNeeds.length} besoin(s) dans la sélection, dont {visibleNeeds.filter((need) => need.maturity === "Qualifié").length} qualifié(s). Sources locales : {assistantSources.join(" · ") || "aucun besoin dans la sélection"}. {artifacts.length} document(s) local(aux) disponible(s). Aucune API, validation humaine obligatoire.</p></section> : null}
    </div>
  </section>;
}

function NeedsReading({ needs, allNeeds, opportunities, status, category, urgency, audience, onStatus, onCategory, onUrgency, onAudience, onOpenProgram, onOpenFunding }: { needs: CommunityNeed[]; allNeeds: CommunityNeed[]; opportunities: FundingOpportunity[]; status: NeedStatus; category: string; urgency: string; audience: string; onStatus: (value: NeedStatus) => void; onCategory: (value: string) => void; onUrgency: (value: string) => void; onAudience: (value: string) => void; onOpenProgram: (need: CommunityNeed) => void; onOpenFunding: (need: CommunityNeed) => void }) {
  const audiences = [...new Set(allNeeds.map((need) => need.audience))];
  return <section><SectionIntro title="Besoins remontés" helper="Trois maturités seulement : Signalé, Vérifié, Qualifié. Les programmes et financements apparaissent comme des relations distinctes." /><div className="mt-4 grid grid-cols-3 border border-[var(--mb-neutral-200)] bg-white"><MaturityCount label="Signalés" value={allNeeds.filter((need) => need.maturity === "Signalé").length} /><MaturityCount label="Vérifiés" value={allNeeds.filter((need) => need.maturity === "Vérifié").length} /><MaturityCount label="Qualifiés" value={allNeeds.filter((need) => need.maturity === "Qualifié").length} /></div><div className="mt-4 flex flex-wrap items-end gap-2 border-b border-[var(--mb-neutral-200)] pb-4"><FilterSelect label="Statut" value={status} options={["Tous", "Signalé", "Vérifié", "Qualifié"]} onChange={(value) => onStatus(value as NeedStatus)} /><FilterSelect label="Catégorie" value={category} options={["Toutes", "Sécurité", "Qualité", "Équipement", "Formation", "Valorisation"]} onChange={onCategory} /><FilterSelect label="Urgence" value={urgency} options={["Tous", "urgent", "surveillance", "normal"]} labels={{ urgent: "Critique", surveillance: "À suivre", normal: "Normale" }} onChange={onUrgency} /><FilterSelect label="Public" value={audience} options={["Tous", ...audiences]} onChange={onAudience} /><button type="button" onClick={() => { onStatus("Tous"); onCategory("Toutes"); onUrgency("Tous"); onAudience("Tous"); }} className="h-10 px-3 text-[10px] font-bold text-[var(--mb-ocean-600)]">Réinitialiser</button></div><div className="divide-y divide-[var(--mb-neutral-200)] border-y border-[var(--mb-neutral-200)] bg-white">{needs.map((need) => { const relation = needRelations(need, opportunities); return <article key={need.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[7rem_minmax(13rem,1.2fr)_minmax(10rem,.7fr)_minmax(12rem,.8fr)_auto] lg:items-center"><div><StatusBadge level={need.urgency}>{need.maturity}</StatusBadge><p className="mt-2 font-mono text-[9px] text-[var(--mb-neutral-500)]">{need.id}</p></div><div><h3 className="text-[13px] font-semibold text-[var(--mb-navy-900)]">{need.need}</h3><p className="mt-1 text-[10px] leading-4 text-[var(--mb-neutral-600)]">{need.place} · {need.audience} · {need.beneficiaries} bénéficiaires</p><p className="mt-2 text-[9px] text-[var(--mb-neutral-500)]">Source : {need.source} · {need.channel}</p></div><div><DataTrustBadge level={need.trustLevel} compact source={`Source locale : ${need.source}.`} /><p className="mt-2 text-[9px] text-[var(--mb-neutral-500)]">{need.category}</p></div><div className="text-[10px] leading-5"><p className="font-semibold text-[var(--mb-navy-900)]">{relation.program ? `Relié à ${relation.program.code}` : "Aucun programme relié"}</p><p className="text-[var(--mb-neutral-500)]">{relation.financing ? "Opportunité de financement associée" : need.nextAction}</p></div><div className="flex flex-col gap-2 lg:items-end">{relation.program ? <button onClick={() => onOpenProgram(need)} className={primaryButton}>Ouvrir le programme</button> : <button onClick={() => onOpenProgram(need)} className={primaryButton}>Structurer une réponse</button>}{relation.financing ? <button onClick={() => onOpenFunding(need)} className="text-[10px] font-bold text-[var(--mb-ocean-600)]">Voir le financement →</button> : null}</div></article>; })}{!needs.length ? <p className="px-5 py-8 text-center text-[11px] text-[var(--mb-neutral-600)]">Aucun besoin ne correspond à ces filtres.</p> : null}</div></section>;
}

function ProgramsReading({ projects, trainings, selectedId, onViewAtlas }: { projects: typeof communityProjects; trainings: typeof trainingPrograms; selectedId: string | null; onViewAtlas: (quayId: string) => void }) {
  const programs = [...projects.map((item) => ({ ...item, title: item.project, public: `${item.beneficiaries} bénéficiaires`, partner: item.targetPartner, period: "2026", action: item.nextAction })), ...trainings.map((item) => ({ ...item, project: item.title, territory: item.region, owner: "Service formation", beneficiaries: item.expectedParticipants, estimatedBudget: "À estimer", targetPartner: item.potentialPartner, nextAction: "Confirmer le prochain jalon", title: item.title, public: `${item.expectedParticipants} participants`, partner: item.potentialPartner, action: "Confirmer le prochain jalon" }))];
  return <section><SectionIntro title="Programmes & actions" helper="Une maturité propre au programme : Proposé, En préparation, Actif ou Terminé." /><div className="mt-4 divide-y divide-[var(--mb-neutral-200)] border-y border-[var(--mb-neutral-200)] bg-white">{programs.map((program) => <article key={program.id} className={`grid gap-4 px-4 py-4 lg:grid-cols-[7rem_minmax(14rem,1.2fr)_repeat(3,minmax(8rem,.55fr))_auto] lg:items-center ${selectedId === program.id ? "bg-[var(--mb-foam)]" : ""}`}><div><p className="font-mono text-[9px] font-bold text-[var(--mb-ocean-600)]">{program.code}</p><p className="mt-2 text-[9px] text-[var(--mb-neutral-500)]">{program.status}</p></div><div><h3 className="text-[13px] font-semibold text-[var(--mb-navy-900)]">{program.title}</h3><p className="mt-1 text-[10px] leading-4 text-[var(--mb-neutral-600)]">Objectif : {program.action.toLocaleLowerCase("fr")}.</p></div><ProgramFact label="Territoire" value={program.territory} /><ProgramFact label="Public" value={program.public} /><ProgramFact label="Partenaire" value={program.partner} /><button onClick={() => onViewAtlas(program.quayIds[0])} className={secondaryButton}>Voir le territoire</button></article>)}</div></section>;
}

function FundingReading({ opportunities, selectedId, fundingDossiers, dossiers, onOpenDossier, onConstituteFunding, onConfirmTransmission, onRecordPartnerResponse }: { opportunities: FundingOpportunity[]; selectedId: string | null; fundingDossiers: FundingDossierRecord[]; dossiers: DossierOperationnel[]; onOpenDossier: (dossier: DossierOperationnel) => void; onConstituteFunding: (opportunity: FundingOpportunity) => void; onConfirmTransmission: (id: string, date: string, responsible: string) => void; onRecordPartnerResponse: (id: string) => void }) {
  return <section><SectionIntro title="Financements & partenaires" helper="Maturité financière distincte du besoin et du programme. Aucune transmission n’est affichée sans confirmation manuelle." /><div className="mt-4 overflow-x-auto border-y border-[var(--mb-neutral-200)] bg-white"><table className="w-full min-w-[62rem] text-left"><thead><tr className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] text-[9px] uppercase tracking-[0.06em] text-[var(--mb-neutral-500)]"><th className="px-3 py-3">Programme ou besoin</th><th className="px-3 py-3">Budget</th><th className="px-3 py-3">Couvert / reste</th><th className="px-3 py-3">Maturité financière</th><th className="px-3 py-3">Partenaire</th><th className="px-3 py-3">Preuves</th><th className="px-3 py-3">Action</th></tr></thead><tbody>{opportunities.map((opportunity) => { const coverage = fundingCoverageByOpportunity[opportunity.id] ?? { coveredAmount: 0, availablePieces: 0, partnerStatus: "À qualifier" }; const record = fundingDossiers.find((item) => item.needId === opportunity.needId); const dossier = findOpportunityDossier(dossiers, opportunity); return <tr key={opportunity.id} className={`border-b border-[var(--mb-neutral-100)] text-[10px] ${selectedId === opportunity.id ? "bg-[var(--mb-foam)]" : ""}`}><td className="px-3 py-4"><strong className="block max-w-xs text-[11px] text-[var(--mb-navy-900)]">{opportunity.title}</strong><span className="mt-1 block text-[var(--mb-neutral-500)]">{opportunity.beneficiaries} bénéficiaires · {opportunity.expectedImpact}</span></td><td className="px-3 py-4 font-mono font-semibold">{formatCompact(opportunity.estimatedAmount)}</td><td className="px-3 py-4"><span className="block font-semibold text-[var(--mb-green-600)]">{formatCompact(coverage.coveredAmount)}</span><span className="mt-1 block text-[var(--mb-neutral-500)]">reste {formatCompact(opportunity.estimatedAmount - coverage.coveredAmount)}</span></td><td className="px-3 py-4 font-semibold">{fundingMaturity(opportunity, record)}</td><td className="px-3 py-4"><strong>{opportunity.compatibleFunder}</strong><span className="mt-1 block text-[var(--mb-neutral-500)]">{coverage.partnerStatus}</span></td><td className="px-3 py-4">{coverage.availablePieces} pièce(s)</td><td className="px-3 py-4">{dossier ? <button onClick={() => onOpenDossier(dossier)} className={secondaryButton}>Ouvrir le dossier</button> : <button onClick={() => onConstituteFunding(opportunity)} className={primaryButton}>Constituer le dossier</button>}</td></tr>; })}</tbody></table></div>{fundingDossiers.length ? <div className="mt-5"><FundingRegister dossiers={fundingDossiers} onConfirmTransmission={onConfirmTransmission} onRecordResponse={onRecordPartnerResponse} /></div> : null}<div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{impactProofs.map((proof) => <article key={proof.id} className="border-l-2 border-[var(--mb-ocean-400)] bg-white p-3"><strong className="font-mono text-[18px] text-[var(--mb-navy-900)]">{proof.figure}</strong><p className="mt-1 text-[10px] font-semibold">{proof.unit}</p><p className="mt-1 text-[9px] text-[var(--mb-neutral-500)]">{proof.detail}</p></article>)}</div><p className="mt-4 text-[9px] text-[var(--mb-neutral-500)]">Référentiel local de partenaires : {partners.map((partner) => partner.name).join(" · ")}.</p></section>;
}

function findOpportunityDossier(dossiers: DossierOperationnel[], opportunity: FundingOpportunity) { return dossiers.find((dossier) => dossier.type === "Besoin filière" && (dossier.sourceId === opportunity.id || dossier.linkedObject === opportunity.title)); }
function formatCompact(value: number) { return value >= 1_000_000_000 ? `${(value / 1_000_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} Md FCFA` : `${Math.round(value / 1_000_000).toLocaleString("fr-FR")} M FCFA`; }
function ReadingButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} className={`min-h-10 shrink-0 border-b-2 px-3 text-[10px] font-bold ${active ? "border-[var(--mb-ocean-600)] text-[var(--mb-ocean-600)]" : "border-transparent text-[var(--mb-neutral-600)] hover:text-[var(--mb-navy-900)]"}`}>{children}</button>; }
function SummaryNumber({ label, value }: { label: string; value: string }) { return <div className="min-w-0 border-r border-[var(--mb-neutral-200)] p-3 last:border-r-0"><strong className="block truncate font-mono text-[18px] text-[var(--mb-navy-900)]">{value}</strong><span className="mt-1 block text-[9px] font-semibold text-[var(--mb-neutral-500)]">{label}</span></div>; }
function SectionIntro({ title, helper }: { title: string; helper: string }) { return <header><h2 className="text-[16px] font-semibold text-[var(--mb-navy-900)]">{title}</h2><p className="mt-1 max-w-3xl text-[10px] leading-5 text-[var(--mb-neutral-600)]">{helper}</p></header>; }
function ProgramFact({ label, value }: { label: string; value: string }) { return <div><p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--mb-neutral-500)]">{label}</p><p className="mt-1 text-[10px] font-semibold text-[var(--mb-navy-900)]">{value}</p></div>; }
function MaturityCount({ label, value }: { label: string; value: number }) { return <div className="border-r border-[var(--mb-neutral-200)] p-3 text-center last:border-r-0"><strong className="font-mono text-[20px] text-[var(--mb-navy-900)]">{value}</strong><span className="mt-1 block text-[9px] font-semibold text-[var(--mb-neutral-500)]">{label}</span></div>; }
function FilterSelect({ label, value, options, labels = {}, onChange }: { label: string; value: string; options: string[]; labels?: Record<string, string>; onChange: (value: string) => void }) { return <label className="grid gap-1 text-[9px] font-bold text-[var(--mb-neutral-600)]">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 min-w-32 border border-[var(--mb-neutral-200)] bg-white px-2 text-[10px] font-semibold text-[var(--mb-navy-900)]">{options.map((option) => <option key={option} value={option}>{labels[option] ?? option}</option>)}</select></label>; }
