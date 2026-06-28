import { OpportunitesView } from "@/components/opportunites/OpportunitesView";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeMatching, computeMatchingSummary } from "@/lib/coordination";

export default function OpportunitesPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const summary = computeMatchingSummary(arrivages, besoins, opportunites);

  return <OpportunitesView arrivages={arrivages} besoins={besoins} opportunites={opportunites} summary={summary} />;
}
