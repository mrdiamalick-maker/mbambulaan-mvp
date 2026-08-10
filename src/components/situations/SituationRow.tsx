import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { ProductState, Situation } from "@/domain/types";
import { PriorityBadge, StatusBadge, TrustBadge } from "@/components/ui/Badges";
import { ListItemCard } from "@/components/ui/ListItemCard";

export function SituationRow({ situation, state }: { situation: Situation; state: ProductState }) {
  const territory = state.territories.find((item) => item.id === situation.territoryId);
  return (
    <ListItemCard className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1.3fr)_auto_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--ocean-700)]">{situation.reference}</span>
          <PriorityBadge priority={situation.priority} />
          <TrustBadge trust={situation.trust} />
        </div>
        <h3 className="mt-2 font-semibold text-[var(--ink)]">{situation.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--legacy-muted)]"><MapPin size={14} /> {territory?.name}</p>
      </div>
      <div>
        <StatusBadge status={situation.status} />
        <p className="mt-2 max-w-64 text-xs leading-5 text-[var(--legacy-muted)]">{situation.nextStep}</p>
      </div>
      <Link href={`/app/situations/${situation.id}`} className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--white)] px-3 py-2 text-sm font-semibold text-[var(--ocean-800)] transition-colors duration-200 hover:bg-[var(--lagoon-100)]">
        Ouvrir <ArrowRight size={15} />
      </Link>
    </ListItemCard>
  );
}
