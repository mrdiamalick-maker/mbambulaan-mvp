import { CoordinationWorkspace } from "@/components/ecosystem/CoordinationWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CoordinationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Besoins · capacités · engagements · résultats"
        title="Coordination de la chaîne de valeur"
        description="Les besoins qualifiés rencontrent des capacités vérifiables. Chaque rapprochement reste explicable, chaque engagement est humain et chaque mission se termine par un résultat observable."
      />
      <div className="p-5 lg:p-8"><CoordinationWorkspace /></div>
    </>
  );
}