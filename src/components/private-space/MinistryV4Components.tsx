"use client";

import { useMemo, useState } from "react";
import type { CommunityNeed } from "@/data/ministryControlTowerData";
import { speciesDirectory } from "@/data/ministryControlTowerData";
import type { FundingOpportunity, GeneratedArtifact } from "@/data/ministryValueJourneyData";
import { formatFcfa, impactProofs } from "@/data/ministryValueJourneyData";
import { ArtifactRegister, type WorkflowContext } from "./MinistryValueWorkflows";
import { DataTrustBadge, primaryButton, secondaryButton, StatusBadge } from "./MinistryControlTowerParts";
import { FundingInsights, SpeciesDirectory } from "./MinistryCredibility";

export type NeedStatus = "Signalé" | "Qualifié" | "Éligible au financement" | "Dossier constitué" | "Financé";

export type NeedViewRow = {
  need: CommunityNeed;
  opportunity?: FundingOpportunity;
  status: NeedStatus;
};

export function FiliereNeedsView({ needs, opportunities, artifacts, qualifiedNeedIds = [], fundingDossierNeedIds = [], onOpenWorkflow }: { needs: CommunityNeed[]; opportunities: FundingOpportunity[]; artifacts: GeneratedArtifact[]; qualifiedNeedIds?: string[]; fundingDossierNeedIds?: string[]; onOpenWorkflow: (kind: "qualification" | "funding" | "partner", context: WorkflowContext) => void }) {
  const [status, setStatus] = useState<"Tous" | NeedStatus>("Tous");
  const rows = useMemo<NeedViewRow[]>(() => needs.map((need) => {
    const opportunity = opportunities.find((item) => item.needId === need.id);
    const currentStatus: NeedStatus = fundingDossierNeedIds.includes(need.id) ? "Dossier constitué" : opportunity?.status === "Financé" ? "Financé" : qualifiedNeedIds.includes(need.id) ? "Qualifié" : opportunity?.status && opportunity.status !== "À qualifier" ? "Éligible au financement" : "Signalé";
    return { need, opportunity, status: currentStatus };
  }), [fundingDossierNeedIds, needs, opportunities, qualifiedNeedIds]);
  const filtered = status === "Tous" ? rows : rows.filter((row) => row.status === status);
  const [selectedId, setSelectedId] = useState(rows[0]?.need.id || "");
  const selected = rows.find((row) => row.need.id === selectedId) || rows[0];
  const context = selected ? buildContext(selected) : null;

  return <div className="grid min-w-0 gap-2 bg-[var(--mb-neutral-100)] p-2 xl:grid-cols-[minmax(0,1fr)_330px]">
    <div className="xl:col-span-2"><FundingInsights needs={needs} opportunities={opportunities} qualifiedNeedIds={qualifiedNeedIds} /></div>
    <section className="min-w-0 border border-[var(--mb-neutral-200)] bg-white"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--mb-neutral-200)] px-3 py-3"><div><h2 className="text-[14px] font-semibold text-[var(--mb-navy-900)]">Besoins de la filière</h2><p className="mt-1 text-[9px] text-[var(--mb-neutral-600)]">Du signal terrain au financement, une seule lecture et une prochaine action.</p></div><div className="flex flex-wrap gap-1">{(["Tous", "Signalé", "Qualifié", "Éligible au financement", "Dossier constitué", "Financé"] as const).map((item) => <button key={item} onClick={() => setStatus(item)} className={`h-8 border px-2 text-[9px] font-bold ${status === item ? "border-[var(--mb-ocean-600)] bg-[var(--mb-ocean-600)] text-white" : "border-[var(--mb-neutral-200)] bg-white text-[var(--mb-neutral-600)]"}`}>{item}</button>)}</div></header>
      <div className="min-w-0 overflow-x-auto"><table className="w-full min-w-[860px] border-collapse text-left"><thead><tr className="h-9 bg-[var(--mb-offwhite)] font-mono text-[8px] uppercase text-[var(--mb-neutral-600)]">{["Besoin", "Territoire / communauté", "Montant", "Catégorie", "Acteurs", "Statut", "Confiance", "Prochaine action"].map((header) => <th key={header} className="border-b border-[var(--mb-neutral-200)] px-3">{header}</th>)}</tr></thead><tbody>{filtered.map((row) => <tr key={row.need.id} onClick={() => setSelectedId(row.need.id)} className={`cursor-pointer border-b border-[var(--mb-neutral-100)] text-[10px] hover:bg-[var(--mb-foam)] ${selected?.need.id === row.need.id ? "bg-[var(--mb-foam)]" : "bg-white"}`}><td className="px-3 py-3 font-semibold text-[var(--mb-navy-900)]">{row.opportunity?.title || row.need.need}</td><td className="px-3 py-3">{row.need.place}<span className="block text-[8px] text-[var(--mb-neutral-400)]">{row.need.actors}</span></td><td className="px-3 py-3 font-mono font-bold">{formatFcfa(row.opportunity?.estimatedAmount || 0)}</td><td className="px-3 py-3">{row.opportunity?.category || "À qualifier"}</td><td className="px-3 py-3 font-mono">{row.opportunity?.beneficiaries || "—"}</td><td className="px-3 py-3"><StatusBadge level={row.status === "Signalé" ? "surveillance" : "normal"}>{row.status}</StatusBadge></td><td className="px-3 py-3"><DataTrustBadge level={row.need.trustLevel} compact /></td><td className="px-3 py-3 font-semibold text-[var(--mb-ocean-600)]">{nextAction(row.status)}</td></tr>)}</tbody></table></div>
    </section>
    <aside className="grid content-start gap-2">{selected && context ? <section className="border border-[var(--mb-neutral-200)] bg-white"><header className="bg-[var(--mb-navy-900)] px-3 py-3 text-white"><p className="font-mono text-[8px] uppercase text-[var(--mb-ocean-400)]">Partenaires & preuves</p><h3 className="mt-1 text-[13px] font-semibold">{selected.opportunity?.title || selected.need.need}</h3><p className="mt-1 text-[9px] text-white/55">{selected.need.place} · {selected.status}</p><div className="mt-2"><DataTrustBadge level={selected.need.trustLevel} compact /></div></header><dl className="divide-y divide-[var(--mb-neutral-100)] px-3"><Fact label="Partenaire compatible" value={selected.opportunity?.compatibleFunder || "À identifier"} /><Fact label="Compatibilité" value={selected.opportunity ? `${selected.opportunity.compatibilityScore}%` : "À calculer"} /><Fact label="Impact attendu" value={selected.opportunity?.expectedImpact || "À documenter"} /><Fact label="Preuve disponible" value={artifacts.some((artifact) => artifact.scope.includes(selected.need.place)) ? "Document enregistré" : "Preuve terrain manquante"} /></dl><div className="grid gap-2 border-t border-[var(--mb-neutral-100)] p-3"><p className="text-[9px] leading-4 text-[var(--mb-neutral-600)]">{actionHelper(selected.status)}</p><NeedActions row={selected} context={context} onOpenWorkflow={onOpenWorkflow} /></div></section> : null}
      <WhatNowPanel rows={rows} onSelect={setSelectedId} />
      <section className="border border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[10px] font-bold">Preuves mobilisables</div><div className="grid grid-cols-2 gap-px bg-[var(--mb-neutral-100)]">{impactProofs.slice(0, 4).map((proof) => <div key={proof.id} className="bg-white p-2"><p className="font-mono text-[15px] font-bold text-[var(--mb-navy-900)]">{proof.figure}</p><p className="mt-1 text-[8px] leading-3 text-[var(--mb-neutral-600)]">{proof.unit}</p></div>)}</div><ArtifactRegister artifacts={artifacts.filter((artifact) => ["qualification", "funding", "partner"].includes(artifact.kind)).slice(0, 3)} /></section>
    </aside>
    <div className="xl:col-span-2"><SpeciesDirectory species={speciesDirectory} /></div>
  </div>;
}

