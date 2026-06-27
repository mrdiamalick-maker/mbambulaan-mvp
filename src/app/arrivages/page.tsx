import { ArrivagesClient } from "@/components/arrivages/ArrivagesClient";
import { ArrivagesQualitySection } from "@/components/quality/QualityPanels";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeAlerts, computeMatching } from "@/lib/coordination";

export default function ArrivagesPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);

  return (
    <>
      <ArrivagesClient alertes={computeAlerts(arrivages, besoins, opportunites)} arrivages={arrivages} besoins={besoins} opportunites={opportunites} />
      <ArrivagesQualitySection arrivages={arrivages} besoins={besoins} opportunites={opportunites} />
    </>
  );
}
