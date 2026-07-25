import { TerrainSituationDetail } from "@/components/coordination-demo/TerrainViews";

export default async function TerrainSituationPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ creation?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return <TerrainSituationDetail id={id} created={query.creation === "ok"} />;
}
