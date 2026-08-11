"use client";

// Restylé en D9 (Lot 7, étape 2/4) : PageHeader (sarcelle) abandonné pour
// un en-tête inline, comme les autres pages migrées.
import { OperationsWorkspace } from "@/components/ecosystem/OperationsWorkspace";

export default function OperationsPage() {
  return (
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Pirogues · sorties · débarquements · lots</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Opérations de pêche</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Suivez le retour annoncé, l’arrivée, le débarquement, la pesée et la constitution des lots dans une même chaîne traçable.</p>
      </div>
      <OperationsWorkspace />
    </div>
  );
}
