import { MvpSliceDemo } from "@/components/slice/MvpSliceDemo";
import { computeCoordinationEngine } from "@/lib/mvpSlice";

export default function DemoPage() {
  const slice = computeCoordinationEngine();

  return <MvpSliceDemo slice={slice} />;
}
