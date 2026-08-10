"use client";

import { PilotageWorkspace } from "@/components/ecosystem/PilotageWorkspace";
import { InstitutionDecisionPanel } from "@/components/institution/InstitutionDecisionPanel";
import { NationalControlCenter } from "@/components/national/NationalControlCenter";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SteeringPage() {
  const { state, role } = useProduct();
  const nationalReading = role === "institution" || role === "administrateur";

  return (
    <>
      <PageHeader
        eyebrow="Situation · programmes · résultats · décision"
        title="Pilotage de la filière"
        description="La lecture nationale, les arbitrages, les indicateurs et les rapports utilisent les mêmes territoires, sources et limites que les opérations."
      />
      <div className="space-y-8 p-5 lg:p-8">
        {state && nationalReading ? <NationalControlCenter state={state} /> : null}
        {state && (nationalReading || role === "partenaire") ? <InstitutionDecisionPanel state={state} /> : null}
        <PilotageWorkspace />
      </div>
    </>
  );
}
