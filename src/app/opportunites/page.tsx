import { OpportunitesView } from "@/components/opportunites/OpportunitesView";
import { SliceDecisionStrip } from "@/components/slice/SliceDecisionStrip";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeMatching, computeMatchingSummary } from "@/lib/coordination";
import { computeCoordinationEngine } from "@/lib/mvpSlice";

export default function OpportunitesPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const summary = computeMatchingSummary(arrivages, besoins, opportunites);
  const slice = computeCoordinationEngine();

  return (
    <>
      <SliceDecisionStrip active="opportunity" slice={slice} />
      <OpportunitesView arrivages={arrivages} besoins={besoins} opportunites={opportunites} summary={summary} />
    </>
  );
}
