import { notFound } from "next/navigation";
import { OpportuniteDetail } from "@/components/opportunites/OpportuniteDetail";
import { OpportunityQualitySection } from "@/components/quality/QualityPanels";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeMatching, findOpportuniteById } from "@/lib/coordination";

type OpportuniteDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OpportuniteDetailPage({ params }: OpportuniteDetailPageProps) {
  const { id } = await params;
  const opportunite = findOpportuniteById(computeMatching(getArrivages(), getBesoins()), id);

  if (!opportunite) {
    notFound();
  }

  return (
    <>
      <OpportuniteDetail opportunite={opportunite} />
      <OpportunityQualitySection opportunite={opportunite} />
    </>
  );
}
