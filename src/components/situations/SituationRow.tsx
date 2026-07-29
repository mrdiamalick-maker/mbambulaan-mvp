import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { ProductState, Situation } from "@/domain/types";
import { PriorityBadge, StatusBadge, TrustBadge } from "@/components/ui/Badges";

export function SituationRow({ situation, state }: { situation: Situation; state: ProductState }) {
  const territory = state.territories.find((item) => item.id === situation.territoryId);
  return (
    <article className="grid min-w-0 gap-4 border-b border-[#e1e7e8] bg-white p-4 last:border-b-0 md:grid-cols-[minmax(0,1.3fr)_auto_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#087287]">{situation.reference}</span>
          <PriorityBadge priority={situation.priority} />
          <TrustBadge trust={situation.trust} />
        </div>
        <h3 className="mt-2 font-bold text-[#17313a]">{situation.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[#60737a]"><MapPin size={14} /> {territory?.name}</p>
      </div>
      <div><StatusBadge status={situation.status} /><p className="mt-2 max-w-64 text-xs leading-5 text-[#60737a]">{situation.nextStep}</p></div>
      <Link href={`/app/situations/${situation.id}`} className="inline-flex items-center justify-center gap-2 border border-[#9ecbd2] px-3 py-2 text-sm font-bold text-[#075466] hover:bg-[#eaf8fa]">
        Ouvrir <ArrowRight size={15} />
      </Link>
    </article>
  );
}
