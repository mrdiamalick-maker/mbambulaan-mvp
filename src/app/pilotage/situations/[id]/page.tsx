import { DecisionSituationDetail } from "@/components/coordination-demo/DecisionViews";

export default async function DecisionSituationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DecisionSituationDetail id={id} />;
}
