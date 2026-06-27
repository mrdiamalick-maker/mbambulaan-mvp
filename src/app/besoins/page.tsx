import { BesoinsClient } from "@/components/besoins/BesoinsClient";
import { getBesoins } from "@/lib/besoins";

export default function BesoinsPage() {
  return <BesoinsClient besoins={getBesoins()} />;
}
