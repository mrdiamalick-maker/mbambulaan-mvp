"use client";

// Expérience dédiée mareyeur/transformateur (Lot 7, étape 1/4) — même
// raison que OperatorTaskView : CoordinatorHub n'est pas pensé pour un
// acheteur/transformateur, dont le mandat (src/server/permissions.ts)
// se résume à accept_opportunity/complete_logistics/create_service_request.
// La file d'opportunités déjà détectées par le moteur de rapprochement
// (§5.11) devient une file d'action, pas une liste à parcourir sur
// /app/coordination pensée pour la coordination territoriale.
import { useState } from "react";
import { ArrowRight, Boxes, PackageCheck, Plus } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ServiceRequestForm } from "@/components/work/ServiceRequestForm";
import type { Opportunity, ProductState, Role } from "@/domain/types";

const roleTitle: Record<string, string> = {
  mareyeur: "Mes achats en cours",
  transformateur: "Ma production en cours"
};

// Rapprochement marché — convention DEMANDE → PROPOSITION → ENGAGEMENT →
// EXÉCUTION (révue éditoriale Produit, 2026-08-12). "proposee" n'est
// jamais affiché ici (filtré plus bas, statut intermédiaire avant
// détection côté acheteur) — pas de libellé fabriqué pour un statut qui
// n'apparaît jamais dans cette vue.
const opportunityStatusLabel: Record<Exclude<Opportunity["status"], "proposee">, string> = {
  detectee: "Proposition identifiée",
  engagee: "Engagement confirmé",
  executee: "Collecte réalisée"
};

export function BuyerTaskView({ state, actorId, role }: { state: ProductState; actorId: string; role: Role }) {
  const { run } = useProduct();
  const [formOpen, setFormOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const actor = state.actors.find((item) => item.id === actorId);

  const myOpportunities = state.opportunities
    .filter((opportunity) => state.serviceRequests.find((request) => request.id === opportunity.serviceRequestId)?.actorId === actorId)
    .filter((opportunity) => opportunity.status !== "proposee");
  const toAccept = myOpportunities.filter((item) => item.status === "detectee");
  const toComplete = myOpportunities.filter((item) => item.status === "engagee");
  const done = myOpportunities.filter((item) => item.status === "executee");

  const accept = async (opportunityId: string) => {
    setPending(opportunityId);
    try {
      await run({ type: "accept_opportunity", opportunityId });
    } finally {
      setPending(null);
    }
  };

  const complete = async (opportunityId: string) => {
    setPending(opportunityId);
    try {
      await run({ type: "complete_logistics", opportunityId });
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">{actor?.name ?? "Mon activité"}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{roleTitle[role] ?? "Mes propositions"}</h1>
        </div>
        <Button variant="outline" onClick={() => setFormOpen(true)}><Plus /> Nouvelle demande</Button>
      </div>

      {myOpportunities.length === 0 ? (
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Aucune proposition pour vos demandes actives pour le moment. Vous serez averti lorsqu’un lot compatible sera identifié.</p></CardContent></Card>
      ) : (
        <div className="space-y-2.5">
          {[...toAccept, ...toComplete, ...done].map((opportunity) => {
            const request = state.serviceRequests.find((item) => item.id === opportunity.serviceRequestId);
            const lot = state.lots.find((item) => item.id === opportunity.lotId);
            const species = lot ? state.species.find((item) => item.id === lot.speciesId) : undefined;
            const territory = state.territories.find((item) => item.id === opportunity.territoryId);
            const statusVariant = opportunity.status === "executee" ? "success" : opportunity.status === "engagee" ? "amber" : "marine";
            return (
              <Card key={opportunity.id} className="flex-col gap-3 p-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1d4468] text-white"><Boxes size={18} /></span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant}>{opportunityStatusLabel[opportunity.status as Exclude<Opportunity["status"], "proposee">] ?? opportunity.status}</Badge>
                      <span className="text-xs text-muted-foreground">{territory?.name}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold">{species?.name ?? request?.speciesId} · {(lot?.quantityKg ?? request?.quantityKg ?? 0).toLocaleString("fr-FR")} kg</p>
                    <p className="mt-1 text-xs text-muted-foreground">Niveau de correspondance : {opportunity.score}/100 · {opportunity.reasons.join(", ")}</p>
                  </div>
                </div>
                {opportunity.status === "detectee" && <Button size="sm" disabled={pending === opportunity.id} onClick={() => void accept(opportunity.id)}>{pending === opportunity.id ? "…" : "Accepter"} <ArrowRight size={15} /></Button>}
                {opportunity.status === "engagee" && <Button size="sm" disabled={pending === opportunity.id} onClick={() => void complete(opportunity.id)}><PackageCheck size={15} /> {pending === opportunity.id ? "…" : "Confirmer la logistique"}</Button>}
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nouvelle demande</SheetTitle>
            <SheetDescription>Elle sera rapprochée automatiquement d’un lot compatible dès qu’il sera débarqué.</SheetDescription>
          </SheetHeader>
          <ServiceRequestForm state={state} onDone={() => setFormOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
