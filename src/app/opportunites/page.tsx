import { OpportunitesView } from "@/components/opportunites/OpportunitesView";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { createMatchingSummary, createOpportunites } from "@/lib/matching";

export default function OpportunitesPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = createOpportunites(arrivages, besoins);
  const summary = createMatchingSummary(arrivages, besoins, opportunites);

  return <OpportunitesView opportunites={opportunites} summary={summary} />;
}
