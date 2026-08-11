"use client";

// Restylé en D9 (Lot 4, étape 3/4) + panneau Décision ajouté : jusqu'ici
// SituationRoom affichait coordination.decision, un champ texte libre
// sur CoordinationSpace, jamais les vrais objets Decision de
// state.decisions (première consommation en écriture depuis un rôle
// autre que le Lot 1 lui-même — la lecture existait déjà à
// l'Institution, Lot 2).
import { useState } from "react";
import { Handshake, UsersRound } from "lucide-react";
import type { CoordinationSpace, ProductState } from "@/domain/types";
import { decisionTypeLabels } from "@/domain/types";
import { DecisionIcon } from "@/components/etat/MotifIcons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DecisionForm } from "@/components/coordination/DecisionForm";

export function CoordinationProposal({
  coordination,
  state,
  situationId
}: {
  coordination?: CoordinationSpace;
  state: ProductState;
  situationId: string;
}) {
  const [decisionDrawerOpen, setDecisionDrawerOpen] = useState(false);
  const decisions = state.decisions
    .filter((item) => item.situationId === situationId)
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime());

  const actors = coordination ? state.actors.filter((actor) => coordination.participantIds.includes(actor.id)) : [];

  return (
    <div className="space-y-4">
      {!coordination ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Coordination recommandée</p>
            <h2 className="mt-3 text-xl font-semibold">Préparer une réponse coordonnée</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Les acteurs concernés pourront être mobilisés lorsque la situation nécessitera une action collective.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="bg-sidebar p-6 text-sidebar-foreground">
            <div className="flex items-center gap-2 text-primary">
              <Handshake size={18} />
              <p className="text-xs font-bold uppercase tracking-widest">Coordination active</p>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">{coordination.title}</h2>
            <p className="mt-3 text-sm text-sidebar-foreground/70">{coordination.objective}</p>
          </div>
          <div className="grid gap-5 p-6 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Acteurs mobilisés</p>
              <div className="mt-3 space-y-2">
                {actors.map((actor) => (
                  <div key={actor.id} className="flex items-center gap-3 rounded-lg bg-muted p-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-[#1d4468]"><UsersRound size={16} /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{actor.name}</p>
                      <p className="text-xs text-muted-foreground">{actor.role.replaceAll("_", " ")}{actor.verified && " · Vérifié"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Engagements</p>
              <div className="mt-3 space-y-2">
                {coordination.commitments.map((commitment) => (
                  <div key={commitment.id} className="rounded-lg border p-3">
                    <p className="text-sm font-semibold">{commitment.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Statut : {commitment.status.replaceAll("_", " ")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary"><DecisionIcon size={14} color="#b6522f" /> Décisions</p>
            <Button variant="outline" size="sm" onClick={() => setDecisionDrawerOpen(true)}>Enregistrer une décision</Button>
          </div>
          {decisions.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Aucune décision enregistrée pour cette situation pour le moment.</p>
          ) : (
            <div className="mt-4 space-y-2.5">
              {decisions.map((decision) => {
                const decider = state.actors.find((item) => item.id === decision.decidedByActorId);
                return (
                  <div key={decision.id} className="flex items-start gap-3 rounded-lg border bg-card px-3.5 py-3">
                    <DecisionIcon size={20} color="#1d4468" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{decisionTypeLabels[decision.type]}</p>
                        {decision.coordinationId && <Badge variant="outline">Coordination liée</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{decision.rationale}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        {new Date(decision.decidedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                        {decider ? ` · ${decider.name}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={decisionDrawerOpen} onOpenChange={setDecisionDrawerOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Enregistrer une décision</SheetTitle>
            <SheetDescription>Le choix, son motif et son auteur restent tracés dans l’historique de la situation.</SheetDescription>
          </SheetHeader>
          <DecisionForm situationId={situationId} coordinationId={coordination?.id} onDone={() => setDecisionDrawerOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
