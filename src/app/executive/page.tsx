import { ExecutiveView } from "@/components/executive/ExecutivePanels";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching } from "@/lib/coordination";
import { computeDaySimulation, createDaySimulationNotifications } from "@/lib/daySimulation";
import { computeExecutiveSummary } from "@/lib/executive";
import { createNotifications } from "@/lib/notifications";

export default function ExecutivePage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const dashboardData = computeDashboardMetrics(arrivages, besoins, opportunites);
  const daySimulation = computeDaySimulation(arrivages, besoins, opportunites);
  const notifications = [...createNotifications(arrivages, besoins, opportunites, dashboardData), ...createDaySimulationNotifications(daySimulation.events)];
  const executive = computeExecutiveSummary({ arrivages, besoins, opportunites, transactions: daySimulation.transactions, notifications });
  return <ExecutiveView executive={executive} />;
}
