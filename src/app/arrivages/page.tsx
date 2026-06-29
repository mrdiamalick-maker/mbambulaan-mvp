import { PremiumArrivagesPage } from "@/components/premium/PremiumExperience";
import { getArrivages } from "@/lib/arrivages";
import { computeCoordinationEngine } from "@/lib/mvpSlice";

export default function ArrivagesPage() {
  return <PremiumArrivagesPage arrivages={getArrivages()} slice={computeCoordinationEngine()} />;
}
