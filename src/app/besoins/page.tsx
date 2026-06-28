import { BesoinsClient } from "@/components/besoins/BesoinsClient";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeAlerts, computeMatching } from "@/lib/coordination";

export default function BesoinsPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();

  return <BesoinsClient alertes={computeAlerts(arrivages, besoins, computeMatching(arrivages, besoins))} arrivages={arrivages} besoins={besoins} />;
}
