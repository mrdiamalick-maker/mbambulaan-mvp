import { TerritoryPilotScenario } from "@/components/territory/TerritoryPilotScenario";
import { computeTerritoryPilot } from "@/lib/territoryPilot";

export default function TerritoryPilotPage() {
  return <TerritoryPilotScenario pilot={computeTerritoryPilot()} />;
}
