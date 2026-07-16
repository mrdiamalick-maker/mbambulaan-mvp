"use client";

import { useMemo, useState, type ReactNode } from "react";
import { quayPosts, type QuayPost } from "@/data/ministryControlTowerData";
import type { DossierChannel, DossierOperationnel, DossierType, DossierWorkStatus } from "@/lib/ministryOperationalDossiers";
import { DataTrustBadge, primaryButton, secondaryButton, StatusBadge } from "./MinistryControlTowerParts";

const statusLevel: Record<DossierWorkStatus, "normal" | "surveillance" | "urgent"> = { Nouveau: "normal", "À traiter": "surveillance", "En attente": "surveillance", Bloqué: "urgent", Terminé: "normal" };
const typeCode: Record<DossierType, string> = { Vérification: "VER", Incident: "INC", Financement: "FIN", Rapport: "RAP", Note: "NOT" };

export function DossierCard({ dossier, onOpen, prominent = false }: { dossier: DossierOperationnel; onOpen: (dossier: DossierOperationnel) => void; prominent?: boolean }) {
  return <button onClick={() => onOpen(dossier)} className={`grid w-full gap-3 border bg-white p-4 text-left transition-colors hover:border-[var(--mb-ocean-600)] ${prominent ? "border-[var(--mb-ocean-600)]" : "border-[var(--mb-neutral-200)]"}`}>
    <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-[3px] bg-[var(--mb-foam)] font-mono text-[9px] font-bold text-[var(--mb-ocean-600)]">{typeCode[dossier.type]}</span><div><p className="font-mono text-[9px] font-bold text-[var(--mb-ocean-600)]">{dossier.id}</p><p className="mt-0.5 text-[8px] text-[var(--mb-neutral-500)]">{dossier.type} · {dossier.linkedObjectType}</p></div></div><StatusBadge level={statusLevel[dossier.workStatus]}>{dossier.workStatus}</StatusBadge></div>
    <div><h3 className="text-[13px] font-semibold leading-5 text-[var(--mb-navy-900)]">{dossier.linkedObject}</h3><p className="mt-1 text-[9px] text-[var(--mb-neutral-600)]">{dossier.territory} · {dossier.currentOwner}</p></div>
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--mb-neutral-100)] pt-3"><ChannelBadge channel={dossier.originChannel} /><span className="text-right text-[9px] font-bold text-[var(--mb-ocean-600)]">{dossier.nextAction} →</span></div>
  </button>;
}

export function MyDossiers({ dossiers, onOpen }: { dossiers: DossierOperationnel[]; onOpen: (dossier: DossierOperationnel) => void }) {
  const [type, setType] = useState<"Tous" | DossierType>("Tous");
  const [channel, setChannel] = useState<"Tous" | DossierChannel>("Tous");
  const [quay, setQuay] = useState("Tous");
  const filtered = useMemo(() => dossiers.filter((dossier) => (type === "Tous" || dossier.type === type) && (channel === "Tous" || dossier.originChannel === channel) && (quay === "Tous" || dossier.quayId === quay)), [channel, dossiers, quay, type]);
  const groups: DossierWorkStatus[] = ["Nouveau", "À traiter", "En attente", "Bloqué", "Terminé"];
  return <section className="border-t border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-100)] px-4 py-5 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-[86rem]"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Direction régionale</p><h2 className="mt-1 text-[18px] font-semibold text-[var(--mb-navy-900)]">Mes dossiers</h2><p className="mt-1 text-[9px] text-[var(--mb-neutral-600)]">La pile de travail régionale, sans remplacer les statuts métier.</p></div><div className="flex flex-wrap gap-2"><DossierFilter label="Type" value={type} onChange={(value) => setType(value as "Tous" | DossierType)} options={["Tous", "Vérification", "Incident", "Financement", "Rapport", "Note"]} /><DossierFilter label="Canal" value={channel} onChange={(value) => setChannel(value as "Tous" | DossierChannel)} options={["Tous", "WhatsApp", "Téléphone", "Poste de quai", "Agent territorial", "Formulaire", "Document"]} /><DossierFilter label="Quai" value={quay} onChange={setQuay} options={["Tous", "kayar", "joal", "saint-louis"]} /></div></div>
      <div className="mt-4 grid min-w-0 gap-2 xl:grid-cols-5">{groups.map((group) => { const items = filtered.filter((dossier) => dossier.workStatus === group); return <section key={group} className="min-w-0 border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)]"><header className="flex items-center justify-between border-b border-[var(--mb-neutral-200)] px-3 py-2"><h3 className="text-[10px] font-bold">{group}</h3><span className="font-mono text-[9px]">{items.length}</span></header><div className="grid gap-2 p-2">{items.map((dossier) => <DossierCard key={dossier.id} dossier={dossier} onOpen={onOpen} />)}{!items.length ? <p className="px-2 py-4 text-center text-[8px] text-[var(--mb-neutral-400)]">Aucun dossier</p> : null}</div></section>; })}</div>
    </div>
  </section>;
}

