"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarClock, MapPin, UserRound } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { PriorityBadge, StatusBadge, TrustBadge } from "@/components/ui/Badges";
import { SituationAction } from "@/components/situations/SituationAction";

export default function SituationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useProduct();
  if (!state) return null;
  const situation = state.situations.find((item) => item.id === id);
  if (!situation) return <div className="p-8"><p>Situation introuvable.</p><Link href="/app/situations">Revenir au registre</Link></div>;
  const territory = state.territories.find((item) => item.id === situation.territoryId);
  const responsible = state.actors.find((item) => item.id === situation.responsibleId);
  const observation = state.observations.find((item) => situation.observationIds.includes(item.id));
  return (
    <>
      <PageHeader
        eyebrow={situation.reference}
        title={situation.title}
        description={situation.description}
        actions={<Link href="/app/situations" className="inline-flex items-center gap-2 border border-[#9ecbd2] px-4 py-2.5 text-sm font-bold text-[#075466]"><ArrowLeft size={16} /> Registre</Link>}
      />
      <div className="grid min-w-0 gap-6 p-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)] lg:p-8">
        <div className="min-w-0 space-y-6">
          <section className="surface p-5">
            <div className="flex flex-wrap gap-2"><StatusBadge status={situation.status} /><PriorityBadge priority={situation.priority} /><TrustBadge trust={situation.trust} source={observation?.source} /></div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              <div><dt className="label">Territoire</dt><dd className="mt-2 flex items-center gap-2 font-bold"><MapPin size={17} className="text-[#087287]" />{territory?.name}</dd></div>
              <div><dt className="label">Responsable</dt><dd className="mt-2 flex items-center gap-2 font-bold"><UserRound size={17} className="text-[#087287]" />{responsible?.name ?? "À désigner"}</dd></div>
              <div><dt className="label">Échéance</dt><dd className="mt-2 flex items-center gap-2 font-bold"><CalendarClock size={17} className="text-[#087287]" />{situation.dueAt ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(situation.dueAt)) : "À définir"}</dd></div>
            </dl>
            {situation.waitingReason && <div className="mt-5 border-l-4 border-[#d89614] bg-[#fff8e8] p-4"><p className="label">Blocage actuel</p><p className="mt-2 text-sm font-semibold">{situation.waitingReason}</p></div>}
            {situation.result && <div className="mt-5 border-l-4 border-[#18a394] bg-[#f1faf7] p-4"><p className="label">Résultat constaté</p><p className="mt-2 font-semibold">{situation.result}</p><p className="mt-2 text-sm text-[#60737a]">Confirmation : {situation.confirmation}</p></div>}
          </section>
          <SituationAction situation={situation} />
          <section className="surface p-5">
            <p className="label">Traçabilité</p><h2 className="mt-2 text-lg font-bold">Historique de la situation</h2>
            <ol className="mt-5 space-y-5 border-l border-[#b9dfe4] pl-5">
              {situation.history.map((entry) => (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[25px] top-1 size-2.5 rounded-full bg-[#087287]" />
                  <p className="text-sm font-bold">{entry.label}</p>
                  <p className="mt-1 text-sm text-[#60737a]">{entry.detail}</p>
                  <p className="mt-1 text-xs text-[#809096]">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.at))}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="space-y-5">
          <section className="surface p-5"><p className="label">Prochaine étape</p><p className="mt-3 text-lg font-bold leading-7 text-[#062d36]">{situation.nextStep}</p><p className="mt-3 text-sm leading-6 text-[#60737a]">Cette étape reste visible jusqu’à sa réalisation. Une action terminée ne redevient pas prioritaire.</p></section>
          <section className="surface p-5"><p className="label">Origine</p><h2 className="mt-2 font-bold">{observation?.source}</h2><p className="mt-2 text-sm leading-6 text-[#60737a]">{observation?.description}</p><dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt>Canal</dt><dd className="font-semibold">{observation?.channel.replaceAll("_", " ")}</dd></div><div className="flex justify-between gap-3"><dt>Visibilité</dt><dd className="font-semibold">{situation.visibility}</dd></div></dl></section>
          {situation.coordinationId && <Link href={`/app/coordination/${situation.coordinationId}`} className="block bg-[#075466] p-4 text-sm font-bold text-white">Ouvrir l’espace de coordination →</Link>}
        </aside>
      </div>
    </>
  );
}
