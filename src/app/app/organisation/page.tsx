import { OrganizationWorkspace } from "@/components/ecosystem/OrganizationWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";

export default function OrganizationPage() {
  return (
    <>
      <PageHeader eyebrow="Réseau · habilitations · capacités" title="Organisation & capacités" description="Identifiez les membres actifs, les responsabilités, les services mobilisables et les droits d’accès qui rendent la coordination possible." />
      <div className="p-5 lg:p-8"><OrganizationWorkspace /></div>
    </>
  );
}