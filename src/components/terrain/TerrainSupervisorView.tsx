"use client";

// TerrainSupervisorView — LOT 3 (mandat §18) : "Qu'est-ce que le terrain
// doit vérifier maintenant ?" — missions groupées par statut, avec
// territoire/responsable/origine, jamais un tableau de bord KPI massif.
// Remplace le message "reconnectez-vous en capitaine" pour
// l'administrateur (mandat §3).
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { FieldMission, FieldMissionStatus, ProductState } from "@/domain/types";
import { fieldMissionStatusLabels } from "@/domain/types";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

const GROUPS: { status: FieldMissionStatus; label: string }[] = [
  { status: "a_preparer", label: "À préparer" },
  { status: "planifiee", label: "Planifiées" },
  { status: "en_cours", label: "En cours" },
  { status: "realisee", label: "Réalisées récemment" }
];

// origine (mandat §18) — d'où vient la raison de la mission, dérivé des
// mêmes champs de traçabilité que FieldMission (mandat §7), pas une
// nouvelle donnée fabriquée pour cet écran.
function describeOrigin(mission: FieldMission): string {
  if (mission.knowledgeGapFindingId) return "Connaissance manquante";
  if (mission.findingId) return "Constat";
  if (mission.collectiveNeedId) return "Besoin collectif";
  if (mission.situationId) return "Situation";
  return "Décision directe";
}

export function TerrainSupervisorView({ state }: { state: ProductState }) {
  const missions = state.fieldMissions;
  const realiseesRecentes = missions
    .filter((item) => item.status === "realisee")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Supervision terrain</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Qu’est-ce que le terrain doit vérifier maintenant ?</h1>
      </div>

      {missions.length === 0 ? (
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Aucune mission terrain n’a encore été organisée.</p></CardContent></Card>
      ) : (
        GROUPS.map((group) => {
          const list = group.status === "realisee" ? realiseesRecentes : missions.filter((item) => item.status === group.status);
          if (list.length === 0) return null;
          return (
            <div key={group.status}>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <ClipboardList size={13} /> {group.label} ({list.length})
              </p>
              <div className="mt-2 space-y-2">
                {list.map((mission) => {
                  const territories = mission.territoryIds.map((id) => state.territories.find((item) => item.id === id)?.name ?? id);
                  const responsible = state.actors.find((item) => item.id === mission.responsibleActorId);
                  return (
                    <Card key={mission.id}>
                      <CardContent className="space-y-1.5 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold leading-5">{mission.title}</p>
                          <Badge variant="outline">{fieldMissionStatusLabels[mission.status]}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{territories.join(" · ")}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>Responsable : {responsible?.name ?? "à désigner"}</span>
                          <span>Origine : {describeOrigin(mission)}</span>
                          {mission.dueAt && <span>Échéance : {formatDate(mission.dueAt)}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
