"use client";

// TerrainMatchingWorkspace — Sprint T03 ("Need/Capacity Matching + First
// Coordination Loop", docs/product/CURRENT_SPRINT.md §13) : "Extend
// existing Coordination / Terrain spaces rather than creating a
// marketplace." Composant séparé plutôt qu'ajouté dans
// CoordinationWorkspace.tsx (1191 lignes déjà, non écrites par ce
// sprint) : isolé et revu indépendamment, monté juste à côté sur la même
// page — jamais une marketplace, jamais une nouvelle application.
import { useState } from "react";
import { CheckCircle2, CircleAlert, Handshake, Radar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProduct } from "@/components/providers/ProductProvider";
import { renderCoordinationProviderMessage, renderCoordinationRequesterMessage } from "@/channels/message-templates";
import { computeMatchCandidates } from "@/domain/terrain-matching";
import type { ProductState, TerrainCoordination, TerrainMatch, TerrainNeed } from "@/domain/types";
import {
  terrainCapacityStatusLabels,
  terrainCoordinationResponseLabels,
  terrainCoordinationStatusLabels,
  terrainMatchCategoryLabels,
  terrainNeedStatusLabels
} from "@/domain/types";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function territoryName(state: ProductState, territoryId: string) {
  return state.territories.find((item) => item.id === territoryId)?.name ?? territoryId;
}

function actorName(state: ProductState, actorId: string) {
  return state.actors.find((item) => item.id === actorId)?.name ?? "Acteur inconnu";
}

