"use client";

// Expérience dédiée opérateur (Lot 7, étape 1/4) — jusqu'ici l'opérateur
// retombait sur CoordinatorHub (situation-first, pensé pour un
// coordinateur territorial) depuis le retrait d'UnifiedWorkView au Lot 6.
// D9 (PRODUCT_DECISION_LOG.md) nomme l'opérateur comme légitime dans
// AppShell — ce n'est donc pas une nouvelle coquille, mais un contenu
// task-first dédié : la file des sorties qui attendent une action de
// quai, dans l'ordre où elles se présentent (retour → arrivée →
// débarquement → pesée → lots), branchée sur le vrai state produit.
import { useState } from "react";
import { Anchor, ArrowRight, Radio, Scale, ShipWheel } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CoordinatorSignalForm } from "@/components/work/CoordinatorSignalForm";
import type { FishingTrip, Landing, ProductState } from "@/domain/types";

const tripActionLabel: Record<string, string> = {
  retour_annonce: "Confirmer l’arrivée au quai",
  arrivee_confirmee: "Enregistrer le débarquement"
};

function landingActionLabel(status: Landing["status"]) {
  if (status === "arrive") return "Confirmer la pesée";
  if (status === "pese") return "Créer les lots";
  return null;
}

export function OperatorTaskView({ state, actorId }: { state: ProductState; actorId: string }) {
  const { run } = useProduct();
  const [signalOpen, setSignalOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const actor = state.actors.find((item) => item.id === actorId);
  const territoryIds = new Set(actor?.territoryIds ?? []);
  const inScope = (territoryId: string) => territoryIds.size === 0 || territoryIds.has(territoryId);

  const siteOf = (siteId: string) => state.sites.find((item) => item.id === siteId);
  const vesselOf = (trip: FishingTrip) => state.vessels.find((item) => item.id === trip.vesselId);

  const actionableTrips = state.trips.filter((trip) => {
    if (!tripActionLabel[trip.status]) return false;
    const vessel = vesselOf(trip);
    const site = vessel ? siteOf(vessel.homeSiteId) : undefined;
    return site ? inScope(site.territoryId) : true;
  });

  const actionableLandings = state.landings.filter((landing) => {
    if (!landingActionLabel(landing.status)) return false;
    const site = siteOf(landing.siteId);
    return site ? inScope(site.territoryId) : true;
  });

  const runTripAction = async (trip: FishingTrip) => {
    setPending(trip.id);
    try {
      if (trip.status === "retour_annonce") await run({ type: "confirm_arrival", tripId: trip.id });
      else if (trip.status === "arrivee_confirmee") await run({ type: "record_landing", tripId: trip.id });
    } finally {
      setPending(null);
    }
  };

  const runLandingAction = async (landing: Landing) => {
    setPending(landing.id);
    try {
      if (landing.status === "arrive") await run({ type: "confirm_weighing", landingId: landing.id });
      else if (landing.status === "pese") await run({ type: "create_lots", landingId: landing.id });
    } finally {
      setPending(null);
    }
  };

  const totalActions = actionableTrips.length + actionableLandings.length;

  return (
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Quai · {actor?.name ?? "Opérateur"}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Ce qui attend une action de quai.</h1>
        </div>
        <Button variant="outline" onClick={() => setSignalOpen(true)}><Radio /> Signaler une situation</Button>
      </div>

      {totalActions === 0 ? (
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Aucune sortie ni débarquement n’attend d’action pour le moment.</p></CardContent></Card>
      ) : (
        <div className="space-y-2.5">
          {actionableTrips.map((trip) => {
            const vessel = vesselOf(trip);
            const site = vessel ? siteOf(vessel.homeSiteId) : undefined;
            return (
              <Card key={trip.id} className="flex-col gap-3 p-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1d4468] text-white"><ShipWheel size={18} /></span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><Badge variant="marine">{trip.status.replaceAll("_", " ")}</Badge><span className="text-xs text-muted-foreground">{site?.name ?? "Quai"}</span></div>
                    <p className="mt-1.5 text-sm font-semibold">{vessel?.name ?? trip.id} · {trip.zone}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{tripActionLabel[trip.status]}</p>
                  </div>
                </div>
                <Button size="sm" disabled={pending === trip.id} onClick={() => void runTripAction(trip)}>{pending === trip.id ? "…" : tripActionLabel[trip.status]} <ArrowRight size={15} /></Button>
              </Card>
            );
          })}
          {actionableLandings.map((landing) => {
            const site = siteOf(landing.siteId);
            const label = landingActionLabel(landing.status);
            return (
              <Card key={landing.id} className="flex-col gap-3 p-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#c68a2c] text-white">{landing.status === "arrive" ? <Scale size={18} /> : <Anchor size={18} />}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><Badge variant="amber">{landing.status.replaceAll("_", " ")}</Badge><span className="text-xs text-muted-foreground">{site?.name ?? "Quai"}</span></div>
                    <p className="mt-1.5 text-sm font-semibold">{landing.totalWeightKg.toLocaleString("fr-FR")} kg déclarés</p>
                    <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
                {label && <Button size="sm" disabled={pending === landing.id} onClick={() => void runLandingAction(landing)}>{pending === landing.id ? "…" : label} <ArrowRight size={15} /></Button>}
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={signalOpen} onOpenChange={setSignalOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Signaler une situation</SheetTitle>
            <SheetDescription>Le signal reste déclaratif jusqu’à sa qualification.</SheetDescription>
          </SheetHeader>
          <CoordinatorSignalForm territories={state.territories} onDone={() => setSignalOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
