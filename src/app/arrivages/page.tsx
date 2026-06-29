import { ArrivagesClient } from "@/components/arrivages/ArrivagesClient";
import { ArrivagesQualitySection } from "@/components/quality/QualityPanels";
import { SliceDecisionStrip } from "@/components/slice/SliceDecisionStrip";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeAlerts, computeMatching } from "@/lib/coordination";
import { computeCoordinationEngine } from "@/lib/mvpSlice";

export default function ArrivagesPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const slice = computeCoordinationEngine();

  return (
    <>
      <SliceDecisionStrip active="signal" slice={slice} />
      <ArrivagesClient alertes={computeAlerts(arrivages, besoins, opportunites)} arrivages={arrivages} besoins={besoins} opportunites={opportunites} />
      <ArrivagesQualitySection arrivages={arrivages} besoins={besoins} opportunites={opportunites} />
    </>
  );
}
