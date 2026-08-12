"use client";

// Expérience dédiée prestataire (Lot 7, étape 1/4) — même raison que
// OperatorTaskView/BuyerTaskView. Le mandat prestataire
// (start_intervention/wait/resume/record_result/record_evidence,
// src/server/permissions.ts) s'exerce déjà entièrement dans la Situation
// Room (SituationAction.tsx, Lot 4) — pas de logique de commande
// dupliquée ici : cette vue ne fait que retrouver les situations où un
// Commitment lui est assigné et non terminé, et ouvre la Situation Room
// pour agir, exactement comme CoordinatorHub le fait pour sa propre file.
import Link from "next/link";
import { ArrowRight, HandHelping } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductState } from "@/domain/types";

const situationStatusLabel: Record<string, string> = {
  coordination: "À démarrer",
  intervention: "En cours",
  attente: "En attente",
  resultat: "Résultat à valider"
};

export function ProviderTaskView({ state, actorId }: { state: ProductState; actorId: string }) {
  const actor = state.actors.find((item) => item.id === actorId);

  const myOpenSituations = state.coordinationSpaces.flatMap((space) => {
    const commitment = space.commitments.find((item) => item.actorId === actorId && item.status !== "terminee");
    const situation = commitment ? state.situations.find((item) => item.id === space.situationId) : undefined;
    return commitment && situation && situation.status !== "reglee" ? [{ situation, commitment }] : [];
  });

  return (
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">{actor?.name ?? "Mes interventions"}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Mes engagements en cours.</h1>
      </div>

      {myOpenSituations.length === 0 ? (
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Aucun engagement actif ne vous est confié pour le moment.</p></CardContent></Card>
      ) : (
        <div className="space-y-2.5">
          {myOpenSituations.map(({ situation, commitment }) => {
            const territory = state.territories.find((item) => item.id === situation.territoryId);
            return (
              <Card key={situation.id} className="flex-col gap-3 p-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1d4468] text-white"><HandHelping size={18} /></span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="marine">{situationStatusLabel[situation.status] ?? situation.status}</Badge>
                      <span className="text-xs text-muted-foreground">{territory?.name}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold">{commitment.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{situation.title}</p>
                  </div>
                </div>
                <Button size="sm" asChild><Link href={`/app/situations/${situation.id}`}>Ouvrir l’intervention <ArrowRight size={15} /></Link></Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