export function WhatNowPanel({ rows, onSelect }: { rows: NeedViewRow[]; onSelect: (id: string) => void }) {
  const actions = rows.filter((row) => row.status !== "Financé").slice(0, 4);
  return <section className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)]"><header className="border-b border-[var(--mb-neutral-200)] px-3 py-2"><h3 className="text-[11px] font-bold text-[var(--mb-navy-900)]">Que faire maintenant ?</h3></header><div className="divide-y divide-[var(--mb-neutral-200)]">{actions.map((row) => <button key={row.need.id} onClick={() => onSelect(row.need.id)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 px-3 py-2 text-left hover:bg-white"><div><p className="text-[9px] font-semibold">{nextAction(row.status)}</p><p className="mt-0.5 text-[8px] text-[var(--mb-neutral-600)]">{row.opportunity?.title || row.need.need} · {row.need.place}</p></div><span className="font-mono text-[8px] text-[var(--mb-ocean-600)]">VOIR →</span></button>)}</div></section>;
}

function buildContext(row: NeedViewRow): WorkflowContext { return { title: row.opportunity?.title || row.need.need, scope: row.need.place, sourceId: row.opportunity?.id || row.need.id, needId: row.need.id, description: row.opportunity?.expectedImpact || row.need.nextAction, amount: String(row.opportunity?.estimatedAmount || 0), beneficiaries: String(row.opportunity?.beneficiaries || 0), partner: row.opportunity?.compatibleFunder }; }
function nextAction(status: NeedStatus) { return status === "Signalé" ? "Qualifier le besoin" : status === "Qualifié" ? "Vérifier l’éligibilité" : status === "Éligible au financement" ? "Constituer le dossier" : status === "Dossier constitué" ? "Confirmer la transmission" : "Suivre l’impact"; }
function actionHelper(status: NeedStatus) { return status === "Signalé" ? "Qualifier ce besoin permettra d’en mesurer la maturité et de l’évaluer pour un financement." : status === "Dossier constitué" ? "Le dossier existe dans le registre. Il ne devient Transmis qu’après confirmation manuelle de la date et du responsable." : status === "Financé" ? "Le financement est enregistré. Le suivi porte désormais sur l’exécution et l’impact." : "Le dossier pourra être constitué puis transmis à un partenaire ou bailleur après validation humaine."; }
function NeedActions({ row, context, onOpenWorkflow }: { row: NeedViewRow; context: WorkflowContext; onOpenWorkflow: (kind: "qualification" | "funding" | "partner", context: WorkflowContext) => void }) {
  if (row.status === "Signalé") return <button onClick={() => onOpenWorkflow("qualification", context)} className={primaryButton}>Qualifier ce besoin</button>;
  if (row.status === "Dossier constitué") return <button onClick={() => onOpenWorkflow("partner", context)} className={secondaryButton}>Préparer une sollicitation partenaire</button>;
  if (row.status === "Financé") return <span className="border-l-2 border-[var(--mb-green-600)] bg-[var(--mb-foam)] px-3 py-2 text-[9px] font-semibold text-[var(--mb-navy-900)]">Financement enregistré · suivi de l’impact actif</span>;
  return <><button onClick={() => onOpenWorkflow("funding", context)} className={primaryButton}>Constituer le dossier de financement</button><button onClick={() => onOpenWorkflow("partner", context)} className={secondaryButton}>Préparer une sollicitation partenaire</button></>;
}
function Fact({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2 py-2 text-[9px]"><dt className="text-[var(--mb-neutral-600)]">{label}</dt><dd className="text-right font-semibold leading-4">{value}</dd></div>; }
