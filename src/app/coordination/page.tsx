import { CoordinationTimelinePanel } from "@/components/daySimulation/DaySimulationPanels";
import { CoordinationCenter } from "@/components/coordination/CoordinationCenter";
import { CoordinationQualityPanel } from "@/components/quality/QualityPanels";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching } from "@/lib/coordination";
import { computeDaySimulation } from "@/lib/daySimulation";
import { createNotifications } from "@/lib/notifications";

export default function CoordinationPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const dashboardData = computeDashboardMetrics(arrivages, besoins, opportunites);
  const notifications = createNotifications(arrivages, besoins, opportunites, dashboardData);
  const daySimulation = computeDaySimulation(arrivages, besoins, opportunites);

  return (
    <>
      <CoordinationCenter arrivages={arrivages} besoins={besoins} opportunites={opportunites} notifications={notifications} />
      <CoordinationTimelinePanel events={daySimulation.events} />
      <CoordinationQualityPanel arrivages={arrivages} besoins={besoins} opportunites={opportunites} />
    </>
  );
}
