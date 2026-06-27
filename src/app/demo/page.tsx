import { DemoDaySimulationSection } from "@/components/daySimulation/DaySimulationPanels";
import { DemoJourney } from "@/components/demo/DemoJourney";
import { DemoQualityCard } from "@/components/quality/QualityPanels";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDaySimulation } from "@/lib/daySimulation";
import { getDemoJourney } from "@/lib/demo";

export default function DemoPage() {
  const journey = getDemoJourney();
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const daySimulation = computeDaySimulation(arrivages, besoins);

  return (
    <>
      <DemoJourney arrivages={arrivages} besoins={besoins} journey={journey} />
      <DemoDaySimulationSection events={daySimulation.events} />
      <DemoQualityCard arrivages={arrivages} besoins={besoins} />
    </>
  );
}
