import { ProfessionalAtlasWorkspace } from "@/components/ecosystem/ProfessionalAtlasWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AtlasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Jumeau territorial professionnel"
        title="Observer le littoral. Ouvrir le bon dossier. Agir."
        description="Le quai est le pivot de la lecture opérationnelle. La carte localise ; le poste de travail relie ensuite activité, capacités, marchés, preuves et prochaine décision."
      />
      <div className="p-5 lg:p-8"><ProfessionalAtlasWorkspace /></div>
    </>
  );
}
