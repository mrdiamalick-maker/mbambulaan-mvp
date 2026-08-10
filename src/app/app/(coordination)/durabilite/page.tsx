import { SustainabilityWorkspace } from "@/components/ecosystem/SustainabilityWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SustainabilityPage() {
  return (
    <>
      <PageHeader eyebrow="Provenance · pratiques · traçabilité" title="Durabilité" description="Rendez visibles la provenance, les données manquantes et les pratiques déclarées. Mbàmbulaan soutient l’amélioration sans se substituer au contrôle réglementaire." />
      <div className="p-5 lg:p-8"><SustainabilityWorkspace /></div>
    </>
  );
}
