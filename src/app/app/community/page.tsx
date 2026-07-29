import { CommunityWorkspace } from "@/components/ecosystem/CommunityWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CommunityPage() {
  return (
    <>
      <PageHeader eyebrow="Intelligence collective" title="Community" description="Partagez besoins, capacités, alertes et apprentissages. Un contenu utile peut être transformé en situation puis suivi dans la coordination." />
      <div className="p-5 lg:p-8"><CommunityWorkspace /></div>
    </>
  );
}
