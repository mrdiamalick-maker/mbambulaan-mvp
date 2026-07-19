"use client";

import { useMemo, useState, type ReactNode } from "react";
import { quayPosts, quays, type QuayPost } from "@/data/ministryControlTowerData";
import { draftArbitrationNote, summarizeDossier } from "@/lib/mbambulaanAssistant";
import type { DossierChannel, DossierNote, DossierOperationnel, DossierType, DossierWorkStatus } from "@/lib/ministryOperationalDossiers";
import { DataTrustBadge, primaryButton, secondaryButton, StatusBadge } from "./MinistryControlTowerParts";

const statusLevel: Record<DossierWorkStatus, "normal" | "surveillance" | "urgent"> = { Nouveau: "normal", "À traiter": "surveillance", "En attente": "surveillance", Bloqué: "urgent", Terminé: "normal" };
const typeCode: Record<DossierType, string> = { "Situation terrain": "Situation", "Besoin filière": "Besoin filière", "Décision institutionnelle": "Décision" };
const workOrder: Record<DossierWorkStatus, number> = { Bloqué: 0, "À traiter": 1, Nouveau: 2, "En attente": 3, Terminé: 4 };
type StatusFilter = "Tous" | DossierWorkStatus;

export function DossierCard({ dossier, onOpen, prominent = false }: { dossier: DossierOperationnel; onOpen: (dossier: DossierOperationnel) => void; prominent?: boolean }) {
  const quay = quays.find((item) => item.id === dossier.quayId);
  const deadline = dossier.workStatus === "Terminé" ? "Clos" : dossier.ageDays > 1 ? `En attente depuis ${dossier.ageDays} j` : "À traiter aujourd’hui";
  return <button onClick={() => onOpen(dossier)} className={`w-full border bg-white text-left hover:border-[var(--mb-ocean-600)] ${prominent ? "border-[var(--mb-ocean-600)]" : "border-[var(--mb-neutral-200)]"}`}>
    <div className="grid gap-3 p-4 lg:grid-cols-[8rem_minmax(12rem,1.1fr)_minmax(9rem,.7fr)_minmax(12rem,.9fr)_8rem] lg:items-center">
      <div><span className="font-mono text-[10px] font-bold text-[var(--mb-ocean-600)]">{dossier.id}</span><p className="mt-1 text-[8px] uppercase text-[var(--mb-neutral-500)]">{typeCode[dossier.type]}</p></div>
      <div><h3 className="text-[12px] font-semibold text-[var(--mb-navy-900)]">{dossier.linkedObject}</h3><p className="mt-1 text-[9px] text-[var(--mb-neutral-500)]">{quay?.name ?? dossier.territory} · {dossier.originChannel}</p></div>
      <p className="text-[9px] font-semibold text-[var(--mb-neutral-700)]">{dossier.currentOwner}</p>
      <div><p className="text-[9px] font-bold text-[var(--mb-ocean-600)]">{dossier.nextAction}</p><p className="mt-1 text-[8px] text-[var(--mb-neutral-500)]">{deadline}</p></div>
      <div className="lg:text-right"><StatusBadge level={statusLevel[dossier.workStatus]}>{dossier.workStatus}</StatusBadge><span className="mt-2 block text-[9px] font-bold text-[var(--mb-ocean-600)]">Ouvrir le dossier →</span></div>
    </div>
  </button>;
}

