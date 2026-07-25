import { OperatorInterventionDetail } from "@/components/coordination-demo/OperatorViews";

export default async function OperatorInterventionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OperatorInterventionDetail id={id} />;
}
