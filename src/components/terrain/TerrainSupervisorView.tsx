"use client";

// TerrainSupervisorView — LOT 3 (mandat §18) : "Qu'est-ce que le terrain
// doit vérifier maintenant ?" — missions groupées par statut, avec
// territoire/responsable/origine, jamais un tableau de bord KPI massif.
// Remplace le message "reconnectez-vous en capitaine" pour
// l'administrateur (mandat §3). Section "Interactions terrain reçues"
// (Sprint T01, enrichie Sprint T02 §8) : affiche désormais
// l'interprétation IA et permet à l'opérateur de confirmer/corriger/
// marquer à revoir, geste humain auditable (correct_terrain_interpretation).
import { useState } from "react";
import { ClipboardList, MessageCircleMore } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FieldMission, FieldMissionStatus, ProductState, TerrainInteractionIntent } from "@/domain/types";
import { fieldMissionStatusLabels, terrainInteractionIntentLabels } from "@/domain/types";
import { buildTerrainInteractionRows, type TerrainInteractionRow } from "@/domain/channel-interaction";
import { evaluatePromotion } from "@/domain/terrain-matching";
import { useProduct } from "@/components/providers/ProductProvider";

const INTENT_OPTIONS: TerrainInteractionIntent[] = ["signal", "besoin", "observation", "capacite", "non_classifie"];

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

// InteractionCorrectionActions — mandat §8 : "confirm the interpretation;
// correct intent and key extracted fields; mark interpretation for
// review." Un seul petit formulaire inline plutôt qu'un dialogue séparé —
// "do not redesign the full application". Soumission désactivée pendant
// l'appel pour éviter un double envoi (geste humain auditable, jamais
// dupliqué par un double clic).
function InteractionCorrectionActions({ row }: { row: TerrainInteractionRow }) {
  const { run } = useProduct();
  const [selectedIntent, setSelectedIntent] = useState<TerrainInteractionIntent>((Object.entries(terrainInteractionIntentLabels).find(([, label]) => label === row.intentLabel)?.[0] as TerrainInteractionIntent) ?? "non_classifie");
  const [submitting, setSubmitting] = useState<"confirm" | "review" | "correct" | null>(null);

  async function submit(markForReview: boolean, intent?: TerrainInteractionIntent, which: "confirm" | "review" | "correct" = "confirm") {
    setSubmitting(which);
    await run({ type: "correct_terrain_interpretation", interactionId: row.id, markForReview, intent });
    setSubmitting(null);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <Button type="button" size="sm" variant="outline" disabled={submitting !== null} onClick={() => void submit(false, undefined, "confirm")}>
        Confirmer
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={submitting !== null} onClick={() => void submit(true, undefined, "review")}>
        Marquer à revoir
      </Button>
      <select
        className="h-8 rounded-md border bg-background px-2 text-xs"
        value={selectedIntent}
        onChange={(event) => setSelectedIntent(event.target.value as TerrainInteractionIntent)}
      >
        {INTENT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {terrainInteractionIntentLabels[option]}
          </option>
        ))}
      </select>
      <Button type="button" size="sm" variant="outline" disabled={submitting !== null} onClick={() => void submit(false, selectedIntent, "correct")}>
        Corriger l’intention
      </Button>
    </div>
  );
}

// PromotionAction — mandat T03 §13, "Créer/qualifier en besoin/capacité
// if required". La promotion automatique (pont webhook) couvre déjà le
// cas sûr ; ce bouton reste le repli explicite pour tout le reste (revue
// humaine passée, correction a posteriori, etc.) — jamais affiché quand
// déjà promu ou non éligible.
function PromotionAction({ state, row }: { state: ProductState; row: TerrainInteractionRow }) {
  const { run } = useProduct();
  const [submitting, setSubmitting] = useState(false);
  const interaction = state.terrainInteractions.find((item) => item.id === row.id);
  if (!interaction) return null;

  const alreadyPromoted =
    state.terrainNeeds.some((item) => item.sourceInteractionId === interaction.id) ||
    state.terrainCapacities.some((item) => item.sourceInteractionId === interaction.id);
  if (alreadyPromoted) {
    return <p className="pt-1 text-xs text-muted-foreground">Déjà promu en besoin/capacité — voir l’espace Coordination.</p>;
  }

  const eligibility = evaluatePromotion(interaction);
  if (!eligibility.eligible) return null;

  async function promote() {
    setSubmitting(true);
    await run({ type: "promote_terrain_interaction", interactionId: row.id });
    setSubmitting(false);
  }

  return (
    <div className="pt-1">
      <Button type="button" size="sm" variant="outline" disabled={submitting} onClick={() => void promote()}>
        Créer/qualifier en {interaction.intent === "besoin" ? "besoin" : "capacité"}
      </Button>
    </div>
  );
}

export function TerrainSupervisorView({ state }: { state: ProductState }) {
  const missions = state.fieldMissions;
  const interactionRows = buildTerrainInteractionRows(state);
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

      <div>
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <MessageCircleMore size={13} /> Interactions terrain reçues ({interactionRows.length})
        </p>
        {interactionRows.length === 0 ? (
          <Card className="mt-2"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Aucune interaction reçue pour le moment.</p></CardContent></Card>
        ) : (
          <div className="mt-2 space-y-2">
            {interactionRows.map((row) => (
              <Card key={row.id}>
                <CardContent className="space-y-1.5 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold leading-5">{row.actorName} · {row.roleLabel}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline">{row.intentLabel}</Badge>
                      <Badge variant="outline">{row.evidenceStatusLabel}</Badge>
                      <Badge variant="outline">{row.processingStatusLabel}</Badge>
                      {row.confidenceLabel && <Badge variant="outline">Confiance : {row.confidenceLabel}</Badge>}
                      {row.needsHumanReview && <Badge variant="destructive">À revoir</Badge>}
                    </div>
                  </div>
                  <p className="text-sm">{row.message}</p>
                  {row.summary && <p className="text-xs text-muted-foreground">Interprétation : {row.summary}</p>}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{row.territoryLabel}</span>
                    {row.subject && <span>Sujet : {row.subject}</span>}
                    <span>{row.messageTypeLabel}</span>
                    <span>{formatDate(row.receivedAt)}</span>
                  </div>
                  {row.hasInterpretation && <InteractionCorrectionActions row={row} />}
                  {row.hasInterpretation && <PromotionAction state={state} row={row} />}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
