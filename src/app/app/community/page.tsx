import { CommunityWorkspace } from "@/components/ecosystem/CommunityWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CommunityPage() {
  return (
    <>
      <PageHeader eyebrow="Communautés · programmes · impact" title="Intelligence collective" description="Faire remonter les réalités du terrain, capitaliser les savoirs et structurer les besoins récurrents en programmes crédibles." />
      <div className="p-5 lg:p-8"><CommunityWorkspace /></div>
    </>
  );
}
