import { PremiumTerritoryPage } from "@/components/premium/PremiumExperience";
import { computeTerritoryPilot } from "@/lib/territoryPilot";

export default function TerritoryPilotPage() {
  return <PremiumTerritoryPage pilot={computeTerritoryPilot()} />;
}