export function MyDossiers({ dossiers, onOpen }: { dossiers: DossierOperationnel[]; onOpen: (dossier: DossierOperationnel) => void }) {
  const [status, setStatus] = useState<StatusFilter>("Tous");
  const [type, setType] = useState<"Tous" | DossierType>("Tous");
  const [channel, setChannel] = useState<"Tous" | DossierChannel>("Tous");
  const [quay, setQuay] = useState("Tous");
  const filtered = useMemo(() => dossiers
    .filter((dossier) => dossier.workStatus !== "Terminé" || status === "Terminé")
    .filter((dossier) => status === "Tous" || dossier.workStatus === status)
    .filter((dossier) => type === "Tous" || dossier.type === type)
    .filter((dossier) => channel === "Tous" || dossier.originChannel === channel)
    .filter((dossier) => quay === "Tous" || dossier.quayId === quay)
    .sort((a, b) => workOrder[a.workStatus] - workOrder[b.workStatus] || b.ageDays - a.ageDays), [channel, dossiers, quay, status, type]);
  return <section className="border-t border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] px-4 py-5 sm:px-6"><div className="mx-auto max-w-[86rem]"><div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--mb-neutral-200)] pb-4"><div><p className="text-[9px] font-bold uppercase text-[var(--mb-ocean-600)]">Direction régionale</p><h2 className="mt-1 text-[18px] font-semibold">Mon bureau du jour</h2><p className="mt-1 text-[9px] text-[var(--mb-neutral-600)]">Dossiers classés par action attendue, sans logique de ticket.</p></div><div className="flex gap-4 text-[9px]"><strong>{dossiers.filter((item) => item.workStatus !== "Terminé").length} à suivre</strong><strong>{dossiers.filter((item) => item.workStatus === "Bloqué").length} bloqué(s)</strong></div></div><div className="mt-4 flex flex-wrap gap-2"><DossierFilter label="Afficher" value={status} onChange={(value) => setStatus(value as StatusFilter)} options={["Tous", "À traiter", "En attente", "Bloqué", "Nouveau", "Terminé"]} /><DossierFilter label="Type" value={type} onChange={(value) => setType(value as "Tous" | DossierType)} options={["Tous", "Situation terrain", "Besoin filière", "Décision institutionnelle"]} /><DossierFilter label="Canal" value={channel} onChange={(value) => setChannel(value as "Tous" | DossierChannel)} options={["Tous", "WhatsApp", "Téléphone", "Poste de quai", "Agent territorial", "Formulaire", "Document"]} /><DossierFilter label="Quai" value={quay} onChange={setQuay} options={["Tous", ...quays.map((item) => ({ value: item.id, label: item.name }))]} /></div><div className="mt-4 grid gap-2">{filtered.map((dossier, index) => <DossierCard key={dossier.id} dossier={dossier} onOpen={onOpen} prominent={index === 0} />)}</div></div></section>;
}

