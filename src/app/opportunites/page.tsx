import { PremiumOpportunitesPage } from "@/components/premium/PremiumExperience";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeMatching, computeMatchingSummary } from "@/lib/coordination";

export default function OpportunitesPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);

  return <PremiumOpportunitesPage opportunites={opportunites} summary={computeMatchingSummary(arrivages, besoins, opportunites)} />;
}
