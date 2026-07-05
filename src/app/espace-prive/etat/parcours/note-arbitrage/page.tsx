import { EtatParcoursWorkbench } from "@/components/private-space/EtatParcoursWorkbench";
import type { MinistryRegionName } from "@/data/ministryRegionalSpace";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function NoteArbitrageJourneyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const region = Array.isArray(params?.region) ? params?.region[0] : params?.region;
  const quai = Array.isArray(params?.quai) ? params?.quai[0] : params?.quai;
  return <EtatParcoursWorkbench kind="note-arbitrage" initialRegion={(region ?? "Tout") as MinistryRegionName} initialQuayId={quai ?? "th-joal"} />;
}