export function OperationalDossierPanel({ dossier, onClose, onPrimary, onRelance }: { dossier: DossierOperationnel; onClose: () => void; onPrimary: (dossier: DossierOperationnel) => void; onRelance: (dossier: DossierOperationnel) => void }) {
  const [notes, setNotes] = useState(dossier.notes);
  const [note, setNote] = useState("");
  return <div className="fixed inset-0 z-[100] flex justify-end bg-[var(--mb-navy-900)]/35" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="h-full w-full max-w-xl overflow-y-auto border-l border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] shadow-[-18px_0_45px_rgba(9,31,48,.12)]">
    <header className="sticky top-0 z-10 border-b border-[var(--mb-neutral-200)] bg-white px-4 py-4"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[9px] font-bold text-[var(--mb-ocean-600)]">{dossier.id} · {dossier.type}</p><h2 className="mt-1 text-[18px] font-semibold text-[var(--mb-navy-900)]">{dossier.linkedObject}</h2><p className="mt-1 text-[9px] text-[var(--mb-neutral-600)]">{dossier.linkedObjectType} · {dossier.territory}</p></div><button onClick={onClose} className="h-8 w-8 border border-[var(--mb-neutral-200)] bg-white text-[14px]" aria-label="Fermer">×</button></div><div className="mt-3 flex flex-wrap gap-2"><StatusBadge level={statusLevel[dossier.workStatus]}>{dossier.workStatus}</StatusBadge><ChannelBadge channel={dossier.originChannel} /><DataTrustBadge level={dossier.pieces.some((piece) => piece.status === "Attendue") ? "declared" : "verified"} source="Niveau déduit des pièces locales disponibles dans ce dossier." /></div></header>
    <div className="grid gap-3 p-3">
      <DossierSection title="Situation de travail"><dl className="grid gap-2 text-[10px]"><DossierFact label="Statut métier" value={dossier.businessStatus} /><DossierFact label="Canal d’origine" value={dossier.originChannel} /><DossierFact label="Pris en charge par" value={dossier.currentOwner} /><DossierFact label="Canal de complément" value={dossier.transitChannel || "Aucun pour le moment"} /></dl></DossierSection>
      {dossier.quayId ? <PosteOfficielPanel poste={quayPosts.find((poste) => poste.quayId === dossier.quayId)} /> : null}
      <section className="border-l-2 border-[var(--mb-ocean-600)] bg-[var(--mb-foam)] p-4"><p className="font-mono text-[8px] font-bold uppercase text-[var(--mb-ocean-600)]">Prochaine action</p><h3 className="mt-2 text-[13px] font-semibold text-[var(--mb-navy-900)]">{dossier.nextAction}</h3><p className="mt-2 text-[9px] leading-4 text-[var(--mb-neutral-600)]">Cette action met à jour le statut métier existant et ajoute une trace au dossier.</p>{dossier.action !== "none" ? <button onClick={() => onPrimary(dossier)} className={`${primaryButton} mt-3`}>{dossier.nextAction}</button> : <p className="mt-3 text-[9px] font-bold text-[var(--mb-green-600)]">Dossier terminé · aucune action principale</p>}{dossier.workStatus === "Bloqué" ? <button onClick={() => onRelance(dossier)} className={`${secondaryButton} ml-2 mt-3`}>Relancer</button> : null}</section>
      <DossierSection title="Notes"><form onSubmit={(event) => { event.preventDefault(); if (!note.trim()) return; setNotes((items) => [...items, { id: `note-${Date.now()}`, time: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date()), author: "Agent connecté · simulation", text: note.trim() }]); setNote(""); }} className="grid gap-2"><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} placeholder="Ajouter une note courte au dossier" className="w-full border border-[var(--mb-neutral-200)] bg-white p-2 text-[10px] outline-none focus:border-[var(--mb-ocean-600)]" /><button className={`${secondaryButton} justify-self-start`}>Ajouter la note</button></form><ol className="mt-3 divide-y divide-[var(--mb-neutral-100)]">{notes.map((item) => <li key={item.id} className="py-2"><p className="text-[9px] leading-4 text-[var(--mb-neutral-700)]">{item.text}</p><p className="mt-1 font-mono text-[7px] text-[var(--mb-neutral-400)]">{item.time} · {item.author}</p></li>)}</ol></DossierSection>
      <DossierSection title="Pièces"><div className="grid gap-2 sm:grid-cols-2">{dossier.pieces.map((piece) => <div key={piece.id} className="border border-[var(--mb-neutral-200)] bg-white p-3"><p className="font-mono text-[8px] text-[var(--mb-ocean-600)]">{piece.type.toUpperCase()}</p><p className="mt-1 text-[9px] font-semibold">{piece.label}</p><p className={`mt-2 text-[8px] font-bold ${piece.status === "Disponible" ? "text-[var(--mb-green-600)]" : "text-[#956314]"}`}>{piece.status}</p></div>)}</div></DossierSection>
      <DossierSection title="Historique du dossier"><ol className="grid gap-2">{dossier.history.map((entry, index) => <li key={`${entry.time}-${index}`} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-2 border-l border-[var(--mb-ocean-400)] pl-3"><time className="font-mono text-[8px] font-bold text-[var(--mb-ocean-600)]">{entry.time}</time><div><p className="text-[9px] font-semibold">{entry.label}</p><p className="mt-1 text-[8px] text-[var(--mb-neutral-500)]">{entry.author} · <ChannelBadge channel={entry.channel} /></p></div></li>)}</ol></DossierSection>
      <DossierSection title="Sortie finale attendue"><p className="text-[10px] leading-5 text-[var(--mb-neutral-600)]">{dossier.finalOutput}</p></DossierSection>
    </div>
  </aside></div>;
}

export function PosteOfficielPanel({ poste }: { poste?: QuayPost }) {
  if (!poste) return null;
  return <section className="border-b border-[var(--mb-neutral-100)] bg-[var(--mb-foam)] px-4 py-3"><p className="font-mono text-[8px] font-bold uppercase text-[var(--mb-ocean-600)]">Poste officiel</p><h3 className="mt-1 text-[10px] font-semibold text-[var(--mb-navy-900)]">{poste.name}</h3><p className="mt-1 text-[8px] leading-4 text-[var(--mb-neutral-600)]">{poste.officer} · {poste.phone} · {poste.hours}</p><p className="mt-2 text-[8px] leading-4 text-[var(--mb-neutral-600)]">Relais principal WhatsApp / téléphone et vérification de premier niveau. La validation finale reste régionale.</p></section>;
}

export function ChannelBadge({ channel }: { channel: DossierChannel }) {
  return <span className="inline-flex items-center rounded-[3px] border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] px-2 py-1 font-mono text-[7px] font-bold uppercase text-[var(--mb-neutral-600)]">{channel}</span>;
}

function DossierSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border border-[var(--mb-neutral-200)] bg-white"><h3 className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[10px] font-bold text-[var(--mb-navy-900)]">{title}</h3><div className="p-3">{children}</div></section>;
}

function DossierFact({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3"><dt className="text-[var(--mb-neutral-500)]">{label}</dt><dd className="font-semibold text-[var(--mb-navy-900)]">{value}</dd></div>;
}

function DossierFilter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="grid gap-1 font-mono text-[7px] font-bold uppercase text-[var(--mb-neutral-500)]">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="h-8 min-w-28 border border-[var(--mb-neutral-200)] bg-white px-2 text-[9px] font-semibold normal-case text-[var(--mb-navy-900)]">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
