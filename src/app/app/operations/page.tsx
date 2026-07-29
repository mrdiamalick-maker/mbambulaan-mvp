import { OperationsWorkspace } from "@/components/ecosystem/OperationsWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";

export default function OperationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pirogues · sorties · débarquements · lots"
        title="Opérations de pêche"
        description="Suivez le retour annoncé, l’arrivée, le débarquement, la pesée et la constitution des lots dans une même chaîne traçable."
      />
      <div className="p-5 lg:p-8"><OperationsWorkspace /></div>
    </>
  );
}
