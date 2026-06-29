import { PremiumExecutivePage } from "@/components/premium/PremiumExperience";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching } from "@/lib/coordination";
import { computeCoordinationEngine } from "@/lib/mvpSlice";

export default function ExecutivePage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);

  return <PremiumExecutivePage slice={computeCoordinationEngine()} dashboardData={computeDashboardMetrics(arrivages, besoins, opportunites)} />;
}
