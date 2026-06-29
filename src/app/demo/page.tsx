import { PremiumDemoPage } from "@/components/premium/PremiumExperience";
import { computeCoordinationEngine } from "@/lib/mvpSlice";

export default function DemoPage() {
  return <PremiumDemoPage slice={computeCoordinationEngine()} />;
}
