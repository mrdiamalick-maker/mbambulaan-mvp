import { DemoDaySimulationSection } from "@/components/daySimulation/DaySimulationPanels";
import { DemoJourney } from "@/components/demo/DemoJourney";
import { DemoExecutiveDecisionCard } from "@/components/executive/ExecutivePanels";
import { DemoQualityCard } from "@/components/quality/QualityPanels";
import { DemoRoleRecommendationCard } from "@/components/roleRecommendations/RoleRecommendationPanels";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeMatching } from "@/lib/coordination";
import { computeDaySimulation, createDaySimulationNotifications } from "@/lib/daySimulation";
import { getDemoJourney } from "@/lib/demo";
import { computeExecutiveSummary } from "@/lib/executive";
import { computeRoleRecommendations } from "@/lib/roleRecommendations";

export default function DemoPage() {
  const journey = getDemoJourney();
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const daySimulation = computeDaySimulation(arrivages, besoins, opportunites);
  const simulationNotifications = createDaySimulationNotifications(daySimulation.events);
  const roleRecommendations = computeRoleRecommendations({ arrivages, besoins, opportunites, transactions: daySimulation.transactions, notifications: simulationNotifications });
  const executive = computeExecutiveSummary({ arrivages, besoins, opportunites, transactions: daySimulation.transactions, notifications: simulationNotifications });

  return (
    <>
      <DemoJourney arrivages={arrivages} besoins={besoins} journey={journey} />
      <DemoDaySimulationSection events={daySimulation.events} />
      <DemoRoleRecommendationCard recommendations={roleRecommendations} />
      <DemoExecutiveDecisionCard executive={executive} />
      <DemoQualityCard arrivages={arrivages} besoins={besoins} />
    </>
  );
}
