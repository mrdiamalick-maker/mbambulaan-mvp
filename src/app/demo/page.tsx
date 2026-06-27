import { DemoJourney } from "@/components/demo/DemoJourney";
import { DemoQualityCard } from "@/components/quality/QualityPanels";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { getDemoJourney } from "@/lib/demo";

export default function DemoPage() {
  const journey = getDemoJourney();
  const arrivages = getArrivages();
  const besoins = getBesoins();

  return (
    <>
      <DemoJourney arrivages={arrivages} besoins={besoins} journey={journey} />
      <DemoQualityCard arrivages={arrivages} besoins={besoins} />
    </>
  );
}