// NeedMatches — un besoin + ses candidats déjà proposés + l'action de
// rafraîchissement (mandat §6/§7 : l'opérateur déclenche explicitement le
// calcul, jamais un balayage automatique en arrière-plan).
function NeedMatches({ state, need }: { state: ProductState; need: TerrainNeed }) {
  const { run } = useProduct();
  const [refreshing, setRefreshing] = useState(false);
  const [busyMatchId, setBusyMatchId] = useState<string | null>(null);

  const matches = state.terrainMatches.filter((item) => item.needId === need.id && item.status === "propose");
  const liveCandidateCount = computeMatchCandidates(state, need).length;

  async function refresh() {
    setRefreshing(true);
    await run({ type: "refresh_terrain_matches", needId: need.id });
    setRefreshing(false);
  }

  async function reject(matchId: string) {
    setBusyMatchId(matchId);
    await run({ type: "reject_terrain_match", matchId });
    setBusyMatchId(null);
  }

  async function initiate(match: TerrainMatch) {
    const capacity = state.terrainCapacities.find((item) => item.id === match.capacityId);
    if (!capacity) return;
    setBusyMatchId(match.id);
    const subjectLabel = need.subject ?? terrainMatchCategoryLabels[need.category];
    const territoryLabel = territoryName(state, need.territoryId);
    await run({
      type: "initiate_terrain_coordination",
      matchId: match.id,
      requesterMessage: renderCoordinationRequesterMessage(subjectLabel, territoryLabel),
      providerMessage: renderCoordinationProviderMessage(subjectLabel, territoryLabel)
    });
    setBusyMatchId(null);
  }

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold leading-5">
            {need.subject ?? terrainMatchCategoryLabels[need.category]} · {territoryName(state, need.territoryId)}
          </p>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline">{terrainMatchCategoryLabels[need.category]}</Badge>
            <Badge variant="outline">{terrainNeedStatusLabels[need.status]}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Demandeur : {actorName(state, need.actorId)}</span>
          {need.quantity !== undefined && <span>Quantité : {need.quantity}{need.unit ?? ""}</span>}
          {need.requiredTimeWindow && <span>Fenêtre : {need.requiredTimeWindow}</span>}
          <span>Créé : {formatDate(need.createdAt)}</span>
        </div>

        <Button type="button" size="sm" variant="outline" disabled={refreshing || need.status !== "active"} onClick={() => void refresh()}>
          <Radar size={14} /> Rafraîchir les candidats {liveCandidateCount > 0 ? `(${liveCandidateCount} détecté${liveCandidateCount > 1 ? "s" : ""})` : ""}
        </Button>

        {matches.length > 0 && (
          <div className="space-y-2 pt-1">
            {matches.map((match) => {
              const capacity = state.terrainCapacities.find((item) => item.id === match.capacityId);
              return (
                <div key={match.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold">Fournisseur : {capacity ? actorName(state, capacity.actorId) : "inconnu"}</p>
                    <Badge variant={match.priority === "haute" ? "outline" : "secondary"}>Priorité {match.priority}</Badge>
                  </div>
                  <ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">
                    {match.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                  {match.warnings.length > 0 && (
                    <ul className="mt-1 list-disc pl-4 text-xs text-amber-700">
                      {match.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-1"><CircleAlert size={12} className="mt-0.5 shrink-0" /> {warning}</li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Button type="button" size="sm" variant="outline" disabled={busyMatchId === match.id} onClick={() => void reject(match.id)}>
                      Rejeter
                    </Button>
                    <Button type="button" size="sm" disabled={busyMatchId === match.id} onClick={() => void initiate(match)}>
                      <Handshake size={14} /> Initier la coordination
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// CoordinationCard — mandat §10/§11 : réponses demandeur/fournisseur,
// puis enregistrement de l'issue une fois connectée.
function CoordinationCard({ state, coordination }: { state: ProductState; coordination: TerrainCoordination }) {
  const { run } = useProduct();
  const [busy, setBusy] = useState(false);
  const [fulfilled, setFulfilled] = useState(true);
  const [note, setNote] = useState("");

  async function respond(side: "demandeur" | "fournisseur", response: "acceptee" | "refusee") {
    setBusy(true);
    await run({ type: "record_terrain_coordination_response", coordinationId: coordination.id, side, response });
    setBusy(false);
  }

  async function recordOutcome() {
    setBusy(true);
    await run({
      type: "update_terrain_coordination_status",
      coordinationId: coordination.id,
      status: fulfilled ? "terminee" : "echouee",
      outcome: { fulfilled, note: note.trim() || undefined }
    });
    setBusy(false);
  }

  const territory = territoryName(state, coordination.territoryId);

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold leading-5">
            {actorName(state, coordination.requesterActorId)} ↔ {actorName(state, coordination.providerActorId)} · {territory}
          </p>
          <Badge variant="outline">{terrainCoordinationStatusLabels[coordination.status]}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Demandeur : {coordination.requesterResponse ? terrainCoordinationResponseLabels[coordination.requesterResponse] : "en attente"}</span>
          <span>Fournisseur : {coordination.providerResponse ? terrainCoordinationResponseLabels[coordination.providerResponse] : "en attente"}</span>
          <span>Créée : {formatDate(coordination.createdAt)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {coordination.notifications.map((notification) => (
            <span key={notification.target}>
              Notification {notification.target} : {notification.status === "a_envoyer" ? "en attente d'envoi" : notification.status === "envoyee" ? "envoyée" : `échec (${notification.failureReason ?? "raison inconnue"})`}
            </span>
          ))}
        </div>

        {coordination.status === "proposee" && (
          <div className="flex flex-wrap gap-2 pt-1">
            {!coordination.requesterResponse && (
              <>
                <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void respond("demandeur", "acceptee")}>Demandeur accepte</Button>
                <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void respond("demandeur", "refusee")}>Demandeur refuse</Button>
              </>
            )}
            {!coordination.providerResponse && (
              <>
                <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void respond("fournisseur", "acceptee")}>Fournisseur accepte</Button>
                <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void respond("fournisseur", "refusee")}>Fournisseur refuse</Button>
              </>
            )}
          </div>
        )}

        {coordination.status === "connectee" && (
          <div className="space-y-2 rounded-md border p-3">
            <p className="text-xs font-semibold">Enregistrer l’issue</p>
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1"><input type="radio" checked={fulfilled} onChange={() => setFulfilled(true)} /> Besoin satisfait</label>
              <label className="flex items-center gap-1"><input type="radio" checked={!fulfilled} onChange={() => setFulfilled(false)} /> Non satisfait</label>
            </div>
            <input
              className="w-full rounded-md border bg-background px-2 py-1 text-xs"
              placeholder="Note courte (optionnelle)"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <Button type="button" size="sm" disabled={busy} onClick={() => void recordOutcome()}>
              <CheckCircle2 size={14} /> Enregistrer
            </Button>
          </div>
        )}

        {coordination.outcome && (
          <p className="text-xs text-muted-foreground">
            Issue : {coordination.outcome.fulfilled ? "satisfait" : "non satisfait"}{coordination.outcome.note ? ` — ${coordination.outcome.note}` : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function TerrainMatchingWorkspace() {
  const { state } = useProduct();
  if (!state) return null;

  const activeNeeds = state.terrainNeeds.filter((item) => item.status === "active" || item.status === "en_coordination");
  const coordinations = [...state.terrainCoordinations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Rapprochement terrain</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Besoins, capacités et coordinations</h2>
        <p className="mt-1 text-sm text-muted-foreground">Glace/froid, transport, acheteur/débouché — jamais une marketplace : chaque mise en relation reste décidée par un opérateur.</p>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Besoins actifs ({activeNeeds.length})</p>
        {activeNeeds.length === 0 ? (
          <Card className="mt-2"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Aucun besoin actif pour le moment.</p></CardContent></Card>
        ) : (
          <div className="mt-2 space-y-2">
            {activeNeeds.map((need) => (
              <NeedMatches key={need.id} state={state} need={need} />
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Capacités déclarées ({state.terrainCapacities.length})</p>
        {state.terrainCapacities.length === 0 ? (
          <Card className="mt-2"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Aucune capacité déclarée pour le moment.</p></CardContent></Card>
        ) : (
          <div className="mt-2 space-y-1.5">
            {state.terrainCapacities.map((capacity) => (
              <Card key={capacity.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <span className="text-sm">{capacity.subject ?? terrainMatchCategoryLabels[capacity.category]} · {territoryName(state, capacity.territoryId)} · {actorName(state, capacity.actorId)}</span>
                  <Badge variant="outline">{terrainCapacityStatusLabels[capacity.status]}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Coordinations ({coordinations.length})</p>
        {coordinations.length === 0 ? (
          <Card className="mt-2"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Aucune coordination initiée pour le moment.</p></CardContent></Card>
        ) : (
          <div className="mt-2 space-y-2">
            {coordinations.map((coordination) => (
              <CoordinationCard key={coordination.id} state={state} coordination={coordination} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
