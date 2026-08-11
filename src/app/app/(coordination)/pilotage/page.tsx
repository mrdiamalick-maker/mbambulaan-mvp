"use client";

// Restylé en D9 (Lot 7, étape 2/4) : PageHeader (sarcelle) abandonné pour
// un en-tête inline, comme les autres pages migrées.
import { PilotageWorkspace } from "@/components/ecosystem/PilotageWorkspace";
import { InstitutionDecisionPanel } from "@/components/institution/InstitutionDecisionPanel";
import { NationalControlCenter } from "@/components/national/NationalControlCenter";
import { useProduct } from "@/components/providers/ProductProvider";

export default function SteeringPage() {
  const { state, role } = useProduct();
  const nationalReading = role === "institution" || role === "administrateur";

  return (
    <div className="shadcn-scope space-y-8 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Situation · programmes · résultats · décision</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Pilotage de la filière</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">La lecture nationale, les arbitrages, les indicateurs et les rapports utilisent les mêmes territoires, sources et limites que les opérations.</p>
      </div>
      {state && nationalReading ? <NationalControlCenter state={state} /> : null}
      {state && (nationalReading || role === "partenaire") ? <InstitutionDecisionPanel state={state} /> : null}
      <PilotageWorkspace />
    </div>
  );
}
