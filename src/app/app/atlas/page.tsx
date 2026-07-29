import { AtlasWorkspace } from "@/components/ecosystem/AtlasWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AtlasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Atlas professionnel"
        title="Connaître avant de coordonner"
        description="Explorez territoires, quais, capacités, espèces, prix, rareté et durabilité. Chaque lecture précise sa source et son niveau de fiabilité."
      />
      <div className="p-5 lg:p-8"><AtlasWorkspace /></div>
    </>
  );
}
