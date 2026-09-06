"use client";

// Filtre par type — corrigé (2026-08-12) : utilisait <Link
// href="/opportunites?type=..."> pour chaque chip, donc une vraie
// navigation de page à chaque clic (perte de scroll, rechargement de
// route). Remplacé par un état client (useState) : aucune navigation,
// le filtrage est instantané et le scroll de la page reste intact.
// Contrepartie assumée : une vue filtrée ne se partage plus par URL
// (?type=...) — cohérent avec ce qui a été demandé (pas de navigation
// de page du tout, pas une navigation "plus douce").
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarDays, CircleDollarSign, GraduationCap, Handshake, MapPinned, Megaphone, UsersRound } from "lucide-react";
import type { PublicAnnouncement, PublicOpportunityType } from "@/data/public-content";

const typeIcon: Record<PublicOpportunityType, typeof GraduationCap> = {
  Formation: GraduationCap,
  Programme: Megaphone,
  Financement: CircleDollarSign,
  Rencontre: UsersRound,
  Appel: Handshake
};

// PUB-O2 (audit Premium XXL Public, CEO 2026-08-16) : le champ involvement
// existait déjà dans PublicAnnouncement mais n'était affiché nulle part sur
// /opportunites (seulement en petite ligne sur la page détail) — c'est
// précisément "pourquoi Mbàmbulaan la relaie". Encodé par couleur plutôt
// qu'ajouté en texte partout : neutre = simple relais d'information,
// terracotta = Mbàmbulaan relaie activement, marine = Mbàmbulaan coordonne.
const involvementTone: Record<PublicAnnouncement["involvement"], string> = {
  "Information": "border-[var(--pub-stone-150)] bg-white text-[var(--pub-stone-700)]",
  "Relais Mbàmbulaan": "border-transparent bg-[var(--pub-turquoise-500)] text-white",
  "Coordination Mbàmbulaan": "border-transparent bg-[var(--pub-deep-900)] text-white"
};

export function OpportunitiesExplorer({ types, announcements }: { types: PublicOpportunityType[]; announcements: PublicAnnouncement[] }) {
  const [activeType, setActiveType] = useState<PublicOpportunityType | null>(null);
  const filtered = activeType ? announcements.filter((item) => item.type === activeType) : announcements;
  // PUB-O1 (audit Premium XXL Public, CEO 2026-08-16, PRIORITÉ 1) : passer
  // du catalogue de cards au registre. Seules les 2 premières de la vue
  // filtrée restent des cards mises en avant ; le reste devient un registre
  // Type | Opportunité | Territoire | Public | Échéance (cartes compactes
  // en mobile) — un catalogue de 12 cards identiques risquait de faire
  // percevoir Mbàmbulaan comme un portail d'annonces plutôt qu'un outil de
  // contextualisation/coordination.
  const featured = filtered.slice(0, 2);
  const rest = filtered.slice(2);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveType(null)}
          className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${!activeType ? "border-[var(--pub-deep-900)] bg-[var(--pub-deep-900)] text-white" : "border-[var(--pub-stone-150)] bg-white text-[var(--pub-stone-500)] hover:border-[var(--pub-turquoise-500)]"}`}
        >
          Tout
        </button>
        {types.map((label) => (
          <button
            type="button"
            key={label}
            onClick={() => setActiveType(label)}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${activeType === label ? "border-[var(--pub-deep-900)] bg-[var(--pub-deep-900)] text-white" : "border-[var(--pub-stone-150)] bg-white text-[var(--pub-stone-500)] hover:border-[var(--pub-turquoise-500)]"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {featured.length > 0 && (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {featured.map((item) => {
            const Icon = typeIcon[item.type] ?? CircleDollarSign;
            return (
              <Link key={item.id} href={`/opportunites/${item.id}`} className="pub-card group flex min-h-72 flex-col p-5 transition hover:-translate-y-0.5 hover:border-[var(--pub-turquoise-500)]">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]"><Icon size={14}/>{item.type}</span>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${involvementTone[item.involvement]}`}>{item.involvement}</span>
                </div>
                <h2 className="mt-5 text-xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{item.description}</p>
                <div className="mt-5 space-y-2 rounded-xl bg-[var(--pub-ivory-200)] p-4 text-xs text-[var(--pub-stone-700)]">
                  <p className="flex items-center gap-2"><MapPinned size={14} className="text-[var(--pub-turquoise-500)]"/> {item.territory}</p>
                  <p className="flex items-center gap-2"><UsersRound size={14} className="text-[var(--pub-turquoise-500)]"/> {item.audience}</p>
                  <p className="flex items-center gap-2"><CalendarDays size={14} className="text-[var(--pub-turquoise-500)]"/> {item.deadline}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="text-[10px] font-bold text-[var(--pub-stone-500)]">Démonstration</span>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Je suis intéressé <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {rest.length > 0 && (
        <div className="mt-8">
          {/* Registre desktop — colonnes Type | Opportunité | Territoire |
              Public | Échéance. La couleur de la puce Type porte le niveau
              d'implication Mbàmbulaan (involvementTone), sans colonne
              supplémentaire pour rester compact. */}
          <div className="hidden overflow-hidden rounded-[var(--pub-radius-md)] border border-[var(--pub-stone-150)] bg-[var(--pub-surface)] md:block">
            <div className="grid grid-cols-[.9fr_1.6fr_1fr_1fr_.9fr] gap-3 border-b border-[var(--pub-stone-150)] bg-[var(--pub-ivory-100)] px-5 py-3 text-[10px] font-black uppercase tracking-[.08em] text-[var(--pub-stone-500)]">
              <span>Type</span><span>Opportunité</span><span>Territoire</span><span>Public</span><span>Échéance</span>
            </div>
            <div className="divide-y divide-[var(--pub-stone-150)]">
              {rest.map((item) => (
                <Link key={item.id} href={`/opportunites/${item.id}`} className="grid grid-cols-[.9fr_1.6fr_1fr_1fr_.9fr] items-center gap-3 px-5 py-4 text-sm transition hover:bg-[var(--pub-ivory-100)]">
                  <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${involvementTone[item.involvement]}`}>{item.type}</span>
                  <span className="min-w-0 font-bold text-[var(--pub-deep-900)]">{item.title}</span>
                  <span className="min-w-0 text-[var(--pub-stone-700)]">{item.territory}</span>
                  <span className="min-w-0 text-[var(--pub-stone-700)]">{item.audience}</span>
                  <span className="min-w-0 text-[var(--pub-stone-700)]">{item.deadline}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Cartes compactes — mobile (PUB-O1). */}
          <div className="divide-y divide-[var(--pub-stone-150)] rounded-[var(--pub-radius-md)] border border-[var(--pub-stone-150)] bg-[var(--pub-surface)] md:hidden">
            {rest.map((item) => (
              <Link key={item.id} href={`/opportunites/${item.id}`} className="block p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${involvementTone[item.involvement]}`}>{item.type}</span>
                  <span className="text-[10px] font-semibold text-[var(--pub-stone-500)]">{item.deadline}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-[var(--pub-deep-900)]">{item.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--pub-stone-500)]"><MapPinned size={12}/> {item.territory} · {item.audience}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && <p className="mt-8 text-sm text-[var(--pub-stone-500)]">Aucune opportunité de ce type pour le moment.</p>}
    </>
  );
}