export function OperationalDossierPanel({ dossier, assistanceEnabled = false, onClose, onPrimary, onRelance, onAddNote }: { dossier: DossierOperationnel; assistanceEnabled?: boolean; onClose: () => void; onPrimary: (dossier: DossierOperationnel) => void; onRelance: (dossier: DossierOperationnel) => void; onAddNote: (dossier: DossierOperationnel, note: DossierNote) => void }) {
  const [note, setNote] = useState("");
  const [assistance, setAssistance] = useState<"summary" | "note" | null>(null);
  const assistedSummary = useMemo(() => summarizeDossier(dossier), [dossier]);
  const noteDraft = useMemo(() => draftArbitrationNote(dossier), [dossier]);
  const quay = quays.find((item) => item.id === dossier.quayId);
  const trust = dossier.pieces.some((piece) => piece.status === "Attendue") ? "declared" : "verified";

  return <div className="fixed inset-0 z-[100] flex justify-end bg-[var(--mb-navy-900)]/35" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-[var(--mb-neutral-300)] bg-white">
      <header className="sticky top-0 z-10 border-b border-[var(--mb-neutral-300)] bg-white px-5 py-5">
        <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[8px] font-bold text-[var(--mb-ocean-600)]">{dossier.id}</p><h2 className="mt-2 text-[20px] font-semibold leading-6 text-[var(--mb-navy-900)]">{dossier.linkedObject}</h2><p className="mt-1 text-[9px] text-[var(--mb-neutral-500)]">Dossier {dossier.type}</p></div><button onClick={onClose} className="h-9 w-9 border border-[var(--mb-neutral-200)]" aria-label="Fermer">×</button></div>
        <dl className="mt-4 grid gap-2 border-y border-[var(--mb-neutral-200)] py-3 text-[9px] sm:grid-cols-2"><DossierFact label="Quai / territoire" value={quay?.name ?? dossier.territory} /><DossierFact label="Canal d’origine" value={dossier.originChannel} /><DossierFact label="Responsable" value={dossier.currentOwner} /><DossierFact label="Statut métier" value={dossier.businessStatus} /></dl>
        <div className="mt-3 flex flex-wrap items-center gap-2"><ChannelBadge channel={dossier.originChannel} /><StatusBadge level={statusLevel[dossier.workStatus]}>{dossier.workStatus}</StatusBadge><DataTrustBadge level={trust} source="Niveau déduit des pièces locales disponibles dans ce dossier." /></div>
        <DossierRoute dossier={dossier} />
      </header>

      <div className="px-5 pb-6">
        <section className="border-b border-[var(--mb-neutral-200)] py-5"><p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-ocean-600)]">À faire maintenant</p><h3 className="mt-2 text-[16px] font-semibold text-[var(--mb-navy-900)]">{dossier.nextAction}</h3><p className="mt-2 text-[10px] leading-5 text-[var(--mb-neutral-600)]">{expectedResult(dossier)}</p>{dossier.action !== "none" ? <button onClick={() => onPrimary(dossier)} className={`${primaryButton} mt-4 min-h-11`}>{dossier.nextAction}</button> : <p className="mt-3 text-[9px] font-bold text-[var(--mb-green-600)]">Dossier terminé · aucune action requise</p>}{dossier.workStatus === "Bloqué" ? <button onClick={() => onRelance(dossier)} className={`${secondaryButton} ml-2 mt-4`}>Relancer le responsable</button> : null}</section>

        {assistanceEnabled ? <Disclosure title="Assistance Mbàmbulaan" open><p className="text-[10px] leading-5 text-[var(--mb-neutral-600)]">Aide locale déterministe, sans API. Toute proposition exige une validation humaine.</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => setAssistance(assistance === "summary" ? null : "summary")} className={secondaryButton}>Synthétiser</button><button onClick={() => setAssistance(assistance === "note" ? null : "note")} className={secondaryButton}>Préparer une note</button></div>{assistance === "summary" ? <AssistancePanel title="Synthèse du dossier" summary={assistedSummary.summary} facts={assistedSummary.facts} sources={assistedSummary.sources} /> : null}{assistance === "note" ? <AssistancePanel title={noteDraft.subject} summary={noteDraft.recommendation} facts={[...noteDraft.establishedFacts, ...noteDraft.uncertainties]} sources={noteDraft.sources} /> : null}</Disclosure> : null}
        <Disclosure title="Relais territorial"><PosteOfficielPanel poste={quayPosts.find((poste) => poste.quayId === dossier.quayId)} /></Disclosure>
        <Disclosure title={`Notes · ${dossier.notes.length}`}><form onSubmit={(event) => { event.preventDefault(); if (!note.trim()) return; onAddNote(dossier, { id: `note-${Date.now()}`, time: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date()), author: "Agent connecté · simulation", text: note.trim() }); setNote(""); }} className="grid gap-2"><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} placeholder="Ajouter une note courte" className="border border-[var(--mb-neutral-200)] p-2 text-[10px] outline-none focus:border-[var(--mb-ocean-600)]" /><button className={`${secondaryButton} justify-self-start`}>Ajouter la note</button></form><ol className="mt-3 divide-y divide-[var(--mb-neutral-100)]">{dossier.notes.map((item) => <li key={item.id} className="py-2 text-[9px]">{item.text}<small className="mt-1 block text-[7px] text-[var(--mb-neutral-400)]">{item.time} · {item.author}</small></li>)}</ol></Disclosure>
        <Disclosure title={`Pièces · ${dossier.pieces.length}`}><div className="divide-y divide-[var(--mb-neutral-100)]">{dossier.pieces.map((piece) => <div key={piece.id} className="grid gap-2 py-3 sm:grid-cols-[7rem_minmax(0,1fr)_auto]"><p className="font-mono text-[8px] text-[var(--mb-ocean-600)]">{piece.type}</p><p className="text-[9px] font-semibold">{piece.label}</p><p className="text-[8px] font-bold">{piece.status}</p></div>)}</div></Disclosure>
        <Disclosure title={`Historique · ${dossier.history.length}`}><ol className="grid gap-3">{dossier.history.map((entry, index) => <li key={`${entry.time}-${index}`} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-2 border-l border-[var(--mb-ocean-400)] pl-3"><time className="font-mono text-[8px] font-bold text-[var(--mb-ocean-600)]">{entry.time}</time><div><p className="text-[9px] font-semibold">{entry.label}</p><p className="mt-1 text-[8px] text-[var(--mb-neutral-500)]">{entry.author} · {entry.channel}</p></div></li>)}</ol></Disclosure>
        <section className="mt-4 border-l-2 border-[var(--mb-sand-300)] bg-[var(--mb-offwhite)] p-3"><p className="text-[8px] font-bold uppercase text-[var(--mb-neutral-500)]">Sortie finale</p><p className="mt-2 text-[10px] font-semibold leading-5 text-[var(--mb-navy-900)]">{dossier.finalOutput}</p></section>
      </div>
    </aside>
  </div>;
}

function expectedResult(dossier: DossierOperationnel) {
  const results: Record<DossierOperationnel["action"], string> = {
    "request-verification": "Résultat attendu : la demande est tracée, le relais local peut répondre et le dossier passe en attente de retour terrain.",
    "prepare-whatsapp": "Résultat attendu : le message est prêt à être envoyé manuellement et le canal reste tracé.",
    "follow-verification": "Résultat attendu : le suivi est enregistré et le dossier attend le constat terrain.",
    "deposit-constat": "Résultat attendu : le constat rejoint les pièces et attend une validation humaine.",
    "validate-constat": "Résultat attendu : la preuve est validée et le rapport de zone peut être préparé.",
    "generate-report": "Résultat attendu : le rapport est produit, relié aux sources et prêt à être relu.",
    "close-dossier": "Résultat attendu : la décision est enregistrée et la trace finale reste consultable.",
    "open-atlas": "Résultat attendu : le contexte territorial est consulté avant la poursuite du traitement.",
    "open-funding": "Résultat attendu : le besoin est structuré avec montant, bénéficiaires et pièces attendues.",
    "open-community": "Résultat attendu : le besoin rejoint le registre de financement et sa transmission reste manuelle.",
    "open-pilotage": "Résultat attendu : le sujet rejoint la lecture institutionnelle et son arbitrage peut être suivi.",
    "open-note": "Résultat attendu : une proposition de note est préparée puis soumise à validation humaine.",
    none: "Résultat obtenu : le dossier est terminé et sa trace reste consultable.",
  };
  return results[dossier.action];
}

function DossierRoute({ dossier }: { dossier: DossierOperationnel }) { const steps = ["Signalement", "Instruction", "Validation", "Sortie"]; const active = dossier.workStatus === "Terminé" ? 3 : dossier.pieces.some((piece) => piece.status === "Attendue") ? 1 : 2; return <div className="mt-4"><p className="text-[8px] font-bold uppercase text-[var(--mb-neutral-400)]">Avancement</p><ol className="mt-2 grid grid-cols-4 gap-1">{steps.map((step, index) => <li key={step}><span className={`block h-1 ${index <= active ? "bg-[var(--mb-ocean-600)]" : "bg-[var(--mb-neutral-200)]"}`} /><p className={`mt-1 truncate text-[7px] ${index === active ? "font-bold text-[var(--mb-navy-900)]" : "text-[var(--mb-neutral-500)]"}`}>{step}</p></li>)}</ol></div>; }
function AssistancePanel({ title, summary, facts, sources }: { title: string; summary: string; facts: string[]; sources: string[] }) { return <div className="mt-3 border-l-2 border-[var(--mb-ocean-600)] bg-[var(--mb-foam)] p-3"><p className="text-[8px] font-bold uppercase text-[var(--mb-ocean-600)]">Proposition à valider</p><h4 className="mt-2 text-[11px] font-semibold">{title}</h4><p className="mt-2 text-[9px] leading-4">{summary}</p><ul className="mt-2 text-[9px]">{facts.map((fact) => <li key={fact}>• {fact}</li>)}</ul><p className="mt-3 text-[8px] text-[var(--mb-neutral-500)]">Sources : {sources.join(" · ") || "dossier local"}. Validation humaine obligatoire.</p></div>; }
export function PosteOfficielPanel({ poste }: { poste?: QuayPost }) { if (!poste) return <p className="text-[9px] text-[var(--mb-neutral-500)]">Aucun poste local rattaché.</p>; return <div><p className="text-[8px] font-bold uppercase text-[var(--mb-ocean-600)]">Point d’ancrage terrain</p><h3 className="mt-1 text-[10px] font-semibold">{poste.name}</h3><p className="mt-1 text-[8px] leading-4 text-[var(--mb-neutral-600)]">{poste.officer} · {poste.phone} · {poste.hours}</p><p className="mt-2 text-[8px] text-[var(--mb-neutral-600)]">Vérification de premier niveau; validation finale régionale.</p></div>; }
export function ChannelBadge({ channel }: { channel: DossierChannel }) { return <span className="inline-flex rounded-[3px] border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] px-2 py-1 font-mono text-[7px] font-bold uppercase text-[var(--mb-neutral-600)]">{channel}</span>; }
function Disclosure({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) { return <details open={open} className="border-b border-[var(--mb-neutral-200)] py-4"><summary className="cursor-pointer text-[8px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-500)]">{title}</summary><div className="mt-3">{children}</div></details>; }
function DossierFact({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2"><dt className="text-[var(--mb-neutral-500)]">{label}</dt><dd className="font-semibold text-[var(--mb-navy-900)]">{value}</dd></div>; }
function DossierFilter({ label, value, options, onChange }: { label: string; value: string; options: Array<string | { value: string; label: string }>; onChange: (value: string) => void }) { return <label className="grid gap-1 text-[8px] font-bold uppercase text-[var(--mb-neutral-500)]">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 min-w-32 border border-[var(--mb-neutral-200)] bg-white px-2 text-[9px] font-semibold normal-case">{options.map((option) => { const item = typeof option === "string" ? { value: option, label: option } : option; return <option key={item.value} value={item.value}>{item.label}</option>; })}</select></label>; }
