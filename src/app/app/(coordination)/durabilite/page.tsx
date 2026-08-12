"use client";

// Restylé en D9 (Lot 7, étape 2/4) : PageHeader (sarcelle) abandonné pour
// un en-tête inline, comme les autres pages migrées.
import { SustainabilityWorkspace } from "@/components/ecosystem/SustainabilityWorkspace";

export default function SustainabilityPage() {
  return (
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Provenance · pratiques · traçabilité</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Provenance &amp; durabilité</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Rendez visibles la provenance, les données manquantes et les pratiques déclarées. Mbàmbulaan soutient l’amélioration sans se substituer au contrôle réglementaire.</p>
      </div>
      <SustainabilityWorkspace />
    </div>
  );
}
