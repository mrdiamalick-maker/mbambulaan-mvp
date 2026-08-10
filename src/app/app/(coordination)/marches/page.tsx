import { MarketWorkspace } from "@/components/ecosystem/MarketWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";

export default function MarketsPage() {
  return (
    <>
      <PageHeader eyebrow="Prix · disponibilité · rareté" title="Prix et marchés" description="Comparez les observations sans masquer leur source. Une variation devient un signal à vérifier, jamais une vérité automatique." />
      <div className="p-5 lg:p-8"><MarketWorkspace /></div>
    </>
  );
}
