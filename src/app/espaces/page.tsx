import { EspacesHub } from "@/components/espaces/EspacesHub";
import { getEspaces, getProfileMetrics } from "@/lib/espaces";

export default function EspacesPage() {
  return <EspacesHub espaces={getEspaces()} metrics={getProfileMetrics()} />;
}
