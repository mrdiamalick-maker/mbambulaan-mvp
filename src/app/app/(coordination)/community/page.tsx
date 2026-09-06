"use client";

// Restylé en D9 (Lot 7, étape 2/4) : PageHeader (sarcelle) abandonné pour
// un en-tête inline, comme les autres pages migrées.
import { CommunityWorkspace } from "@/components/ecosystem/CommunityWorkspace";

export default function CommunityPage() {
  return (
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Communautés · programmes · impact</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Intelligence collective</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Faire remonter les réalités du terrain, capitaliser les savoirs et structurer les besoins récurrents en programmes crédibles.</p>
      </div>
      <CommunityWorkspace />
    </div>
  );
}
