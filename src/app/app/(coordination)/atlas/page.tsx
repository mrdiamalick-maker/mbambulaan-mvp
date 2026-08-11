"use client";

// Restylé en D9 (Lot 7, étape 2/4) : PageHeader (sarcelle) abandonné pour
// un en-tête inline, comme les autres pages migrées. Le poste de commande
// sombre de ProfessionalAtlasWorkspace.tsx reste tel quel (voir le
// commentaire de ce fichier) — seul l'habillage de cette page et
// d'AtlasExecutiveSummary change ici.
import { ProfessionalAtlasWorkspace } from "@/components/ecosystem/ProfessionalAtlasWorkspace";
import { AtlasExecutiveSummary } from "@/components/atlas/AtlasExecutiveSummary";
import { useProduct } from "@/components/providers/ProductProvider";

export default function AtlasPage() {
  const { state } = useProduct();
  if (!state) return null;

  return (
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Atlas opérationnel professionnel</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Observer la filière. Comprendre les dynamiques. Agir.</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">L’Atlas opérationnel relie territoires, acteurs, capacités, flux et situations pour transformer l’information en décision.</p>
      </div>
      <AtlasExecutiveSummary state={state} />
      <ProfessionalAtlasWorkspace />
    </div>
  );
}
