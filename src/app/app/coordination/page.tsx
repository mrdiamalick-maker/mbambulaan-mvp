"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, CircleAlert, Handshake, UsersRound } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CoordinationPage() {
  const { state } = useProduct();
  if (!state) return null;
  return (
    <>
      <PageHeader eyebrow="Engagements partagés" title="Coordination" description="Les décisions deviennent des responsabilités explicites : qui agit, pour quand, avec quel blocage et quel résultat attendu." />
      <div className="space-y-5 p-5 lg:p-8">
        {state.coordinationSpaces.map((space) => {
          const situation = state.situations.find((item) => item.id === space.situationId);
          return (
            <article key={space.id} className="surface overflow-hidden">
              <div className="border-b border-[#d8e1e2] bg-[#f4fbfc] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div><p className="label">Espace de coordination</p><h2 className="mt-2 text-xl font-bold text-[#062d36]">{space.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#60737a]">{space.objective}</p></div>
                  <Link href={`/app/coordination/${space.id}`} className="inline-flex shrink-0 items-center gap-2 bg-[#075466] px-4 py-2.5 text-sm font-bold text-white">Suivre les engagements <ArrowRight size={16} /></Link>
                </div>
              </div>
              <div className="grid gap-px bg-[#d8e1e2] sm:grid-cols-4">
                <div className="bg-white p-4"><UsersRound size={18} className="text-[#087287]" /><p className="mt-2 text-2xl font-bold">{space.participantIds.length}</p><p className="text-xs text-[#60737a]">acteurs mobilisés</p></div>
                <div className="bg-white p-4"><Handshake size={18} className="text-[#18a394]" /><p className="mt-2 text-2xl font-bold">{space.commitments.length}</p><p className="text-xs text-[#60737a]">engagements suivis</p></div>
                <div className="bg-white p-4"><CircleAlert size={18} className="text-[#d89614]" /><p className="mt-2 text-2xl font-bold">{space.risks.length}</p><p className="text-xs text-[#60737a]">risques à surveiller</p></div>
                <div className="bg-white p-4"><CalendarClock size={18} className="text-[#087287]" /><p className="mt-2 text-sm font-bold">Prochaine revue</p><p className="text-xs text-[#60737a]">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(space.nextReviewAt))}</p></div>
              </div>
              {situation && <div className="px-5 py-4 text-sm"><span className="font-bold">Situation reliée :</span> <Link className="text-[#075466] underline" href={`/app/situations/${situation.id}`}>{situation.title}</Link></div>}
            </article>
          );
        })}
      </div>
    </>
  );
}
