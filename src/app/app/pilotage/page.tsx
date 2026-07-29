import { PilotageWorkspace } from "@/components/ecosystem/PilotageWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SteeringPage() {
  return (
    <>
      <PageHeader eyebrow="Situation · résultats · décision" title="Pilotage de la filière" description="Les indicateurs sont reliés à une période, une source, une limite et une action. Les estimations restent explicitement distinctes des observations." />
      <div className="p-5 lg:p-8"><PilotageWorkspace /></div>
    </>
  );
}
