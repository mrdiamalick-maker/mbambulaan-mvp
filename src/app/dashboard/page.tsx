import { DashboardView } from "@/components/dashboard/DashboardView";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching } from "@/lib/coordination";

export default function DashboardPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);

  return <DashboardView data={computeDashboardMetrics(arrivages, besoins, opportunites)} />;
}
