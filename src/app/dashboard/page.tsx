import { DashboardView } from "@/components/dashboard/DashboardView";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { createDashboardData } from "@/lib/dashboard";
import { createOpportunites } from "@/lib/matching";

export default function DashboardPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = createOpportunites(arrivages, besoins);

  return <DashboardView data={createDashboardData(arrivages, besoins, opportunites)} />;
}
