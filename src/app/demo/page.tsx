import { DemoJourney } from "@/components/demo/DemoJourney";
import { getDemoJourney } from "@/lib/demo";

export default function DemoPage() {
  const journey = getDemoJourney();

  return <DemoJourney journey={journey} />;
}
