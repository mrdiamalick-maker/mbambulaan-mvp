"use client";

import { ProfessionalAtlasWorkspace } from "@/components/ecosystem/ProfessionalAtlasWorkspace";
import { AtlasExecutiveSummary } from "@/components/atlas/AtlasExecutiveSummary";
import { PageHeader } from "@/components/ui/PageHeader";
import { useProduct } from "@/components/providers/ProductProvider";


export default function AtlasPage() {

  const { state } = useProduct();


  if (!state) return null;


  return (

    <>

      <PageHeader
        eyebrow="Atlas opérationnel professionnel"
        title="Observer la filière. Comprendre les dynamiques. Agir."
        description="L’Atlas opérationnel relie territoires, acteurs, capacités, flux et situations pour transformer l’information en décision."
      />


      <div className="space-y-6 p-5 lg:p-8">


        <AtlasExecutiveSummary
          state={state}
        />


        <ProfessionalAtlasWorkspace />


      </div>

    </>

  );

}
