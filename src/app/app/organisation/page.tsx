import { OrganizationWorkspace } from "@/components/ecosystem/OrganizationWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";

export default function OrganizationPage() {
  return (
    <>
      <PageHeader eyebrow="Membres · droits · services" title="Organisation" description="Votre organisation, votre mandat et votre plan déterminent les capacités visibles. Le domaine métier reste commun à tout l’écosystème." />
      <div className="p-5 lg:p-8"><OrganizationWorkspace /></div>
    </>
  );
}
