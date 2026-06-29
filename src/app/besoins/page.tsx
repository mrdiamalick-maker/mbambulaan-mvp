import { PremiumBesoinsPage } from "@/components/premium/PremiumExperience";
import { getBesoins } from "@/lib/besoins";
import { computeCoordinationEngine } from "@/lib/mvpSlice";

export default function BesoinsPage() {
  return <PremiumBesoinsPage besoins={getBesoins()} slice={computeCoordinationEngine()} />;
}
