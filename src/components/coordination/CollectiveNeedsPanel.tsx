"use client";

// Besoins collectifs → programme — Lot 5, étape 4/4. Jusqu'ici les
// ServiceRequest ouvertes de même intention (ex. plusieurs organisations
// demandant une formation) n'étaient consommées que par le moteur de
// rapprochement Lot ↔ ServiceRequest (§5.11, réservé aux intentions
// d'approvisionnement) ou listées une à une dans CoordinationWorkspace —
// rien ne les faisait converger en programme. Ce panneau regroupe les
// demandes ouvertes par intention (seuil ≥ 2 demandes distinctes,
// approuvé) et permet de les promouvoir en Initiative réelle.
import { useMemo, useState } from "react";
import { Layers, UsersRound } from "lucide-react";
import type { ProductState, ServiceRequest, ServiceRequestIntent } from "@/domain/types";
import { serviceRequestIntentLabels } from "@/domain/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { InitiativeForm } from "@/components/coordination/InitiativeForm";

const GROUP_THRESHOLD = 2;

export function CollectiveNeedsPanel({ state }: { state: ProductState }) {
  const [activeIntent, setActiveIntent] = useState<ServiceRequestIntent | null>(null);

  const groups = useMemo(() => {
    const byIntent = new Map<ServiceRequestIntent, ServiceRequest[]>();
    for (const request of state.serviceRequests) {
      if (request.status !== "ouvert") continue;
      const bucket = byIntent.get(request.intent);
      if (bucket) bucket.push(request);
      else byIntent.set(request.intent, [request]);
    }
    return Array.from(byIntent.entries())
      .filter(([, requests]) => requests.length >= GROUP_THRESHOLD)
      .sort((a, b) => b[1].length - a[1].length);
  }, [state.serviceRequests]);

  const activeRequests = activeIntent ? groups.find(([intent]) => intent === activeIntent)?.[1] ?? [] : [];

  if (groups.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#b6522f]/25 bg-[#b6522f]/5 p-5 md:p-6">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#b6522f]">
        <Layers size={14} /> Besoins collectifs
      </div>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Plusieurs organisations expriment le même besoin — regroupez-les en programme structuré plutôt que de les traiter une à une.</p>
      <div className="mt-5 divide-y border-y border-[#b6522f]/15">
        {groups.map(([intent, requests]) => {
          const territories = new Set(requests.map((request) => request.territoryId));
          const organizations = new Set(requests.map((request) => request.actorId));
          return (
            <div key={intent} className="grid gap-4 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="marine">{serviceRequestIntentLabels[intent]}</Badge>
                  <span className="text-xs font-bold text-muted-foreground">{requests.length} demandes</span>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UsersRound size={13} /> {organizations.size} organisation{organizations.size > 1 ? "s" : ""} · {territories.size} territoire{territories.size > 1 ? "s" : ""}
                </p>
              </div>
              <Button size="sm" onClick={() => setActiveIntent(intent)}>Regrouper en programme</Button>
            </div>
          );
        })}
      </div>

      <Sheet open={activeIntent !== null} onOpenChange={(open) => !open && setActiveIntent(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Créer un programme{activeIntent ? ` · ${serviceRequestIntentLabels[activeIntent]}` : ""}</SheetTitle>
            <SheetDescription>Les demandes regroupées sont rattachées au programme et marquées « couvertes ».</SheetDescription>
          </SheetHeader>
          {activeIntent && (
            <InitiativeForm requests={activeRequests} state={state} onDone={() => setActiveIntent(null)} />
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}
