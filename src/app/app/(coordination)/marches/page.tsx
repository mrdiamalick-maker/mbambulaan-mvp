"use client";

// Restylé en D9 (Lot 7, étape 2/4) : PageHeader (sarcelle) abandonné pour
// un en-tête inline, comme les autres pages migrées.
import { MarketWorkspace } from "@/components/ecosystem/MarketWorkspace";

export default function MarketsPage() {
  return (
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Prix · disponibilité · rareté</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Prix et marchés</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Comparez les observations sans masquer leur source. Une variation devient un signal à vérifier, jamais une vérité automatique.</p>
      </div>
      <MarketWorkspace />
    </div>
  );
}
