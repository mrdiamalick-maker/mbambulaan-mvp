"use client";

import { useState } from "react";
import { Handshake, UsersRound } from "lucide-react";
import type { CoordinationSpace, ProductState } from "@/domain/types";
import { decisionTypeLabels } from "@/domain/types";
import { DecisionIcon } from "@/components/etat/MotifIcons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DecisionForm } from "@/components/coordination/DecisionForm";
import { roleLabel } from "@/components/shell/AppSidebar";
import { commitmentStatusLabel, commitmentStatusVariant } from "@/lib/status-tokens";

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
    <section className="space-y-6 border-t pt-7">
      {!coordination ? (
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Coordination</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Aucune coordination active</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Une réponse collective pourra être préparée si la situation nécessite de mobiliser plusieurs acteurs.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl bg-sidebar p-5 text-sidebar-foreground md:p-6">
            <div className="flex items-center gap-2 text-primary">
              <Handshake size={18} />
              <p className="text-xs font-bold uppercase tracking-widest">Coordination active</p>
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">{coordination.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-sidebar-foreground/70">{coordination.objective}</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Acteurs mobilisés</p>
              <div className="mt-3 divide-y border-y">
                {actors.map((actor) => (
                  <div key={actor.id} className="flex items-center gap-3 py-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[#1d4468]"><UsersRound size={15} /></span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-semibold">{actor.name}</p>
                        {actor.verified && <Badge variant="success">Vérifié</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{roleLabel(actor.role)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Engagements</p>
              <div className="mt-3 divide-y border-y">
                {coordination.commitments.map((commitment) => (
                  <div key={commitment.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <p className="text-sm font-semibold">{commitment.label}</p>
                    <Badge variant={commitmentStatusVariant[commitment.status]}>{commitmentStatusLabel[commitment.status]}</Badge>
                  </div>
                ))}
                {coordination.commitments.length === 0 && <p className="py-4 text-sm text-muted-foreground">Aucun engagement enregistré pour le moment.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-t pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary"><DecisionIcon size={14} color="#b6522f" /> Décisions</p>
            <p className="mt-1 text-sm text-muted-foreground">Choix de gouvernance tracés pour cette situation.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setDecisionDrawerOpen(true)}>Enregistrer une décision</Button>
        </div>

        {decisions.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Aucune décision enregistrée pour cette situation pour le moment.</p>
        ) : (
          <div className="mt-4 divide-y border-y">
            {decisions.map((decision) => {
              const decider = state.actors.find((item) => item.id === decision.decidedByActorId);
              return (
                <article key={decision.id} className="flex items-start gap-3 py-3.5">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[#1d4468]"><DecisionIcon size={16} color="#eef2f4" /></span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{decisionTypeLabels[decision.type]}</p>
                      {decision.coordinationId && <Badge variant="marine">Coordination liée</Badge>}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{decision.rationale}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/70">
                      {new Date(decision.decidedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                      {decider ? ` · ${decider.name}` : ""}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Sheet open={decisionDrawerOpen} onOpenChange={setDecisionDrawerOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Enregistrer une décision</SheetTitle>
            <SheetDescription>Le choix, son motif et son auteur restent tracés dans l’historique de la situation.</SheetDescription>
          </SheetHeader>
          <DecisionForm situationId={situationId} coordinationId={coordination?.id} onDone={() => setDecisionDrawerOpen(false)} />
        </SheetContent>
      </Sheet>
    </section>
  );
}
