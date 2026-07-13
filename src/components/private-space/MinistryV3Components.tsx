"use client";

import type { ReactNode } from "react";
import type { FundingOpportunity } from "@/data/ministryValueJourneyData";
import { formatFcfa } from "@/data/ministryValueJourneyData";
import { primaryButton, secondaryButton, StatusBadge } from "./MinistryControlTowerParts";

export function SituationBanner({ eyebrow, statement, detail, actionLabel, onAction, tone = "ocean" }: { eyebrow: string; statement: string; detail?: string; actionLabel: string; onAction: () => void; tone?: "ocean" | "navy" }) {
  return <section className={`grid gap-3 border-b border-white/10 px-4 py-4 text-white sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${tone === "navy" ? "bg-[var(--mb-navy-900)]" : "bg-[linear-gradient(105deg,var(--mb-navy-700),var(--mb-ocean-600))]"}`}>
    <div><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">{eyebrow}</p><p className="mt-1.5 max-w-5xl text-[15px] font-semibold leading-6">{statement}</p>{detail ? <p className="mt-1 text-[9px] text-white/55">{detail}</p> : null}</div>
    <button onClick={onAction} className="h-9 shrink-0 rounded-[3px] border border-white/25 bg-white/10 px-3 text-[10px] font-bold text-white hover:bg-white/15">{actionLabel}</button>
  </section>;
}

export function BriefingPanel({ onClose }: { onClose: () => void }) {
  const lines = [
    ["Incidents nouveaux", "2 incidents ouverts depuis 08h00, dont un retour de pirogue non confirmé à Guet Ndar."],
    ["Zones à surveiller", "Saint-Louis, Kayar et Mbour concentrent les signaux nécessitant un suivi."],
    ["Vérifications", "3 contrôles terrain restent à valider avant la consolidation de midi."],
    ["Débarquements", "Un écart de pesée à Kayar et une capacité de froid réduite à Mbour sont signalés."],
    ["Action recommandée", "Mandater les relais de Saint-Louis et Kayar, puis générer le rapport de zone."],
  ];
  return <div className="fixed inset-0 z-[110] flex justify-end bg-[var(--mb-navy-900)]/45" role="dialog" aria-modal="true" aria-label="Briefing du jour"><aside className="h-full w-full max-w-[460px] border-l border-white/10 bg-[var(--mb-offwhite)]"><header className="flex items-start justify-between bg-[var(--mb-navy-900)] p-4 text-white"><div><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--mb-ocean-400)]">13 juillet 2026 · 08h14</p><h2 className="mt-1 text-[18px] font-semibold">Briefing du jour</h2></div><button onClick={onClose} className="h-8 w-8 border border-white/15" aria-label="Fermer">×</button></header><ol className="divide-y divide-[var(--mb-neutral-200)] p-4">{lines.map(([label, value], index) => <li key={label} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2 bg-white px-3 py-3"><span className="font-mono text-[9px] font-bold text-[var(--mb-ocean-600)]">0{index + 1}</span><div><p className="text-[10px] font-bold text-[var(--mb-navy-900)]">{label}</p><p className="mt-1 text-[10px] leading-4 text-[var(--mb-neutral-600)]">{value}</p></div></li>)}</ol></aside></div>;
}

export function ValueBanner({ amount, programs, partners }: { amount: number; programs: number; partners: number }) {
  return <section className="grid gap-4 border-b border-[var(--mb-neutral-200)] bg-[linear-gradient(110deg,#e8f3f5,#f8f7f1)] px-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><div><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">Valeur structurée par Mbàmbulaan</p><p className="mt-2 text-[20px] font-semibold leading-7 text-[var(--mb-navy-900)]">{formatBillions(amount)} de besoins qualifiés</p><p className="mt-1 text-[11px] text-[var(--mb-neutral-600)]">Des besoins terrain documentés jusqu’au dossier transmissible.</p></div><div className="flex gap-5 border-l border-[var(--mb-ocean-600)]/20 pl-4"><ValueNumber value={String(programs)} label="programmes actifs" /><ValueNumber value={String(partners)} label="partenaires mobilisables" /></div></section>;
}

export function PortfolioBars({ values }: { values: Array<{ label: string; amount: number; color: string }> }) {
  const total = values.reduce((sum, item) => sum + item.amount, 0) || 1;
  return <div className="grid gap-3"><div className="flex h-3 overflow-hidden bg-[var(--mb-neutral-100)]">{values.map((item) => <span key={item.label} className={item.color} style={{ width: `${(item.amount / total) * 100}%` }} />)}</div><div className="grid gap-2 sm:grid-cols-2">{values.map((item) => <div key={item.label} className="flex items-center justify-between gap-2 text-[9px]"><span className="flex items-center gap-1.5 text-[var(--mb-neutral-600)]"><i className={`h-2 w-2 ${item.color}`} />{item.label}</span><strong className="font-mono text-[var(--mb-navy-900)]">{formatFcfa(item.amount)}</strong></div>)}</div></div>;
}

export function FundingOpportunityCard({ opportunity, onSelect, onBuild }: { opportunity: FundingOpportunity; onSelect: () => void; onBuild: () => void }) {
  return <article className="grid gap-3 border border-[var(--mb-neutral-200)] bg-white p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[8px] uppercase text-[var(--mb-ocean-600)]">{opportunity.territory} · {opportunity.category}</p><h3 className="mt-1 text-[12px] font-semibold leading-4 text-[var(--mb-navy-900)]">{opportunity.title}</h3></div><span className="border border-[var(--mb-ocean-600)]/20 bg-[var(--mb-foam)] px-2 py-1 font-mono text-[11px] font-bold text-[var(--mb-ocean-600)]">{opportunity.compatibilityScore}%</span></div><dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[9px]"><Fact label="Montant" value={formatFcfa(opportunity.estimatedAmount)} /><Fact label="Bénéficiaires" value={String(opportunity.beneficiaries)} /><Fact label="Partenaire compatible" value={opportunity.compatibleFunder} /><Fact label="Maturité" value={`${opportunity.maturityScore}/100`} /></dl><div className="flex items-center justify-between gap-2"><StatusBadge>{opportunity.status}</StatusBadge><div className="flex gap-1.5"><button onClick={onSelect} className={secondaryButton}>Examiner</button><button onClick={onBuild} className={primaryButton}>Constituer le dossier</button></div></div></article>;
}

export function ImpactProofCard({ figure, unit, detail, children }: { figure: string; unit: string; detail: string; children?: ReactNode }) {
  return <article className="border-l-2 border-[var(--mb-green-600)] bg-white px-3 py-3"><p className="font-mono text-[22px] font-semibold text-[var(--mb-navy-900)]">{figure}</p><p className="mt-1 text-[10px] font-bold text-[var(--mb-neutral-900)]">{unit}</p><p className="mt-1 text-[9px] leading-4 text-[var(--mb-neutral-600)]">{detail}</p>{children}</article>;
}

function ValueNumber({ value, label }: { value: string; label: string }) { return <div><p className="font-mono text-[20px] font-semibold text-[var(--mb-navy-900)]">{value}</p><p className="mt-1 max-w-24 text-[9px] leading-3 text-[var(--mb-neutral-600)]">{label}</p></div>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><dt className="text-[var(--mb-neutral-400)]">{label}</dt><dd className="mt-0.5 font-semibold leading-4 text-[var(--mb-neutral-900)]">{value}</dd></div>; }
function formatBillions(value: number) { return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value / 1_000_000_000)} Mds FCFA`; }
