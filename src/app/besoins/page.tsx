import { BesoinsClient } from "@/components/besoins/BesoinsClient";
import { SliceDecisionStrip } from "@/components/slice/SliceDecisionStrip";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeAlerts, computeMatching } from "@/lib/coordination";
import { computeCoordinationEngine } from "@/lib/mvpSlice";

export default function BesoinsPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const slice = computeCoordinationEngine();

  return (
    <>
      <SliceDecisionStrip active="qualification" slice={slice} />
      <BesoinsClient alertes={computeAlerts(arrivages, besoins, computeMatching(arrivages, besoins))} arrivages={arrivages} besoins={besoins} />
    </>
  );
}
