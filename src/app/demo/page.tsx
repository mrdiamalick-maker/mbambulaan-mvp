import { DemoDaySimulationSection } from "@/components/daySimulation/DaySimulationPanels";
import { DemoJourney } from "@/components/demo/DemoJourney";
import { DemoQualityCard } from "@/components/quality/QualityPanels";
import { DemoRoleRecommendationCard } from "@/components/roleRecommendations/RoleRecommendationPanels";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeMatching } from "@/lib/coordination";
import { computeDaySimulation } from "@/lib/daySimulation";
import { getDemoJourney } from "@/lib/demo";
import { computeRoleRecommendations } from "@/lib/roleRecommendations";

export default function DemoPage() {
  const journey = getDemoJourney();
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const daySimulation = computeDaySimulation(arrivages, besoins, opportunites);
  const roleRecommendations = computeRoleRecommendations({ arrivages, besoins, opportunites, transactions: daySimulation.transactions });

  return (
    <>
      <DemoJourney arrivages={arrivages} besoins={besoins} journey={journey} />
      <DemoDaySimulationSection events={daySimulation.events} />
      <DemoRoleRecommendationCard recommendations={roleRecommendations} />
      <DemoQualityCard arrivages={arrivages} besoins={besoins} />
    </>
  );
}
