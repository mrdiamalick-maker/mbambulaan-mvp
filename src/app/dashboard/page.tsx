import { DashboardDayEventsSection } from "@/components/daySimulation/DaySimulationPanels";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { DashboardSensitiveLotsSection } from "@/components/quality/QualityPanels";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching } from "@/lib/coordination";
import { computeDaySimulation } from "@/lib/daySimulation";
import { createNotifications } from "@/lib/notifications";

export default function DashboardPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const dashboardData = computeDashboardMetrics(arrivages, besoins, opportunites);
  const notifications = createNotifications(arrivages, besoins, opportunites, dashboardData);
  const daySimulation = computeDaySimulation(arrivages, besoins, opportunites);

  return (
    <>
      <DashboardView arrivages={arrivages} besoins={besoins} data={dashboardData} notifications={notifications.slice(0, 4)} opportunites={opportunites} />
      <DashboardDayEventsSection events={daySimulation.events} />
      <DashboardSensitiveLotsSection arrivages={arrivages} besoins={besoins} opportunites={opportunites} />
    </>
  );
}
