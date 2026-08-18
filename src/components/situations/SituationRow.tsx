import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { ProductState, Situation } from "@/domain/types";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { TrustBadge } from "@/components/shared/StatusBadges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { priorityLabels, priorityToTag, glyphBorderColor } from "@/lib/status-tokens";

const statusLabels: Record<Situation["status"], string> = {
  recue: "Signal reçu",
  qualification: "En qualification",
  priorisee: "Priorisée",
  coordination: "Coordination engagée",
  intervention: "Intervention en cours",
  attente: "En attente",
  resultat: "Résultat enregistré",
  reglee: "Réglée"
};

const statusVariant: Record<Situation["status"], "marine" | "amber" | "terracotta" | "success"> = {
  recue: "marine",
  qualification: "marine",
  priorisee: "amber",
  coordination: "amber",
  intervention: "amber",
  attente: "terracotta",
  resultat: "success",
  reglee: "success"
};

export function SituationRow({ situation, state }: { situation: Situation; state: ProductState }) {
  const territory = state.territories.find((item) => item.id === situation.territoryId);
  const tag = priorityToTag[situation.priority];

  return (
    <div className="relative grid min-w-0 gap-4 py-5 pl-5 md:grid-cols-[minmax(0,1.35fr)_minmax(14rem,.8fr)_auto] md:items-center">
      <span className="absolute inset-y-4 left-0 w-1 rounded-full" style={{ backgroundColor: glyphBorderColor[tag] }} aria-hidden="true" />
      <div className="flex min-w-0 items-start gap-3">
        <TensionGlyph status={tag} size={30} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">{situation.reference}</span>
            <Badge variant={tag === "critique" ? "terracotta" : tag === "vigilance" ? "amber" : "marine"}>{priorityLabels[situation.priority]}</Badge>
            <TrustBadge trust={situation.trust} />
          </div>
          <h3 className="mt-2 font-semibold tracking-tight text-foreground">{situation.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin size={14} /> {territory?.name ?? "Territoire non défini"}</p>
        </div>
      </div>

      <div>
        <Badge variant={statusVariant[situation.status]}>{statusLabels[situation.status]}</Badge>
        <p className="mt-2 max-w-72 text-xs leading-5 text-muted-foreground">{situation.nextStep}</p>
      </div>

      <Button size="sm" variant="outline" asChild>
        <Link href={`/app/situations/${situation.id}`}>Ouvrir <ArrowRight /></Link>
      </Button>
    </div>
  );
}
