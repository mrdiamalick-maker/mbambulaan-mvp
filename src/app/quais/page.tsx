import { QuaisMapView } from "@/components/quais/QuaisMapView";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching } from "@/lib/coordination";
import { createQuaiMapPoints } from "@/lib/map";

export default function QuaisPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const dashboardData = computeDashboardMetrics(arrivages, besoins, opportunites);
  const points = createQuaiMapPoints(arrivages, besoins, opportunites, dashboardData);

  return <QuaisMapView points={points} />;
}
