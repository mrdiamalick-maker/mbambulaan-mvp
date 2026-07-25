import { CoordinatorSituationDetail } from "@/components/coordination-demo/CoordinatorViews";

export default async function CoordinatorSituationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CoordinatorSituationDetail id={id} />;
}
