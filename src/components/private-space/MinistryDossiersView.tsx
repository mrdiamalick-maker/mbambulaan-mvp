"use client";

import { useMemo, useState } from "react";
import { quays } from "@/data/ministryControlTowerData";
import type { DossierChannel, DossierOperationnel, DossierType, DossierWorkStatus } from "@/lib/ministryOperationalDossiers";
import { DossierCard } from "./MinistryDossierExperience";
import { primaryButton, WorkspaceHeader } from "./MinistryControlTowerParts";

type Filter = "Tous" | DossierType | DossierWorkStatus | "Prêt à clôturer" | "Prêt à partager";

export function MinistryDossiersView({ dossiers, onOpenDossier, embedded = false, onClose }: { dossiers: DossierOperationnel[]; onOpenDossier: (dossier: DossierOperationnel) => void; embedded?: boolean; onClose?: () => void }) {
  const [filter, setFilter] = useState<Filter>("Tous");
  const [quay, setQuay] = useState("Tous");
  const [channel, setChannel] = useState<"Tous" | DossierChannel>("Tous");
  const prioritized = useMemo(() => dossiers.filter((dossier) => {
    const matchesQuay = quay === "Tous" || dossier.quayId === quay;
    const matchesChannel = channel === "Tous" || dossier.originChannel === channel;
    const matchesFilter = filter === "Tous"
      || dossier.type === filter
      || dossier.workStatus === filter
      || (filter === "Prêt à clôturer" && dossier.action === "close-dossier")
      || (filter === "Prêt à partager" && dossier.type === "Besoin filière" && dossier.pieces.every((piece) => piece.status === "Disponible"));
    return matchesQuay && matchesChannel && matchesFilter;
  }), [channel, dossiers, filter, quay]);
  const actionable = dossiers.filter((item) => ["À traiter", "Nouveau"].includes(item.workStatus));
  const waiting = dossiers.filter((item) => item.workStatus === "En attente");
  const blocked = dossiers.filter((item) => item.workStatus === "Bloqué");
  const readyToClose = dossiers.filter((item) => item.action === "close-dossier");
  const next = [...blocked, ...actionable, ...waiting][0];
  const quayOptions = quays.map((item) => ({ value: item.id, label: item.name }));

  return <section className="min-h-full bg-[var(--mb-offwhite)]">
    {embedded ? <header className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-[var(--mb-neutral-200)] bg-white px-4 py-4 sm:px-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Moteur transversal</p><h1 className="mt-1 text-[20px] font-semibold text-[var(--mb-navy-900)]">Dossiers à traiter</h1><p className="mt-1 max-w-2xl text-[10px] leading-4 text-[var(--mb-neutral-600)]">La même référence, les mêmes pièces et le même historique restent accessibles depuis chaque espace.</p></div><button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center border border-[var(--mb-neutral-200)] text-lg" aria-label="Fermer les dossiers">×</button></header> : <WorkspaceHeader title="Dossiers" question="Traiter les situations, besoins filière et décisions dans un bureau opérationnel unique." scope="Nationale" onScopeChange={() => undefined} onExport={() => undefined} />}
    <div className="border-b border-[var(--mb-neutral-200)] bg-white px-4 py-5 sm:px-6">
      <div className="mx-auto grid max-w-[86rem] gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Briefing opérationnel</p><h2 className="mt-2 text-[22px] font-semibold text-[var(--mb-navy-900)]">{next ? next.nextAction : "Aucune action prioritaire en attente"}</h2><p className="mt-2 max-w-3xl text-[11px] leading-5 text-[var(--mb-neutral-600)]">Chaque dossier conserve sa référence, ses pièces, son responsable et sa prochaine action depuis Atlas jusqu’au document final.</p></div><div className="flex flex-wrap gap-2 lg:justify-end">{next ? <button onClick={() => onOpenDossier(next)} className={primaryButton}>Reprendre le dossier prioritaire</button> : null}</div></div>
      <div className="mx-auto mt-5 grid max-w-[86rem] grid-cols-2 border border-[var(--mb-neutral-200)] sm:grid-cols-4"><BriefMetric label="À traiter aujourd’hui" value={actionable.length} /><BriefMetric label="Retours terrain attendus" value={waiting.length} /><BriefMetric label="Bloqués" value={blocked.length} critical={Boolean(blocked.length)} /><BriefMetric label="Prêts à clôturer" value={readyToClose.length} /></div>
    </div>
    <div className="mx-auto max-w-[86rem] px-4 py-5 sm:px-6">
      <div className="flex flex-wrap items-end gap-2 border-b border-[var(--mb-neutral-200)] pb-4"><FilterSelect label="Parcours" value={filter} onChange={(value) => setFilter(value as Filter)} options={["Tous", "Situation terrain", "Besoin filière", "Décision institutionnelle", "À traiter", "En attente", "Bloqué", "Prêt à clôturer", "Prêt à partager"]} /><FilterSelect label="Quai" value={quay} onChange={setQuay} options={["Tous", ...quayOptions]} /><FilterSelect label="Canal" value={channel} onChange={(value) => setChannel(value as "Tous" | DossierChannel)} options={["Tous", "WhatsApp", "Téléphone", "Poste de quai", "Agent territorial", "Formulaire", "Import", "Document"]} /><button onClick={() => { setFilter("Tous"); setQuay("Tous"); setChannel("Tous"); }} className="h-9 px-3 text-[10px] font-bold text-[var(--mb-ocean-600)]">Réinitialiser</button></div>
      <div className="mt-4 grid gap-2">{prioritized.map((dossier, index) => <DossierCard key={dossier.id} dossier={dossier} onOpen={onOpenDossier} prominent={index === 0} />)}{!prioritized.length ? <p className="border border-dashed border-[var(--mb-neutral-300)] bg-white px-5 py-8 text-center text-[11px] text-[var(--mb-neutral-600)]">Aucun dossier ne correspond à ces filtres.</p> : null}</div>
    </div>
  </section>;
}

function BriefMetric({ label, value, critical = false }: { label: string; value: number; critical?: boolean }) { return <div className="border-b border-r border-[var(--mb-neutral-200)] p-3 sm:border-b-0"><p className={`font-mono text-[22px] font-semibold ${critical ? "text-[var(--mb-red-600)]" : "text-[var(--mb-navy-900)]"}`}>{value}</p><p className="mt-1 text-[10px] font-semibold text-[var(--mb-neutral-600)]">{label}</p></div>; }
function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<string | { value: string; label: string }>; onChange: (value: string) => void }) { return <label className="grid gap-1 text-[10px] font-bold text-[var(--mb-neutral-600)]">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 min-w-36 border border-[var(--mb-neutral-200)] bg-white px-2 text-[11px] font-semibold text-[var(--mb-navy-900)]">{options.map((option) => { const item = typeof option === "string" ? { value: option, label: option } : option; return <option key={item.value} value={item.value}>{item.label}</option>; })}</select></label>; }
