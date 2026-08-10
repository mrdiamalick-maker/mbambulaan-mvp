"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, CircleAlert, UserRound } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CoordinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useProduct();
  if (!state) return null;
  const space = state.coordinationSpaces.find((item) => item.id === id);
  if (!space) return <div className="p-8">Espace de coordination introuvable.</div>;
  return (
    <>
      <PageHeader eyebrow="Coordination active" title={space.title} description={space.objective} actions={<Link href="/app/coordination" className="inline-flex items-center gap-2 border border-[#9ecbd2] px-4 py-2.5 text-sm font-bold text-[#075466]"><ArrowLeft size={16} /> Coordination</Link>} />
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,.6fr)] lg:p-8">
        <section className="surface overflow-hidden">
          <div className="border-b border-[#d8e1e2] p-5"><p className="label">Décision partagée</p><p className="mt-2 text-lg font-bold leading-7">{space.decision}</p></div>
          <div className="p-5"><p className="label">Engagements</p><div className="mt-4 space-y-3">{space.commitments.map((commitment) => {
            const owner = state.actors.find((item) => item.id === commitment.actorId);
            return <div key={commitment.id} className="grid gap-3 border border-[#d8e1e2] p-4 sm:grid-cols-[1fr_auto]"><div><p className="font-bold">{commitment.label}</p><p className="mt-2 flex items-center gap-2 text-sm text-[#60737a]"><UserRound size={15} />{owner?.name}</p></div><div className="sm:text-right"><span className="rounded-full bg-[#eaf8fa] px-2.5 py-1 text-xs font-bold text-[#075466]">{commitment.status.replaceAll("_", " ")}</span><p className="mt-2 flex items-center gap-1 text-xs text-[#60737a]"><Calendar size={13} />{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(commitment.dueAt))}</p></div></div>;
          })}</div></div>
        </section>
        <aside className="space-y-5">
          <section className="surface p-5"><p className="label">Participants</p><ul className="mt-4 space-y-3">{space.participantIds.map((actorId) => { const actor = state.actors.find((item) => item.id === actorId); return <li key={actorId} className="border-b border-[#e1e7e8] pb-3 last:border-0"><p className="font-bold">{actor?.name}</p><p className="text-xs text-[#60737a]">{actor?.role.replaceAll("_", " ")}</p></li>; })}</ul></section>
          <section className="border border-[#ead7a8] bg-[#fff8e8] p-5"><p className="label">Risques</p><ul className="mt-3 space-y-3">{space.risks.map((risk) => <li key={risk} className="flex gap-2 text-sm"><CircleAlert size={16} className="mt-0.5 shrink-0 text-[#d89614]" />{risk}</li>)}</ul></section>
        </aside>
      </div>
    </>
  );
}
